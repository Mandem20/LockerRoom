import { useEffect, useState } from 'react'
import SummaryApi from '../common'
import { toast } from 'react-toastify'
import { useNavigate } from 'react-router-dom'
import { FaBox, FaEye, FaDownload, FaShippingFast, FaCheckCircle, FaClock, FaTimesCircle, FaMoneyBillWave } from 'react-icons/fa'
import displayCEDICurrency from '../helpers/displayCurrency'

const CustomerOrders = () => {
    const navigate = useNavigate()
    const [orders, setOrders] = useState([])
    const [loading, setLoading] = useState(true)
    const [selectedOrder, setSelectedOrder] = useState(null)
    const [orderDetails, setOrderDetails] = useState(null)
    const [detailsLoading, setDetailsLoading] = useState(false)

    useEffect(() => {
        fetchOrders()
    }, [])

    const fetchOrders = async () => {
        setLoading(true)
        try {
            const response = await fetch(SummaryApi.getMyOrders.url, {
                credentials: 'include'
            })
            const data = await response.json()
            if (data.success) {
                setOrders(data.data?.orders || [])
            }
        } catch (error) {
            console.error('Error fetching orders:', error)
        } finally {
            setLoading(false)
        }
    }

    const fetchOrderDetails = async (orderId) => {
        setDetailsLoading(true)
        try {
            const url = SummaryApi.getOrderDetails.url.replace(':orderId', orderId)
            const response = await fetch(url, {
                credentials: 'include'
            })
            const data = await response.json()
            if (data.success) {
                setOrderDetails(data.data)
            }
        } catch (error) {
            console.error('Error fetching order details:', error)
        } finally {
            setDetailsLoading(false)
        }
    }

    const handleViewDetails = async (order) => {
        setSelectedOrder(order)
        await fetchOrderDetails(order._id)
    }

    const handleCloseDetails = () => {
        setSelectedOrder(null)
        setOrderDetails(null)
    }

    const getStatusColor = (status) => {
        const colors = {
            'pending': 'bg-yellow-100 text-yellow-800',
            'processing': 'bg-blue-100 text-blue-800',
            'shipped': 'bg-purple-100 text-purple-800',
            'delivered': 'bg-green-100 text-green-800',
            'partially_delivered': 'bg-orange-100 text-orange-800',
            'cancelled': 'bg-red-100 text-red-800',
            'refunded': 'bg-gray-100 text-gray-800'
        }
        return colors[status] || 'bg-gray-100 text-gray-800'
    }

    const getStatusIcon = (status) => {
        const icons = {
            'pending': <FaClock />,
            'processing': <FaShippingFast />,
            'shipped': <FaShippingFast />,
            'delivered': <FaCheckCircle />,
            'partially_delivered': <FaMoneyBillWave />,
            'cancelled': <FaTimesCircle />,
        }
        return icons[status] || <FaClock />
    }

    const getPaymentStatusColor = (status) => {
        const colors = {
            'paid': 'bg-green-100 text-green-800',
            'pending': 'bg-yellow-100 text-yellow-800',
            'failed': 'bg-red-100 text-red-800',
            'refunded': 'bg-gray-100 text-gray-800'
        }
        return colors[status] || 'bg-gray-100 text-gray-800'
    }

    const formatStatus = (status) => {
        return status?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'N/A'
    }

    if (loading) {
        return (
            <div className='flex items-center justify-center h-64'>
                <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-red-600'></div>
            </div>
        )
    }

    return (
        <div className='space-y-6'>
            <div className='flex items-center justify-between'>
                <div>
                    <h1 className='text-2xl font-bold text-gray-800'>My Orders</h1>
                    <p className='text-gray-500 text-sm mt-1'>Track and manage your orders</p>
                </div>
            </div>

            {orders.length === 0 ? (
                <div className='bg-white rounded-lg shadow-sm p-8 text-center'>
                    <FaBox className='text-4xl text-gray-300 mx-auto mb-3' />
                    <p className='text-gray-500 mb-4'>No orders yet</p>
                    <button 
                        onClick={() => navigate('/')}
                        className='px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700'
                    >
                        Start Shopping
                    </button>
                </div>
            ) : (
                <div className='bg-white rounded-lg shadow-sm overflow-hidden'>
                    <div className='overflow-x-auto'>
                        <table className='w-full'>
                            <thead className='bg-gray-50'>
                                <tr>
                                    <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase'>Order ID</th>
                                    <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase'>Date</th>
                                    <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase'>Items</th>
                                    <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase'>Total</th>
                                    <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase'>Payment</th>
                                    <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase'>Status</th>
                                    <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase'>Action</th>
                                </tr>
                            </thead>
                            <tbody className='divide-y divide-gray-200'>
                                {orders.map((order) => (
                                    <tr key={order._id} className='hover:bg-gray-50'>
                                        <td className='px-4 py-4 text-sm font-medium text-gray-800'>
                                            #{order.parentOrderId?.slice(-12)}
                                        </td>
                                        <td className='px-4 py-4 text-sm text-gray-500'>
                                            {new Date(order.createdAt).toLocaleDateString('en-US', {
                                                year: 'numeric',
                                                month: 'short',
                                                day: 'numeric'
                                            })}
                                        </td>
                                        <td className='px-4 py-4 text-sm text-gray-600'>
                                            {order.itemCount || order.subOrderCount || 0} items
                                        </td>
                                        <td className='px-4 py-4 text-sm font-medium text-gray-800'>
                                            {displayCEDICurrency(order.totalAmount)}
                                        </td>
                                        <td className='px-4 py-4'>
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPaymentStatusColor(order.paymentStatus)}`}>
                                                {order.paymentStatus}
                                            </span>
                                        </td>
                                        <td className='px-4 py-4'>
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.overallStatus)}`}>
                                                {formatStatus(order.overallStatus)}
                                            </span>
                                        </td>
                                        <td className='px-4 py-4'>
                                            <button 
                                                onClick={() => handleViewDetails(order)}
                                                className='text-gray-500 hover:text-red-600'
                                                title='View Details'
                                            >
                                                <FaEye className='text-lg' />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Order Details Modal */}
            {selectedOrder && (
                <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4'>
                    <div className='bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto'>
                        <div className='sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between'>
                            <h2 className='text-xl font-bold'>Order Details</h2>
                            <button onClick={handleCloseDetails} className='text-gray-400 hover:text-gray-600 text-2xl'>
                                &times;
                            </button>
                        </div>
                        
                        {detailsLoading ? (
                            <div className='flex items-center justify-center py-12'>
                                <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-red-600'></div>
                            </div>
                        ) : orderDetails ? (
                            <div className='p-6 space-y-6'>
                                {/* Order Summary */}
                                <div className='bg-gray-50 rounded-lg p-4'>
                                    <div className='grid grid-cols-2 gap-4'>
                                        <div>
                                            <p className='text-sm text-gray-500'>Order ID</p>
                                            <p className='font-mono font-medium'>#{orderDetails.parentOrder?.parentOrderId?.slice(-12)}</p>
                                        </div>
                                        <div>
                                            <p className='text-sm text-gray-500'>Status</p>
                                            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(orderDetails.parentOrder?.overallStatus)}`}>
                                                {getStatusIcon(orderDetails.parentOrder?.overallStatus)}
                                                {formatStatus(orderDetails.parentOrder?.overallStatus)}
                                            </span>
                                        </div>
                                        <div>
                                            <p className='text-sm text-gray-500'>Order Date</p>
                                            <p className='font-medium'>
                                                {new Date(orderDetails.parentOrder?.createdAt).toLocaleDateString('en-US', {
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric'
                                                })}
                                            </p>
                                        </div>
                                        <div>
                                            <p className='text-sm text-gray-500'>Payment Status</p>
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPaymentStatusColor(orderDetails.parentOrder?.paymentStatus)}`}>
                                                {orderDetails.parentOrder?.paymentStatus}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Order Items */}
                                <div>
                                    <h3 className='font-semibold text-gray-800 mb-3'>Order Items</h3>
                                    <div className='space-y-3'>
                                        {orderDetails.subOrders?.map((subOrder) => (
                                            <div key={subOrder._id} className='border rounded-lg p-4'>
                                                <div className='flex items-start gap-4'>
                                                    <div className='flex-1'>
                                                        <p className='font-medium text-gray-800'>
                                                            {subOrder.product_details?.name || 'Product'}
                                                        </p>
                                                        <div className='text-sm text-gray-500 mt-1'>
                                                            <span>Qty: {subOrder.quantity || 1}</span>
                                                        </div>
                                                    </div>
                                                    <div className='text-right'>
                                                        <p className='font-semibold'>
                                                            {displayCEDICurrency(subOrder.totalAmt || subOrder.subTotalAmt)}
                                                        </p>
                                                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(subOrder.order_status)}`}>
                                                            {formatStatus(subOrder.order_status)}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Order Total */}
                                <div className='border-t pt-4'>
                                    <div className='flex justify-between items-center text-lg font-bold'>
                                        <span>Total</span>
                                        <span className='text-red-600'>
                                            {displayCEDICurrency(orderDetails.parentOrder?.totalAmount)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className='p-6 text-center text-gray-500'>
                                Failed to load order details
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}

export default CustomerOrders
