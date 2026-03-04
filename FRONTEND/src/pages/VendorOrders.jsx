import { useEffect, useState } from 'react'
import SummaryApi from '../common'
import displayCEDICurrency from '../helpers/displayCurrency'
import { useNavigate } from 'react-router-dom'

const VendorOrders = () => {
    const [orders, setOrders] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, pages: 0 })
    const [filters, setFilters] = useState({ search: '', status: '', sort: 'newest' })
    const [selectedOrder, setSelectedOrder] = useState(null)
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

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }))
        setPagination(prev => ({ ...prev, page: 1 }))
    }

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
                                        <button 
                                            className="btn-view"
                                            onClick={() => setSelectedOrder(order)}
                                        >
                                            View Details
                                        </button>
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
                />
            )}
        </div>
    )
}

const OrderDetailsModal = ({ order, onClose, onStatusChange }) => {
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

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content order-modal" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Order #{order.orderId}</h2>
                    <button className="close-btn" onClick={onClose}>×</button>
                </div>
                
                <div className="order-details-content">
                    <div className="detail-section">
                        <h3>Product</h3>
                        <div className="product-detail">
                            <div className="product-image">
                                {order.productId?.productImage?.[0] ? (
                                    <img src={order.productId.productImage[0]} alt="" />
                                ) : (
                                    <span>📦</span>
                                )}
                            </div>
                            <div className="product-info">
                                <span className="name">{order.productId?.productName}</span>
                                <span className="brand">{order.productId?.brandName}</span>
                                <span className="price">{displayCEDICurrency(order.totalAmt)}</span>
                            </div>
                        </div>
                    </div>

                    <div className="detail-section">
                        <h3>Customer Information</h3>
                        <div className="customer-detail">
                            <p><strong>Name:</strong> {order.userId?.name}</p>
                            <p><strong>Email:</strong> {order.userId?.email}</p>
                            <p><strong>Phone:</strong> {order.userId?.mobile || 'N/A'}</p>
                        </div>
                    </div>

                    <div className="detail-section">
                        <h3>Order Status</h3>
                        <div className="status-history">
                            {order.order_status_history?.map((item, index) => (
                                <div key={index} className="history-item">
                                    <span className={`status-badge ${item.status}`}>{item.status}</span>
                                    <span className="date">{new Date(item.updatedAt).toLocaleString()}</span>
                                    {item.note && <p className="note">{item.note}</p>}
                                </div>
                            ))}
                        </div>
                        
                        {getStatusOptions(order.order_status).length > 0 && (
                            <div className="status-update">
                                <label>Update Status:</label>
                                <select 
                                    className={`status-select ${order.order_status}`}
                                    onChange={(e) => {
                                        onStatusChange(order._id, e.target.value)
                                        onClose()
                                    }}
                                >
                                    <option value="">Select Status</option>
                                    {getStatusOptions(order.order_status).map(status => (
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
                                <span>{displayCEDICurrency(order.subTotalAmt)}</span>
                            </div>
                            <div className="summary-row">
                                <span>Total</span>
                                <span>{displayCEDICurrency(order.totalAmt)}</span>
                            </div>
                            <div className="summary-row">
                                <span>Payment Status</span>
                                <span className={`payment-status ${order.payment_status}`}>
                                    {order.payment_status || 'Pending'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default VendorOrders
