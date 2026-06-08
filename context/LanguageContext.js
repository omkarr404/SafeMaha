// FILE NAME: d:\Omkar\Water\FDA\context\LanguageContext.js

import React, { createContext, useState, useContext } from 'react';
import { translations } from '../utils/translations';

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [locale, setLocale] = useState('en'); // Default to English

  /**
   * Translate a key path into the active locale text.
   * Supports nested paths (e.g. 'home.cards.fileComplaint.title')
   * Supports placeholder replacing (e.g. t('form.successAlertMsg', { name: 'Omkar' }))
   * 
   * @param {string} keyPath Dot-separated translation key path
   * @param {object} params Object containing replacement variables for placeholder replacing
   * @returns {string} Translated string or keyPath if not found
   */
  const t = (keyPath, params = {}) => {
    const keys = keyPath.split('.');
    let result = translations[locale];

    // Traverse the active locale translation dictionary
    for (const key of keys) {
      if (result && result[key] !== undefined) {
        result = result[key];
      } else {
        // Fallback path: search in English translation
        let fallbackResult = translations['en'];
        let foundFallback = true;
        for (const fk of keys) {
          if (fallbackResult && fallbackResult[fk] !== undefined) {
            fallbackResult = fallbackResult[fk];
          } else {
            foundFallback = false;
            break;
          }
        }
        result = foundFallback ? fallbackResult : keyPath;
        break;
      }
    }

    // Replace parameter placeholders if result is a string
    if (typeof result === 'string') {
      let formatted = result;
      Object.keys(params).forEach((param) => {
        formatted = formatted.replace(`{${param}}`, params[param]);
      });
      return formatted;
    }

    return result;
  };

  return (
    <LanguageContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
