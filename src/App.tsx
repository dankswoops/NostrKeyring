import './Style.css';
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
  getLoggedInUserProfile 
} from './utils/storage';

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

  useEffect(() => {
    loadUsers();
    checkLoginState();
  }, []);

  const loadUsers = async () => {
    const loadedUsers = await getUserProfiles();
    setUsers(loadedUsers);
  };

  const checkLoginState = async () => {
    const loginState = await getLoginState();
    if (loginState.isLoggedIn && loginState.loggedInUserId !== null) {
      const loggedInUser = await getLoggedInUserProfile();
      if (loggedInUser) {
        handleUserSelect(loggedInUser);
      } else {
        // If the logged-in user doesn't exist, clear the login state
        await clearLoginState();
      }
    }
  };

  const handleCreateProfile = () => {
    setCurrentPage('create');
  };

  const handleUserSelect = (user: UserProfile) => {
    setSelectedUser(user);
    setCurrentPage('user');
    setIsLoggedIn(true);
    setLoginState({ isLoggedIn: true, loggedInUserId: user.id });
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

  const handleLogout = () => {
    setIsLoggedIn(false);
    setSelectedUser(null);
    setCurrentPage('login');
    clearLoginState();
  };

  return (
    <div className='h-[550px] w-[300px] rounded-lg border-2 overflow-hidden flex flex-col'>
      <Header onAboutClick={handleAboutClick} isLoggedIn={isLoggedIn} />
      <div className='flex-1 overflow-y-auto'>
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