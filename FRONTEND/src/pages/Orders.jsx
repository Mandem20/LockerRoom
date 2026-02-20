import React, { useEffect, useState } from 'react'
import SummaryApi from '../common'
import { toast } from 'react-toastify'
import { FaEye, FaSearch, FaFilter, FaEdit, FaDownload, FaList, FaClock, FaEnvelope, FaSms, FaUser, FaMapMarkerAlt, FaPhone } from 'react-icons/fa'
import { useNavigate } from 'react-router-dom'

const Orders = () => {
    const navigate = useNavigate()
    const [orders, setOrders] = useState([])
    const [loading, setLoading] = useState(true)
    const [viewMode, setViewMode] = useState('table')
    const [filters, setFilters] = useState({
        search: '',
        status: '',
        orderStatus: ''
    })
    const [selectedOrder, setSelectedOrder] = useState(null)
    const [updatingStatus, setUpdatingStatus] = useState(false)

    const fetchOrders = async () => {
        setLoading(true)
        try {
            const response = await fetch(SummaryApi.allOrders.url, {
                credentials: 'include'
            })
            const data = await response.json()
            if (data.success) {
                setOrders(data.data || [])
            } else if (response.status === 403) {
                toast.error('Access denied. Admin only.')
                navigate('/')
            }
        } catch (error) {
            console.error('Error fetching orders:', error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchOrders()
    }, [])

    const handleUpdateStatus = async (orderId, newStatus) => {
        setUpdatingStatus(true)
        try {
            const response = await fetch(SummaryApi.updateOrderStatus.url, {
                method: SummaryApi.updateOrderStatus.method,
                credentials: 'include',
                headers: { 'content-type': 'application/json' },
                body: JSON.stringify({ orderId, payment_status: newStatus })
            })
            const data = await response.json()
            if (data.success) {
                toast.success('Payment status updated')
                fetchOrders()
                setSelectedOrder(null)
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            toast.error('Failed to update status')
        } finally {
            setUpdatingStatus(false)
        }
    }

    const handleUpdateOrderStatus = async (orderId, newStatus) => {
        setUpdatingStatus(true)
        try {
            const response = await fetch(SummaryApi.updateOrderStatus.url, {
                method: SummaryApi.updateOrderStatus.method,
                credentials: 'include',
                headers: { 'content-type': 'application/json' },
                body: JSON.stringify({ orderId, order_status: newStatus })
            })
            const data = await response.json()
            if (data.success) {
                toast.success('Order status updated')
                fetchOrders()
                setSelectedOrder(null)
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            toast.error('Failed to update status')
        } finally {
            setUpdatingStatus(false)
        }
    }

    const handleDownloadInvoice = async (orderId) => {
        try {
            const response = await fetch(`${SummaryApi.downloadInvoice.url}?orderId=${orderId}`, {
                method: SummaryApi.downloadInvoice.method,
                credentials: 'include'
            })
            const blob = await response.blob()
            const url = window.URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = `invoice-${orderId}.html`
            document.body.appendChild(a)
            a.click()
            window.URL.revokeObjectURL(url)
            document.body.removeChild(a)
            toast.success('Invoice downloaded')
        } catch (error) {
            toast.error('Failed to download invoice')
        }
    }

    const handleSendNotification = async (orderId, type) => {
        try {
            const response = await fetch(SummaryApi.sendOrderNotification.url, {
                method: SummaryApi.sendOrderNotification.method,
                credentials: 'include',
                headers: { 'content-type': 'application/json' },
                body: JSON.stringify({ 
                    orderId, 
                    type,
                    emailMessage: { subject: 'Order Status Update', body: '' },
                    smsMessage: ''
                })
            })
            const data = await response.json()
            if (data.success) {
                toast.success(`${type === 'email' ? 'Email' : 'SMS'} notification sent`)
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            toast.error('Failed to send notification')
        }
    }

    const filteredOrders = orders.filter(order => {
        if (filters.search) {
            const search = filters.search.toLowerCase()
            const matchId = order.orderId?.toLowerCase().includes(search)
            const matchName = order.product_details?.name?.toLowerCase().includes(search)
            const matchEmail = order.userId?.email?.toLowerCase().includes(search)
            if (!matchId && !matchName && !matchEmail) return false
        }
        if (filters.status && order.payment_status !== filters.status) {
            return false
        }
        if (filters.orderStatus && order.order_status !== filters.orderStatus) {
            return false
        }
        return true
    })

    const groupedOrders = () => {
        const groups = {}
        filteredOrders.forEach(order => {
            const date = order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'Unknown'
            if (!groups[date]) {
                groups[date] = []
            }
            groups[date].push(order)
        })
        return Object.entries(groups).sort((a, b) => new Date(b[0]) - new Date(a[0]))
    }

    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'paid': return 'bg-green-100 text-green-700'
            case 'pending': return 'bg-yellow-100 text-yellow-700'
            case 'failed': return 'bg-red-100 text-red-700'
            case 'refund': return 'bg-orange-100 text-orange-700'
            default: return 'bg-gray-100 text-gray-700'
        }
    }

    const getOrderStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'pending': return 'bg-yellow-100 text-yellow-700'
            case 'processing': return 'bg-blue-100 text-blue-700'
            case 'shipped': return 'bg-purple-100 text-purple-700'
            case 'delivered': return 'bg-green-100 text-green-700'
            case 'cancelled': return 'bg-red-100 text-red-700'
            case 'refund': return 'bg-orange-100 text-orange-700'
            default: return 'bg-gray-100 text-gray-700'
        }
    }

    const orderStatusOptions = {
        'pending': ['Processing', 'Cancelled'],
        'processing': ['Shipped', 'Cancelled'],
        'shipped': ['Delivered'],
        'delivered': ['Refund'],
        'cancelled': [],
        'refund': []
    }

    const canChangeStatus = (currentStatus) => {
        return orderStatusOptions[currentStatus]?.length > 0
    }

    return (
        <div className='space-y-4'>
            <div className='bg-white p-4 rounded-lg shadow-sm'>
                <div className='flex justify-between items-center'>
                    <div>
                        <h1 className='text-2xl font-bold text-gray-800'>Orders</h1>
                        <p className='text-gray-500 text-sm mt-1'>Manage and track customer orders</p>
                    </div>
                    <div className='flex gap-2'>
                        <button
                            onClick={() => setViewMode('table')}
                            className={`p-2 rounded ${viewMode === 'table' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                            title='Table View'
                        >
                            <FaList />
                        </button>
                        <button
                            onClick={() => setViewMode('timeline')}
                            className={`p-2 rounded ${viewMode === 'timeline' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                            title='Timeline View'
                        >
                            <FaClock />
                        </button>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className='bg-white p-4 rounded-lg shadow-sm'>
                <div className='flex flex-wrap gap-4 items-end'>
                    <div className='flex-1 min-w-[200px]'>
                        <label className='text-sm text-gray-600'>Search</label>
                        <div className='relative'>
                            <FaSearch className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400' />
                            <input
                                type='text'
                                placeholder='Search by Order ID, Product, or Email...'
                                value={filters.search}
                                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                                className='w-full pl-10 p-2 border rounded text-sm'
                            />
                        </div>
                    </div>
                    <div className='min-w-[150px]'>
                        <label className='text-sm text-gray-600'>Payment Status</label>
                        <select
                            value={filters.status}
                            onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                            className='w-full p-2 border rounded text-sm'
                        >
                            <option value="">All Status</option>
                            <option value="paid">Paid</option>
                            <option value="pending">Pending</option>
                            <option value="failed">Failed</option>
                            <option value="refund">Refund</option>
                        </select>
                    </div>
                    <div className='min-w-[150px]'>
                        <label className='text-sm text-gray-600'>Order Status</label>
                        <select
                            value={filters.orderStatus}
                            onChange={(e) => setFilters(prev => ({ ...prev, orderStatus: e.target.value }))}
                            className='w-full p-2 border rounded text-sm'
                        >
                            <option value="">All Orders</option>
                            <option value="pending">Pending</option>
                            <option value="processing">Processing</option>
                            <option value="shipped">Shipped</option>
                            <option value="delivered">Delivered</option>
                            <option value="cancelled">Cancelled</option>
                            <option value="refund">Refund</option>
                        </select>
                    </div>
                    <button
                        onClick={() => setFilters({ search: '', status: '', orderStatus: '' })}
                        className='px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded text-sm'
                    >
                        Clear
                    </button>
                </div>
                <div className='mt-2 text-sm text-gray-500'>
                    {filteredOrders.length} orders found
                </div>
            </div>

            {/* Orders Table */}
            <div className='bg-white rounded-lg shadow-sm overflow-hidden'>
                <div className='overflow-x-auto'>
                    <table className='w-full'>
                        <thead className='bg-gray-50'>
                            <tr>
                                <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase'>Order ID</th>
                                <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase'>Customer</th>
                                <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase'>Product</th>
                                <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase'>Amount</th>
                                <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase'>Payment Mode</th>
                                <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase'>Payment</th>
                                <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase'>Order Status</th>
                                <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase'>Date</th>
                                <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase'>Action</th>
                            </tr>
                        </thead>
                        <tbody className='divide-y divide-gray-200'>
                            {loading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <tr key={i}>
                                        <td colSpan={9} className='px-4 py-4'>
                                            <div className='h-4 bg-gray-200 rounded animate-pulse'></div>
                                        </td>
                                    </tr>
                                ))
                            ) : filteredOrders.length === 0 ? (
                                <tr>
                                    <td colSpan={9} className='px-4 py-8 text-center text-gray-500'>
                                        No orders found
                                    </td>
                                </tr>
                            ) : (
                                filteredOrders.map((order) => (
                                    <tr key={order._id} className='hover:bg-gray-50'>
                                        <td className='px-4 py-3 text-sm text-gray-800 font-mono'>
                                            {order.orderId}
                                        </td>
                                        <td className='px-4 py-3'>
                                            <div className='text-sm'>
                                                <p className='font-medium text-gray-800'>{order.userId?.name || 'Unknown'}</p>
                                                <p className='text-xs text-gray-500'>{order.userId?.email}</p>
                                                {order.userId?.phone && (
                                                    <p className='text-xs text-gray-500'>{order.userId.phone}</p>
                                                )}
                                            </div>
                                        </td>
                                        <td className='px-4 py-3'>
                                            <div className='flex items-center gap-3'>
                                                {order.product_details?.image?.[0] && (
                                                    <img 
                                                        src={order.product_details.image[0]} 
                                                        alt={order.product_details.name}
                                                        className='w-10 h-10 object-cover rounded'
                                                    />
                                                )}
                                                <span className='text-sm text-gray-800 truncate max-w-[200px]'>
                                                    {order.product_details?.name || 'Unknown Product'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className='px-4 py-3 text-sm font-medium text-gray-800'>
                                            GHS {order.totalAmt?.toLocaleString() || 0}
                                        </td>
                                        <td className='px-4 py-3 text-sm text-gray-500'>
                                            {order.payment_mode || '-'}
                                        </td>
                                        <td className='px-4 py-3'>
                                            <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(order.payment_status)}`}>
                                                {order.payment_status || 'Unknown'}
                                            </span>
                                        </td>
                                        <td className='px-4 py-3'>
                                            <span className={`text-xs px-2 py-1 rounded-full ${getOrderStatusColor(order.order_status)}`}>
                                                {order.order_status || 'pending'}
                                            </span>
                                        </td>
                                        <td className='px-4 py-3 text-sm text-gray-500'>
                                            {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : '-'}
                                        </td>
                                        <td className='px-4 py-3'>
                                            <div className='flex gap-2'>
                                                <button
                                                    onClick={() => handleDownloadInvoice(order._id)}
                                                    className='p-2 bg-green-50 hover:bg-green-100 rounded text-green-600'
                                                    title='Download Invoice'
                                                >
                                                    <FaDownload />
                                                </button>
                                                <button
                                                    onClick={() => setSelectedOrder(order)}
                                                    className='p-2 bg-blue-50 hover:bg-blue-100 rounded text-blue-600'
                                                >
                                                    <FaEye />
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

            {/* Timeline View */}
            {viewMode === 'timeline' && (
                <div className='bg-white rounded-lg shadow-sm p-4'>
                    {loading ? (
                        <div className='space-y-4'>
                            {Array.from({ length: 5 }).map((_, i) => (
                                <div key={i} className='h-20 bg-gray-200 rounded animate-pulse'></div>
                            ))}
                        </div>
                    ) : groupedOrders().length === 0 ? (
                        <div className='py-8 text-center text-gray-500'>No orders found</div>
                    ) : (
                        <div className='space-y-6'>
                            {groupedOrders().map(([date, dateOrders]) => (
                                <div key={date}>
                                    <h3 className='text-sm font-semibold text-gray-500 mb-3'>{date}</h3>
                                    <div className='space-y-3'>
                                        {dateOrders.map((order) => (
                                            <div key={order._id} className='flex items-center gap-4 p-4 border rounded-lg hover:bg-gray-50'>
                                                <div className='flex-shrink-0 w-12 h-12'>
                                                    {order.product_details?.image?.[0] ? (
                                                        <img 
                                                            src={order.product_details.image[0]} 
                                                            alt={order.product_details.name}
                                                            className='w-12 h-12 object-cover rounded'
                                                        />
                                                    ) : (
                                                        <div className='w-12 h-12 bg-gray-200 rounded flex items-center justify-center text-gray-400'>
                                                            <FaDownload />
                                                        </div>
                                                    )}
                                                </div>
                                                <div className='flex-1 min-w-0'>
                                                    <div className='flex items-center gap-2'>
                                                        <span className='text-sm font-mono text-gray-800'>{order.orderId}</span>
                                                        <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor(order.payment_status)}`}>
                                                            {order.payment_status}
                                                        </span>
                                                        <span className={`text-xs px-2 py-0.5 rounded-full ${getOrderStatusColor(order.order_status)}`}>
                                                            {order.order_status}
                                                        </span>
                                                    </div>
                                                    <p className='text-sm text-gray-600 truncate'>
                                                        {order.product_details?.name || 'Unknown Product'}
                                                    </p>
                                                    <p className='text-xs text-gray-500'>
                                                        {order.userId?.email}
                                                    </p>
                                                </div>
                                                <div className='text-right'>
                                                    <p className='font-medium text-gray-800'>GHS {order.totalAmt?.toLocaleString() || 0}</p>
                                                    <p className='text-xs text-gray-500'>{order.payment_mode || '-'}</p>
                                                </div>
                                                <div className='flex gap-2'>
                                                    <button
                                                        onClick={() => handleDownloadInvoice(order._id)}
                                                        className='p-2 bg-green-50 hover:bg-green-100 rounded text-green-600'
                                                        title='Download Invoice'
                                                    >
                                                        <FaDownload />
                                                    </button>
                                                    <button
                                                        onClick={() => setSelectedOrder(order)}
                                                        className='p-2 bg-blue-50 hover:bg-blue-100 rounded text-blue-600'
                                                    >
                                                        <FaEye />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Order Detail Modal */}
            {selectedOrder && (
                <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4'>
                    <div className='bg-white rounded-lg max-w-lg w-full p-6'>
                        <div className='flex justify-between items-start mb-4'>
                            <h2 className='text-xl font-bold text-gray-800'>Order Details</h2>
                            <button 
                                onClick={() => setSelectedOrder(null)}
                                className='text-gray-400 hover:text-gray-600 text-xl'
                            >
                                &times;
                            </button>
                        </div>
                        
                        <div className='space-y-4'>
                            <div className='grid grid-cols-2 gap-4'>
                                <div>
                                    <p className='text-sm text-gray-500'>Order ID</p>
                                    <p className='font-mono text-sm'>{selectedOrder.orderId}</p>
                                </div>
                                <div>
                                    <p className='text-sm text-gray-500'>Status</p>
                                    <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(selectedOrder.payment_status)}`}>
                                        {selectedOrder.payment_status}
                                    </span>
                                </div>
                            </div>

                            {/* Customer Information */}
                            <div className='border-t pt-4 mt-4'>
                                <p className='text-sm text-gray-500 mb-2 flex items-center gap-2'>
                                    <FaUser className='text-red-500' /> Customer Information
                                </p>
                                <div className='bg-gray-50 rounded-lg p-3 space-y-2'>
                                    <div className='flex items-center gap-2'>
                                        <FaUser className='text-gray-400 text-xs' />
                                        <p className='text-sm font-medium'>{selectedOrder.userId?.name || 'Unknown'}</p>
                                    </div>
                                    <div className='flex items-center gap-2'>
                                        <FaEnvelope className='text-gray-400 text-xs' />
                                        <p className='text-sm text-gray-600'>{selectedOrder.userId?.email || 'N/A'}</p>
                                    </div>
                                    {selectedOrder.userId?.phone && (
                                        <div className='flex items-center gap-2'>
                                            <FaPhone className='text-gray-400 text-xs' />
                                            <p className='text-sm text-gray-600'>{selectedOrder.userId.phone}</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Delivery Address */}
                            {selectedOrder.delivery_address && (
                                <div className='border-t pt-4 mt-4'>
                                    <p className='text-sm text-gray-500 mb-2 flex items-center gap-2'>
                                        <FaMapMarkerAlt className='text-red-500' /> Delivery Address
                                    </p>
                                    <div className='bg-gray-50 rounded-lg p-3'>
                                        <p className='text-sm text-gray-700'>{selectedOrder.delivery_address}</p>
                                    </div>
                                </div>
                            )}

                            {selectedOrder.payment_mode && (
                                <div className='mt-4'>
                                    <p className='text-sm text-gray-500'>Payment Mode</p>
                                    <p className='font-medium'>{selectedOrder.payment_mode}</p>
                                </div>
                            )}

                            <div className='border-t pt-4'>
                                <p className='text-sm text-gray-500 mb-2'>Product</p>
                                <div className='flex items-center gap-3'>
                                    {selectedOrder.product_details?.image?.[0] && (
                                        <img 
                                            src={selectedOrder.product_details.image[0]} 
                                            alt={selectedOrder.product_details.name}
                                            className='w-16 h-16 object-cover rounded'
                                        />
                                    )}
                                    <div>
                                        <p className='font-medium'>{selectedOrder.product_details?.name}</p>
                                    </div>
                                </div>
                            </div>

                            <div className='grid grid-cols-2 gap-4 border-t pt-4'>
                                <div>
                                    <p className='text-sm text-gray-500'>Subtotal</p>
                                    <p className='font-medium'>GHS {selectedOrder.subTotalAmt?.toLocaleString() || 0}</p>
                                </div>
                                <div>
                                    <p className='text-sm text-gray-500'>Total Amount</p>
                                    <p className='font-bold text-lg'>GHS {selectedOrder.totalAmt?.toLocaleString() || 0}</p>
                                </div>
                            </div>

                            <div className='border-t pt-4'>
                                <p className='text-sm text-gray-500'>Date</p>
                                <p>{selectedOrder.createdAt ? new Date(selectedOrder.createdAt).toLocaleString() : '-'}</p>
                            </div>

                            {/* Update Payment Status */}
                            <div className='border-t pt-4 mt-4'>
                                <p className='text-sm text-gray-500 mb-2'>Update Payment Status</p>
                                <div className='flex gap-2'>
                                    <select
                                        id='newPaymentStatus'
                                        className='flex-1 p-2 border rounded text-sm'
                                        defaultValue={selectedOrder.payment_status}
                                    >
                                        <option value='pending'>Pending</option>
                                        <option value='paid'>Paid</option>
                                        <option value='failed'>Failed</option>
                                        <option value='refund'>Refund</option>
                                    </select>
                                    <button
                                        onClick={() => {
                                            const newStatus = document.getElementById('newPaymentStatus').value
                                            handleUpdateStatus(selectedOrder._id, newStatus)
                                        }}
                                        disabled={updatingStatus}
                                        className='px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm font-medium'
                                    >
                                        {updatingStatus ? 'Updating...' : 'Update'}
                                    </button>
                                </div>
                            </div>

                            {/* Update Order Status */}
                            <div className='border-t pt-4 mt-4'>
                                <p className='text-sm text-gray-500 mb-2'>Update Order Status</p>
                                <div className='flex gap-2'>
                                    <select
                                        id='newOrderStatus'
                                        className='flex-1 p-2 border rounded text-sm'
                                        defaultValue={selectedOrder.order_status || 'pending'}
                                    >
                                        {canChangeStatus(selectedOrder.order_status || 'pending') ? (
                                            <>
                                                <option value="pending" disabled={selectedOrder.order_status !== 'pending'}>Pending</option>
                                                <option value="processing" disabled={!orderStatusOptions[selectedOrder.order_status || 'pending']?.includes('processing')}>Processing</option>
                                                <option value="shipped" disabled={!orderStatusOptions[selectedOrder.order_status || 'pending']?.includes('shipped')}>Shipped</option>
                                                <option value="delivered" disabled={!orderStatusOptions[selectedOrder.order_status || 'pending']?.includes('delivered')}>Delivered</option>
                                                <option value="cancelled" disabled={!orderStatusOptions[selectedOrder.order_status || 'pending']?.includes('cancelled')}>Cancelled</option>
                                                <option value="refund" disabled={!orderStatusOptions[selectedOrder.order_status || 'pending']?.includes('refund')}>Refund</option>
                                            </>
                                        ) : (
                                            <option value={selectedOrder.order_status || 'pending'}>
                                                {selectedOrder.order_status || 'pending'}
                                            </option>
                                        )}
                                    </select>
                                    <button
                                        onClick={() => {
                                            const newStatus = document.getElementById('newOrderStatus').value
                                            handleUpdateOrderStatus(selectedOrder._id, newStatus)
                                        }}
                                        disabled={updatingStatus || !canChangeStatus(selectedOrder.order_status || 'pending')}
                                        className='px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 text-sm font-medium'
                                    >
                                        {updatingStatus ? 'Updating...' : 'Update'}
                                    </button>
                                </div>
                            </div>

                            {/* Order Status History */}
                            {selectedOrder.order_status_history?.length > 0 && (
                                <div className='border-t pt-4 mt-4'>
                                    <p className='text-sm text-gray-500 mb-2'>Status History</p>
                                    <div className='space-y-2 max-h-32 overflow-y-auto'>
                                        {selectedOrder.order_status_history.slice().reverse().map((history, index) => (
                                            <div key={index} className='text-sm flex justify-between'>
                                                <span className={`px-2 py-0.5 rounded-full ${getOrderStatusColor(history.status)}`}>
                                                    {history.status}
                                                </span>
                                                <span className='text-gray-500 text-xs'>
                                                    {new Date(history.updatedAt).toLocaleString()}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Send Notification */}
                            <div className='border-t pt-4 mt-4'>
                                <p className='text-sm text-gray-500 mb-2'>Send Notification</p>
                                <div className='flex gap-2'>
                                    <button
                                        onClick={() => handleSendNotification(selectedOrder._id, 'email')}
                                        className='flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm font-medium'
                                    >
                                        <FaEnvelope />
                                        Send Email
                                    </button>
                                    <button
                                        onClick={() => handleSendNotification(selectedOrder._id, 'sms')}
                                        className='flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 text-sm font-medium'
                                    >
                                        <FaSms />
                                        Send SMS
                                    </button>
                                </div>
                                <p className='text-xs text-gray-500 mt-2'>
                                    Email: {selectedOrder.userId?.email || 'Not available'} | 
                                    Phone: {selectedOrder.userId?.phoneNumber || 'Not available'}
                                </p>
                            </div>
                        </div>

                        <button
                            onClick={() => setSelectedOrder(null)}
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

export default Orders
