import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from '../locales/en.json';
import zh from '../locales/zh.json';
import hi from '../locales/hi.json';
import es from '../locales/es.json';
import fr from '../locales/fr.json';
import ar from '../locales/ar.json';
import bn from '../locales/bn.json';
import pt from '../locales/pt.json';
import ru from '../locales/ru.json';
import ur from '../locales/ur.json';
import id from '../locales/id.json';
import de from '../locales/de.json';

const resources = {
  en: en,
  zh: zh,
  hi: hi,
  es: es,
  fr: fr,
  ar: ar,
  bn: bn,
  pt: pt,
  ru: ru,
  ur: ur,
  id: id,
  de: de,
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en', // default
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    }
  });

export default i18n;