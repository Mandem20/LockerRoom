import React, { useState } from 'react'
import { toast } from 'react-toastify'

const Settings = () => {
    const [settings, setSettings] = useState({
        storeName: 'LockerRoom',
        email: 'admin@lockerroom.com',
        currency: 'GHS',
        taxRate: 15,
        freeShippingThreshold: 500,
        shippingCost: 20,
    })
    const [loading, setLoading] = useState(false)

    const handleChange = (e) => {
        const { name, value } = e.target
        setSettings(prev => ({
            ...prev,
            [name]: name === 'taxRate' || name === 'freeShippingThreshold' || name === 'shippingCost' ? Number(value) : value
        }))
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        setLoading(true)
        setTimeout(() => {
            toast.success('Settings saved successfully')
            setLoading(false)
        }, 1000)
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
        </div>
    )
}

export default Settings
