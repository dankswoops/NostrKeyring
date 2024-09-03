import { useState, useEffect } from 'react';
import { decryptSecretKey, encryptSecretKey } from '../utils/encrypt';
import { fetchUserDataAndRelays } from '../utils/nip65';
import {
  updateUserProfile,
  updateUserSecretKey,
  clearLoginState,
  setPersistentLoginState,
  getPersistentLoginState,
  clearPersistentLoginState,
  getUserProfiles
} from '../utils/storage';
import Loader from './Loader';

interface UserType {
  id: number;
  name: string;
  joinedDate: string;
  secretKey: string;
  salt: string;
  picture?: string;
  lud16?: string;
  pubkey: string;
}

interface UserProps {
  user: UserType;
  onBack: () => void;
  onDelete: (userId: number) => void;
  onUserUpdate: (updatedUser: UserType) => void;
  onLogout: () => void;
}

export default function UserProfile({ user, onBack, onDelete, onUserUpdate, onLogout }: UserProps) {
  const [isLoggedIn, setIsLoggedIn] = useState(user.secretKey.startsWith('nsec1'));
  const [showNsec, setShowNsec] = useState(false);
  const [copyButtonText, setCopyButtonText] = useState('Copy Nsec');
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [password, setPassword] = useState('');
  const [decryptedNsec, setDecryptedNsec] = useState('');
  const [error, setError] = useState('');
  const [retryCountdown, setRetryCountdown] = useState(0);
  const [updatedUser, setUpdatedUser] = useState<UserType>(user);
  const [isUpdating, setIsUpdating] = useState(false);
  const [deleteConfirmName, setDeleteConfirmName] = useState('');
  const [deleteError, setDeleteError] = useState('');
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [verifyNewPassword, setVerifyNewPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);

  useEffect(() => {
    let timer: number | undefined;
    if (copyButtonText === 'Copied!') {
      timer = window.setTimeout(() => setCopyButtonText('Copy Nsec'), 3000);
    }
    return () => window.clearTimeout(timer);
  }, [copyButtonText]);

  useEffect(() => {
    let timer: number | undefined;
    if (retryCountdown > 0) {
      timer = window.setTimeout(() => setRetryCountdown(retryCountdown - 1), 1000);
    }
    return () => window.clearTimeout(timer);
  }, [retryCountdown]);

  useEffect(() => {
    if (isLoggedIn) {
      fetchLatestUserData();
    }
  }, [isLoggedIn]);

  useEffect(() => {
    checkPersistentLoginState();
  }, []);

  const checkPersistentLoginState = async () => {
    const persistentState = await getPersistentLoginState();
    if (persistentState && persistentState.isLoggedIn && persistentState.userId === user.id) {
      setIsLoggedIn(true);
      if (user.secretKey.startsWith('nsec1')) {
        setDecryptedNsec(user.secretKey);
      }
      fetchLatestUserData();
    }
  };

  const fetchLatestUserData = async () => {
    setIsUpdating(true);
    try {
      const { metadata } = await fetchUserDataAndRelays(user.pubkey);
      
      const updatedFields: Partial<UserType> = {};
      let hasChanges = false;

      if (metadata.name && metadata.name !== user.name) {
        updatedFields.name = metadata.name;
        hasChanges = true;
      }
      if (metadata.picture && metadata.picture !== user.picture) {
        updatedFields.picture = metadata.picture;
        hasChanges = true;
      }
      if (metadata.lud16 && metadata.lud16 !== user.lud16) {
        updatedFields.lud16 = metadata.lud16;
        hasChanges = true;
      }

      if (hasChanges) {
        await updateUserProfile({ ...updatedFields, pubkey: user.pubkey });
        setUpdatedUser(prevUser => ({ ...prevUser, ...updatedFields }));
        console.log('User profile updated');
      }
    } catch (err) {
      console.error('Error fetching latest user data:', err);
    } finally {
      setIsUpdating(false);
    }
  };

  const toggleNsec = () => {
    setShowDeleteConfirmation(false);
    setShowNsec(!showNsec);
  };

  const copyNsec = () => {
    navigator.clipboard.writeText(decryptedNsec).then(() => {
      setShowDeleteConfirmation(false);
      setCopyButtonText('Copied!');
    }, (err) => {
      console.error('Could not copy text: ', err);
      setShowDeleteConfirmation(false);
      setCopyButtonText('Failed');
    });
  };

  const handleDeleteClick = () => {
    setShowDeleteConfirmation(true);
    setDeleteConfirmName('');
    setDeleteError('');
  };

  const handleCancelDelete = () => {
    setShowDeleteConfirmation(false);
    setDeleteConfirmName('');
    setDeleteError('');
  };

  const handleConfirmDelete = () => {
    if (deleteConfirmName === updatedUser.name) {
      onDelete(user.id);
    } else {
      setDeleteError('Doesn\'t match. Try again.');
    }
  };

  const handleLogout = async () => {
    setShowNsec(false);
    setDecryptedNsec('');
    setPassword('');
    setError('');
    await clearPersistentLoginState();
    setIsLoggedIn(false);
    onLogout();
  };

  const handleChangePassword = async () => {
    try {
      // Fetch the most up-to-date user data from storage
      const users = await getUserProfiles();
      const currentUser = users.find(u => u.pubkey === user.pubkey);
      
      if (!currentUser) {
        throw new Error('User not found');
      }

      let currentSecretKey = currentUser.secretKey;
      let updatedSecretKey;

      // If the current key is encrypted, try to decrypt it with the current password
      if (!currentSecretKey.startsWith('nsec1')) {
        try {
          currentSecretKey = await decryptSecretKey(currentSecretKey, password, currentUser.salt);
        } catch (error) {
          console.error('Error decrypting current key:', error);
          setError('Unable to decrypt the current key. Please try logging out and back in.');
          return;
        }
      }

      // Handle password removal (setting to blank) or changing password
      if (newPassword === '' && verifyNewPassword === '') {
        updatedSecretKey = currentSecretKey; // Keep it unencrypted
      } else if (newPassword === verifyNewPassword) {
        updatedSecretKey = await encryptSecretKey(currentSecretKey, newPassword, currentUser.salt);
      } else {
        setError('New passwords do not match');
        return;
      }

      // Update the secret key in storage
      await updateUserSecretKey(currentUser.pubkey, updatedSecretKey);

      // Update the user object in the component's state and parent component
      const updatedUserData = {
        ...updatedUser,
        secretKey: updatedSecretKey
      };
      setUpdatedUser(updatedUserData);
      onUserUpdate(updatedUserData);

      // Reset state
      setPassword('');
      setNewPassword('');
      setVerifyNewPassword('');
      setShowChangePassword(false);
      setShowNewPassword(false);
      setError('');

      // Update login state and decrypted nsec
      if (updatedSecretKey.startsWith('nsec1')) {
        setIsLoggedIn(true);
        setDecryptedNsec(updatedSecretKey);
      } else {
        setDecryptedNsec('');
      }
      
      await setPersistentLoginState({ isLoggedIn: true, userId: updatedUser.id, pubkey: updatedUser.pubkey });

      console.log('Password changed successfully');
    } catch (error) {
      console.error('Error changing password:', error);
      setError('Failed to change password. Please try again.');
    }
  };

  const handleLogin = async () => {
    try {
      // Fetch the most up-to-date user data from storage
      const users = await getUserProfiles();
      const currentUser = users.find(u => u.pubkey === updatedUser.pubkey);
      
      if (!currentUser) {
        throw new Error('User not found');
      }
  
      // Use type assertion to tell TypeScript that currentUser is UserType
      const loggedInUser = currentUser as UserType;
  
      if (loggedInUser.secretKey.startsWith('nsec1')) {
        setIsLoggedIn(true);
        setDecryptedNsec(loggedInUser.secretKey);
        await setPersistentLoginState({ isLoggedIn: true, userId: loggedInUser.id, pubkey: loggedInUser.pubkey });
      } else {
        const decrypted = await decryptSecretKey(loggedInUser.secretKey, password, loggedInUser.salt);
        setDecryptedNsec(decrypted);
        setIsLoggedIn(true);
        setError('');
        setShowNewPassword(false);
        await setPersistentLoginState({ isLoggedIn: true, userId: loggedInUser.id, pubkey: loggedInUser.pubkey });
      }
  
      // Update the local user state with the most recent data
      setUpdatedUser(loggedInUser);
    } catch (err) {
      console.error('Login error:', err);
      setError('Invalid password');
      setRetryCountdown(9);
    }
  };
  
  return (
    <div className="h-full flex flex-col items-center mx-[20px]">
      <button
        className={`text-white h-[40px] w-[150px] mb-[20px] flex-shrink-0 bg-gradient-to-b from-[#9339F4] to-[#105FB0] rounded mt-[25px] ${retryCountdown > 0 ? 'opacity-50' : ''}`}
        onClick={isLoggedIn ? handleLogout : onBack}
        disabled={retryCountdown > 0}
        draggable={retryCountdown > 0 ? "false" : undefined}
      >
        {isLoggedIn ? 'Logout' : 'Back'}
      </button>
      <div className="hover:brightness-105 hover:text-white mb-[15px] flex items-center w-full">
        <div className="relative h-[70px] w-[70px] rounded-full overflow-hidden flex-shrink-0">
          {updatedUser.picture ? (
            <img 
              draggable="false" 
              src={updatedUser.picture} 
              alt="User" 
              className="w-full h-full object-cover"
            />
          ) : (
            <svg className="h-[70px] w-[70px]" viewBox="0 0 52 52" xmlns="http://www.w3.org/2000/svg">
              <path fill="#444444" d="M7.28181 41.0223C10.2003 39.8377 15.6033 37.7566 19.6444 36.85V34.7365C18.6589 33.5244 17.8956 31.3877 17.5446 28.7916C16.8769 28.1679 16.2208 27.065 15.7892 25.7263C15.117 23.6414 15.221 21.7021 15.9858 21.1263C15.9223 20.4163 15.8889 19.6789 15.8889 18.9222C15.8889 18.5928 15.8952 18.267 15.9076 17.9455C15.9167 17.7091 15.9291 17.475 15.9447 17.2435C15.7198 16.5345 15.6 15.79 15.6 15.0222C15.6 10.2358 20.2562 6.35556 26 6.35556C31.7438 6.35556 36.4 10.2358 36.4 15.0222C36.4 15.79 36.2802 16.5345 36.0552 17.2435C36.072 17.4932 36.0852 17.7459 36.0945 18.0015C36.1055 18.3048 36.1111 18.6119 36.1111 18.9222C36.1111 19.6789 36.0777 20.4163 36.0142 21.1263C36.779 21.7021 36.883 23.6414 36.2108 25.7263C35.7792 27.065 35.1231 28.1679 34.4554 28.7916C34.1044 31.3877 33.3411 33.5244 32.3556 34.7365V36.85C36.3967 37.7566 41.7997 39.8377 44.7182 41.0223C48.0227 36.9101 50 31.686 50 26C50 12.7452 39.2548 2 26 2C12.7452 2 2 12.7452 2 26C2 31.686 3.9773 36.9101 7.28181 41.0223ZM5.36405 41.8185C1.99977 37.4363 0 31.9517 0 26C0 11.6406 11.6406 0 26 0C40.3594 0 52 11.6406 52 26C52 32.2822 49.7719 38.0441 46.0629 42.5384C41.2941 48.3168 34.0772 52 26 52C25.9439 52 25.8879 51.9998 25.8319 51.9995C17.4926 51.9467 10.0849 47.9679 5.36405 41.8185Z"/>
            </svg>
          )}
          {isUpdating && (
            <div className="absolute inset-0 flex items-center justify-center">
              <Loader size={50} />
            </div>
          )}
        </div>
        <div draggable="false" className='ml-2 w-[190px] overflow-hidden'>
          <div className='whitespace-nowrap font-bold'>{updatedUser.name}</div>
          <div className='whitespace-nowrap text-xs'>{updatedUser.lud16 || 'No wallet address'}</div>
        </div>
      </div>
      {!isLoggedIn && !user.secretKey.startsWith('nsec1') && (
        <>
          <div className={`flex w-full mb-[15px] ${retryCountdown > 0 ? 'opacity-50' : ''}`}>
            <input
              className="p-2 border rounded-l w-full outline-none text-black"
              type={showNewPassword ? "text" : "password"}
              placeholder="Enter Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={retryCountdown > 0}
              draggable={retryCountdown > 0 ? "false" : undefined}
            />
            <button
              className="rounded-r w-[50px] flex justify-center items-center bg-[#699f4c] hover:bg-[#5c8a3c] active:bg-[#4f7431]"
              onClick={handleLogin}
              disabled={retryCountdown > 0}
              draggable={retryCountdown > 0 ? "false" : undefined}
            >
              <div draggable="false">
                <svg className='w-6 h-6' xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
                  <path d="M155.81,0v173.889h33.417V33.417h235.592l-74.87,50.656c-8.469,5.727-13.535,15.289-13.535,25.503v286.24H189.227V282.079H155.81v147.154h180.604v70.93c0,4.382,2.423,8.404,6.29,10.451c3.867,2.056,8.558,1.811,12.189-0.644l119.318-80.736V0H155.81z"/>
                  <path d="M228.657,290.4c0,1.844,1.068,3.524,2.75,4.3c1.664,0.775,3.638,0.514,5.042-0.685l78.044-66.035l-78.044-66.034c-1.404-1.2-3.378-1.46-5.042-0.686c-1.681,0.775-2.75,2.456-2.75,4.3v33.392H37.79v58.064h190.868V290.4z"/>
                </svg>
              </div>
            </button>
          </div>
          <div className="flex items-center mb-2 w-full">
            <input
              type="checkbox"
              id="showNewPassword"
              checked={showNewPassword}
              onChange={(e) => setShowNewPassword(e.target.checked)}
              className="mr-2"
              disabled={retryCountdown > 0}
              draggable={retryCountdown > 0 ? "false" : undefined}
            />
            <label htmlFor="showNewPassword" className='w-full'>
              <span draggable="false">Show Password</span>
            </label>
          </div>
        </>
      )}
      {isLoggedIn && (
        <>
          <div className='flex gap-[5px] my-[5px]'>
            <button
              className="text-white h-[40px] w-[126px] bg-[#C32F2F] rounded-tl"
              onClick={handleDeleteClick}
            >
              Delete User
            </button>
            <button
              className="text-white h-[40px] w-[126px] bg-[#45A049] rounded-tr"
              onClick={() => setShowChangePassword(!showChangePassword)}
            >
              {showChangePassword ? 'Cancel' : 'Change Pass'}
            </button>
          </div>
          <div className='flex gap-[5px]'>
            <button
              className="text-white h-[40px] w-[126px] bg-[#103FF0] rounded-bl"
              onClick={toggleNsec}
            >
              {showNsec ? 'Hide Nsec' : 'Show Nsec'}
            </button>
            <button
              className="text-white h-[40px] w-[126px] bg-yellow-600 rounded-br"
              onClick={copyNsec}
            >
              {copyButtonText}
            </button>
          </div>
          {showNsec && (
            <>
              <p draggable="false" className="mt-[20px] font-bold">Secret Key (Nsec):</p>
              <p draggable="false" className="break-all mt-[5px]">{decryptedNsec || user.secretKey}</p>
            </>
          )}
          {showDeleteConfirmation && (
            <div className="flex flex-col w-full">
              <button
                className="text-white h-[40px] mt-[20px] mb-[10px] w-full bg-[#757575] rounded"
                onClick={handleCancelDelete}
              >
                Cancel
              </button>
              <div draggable="false" className='text-center mb-[10px] italic'>Enter username to delete</div>
              <div className="flex w-full mb-[10px]">
                <input
                  className="p-2 border rounded-l w-full outline-none text-black"
                  type="text"
                  placeholder={updatedUser.name}
                  value={deleteConfirmName}
                  onChange={(e) => setDeleteConfirmName(e.target.value)}
                />
                <button
                  className="rounded-r w-[50px] flex justify-center items-center bg-red-600 hover:bg-red-700 active:bg-red-800"
                  onClick={handleConfirmDelete}
                >
                  <div draggable="false">
                    <svg className='w-6 h-6' xmlns="http://www.w3.org/2000/svg" viewBox="0 0 574.859 574.86">
                      <path d="M181.688,521.185V353.841H19.125v167.344c0,10.566,13.34,23.906,23.906,23.906h124.312C177.91,545.091,181.688,531.751,181.688,521.185z M66.938,502.06c0,2.64-2.142,4.781-4.781,4.781s-4.781-2.142-4.781-4.781V377.748c0-2.64,2.142-4.781,4.781-4.781s4.781,2.142,4.781,4.781V502.06z M105.188,502.06c0,2.64-2.142,4.781-4.781,4.781s-4.781-2.142-4.781-4.781V377.748c0-2.64,2.142-4.781,4.781-4.781s4.781,2.142,4.781,4.781V502.06z M143.438,502.06c0,2.64-2.142,4.781-4.781,4.781s-4.781-2.142-4.781-4.781V377.748c0-2.64,2.142-4.781,4.781-4.781s4.781,2.142,4.781,4.781V502.06z"/>
                      <path d="M19.125,334.716h162.562v-19.125h19.125v-19.125h-57.375c0-10.566-6.828-19.125-15.243-19.125H77.399c-8.415,0-15.243,8.559-15.243,19.125H0v19.125h19.125V334.716z"/>
                      <path d="M357.007,191.556C370.968,329.811,243.892,542.08,243.892,542.08c145.235-78.212,169.189-207.363,169.189-207.363c42.333,66.479,44.475,228.305,44.475,228.305c80.995-194.109,0-377.049,0-377.049l117.304,48.874c-19.546-74.014-141.047-125.68-141.047-125.68c-110.322,50.27-249.974,44.686-249.974,44.686C259.249,226.469,357.007,191.556,357.007,191.556z"/>
                      <circle cx="369.782" cy="55.128" r="43.29"/>
                      <path d="M94.43,229.529c5.977-2.391,27.492-13.148,28.764,0c1.271,13.148,11.876,9.562,19.048,0s3.586-25.102,11.953-23.906s15.539-10.758,17.93-21.735c2.391-10.978-22.711-18.905-33.469-21.458s-20.32,13.321-27.492,13.321s-17.93-20.33-25.102-10.768s-11.953,40.641-11.953,40.641c-10.758-5.977-21.516,7.172-25.102,16.734S88.453,231.919,94.43,229.529z"/>
                    </svg>
                  </div>
                </button>
              </div>
              {deleteError && (
                <div draggable="false" className="text-red-500 text-center">
                  {deleteError}
                </div>
              )}
            </div>
          )}
          {showChangePassword && (
            <div className="w-full mt-4">
              <input
                type={showNewPassword ? "text" : "password"}
                placeholder="Enter new password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="p-2 border rounded w-full mb-2 outline-none text-black"
              />
              <input
                type={showNewPassword ? "text" : "password"}
                placeholder="Verify new password"
                value={verifyNewPassword}
                onChange={(e) => setVerifyNewPassword(e.target.value)}
                className="p-2 border rounded w-full mb-2 outline-none text-black"
              />
              <div className="flex items-center mb-2">
                <input
                  type="checkbox"
                  id="showNewPassword"
                  checked={showNewPassword}
                  onChange={(e) => setShowNewPassword(e.target.checked)}
                  className="mr-2"
                />
                <label htmlFor="showNewPassword" className='w-full'>
                  <span draggable="false">Show Password</span>
                </label>
              </div>
              <button
                className={`text-white h-[40px] w-full mb-[25px] bg-gradient-to-b from-[#9339F4] to-[#105FB0] rounded ${
                  newPassword === verifyNewPassword ? 'hover:brightness-110' : 'opacity-50 cursor-not-allowed'
                }`}
                onClick={handleChangePassword}
                disabled={newPassword !== verifyNewPassword}
              >
                Update Password
              </button>
            </div>
          )}
        </>
      )}
      {error && (
        <div draggable="false">
          <p className="text-red-500">{error}</p>
          {retryCountdown > 0 && (
            <p className="text-yellow-500 text-center">Try again in: {retryCountdown}</p>
          )}
        </div>
      )}
    </div>
  );
};