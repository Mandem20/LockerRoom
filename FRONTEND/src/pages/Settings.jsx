import React, { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import SummaryApi from '../common'

const Settings = () => {
    const [settings, setSettings] = useState({
        storeName: 'LockerRoom',
        email: 'admin@lockerroom.com',
        currency: 'GHS',
        taxRate: 15,
        freeShippingThreshold: 500,
        shippingCost: 20,
    })
    const [socialLinks, setSocialLinks] = useState([
        { platform: 'facebook', url: '' },
        { platform: 'x', url: '' },
        { platform: 'instagram', url: '' },
        { platform: 'tiktok', url: '' },
        { platform: 'youtube', url: '' },
    ])
    const [loading, setLoading] = useState(false)
    const [savingFooter, setSavingFooter] = useState(false)

    useEffect(() => {
        const fetchFooterSettings = async () => {
            try {
                const response = await fetch(SummaryApi.getFooterSettings.url, {
                    credentials: 'include'
                })
                const data = await response.json()
                if (data.success && data.data?.socialLinks) {
                    const savedLinks = data.data.socialLinks
                    const updatedLinks = socialLinks.map(link => {
                        const saved = savedLinks.find(s => s.platform.toLowerCase() === link.platform.toLowerCase())
                        return saved ? { ...link, url: saved.url } : link
                    })
                    setSocialLinks(updatedLinks)
                }
            } catch (error) {
                console.error('Failed to fetch footer settings:', error)
            }
        }
        fetchFooterSettings()
    }, [])

    const handleChange = (e) => {
        const { name, value } = e.target
        setSettings(prev => ({
            ...prev,
            [name]: name === 'taxRate' || name === 'freeShippingThreshold' || name === 'shippingCost' ? Number(value) : value
        }))
    }

    const handleSocialChange = (index, field, value) => {
        const updated = [...socialLinks]
        updated[index][field] = value
        setSocialLinks(updated)
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        setLoading(true)
        setTimeout(() => {
            toast.success('Settings saved successfully')
            setLoading(false)
        }, 1000)
    }

    const saveSocialLinks = async () => {
        setSavingFooter(true)
        try {
            const response = await fetch(SummaryApi.updateFooterSettings.url, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ socialLinks }),
            })
            const data = await response.json()
            if (data.success) {
                toast.success('Social links saved successfully')
            } else {
                toast.error(data.message || 'Failed to save social links')
            }
        } catch (error) {
            toast.error('Failed to save social links')
        }
        setSavingFooter(false)
    }

    const platformLabels = {
        facebook: 'Facebook',
        x: 'X (Twitter)',
        instagram: 'Instagram',
        tiktok: 'TikTok',
        youtube: 'YouTube',
    }

    return (
        <div className='space-y-6'>
            <div>
                <h1 className='text-2xl font-bold text-gray-800'>Settings</h1>
                <p className='text-gray-500 text-sm mt-1'>Manage your store settings</p>
            </div>

            <div className='bg-white rounded-lg shadow-sm p-6'>
                <form onSubmit={handleSubmit} className='space-y-6'>
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                        <div>
                            <label className='block text-sm font-medium text-gray-700 mb-2'>
                                Store Name
                            </label>
                            <input
                                type='text'
                                name='storeName'
                                value={settings.storeName}
                                onChange={handleChange}
                                className='w-full p-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500'
                            />
                        </div>
                        <div>
                            <label className='block text-sm font-medium text-gray-700 mb-2'>
                                Contact Email
                            </label>
                            <input
                                type='email'
                                name='email'
                                value={settings.email}
                                onChange={handleChange}
                                className='w-full p-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500'
                            />
                        </div>
                        <div>
                            <label className='block text-sm font-medium text-gray-700 mb-2'>
                                Currency
                            </label>
                            <select
                                name='currency'
                                value={settings.currency}
                                onChange={handleChange}
                                className='w-full p-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500'
                            >
                                <option value='GHS'>GHS - Ghana Cedis</option>
                                <option value='USD'>USD - US Dollar</option>
                                <option value='EUR'>EUR - Euro</option>
                                <option value='GBP'>GBP - British Pound</option>
                            </select>
                        </div>
                        <div>
                            <label className='block text-sm font-medium text-gray-700 mb-2'>
                                Tax Rate (%)
                            </label>
                            <input
                                type='number'
                                name='taxRate'
                                value={settings.taxRate}
                                onChange={handleChange}
                                className='w-full p-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500'
                            />
                        </div>
                        <div>
                            <label className='block text-sm font-medium text-gray-700 mb-2'>
                                Free Shipping Threshold (GHS)
                            </label>
                            <input
                                type='number'
                                name='freeShippingThreshold'
                                value={settings.freeShippingThreshold}
                                onChange={handleChange}
                                className='w-full p-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500'
                            />
                        </div>
                        <div>
                            <label className='block text-sm font-medium text-gray-700 mb-2'>
                                Shipping Cost (GHS)
                            </label>
                            <input
                                type='number'
                                name='shippingCost'
                                value={settings.shippingCost}
                                onChange={handleChange}
                                className='w-full p-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500'
                            />
                        </div>
                    </div>

                    <div className='flex justify-end pt-4 border-t'>
                        <button
                            type='submit'
                            disabled={loading}
                            className='px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50'
                        >
                            {loading ? 'Saving...' : 'Save Settings'}
                        </button>
                    </div>
                </form>
            </div>

            <div className='bg-white rounded-lg shadow-sm p-6'>
                <h2 className='text-xl font-bold text-gray-800 mb-4'>Social Media Links</h2>
                <p className='text-gray-500 text-sm mb-4'>Add your social media profile URLs</p>
                
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                    {socialLinks.map((link, index) => (
                        <div key={link.platform}>
                            <label className='block text-sm font-medium text-gray-700 mb-2'>
                                {platformLabels[link.platform]}
                            </label>
                            <input
                                type='url'
                                value={link.url}
                                onChange={(e) => handleSocialChange(index, 'url', e.target.value)}
                                placeholder={`https://${link.platform}.com/yourpage`}
                                className='w-full p-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500'
                            />
                        </div>
                    ))}
                </div>

                <div className='flex justify-end pt-4 border-t mt-6'>
                    <button
                        onClick={saveSocialLinks}
                        disabled={savingFooter}
                        className='px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50'
                    >
                        {savingFooter ? 'Saving...' : 'Save Social Links'}
                    </button>
                </div>
            </div>
        </div>
    )
}

export default Settings
