// src/i18n.js
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import Backend from 'i18next-http-backend'; // To load translations from /public/locales

i18n
  // Load translation using http -> see /public/locales
  // learn more: https://github.com/i18next/i18next-http-backend
  .use(Backend)
  // Detect user language
  // learn more: https://github.com/i18next/i18next-browser-languageDetector
  .use(LanguageDetector)
  // Pass the i18n instance to react-i18next.
  .use(initReactI18next)
  // Init i18next
  // for all options read: https://www.i18next.com/overview/configuration-options
  .init({
    debug: import.meta.env.DEV, // Enable debug messages in development
    fallbackLng: 'en',
    supportedLngs: ['en', 'he'], // Define supported languages
    interpolation: {
      escapeValue: false, // Not needed for react as it escapes by default
    },
    backend: {
      // Path where resources get loaded from
      loadPath: '/locales/{{lng}}/translation.json', 
    },
    detection: {
      // Order and from where user language should be detected
      order: ['localStorage', 'navigator', 'htmlTag', 'path', 'subdomain'],
      // Cache user language selection in localStorage
      caches: ['localStorage'], 
    }
  });

// Function to update HTML direction based on language
i18n.on('languageChanged', (lng) => {
  console.log('Language changed to:', lng);
  if (lng === 'he') {
    document.documentElement.setAttribute('dir', 'rtl');
  } else {
    document.documentElement.setAttribute('dir', 'ltr');
  }
});

export default i18n; 