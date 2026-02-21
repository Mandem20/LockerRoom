import React, { createContext, useContext, useState, useEffect } from 'react'

const CountryContext = createContext()

const countries = [
  { code: 'GH', name: 'Ghana', currency: 'GHS', flag: '🇬🇭', rate: 1 },
  { code: 'NG', name: 'Nigeria', currency: 'NGN', flag: '🇳🇬', rate: 12.5 },
  { code: 'KE', name: 'Kenya', currency: 'KES', flag: '🇰🇪', rate: 18.2 },
  { code: 'ZA', name: 'South Africa', currency: 'ZAR', flag: '🇿🇦', rate: 2.8 },
  { code: 'EG', name: 'Egypt', currency: 'EGP', flag: '🇪🇬', rate: 6.5 },
  { code: 'MA', name: 'Morocco', currency: 'MAD', flag: '🇲🇦', rate: 1.5 },
  { code: 'TZ', name: 'Tanzania', currency: 'TZS', flag: '🇹🇿', rate: 38 },
  { code: 'UG', name: 'Uganda', currency: 'UGX', flag: '🇺🇬', rate: 58 },
  { code: 'CI', name: "Côte d'Ivoire", currency: 'XOF', flag: '🇨🇮', rate: 99 },
  { code: 'SN', name: 'Senegal', currency: 'XOF', flag: '🇸🇳', rate: 99 },
  { code: 'CM', name: 'Cameroon', currency: 'XAF', flag: '🇨🇲', rate: 92 },
  { code: 'ET', name: 'Ethiopia', currency: 'ETB', flag: '🇪🇹', rate: 7.2 },
  { code: 'RW', name: 'Rwanda', currency: 'RWF', flag: '🇷🇼', rate: 180 },
  { code: 'UK', name: 'United Kingdom', currency: 'GBP', flag: '🇬🇧', rate: 0.072 },
  { code: 'US', name: 'United States', currency: 'USD', flag: '🇺🇸', rate: 0.092 },
  { code: 'CA', name: 'Canada', currency: 'CAD', flag: '🇨🇦', rate: 0.13 },
  { code: 'AU', name: 'Australia', currency: 'AUD', flag: '🇦🇺', rate: 0.14 },
]

export const CountryProvider = ({ children }) => {
  const [selectedCountry, setSelectedCountry] = useState(countries[0])

  useEffect(() => {
    const savedCountry = localStorage.getItem('selectedCountry')
    if (savedCountry) {
      const country = countries.find(c => c.code === savedCountry)
      if (country) setSelectedCountry(country)
    }
  }, [])

  const changeCountry = (countryCode) => {
    const country = countries.find(c => c.code === countryCode)
    if (country) {
      setSelectedCountry(country)
      localStorage.setItem('selectedCountry', country.code)
    }
  }

  return (
    <CountryContext.Provider value={{ selectedCountry, changeCountry, countries }}>
      {children}
    </CountryContext.Provider>
  )
}

export const useCountry = () => {
  const context = useContext(CountryContext)
  if (!context) {
    throw new Error('useCountry must be used within a CountryProvider')
  }
  return context
}

export default CountryContext
