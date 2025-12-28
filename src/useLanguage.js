import { useState, useEffect } from 'react';
import { getTranslations, detectLanguage, supportedLanguages } from './translations';

/**
 * Hook pour gérer la langue de l'application
 * Détecte automatiquement la langue du système et permet de la changer manuellement
 */
export const useLanguage = () => {
  const supportedLangs = ['en', 'es', 'de', 'fr', 'pt'];
  
  const [language, setLanguage] = useState(() => {
    // Récupérer la langue sauvegardée dans localStorage, sinon détecter
    const saved = localStorage.getItem('picredux-language');
    if (saved && supportedLangs.includes(saved)) {
      return saved;
    }
    // Détection synchrone par défaut (en), sera mise à jour si async disponible
    return 'en';
  });
  
  // Détecter la langue au montage si pas de sauvegarde
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

  // Mettre à jour les traductions quand la langue change
  useEffect(() => {
    setT(getTranslations(language));
    localStorage.setItem('picredux-language', language);
  }, [language]);

  // Fonction pour changer la langue
  const changeLanguage = (lang) => {
    if (supportedLangs.includes(lang)) {
      setLanguage(lang);
    }
  };

  return { language, t, changeLanguage };
};

