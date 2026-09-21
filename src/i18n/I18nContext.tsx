import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations, Language } from './translations';

interface I18nContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: keyof typeof translations.en) => string;
  dir: 'ltr' | 'rtl';
  currency: string;
  setCurrency: (c: string) => void;
  formatCurrency: (amount: number) => string;
}

const I18nContext = createContext<I18nContextType | null>(null);

export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('repairshopos_lang');
    if (saved === 'ar' || saved === 'fr' || saved === 'en') return saved;
    return 'en';
  });

  const [currency, setCurrencyState] = useState<string>(() => {
    return localStorage.getItem('repairshopos_currency') || 'DZD';
  });

  const dir: 'ltr' | 'rtl' = language === 'ar' ? 'rtl' : 'ltr';

  useEffect(() => {
    document.documentElement.dir = dir;
    document.documentElement.lang = language;
    localStorage.setItem('repairshopos_lang', language);
  }, [language, dir]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  const setCurrency = (c: string) => {
    setCurrencyState(c);
    localStorage.setItem('repairshopos_currency', c);
  };

  const t = (key: keyof typeof translations.en): string => {
    const dict = translations[language] || translations.en;
    return (dict as Record<string, string>)[key] || (translations.en as Record<string, string>)[key] || key;
  };

  const formatCurrency = (amount: number): string => {
    const formattedNum = new Intl.NumberFormat(language === 'ar' ? 'ar-DZ' : language === 'fr' ? 'fr-FR' : 'en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount);

    if (language === 'ar' && currency === 'DZD') {
      return `${formattedNum} د.ج`;
    }
    return `${formattedNum} ${currency}`;
  };

  return (
    <I18nContext.Provider
      value={{
        language,
        setLanguage,
        t,
        dir,
        currency,
        setCurrency,
        formatCurrency,
      }}
    >
      <div dir={dir} className="w-full min-h-screen">
        {children}
      </div>
    </I18nContext.Provider>
  );
};

export const useI18n = () => {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
};
