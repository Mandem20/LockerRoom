import { useLanguage } from '../context/LanguageContext'
import translations from '../helpers/translations'

export const useTranslation = () => {
  const { selectedLanguage } = useLanguage()
  
  const t = (key) => {
    const langTranslations = translations[selectedLanguage.code] || translations.en
    return langTranslations[key] || key
  }
  
  return { t, selectedLanguage }
}

export default useTranslation
