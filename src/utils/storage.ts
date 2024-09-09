import { encryptSecretKey, decryptSecretKey } from './encrypt';

interface UserProfile {
  id: number;
  nsec: string;
  npub: string;
  pubkey: string;
  name: string;
  picture?: string;
  lud16?: string;
}

interface LoginState {
  isLoggedIn: boolean;
  loggedInUserId: number | null;
}

interface PersistentLoginState {
  isLoggedIn: boolean;
  userId: number;
  pubkey: string;
  password?: string;
}

const isExtensionEnvironment = typeof chrome !== 'undefined' && chrome.storage;

const tempNsecCache: { [pubkey: string]: string } = {};
let tempPasswordCache: { [pubkey: string]: string } = {};

const getStorage = () => {
  if (isExtensionEnvironment) {
    return chrome.storage.local;
  } else {
    return {
      get: (keys: string[], callback: (result: { [key: string]: any }) => void) => {
        const result: { [key: string]: any } = {};
        keys.forEach(key => {
          const item = localStorage.getItem(key);
          result[key] = item ? JSON.parse(item) : null;
        });
        callback(result);
      },
      set: (data: { [key: string]: any }, callback?: () => void) => {
        Object.keys(data).forEach(key => {
          localStorage.setItem(key, JSON.stringify(data[key]));
        });
        if (callback) callback();
      }
    };
  }
};

export const initializeNsecCache = async (): Promise<void> => {
  const users = await getUserProfiles();
  const persistentState = await getPersistentLoginState();

  if (persistentState && persistentState.isLoggedIn) {
    const loggedInUser = users.find(user => user.id === persistentState.userId);
    if (loggedInUser) {
      if (loggedInUser.nsec.startsWith('nsec1')) {
        tempNsecCache[loggedInUser.pubkey] = loggedInUser.nsec;
      } else if (persistentState.password) {
        try {
          const decryptedNsec = await decryptSecretKey(loggedInUser.nsec, persistentState.password, loggedInUser.pubkey);
          tempNsecCache[loggedInUser.pubkey] = decryptedNsec;
          tempPasswordCache[loggedInUser.pubkey] = persistentState.password;
        } catch (error) {
          console.error('Failed to decrypt nsec during initialization:', error);
        }
      }
    }
  }
};

export const createUserProfile = async (profileData: Omit<UserProfile, 'id'>): Promise<void> => {
  const newUser: UserProfile = {
    id: Date.now(),
    ...profileData,
  };

  if (newUser.nsec.startsWith('nsec1')) {
    tempNsecCache[newUser.pubkey] = newUser.nsec;
  }

  return new Promise((resolve, reject) => {
    getStorage().get(['users'], (result) => {
      const users = result.users || [];
      users.push(newUser);
      getStorage().set({ users }, () => {
        if (isExtensionEnvironment && chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
        } else {
          console.log('User profile stored');
          resolve();
        }
      });
    });
  });
};

export const getUserProfiles = (): Promise<UserProfile[]> => {
  return new Promise((resolve) => {
    getStorage().get(['users'], (result) => {
      resolve(result.users || []);
    });
  });
};

export const deleteUserProfile = (userId: number): Promise<void> => {
  return new Promise((resolve, reject) => {
    getStorage().get(['users'], (result) => {
      const users = result.users || [];
      const updatedUsers = users.filter((user: UserProfile) => user.id !== userId);
      getStorage().set({ users: updatedUsers }, () => {
        if (isExtensionEnvironment && chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
        } else {
          console.log('User profile deleted');
          resolve();
        }
      });
    });
  });
};

export const updateUserProfile = async (updatedProfileData: Partial<UserProfile> & { pubkey: string }): Promise<void> => {
  return new Promise((resolve, reject) => {
    getStorage().get(['users'], (result) => {
      const users = result.users || [];
      const updatedUsers = users.map((user: UserProfile) => {
        if (user.pubkey === updatedProfileData.pubkey) {
          const updatedUser = {
            ...user,
            ...updatedProfileData,
            nsec: updatedProfileData.nsec || user.nsec,
          };
          if (updatedUser.nsec.startsWith('nsec1')) {
            tempNsecCache[updatedUser.pubkey] = updatedUser.nsec;
          }
          return updatedUser;
        }
        return user;
      });

      getStorage().set({ users: updatedUsers }, () => {
        if (isExtensionEnvironment && chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
        } else {
          console.log('User profile updated');
          resolve();
        }
      });
    });
  });
};

export const decryptAndCacheNsec = async (encryptedNsec: string, password: string, pubkey: string): Promise<string> => {
  try {
    const decrypted = await decryptSecretKey(encryptedNsec, password, pubkey);
    tempNsecCache[pubkey] = decrypted;
    tempPasswordCache[pubkey] = password;  // Cache the password
    return decrypted;
  } catch (error) {
    console.error('Error decrypting nsec:', error);
    throw error;
  }
};

export const getCachedNsec = (pubkey: string): string | null => {
  return tempNsecCache[pubkey] || null;
};

export const clearCachedNsecAndPassword = (pubkey: string): void => {
  delete tempNsecCache[pubkey];
  delete tempPasswordCache[pubkey];
};

export const clearAllCachedNsecsAndPasswords = (): void => {
  Object.keys(tempNsecCache).forEach(key => delete tempNsecCache[key]);
  tempPasswordCache = {};
};

export const reencryptAndUpdateNsec = async (pubkey: string, newPassword: string, nsec: string): Promise<void> => {
  const newEncryptedNsec = await encryptSecretKey(nsec, newPassword, pubkey);
  await updateUserProfile({ pubkey, nsec: newEncryptedNsec });
  
  // Update the password in the persistent state
  const persistentState = await getPersistentLoginState();
  if (persistentState && persistentState.pubkey === pubkey) {
    await setPersistentLoginState({
      ...persistentState,
      password: newPassword
    });
  }
  
  // Update the password in the temporary cache
  tempPasswordCache[pubkey] = newPassword;
  tempNsecCache[pubkey] = nsec; // Store the unencrypted nsec in the cache
};

export const storeUnencryptedNsec = async (pubkey: string, nsec: string): Promise<void> => {
  tempNsecCache[pubkey] = nsec;
  await updateUserProfile({ pubkey, nsec });
  
  // Remove the password from the persistent state
  const persistentState = await getPersistentLoginState();
  if (persistentState && persistentState.pubkey === pubkey) {
    const { password, ...stateWithoutPassword } = persistentState;
    await setPersistentLoginState(stateWithoutPassword);
  }
  
  // Remove the password from the temporary cache
  delete tempPasswordCache[pubkey];
};

export const setLoginState = async (loginState: LoginState): Promise<void> => {
  return new Promise((resolve, reject) => {
    getStorage().set({ loginState }, () => {
      if (isExtensionEnvironment && chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      } else {
        console.log('Login state updated');
        resolve();
      }
    });
  });
};

export const getLoginState = async (): Promise<LoginState> => {
  return new Promise((resolve) => {
    getStorage().get(['loginState'], (result) => {
      resolve(result.loginState || { isLoggedIn: false, loggedInUserId: null });
    });
  });
};

export const clearLoginState = async (): Promise<void> => {
  const loginState = await getLoginState();
  if (loginState.isLoggedIn && loginState.loggedInUserId !== null) {
    const user = await getLoggedInUserProfile();
    if (user) {
      clearCachedNsecAndPassword(user.pubkey);
    }
  }
  return setLoginState({ isLoggedIn: false, loggedInUserId: null });
};

export const getLoggedInUserProfile = async (): Promise<UserProfile | null> => {
  const loginState = await getLoginState();
  if (!loginState.isLoggedIn || loginState.loggedInUserId === null) {
    return null;
  }

  const users = await getUserProfiles();
  return users.find(user => user.id === loginState.loggedInUserId) || null;
};

export const setPersistentLoginState = async (state: PersistentLoginState): Promise<void> => {
  return new Promise((resolve, reject) => {
    getStorage().set({ persistentLoginState: state }, () => {
      if (isExtensionEnvironment && chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      } else {
        console.log('Persistent login state updated');
        resolve();
      }
    });
  });
};

export const getPersistentLoginState = async (): Promise<PersistentLoginState | null> => {
  return new Promise((resolve) => {
    getStorage().get(['persistentLoginState'], (result) => {
      resolve(result.persistentLoginState || null);
    });
  });
};

export const clearPersistentLoginState = async (): Promise<void> => {
  const persistentState = await getPersistentLoginState();
  if (persistentState && persistentState.isLoggedIn) {
    clearCachedNsecAndPassword(persistentState.pubkey);
  }
  return setPersistentLoginState({ isLoggedIn: false, userId: -1, pubkey: '' });
};