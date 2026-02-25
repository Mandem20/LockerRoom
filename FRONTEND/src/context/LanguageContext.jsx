import React, { createContext, useContext, useState, useEffect } from 'react'

const LanguageContext = createContext()

export const languages = [
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'pt', name: 'Português', flag: '🇵🇹' },
  { code: 'sw', name: 'Kiswahili', flag: '🇰🇪' },
  { code: 'ha', name: 'Hausa', flag: '🇳🇬' },
  { code: 'yo', name: 'Yorùbá', flag: '🇳🇬' },
  { code: 'ig', name: 'Igbo', flag: '🇳🇬' },
  { code: 'am', name: 'Twi', flag: '🇬🇭' },
  { code: 'ar', name: 'العربية', flag: '🇪🇬' },
  { code: 'zu', name: 'Zulu', flag: '🇿🇦' },
]

export const LanguageProvider = ({ children }) => {
  const [selectedLanguage, setSelectedLanguage] = useState(languages[0])

  useEffect(() => {
    const savedLanguage = localStorage.getItem('selectedLanguage')
    if (savedLanguage) {
      const lang = languages.find(l => l.code === savedLanguage)
      if (lang) setSelectedLanguage(lang)
    }
  }, [])

  const changeLanguage = (languageCode) => {
    const lang = languages.find(l => l.code === languageCode)
    if (lang) {
      setSelectedLanguage(lang)
      localStorage.setItem('selectedLanguage', lang.code)
    }
  }

  return (
    <LanguageContext.Provider value={{ selectedLanguage, changeLanguage, languages }}>
      {children}
    </LanguageContext.Provider>
  )
}

export const useLanguage = () => {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}

export default LanguageContext
