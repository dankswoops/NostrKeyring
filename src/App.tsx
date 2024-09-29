import './App.css';
import i18n from './utils/i18next';
import { I18nextProvider } from 'react-i18next';
import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import Header from './components/Header';
import About from './components/About';
import Login from './components/Login';
import Create from './components/Create';
import UserProfile from './components/UserProfile';
import { 
  deleteUserProfile, 
  getUserProfiles, 
  updateUserProfile, 
  getLoginState, 
  setLoginState, 
  clearLoginState, 
  getLoggedInUserProfile,
  initializeNsecCache,
  getPersistentLoginState,
  getLanguagePreference
} from './utils/storage';
import { updateBackgroundKeys } from './utils/passkeys';

interface UserProfile {
  id: number;
  nsec: string;
  npub: string;
  pubkey: string;
  name: string;
  picture?: string;
  lud16?: string;
}

const App = () => {
  const [currentPage, setCurrentPage] = useState<'login' | 'create' | 'user' | 'about'>('login');
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUserKeys, setCurrentUserKeys] = useState<{ pubkey: string | null, seckey: string | null }>({ pubkey: null, seckey: null });

  useEffect(() => {
    const initialize = async () => {
      try {
        await initializeNsecCache();
        console.log('Nsec cache initialized');
      } catch (error) {
        console.error('Error initializing nsec cache:', error);
      }
      await loadUsers();
      await checkLoginState();
      await loadLanguagePreference();
    };

    initialize();
  }, []);

  const loadLanguagePreference = async () => {
    const savedLanguage = await getLanguagePreference();
    if (savedLanguage) {
      i18n.changeLanguage(savedLanguage);
    }
  };

  const loadUsers = async () => {
    const loadedUsers = await getUserProfiles();
    setUsers(loadedUsers);
  };

  const checkLoginState = async () => {
    const persistentState = await getPersistentLoginState();
    const loginState = await getLoginState();
    
    if (persistentState && persistentState.isLoggedIn && persistentState.userId !== null) {
      const loggedInUser = await getLoggedInUserProfile();
      if (loggedInUser) {
        if (loggedInUser.nsec.startsWith('nsec1') || persistentState.password) {
          handleUserSelect(loggedInUser);
        } else {
          // User needs to log in
          setCurrentPage('login');
          setSelectedUser(loggedInUser);
          setIsLoggedIn(false);
        }
      } else {
        // If the logged-in user doesn't exist, clear the login state
        await clearLoginState();
        setCurrentPage('login');
      }
    } else if (loginState.isLoggedIn && loginState.loggedInUserId !== null) {
      const loggedInUser = await getLoggedInUserProfile();
      if (loggedInUser) {
        if (loggedInUser.nsec.startsWith('nsec1')) {
          handleUserSelect(loggedInUser);
        } else {
          // User needs to log in
          setCurrentPage('login');
          setSelectedUser(loggedInUser);
          setIsLoggedIn(false);
        }
      } else {
        // If the logged-in user doesn't exist, clear the login state
        await clearLoginState();
        setCurrentPage('login');
      }
    } else {
      setCurrentPage('login');
    }
  };

  const handleCreateProfile = () => {
    setCurrentPage('create');
  };

  const handleUserSelect = async (user: UserProfile) => {
    setSelectedUser(user);
    setCurrentPage('user');
    setIsLoggedIn(true);
    await setLoginState({ isLoggedIn: true, loggedInUserId: user.id });
    // Update the current user keys
    const newKeys = { pubkey: user.pubkey, seckey: user.nsec };
    setCurrentUserKeys(newKeys);
    // Send the new keys to the background script
    console.log('Sending keys to background script:', newKeys.pubkey, newKeys.seckey ? '[REDACTED]' : null);
    await updateBackgroundKeys(newKeys);
  };

  const handleNewUserCreated = () => {
    loadUsers();
    setCurrentPage('login');
  };

  const handleBack = () => {
    loadUsers();
    setCurrentPage('login');
    setIsLoggedIn(false);
    setSelectedUser(null);
    clearLoginState();
  };

  const handleDeleteUser = async (userId: number) => {
    await deleteUserProfile(userId);
    loadUsers();
    setCurrentPage('login');
    setIsLoggedIn(false);
    setSelectedUser(null);
    clearLoginState();
  };

  const handleAboutClick = () => {
    if (!isLoggedIn) {
      setCurrentPage('about');
    }
  };

  const handleUserUpdate = async (updatedUser: UserProfile) => {
    const updatedUsers = users.map(user => 
      user.id === updatedUser.id ? updatedUser : user
    );
    setUsers(updatedUsers);
    setSelectedUser(updatedUser);
    await updateUserProfile(updatedUser);
  };

  const handleLogout = async () => {
    setIsLoggedIn(false);
    setSelectedUser(null);
    setCurrentPage('login');
    await clearLoginState();
    // Clear the current user keys
    setCurrentUserKeys({ pubkey: null, seckey: null });
    // Send null keys to the background script
    await updateBackgroundKeys({ pubkey: null, seckey: null });
  };

  return (
    <div id='app'>
      <Header onAboutClick={handleAboutClick} isLoggedIn={isLoggedIn} />
      <div id='scroll'>
        {currentPage === 'login' && !isLoggedIn && (
          <Login onCreateProfile={handleCreateProfile} onUserSelect={handleUserSelect} />
        )}
        {currentPage === 'create' && !isLoggedIn && (
          <Create onUserCreated={handleNewUserCreated} onBack={handleBack} />
        )}
        {(currentPage === 'user' || isLoggedIn) && selectedUser && (
          <UserProfile
            user={selectedUser}
            onBack={handleBack}
            onDelete={handleDeleteUser}
            onUserUpdate={handleUserUpdate}
            onLogout={handleLogout}
          />
        )}
        {currentPage === 'about' && !isLoggedIn && (
          <About onBack={handleBack} />
        )}
      </div>
    </div>
  );
};

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(
  <React.StrictMode>
    <I18nextProvider i18n={i18n}>
      <App />
    </I18nextProvider>
  </React.StrictMode>
);