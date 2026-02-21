const countryRates = {
  GH: { currency: 'GHS', rate: 1 },
  NG: { currency: 'NGN', rate: 12.5 },
  KE: { currency: 'KES', rate: 18.2 },
  UK: { currency: 'GBP', rate: 0.072 },
  US: { currency: 'USD', rate: 0.092 },
  CA: { currency: 'CAD', rate: 0.13 },
  AU: { currency: 'AUD', rate: 0.14 },
}

const getCountryConfig = () => {
  if (typeof window === 'undefined') return countryRates.GH
  
  const savedCountry = localStorage.getItem('selectedCountry')
  return countryRates[savedCountry] || countryRates.GH
}

const displayCEDICurrency = (num) => {
  const { currency, rate } = getCountryConfig()
  const convertedAmount = num * rate
  
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
  })
  
  return formatter.format(convertedAmount)
}

export const getCurrentCurrency = () => {
  return getCountryConfig().currency
}

export default displayCEDICurrency
