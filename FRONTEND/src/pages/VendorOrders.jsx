import { useEffect, useState } from 'react'
import SummaryApi from '../common'
import displayCEDICurrency from '../helpers/displayCurrency'
import { useNavigate } from 'react-router-dom'
import './VendorPages.css'

const VendorOrders = () => {
    const [orders, setOrders] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, pages: 0 })
    const [filters, setFilters] = useState({ search: '', status: '', sort: 'newest' })
    const [selectedOrder, setSelectedOrder] = useState(null)
    const [invoiceOrder, setInvoiceOrder] = useState(null)
    const [stats, setStats] = useState(null)
    const navigate = useNavigate()

    useEffect(() => {
        fetchOrders()
        fetchStats()
    }, [pagination.page, filters])

    const fetchOrders = async () => {
        setLoading(true)
        try {
            const params = new URLSearchParams({
                page: pagination.page,
                limit: pagination.limit,
                ...filters
            })
            
            const response = await fetch(`${SummaryApi.vendorOrders.url}?${params}`, {
                method: SummaryApi.vendorOrders.method,
                credentials: 'include'
            })
            const data = await response.json()
            
            if (data.success) {
                setOrders(data.data.orders)
                setPagination(prev => ({ ...prev, ...data.data.pagination }))
            } else if (data.message === 'Please login first') {
                navigate('/login')
            } else {
                setError(data.message)
            }
        } catch (error) {
            console.error('Error fetching orders:', error)
            setError('Failed to load orders')
        } finally {
            setLoading(false)
        }
    }

    const fetchStats = async () => {
        try {
            const response = await fetch(SummaryApi.vendorOrderStats.url, {
                method: SummaryApi.vendorOrderStats.method,
                credentials: 'include'
            })
            const data = await response.json()
            
            if (data.success) {
                setStats(data.data)
            }
        } catch (error) {
            console.error('Error fetching stats:', error)
        }
    }

    const handleStatusChange = async (orderId, newStatus) => {
        try {
            const response = await fetch(SummaryApi.updateVendorOrderStatus.url, {
                method: SummaryApi.updateVendorOrderStatus.method,
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ orderId, status: newStatus })
            })
            const data = await response.json()
            
            if (data.success) {
                fetchOrders()
                fetchStats()
            } else {
                alert(data.message)
            }
        } catch (error) {
            console.error('Error updating status:', error)
        }
    }

    const handleMarkFulfilled = async (orderId) => {
        if (!window.confirm('Mark this order as fulfilled?')) return
        
        try {
            const response = await fetch(SummaryApi.updateVendorOrderStatus.url, {
                method: SummaryApi.updateVendorOrderStatus.method,
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ orderId, status: 'fulfilled', note: 'Order fulfilled by vendor' })
            })
            const data = await response.json()
            
            if (data.success) {
                fetchOrders()
                fetchStats()
            } else {
                alert(data.message)
            }
        } catch (error) {
            console.error('Error marking fulfilled:', error)
        }
    }

    const handleRequestRefund = async (orderId) => {
        const note = window.prompt('Enter reason for refund request (optional):')
        
        try {
            const response = await fetch(SummaryApi.requestVendorRefund.url, {
                method: SummaryApi.requestVendorRefund.method,
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ orderId, note: note || 'Refund requested by vendor' })
            })
            const data = await response.json()
            
            if (data.success) {
                alert('Refund request submitted successfully')
                fetchOrders()
                fetchStats()
            } else {
                alert(data.message)
            }
        } catch (error) {
            console.error('Error requesting refund:', error)
        }
    }

    const handleProcessRefund = async (orderId, refundAmount) => {
        const note = window.prompt('Enter reason for refund (optional):')
        
        try {
            const response = await fetch(SummaryApi.processVendorRefund.url, {
                method: SummaryApi.processVendorRefund.method,
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ orderId, note: note || 'Refund processed by vendor' })
            })
            const data = await response.json()
            
            if (data.success) {
                alert('Refund processed successfully')
                fetchOrders()
                fetchStats()
            } else {
                alert(data.message)
            }
        } catch (error) {
            console.error('Error processing refund:', error)
        }
    }

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }))
        setPagination(prev => ({ ...prev, page: 1 }))
    }

    const getStatusOptions = (currentStatus) => {
        const flow = {
            pending: ['processing', 'cancelled'],
            processing: ['shipped', 'cancelled'],
            shipped: ['delivered', 'fulfilled'],
            delivered: ['fulfilled'],
            fulfilled: [],
            refund_requested: [],
            refunded: [],
            cancelled: []
        }
        return flow[currentStatus] || []
    }

    const canMarkFulfilled = (status) => {
        return ['shipped', 'delivered'].includes(status)
    }

    const canRequestRefund = (status) => {
        return ['pending', 'processing', 'shipped', 'delivered'].includes(status)
    }

    const canProcessRefund = (status) => {
        return ['refund_requested', 'cancelled'].includes(status)
    }

    const handlePrintInvoice = async (order) => {
        try {
            const response = await fetch(`${SummaryApi.vendorOrderById.url}/${order._id}`, {
                method: SummaryApi.vendorOrderById.method,
                credentials: 'include'
            })
            const data = await response.json()
            
            if (data.success) {
                setInvoiceOrder(data.data)
            } else {
                setInvoiceOrder(order)
            }
        } catch (error) {
            console.error('Error fetching order for invoice:', error)
            setInvoiceOrder(order)
        }
    }

    return (
        <div className="vendor-orders">
            {/* Stats */}
            <div className="orders-stats">
                <div className="stat-item">
                    <span className="stat-value">{stats?.totalOrders || 0}</span>
                    <span className="stat-label">Total Orders</span>
                </div>
                <div className="stat-item pending">
                    <span className="stat-value">{stats?.pendingOrders || 0}</span>
                    <span className="stat-label">Pending</span>
                </div>
                <div className="stat-item processing">
                    <span className="stat-value">{stats?.processingOrders || 0}</span>
                    <span className="stat-label">Processing</span>
                </div>
                <div className="stat-item shipped">
                    <span className="stat-value">{stats?.shippedOrders || 0}</span>
                    <span className="stat-label">Shipped</span>
                </div>
                <div className="stat-item delivered">
                    <span className="stat-value">{stats?.deliveredOrders || 0}</span>
                    <span className="stat-label">Delivered</span>
                </div>
                <div className="stat-item fulfilled">
                    <span className="stat-value">{stats?.fulfilledOrders || 0}</span>
                    <span className="stat-label">Fulfilled</span>
                </div>
                <div className="stat-item refunded">
                    <span className="stat-value">{stats?.refundedOrders || 0}</span>
                    <span className="stat-label">Refunded</span>
                </div>
                <div className="stat-item revenue">
                    <span className="stat-value">{displayCEDICurrency(stats?.totalRevenue || 0)}</span>
                    <span className="stat-label">Revenue</span>
                </div>
            </div>

            {/* Filters */}
            <div className="orders-filters">
                <div className="search-box">
                    <span>🔍</span>
                    <input 
                        type="text" 
                        placeholder="Search by order ID..."
                        value={filters.search}
                        onChange={(e) => handleFilterChange('search', e.target.value)}
                    />
                </div>
                <select 
                    value={filters.status}
                    onChange={(e) => handleFilterChange('status', e.target.value)}
                >
                    <option value="">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="fulfilled">Fulfilled</option>
                    <option value="refund_requested">Refund Requested</option>
                    <option value="refunded">Refunded</option>
                    <option value="cancelled">Cancelled</option>
                </select>
                <select 
                    value={filters.sort}
                    onChange={(e) => handleFilterChange('sort', e.target.value)}
                >
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                    <option value="price_asc">Amount: Low to High</option>
                    <option value="price_desc">Amount: High to Low</option>
                </select>
            </div>

            {/* Orders Table */}
            <div className="orders-table-wrapper">
                {loading ? (
                    <div className="loading-container">
                        <div className="spinner"></div>
                    </div>
                ) : orders.length > 0 ? (
                    <table className="orders-table">
                        <thead>
                            <tr>
                                <th>Order ID</th>
                                <th>Product</th>
                                <th>Customer</th>
                                <th>Amount</th>
                                <th>Status</th>
                                <th>Date</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.map(order => (
                                <tr key={order._id}>
                                    <td>
                                        <span className="order-id">#{order.orderId}</span>
                                    </td>
                                    <td>
                                        <div className="product-cell">
                                            <div className="product-image">
                                                {order.productId?.productImage?.[0] ? (
                                                    <img src={order.productId.productImage[0]} alt="" />
                                                ) : (
                                                    <span>📦</span>
                                                )}
                                            </div>
                                            <div className="product-info">
                                                <span className="product-name">{order.productId?.productName || 'Product'}</span>
                                                <span className="product-brand">{order.productId?.brandName}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="customer-cell">
                                            <span className="customer-name">{order.userId?.name || 'Unknown'}</span>
                                            <span className="customer-email">{order.userId?.email}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <span className="amount">{displayCEDICurrency(order.totalAmt)}</span>
                                    </td>
                                    <td>
                                        <div className="status-cell">
                                            <select 
                                                value={order.order_status}
                                                onChange={(e) => handleStatusChange(order._id, e.target.value)}
                                                className={`status-select ${order.order_status}`}
                                                disabled={getStatusOptions(order.order_status).length === 0}
                                            >
                                                <option value={order.order_status}>{order.order_status}</option>
                                                {getStatusOptions(order.order_status).map(status => (
                                                    <option key={status} value={status}>{status}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </td>
                                    <td>
                                        <span className="date">
                                            {new Date(order.createdAt).toLocaleDateString()}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="action-buttons">
                                            <button 
                                                className="btn-view"
                                                onClick={() => setSelectedOrder(order)}
                                            >
                                                View Details
                                            </button>
                                            {canMarkFulfilled(order.order_status) && (
                                                <button 
                                                    className="btn-fulfilled"
                                                    onClick={() => handleMarkFulfilled(order._id)}
                                                >
                                                    ✓ Fulfilled
                                                </button>
                                            )}
                                            {canRequestRefund(order.order_status) && order.order_status !== 'fulfilled' && (
                                                <button 
                                                    className="btn-refund"
                                                    onClick={() => handleRequestRefund(order._id)}
                                                >
                                                    ↩️ Refund
                                                </button>
                                            )}
                                            {canProcessRefund(order.order_status) && (
                                                <button 
                                                    className="btn-process-refund"
                                                    onClick={() => handleProcessRefund(order._id)}
                                                >
                                                    ✓ Process Refund
                                                </button>
                                            )}
                                            <button 
                                                className="btn-print"
                                                onClick={() => handlePrintInvoice(order)}
                                            >
                                                🖨️ Invoice
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <div className="empty-state">
                        <span>📭</span>
                        <h3>No orders found</h3>
                        <p>Orders will appear here when customers purchase your products</p>
                    </div>
                )}
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
                <div className="pagination">
                    <button 
                        disabled={pagination.page === 1}
                        onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                    >
                        Previous
                    </button>
                    <span>Page {pagination.page} of {pagination.pages}</span>
                    <button 
                        disabled={pagination.page === pagination.pages}
                        onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                    >
                        Next
                    </button>
                </div>
            )}

            {/* Order Details Modal */}
            {selectedOrder && (
                <OrderDetailsModal 
                    order={selectedOrder}
                    onClose={() => setSelectedOrder(null)}
                    onStatusChange={handleStatusChange}
                    fetchOrderDetails={async (orderId) => {
                        try {
                            const response = await fetch(`${SummaryApi.vendorOrderById.url}/${orderId}`, {
                                method: SummaryApi.vendorOrderById.method,
                                credentials: 'include'
                            })
                            const data = await response.json()
                            if (data.success) {
                                return data.data
                            }
                        } catch (error) {
                            console.error('Error fetching order details:', error)
                        }
                        return selectedOrder
                    }}
                />
            )}

            {/* Invoice Modal */}
            {invoiceOrder && (
                <InvoiceModal 
                    order={invoiceOrder}
                    onClose={() => setInvoiceOrder(null)}
                />
            )}
        </div>
    )
}

const InvoiceModal = ({ order, onClose }) => {
    const handlePrint = () => {
        const printContent = document.getElementById('invoice-content')
        const printWindow = window.open('', '_blank')
        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Invoice #${order.orderId}</title>
                <style>
                    body { font-family: Arial, sans-serif; padding: 20px; }
                    .invoice-header { text-align: center; margin-bottom: 30px; }
                    .invoice-title { font-size: 24px; font-weight: bold; }
                    .invoice-details { margin-bottom: 20px; }
                    .invoice-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
                    .invoice-table th, .invoice-table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                    .invoice-table th { background-color: #f5f5f5; }
                    .invoice-total { text-align: right; font-size: 18px; font-weight: bold; }
                    .invoice-footer { margin-top: 40px; text-align: center; color: #666; }
                    .vendor-info { margin-bottom: 20px; }
                </style>
            </head>
            <body>
                ${printContent.innerHTML}
            </body>
            </html>
        `)
        printWindow.document.close()
        printWindow.print()
    }

    if (!order) return null

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content invoice-modal" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Invoice</h2>
                    <button className="close-btn" onClick={onClose}>×</button>
                </div>
                
                <div className="invoice-actions">
                    <button className="btn-primary" onClick={handlePrint}>
                        🖨️ Print Invoice
                    </button>
                </div>

                <div className="invoice-content" id="invoice-content">
                    <div className="invoice-header">
                        <div className="invoice-title">INVOICE</div>
                        <div className="invoice-number">#{order.orderId}</div>
                    </div>

                    <div className="vendor-info">
                        <strong>From:</strong><br/>
                        LockerRoom Store<br/>
                        orders@lockerroom.com<br/>
                    </div>

                    <div className="customer-info">
                        <strong>Bill To:</strong><br/>
                        {order.userId?.name}<br/>
                        {order.userId?.email && <>{order.userId.email}<br/></>}
                        {order.delivery_address && <>{order.delivery_address}<br/></>}
                    </div>

                    <table className="invoice-table">
                        <thead>
                            <tr>
                                <th>Item</th>
                                <th>Qty</th>
                                <th>Price</th>
                                <th>Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>
                                    <strong>{order.productId?.productName}</strong><br/>
                                    <small>{order.productId?.brandName}</small>
                                </td>
                                <td>1</td>
                                <td>{displayCEDICurrency(order.subTotalAmt)}</td>
                                <td>{displayCEDICurrency(order.subTotalAmt)}</td>
                            </tr>
                        </tbody>
                    </table>

                    <div className="invoice-totals">
                        <div className="invoice-row">
                            <span>Subtotal:</span>
                            <span>{displayCEDICurrency(order.subTotalAmt)}</span>
                        </div>
                        {order.discount > 0 && (
                            <div className="invoice-row">
                                <span>Discount:</span>
                                <span>-{displayCEDICurrency(order.discount)}</span>
                            </div>
                        )}
                        <div className="invoice-row total">
                            <span>Total:</span>
                            <span>{displayCEDICurrency(order.totalAmt)}</span>
                        </div>
                    </div>

                    <div className="invoice-footer">
                        <p>Thank you for your business!</p>
                        <p>Invoice Date: {new Date(order.createdAt).toLocaleDateString()}</p>
                    </div>
                </div>
            </div>
        </div>
    )
}

const OrderDetailsModal = ({ order, onClose, onStatusChange, fetchOrderDetails }) => {
    const [fullOrder, setFullOrder] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const loadFullOrder = async () => {
            if (fetchOrderDetails) {
                const details = await fetchOrderDetails(order._id)
                setFullOrder(details)
            } else {
                setFullOrder(order)
            }
            setLoading(false)
        }
        loadFullOrder()
    }, [order])

    const getStatusOptions = (currentStatus) => {
        const flow = {
            pending: ['processing', 'cancelled'],
            processing: ['shipped', 'cancelled'],
            shipped: ['delivered'],
            delivered: [],
            cancelled: []
        }
        return flow[currentStatus] || []
    }

    if (loading) {
        return (
            <div className="modal-overlay" onClick={onClose}>
                <div className="modal-content order-modal" onClick={e => e.stopPropagation()}>
                    <div className="loading-container">
                        <div className="spinner"></div>
                    </div>
                </div>
            </div>
        )
    }

    const orderData = fullOrder || order

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content order-modal" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Order #{orderData.orderId}</h2>
                    <button className="close-btn" onClick={onClose}>×</button>
                </div>
                
                <div className="order-details-content">
                    <div className="detail-section">
                        <h3>Product</h3>
                        <div className="product-detail">
                            <div className="product-image">
                                {orderData.productId?.productImage?.[0] ? (
                                    <img src={orderData.productId.productImage[0]} alt="" />
                                ) : (
                                    <span>📦</span>
                                )}
                            </div>
                            <div className="product-info">
                                <span className="name">{orderData.productId?.productName}</span>
                                <span className="brand">{orderData.productId?.brandName}</span>
                                <span className="price">
                                    {displayCEDICurrency(orderData.productId?.sellingPrice || orderData.subTotalAmt)}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="detail-section">
                        <h3>Customer Information</h3>
                        <div className="customer-detail">
                            <p><strong>Name:</strong> {orderData.userId?.name}</p>
                            <p><strong>Email:</strong> {orderData.userId?.email}</p>
                            <p><strong>Phone:</strong> {orderData.userId?.mobile || 'N/A'}</p>
                        </div>
                    </div>

                    {orderData.delivery_address && (
                        <div className="detail-section">
                            <h3>Delivery Address</h3>
                            <div className="address-detail">
                                <p>{orderData.delivery_address}</p>
                            </div>
                        </div>
                    )}

                    {orderData.payment_mode && (
                        <div className="detail-section">
                            <h3>Payment Details</h3>
                            <div className="payment-detail">
                                <p><strong>Payment Mode:</strong> {orderData.payment_mode}</p>
                                <p><strong>Payment Status:</strong> 
                                    <span className={`payment-status ${orderData.payment_status}`}>
                                        {orderData.payment_status || 'Pending'}
                                    </span>
                                </p>
                            </div>
                        </div>
                    )}

                    <div className="detail-section">
                        <h3>Order Status</h3>
                        <div className="status-history">
                            {orderData.order_status_history?.map((item, index) => (
                                <div key={index} className="history-item">
                                    <span className={`status-badge ${item.status}`}>{item.status}</span>
                                    <span className="date">{new Date(item.updatedAt).toLocaleString()}</span>
                                    {item.note && <p className="note">{item.note}</p>}
                                </div>
                            ))}
                        </div>
                        
                        {getStatusOptions(orderData.order_status).length > 0 && (
                            <div className="status-update">
                                <label>Update Status:</label>
                                <select 
                                    className={`status-select ${orderData.order_status}`}
                                    onChange={(e) => {
                                        onStatusChange(orderData._id, e.target.value)
                                        onClose()
                                    }}
                                >
                                    <option value="">Select Status</option>
                                    {getStatusOptions(orderData.order_status).map(status => (
                                        <option key={status} value={status}>{status}</option>
                                    ))}
                                </select>
                            </div>
                        )}
                    </div>

                    <div className="detail-section">
                        <h3>Order Summary</h3>
                        <div className="summary">
                            <div className="summary-row">
                                <span>Subtotal</span>
                                <span>{displayCEDICurrency(orderData.subTotalAmt)}</span>
                            </div>
                            {orderData.discount > 0 && (
                                <div className="summary-row">
                                    <span>Discount</span>
                                    <span>-{displayCEDICurrency(orderData.discount)}</span>
                                </div>
                            )}
                            <div className="summary-row total">
                                <span>Total</span>
                                <span>{displayCEDICurrency(orderData.totalAmt)}</span>
                            </div>
                        </div>
                    </div>

                    <div className="detail-section">
                        <h3>Order Date</h3>
                        <p>{orderData.createdAt ? new Date(orderData.createdAt).toLocaleString() : '-'}</p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default VendorOrders
