import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

interface LanguageContextType {
  language: string;
  isRTL: boolean;
  toggleLanguage: () => void;
  setLanguage: (lang: string) => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const { i18n } = useTranslation();
  const [language, setLanguageState] = useState<string>(i18n.language || 'en');
  const [isRTL, setIsRTL] = useState<boolean>(false);

  useEffect(() => {
    const rtlLanguages = ['ar', 'he', 'fa', 'ur'];
    setIsRTL(rtlLanguages.includes(language));
    
    // Update document direction
    document.documentElement.dir = rtlLanguages.includes(language) ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
    
    // Update body class for RTL styling
    if (rtlLanguages.includes(language)) {
      document.body.classList.add('rtl');
    } else {
      document.body.classList.remove('rtl');
    }
  }, [language]);

  const setLanguage = (lang: string) => {
    setLanguageState(lang);
    i18n.changeLanguage(lang);
    localStorage.setItem('language', lang);
  };

  const toggleLanguage = () => {
    const newLang = language === 'en' ? 'ar' : 'en';
    setLanguage(newLang);
  };

  // Load saved language on mount
  useEffect(() => {
    const savedLanguage = localStorage.getItem('language');
    if (savedLanguage && savedLanguage !== language) {
      setLanguage(savedLanguage);
    }
  }, [language, setLanguage]);

  const value: LanguageContextType = {
    language,
    isRTL,
    toggleLanguage,
    setLanguage,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};
