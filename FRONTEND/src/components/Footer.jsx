import React, { useState, useEffect } from 'react'
import SummaryApi from '../common'
import FooterSections from './Footer/FooterSections'
import NewsletterForm from './Footer/NewsletterForm'
import SocialIcons from './Footer/SocialIcons'
import PaymentIcons from './Footer/PaymentIcons'
import { useCountry } from '../context/CountryContext'
import Logo from './Logo'

const countries = [
  { code: 'GH', name: 'Ghana', currency: 'GHS', flag: '🇬🇭' },
  { code: 'NG', name: 'Nigeria', currency: 'NGN', flag: '🇳🇬' },
  { code: 'KE', name: 'Kenya', currency: 'KES', flag: '🇰🇪' },
  { code: 'ZA', name: 'South Africa', currency: 'ZAR', flag: '🇿🇦' },
  { code: 'EG', name: 'Egypt', currency: 'EGP', flag: '🇪🇬' },
  { code: 'MA', name: 'Morocco', currency: 'MAD', flag: '🇲🇦' },
  { code: 'TZ', name: 'Tanzania', currency: 'TZS', flag: '🇹🇿' },
  { code: 'UG', name: 'Uganda', currency: 'UGX', flag: '🇺🇬' },
  { code: 'CI', name: "Côte d'Ivoire", currency: 'XOF', flag: '🇨🇮' },
  { code: 'SN', name: 'Senegal', currency: 'XOF', flag: '🇸🇳' },
  { code: 'CM', name: 'Cameroon', currency: 'XAF', flag: '🇨🇲' },
  { code: 'ET', name: 'Ethiopia', currency: 'ETB', flag: '🇪🇹' },
  { code: 'RW', name: 'Rwanda', currency: 'RWF', flag: '🇷🇼' },
  { code: 'UK', name: 'United Kingdom', currency: 'GBP', flag: '🇬🇧' },
  { code: 'US', name: 'United States', currency: 'USD', flag: '🇺🇸' },
  { code: 'CA', name: 'Canada', currency: 'CAD', flag: '🇨🇦' },
  { code: 'AU', name: 'Australia', currency: 'AUD', flag: '🇦🇺' },
]

const languages = [
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

const translations = {
  en: {
    selectCountry: 'Select Country',
    selectLanguage: 'Select Language',
    newsletterTitle: 'Subscribe to our newsletter',
    newsletterPlaceholder: 'Enter your email',
    subscribeButton: 'Subscribe',
    weAccept: 'We Accept',
    mobileMoney: 'Mobile Money',
    copyright: 'All rights reserved.',
  },
  fr: {
    selectCountry: 'Sélectionner le pays',
    selectLanguage: 'Sélectionner la langue',
    newsletterTitle: 'Abonnez-vous à notre newsletter',
    newsletterPlaceholder: 'Entrez votre email',
    subscribeButton: "S'abonner",
    weAccept: 'Nous acceptons',
    mobileMoney: 'Mobile Money',
    copyright: 'Tous droits réservés.',
  },
  es: {
    selectCountry: 'Seleccionar país',
    selectLanguage: 'Seleccionar idioma',
    newsletterTitle: 'Suscríbete a nuestro boletín',
    newsletterPlaceholder: 'Ingresa tu email',
    subscribeButton: 'Suscribirse',
    weAccept: 'Aceptamos',
    mobileMoney: 'Dinero móvil',
    copyright: 'Todos los derechos reservados.',
  },
  de: {
    selectCountry: 'Land auswählen',
    selectLanguage: 'Sprache auswählen',
    newsletterTitle: 'Newsletter abonnieren',
    newsletterPlaceholder: 'E-Mail eingeben',
    subscribeButton: 'Abonnieren',
    weAccept: 'Wir akzeptieren',
    mobileMoney: 'Mobile Money',
    copyright: 'Alle Rechte vorbehalten.',
  },
  pt: {
    selectCountry: 'Selecionar país',
    selectLanguage: 'Selecionar idioma',
    newsletterTitle: 'Assine nossa newsletter',
    newsletterPlaceholder: 'Digite seu email',
    subscribeButton: 'Assinar',
    weAccept: 'Aceitamos',
    mobileMoney: 'Dinheiro móvel',
    copyright: 'Todos os direitos reservados.',
  },
  sw: {
    selectCountry: 'Chagua Nchi',
    selectLanguage: 'Chagua Lugha',
    newsletterTitle: 'Jisajili kwa jarida yetu',
    newsletterPlaceholder: 'Ingiza barua pepe yako',
    subscribeButton: 'Jisajili',
    weAccept: 'Tunakubali',
    mobileMoney: 'Malipo ya Simu',
    copyright: 'Haki zote zimehifadhiwa.',
  },
  ha: {
    selectCountry: 'Zaɓi Ƙasa',
    selectLanguage: 'Zaɓi Harshe',
    newsletterTitle: 'Shiga cikin buletocinmu',
    newsletterPlaceholder: 'Shigar da imel ɗin ka',
    subscribeButton: 'Shiga',
    weAccept: 'Muna amincewa',
    mobileMoney: 'Kuɗin Wayar Salula',
    copyright: 'Daidaitattun duk haƙƙoɗin.',
  },
  yo: {
    selectCountry: 'Yan Orile-ede',
    selectLanguage: 'Yan Ede',
    newsletterTitle: 'Fọwọsi si tiẹti ṣẹ́ẹ̀rẹ̀ wa',
    newsletterPlaceholder: 'Fọwọsi imeeli rẹ',
    subscribeButton: 'Fọwọsi',
    weAccept: 'A gba',
    mobileMoney: 'Owo Phone',
    copyright: 'Gbogbo ẹtọ́ ni a fi pamọ́.',
  },
  ig: {
    selectCountry: 'Họrụ Mba',
    selectLanguage: 'Họrụ Asụsụ',
    newsletterTitle: 'Debanye aha na akwukwo anyị',
    newsletterPlaceholder: 'Tinye email gị',
    subscribeButton: 'Debanye aha',
    weAccept: 'Anyị na-akwado',
    mobileMoney: 'Ego Phone',
    copyright: 'Njikọ ni nile echebi.',
  },
  am: {
    selectCountry: 'Hyea Mfon',
    selectLanguage: 'Hyea kasa',
    newsletterTitle: 'Wɔ newsletter yi mu',
    newsletterPlaceholder: 'Wɔ email wo ho',
    subscribeButton: 'Wɔ mu',
    weAccept: 'Yɛpɛ',
    mobileMoney: 'Mobile Money',
    copyright: 'Ahaban nnim no nyinaa wɔ hɔ.',
  },
  ar: {
    selectCountry: 'اختر الدولة',
    selectLanguage: 'اختر اللغة',
    newsletterTitle: 'اشترك في النشرة الإخبارية',
    newsletterPlaceholder: 'أدخل بريدك الإلكتروني',
    subscribeButton: 'اشترك',
    weAccept: 'نقبل',
    mobileMoney: 'المال المحمول',
    copyright: 'جميع الحقوق محفوظة.',
  },
  zu: {
    selectCountry: 'Khetha Izwe',
    selectLanguage: 'Khetha Ulimi',
    newsletterTitle: 'Bhalisela kwinqolofo yethu',
    newsletterPlaceholder: 'Faka i-imeyili yakho',
    subscribeButton: 'Bhalisela',
    weAccept: 'Sivumelana',
    mobileMoney: 'Imali yeselula',
    copyright: 'Zonke izinqumo ziqoshiwe.',
  },
}

const trackClick = (category, action, label) => {
  if (typeof window !== 'undefined') {
    window.dataLayer = window.dataLayer || []
    window.dataLayer.push({
      event: 'footer_click',
      category: category,
      action: action,
      label: label,
      timestamp: new Date().toISOString()
    })
    console.log('Analytics:', { category, action, label })
  }
}

const Footer = () => {
  const [settings, setSettings] = useState(null)
  const [sections, setSections] = useState([])
  const [links, setLinks] = useState([])
  const { selectedCountry, changeCountry, countries: countryList } = useCountry()
  const [selectedLanguage, setSelectedLanguage] = useState(languages[0])

  useEffect(() => {
    const savedLanguage = localStorage.getItem('selectedLanguage')
    if (savedLanguage) {
      const lang = languages.find(l => l.code === savedLanguage)
      if (lang) setSelectedLanguage(lang)
    }
  }, [])

  const handleCountryChange = (e) => {
    const country = countryList.find(c => c.code === e.target.value)
    if (country) {
      changeCountry(country.code)
      trackClick('footer', 'change_country', country.code)
    }
  }

  const handleLanguageChange = (e) => {
    const lang = languages.find(l => l.code === e.target.value)
    if (lang) {
      setSelectedLanguage(lang)
      localStorage.setItem('selectedLanguage', lang.code)
      trackClick('footer', 'change_language', lang.code)
    }
  }

  const t = translations[selectedLanguage.code] || translations.en

  useEffect(() => {
    const fetchFooterData = async () => {
      try {
        const [settingsRes, sectionsRes, linksRes] = await Promise.all([
          fetch(SummaryApi.getFooterSettings.url),
          fetch(SummaryApi.getFooterSections.url),
          fetch(SummaryApi.getFooterLinks.url)
        ])

        const settingsData = await settingsRes.json()
        const sectionsData = await sectionsRes.json()
        const linksData = await linksRes.json()

        if (settingsData.success) setSettings(settingsData.data)
        if (sectionsData.success) setSections(sectionsData.data)
        if (linksData.success) setLinks(linksData.data)
      } catch (error) {
        console.error('Failed to fetch footer data:', error)
      }
    }

    fetchFooterData()
  }, [])

  const handleLinkClick = (linkLabel) => {
    trackClick('footer_link', 'click', linkLabel)
  }

  return (
    <footer className='bg-[#0f0f0f] text-white font-sans'>
      <div className='container mx-auto px-4 py-12'>
        <div className='grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-8'>
          <div className='col-span-2 md:col-span-1 lg:col-span-1'>
            {settings?.logo ? (
              <img src={settings.logo} alt="Logo" className="h-16 mb-4" loading="lazy" />
            ) : (
              <div className='mb-4'>
                <Logo w={64} h={64} />
              </div>
            )}
            <p className='text-[#a0a0a0] text-sm leading-relaxed mb-4 font-normal'>
              {settings?.description || 'Your No.1 AUTHENTIC, REPLICA & CUSTOMIZE Online Sportswear store'}
            </p>
            {settings?.email && (
              <p className='text-[#a0a0a0] text-sm mb-1 font-normal'>Email: {settings.email}</p>
            )}
            {settings?.phone && (
              <p className='text-[#a0a0a0] text-sm mb-1 font-normal'>Phone: {settings.phone}</p>
            )}
            {settings?.address && (
              <p className='text-[#a0a0a0] text-sm font-normal'>{settings.address}</p>
            )}
            
            <div className='mt-6'>
              <NewsletterForm t={t} />
            </div>
          </div>

          <FooterSections sections={sections} links={links} onLinkClick={handleLinkClick} />
        </div>

        <div className='mt-10 pt-8 border-t border-[#2a2a2a]'>
          <div className='flex flex-col md:flex-row justify-between items-center gap-6'>
            <div className='flex flex-wrap items-center gap-6'>
              <div className='flex items-center gap-3'>
                <label className='text-[#a0a0a0] text-xs font-light uppercase tracking-wider'>{t.selectCountry}</label>
                <div className='flex items-center'>
                  <span className='mr-2 text-base'>{selectedCountry.flag}</span>
                  <select
                    value={selectedCountry.code}
                    onChange={handleCountryChange}
                    className='bg-transparent text-white text-sm py-1 pr-8 border-b border-[#333] focus:outline-none focus:border-white transition-colors cursor-pointer font-light'
                  >
                    {countryList.map((country) => (
                      <option key={country.code} value={country.code} className='bg-[#0f0f0f]'>
                        {country.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className='flex items-center gap-3'>
                <label className='text-[#a0a0a0] text-xs font-light uppercase tracking-wider'>{t.selectLanguage}</label>
                <div className='flex items-center'>
                  <span className='mr-2 text-base'>{selectedLanguage.flag}</span>
                  <select
                    value={selectedLanguage.code}
                    onChange={handleLanguageChange}
                    className='bg-transparent text-white text-sm py-1 pr-8 border-b border-[#333] focus:outline-none focus:border-white transition-colors cursor-pointer font-light'
                  >
                    {languages.map((lang) => (
                      <option key={lang.code} value={lang.code} className='bg-[#0f0f0f]'>
                        {lang.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <SocialIcons socialLinks={settings?.socialLinks} />
          </div>
        </div>

        <div className='mt-6 pt-6 border-t border-[#2a2a2a] flex flex-col md:flex-row justify-between items-center gap-4'>
          <PaymentIcons t={t} />
          <p className='text-[#a0a0a0] text-sm font-light'>
            {settings?.copyrightText || `© ${new Date().getFullYear()} LockerRoom.com. ${t.copyright}`}
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
