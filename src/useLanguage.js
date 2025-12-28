import { useState, useEffect } from 'react';
import { getTranslations, detectLanguage } from './translations';

export const useLanguage = () => {
  const supportedLangs = ['en', 'es', 'de', 'fr', 'pt'];
  
  const [language, setLanguage] = useState(() => {
    const saved = localStorage.getItem('picredux-language');
    if (saved && supportedLangs.includes(saved)) {
      return saved;
    }
    return 'en';
  });
  
  useEffect(() => {
    const saved = localStorage.getItem('picredux-language');
    if (!saved) {
      detectLanguage().then(lang => {
        if (supportedLangs.includes(lang)) {
          setLanguage(lang);
        }
      });
    }
  }, []);

  const [t, setT] = useState(() => getTranslations(language));

  useEffect(() => {
    setT(getTranslations(language));
    localStorage.setItem('picredux-language', language);
  }, [language]);

  const changeLanguage = (lang) => {
    if (supportedLangs.includes(lang)) {
      setLanguage(lang);
    }
  };

  return { language, t, changeLanguage };
};

