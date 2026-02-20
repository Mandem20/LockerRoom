import React, { useState, useEffect } from 'react'
import { useOutletContext } from 'react-router-dom'
import SummaryApi from '../common'
import { FaPlus, FaTrash, FaEdit, FaSave, FaTimes, FaMapMarkerAlt } from 'react-icons/fa'
import { toast } from 'react-toastify'

const CustomerAddresses = () => {
    const { user } = useOutletContext()
    const [addresses, setAddresses] = useState([])
    const [isEditing, setIsEditing] = useState(null)
    const [isAdding, setIsAdding] = useState(false)
    const [formData, setFormData] = useState({ label: '', address: '', city: '', region: '', phone: '', additionalPhone: '', gpsAddress: '' })
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        fetchAddresses()
    }, [user])

    const fetchAddresses = async () => {
        if (user?.addresses && user.addresses.length > 0) {
            setAddresses(user.addresses)
        } else {
            try {
                const response = await fetch(SummaryApi.current_user.url, {
                    credentials: 'include'
                })
                const data = await response.json()
                if (data.success && data.data?.addresses) {
                    setAddresses(data.data.addresses)
                }
            } catch (error) {
                console.error('Error fetching addresses:', error)
            }
        }
    }

    const saveToBackend = async (newAddresses) => {
        try {
            const response = await fetch(SummaryApi.updateMyAddress.url, {
                method: SummaryApi.updateMyAddress.method,
                credentials: 'include',
                headers: { 'content-type': 'application/json' },
                body: JSON.stringify({ addresses: newAddresses })
            })
            const data = await response.json()
            if (data.success) {
                return true
            }
            return false
        } catch (error) {
            console.error('Error saving addresses:', error)
            return false
        }
    }

    const handleAdd = async () => {
        if (!formData.label || !formData.address) {
            toast.error('Please fill in label and address')
            return
        }
        
        setLoading(true)
        const newAddress = {
            id: Date.now().toString(),
            label: formData.label,
            address: formData.address,
            city: formData.city,
            region: formData.region,
            phone: formData.phone,
            additionalPhone: formData.additionalPhone || '',
            gpsAddress: formData.gpsAddress || '',
            default: addresses.length === 0
        }
        
        const newAddresses = [...addresses, newAddress]
        const success = await saveToBackend(newAddresses)
        
        if (success) {
            setAddresses(newAddresses)
            setFormData({ label: '', address: '', city: '', region: '', phone: '', additionalPhone: '', gpsAddress: '' })
            setIsAdding(false)
            toast.success('Address added')
        } else {
            toast.error('Failed to add address')
        }
        setLoading(false)
    }

    const handleEdit = (addr) => {
        setIsEditing(addr.id)
        setFormData({
            label: addr.label,
            address: addr.address,
            city: addr.city || '',
            region: addr.region || '',
            phone: addr.phone || '',
            additionalPhone: addr.additionalPhone || '',
            gpsAddress: addr.gpsAddress || ''
        })
    }

    const handleUpdate = async () => {
        if (!formData.label || !formData.address) {
            toast.error('Please fill in label and address')
            return
        }
        
        setLoading(true)
        const newAddresses = addresses.map(a => 
            a.id === isEditing 
                ? { ...a, label: formData.label, address: formData.address, city: formData.city, region: formData.region, phone: formData.phone, additionalPhone: formData.additionalPhone || '', gpsAddress: formData.gpsAddress || '' }
                : a
        )
        
        const success = await saveToBackend(newAddresses)
        
        if (success) {
            setAddresses(newAddresses)
            setIsEditing(null)
            setFormData({ label: '', address: '', city: '', region: '', phone: '', additionalPhone: '', gpsAddress: '' })
            toast.success('Address updated')
        } else {
            toast.error('Failed to update address')
        }
        setLoading(false)
    }

    const handleDelete = async (id) => {
        setLoading(true)
        const newAddresses = addresses.filter(a => a.id !== id)
        
        const success = await saveToBackend(newAddresses)
        
        if (success) {
            setAddresses(newAddresses)
            toast.success('Address removed')
        } else {
            toast.error('Failed to remove address')
        }
        setLoading(false)
    }

    const handleSetDefault = async (id) => {
        setLoading(true)
        const newAddresses = addresses.map(a => ({ ...a, default: a.id === id }))
        
        const success = await saveToBackend(newAddresses)
        
        if (success) {
            setAddresses(newAddresses)
            toast.success('Default address updated')
        }
        setLoading(false)
    }

    const handleCancel = () => {
        setIsEditing(null)
        setIsAdding(false)
        setFormData({ label: '', address: '', city: '', region: '', phone: '', additionalPhone: '', gpsAddress: '' })
    }

    return (
        <div className='space-y-6'>
            <div>
                <h1 className='text-2xl font-bold text-gray-800'>My Addresses</h1>
                <p className='text-gray-500 text-sm mt-1'>Manage your delivery addresses</p>
            </div>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                <div className='bg-white rounded-lg shadow-sm p-6'>
                    <h2 className='text-lg font-semibold mb-4 flex items-center gap-2'>
                        <FaMapMarkerAlt className='text-red-600' />
                        {isEditing ? 'Edit Address' : isAdding ? 'Add New Address' : 'Add New Address'}
                    </h2>
                    
                    {(isAdding || isEditing) ? (
                        <div className='space-y-3'>
                            <div>
                                <label className='block text-sm text-gray-600 mb-1'>Label *</label>
                                <input
                                    type='text'
                                    placeholder='Home, Office, Work'
                                    value={formData.label}
                                    onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                                    className='w-full p-3 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500'
                                />
                            </div>
                            <div>
                                <label className='block text-sm text-gray-600 mb-1'>Address *</label>
                                <textarea
                                    placeholder='Street address, P.O. box'
                                    value={formData.address}
                                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                    className='w-full p-3 border rounded-lg h-20 resize-none focus:ring-2 focus:ring-red-500 focus:border-red-500'
                                />
                            </div>
                            <div className='grid grid-cols-2 gap-3'>
                                <div>
                                    <label className='block text-sm text-gray-600 mb-1'>City</label>
                                    <input
                                        type='text'
                                        placeholder='City'
                                        value={formData.city}
                                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                        className='w-full p-3 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500'
                                    />
                                </div>
                                <div>
                                    <label className='block text-sm text-gray-600 mb-1'>Region</label>
                                    <input
                                        type='text'
                                        placeholder='Region'
                                        value={formData.region}
                                        onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                                        className='w-full p-3 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500'
                                    />
                                </div>
                            </div>
                            <div>
                                <label className='block text-sm text-gray-600 mb-1'>Primary Phone</label>
                                <input
                                    type='tel'
                                    placeholder='+233 50 123 4567'
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    className='w-full p-3 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500'
                                />
                            </div>
                            <div>
                                <label className='block text-sm text-gray-600 mb-1'>Additional Phone (Optional)</label>
                                <input
                                    type='tel'
                                    placeholder='+233 55 123 4567'
                                    value={formData.additionalPhone || ''}
                                    onChange={(e) => setFormData({ ...formData, additionalPhone: e.target.value })}
                                    className='w-full p-3 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500'
                                />
                            </div>
                            <div>
                                <label className='block text-sm text-gray-600 mb-1'>GPS Address (Optional)</label>
                                <input
                                    type='text'
                                    placeholder='e.g. GPS-123-4567'
                                    value={formData.gpsAddress || ''}
                                    onChange={(e) => setFormData({ ...formData, gpsAddress: e.target.value })}
                                    className='w-full p-3 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500'
                                />
                            </div>
                            <div className='flex gap-2 pt-2'>
                                <button
                                    onClick={isEditing ? handleUpdate : handleAdd}
                                    disabled={loading}
                                    className='flex-1 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center justify-center gap-2 disabled:opacity-50'
                                >
                                    <FaSave /> {loading ? 'Saving...' : 'Save'}
                                </button>
                                <button
                                    onClick={handleCancel}
                                    disabled={loading}
                                    className='px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center gap-2'
                                >
                                    <FaTimes /> Cancel
                                </button>
                            </div>
                        </div>
                    ) : (
                        <button
                            onClick={() => setIsAdding(true)}
                            className='w-full px-4 py-3 border-2 border-dashed border-red-300 text-red-600 rounded-lg hover:bg-red-50 flex items-center justify-center gap-2'
                        >
                            <FaPlus /> Add New Address
                        </button>
                    )}
                </div>

                <div className='space-y-4'>
                    {addresses.length === 0 ? (
                        <div className='bg-white rounded-lg shadow-sm p-8 text-center'>
                            <FaMapMarkerAlt className='text-4xl text-gray-300 mx-auto mb-3' />
                            <p className='text-gray-500'>No addresses saved yet</p>
                        </div>
                    ) : (
                        addresses.map((addr) => (
                            <div key={addr.id} className='bg-white rounded-lg shadow-sm p-4 relative'>
                                {addr.default && (
                                    <span className='absolute top-2 right-2 px-3 py-1 bg-green-100 text-green-800 text-xs rounded-full font-medium'>
                                        Default Shipping
                                    </span>
                                )}
                                <h3 className='font-semibold text-gray-800'>{addr.label}</h3>
                                <p className='text-gray-500 text-sm mt-1'>{addr.address}</p>
                                {addr.city && <p className='text-gray-500 text-sm'>{addr.city}{addr.region && `, ${addr.region}`}</p>}
                                {addr.phone && <p className='text-gray-500 text-sm'>Phone: {addr.phone}</p>}
                                {addr.additionalPhone && <p className='text-gray-500 text-sm'>Alt: {addr.additionalPhone}</p>}
                                {addr.gpsAddress && <p className='text-gray-500 text-sm'>GPS: {addr.gpsAddress}</p>}
                                <div className='flex items-center gap-3 mt-3'>
                                    <button
                                        onClick={() => handleEdit(addr)}
                                        className='text-xs text-blue-600 hover:underline flex items-center gap-1'
                                    >
                                        <FaEdit /> Edit
                                    </button>
                                    {!addr.default && (
                                        <button
                                            onClick={() => handleSetDefault(addr.id)}
                                            className='text-xs text-green-600 hover:underline'
                                        >
                                            Set as default
                                        </button>
                                    )}
                                    <button
                                        onClick={() => handleDelete(addr.id)}
                                        className='text-xs text-red-600 hover:underline flex items-center gap-1'
                                    >
                                        <FaTrash /> Delete
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    )
}

export default CustomerAddresses
