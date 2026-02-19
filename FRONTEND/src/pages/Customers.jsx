import React, { useEffect, useState } from 'react'
import SummaryApi from '../common'
import { toast } from 'react-toastify'
import moment from 'moment'
import { FaSearch, FaEnvelope, FaPhone, FaEye, FaShoppingCart, FaUserSlash, FaUserCheck, FaFilter } from 'react-icons/fa'
import { MdModeEdit, MdDelete, MdBlock } from 'react-icons/md'
import { IoCheckmarkCircle } from 'react-icons/io5'
import { useNavigate } from 'react-router-dom'

const Customers = () => {
    const navigate = useNavigate()
    const [customers, setCustomers] = useState([])
    const [filteredCustomers, setFilteredCustomers] = useState([])
    const [loading, setLoading] = useState(true)
    const [selectedCustomer, setSelectedCustomer] = useState(null)
    const [customerOrders, setCustomerOrders] = useState([])
    const [showOrdersModal, setShowOrdersModal] = useState(false)
    const [filters, setFilters] = useState({
        search: '',
        status: ''
    })

    const fetchCustomers = async () => {
        setLoading(true)
        try {
            const response = await fetch(SummaryApi.allUser.url, {
                method: SummaryApi.allUser.method,
                credentials: 'include'
            })
            const data = await response.json()
            if (data.success) {
                const generalUsers = data.data.filter(user => user.role === 'CUSTOMER')
                setCustomers(generalUsers)
                setFilteredCustomers(generalUsers)
            } else if (response.status === 403) {
                toast.error('Access denied. Admin only.')
                navigate('/')
            }
        } catch (error) {
            toast.error('Failed to fetch customers')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchCustomers()
    }, [])

    useEffect(() => {
        const searchTerm = filters.search?.toLowerCase().trim() || ''
        
        const result = customers.filter(customer => {
            if (searchTerm) {
                const name = (customer.name || '').toLowerCase()
                const email = (customer.email || '').toLowerCase()
                const mobile = (customer.mobile || '').toString().toLowerCase()
                if (!name.includes(searchTerm) && !email.includes(searchTerm) && !mobile.includes(searchTerm)) {
                    return false
                }
            }

            if (filters.status !== '') {
                const isActive = filters.status === 'true'
                if (customer.isActive !== isActive) return false
            }

            return true
        })

        setFilteredCustomers(result)
    }, [filters, customers])

    const fetchCustomerOrders = async (customerId) => {
        try {
            const response = await fetch(SummaryApi.allOrders.url, {
                credentials: 'include'
            })
            const data = await response.json()
            if (data.success) {
                const orders = data.data.filter(order => order.userId?._id === customerId)
                setCustomerOrders(orders)
            }
        } catch (error) {
            console.error('Error fetching orders:', error)
        }
    }

    const handleViewOrders = async (customer) => {
        setSelectedCustomer(customer)
        await fetchCustomerOrders(customer._id)
        setShowOrdersModal(true)
    }

    const handleToggleStatus = async (customerId) => {
        try {
            const response = await fetch(SummaryApi.toggleUserStatus.url, {
                method: SummaryApi.toggleUserStatus.method,
                credentials: 'include',
                headers: { 'content-type': 'application/json' },
                body: JSON.stringify({ id: customerId })
            })
            const data = await response.json()
            if (data.success) {
                toast.success(data.message)
                fetchCustomers()
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            toast.error('Failed to update status')
        }
    }

    const getStatusBadge = (isActive) => {
        return isActive 
            ? 'bg-green-100 text-green-700' 
            : 'bg-red-100 text-red-700'
    }

    const getOrderStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'pending': return 'bg-yellow-100 text-yellow-700'
            case 'processing': return 'bg-blue-100 text-blue-700'
            case 'shipped': return 'bg-purple-100 text-purple-700'
            case 'delivered': return 'bg-green-100 text-green-700'
            case 'cancelled': return 'bg-red-100 text-red-700'
            default: return 'bg-gray-100 text-gray-700'
        }
    }

    const getPaymentStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'paid': return 'bg-green-100 text-green-700'
            case 'pending': return 'bg-yellow-100 text-yellow-700'
            case 'failed': return 'bg-red-100 text-red-700'
            default: return 'bg-gray-100 text-gray-700'
        }
    }

    return (
        <div className='space-y-4'>
            <div className='bg-white p-4 rounded-lg shadow-sm'>
                <h1 className='text-2xl font-bold text-gray-800'>Customers</h1>
                <p className='text-gray-500 text-sm mt-1'>Manage customer accounts and view order history</p>
            </div>

            <div className='bg-white p-4 rounded-lg shadow-sm'>
                <div className='flex flex-wrap gap-4 items-end'>
                    <div className='flex-1 min-w-[200px]'>
                        <label className='text-sm text-gray-600'>Search</label>
                        <div className='relative'>
                            <FaSearch className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400' />
                            <input
                                type='text'
                                placeholder='Search by name, email, or mobile...'
                                value={filters.search}
                                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                                className='w-full pl-10 p-2 border rounded text-sm'
                            />
                        </div>
                    </div>
                    <div className='min-w-[150px]'>
                        <label className='text-sm text-gray-600'>Status</label>
                        <select
                            value={filters.status}
                            onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                            className='w-full p-2 border rounded text-sm'
                        >
                            <option value="">All Status</option>
                            <option value="true">Active</option>
                            <option value="false">Inactive</option>
                        </select>
                    </div>
                    <button
                        onClick={() => setFilters({ search: '', status: '' })}
                        className='px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded text-sm'
                    >
                        Clear
                    </button>
                    <div className='ml-auto text-sm text-gray-500'>
                        {filteredCustomers.length} customers
                    </div>
                </div>
            </div>

            <div className='bg-white rounded-lg shadow-sm overflow-hidden'>
                <div className='overflow-x-auto'>
                    <table className='w-full'>
                        <thead className='bg-gray-50'>
                            <tr>
                                <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase'>Customer</th>
                                <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase'>Contact</th>
                                <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase'>Status</th>
                                <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase'>Joined</th>
                                <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase'>Action</th>
                            </tr>
                        </thead>
                        <tbody className='divide-y divide-gray-200'>
                            {loading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <tr key={i}>
                                        <td colSpan={5} className='px-4 py-4'>
                                            <div className='h-4 bg-gray-200 rounded animate-pulse'></div>
                                        </td>
                                    </tr>
                                ))
                            ) : filteredCustomers.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className='px-4 py-8 text-center text-gray-500'>
                                        No customers found
                                    </td>
                                </tr>
                            ) : (
                                filteredCustomers.map((customer) => (
                                    <tr key={customer._id} className='hover:bg-gray-50'>
                                        <td className='px-4 py-3'>
                                            <div className='flex items-center gap-3'>
                                                {customer.profilePic ? (
                                                    <img 
                                                        src={customer.profilePic} 
                                                        alt={customer.name}
                                                        className='w-10 h-10 rounded-full object-cover'
                                                    />
                                                ) : (
                                                    <div className='w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center'>
                                                        <span className='text-gray-500 font-medium'>
                                                            {customer.name?.charAt(0)?.toUpperCase() || 'U'}
                                                        </span>
                                                    </div>
                                                )}
                                                <div>
                                                    <p className='text-sm font-medium text-gray-800'>{customer.name || 'N/A'}</p>
                                                    <p className='text-xs text-gray-500'>{customer.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className='px-4 py-3'>
                                            <div className='text-sm text-gray-600'>
                                                {customer.mobile && (
                                                    <div className='flex items-center gap-2'>
                                                        <FaPhone className='text-gray-400' />
                                                        {customer.mobile}
                                                    </div>
                                                )}
                                                {customer.email && (
                                                    <div className='flex items-center gap-2 mt-1'>
                                                        <FaEnvelope className='text-gray-400' />
                                                        <span className='text-xs truncate max-w-[200px]'>{customer.email}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className='px-4 py-3'>
                                            <span className={`text-xs px-2 py-1 rounded-full ${getStatusBadge(customer.isActive)}`}>
                                                {customer.isActive ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td className='px-4 py-3 text-sm text-gray-500'>
                                            {customer.createdAt ? moment(customer.createdAt).format('MMM DD, YYYY') : '-'}
                                        </td>
                                        <td className='px-4 py-3'>
                                            <div className='flex gap-2'>
                                                <button
                                                    onClick={() => handleViewOrders(customer)}
                                                    className='p-2 bg-purple-50 hover:bg-purple-100 rounded text-purple-600'
                                                    title='View Orders'
                                                >
                                                    <FaShoppingCart />
                                                </button>
                                                <button
                                                    onClick={() => handleToggleStatus(customer._id)}
                                                    className={`p-2 rounded ${customer.isActive ? 'bg-yellow-50 hover:bg-yellow-100 text-yellow-600' : 'bg-green-50 hover:bg-green-100 text-green-600'}`}
                                                    title={customer.isActive ? 'Deactivate' : 'Activate'}
                                                >
                                                    {customer.isActive ? <MdBlock /> : <IoCheckmarkCircle />}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {showOrdersModal && selectedCustomer && (
                <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4'>
                    <div className='bg-white rounded-lg max-w-3xl w-full p-6 max-h-[80vh] overflow-y-auto'>
                        <div className='flex justify-between items-start mb-4'>
                            <div>
                                <h2 className='text-xl font-bold text-gray-800'>Customer Orders</h2>
                                <p className='text-sm text-gray-500'>{selectedCustomer.name} - {selectedCustomer.email}</p>
                            </div>
                            <button 
                                onClick={() => setShowOrdersModal(false)}
                                className='text-gray-400 hover:text-gray-600 text-xl'
                            >
                                &times;
                            </button>
                        </div>
                        
                        {customerOrders.length === 0 ? (
                            <div className='py-8 text-center text-gray-500'>
                                No orders found for this customer
                            </div>
                        ) : (
                            <div className='space-y-4'>
                                <div className='text-sm text-gray-500 mb-4'>
                                    Total Orders: {customerOrders.length} | 
                                    Total Spent: GHS {customerOrders.reduce((sum, o) => sum + (o.totalAmt || 0), 0).toLocaleString()}
                                </div>
                                {customerOrders.map((order) => (
                                    <div key={order._id} className='border rounded-lg p-4'>
                                        <div className='flex justify-between items-start mb-2'>
                                            <div>
                                                <p className='font-mono text-sm font-medium'>{order.orderId}</p>
                                                <p className='text-xs text-gray-500'>
                                                    {order.createdAt ? moment(order.createdAt).format('MMM DD, YYYY HH:mm') : '-'}
                                                </p>
                                            </div>
                                            <div className='text-right'>
                                                <p className='font-medium'>GHS {order.totalAmt?.toLocaleString() || 0}</p>
                                                <span className={`text-xs px-2 py-0.5 rounded-full ${getPaymentStatusColor(order.payment_status)}`}>
                                                    {order.payment_status}
                                                </span>
                                            </div>
                                        </div>
                                        <div className='flex items-center gap-2 mt-2'>
                                            <span className={`text-xs px-2 py-0.5 rounded-full ${getOrderStatusColor(order.order_status)}`}>
                                                {order.order_status}
                                            </span>
                                            {order.product_details?.name && (
                                                <span className='text-sm text-gray-600 truncate'>
                                                    {order.product_details.name}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        <button
                            onClick={() => setShowOrdersModal(false)}
                            className='mt-6 w-full py-2 bg-gray-200 hover:bg-gray-300 rounded-lg text-gray-700 font-medium'
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}

export default Customers
