import React, { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'

const NewsletterForm = ({ t }) => {
  const [email, setEmail] = useState('')
  const [subscribed, setSubscribed] = useState(false)
  const user = useSelector(state => state?.user?.user)

  useEffect(() => {
    if (user?.email) {
      setEmail(user.email)
    }
  }, [user])

  const defaultT = {
    newsletterTitle: 'Subscribe to our newsletter',
    newsletterPlaceholder: 'Enter your email',
    subscribeButton: 'Subscribe',
    subscribedMessage: 'Thank you for subscribing!',
    newsletterSubtitle: 'Get the latest updates on new products and upcoming sales'
  }

  const translations = t || defaultT

  const handleSubmit = (e) => {
    e.preventDefault()
    if (email) {
      setSubscribed(true)
      setTimeout(() => setSubscribed(false), 3000)
    }
  }

  return (
    <div className='w-full'>
      <p className='text-[#a0a0a0] text-sm mb-3'>{translations.newsletterSubtitle}</p>
      <form onSubmit={handleSubmit} className='flex flex-col sm:flex-row gap-3'>
        <input
          type='email'
          placeholder={translations.newsletterPlaceholder}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className='flex-1 px-4 py-3 bg-[#1a1a1a] border border-[#333] text-white text-sm placeholder-[#666] focus:outline-none focus:border-white transition-colors rounded'
          required
        />
        <button
          type='submit'
          className='px-6 py-3 bg-white text-black text-sm font-medium hover:bg-gray-200 transition-colors rounded whitespace-nowrap'
        >
          {translations.subscribeButton}
        </button>
      </form>
      {subscribed && (
        <p className='text-green-500 text-sm mt-2'>{translations.subscribedMessage}</p>
      )}
    </div>
  )
}

export default NewsletterForm
