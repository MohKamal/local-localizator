// i18n.js
import { createContext, useContext, useState, useEffect } from 'react';

const I18nContext = createContext(null);

export const useI18n = () => {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within I18nProvider');
  }
  return context;
};

export function I18nProvider({ children }) {
  const [language, setLanguage] = useState('en');
  const [translations, setTranslations] = useState({});

  useEffect(() => {
    const loadTranslations = async () => {
      try {
        const res = await fetch(`./assets/locales/${language}.json`);
        if (!res.ok) throw new Error(`Failed to load ${language}.json`);
        const data = await res.json();
        setTranslations(data);
      } catch (err) {
        console.error('Translation load error:', err);
        setTranslations({}); // fallback to empty object
      }
    };

    loadTranslations();
  }, [language]);

  const t = (key) => translations[key] || key;

  return (
    <I18nContext.Provider value={{ t, setLanguage, language }}>
      {children}
    </I18nContext.Provider>
  );
}
