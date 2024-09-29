import React, { useState, useEffect } from 'react';
import { generateSecretKey, isValidSecretKey, getPublicKeyHex, nip19 } from '../utils/nip19';
import { fetchUserDataAndRelays } from '../utils/nip65';
import { encryptSecretKey } from '../utils/encrypt';
import { getUserProfiles, createUserProfile } from '../utils/storage';
import { useTranslation } from 'react-i18next';

interface CreateProps {
  onUserCreated: () => void;
  onBack: () => void;
}

interface UserMetadata {
  name?: string;
  picture?: string;
  lud16?: string;
}

export default function Create({ onUserCreated, onBack }: CreateProps) {
  const [nsec, setNsec] = useState('');
  const [isValidKey, setIsValidKey] = useState(false);
  const [showEncryptOptions, setShowEncryptOptions] = useState(false);
  const [encryptKey, setEncryptKey] = useState(true);
  const [password, setPassword] = useState('');
  const [verifyPassword, setVerifyPassword] = useState('');
  const [passwordsMatch, setPasswordsMatch] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [metadata, setMetadata] = useState<UserMetadata | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [importStatus, setImportStatus] = useState('');
  const [showImportStatus, setShowImportStatus] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    const checkValidityAndFetchData = async () => {
      const isValid = isValidSecretKey(nsec);
      setIsValidKey(isValid);
      setShowEncryptOptions(isValid);

      if (isValid) {
        setIsLoading(true);
        setError(null);
        try {
          const pubkeyHex = getPublicKeyHex(nsec);
          const { metadata: fetchedMetadata } = await fetchUserDataAndRelays(pubkeyHex);
          setMetadata(fetchedMetadata);
        } catch (error) {
          console.error('Error fetching user data:', error);
          setError(t('CreateError'));
          setMetadata(null);
        } finally {
          setIsLoading(false);
        }
      } else {
        setMetadata(null);
        setError(null);
      }
    };

    checkValidityAndFetchData();
  }, [nsec]);

  useEffect(() => {
    setPasswordsMatch(password === verifyPassword);
  }, [password, verifyPassword]);

  const handleCreateNsec = () => {
    const newNsec = generateSecretKey();
    setNsec(newNsec);
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const input = event.target.value;
    setNsec(input);
  };

  const handleCreateProfile = () => {
    if (!encryptKey) {
      setShowWarning(true);
    } else {
      createProfile();
    }
  };

  const createProfile = async () => {
    if (!metadata) {
      console.error('Metadata Error, Try Again');
      return;
    }
  
    const secretKey = nsec;
    const pubkeyHex = getPublicKeyHex(nsec);
    const npub = nip19.npubEncode(pubkeyHex);
    
    let finalNsec = nsec;
    if (encryptKey) {
      finalNsec = await encryptSecretKey(nsec, password, pubkeyHex); // Use pubkeyHex as salt
    }
  
    // Generate a random number between 0 and 999
    const randomNumber = Math.floor(Math.random() * 1000);
  
    await createUserProfile({
      nsec: finalNsec,
      npub: npub,
      pubkey: pubkeyHex,
      name: metadata.name || `${t('CreateUnnamed')} ${randomNumber}`,
      picture: metadata.picture,
      lud16: metadata.lud16
    });
  
    onUserCreated();
  };

  const handleWarningResponse = (confirmed: boolean) => {
    setShowWarning(false);
    if (confirmed) {
      createProfile();
    }
  };

  const handleExport = async () => {
    try {
      const profiles = await getUserProfiles();
      const exportData = JSON.stringify(profiles);
      const blob = new Blob([exportData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = 'nostr_keyring_backup.json';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to export data:', error);
      // You might want to show an error message to the user here
    }
  };


  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      showStatusMessage('No file selected');
      return;
    }

    if (file.name !== 'nostr_keyring_backup.json') {
      showStatusMessage('Invalid File');
      return;
    }

    try {
      const fileContent = await file.text();
      const importedProfiles = JSON.parse(fileContent);

      // Validate imported data structure
      if (!Array.isArray(importedProfiles) || !importedProfiles.every(isValidProfileData)) {
        throw new Error('Invalid import file structure');
      }

      // Import each profile
      for (const profile of importedProfiles) {
        await createUserProfile(profile);
      }

      showStatusMessage('File Loaded');
      onUserCreated(); // Notify parent component that profiles were imported
    } catch (error) {
      console.error('Failed to import data:', error);
      showStatusMessage('Upload Failed');
    }
  };

  const showStatusMessage = (message: string) => {
    setImportStatus(message);
    setShowImportStatus(true);
    setTimeout(() => {
      setShowImportStatus(false);
    }, 3000);
  };

  // Helper function to validate UserProfile structure
  const isValidProfileData = (profile: any): boolean => {
    return (
      typeof profile === 'object' &&
      profile !== null &&
      typeof profile.pubkey === 'string' &&
      typeof profile.name === 'string' &&
      typeof profile.salt === 'string' &&
      typeof profile.secretKey === 'string'
    );
  };

  const renderMetadata = () => {
    if (isLoading) {
      return <div draggable='false' id='createisloading'>{t('CreateLoading')}</div>;
    }

    if (error) {
      return <div draggable='false' id='createerror'>{error}</div>;
    }

    if (!metadata) {
      return (
        <>
          <div draggable='false' id='createnouserdata'>{t('CreateNoUser')}</div>
          <button
            id='createexport'
            onClick={handleExport}
          >
            {t('CreateExport')}
          </button>
          <label id='createimport'>
            <input
              type='file'
              accept='.json'
              onChange={handleImport}
              className='hidden'
            />
            <span id='createimporttext' draggable='false'>{t('CreateImport')}</span>
          </label>
          <div draggable='false' id='createporttext'>
            <p>'nostr_keyring_backup.json' {t('CreateJson')}</p>
          </div>
          {showImportStatus && (
            <div draggable='false' id='createstatus'>{importStatus}</div>
          )}
        </>
      );
    };

    return (
      <div draggable='false' id='createphoto'>
        {metadata.picture ? (
          <div id='createphotochild'>
            <img 
              src={metadata.picture} 
              alt='User' 
              id='createphotosize'
            />
          </div>
        ) : (
          <div draggable='false'>
            <svg id='createfallback' viewBox='0 0 52 52' xmlns='http://www.w3.org/2000/svg'>
              <path fill='#444444' d='M7.28181 41.0223C10.2003 39.8377 15.6033 37.7566 19.6444 36.85V34.7365C18.6589 33.5244 17.8956 31.3877 17.5446 28.7916C16.8769 28.1679 16.2208 27.065 15.7892 25.7263C15.117 23.6414 15.221 21.7021 15.9858 21.1263C15.9223 20.4163 15.8889 19.6789 15.8889 18.9222C15.8889 18.5928 15.8952 18.267 15.9076 17.9455C15.9167 17.7091 15.9291 17.475 15.9447 17.2435C15.7198 16.5345 15.6 15.79 15.6 15.0222C15.6 10.2358 20.2562 6.35556 26 6.35556C31.7438 6.35556 36.4 10.2358 36.4 15.0222C36.4 15.79 36.2802 16.5345 36.0552 17.2435C36.072 17.4932 36.0852 17.7459 36.0945 18.0015C36.1055 18.3048 36.1111 18.6119 36.1111 18.9222C36.1111 19.6789 36.0777 20.4163 36.0142 21.1263C36.779 21.7021 36.883 23.6414 36.2108 25.7263C35.7792 27.065 35.1231 28.1679 34.4554 28.7916C34.1044 31.3877 33.3411 33.5244 32.3556 34.7365V36.85C36.3967 37.7566 41.7997 39.8377 44.7182 41.0223C48.0227 36.9101 50 31.686 50 26C50 12.7452 39.2548 2 26 2C12.7452 2 2 12.7452 2 26C2 31.686 3.9773 36.9101 7.28181 41.0223ZM5.36405 41.8185C1.99977 37.4363 0 31.9517 0 26C0 11.6406 11.6406 0 26 0C40.3594 0 52 11.6406 52 26C52 32.2822 49.7719 38.0441 46.0629 42.5384C41.2941 48.3168 34.0772 52 26 52C25.9439 52 25.8879 51.9998 25.8319 51.9995C17.4926 51.9467 10.0849 47.9679 5.36405 41.8185Z'/>
            </svg>
          </div>
        )}
        <div id='createusertext'>
          <div id='createusername'>{metadata.name || t('CreateUnnamed')}</div>
          <div id='createuserwallet'>{metadata.lud16 || t('CreateWallet')}</div>
        </div>
      </div>
    );
  };

  return (
    <div id='create'>
      <button
        id='createback'
        onClick={onBack}
      >
        {t('CreateBack')}
      </button>
      <div id='creatensec'>
        <input
          id='createisvalid'
          className={`font-bold ${isValidKey ? 'text-green-500' : 'text-red-500'}`}
          type='text'
          placeholder={t('CreatePaste')}
          value={nsec}
          onChange={handleInputChange}
        />
        <button
          id='creategenerate'
          onClick={handleCreateNsec}
        >
          <div draggable='false'>
            <svg id='createsize' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'>
              <path fill='#699f4c' transform='translate(-1050 -210)' d='M1080,270a30,30,0,1,1,30-30A30,30,0,0,1,1080,270Zm14-34h-10V226a4,4,0,0,0-8,0v10h-10a4,4,0,0,0,0,8h10v10a4,4,0,0,0,8,0V244h10A4,4,0,0,0,1094,236Z'/>
            </svg>
          </div>
        </button>
      </div>
      {renderMetadata()}
      {showEncryptOptions && !showWarning && !isLoading && (
        <div className='createwfull'>
          <div id='createboxencrypt'>
            <input
              type='checkbox'
              id='encryptKey'
              checked={encryptKey}
              onChange={(e) => setEncryptKey(e.target.checked)}
              className='mr-2'
            />
            <label htmlFor='encryptKey' className='createwfull'><span draggable='false'>{t('CreateEncrypt')}</span></label>
          </div>
          <div id='createboxdontencrypt'>
            <input
              type='checkbox'
              id='dontEncrypt'
              checked={!encryptKey}
              onChange={(e) => setEncryptKey(!e.target.checked)}
              className='mr-2'
            />
            <label htmlFor='dontEncrypt' className='createwfull'><span draggable='false'>{t('CreateUncrypt')}</span></label>
          </div>
          {encryptKey && (
            <>
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder={t('CreateEnter')}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                id='createinput1'
              />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder={t('CreateVerify')}
                value={verifyPassword}
                onChange={(e) => setVerifyPassword(e.target.value)}
                id='createinput2'
              />
              <div id='createshowpass'>
                <input
                  type='checkbox'
                  id='showPassword'
                  checked={showPassword}
                  onChange={(e) => setShowPassword(e.target.checked)}
                  className='mr-2'
                />
                <label htmlFor='showPassword' className='w-full'><span draggable='false'>{t('CreatePassword')}</span></label>
              </div>
            </>
          )}
          <button
            id='createcreate'
            className={`${(!encryptKey || (encryptKey && passwordsMatch && password !== '')) && metadata ? 'cursor-pointer' : 'opacity-50 cursor-not-allowed'}`}
            onClick={handleCreateProfile}
            disabled={encryptKey && (!passwordsMatch || password === '') || !metadata}
          >
            {t('CreateProfile')}
          </button>
        </div>
      )}
      {showWarning && (
        <div id='createwarning'>
          <div draggable='false' className='font-bold'>{t('CreateWarning')}</div>
          <p draggable='false'>{t('CreateWarnText')}</p>
          <div id='createwarn'>
            <button
              id='createwarnfalse'
              onClick={() => setShowWarning(false)}
            >
              {t('CreateNo')}
            </button>
            <button
              id='createwarntrue'
              onClick={() => handleWarningResponse(true)}
            >
              {t('CreateYes')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};