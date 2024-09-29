import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { setLanguagePreference, getLanguagePreference } from '../utils/storage';

interface AboutProps {
  onBack: () => void;
}

export default function X({ onBack }: AboutProps) {
  const [authorText, setAuthorText] = useState('');
  const { t, i18n } = useTranslation();

  useEffect(() => {
    setAuthorText(t('About7'));
  }, [t]);

  const handleLanguageChange = async (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newLanguage = event.target.value;
    i18n.changeLanguage(newLanguage);
    await setLanguagePreference(newLanguage);
  };

  const handleAuthorClick = () => {
    const npub = 'npub1yrkexvt88h6cgd32gdcfm55auuz6rw6c70xj478gcz6lstz5czvs9s77xh';
    navigator.clipboard.writeText(npub).then(() => {
      setAuthorText(t('About8'));
      setTimeout(() => {
        setAuthorText(t('About7'));
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
        {t('AboutBack')}
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
          <option value="th">ไทย</option>
        </select>
      </div>
      <div draggable="false" className="mb15">
        {t('About1')}
      </div>
      <div draggable="false" className="mb15">
        {t('About2')}
      </div>
      <div draggable="false" className="mb15">
        {t('About3')}
      </div>
      <div draggable="false" className="mb25">
        <span id='aboutred'>{t('About4')}</span>
        {t('About5')}
      </div>
      <div draggable="false" id='aboutcenter'>
        {t('About6')}
      </div>
      <div id="author" onClick={handleAuthorClick}>
        <span draggable="false">{authorText}</span>
      </div>
      <div draggable="false">
        {t('About9')}
      </div>
      <a 
        href="https://github.com/dankswoops/NostrKeyring"
        id='repo'
        rel="noopener noreferrer me" 
        target="_blank"
      >
        <span draggable="false">
          {t('About10')}
        </span>
      </a>
    </div>
  );
};