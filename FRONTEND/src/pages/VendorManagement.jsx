import React, { useEffect, useState } from 'react'
import SummaryApi from '../common'
import { toast } from 'react-toastify'
import { FaSearch, FaFilter, FaEye, FaPause, FaPlay, FaCog, FaTrash, FaChartLine, FaShoppingBag, FaMoneyBillAlt, FaUserShield, FaCheckCircle, FaTimesCircle, FaClock, FaBan, FaStore, FaEnvelope, FaCalendar, FaDollarSign, FaPercent, FaTruck, FaUndo, FaCreditCard, FaGlobe, FaMoneyCheck, FaBox, FaUndoAlt } from 'react-icons/fa'
import displayCEDICurrency from '../helpers/displayCurrency'
import './VendorPages.css'

const VendorManagement = () => {
    const [vendors, setVendors] = useState([])
    const [loading, setLoading] = useState(true)
    const [stats, setStats] = useState(null)
    const [selectedVendor, setSelectedVendor] = useState(null)
    const [showDetailModal, setShowDetailModal] = useState(false)
    const [showConfigModal, setShowConfigModal] = useState(false)
    const [configTab, setConfigTab] = useState('fees')
    const [detailTab, setDetailTab] = useState('overview')
    const [filterStatus, setFilterStatus] = useState('all')
    const [searchTerm, setSearchTerm] = useState('')
    const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 })
    const [saving, setSaving] = useState(false)
    const [vendorAnalytics, setVendorAnalytics] = useState(null)
    const [vendorOrders, setVendorOrders] = useState([])
    const [vendorPayouts, setVendorPayouts] = useState([])
    const [detailLoading, setDetailLoading] = useState(false)

    const [configForm, setConfigForm] = useState({
        commissionRate: 10,
        platformFeePercent: 10,
        payoutSettings: {
            payoutMethod: 'bank_transfer',
            payoutSchedule: 'weekly',
            minimumPayout: 50
        },
        paymentSettings: {
            acceptCashOnDelivery: true,
            acceptOnlinePayment: true,
            allowInstallments: false
        },
        shippingSettings: {
            processingTime: '3-5_days',
            freeShippingThreshold: 0,
            flatRateShipping: 0,
            shipsInternationally: false,
            internationalShippingCost: 0
        },
        returnPolicy: {
            acceptsReturns: true,
            returnDays: 14,
            returnPolicyText: ''
        }
    })

    const fetchVendors = async (page = 1) => {
        setLoading(true)
        try {
            const url = `${SummaryApi.getAllVendors.url}?page=${page}&limit=20&status=${filterStatus}${searchTerm ? `&search=${searchTerm}` : ''}`
            
            const fetchData = await fetch(url, {
                method: SummaryApi.getAllVendors.method,
                credentials: 'include'
            })

            const dataResponse = await fetchData.json()

            if (dataResponse.success) {
                setVendors(dataResponse.data?.vendors || [])
                setPagination(dataResponse.data?.pagination || { page: 1, pages: 1, total: 0 })
            } else {
                toast.error(dataResponse.message || 'Failed to fetch vendors')
            }
        } catch (error) {
            toast.error('Failed to fetch vendors')
        } finally {
            setLoading(false)
        }
    }

    const fetchStats = async () => {
        try {
            const response = await fetch(`${SummaryApi.getAllVendors.url.replace('/vendors', '/vendor-stats')}`, {
                credentials: 'include'
            })
            
            if (!response.ok) {
                console.error('Stats fetch failed:', response.status, response.statusText)
                return
            }
            
            const data = await response.json()
            if (data.success) {
                setStats(data.data)
            }
        } catch (error) {
            console.error('Error fetching stats:', error)
        }
    }

    useEffect(() => {
        fetchVendors()
        fetchStats()
    }, [filterStatus])

    useEffect(() => {
        const delaySearch = setTimeout(() => {
            fetchVendors(1)
        }, 500)
        return () => clearTimeout(delaySearch)
    }, [searchTerm])

    const handleViewDetails = async (vendor) => {
        setSelectedVendor(vendor)
        setShowDetailModal(true)
        setDetailTab('overview')
        setDetailLoading(true)

        try {
            const [analyticsRes, ordersRes, payoutsRes] = await Promise.all([
                fetch(`${SummaryApi.getVendorAnalytics.url.replace(':vendorId', vendor._id)}?period=30`, {
                    credentials: 'include'
                }),
                fetch(`${SummaryApi.getVendorOrders.url.replace(':vendorId', vendor._id)}?limit=10`, {
                    credentials: 'include'
                }),
                fetch(`${SummaryApi.getVendorPayouts.url.replace(':vendorId', vendor._id)}`, {
                    credentials: 'include'
                })
            ])

            const analyticsData = await analyticsRes.json()
            const ordersData = await ordersRes.json()
            const payoutsData = await payoutsRes.json()

            if (analyticsData.success) setVendorAnalytics(analyticsData.data)
            if (ordersData.success) setVendorOrders(ordersData.data.orders)
            if (payoutsData.success) setVendorPayouts(payoutsData.data.payouts)
        } catch (error) {
            console.error('Error fetching vendor details:', error)
        } finally {
            setDetailLoading(false)
        }
    }

    const handleOpenConfig = async (vendor) => {
        setSelectedVendor(vendor)
        
        try {
            const response = await fetch(`${SummaryApi.getVendorById.url.replace(':vendorId', vendor._id)}`, {
                method: SummaryApi.getVendorById.method,
                credentials: 'include'
            })
            const data = await response.json()
            
            if (data.success && data.data) {
                const v = data.data
                setConfigForm({
                    commissionRate: v.commissionRate || 10,
                    platformFeePercent: v.platformFeePercent || 10,
                    payoutSettings: v.payoutSettings || {
                        payoutMethod: 'bank_transfer',
                        payoutSchedule: 'weekly',
                        minimumPayout: 50
                    },
                    paymentSettings: v.paymentSettings || {
                        acceptCashOnDelivery: true,
                        acceptOnlinePayment: true,
                        allowInstallments: false
                    },
                    shippingSettings: v.shippingSettings || {
                        processingTime: '3-5_days',
                        freeShippingThreshold: 0,
                        flatRateShipping: 0,
                        shipsInternationally: false,
                        internationalShippingCost: 0
                    },
                    returnPolicy: v.returnPolicy || {
                        acceptsReturns: true,
                        returnDays: 14,
                        returnPolicyText: ''
                    }
                })
            }
        } catch (error) {
            console.error('Error fetching vendor details:', error)
        }
        
        setShowConfigModal(true)
    }

    const handleSaveConfig = async () => {
        setSaving(true)
        try {
            const response = await fetch(`${SummaryApi.updateVendorConfig.url.replace(':vendorId', selectedVendor._id)}`, {
                method: SummaryApi.updateVendorConfig.method,
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(configForm)
            })

            const dataResponse = await response.json()

            if (dataResponse.success) {
                toast.success('Vendor configuration updated successfully')
                setShowConfigModal(false)
                fetchVendors(pagination.page)
            } else {
                toast.error(dataResponse.message || 'Failed to update configuration')
            }
        } catch (error) {
            toast.error('Failed to update configuration')
        } finally {
            setSaving(false)
        }
    }

    const handleToggleActive = async (vendor) => {
        try {
            const response = await fetch(`${SummaryApi.updateVendorConfig.url.replace(':vendorId', vendor._id)}`, {
                method: SummaryApi.updateVendorConfig.method,
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ isActive: !vendor.isActive })
            })

            const dataResponse = await response.json()

            if (dataResponse.success) {
                toast.success(`Vendor ${vendor.isActive ? 'deactivated' : 'activated'} successfully`)
                fetchVendors(pagination.page)
                fetchStats()
            } else {
                toast.error(dataResponse.message || 'Failed to update vendor status')
            }
        } catch (error) {
            toast.error('Failed to update vendor status')
        }
    }

    const handleDeleteVendor = async (vendor) => {
        if (!window.confirm(`Are you sure you want to delete vendor "${vendor.businessName}"? This action cannot be undone.`)) {
            return
        }

        try {
            const response = await fetch(`${SummaryApi.deleteVendor.url.replace(':vendorId', vendor._id)}`, {
                method: SummaryApi.deleteVendor.method,
                credentials: 'include'
            })

            const dataResponse = await response.json()

            if (dataResponse.success) {
                toast.success('Vendor deleted successfully')
                fetchVendors(pagination.page)
                fetchStats()
            } else {
                toast.error(dataResponse.message || 'Failed to delete vendor')
            }
        } catch (error) {
            toast.error('Failed to delete vendor')
        }
    }

    const getStatusConfig = (status) => {
        const configs = {
            verified: { icon: <FaCheckCircle />, label: 'Verified', class: 'success' },
            pending: { icon: <FaClock />, label: 'Pending', class: 'warning' },
            under_review: { icon: <FaSearch />, label: 'Under Review', class: 'info' },
            rejected: { icon: <FaTimesCircle />, label: 'Rejected', class: 'danger' },
            suspended: { icon: <FaBan />, label: 'Suspended', class: 'danger' }
        }
        return configs[status] || { icon: <FaClock />, label: status, class: 'default' }
    }

    const formatCurrency = (amount) => {
        return displayCEDICurrency(amount || 0)
    }

    return (
        <div className="vm-container">
            <div className="vm-header">
                <div className="vm-header-left">
                    <h1><FaStore className="header-icon" /> Vendor Management</h1>
                    <p>Manage vendor accounts, monitor performance, and configure settings</p>
                </div>
            </div>

            {stats && (
                <div className="vm-stats-grid">
                    <div className="vm-stat-card total">
                        <div className="vm-stat-icon"><FaUserShield /></div>
                        <div className="vm-stat-info">
                            <span className="vm-stat-value">{stats.totalVendors}</span>
                            <span className="vm-stat-label">Total Vendors</span>
                        </div>
                        <div className="vm-stat-bg"></div>
                    </div>
                    <div className="vm-stat-card verified">
                        <div className="vm-stat-icon"><FaCheckCircle /></div>
                        <div className="vm-stat-info">
                            <span className="vm-stat-value">{stats.verifiedVendors}</span>
                            <span className="vm-stat-label">Verified</span>
                        </div>
                        <div className="vm-stat-bg"></div>
                    </div>
                    <div className="vm-stat-card pending">
                        <div className="vm-stat-icon"><FaClock /></div>
                        <div className="vm-stat-info">
                            <span className="vm-stat-value">{stats.pendingVendors}</span>
                            <span className="vm-stat-label">Pending</span>
                        </div>
                        <div className="vm-stat-bg"></div>
                    </div>
                    <div className="vm-stat-card suspended">
                        <div className="vm-stat-icon"><FaBan /></div>
                        <div className="vm-stat-info">
                            <span className="vm-stat-value">{stats.suspendedVendors}</span>
                            <span className="vm-stat-label">Suspended</span>
                        </div>
                        <div className="vm-stat-bg"></div>
                    </div>
                </div>
            )}

            <div className="vm-content-card">
                <div className="vm-toolbar">
                    <div className="vm-search-wrapper">
                        <FaSearch className="search-icon" />
                        <input 
                            type="text" 
                            placeholder="Search vendors by name or email..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="vm-search-input"
                        />
                    </div>
                    <div className="vm-toolbar-actions">
                        <div className="vm-filter-wrapper">
                            <FaFilter className="filter-icon" />
                            <select 
                                value={filterStatus} 
                                onChange={(e) => setFilterStatus(e.target.value)}
                                className="vm-filter-select"
                            >
                                <option value="all">All Status</option>
                                <option value="verified">Verified</option>
                                <option value="pending">Pending</option>
                                <option value="suspended">Suspended</option>
                                <option value="rejected">Rejected</option>
                            </select>
                        </div>
                        <span className="vm-result-count">{pagination.total} vendors found</span>
                    </div>
                </div>

                <div className="vm-table-wrapper">
                    {loading ? (
                        <div className="vm-loading">
                            <div className="vm-spinner"></div>
                        </div>
                    ) : vendors.length > 0 ? (
                        <table className="vm-table">
                            <thead>
                                <tr>
                                    <th>Vendor</th>
                                    <th>Business Info</th>
                                    <th>Status</th>
                                    <th>Commission</th>
                                    <th>Available Balance</th>
                                    <th>Joined Date</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {vendors.map((vendor) => {
                                    const statusConfig = getStatusConfig(vendor.verificationStatus)
                                    return (
                                        <tr key={vendor._id}>
                                            <td>
                                                <div className="vm-vendor-cell">
                                                    <div className="vm-avatar">
                                                        {vendor.profilePic ? (
                                                            <img src={vendor.profilePic} alt={vendor.ownerName} />
                                                        ) : (
                                                            <span>{vendor.ownerName?.charAt(0) || 'V'}</span>
                                                        )}
                                                    </div>
                                                    <div className="vm-vendor-info">
                                                        <span className="vm-vendor-name">{vendor.ownerName}</span>
                                                        <span className="vm-vendor-email">{vendor.ownerEmail}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <div className="vm-business-cell">
                                                    <span className="vm-business-name">{vendor.businessName}</span>
                                                </div>
                                            </td>
                                            <td>
                                                <span className={`vm-status-badge ${statusConfig.class}`}>
                                                    {statusConfig.icon}
                                                    {statusConfig.label}
                                                </span>
                                            </td>
                                            <td>
                                                <span className="vm-commission">
                                                    <FaPercent className="mini-icon" />
                                                    {vendor.commissionRate}%
                                                </span>
                                            </td>
                                            <td>
                                                <span className="vm-balance">{formatCurrency(vendor.availableBalance)}</span>
                                            </td>
                                            <td>
                                                <span className="vm-date">
                                                    <FaCalendar className="mini-icon" />
                                                    {new Date(vendor.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                </span>
                                            </td>
                                            <td>
                                                <div className="vm-actions">
                                                    <button 
                                                        className="vm-action-btn view" 
                                                        title="View Details"
                                                        onClick={() => handleViewDetails(vendor)}
                                                    >
                                                        <FaEye />
                                                    </button>
                                                    <button 
                                                        className="vm-action-btn config" 
                                                        title="Configure"
                                                        onClick={() => handleOpenConfig(vendor)}
                                                    >
                                                        <FaCog />
                                                    </button>
                                                    <button 
                                                        className={`vm-action-btn ${vendor.isActive ? 'pause' : 'play'}`}
                                                        title={vendor.isActive ? 'Deactivate' : 'Activate'}
                                                        onClick={() => handleToggleActive(vendor)}
                                                    >
                                                        {vendor.isActive ? <FaPause /> : <FaPlay />}
                                                    </button>
                                                    <button 
                                                        className="vm-action-btn delete"
                                                        title="Delete"
                                                        onClick={() => handleDeleteVendor(vendor)}
                                                    >
                                                        <FaTrash />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    ) : (
                        <div className="vm-empty">
                            <FaStore className="empty-icon" />
                            <h3>No vendors found</h3>
                            <p>Try adjusting your search or filter criteria</p>
                        </div>
                    )}
                </div>

                {pagination.pages > 1 && (
                    <div className="vm-pagination">
                        <button 
                            disabled={pagination.page === 1}
                            onClick={() => fetchVendors(pagination.page - 1)}
                            className="vm-pagination-btn"
                        >
                            Previous
                        </button>
                        <div className="vm-pagination-info">
                            <span className="vm-pagination-current">{pagination.page}</span>
                            <span className="vm-pagination-separator">of</span>
                            <span className="vm-pagination-total">{pagination.pages}</span>
                        </div>
                        <button 
                            disabled={pagination.page === pagination.pages}
                            onClick={() => fetchVendors(pagination.page + 1)}
                            className="vm-pagination-btn"
                        >
                            Next
                        </button>
                    </div>
                )}
            </div>

            {showDetailModal && selectedVendor && (
                <div className="vm-modal-overlay" onClick={() => setShowDetailModal(false)}>
                    <div className="vm-modal" onClick={e => e.stopPropagation()}>
                        <div className="vm-modal-header">
                            <div className="vm-modal-title">
                                <div className="vm-modal-avatar">
                                    {selectedVendor.profilePic ? (
                                        <img src={selectedVendor.profilePic} alt={selectedVendor.ownerName} />
                                    ) : (
                                        <span>{selectedVendor.ownerName?.charAt(0) || 'V'}</span>
                                    )}
                                </div>
                                <div>
                                    <h2>{selectedVendor.businessName}</h2>
                                    <p>{selectedVendor.ownerEmail}</p>
                                </div>
                            </div>
                            <button className="vm-modal-close" onClick={() => setShowDetailModal(false)}>×</button>
                        </div>
                        
                        <div className="vm-modal-tabs">
                            <button 
                                className={detailTab === 'overview' ? 'active' : ''}
                                onClick={() => setDetailTab('overview')}
                            >
                                <FaChartLine /> Overview
                            </button>
                            <button 
                                className={detailTab === 'orders' ? 'active' : ''}
                                onClick={() => setDetailTab('orders')}
                            >
                                <FaShoppingBag /> Orders
                            </button>
                            <button 
                                className={detailTab === 'payouts' ? 'active' : ''}
                                onClick={() => setDetailTab('payouts')}
                            >
                                <FaMoneyBillAlt /> Payouts
                            </button>
                        </div>

                        <div className="vm-modal-body">
                            {detailLoading ? (
                                <div className="vm-loading">
                                    <div className="vm-spinner"></div>
                                </div>
                            ) : (
                                <>
                                    {detailTab === 'overview' && vendorAnalytics && (
                                        <div className="vm-detail-content">
                                            <div className="vm-detail-grid">
                                                <div className="vm-detail-card">
                                                    <div className="vm-detail-card-header">
                                                        <FaShoppingBag />
                                                        <span>Orders</span>
                                                    </div>
                                                    <div className="vm-detail-card-body">
                                                        <div className="vm-detail-stat">
                                                            <span className="vm-detail-stat-value">{vendorAnalytics.overview.totalOrders}</span>
                                                            <span className="vm-detail-stat-label">Total Orders</span>
                                                        </div>
                                                        <div className="vm-detail-stat success">
                                                            <span className="vm-detail-stat-value">{vendorAnalytics.overview.deliveredOrders}</span>
                                                            <span className="vm-detail-stat-label">Delivered</span>
                                                        </div>
                                                        <div className="vm-detail-stat danger">
                                                            <span className="vm-detail-stat-value">{vendorAnalytics.overview.cancelledOrders}</span>
                                                            <span className="vm-detail-stat-label">Cancelled</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="vm-detail-card">
                                                    <div className="vm-detail-card-header">
                                                        <FaDollarSign />
                                                        <span>Revenue</span>
                                                    </div>
                                                    <div className="vm-detail-card-body">
                                                        <div className="vm-detail-stat">
                                                            <span className="vm-detail-stat-value">{formatCurrency(vendorAnalytics.overview.totalRevenue)}</span>
                                                            <span className="vm-detail-stat-label">Total Revenue</span>
                                                        </div>
                                                        <div className="vm-detail-stat success">
                                                            <span className="vm-detail-stat-value">{formatCurrency(vendorAnalytics.overview.vendorEarnings)}</span>
                                                            <span className="vm-detail-stat-label">Vendor Earnings</span>
                                                        </div>
                                                        <div className="vm-detail-stat">
                                                            <span className="vm-detail-stat-value">{formatCurrency(vendorAnalytics.overview.platformFee)}</span>
                                                            <span className="vm-detail-stat-label">Platform Fee</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="vm-detail-card wallet">
                                                    <div className="vm-detail-card-header">
                                                        <FaMoneyBillAlt />
                                                        <span>Wallet Status</span>
                                                    </div>
                                                    <div className="vm-detail-card-body">
                                                        <div className="vm-wallet-stat">
                                                            <span className="label">Available</span>
                                                            <span className="value">{formatCurrency(vendorAnalytics.overview.availableBalance)}</span>
                                                        </div>
                                                        <div className="vm-wallet-stat">
                                                            <span className="label">Pending</span>
                                                            <span className="value">{formatCurrency(vendorAnalytics.overview.pendingBalance)}</span>
                                                        </div>
                                                        <div className="vm-wallet-stat total">
                                                            <span className="label">Total Balance</span>
                                                            <span className="value">{formatCurrency(vendorAnalytics.overview.walletBalance)}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="vm-account-info">
                                                <h4><FaUserShield /> Account Information</h4>
                                                <div className="vm-info-grid">
                                                    <div className="vm-info-item">
                                                        <span className="vm-info-label">Owner Name</span>
                                                        <span className="vm-info-value">{selectedVendor.ownerName}</span>
                                                    </div>
                                                    <div className="vm-info-item">
                                                        <span className="vm-info-label">Email Address</span>
                                                        <span className="vm-info-value">{selectedVendor.ownerEmail}</span>
                                                    </div>
                                                    <div className="vm-info-item">
                                                        <span className="vm-info-label">Business Name</span>
                                                        <span className="vm-info-value">{selectedVendor.businessName}</span>
                                                    </div>
                                                    <div className="vm-info-item">
                                                        <span className="vm-info-label">Status</span>
                                                        <span className={`vm-status-badge ${getStatusConfig(selectedVendor.verificationStatus).class}`}>
                                                            {getStatusConfig(selectedVendor.verificationStatus).icon}
                                                            {getStatusConfig(selectedVendor.verificationStatus).label}
                                                        </span>
                                                    </div>
                                                    <div className="vm-info-item">
                                                        <span className="vm-info-label">Commission Rate</span>
                                                        <span className="vm-info-value">{selectedVendor.commissionRate}%</span>
                                                    </div>
                                                    <div className="vm-info-item">
                                                        <span className="vm-info-label">Joined Date</span>
                                                        <span className="vm-info-value">{new Date(selectedVendor.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {detailTab === 'orders' && (
                                        <div className="vm-orders-content">
                                            {vendorOrders.length > 0 ? (
                                                <table className="vm-data-table">
                                                    <thead>
                                                        <tr>
                                                            <th>Order ID</th>
                                                            <th>Product</th>
                                                            <th>Amount</th>
                                                            <th>Status</th>
                                                            <th>Payment</th>
                                                            <th>Date</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {vendorOrders.map((order, idx) => (
                                                            <tr key={idx}>
                                                                <td className="vm-order-id">{order.orderId}</td>
                                                                <td>{order.productName}</td>
                                                                <td className="vm-order-amount">{formatCurrency(order.amount)}</td>
                                                                <td>
                                                                    <span className={`vm-status-badge ${getStatusConfig(order.status).class}`}>
                                                                        {getStatusConfig(order.status).label}
                                                                    </span>
                                                                </td>
                                                                <td>
                                                                    <span className={`vm-status-badge ${order.paymentStatus === 'paid' ? 'success' : 'warning'}`}>
                                                                        {order.paymentStatus}
                                                                    </span>
                                                                </td>
                                                                <td className="vm-order-date">{new Date(order.date).toLocaleDateString()}</td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            ) : (
                                                <div className="vm-empty-small">
                                                    <FaShoppingBag />
                                                    <p>No orders found</p>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {detailTab === 'payouts' && (
                                        <div className="vm-payouts-content">
                                            {vendorPayouts.length > 0 ? (
                                                <table className="vm-data-table">
                                                    <thead>
                                                        <tr>
                                                            <th>Transaction ID</th>
                                                            <th>Amount</th>
                                                            <th>Method</th>
                                                            <th>Status</th>
                                                            <th>Date</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {vendorPayouts.map((payout, idx) => (
                                                            <tr key={idx}>
                                                                <td className="vm-tx-id">{payout.transactionId}</td>
                                                                <td className="vm-payout-amount">{formatCurrency(payout.amount)}</td>
                                                                <td className="vm-method">{payout.method}</td>
                                                                <td>
                                                                    <span className={`vm-status-badge ${getStatusConfig(payout.status).class}`}>
                                                                        {getStatusConfig(payout.status).label}
                                                                    </span>
                                                                </td>
                                                                <td className="vm-payout-date">{new Date(payout.createdAt).toLocaleDateString()}</td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            ) : (
                                                <div className="vm-empty-small">
                                                    <FaMoneyBillAlt />
                                                    <p>No payouts found</p>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {showConfigModal && (
                <div className="vm-modal-overlay" onClick={() => setShowConfigModal(false)}>
                    <div className="vm-config-modal" onClick={e => e.stopPropagation()}>
                        <div className="vm-config-sidebar">
                            <div className="vm-config-sidebar-header">
                                <FaCog className="sidebar-icon" />
                                <div>
                                    <h3>Configuration</h3>
                                    <p>{selectedVendor?.businessName}</p>
                                </div>
                            </div>
                            <nav className="vm-config-nav">
                                <button 
                                    className={configTab === 'fees' ? 'active' : ''}
                                    onClick={() => setConfigTab('fees')}
                                >
                                    <FaPercent /> Commission & Fees
                                </button>
                                <button 
                                    className={configTab === 'payout' ? 'active' : ''}
                                    onClick={() => setConfigTab('payout')}
                                >
                                    <FaMoneyCheck /> Payout Settings
                                </button>
                                <button 
                                    className={configTab === 'payment' ? 'active' : ''}
                                    onClick={() => setConfigTab('payment')}
                                >
                                    <FaCreditCard /> Payment Options
                                </button>
                                <button 
                                    class={configTab === 'shipping' ? 'active' : ''}
                                    onClick={() => setConfigTab('shipping')}
                                >
                                    <FaTruck /> Shipping
                                </button>
                                <button 
                                    className={configTab === 'returns' ? 'active' : ''}
                                    onClick={() => setConfigTab('returns')}
                                >
                                    <FaUndoAlt /> Returns
                                </button>
                            </nav>
                        </div>
                        
                        <div className="vm-config-content">
                            <div className="vm-config-header">
                                <h2>
                                    {configTab === 'fees' && <><FaPercent /> Commission & Fees</>}
                                    {configTab === 'payout' && <><FaMoneyCheck /> Payout Settings</>}
                                    {configTab === 'payment' && <><FaCreditCard /> Payment Options</>}
                                    {configTab === 'shipping' && <><FaTruck /> Shipping Settings</>}
                                    {configTab === 'returns' && <><FaUndoAlt /> Return Policy</>}
                                </h2>
                                <button className="vm-modal-close" onClick={() => setShowConfigModal(false)}>×</button>
                            </div>

                            <div className="vm-config-body">
                                {configTab === 'fees' && (
                                    <div className="vm-config-panel">
                                        <div className="vm-config-card">
                                            <div className="vm-config-card-header">
                                                <span className="vm-config-card-icon fees"><FaPercent /></span>
                                                <div>
                                                    <h4>Platform Fees</h4>
                                                    <p>Configure commission and fee rates for this vendor</p>
                                                </div>
                                            </div>
                                            <div className="vm-config-card-body">
                                                <div className="vm-config-row">
                                                    <div className="vm-config-field">
                                                        <label>Commission Rate (%)</label>
                                                        <div className="vm-input-wrapper">
                                                            <input 
                                                                type="number" 
                                                                value={configForm.commissionRate}
                                                                onChange={(e) => setConfigForm({...configForm, commissionRate: Number(e.target.value)})}
                                                                min={0}
                                                                max={100}
                                                            />
                                                            <span className="vm-input-suffix">%</span>
                                                        </div>
                                                        <span className="vm-field-help">Platform commission per sale</span>
                                                    </div>
                                                    <div className="vm-config-field">
                                                        <label>Platform Fee (%)</label>
                                                        <div className="vm-input-wrapper">
                                                            <input 
                                                                type="number" 
                                                                value={configForm.platformFeePercent}
                                                                onChange={(e) => setConfigForm({...configForm, platformFeePercent: Number(e.target.value)})}
                                                                min={0}
                                                                max={100}
                                                            />
                                                            <span className="vm-input-suffix">%</span>
                                                        </div>
                                                        <span className="vm-field-help">Additional platform fee</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {configTab === 'payout' && (
                                    <div className="vm-config-panel">
                                        <div className="vm-config-card">
                                            <div className="vm-config-card-header">
                                                <span className="vm-config-card-icon payout"><FaMoneyCheck /></span>
                                                <div>
                                                    <h4>Payout Configuration</h4>
                                                    <p>Set how and when the vendor gets paid</p>
                                                </div>
                                            </div>
                                            <div className="vm-config-card-body">
                                                <div className="vm-config-row">
                                                    <div className="vm-config-field">
                                                        <label>Payout Method</label>
                                                        <select 
                                                            value={configForm.payoutSettings.payoutMethod}
                                                            onChange={(e) => setConfigForm({
                                                                ...configForm, 
                                                                payoutSettings: {...configForm.payoutSettings, payoutMethod: e.target.value}
                                                            })}
                                                        >
                                                            <option value="bank_transfer">Bank Transfer</option>
                                                            <option value="paypal">PayPal</option>
                                                            <option value="momo">Mobile Money</option>
                                                            <option value="airtel_money">Airtel Money</option>
                                                            <option value="stripe">Stripe</option>
                                                        </select>
                                                    </div>
                                                    <div className="vm-config-field">
                                                        <label>Payout Schedule</label>
                                                        <select 
                                                            value={configForm.payoutSettings.payoutSchedule}
                                                            onChange={(e) => setConfigForm({
                                                                ...configForm, 
                                                                payoutSettings: {...configForm.payoutSettings, payoutSchedule: e.target.value}
                                                            })}
                                                        >
                                                            <option value="daily">Daily</option>
                                                            <option value="weekly">Weekly</option>
                                                            <option value="biweekly">Bi-weekly</option>
                                                            <option value="monthly">Monthly</option>
                                                        </select>
                                                    </div>
                                                </div>
                                                <div className="vm-config-row single">
                                                    <div className="vm-config-field">
                                                        <label>Minimum Payout Amount</label>
                                                        <div className="vm-input-wrapper">
                                                            <span className="vm-input-prefix">$</span>
                                                            <input 
                                                                type="number" 
                                                                value={configForm.payoutSettings.minimumPayout}
                                                                onChange={(e) => setConfigForm({
                                                                    ...configForm, 
                                                                    payoutSettings: {...configForm.payoutSettings, minimumPayout: Number(e.target.value)}
                                                                })}
                                                                min={0}
                                                            />
                                                        </div>
                                                        <span className="vm-field-help">Minimum amount required for payout</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {configTab === 'payment' && (
                                    <div className="vm-config-panel">
                                        <div className="vm-config-card">
                                            <div className="vm-config-card-header">
                                                <span className="vm-config-card-icon payment"><FaCreditCard /></span>
                                                <div>
                                                    <h4>Payment Methods</h4>
                                                    <p>Choose which payment methods to accept</p>
                                                </div>
                                            </div>
                                            <div className="vm-config-card-body">
                                                <div className="vm-toggle-group">
                                                    <div className="vm-toggle-item">
                                                        <div className="vm-toggle-info">
                                                            <span className="vm-toggle-label">Cash on Delivery</span>
                                                            <span className="vm-toggle-desc">Allow customers to pay upon delivery</span>
                                                        </div>
                                                        <label className="vm-toggle-switch">
                                                            <input 
                                                                type="checkbox"
                                                                checked={configForm.paymentSettings.acceptCashOnDelivery}
                                                                onChange={(e) => setConfigForm({
                                                                    ...configForm, 
                                                                    paymentSettings: {...configForm.paymentSettings, acceptCashOnDelivery: e.target.checked}
                                                                })}
                                                            />
                                                            <span className="vm-toggle-slider"></span>
                                                        </label>
                                                    </div>
                                                    <div className="vm-toggle-item">
                                                        <div className="vm-toggle-info">
                                                            <span className="vm-toggle-label">Online Payment</span>
                                                            <span className="vm-toggle-desc">Accept credit/debit cards and digital payments</span>
                                                        </div>
                                                        <label className="vm-toggle-switch">
                                                            <input 
                                                                type="checkbox"
                                                                checked={configForm.paymentSettings.acceptOnlinePayment}
                                                                onChange={(e) => setConfigForm({
                                                                    ...configForm, 
                                                                    paymentSettings: {...configForm.paymentSettings, acceptOnlinePayment: e.target.checked}
                                                                })}
                                                            />
                                                            <span className="vm-toggle-slider"></span>
                                                        </label>
                                                    </div>
                                                    <div className="vm-toggle-item">
                                                        <div className="vm-toggle-info">
                                                            <span className="vm-toggle-label">Installments</span>
                                                            <span className="vm-toggle-desc">Allow customers to pay in installments</span>
                                                        </div>
                                                        <label className="vm-toggle-switch">
                                                            <input 
                                                                type="checkbox"
                                                                checked={configForm.paymentSettings.allowInstallments}
                                                                onChange={(e) => setConfigForm({
                                                                    ...configForm, 
                                                                    paymentSettings: {...configForm.paymentSettings, allowInstallments: e.target.checked}
                                                                })}
                                                            />
                                                            <span className="vm-toggle-slider"></span>
                                                        </label>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {configTab === 'shipping' && (
                                    <div className="vm-config-panel">
                                        <div className="vm-config-card">
                                            <div className="vm-config-card-header">
                                                <span className="vm-config-card-icon shipping"><FaTruck /></span>
                                                <div>
                                                    <h4>Shipping Preferences</h4>
                                                    <p>Configure shipping options for this vendor</p>
                                                </div>
                                            </div>
                                            <div className="vm-config-card-body">
                                                <div className="vm-config-row">
                                                    <div className="vm-config-field">
                                                        <label>Processing Time</label>
                                                        <select 
                                                            value={configForm.shippingSettings.processingTime}
                                                            onChange={(e) => setConfigForm({
                                                                ...configForm, 
                                                                shippingSettings: {...configForm.shippingSettings, processingTime: e.target.value}
                                                            })}
                                                        >
                                                            <option value="same_day">Same Day</option>
                                                            <option value="1-2_days">1-2 Days</option>
                                                            <option value="3-5_days">3-5 Days</option>
                                                            <option value="7-14_days">7-14 Days</option>
                                                        </select>
                                                    </div>
                                                </div>
                                                <div className="vm-config-row">
                                                    <div className="vm-config-field">
                                                        <label>Free Shipping Threshold</label>
                                                        <div className="vm-input-wrapper">
                                                            <span className="vm-input-prefix">$</span>
                                                            <input 
                                                                type="number" 
                                                                value={configForm.shippingSettings.freeShippingThreshold}
                                                                onChange={(e) => setConfigForm({
                                                                    ...configForm, 
                                                                    shippingSettings: {...configForm.shippingSettings, freeShippingThreshold: Number(e.target.value)}
                                                                })}
                                                                min={0}
                                                            />
                                                        </div>
                                                        <span className="vm-field-help">Order total for free shipping</span>
                                                    </div>
                                                    <div className="vm-config-field">
                                                        <label>Flat Rate Shipping</label>
                                                        <div className="vm-input-wrapper">
                                                            <span className="vm-input-prefix">$</span>
                                                            <input 
                                                                type="number" 
                                                                value={configForm.shippingSettings.flatRateShipping}
                                                                onChange={(e) => setConfigForm({
                                                                    ...configForm, 
                                                                    shippingSettings: {...configForm.shippingSettings, flatRateShipping: Number(e.target.value)}
                                                                })}
                                                                min={0}
                                                            />
                                                        </div>
                                                        <span className="vm-field-help">Fixed shipping cost</span>
                                                    </div>
                                                </div>
                                                <div className="vm-toggle-item full-width">
                                                    <div className="vm-toggle-info">
                                                        <span className="vm-toggle-label"><FaGlobe /> International Shipping</span>
                                                        <span className="vm-toggle-desc">Enable shipping to other countries</span>
                                                    </div>
                                                    <label className="vm-toggle-switch">
                                                        <input 
                                                            type="checkbox"
                                                            checked={configForm.shippingSettings.shipsInternationally}
                                                            onChange={(e) => setConfigForm({
                                                                ...configForm, 
                                                                shippingSettings: {...configForm.shippingSettings, shipsInternationally: e.target.checked}
                                                            })}
                                                        />
                                                        <span className="vm-toggle-slider"></span>
                                                    </label>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {configTab === 'returns' && (
                                    <div className="vm-config-panel">
                                        <div className="vm-config-card">
                                            <div className="vm-config-card-header">
                                                <span className="vm-config-card-icon returns"><FaUndoAlt /></span>
                                                <div>
                                                    <h4>Return Policy</h4>
                                                    <p>Configure return settings for this vendor</p>
                                                </div>
                                            </div>
                                            <div className="vm-config-card-body">
                                                <div className="vm-toggle-item full-width">
                                                    <div className="vm-toggle-info">
                                                        <span className="vm-toggle-label">Accept Returns</span>
                                                        <span className="vm-toggle-desc">Allow customers to return products</span>
                                                    </div>
                                                    <label className="vm-toggle-switch">
                                                        <input 
                                                            type="checkbox"
                                                            checked={configForm.returnPolicy.acceptsReturns}
                                                            onChange={(e) => setConfigForm({
                                                                ...configForm, 
                                                                returnPolicy: {...configForm.returnPolicy, acceptsReturns: e.target.checked}
                                                            })}
                                                        />
                                                        <span className="vm-toggle-slider"></span>
                                                    </label>
                                                </div>
                                                {configForm.returnPolicy.acceptsReturns && (
                                                    <div className="vm-config-row single">
                                                        <div className="vm-config-field">
                                                            <label>Return Window</label>
                                                            <div className="vm-input-wrapper">
                                                                <input 
                                                                    type="number" 
                                                                    value={configForm.returnPolicy.returnDays}
                                                                    onChange={(e) => setConfigForm({
                                                                        ...configForm, 
                                                                        returnPolicy: {...configForm.returnPolicy, returnDays: Number(e.target.value)}
                                                                    })}
                                                                    min={0}
                                                                />
                                                                <span className="vm-input-suffix">days</span>
                                                            </div>
                                                            <span className="vm-field-help">Days after delivery to return</span>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="vm-config-footer">
                                <button className="vm-btn vm-btn-secondary" onClick={() => setShowConfigModal(false)}>
                                    Cancel
                                </button>
                                <button className="vm-btn vm-btn-primary" onClick={handleSaveConfig} disabled={saving}>
                                    {saving ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default VendorManagement
