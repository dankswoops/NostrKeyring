import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

interface AboutProps {
  onBack: () => void;
}

export default function X({ onBack }: AboutProps) {
  const [authorText, setAuthorText] = useState('Click to Copy my Npub');
  const { t, i18n } = useTranslation();

  useEffect(() => {
    const loadLanguagePreference = async () => {
      if (typeof chrome !== 'undefined' && chrome.storage) {
        // We're in a browser extension environment
        chrome.storage.sync.get(['language'], (result) => {
          if (result.language) {
            i18n.changeLanguage(result.language);
          }
        });
      } else {
        // We're in a development environment
        const savedLanguage = localStorage.getItem('language');
        if (savedLanguage) {
          i18n.changeLanguage(savedLanguage);
        }
      }
    };

    loadLanguagePreference();
  }, [i18n]);

  const handleLanguageChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newLanguage = event.target.value;
    i18n.changeLanguage(newLanguage);

    if (typeof chrome !== 'undefined' && chrome.storage) {
      // We're in a browser extension environment
      chrome.storage.sync.set({ language: newLanguage });
    } else {
      // We're in a development environment
      localStorage.setItem('language', newLanguage);
    }
  };

  const handleAuthorClick = () => {
    const npub = 'npub1yrkexvt88h6cgd32gdcfm55auuz6rw6c70xj478gcz6lstz5czvs9s77xh';
    navigator.clipboard.writeText(npub).then(() => {
      setAuthorText('Npub Copied!');
      setTimeout(() => {
        setAuthorText('Click to Copy my Npub');
      }, 3000);
    }).catch(err => {
      console.error('Failed to copy text: ', err);
    });
  };

  return (
    <div id='about'>
      <button
        id='aboutbutton'
        onClick={onBack}
      >
        {t('back')}
      </button>
      <div id='mb20'>
        <select
          value={i18n.language}
          onChange={handleLanguageChange}
          id='language'
        >
          <option value="en">English</option>
          <option value="zh">中文</option>
          <option value="hi">हिन्दी</option>
          <option value="es">Español</option>
          <option value="fr">Français</option>
          <option value="ar">العربية</option>
          <option value="bn">বাংলা</option>
          <option value="pt">Português</option>
          <option value="ru">Русский</option>
          <option value="ur">اردو</option>
          <option value="id">Bahasa Indonesia</option>
          <option value="de">Deutsch</option>
        </select>
      </div>
      <div draggable="false" className="mb15">
        This extension manages your NOSTR secret keys. 
      </div>
      <div draggable="false" className="mb15">
        For security, you should refrain from copying any secret key into your clipboard and try to view the raw key as little as possible. 
        Nostr keys cannot be reset, so if your key gets leaked, the nsec is compromised and any connected funds will likely get rugged.
      </div>
      <div draggable="false" className="mb15">
        Always ensure you're using this extension in a secure environment, encrypt all your keys, logout of your User Profile before letting others use this device, and never share your secret keys with anyone.
      </div>
      <div draggable="false" className="mb25">
        <span id='aboutred'>Warning: </span>
        If you delete this extension, all your User Profile keys will be deleted too. So back your keys up!
      </div>
      <div draggable="false" id='aboutcenter'>
        Bugs, Suggestions, or Zaps?
      </div>
      <div id="author" onClick={handleAuthorClick}>
        <span draggable="false">{authorText}</span>
      </div>
      <div draggable="false">
        Want to audit the code?
      </div>
      <a 
        href="https://github.com/dankswoops/NostrKeyring"
        id='repo'
        rel="noopener noreferrer me" 
        target="_blank"
      >
        <span draggable="false">
          Github Repo
        </span>
      </a>
    </div>
  );
};