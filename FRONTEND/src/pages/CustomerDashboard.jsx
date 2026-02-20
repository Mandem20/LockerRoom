import React, { useEffect, useState } from 'react'
import SummaryApi from '../common'
import { toast } from 'react-toastify'
import { useNavigate } from 'react-router-dom'
import { FaBox, FaHeart, FaUser, FaShoppingCart, FaMapMarkerAlt, FaCreditCard, FaClock, FaCheckCircle, FaShippingFast, FaArrowRight } from 'react-icons/fa'

const CustomerDashboard = () => {
    const navigate = useNavigate()
    const [user, setUser] = useState(null)
    const [orders, setOrders] = useState([])
    const [wishlist, setWishlist] = useState([])
    const [loading, setLoading] = useState(true)
    const [activeTab, setActiveTab] = useState('overview')

    useEffect(() => {
        fetchUserData()
        fetchUserOrders()
        fetchWishlist()
    }, [])

    const fetchUserData = async () => {
        try {
            const response = await fetch(SummaryApi.current_user.url, {
                credentials: 'include'
            })
            const data = await response.json()
            if (data.success) {
                setUser(data.data)
            }
        } catch (error) {
            console.error('Error fetching user:', error)
        }
    }

    const fetchUserOrders = async () => {
        try {
            const response = await fetch(SummaryApi.allOrders.url, {
                credentials: 'include'
            })
            const data = await response.json()
            if (data.success) {
                setOrders(data.data || [])
            }
        } catch (error) {
            console.error('Error fetching orders:', error)
        }
    }

    const fetchWishlist = async () => {
        try {
            const response = await fetch(SummaryApi.getWishlist.url, {
                credentials: 'include'
            })
            const data = await response.json()
            if (data.success) {
                setWishlist(data.data || [])
            }
        } catch (error) {
            console.error('Error fetching wishlist:', error)
        } finally {
            setLoading(false)
        }
    }

    const getStatusColor = (status) => {
        const colors = {
            'Pending': 'bg-yellow-100 text-yellow-800',
            'Processing': 'bg-blue-100 text-blue-800',
            'Shipped': 'bg-purple-100 text-purple-800',
            'Delivered': 'bg-green-100 text-green-800',
            'Cancelled': 'bg-red-100 text-red-800'
        }
        return colors[status] || 'bg-gray-100 text-gray-800'
    }

    const getPaymentStatusColor = (status) => {
        const colors = {
            'Paid': 'bg-green-100 text-green-800',
            'Unpaid': 'bg-red-100 text-red-800',
            'Pending': 'bg-yellow-100 text-yellow-800'
        }
        return colors[status] || 'bg-gray-100 text-gray-800'
    }

    const StatCard = ({ icon: Icon, label, value, color }) => (
        <div className='bg-white rounded-lg shadow-sm p-6 flex items-center gap-4'>
            <div className={`p-3 rounded-full ${color}`}>
                <Icon className='text-xl text-white' />
            </div>
            <div>
                <p className='text-sm text-gray-500'>{label}</p>
                <p className='text-2xl font-bold text-gray-800'>{value}</p>
            </div>
        </div>
    )

    const OrderCard = ({ order }) => (
        <div className='bg-white rounded-lg shadow-sm p-4 mb-4'>
            <div className='flex flex-col md:flex-row md:items-center justify-between gap-4 mb-3'>
                <div>
                    <p className='font-semibold text-gray-800'>Order #{order._id?.slice(-8)}</p>
                    <p className='text-sm text-gray-500 flex items-center gap-2'>
                        <FaClock className='text-xs' />
                        {new Date(order.createdAt).toLocaleDateString('en-US', { 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                        })}
                    </p>
                </div>
                <div className='flex items-center gap-2'>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPaymentStatusColor(order.payment_status)}`}>
                        {order.payment_status}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.order_status)}`}>
                        {order.order_status}
                    </span>
                </div>
            </div>
            <div className='flex items-center justify-between border-t pt-3'>
                <div className='flex items-center gap-3'>
                    {order.product_details?.productImage?.[0] && (
                        <img 
                            src={order.product_details.productImage[0]} 
                            alt={order.product_details.name}
                            className='w-12 h-12 object-cover rounded'
                        />
                    )}
                    <div>
                        <p className='text-sm font-medium text-gray-800'>{order.product_details?.name}</p>
                        <p className='text-xs text-gray-500'>Qty: {order.quantity}</p>
                    </div>
                </div>
                <div className='text-right'>
                    <p className='font-bold text-gray-800'>GHS {order.totalAmt?.toFixed(2)}</p>
                </div>
            </div>
        </div>
    )

    if (loading) {
        return (
            <div className='flex items-center justify-center h-64'>
                <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-red-600'></div>
            </div>
        )
    }

    return (
        <div className='space-y-6'>
            <div className='bg-gradient-to-r from-red-600 to-red-700 rounded-lg shadow-lg p-6 text-white'>
                <div className='flex items-center gap-4'>
                    {user?.profilePic ? (
                        <img 
                            src={user.profilePic} 
                            alt={user.name}
                            className='w-16 h-16 rounded-full object-cover border-2 border-white'
                        />
                    ) : (
                        <div className='w-16 h-16 rounded-full bg-white/20 flex items-center justify-center border-2 border-white'>
                            <span className='text-2xl font-bold'>{user?.name?.charAt(0)?.toUpperCase() || 'U'}</span>
                        </div>
                    )}
                    <div>
                        <h1 className='text-2xl font-bold'>Welcome back, {user?.name?.split(' ')[0]}!</h1>
                        <p className='text-red-100'>{user?.email}</p>
                    </div>
                </div>
            </div>

            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
                <StatCard 
                    icon={FaBox} 
                    label='Total Orders' 
                    value={orders.length} 
                    color='bg-blue-500' 
                />
                <StatCard 
                    icon={FaHeart} 
                    label='Wishlist Items' 
                    value={wishlist.length} 
                    color='bg-red-500' 
                />
                <StatCard 
                    icon={FaCheckCircle} 
                    label='Delivered' 
                    value={orders.filter(o => o.order_status === 'Delivered').length} 
                    color='bg-green-500' 
                />
                <StatCard 
                    icon={FaClock} 
                    label='Pending' 
                    value={orders.filter(o => o.order_status === 'Pending' || o.order_status === 'Processing').length} 
                    color='bg-yellow-500' 
                />
            </div>

            {orders.length > 0 && (
                <div className='bg-white rounded-lg shadow-sm p-6'>
                    <div className='flex items-center justify-between mb-4'>
                        <h2 className='text-lg font-semibold text-gray-800'>Recent Purchase</h2>
                        <span className='text-xs text-gray-500'>Latest order</span>
                    </div>
                    {(() => {
                        const recentOrder = orders[0]
                        return (
                            <div className='flex flex-col md:flex-row items-start md:items-center gap-4 p-4 bg-gray-50 rounded-lg'>
                                {recentOrder.product_details?.productImage?.[0] && (
                                    <img 
                                        src={recentOrder.product_details.productImage[0]} 
                                        alt={recentOrder.product_details.name}
                                        className='w-20 h-20 object-cover rounded-lg'
                                    />
                                )}
                                <div className='flex-1'>
                                    <h3 className='font-semibold text-gray-800'>{recentOrder.product_details?.name}</h3>
                                    <p className='text-sm text-gray-500'>Order #{recentOrder._id?.slice(-8)} • Qty: {recentOrder.quantity}</p>
                                    <p className='text-xs text-gray-400 mt-1'>
                                        {new Date(recentOrder.createdAt).toLocaleDateString('en-US', { 
                                            year: 'numeric', 
                                            month: 'long', 
                                            day: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </p>
                                </div>
                                <div className='text-right'>
                                    <p className='text-xl font-bold text-gray-800'>GHS {recentOrder.totalAmt?.toFixed(2)}</p>
                                    <span className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(recentOrder.order_status)}`}>
                                        {recentOrder.order_status}
                                    </span>
                                </div>
                                <button 
                                    onClick={() => navigate('/my-account/orders')}
                                    className='p-2 text-gray-500 hover:text-red-600 transition-colors'
                                >
                                    <FaArrowRight />
                                </button>
                            </div>
                        )
                    })()}
                </div>
            )}

            <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
                <div className='lg:col-span-2 space-y-4'>
                    <div className='flex items-center justify-between'>
                        <h2 className='text-lg font-semibold text-gray-800'>Recent Orders</h2>
                        <button 
                            onClick={() => navigate('/orders')}
                            className='text-sm text-red-600 hover:text-red-700'
                        >
                            View All
                        </button>
                    </div>
                    {orders.length === 0 ? (
                        <div className='bg-white rounded-lg shadow-sm p-8 text-center'>
                            <FaBox className='text-4xl text-gray-300 mx-auto mb-3' />
                            <p className='text-gray-500'>No orders yet</p>
                            <button 
                                onClick={() => navigate('/')}
                                className='mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700'
                            >
                                Start Shopping
                            </button>
                        </div>
                    ) : (
                        orders.slice(0, 5).map(order => (
                            <OrderCard key={order._id} order={order} />
                        ))
                    )}
                </div>

                <div className='space-y-4'>
                    <h2 className='text-lg font-semibold text-gray-800'>Quick Actions</h2>
                    <div className='bg-white rounded-lg shadow-sm p-4 space-y-2'>
                        <button 
                            onClick={() => navigate('/cart')}
                            className='w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 text-gray-700 transition-colors'
                        >
                            <FaShoppingCart className='text-red-600' />
                            <span>My Cart</span>
                        </button>
                        <button 
                            onClick={() => navigate('/wishlist')}
                            className='w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 text-gray-700 transition-colors'
                        >
                            <FaHeart className='text-red-600' />
                            <span>My Wishlist</span>
                        </button>
                        <button 
                            onClick={() => navigate('/orders')}
                            className='w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 text-gray-700 transition-colors'
                        >
                            <FaBox className='text-red-600' />
                            <span>My Orders</span>
                        </button>
                    </div>

                    <h2 className='text-lg font-semibold text-gray-800'>Account Info</h2>
                    <div className='bg-white rounded-lg shadow-sm p-4 space-y-3'>
                        <div className='flex items-center gap-3'>
                            <FaUser className='text-gray-400' />
                            <div>
                                <p className='text-xs text-gray-500'>Name</p>
                                <p className='text-sm font-medium text-gray-800'>{user?.name}</p>
                            </div>
                        </div>
                        <div className='flex items-center gap-3'>
                            <FaUser className='text-gray-400' />
                            <div>
                                <p className='text-xs text-gray-500'>Email</p>
                                <p className='text-sm font-medium text-gray-800'>{user?.email}</p>
                            </div>
                        </div>
                        {user?.phone && (
                            <div className='flex items-center gap-3'>
                                <FaUser className='text-gray-400' />
                                <div>
                                    <p className='text-xs text-gray-500'>Phone</p>
                                    <p className='text-sm font-medium text-gray-800'>{user.phone}</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default CustomerDashboard
