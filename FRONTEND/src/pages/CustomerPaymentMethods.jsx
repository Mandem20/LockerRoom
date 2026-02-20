import React, { useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { FaPlus, FaTrash, FaCreditCard } from 'react-icons/fa'
import { toast } from 'react-toastify'

const CustomerPaymentMethods = () => {
    const { user } = useOutletContext()
    const [cards, setCards] = useState(user?.paymentMethods || [
        { id: 1, type: 'Visa', last4: '4242', expiry: '12/25', default: true },
    ])
    const [isAdding, setIsAdding] = useState(false)
    const [formData, setFormData] = useState({ number: '', expiry: '', cvv: '', name: '' })

    const handleAdd = () => {
        if (!formData.number || !formData.expiry || !formData.cvv || !formData.name) {
            toast.error('Please fill in all fields')
            return
        }
        const newCard = {
            id: Date.now(),
            type: formData.number.startsWith('4') ? 'Visa' : 'Mastercard',
            last4: formData.number.slice(-4),
            expiry: formData.expiry,
            default: cards.length === 0
        }
        setCards([...cards, newCard])
        setFormData({ number: '', expiry: '', cvv: '', name: '' })
        setIsAdding(false)
        toast.success('Card added')
    }

    const handleDelete = (id) => {
        setCards(cards.filter(c => c.id !== id))
        toast.success('Card removed')
    }

    const handleSetDefault = (id) => {
        setCards(cards.map(c => ({ ...c, default: c.id === id })))
    }

    return (
        <div className='space-y-6'>
            <div>
                <h1 className='text-2xl font-bold text-gray-800'>Payment Methods</h1>
                <p className='text-gray-500 text-sm mt-1'>Manage your payment options</p>
            </div>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                {!isAdding ? (
                    <button
                        onClick={() => setIsAdding(true)}
                        className='bg-white rounded-lg shadow-sm p-6 flex flex-col items-center justify-center text-gray-500 hover:text-red-600 hover:border-red-600 border-2 border-dashed transition-colors'
                    >
                        <FaPlus className='text-2xl mb-2' />
                        <span>Add New Card</span>
                    </button>
                ) : (
                    <div className='bg-white rounded-lg shadow-sm p-6'>
                        <h2 className='text-lg font-semibold mb-4'>Add New Card</h2>
                        <div className='space-y-3'>
                            <input
                                type='text'
                                placeholder='Card number'
                                value={formData.number}
                                onChange={(e) => setFormData({ ...formData, number: e.target.value.replace(/\D/g, '').slice(0, 16) })}
                                className='w-full p-2 border rounded-lg'
                            />
                            <input
                                type='text'
                                placeholder='MM/YY'
                                value={formData.expiry}
                                onChange={(e) => setFormData({ ...formData, expiry: e.target.value })}
                                className='w-full p-2 border rounded-lg'
                            />
                            <input
                                type='text'
                                placeholder='CVV'
                                value={formData.cvv}
                                onChange={(e) => setFormData({ ...formData, cvv: e.target.value.replace(/\D/g, '').slice(0, 3) })}
                                className='w-full p-2 border rounded-lg'
                            />
                            <input
                                type='text'
                                placeholder='Name on card'
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className='w-full p-2 border rounded-lg'
                            />
                            <div className='flex gap-2'>
                                <button
                                    onClick={handleAdd}
                                    className='flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700'
                                >
                                    Add Card
                                </button>
                                <button
                                    onClick={() => setIsAdding(false)}
                                    className='px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300'
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {cards.map((card) => (
                    <div key={card.id} className='bg-white rounded-lg shadow-sm p-4 relative'>
                        {card.default && (
                            <span className='absolute top-2 right-2 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full'>
                                Default
                            </span>
                        )}
                        <div className='flex items-center gap-3 mb-3'>
                            <FaCreditCard className='text-2xl text-gray-600' />
                            <div>
                                <p className='font-semibold text-gray-800'>{card.type} •••• {card.last4}</p>
                                <p className='text-xs text-gray-500'>Expires {card.expiry}</p>
                            </div>
                        </div>
                        <div className='flex items-center gap-2'>
                            {!card.default && (
                                <button
                                    onClick={() => handleSetDefault(card.id)}
                                    className='text-xs text-blue-600 hover:underline'
                                >
                                    Set as default
                                </button>
                            )}
                            <button
                                onClick={() => handleDelete(card.id)}
                                className='text-xs text-red-600 hover:underline flex items-center gap-1'
                            >
                                <FaTrash /> Remove
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default CustomerPaymentMethods
