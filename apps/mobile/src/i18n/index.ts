// UI texts. One JSON file per language; the device language picks one, English is the fallback.
// To add a language: copy locales/en.json, translate it, add it to `resources`.
import { getLocales } from 'expo-localization';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './locales/en.json';
import tr from './locales/tr.json';

const resources = { en: { translation: en }, tr: { translation: tr } } as const;
type Lang = keyof typeof resources;

const device = getLocales()[0]?.languageCode ?? 'en';
const lng: Lang = device in resources ? (device as Lang) : 'en';

void i18n.use(initReactI18next).init({
  resources,
  lng,
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
});

export default i18n;
