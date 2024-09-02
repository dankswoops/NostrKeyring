interface UserProfile {
  id: number;
  pubkey: string;
  name: string;
  picture?: string;
  lud16?: string;
  salt: string;
  secretKey: string;
}

interface LoginState {
  isLoggedIn: boolean;
  loggedInUserId: number | null;
}

const isExtensionEnvironment = typeof chrome !== 'undefined' && chrome.storage;

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

export const createUserProfile = async (profileData: Omit<UserProfile, 'id'>): Promise<void> => {
  const newUser: UserProfile = {
    id: Date.now(),
    ...profileData,
  };

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
          return {
            ...user,
            name: updatedProfileData.name || user.name,
            picture: updatedProfileData.picture || user.picture,
            lud16: updatedProfileData.lud16 || user.lud16,
          };
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

export const updateUserSecretKey = async (pubkey: string, newSecretKey: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    getStorage().get(['users'], (result) => {
      const users = result.users || [];
      const userIndex = users.findIndex((user: UserProfile) => user.pubkey === pubkey);

      if (userIndex === -1) {
        reject(new Error('User not found'));
        return;
      }

      const updatedUsers = users.map((user: UserProfile) => {
        if (user.pubkey === pubkey) {
          return {
            ...user,
            secretKey: newSecretKey,
          };
        }
        return user;
      });

      getStorage().set({ users: updatedUsers }, () => {
        if (isExtensionEnvironment && chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
        } else {
          console.log('User secret key updated');
          resolve();
        }
      });
    });
  });
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

interface PersistentLoginState {
  isLoggedIn: boolean;
  userId: number;
  pubkey: string;
}

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
  return setPersistentLoginState({ isLoggedIn: false, userId: -1, pubkey: '' });
};