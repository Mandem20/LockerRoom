import React, { useEffect, useState } from 'react'
import SummaryApi from '../common'
import { toast } from 'react-toastify'
import { useNavigate, useOutletContext } from 'react-router-dom'
import { FaBox, FaEye, FaMapMarkerAlt, FaCreditCard, FaShippingFast, FaCheckCircle, FaClock, FaPhone, FaEnvelope, FaTrash, FaDownload, FaPrint } from 'react-icons/fa'

const CustomerOrders = () => {
    const navigate = useNavigate()
    const { user } = useOutletContext()
    const [orders, setOrders] = useState([])
    const [loading, setLoading] = useState(true)
    const [selectedOrder, setSelectedOrder] = useState(null)

    useEffect(() => {
        fetchOrders()
    }, [])

    const fetchOrders = async () => {
        setLoading(true)
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

    const downloadInvoice = (order) => {
        const subtotal = (order.totalAmt || 0) / 1.15
        const tax = (order.totalAmt || 0) - subtotal
        
        const invoiceContent = `
====================================
            LOCKERROOM INVOICE
====================================

Order ID: #${order._id?.slice(-8)}
Date: ${new Date(order.createdAt).toLocaleDateString()}

------------------------------------
CUSTOMER DETAILS
------------------------------------
Name: ${user?.name || 'N/A'}
Email: ${user?.email || 'N/A'}
Phone: ${user?.phone || 'N/A'}

------------------------------------
ORDER DETAILS
------------------------------------
Product: ${order.product_details?.name || 'N/A'}
Category: ${order.product_details?.category || 'N/A'}
Quantity: ${order.quantity}

------------------------------------
PAYMENT SUMMARY
------------------------------------
Subtotal:    GHS ${subtotal.toFixed(2)}
Tax (15%):   GHS ${tax.toFixed(2)}
Shipping:    GHS ${order.shippingCost || 0}
------------------------------------
TOTAL:       GHS ${order.totalAmt?.toFixed(2)}

Payment Status: ${order.payment_status}
Order Status: ${order.order_status}

${order.delivery_address ? `------------------------------------
DELIVERY ADDRESS
------------------------------------
${order.delivery_address}
` : ''}
====================================
     Thank you for shopping with us!
====================================
        `
        
        const blob = new Blob([invoiceContent], { type: 'text/plain' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `invoice-${order._id?.slice(-8)}.txt`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
        toast.success('Invoice downloaded')
    }

    const printInvoice = (order) => {
        const subtotal = (order.totalAmt || 0) / 1.15
        const tax = (order.totalAmt || 0) - subtotal
        const printWindow = window.open('', '_blank')
        
        printWindow.document.write(`
            <html>
            <head>
                <title>Invoice #${order._id?.slice(-8)}</title>
                <style>
                    body { font-family: Arial, sans-serif; padding: 20px; }
                    .header { text-align: center; margin-bottom: 20px; }
                    .section { margin: 15px 0; }
                    .row { display: flex; justify-content: space-between; }
                    .total { font-weight: bold; font-size: 18px; }
                </style>
            </head>
            <body>
                <div class="header">
                    <h1>LOCKERROOM</h1>
                    <p>Invoice #${order._id?.slice(-8)}</p>
                    <p>Date: ${new Date(order.createdAt).toLocaleDateString()}</p>
                </div>
                <div class="section">
                    <h3>Customer Details</h3>
                    <p>Name: ${user?.name || 'N/A'}</p>
                    <p>Email: ${user?.email || 'N/A'}</p>
                    <p>Phone: ${user?.phone || 'N/A'}</p>
                </div>
                <div class="section">
                    <h3>Order Details</h3>
                    <p>Product: ${order.product_details?.name || 'N/A'}</p>
                    <p>Category: ${order.product_details?.category || 'N/A'}</p>
                    <p>Quantity: ${order.quantity}</p>
                </div>
                <div class="section">
                    <h3>Payment Summary</h3>
                    <div class="row"><span>Subtotal:</span><span>GHS ${subtotal.toFixed(2)}</span></div>
                    <div class="row"><span>Tax (15%):</span><span>GHS ${tax.toFixed(2)}</span></div>
                    <div class="row"><span>Shipping:</span><span>GHS ${order.shippingCost || 0}</span></div>
                    <div class="row total"><span>TOTAL:</span><span>GHS ${order.totalAmt?.toFixed(2)}</span></div>
                </div>
                ${order.delivery_address ? `
                <div class="section">
                    <h3>Delivery Address</h3>
                    <p>${order.delivery_address}</p>
                </div>
                ` : ''}
                <div style="text-align: center; margin-top: 30px;">
                    <p>Thank you for shopping with us!</p>
                </div>
            </body>
            </html>
        `)
        printWindow.document.close()
        printWindow.print()
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
                                    <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase'>Product</th>
                                    <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase'>Amount</th>
                                    <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase'>Payment</th>
                                    <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase'>Status</th>
                                    <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase'>Action</th>
                                </tr>
                            </thead>
                            <tbody className='divide-y divide-gray-200'>
                                {orders.map((order) => (
                                    <tr key={order._id} className='hover:bg-gray-50'>
                                        <td className='px-4 py-4 text-sm font-medium text-gray-800'>
                                            #{order._id?.slice(-8)}
                                        </td>
                                        <td className='px-4 py-4 text-sm text-gray-500'>
                                            {new Date(order.createdAt).toLocaleDateString('en-US', {
                                                year: 'numeric',
                                                month: 'short',
                                                day: 'numeric'
                                            })}
                                        </td>
                                        <td className='px-4 py-4'>
                                            <div className='flex items-center gap-3'>
                                                {order.product_details?.productImage?.[0] && (
                                                    <img 
                                                        src={order.product_details.productImage[0]} 
                                                        alt={order.product_details.name}
                                                        className='w-10 h-10 object-cover rounded'
                                                    />
                                                )}
                                                <span className='text-sm text-gray-800 max-w-[200px] truncate'>
                                                    {order.product_details?.name}
                                                </span>
                                            </div>
                                        </td>
                                        <td className='px-4 py-4 text-sm font-medium text-gray-800'>
                                            GHS {order.totalAmt?.toFixed(2)}
                                        </td>
                                        <td className='px-4 py-4'>
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPaymentStatusColor(order.payment_status)}`}>
                                                {order.payment_status}
                                            </span>
                                        </td>
                                        <td className='px-4 py-4'>
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.order_status)}`}>
                                                {order.order_status}
                                            </span>
                                        </td>
                                        <td className='px-4 py-4'>
                                            <div className='flex items-center gap-2'>
                                                <button 
                                                    onClick={() => setSelectedOrder(order)}
                                                    className='text-gray-500 hover:text-red-600'
                                                    title='View Details'
                                                >
                                                    <FaEye className='text-lg' />
                                                </button>
                                                <button 
                                                    onClick={() => downloadInvoice(order)}
                                                    className='text-gray-500 hover:text-red-600'
                                                    title='Download Invoice'
                                                >
                                                    <FaDownload className='text-lg' />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {selectedOrder && (
                <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4'>
                    <div className='bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto'>
                        <div className='sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center'>
                            <div>
                                <h2 className='text-xl font-bold text-gray-800'>Order Details</h2>
                                <p className='text-sm text-gray-500'>Order #{selectedOrder._id?.slice(-8)}</p>
                            </div>
                            <button 
                                onClick={() => setSelectedOrder(null)}
                                className='text-gray-400 hover:text-gray-600 text-2xl'
                            >
                                &times;
                            </button>
                        </div>
                        
                        <div className='p-6 space-y-6'>
                            <div className='grid grid-cols-2 gap-4'>
                                <div className='bg-gray-50 p-4 rounded-lg'>
                                    <p className='text-xs text-gray-500 mb-1'>Order Date</p>
                                    <p className='font-medium'>{new Date(selectedOrder.createdAt).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                                </div>
                                <div className='bg-gray-50 p-4 rounded-lg'>
                                    <p className='text-xs text-gray-500 mb-1'>Estimated Delivery</p>
                                    <p className='font-medium'>
                                        {selectedOrder.order_status === 'Delivered' ? 'Delivered' : 
                                         new Date(new Date(selectedOrder.createdAt).getTime() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                    </p>
                                </div>
                            </div>

                            <div>
                                <h3 className='font-semibold text-gray-800 mb-3 flex items-center gap-2'>
                                    <FaBox className='text-red-600' /> Product Details
                                </h3>
                                <div className='border rounded-lg p-4'>
                                    <div className='flex gap-4'>
                                        {selectedOrder.product_details?.productImage?.[0] && (
                                            <img 
                                                src={selectedOrder.product_details.productImage[0]} 
                                                alt={selectedOrder.product_details.name}
                                                className='w-24 h-24 object-cover rounded-lg'
                                            />
                                        )}
                                        <div className='flex-1'>
                                            <p className='font-semibold text-gray-800'>{selectedOrder.product_details?.name}</p>
                                            <p className='text-sm text-gray-500'>{selectedOrder.product_details?.category}</p>
                                            <p className='text-sm text-gray-500'>Qty: {selectedOrder.quantity}</p>
                                            <p className='font-medium mt-2'>GHS {selectedOrder.product_details?.sellingPrice}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h3 className='font-semibold text-gray-800 mb-3 flex items-center gap-2'>
                                    <FaCreditCard className='text-red-600' /> Payment Information
                                </h3>
                                <div className='border rounded-lg p-4 space-y-2'>
                                    <div className='flex justify-between'>
                                        <span className='text-gray-500'>Subtotal</span>
                                        <span className='font-medium'>GHS {((selectedOrder.totalAmt || 0) / 1.15).toFixed(2)}</span>
                                    </div>
                                    <div className='flex justify-between'>
                                        <span className='text-gray-500'>Tax (15%)</span>
                                        <span className='font-medium'>GHS {((selectedOrder.totalAmt || 0) - ((selectedOrder.totalAmt || 0) / 1.15)).toFixed(2)}</span>
                                    </div>
                                    <div className='flex justify-between'>
                                        <span className='text-gray-500'>Shipping</span>
                                        <span className='font-medium'>GHS {selectedOrder.shippingCost || 0}</span>
                                    </div>
                                    <div className='flex justify-between pt-2 border-t'>
                                        <span className='font-semibold'>Total</span>
                                        <span className='font-bold text-lg'>GHS {selectedOrder.totalAmt?.toFixed(2)}</span>
                                    </div>
                                    <div className='flex justify-between pt-2'>
                                        <span className='text-gray-500'>Payment Method</span>
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPaymentStatusColor(selectedOrder.payment_status)}`}>
                                            {selectedOrder.payment_status}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h3 className='font-semibold text-gray-800 mb-3 flex items-center gap-2'>
                                    <FaMapMarkerAlt className='text-red-600' /> Delivery Address
                                </h3>
                                <div className='border rounded-lg p-4'>
                                    {selectedOrder.delivery_address ? (
                                        <p className='text-gray-700'>{selectedOrder.delivery_address}</p>
                                    ) : (
                                        <p className='text-gray-500 italic'>No delivery address provided</p>
                                    )}
                                </div>
                            </div>

                            <div>
                                <h3 className='font-semibold text-gray-800 mb-3 flex items-center gap-2'>
                                    <FaShippingFast className='text-red-600' /> Order Status
                                </h3>
                                <div className='border rounded-lg p-4'>
                                    <div className='flex items-center justify-between mb-4'>
                                        <span className='text-gray-500'>Current Status</span>
                                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedOrder.order_status)}`}>
                                            {selectedOrder.order_status}
                                        </span>
                                    </div>
                                    <div className='space-y-3'>
                                        {['Pending', 'Processing', 'Shipped', 'Delivered'].map((status, index) => {
                                            const statuses = ['Pending', 'Processing', 'Shipped', 'Delivered']
                                            const currentIndex = statuses.indexOf(selectedOrder.order_status)
                                            const isCompleted = currentIndex >= index
                                            const isCurrent = currentIndex === index
                                            
                                            return (
                                                <div key={status} className='flex items-center gap-3'>
                                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                                        isCompleted ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-400'
                                                    }`}>
                                                        {isCompleted ? <FaCheckCircle /> : <FaClock />}
                                                    </div>
                                                    <div className='flex-1'>
                                                        <p className={`text-sm font-medium ${isCurrent ? 'text-gray-800' : isCompleted ? 'text-gray-600' : 'text-gray-400'}`}>
                                                            {status}
                                                        </p>
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>
                            </div>

                            {user && (
                                <div>
                                    <h3 className='font-semibold text-gray-800 mb-3 flex items-center gap-2'>
                                        <FaEnvelope className='text-red-600' /> Contact Info
                                    </h3>
                                    <div className='border rounded-lg p-4 space-y-2'>
                                        <p className='text-gray-700'><span className='font-medium'>Name:</span> {user.name}</p>
                                        <p className='text-gray-700'><span className='font-medium'>Email:</span> {user.email}</p>
                                        {user.phone && <p className='text-gray-700'><span className='font-medium'>Phone:</span> {user.phone}</p>}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className='border-t px-6 py-4 flex flex-wrap justify-between gap-3'>
                            <div className='flex gap-2'>
                                <button 
                                    onClick={() => downloadInvoice(selectedOrder)}
                                    className='px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 flex items-center gap-2'
                                >
                                    <FaDownload /> Download Invoice
                                </button>
                                <button 
                                    onClick={() => printInvoice(selectedOrder)}
                                    className='px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 flex items-center gap-2'
                                >
                                    <FaPrint /> Print
                                </button>
                            </div>
                            <div className='flex gap-2'>
                                {selectedOrder.order_status !== 'Cancelled' && selectedOrder.order_status !== 'Delivered' && (
                                    <button 
                                        className='px-4 py-2 border border-red-600 text-red-600 rounded-lg hover:bg-red-50 flex items-center gap-2'
                                        onClick={() => {
                                            toast.success('Cancel request submitted')
                                            setSelectedOrder(null)
                                        }}
                                    >
                                        <FaTrash /> Cancel Order
                                    </button>
                                )}
                                <button 
                                    onClick={() => setSelectedOrder(null)}
                                    className='px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200'
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default CustomerOrders
