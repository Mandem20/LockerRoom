import React, { useEffect, useState } from 'react'
import SummaryApi from '../common'
import { toast } from 'react-toastify'
import { FaEye, FaSearch, FaFilter, FaTimes, FaCheck, FaExclamationTriangle, FaBox, FaShippingFast, FaUserShield, FaChartLine } from 'react-icons/fa'
import displayCEDICurrency from '../helpers/displayCurrency'

const VendorOrderManagement = () => {
    const [orders, setOrders] = useState([])
    const [vendors, setVendors] = useState([])
    const [loading, setLoading] = useState(true)
    const [selectedOrder, setSelectedOrder] = useState(null)
    const [showViewModal, setShowViewModal] = useState(false)
    const [showDisputeModal, setShowDisputeModal] = useState(false)
    const [disputeData, setDisputeData] = useState({ resolution: '', refundAmount: 0 })
    const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 })
    const [filters, setFilters] = useState({
        search: '',
        status: '',
        vendorId: ''
    })
    const [stats, setStats] = useState([])
    const [showStatsModal, setShowStatsModal] = useState(false)

    const fetchOrders = async (page = 1) => {
        setLoading(true)
        try {
            const params = new URLSearchParams({
                page,
                limit: 20,
                ...filters
            })
            
            Object.keys(filters).forEach(key => {
                if (filters[key]) {
                    params.set(key, filters[key])
                }
            })

            const response = await fetch(`${SummaryApi.getAllVendorOrders.url}?${params}`, {
                method: SummaryApi.getAllVendorOrders.method,
                credentials: 'include'
            })
            const data = await response.json()
            
            if (data.success) {
                setOrders(data.data.orders)
                setVendors(data.data.vendors)
                setPagination(data.data.pagination)
            }
        } catch (error) {
            toast.error('Failed to fetch orders')
        } finally {
            setLoading(false)
        }
    }

    const fetchVendorStats = async () => {
        try {
            const response = await fetch(SummaryApi.getVendorOrderStats.url, {
                method: SummaryApi.getVendorOrderStats.method,
                credentials: 'include'
            })
            const data = await response.json()
            
            if (data.success) {
                setStats(data.data)
            }
        } catch (error) {
            console.error('Failed to fetch stats:', error)
        }
    }

    useEffect(() => {
        fetchOrders()
    }, [])

    useEffect(() => {
        const delaySearch = setTimeout(() => {
            fetchOrders(1)
        }, 500)
        return () => clearTimeout(delaySearch)
    }, [filters])

    const handleViewOrder = (order) => {
        setSelectedOrder(order)
        setShowViewModal(true)
    }

    const handleOverrideStatus = async (orderId, newStatus) => {
        const reason = prompt(`Enter reason for changing status to ${newStatus}:`)
        if (reason === null) return

        try {
            const response = await fetch(SummaryApi.overrideOrderStatus.url, {
                method: SummaryApi.overrideOrderStatus.method,
                credentials: 'include',
                headers: { 'content-type': 'application/json' },
                body: JSON.stringify({ orderId, newStatus, reason })
            })
            const data = await response.json()
            
            if (data.success) {
                toast.success('Order status overridden')
                fetchOrders(pagination.page)
                setShowViewModal(false)
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            toast.error('Failed to update status')
        }
    }

    const handleCancelOrder = async (orderId) => {
        const reason = prompt('Enter reason for cancellation:')
        if (reason === null) return

        try {
            const response = await fetch(SummaryApi.adminCancelOrder.url, {
                method: SummaryApi.adminCancelOrder.method,
                credentials: 'include',
                headers: { 'content-type': 'application/json' },
                body: JSON.stringify({ orderId, reason })
            })
            const data = await response.json()
            
            if (data.success) {
                toast.success('Order cancelled')
                fetchOrders(pagination.page)
                setShowViewModal(false)
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            toast.error('Failed to cancel order')
        }
    }

    const handleResolveDispute = async (orderId) => {
        try {
            const response = await fetch(SummaryApi.resolveDispute.url, {
                method: SummaryApi.resolveDispute.method,
                credentials: 'include',
                headers: { 'content-type': 'application/json' },
                body: JSON.stringify({ 
                    orderId, 
                    resolution: disputeData.resolution,
                    refundAmount: disputeData.refundAmount
                })
            })
            const data = await response.json()
            
            if (data.success) {
                toast.success('Dispute resolved')
                setShowDisputeModal(false)
                setDisputeData({ resolution: '', refundAmount: 0 })
                fetchOrders(pagination.page)
                setShowViewModal(false)
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            toast.error('Failed to resolve dispute')
        }
    }

    const getStatusColor = (status) => {
        switch (status) {
            case 'pending': return 'bg-yellow-100 text-yellow-800'
            case 'processing': return 'bg-blue-100 text-blue-800'
            case 'shipped': return 'bg-purple-100 text-purple-800'
            case 'delivered': return 'bg-green-100 text-green-800'
            case 'cancelled': return 'bg-red-100 text-red-800'
            default: return 'bg-gray-100 text-gray-800'
        }
    }

    const getPaymentStatusColor = (status) => {
        switch (status) {
            case 'paid': return 'bg-green-100 text-green-800'
            case 'pending': return 'bg-yellow-100 text-yellow-800'
            case 'refunded': return 'bg-purple-100 text-purple-800'
            default: return 'bg-gray-100 text-gray-800'
        }
    }

    return (
        <div className="vpm-container">
            <div className="vpm-header">
                <div className="vpm-header-left">
                    <h1><FaShippingFast className="header-icon" /> Vendor Order Management</h1>
                    <p>Monitor, manage, and resolve issues with vendor orders</p>
                </div>
                <div className="vpm-header-actions">
                    <button 
                        className="btn-primary"
                        onClick={() => { fetchVendorStats(); setShowStatsModal(true) }}
                    >
                        <FaChartLine /> Vendor Performance
                    </button>
                </div>
            </div>

            <div className="vpm-stats-grid">
                <div className="vpm-stat-card total">
                    <div className="vpm-stat-icon"><FaBox /></div>
                    <div className="vpm-stat-info">
                        <span className="vpm-stat-value">{pagination.total}</span>
                        <span className="vpm-stat-label">Total Orders</span>
                    </div>
                </div>
                <div className="vpm-stat-card pending">
                    <div className="vpm-stat-icon"><FaExclamationTriangle /></div>
                    <div className="vpm-stat-info">
                        <span className="vpm-stat-value">{orders.filter(o => o.order_status === 'pending').length}</span>
                        <span className="vpm-stat-label">Pending</span>
                    </div>
                </div>
                <div className="vpm-stat-card shipped">
                    <div className="vpm-stat-icon"><FaShippingFast /></div>
                    <div className="vpm-stat-info">
                        <span className="vpm-stat-value">{orders.filter(o => o.order_status === 'shipped').length}</span>
                        <span className="vpm-stat-label">Shipped</span>
                    </div>
                </div>
                <div className="vpm-stat-card resolved">
                    <div className="vpm-stat-icon"><FaUserShield /></div>
                    <div className="vpm-stat-info">
                        <span className="vpm-stat-value">{orders.filter(o => o.order_status === 'delivered').length}</span>
                        <span className="vpm-stat-label">Delivered</span>
                    </div>
                </div>
            </div>

            <div className="vpm-content-card">
                <div className="vpm-toolbar">
                    <div className="vpm-search-wrapper">
                        <FaSearch className="search-icon" />
                        <input 
                            type="text" 
                            placeholder="Search by order ID or product..." 
                            value={filters.search}
                            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                            className="vpm-search-input"
                        />
                    </div>
                    <div className="vpm-toolbar-actions">
                        <div className="vpm-filter-group">
                            <FaFilter className="filter-icon" />
                            <select 
                                value={filters.vendorId} 
                                onChange={(e) => setFilters({ ...filters, vendorId: e.target.value })}
                                className="vpm-filter-select"
                            >
                                <option value="">All Vendors</option>
                                {vendors.map(v => (
                                    <option key={v._id} value={v._id}>{v.businessName}</option>
                                ))}
                            </select>
                        </div>
                        <div className="vpm-filter-group">
                            <FaFilter className="filter-icon" />
                            <select 
                                value={filters.status} 
                                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                                className="vpm-filter-select"
                            >
                                <option value="">All Status</option>
                                <option value="pending">Pending</option>
                                <option value="processing">Processing</option>
                                <option value="shipped">Shipped</option>
                                <option value="delivered">Delivered</option>
                                <option value="cancelled">Cancelled</option>
                            </select>
                        </div>
                        <span className="vpm-result-count">{pagination.total} orders</span>
                    </div>
                </div>

                <div className="vpm-table-wrapper">
                    {loading ? (
                        <div className="vpm-loading">
                            <div className="vpm-spinner"></div>
                        </div>
                    ) : orders.length > 0 ? (
                        <table className="vpm-table">
                            <thead>
                                <tr>
                                    <th>Order ID</th>
                                    <th>Product</th>
                                    <th>Vendor</th>
                                    <th>Customer</th>
                                    <th>Amount</th>
                                    <th>Status</th>
                                    <th>Payment</th>
                                    <th>Date</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {orders.map((order) => (
                                    <tr key={order._id}>
                                        <td>
                                            <span className="vpm-order-id">{order.orderId}</span>
                                        </td>
                                        <td>
                                            <div className="vpm-product-cell">
                                                <div className="vpm-product-image">
                                                    {order.product_details?.image?.[0] ? (
                                                        <img src={order.product_details.image[0]} alt={order.product_details.name} />
                                                    ) : order.productId?.productImage?.[0] ? (
                                                        <img src={order.productId.productImage[0]} alt={order.productId.productName} />
                                                    ) : (
                                                        <FaBox />
                                                    )}
                                                </div>
                                                <div className="vpm-product-info">
                                                    <span className="vpm-product-name">
                                                        {order.product_details?.name || order.productId?.productName || 'N/A'}
                                                    </span>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="vpm-vendor-cell">
                                                <span className="vpm-vendor-name">
                                                    {order.vendor?.businessName || 'N/A'}
                                                </span>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="vpm-customer-cell">
                                                <span>{order.userId?.name || 'N/A'}</span>
                                                <span className="vpm-customer-email">{order.userId?.email || ''}</span>
                                            </div>
                                        </td>
                                        <td>
                                            <span className="vpm-price">{displayCEDICurrency(order.totalAmt || 0)}</span>
                                        </td>
                                        <td>
                                            <span className={`vpm-status-badge ${getStatusColor(order.order_status)}`}>
                                                {order.order_status}
                                            </span>
                                        </td>
                                        <td>
                                            <span className={`vpm-status-badge ${getPaymentStatusColor(order.payment_status)}`}>
                                                {order.payment_status || 'pending'}
                                            </span>
                                        </td>
                                        <td>
                                            <span className="vpm-date">
                                                {new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="vpm-actions">
                                                <button 
                                                    className="vpm-action-btn view" 
                                                    title="View Details"
                                                    onClick={() => handleViewOrder(order)}
                                                >
                                                    <FaEye />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <div className="vpm-empty">
                            <FaBox className="empty-icon" />
                            <h3>No orders found</h3>
                            <p>Try adjusting your search or filter criteria</p>
                        </div>
                    )}
                </div>

                {pagination.pages > 1 && (
                    <div className="vpm-pagination">
                        <button 
                            disabled={pagination.page === 1}
                            onClick={() => fetchOrders(pagination.page - 1)}
                            className="vpm-pagination-btn"
                        >
                            Previous
                        </button>
                        <div className="vpm-pagination-info">
                            <span className="vpm-pagination-current">{pagination.page}</span>
                            <span className="vpm-pagination-separator">of</span>
                            <span className="vpm-pagination-total">{pagination.pages}</span>
                        </div>
                        <button 
                            disabled={pagination.page === pagination.pages}
                            onClick={() => fetchOrders(pagination.page + 1)}
                            className="vpm-pagination-btn"
                        >
                            Next
                        </button>
                    </div>
                )}
            </div>

            {showViewModal && selectedOrder && (
                <div className="vpm-modal-overlay" onClick={() => setShowViewModal(false)}>
                    <div className="vpm-modal" onClick={e => e.stopPropagation()}>
                        <div className="vpm-modal-header">
                            <h2>Order Details</h2>
                            <button className="vpm-modal-close" onClick={() => setShowViewModal(false)}>×</button>
                        </div>
                        
                        <div className="vpm-modal-body">
                            <div className="vpm-order-detail-grid">
                                <div className="vpm-order-info-section">
                                    <h3>Order Information</h3>
                                    <div className="vpm-detail-row">
                                        <span className="vpm-detail-label">Order ID</span>
                                        <span className="vpm-detail-value">{selectedOrder.orderId}</span>
                                    </div>
                                    <div className="vpm-detail-row">
                                        <span className="vpm-detail-label">Status</span>
                                        <span className={`vpm-status-badge ${getStatusColor(selectedOrder.order_status)}`}>
                                            {selectedOrder.order_status}
                                        </span>
                                    </div>
                                    <div className="vpm-detail-row">
                                        <span className="vpm-detail-label">Payment Status</span>
                                        <span className={`vpm-status-badge ${getPaymentStatusColor(selectedOrder.payment_status)}`}>
                                            {selectedOrder.payment_status || 'pending'}
                                        </span>
                                    </div>
                                    <div className="vpm-detail-row">
                                        <span className="vpm-detail-label">Amount</span>
                                        <span className="vpm-detail-value price">
                                            {displayCEDICurrency(selectedOrder.totalAmt || 0)}
                                        </span>
                                    </div>
                                    <div className="vpm-detail-row">
                                        <span className="vpm-detail-label">Date</span>
                                        <span className="vpm-detail-value">
                                            {new Date(selectedOrder.createdAt).toLocaleString()}
                                        </span>
                                    </div>
                                </div>

                                <div className="vpm-order-info-section">
                                    <h3>Vendor Information</h3>
                                    <div className="vpm-detail-row">
                                        <span className="vpm-detail-label">Business Name</span>
                                        <span className="vpm-detail-value">{selectedOrder.vendor?.businessName || 'N/A'}</span>
                                    </div>
                                    <div className="vpm-detail-row">
                                        <span className="vpm-detail-label">Store Name</span>
                                        <span className="vpm-detail-value">{selectedOrder.vendor?.storeName || 'N/A'}</span>
                                    </div>
                                </div>

                                <div className="vpm-order-info-section">
                                    <h3>Customer Information</h3>
                                    <div className="vpm-detail-row">
                                        <span className="vpm-detail-label">Name</span>
                                        <span className="vpm-detail-value">{selectedOrder.userId?.name || 'N/A'}</span>
                                    </div>
                                    <div className="vpm-detail-row">
                                        <span className="vpm-detail-label">Email</span>
                                        <span className="vpm-detail-value">{selectedOrder.userId?.email || 'N/A'}</span>
                                    </div>
                                    <div className="vpm-detail-row">
                                        <span className="vpm-detail-label">Phone</span>
                                        <span className="vpm-detail-value">{selectedOrder.userId?.mobile || 'N/A'}</span>
                                    </div>
                                </div>

                                <div className="vpm-order-info-section">
                                    <h3>Status History</h3>
                                    {selectedOrder.order_status_history?.length > 0 ? (
                                        <div className="vpm-status-history">
                                            {selectedOrder.order_status_history.map((history, index) => (
                                                <div key={index} className="vpm-history-item">
                                                    <span className={`vpm-status-badge ${getStatusColor(history.status)}`}>
                                                        {history.status}
                                                    </span>
                                                    <span className="vpm-history-note">{history.note}</span>
                                                    <span className="vpm-history-date">
                                                        {new Date(history.updatedAt).toLocaleString()}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p>No status history</p>
                                    )}
                                </div>

                                <div className="vpm-admin-actions">
                                    <h3>Admin Actions</h3>
                                    <div className="vpm-action-buttons">
                                        {selectedOrder.order_status !== 'delivered' && selectedOrder.order_status !== 'cancelled' && (
                                            <>
                                                <button 
                                                    className="vpm-action-btn override"
                                                    onClick={() => {
                                                        const status = prompt('Enter new status (pending, processing, shipped, delivered, cancelled):')
                                                        if (status) handleOverrideStatus(selectedOrder._id, status)
                                                    }}
                                                >
                                                    Override Status
                                                </button>
                                                <button 
                                                    className="vpm-action-btn cancel"
                                                    onClick={() => handleCancelOrder(selectedOrder._id)}
                                                >
                                                    Cancel Order
                                                </button>
                                            </>
                                        )}
                                        <button 
                                            className="vpm-action-btn dispute"
                                            onClick={() => setShowDisputeModal(true)}
                                        >
                                            Resolve Dispute
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {showDisputeModal && (
                <div className="vpm-modal-overlay" onClick={() => setShowDisputeModal(false)}>
                    <div className="vpm-modal dispute-modal" onClick={e => e.stopPropagation()}>
                        <div className="vpm-modal-header">
                            <h2>Resolve Dispute</h2>
                            <button className="vpm-modal-close" onClick={() => setShowDisputeModal(false)}>×</button>
                        </div>
                        <div className="vpm-modal-body">
                            <div className="vpm-form-group">
                                <label>Resolution Type</label>
                                <select 
                                    value={disputeData.resolution}
                                    onChange={(e) => setDisputeData({ ...disputeData, resolution: e.target.value })}
                                    className="vpm-form-input"
                                >
                                    <option value="">Select Resolution</option>
                                    <option value="refund">Partial Refund</option>
                                    <option value="full_refund">Full Refund</option>
                                    <option value="reject">Reject Dispute</option>
                                </select>
                            </div>
                            {disputeData.resolution?.includes('refund') && (
                                <div className="vpm-form-group">
                                    <label>Refund Amount</label>
                                    <input 
                                        type="number"
                                        value={disputeData.refundAmount}
                                        onChange={(e) => setDisputeData({ ...disputeData, refundAmount: e.target.value })}
                                        className="vpm-form-input"
                                        placeholder="Enter refund amount"
                                    />
                                </div>
                            )}
                            <button 
                                className="btn-primary"
                                onClick={() => handleResolveDispute(selectedOrder._id)}
                            >
                                Submit Resolution
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showStatsModal && (
                <div className="vpm-modal-overlay" onClick={() => setShowStatsModal(false)}>
                    <div className="vpm-modal stats-modal" onClick={e => e.stopPropagation()}>
                        <div className="vpm-modal-header">
                            <h2>Vendor Fulfillment Performance</h2>
                            <button className="vpm-modal-close" onClick={() => setShowStatsModal(false)}>×</button>
                        </div>
                        <div className="vpm-modal-body">
                            <table className="vpm-table">
                                <thead>
                                    <tr>
                                        <th>Vendor</th>
                                        <th>Total Orders</th>
                                        <th>Pending</th>
                                        <th>Delivered</th>
                                        <th>Cancelled</th>
                                        <th>Fulfillment Rate</th>
                                        <th>Cancellation Rate</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {stats.map((stat) => (
                                        <tr key={stat.vendorId}>
                                            <td>{stat.businessName}</td>
                                            <td>{stat.totalOrders}</td>
                                            <td>{stat.pendingOrders}</td>
                                            <td>{stat.deliveredOrders}</td>
                                            <td>{stat.cancelledOrders}</td>
                                            <td>
                                                <span className={`vpm-status-badge ${stat.fulfillmentRate >= 80 ? 'bg-green-100 text-green-800' : stat.fulfillmentRate >= 50 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
                                                    {stat.fulfillmentRate}%
                                                </span>
                                            </td>
                                            <td>
                                                <span className={`vpm-status-badge ${stat.cancellationRate <= 5 ? 'bg-green-100 text-green-800' : stat.cancellationRate <= 15 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
                                                    {stat.cancellationRate}%
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default VendorOrderManagement
