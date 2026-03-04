import { useEffect, useState } from 'react'
import SummaryApi from '../common'
import { Link, useNavigate } from 'react-router-dom'
import displayCEDICurrency from '../helpers/displayCurrency'
import './VendorDashboard.css'

const VendorDashboard = () => {
    const [stats, setStats] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const navigate = useNavigate()

    useEffect(() => {
        fetchDashboardStats()
    }, [])

    const fetchDashboardStats = async () => {
        try {
            const response = await fetch(SummaryApi.vendorDashboardStats.url, {
                method: SummaryApi.vendorDashboardStats.method,
                credentials: 'include'
            })
            const data = await response.json()
            
            if (data.success) {
                setStats(data.data)
            } else if (data.message === 'Please login first') {
                navigate('/login')
            } else {
                setError(data.message)
            }
        } catch (error) {
            console.error('Error fetching dashboard stats:', error)
            setError('Failed to load dashboard')
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <div className="loading-container">
                <div className="spinner"></div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="loading-container">
                <p>Error: {error}</p>
                <button onClick={() => navigate('/')}>Go Home</button>
            </div>
        )
    }

    return (
        <div className="vendor-dashboard">
            {/* Quick Stats */}
            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-icon">💰</div>
                    <div className="stat-content">
                        <span className="stat-label">Total Revenue</span>
                        <span className="stat-value">{displayCEDICurrency(stats?.overview?.totalRevenue || 0)}</span>
                        <span className="stat-change positive">+12.5% from last month</span>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon">🛒</div>
                    <div className="stat-content">
                        <span className="stat-label">Total Orders</span>
                        <span className="stat-value">{stats?.overview?.totalOrders || 0}</span>
                        <span className="stat-change">
                            {stats?.overview?.pendingOrders || 0} pending
                        </span>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon">📦</div>
                    <div className="stat-content">
                        <span className="stat-label">Products</span>
                        <span className="stat-value">{stats?.overview?.totalProducts || 0}</span>
                        <span className="stat-change">
                            {stats?.overview?.deliveredOrders || 0} delivered
                        </span>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon">⭐</div>
                    <div className="stat-content">
                        <span className="stat-label">Seller Score</span>
                        <span className="stat-value">{stats?.sellerScore || 0}</span>
                        <span className="stat-change positive">
                            ★ {stats?.averageRating || 0} rating
                        </span>
                    </div>
                </div>
            </div>

            {/* Wallet Section */}
            <div className="wallet-section">
                <h2>💼 Wallet Overview</h2>
                <div className="wallet-grid">
                    <div className="wallet-card primary">
                        <span className="wallet-label">Available Balance</span>
                        <span className="wallet-value">{displayCEDICurrency(stats?.overview?.availableBalance || 0)}</span>
                        <Link to="/vendor-panel/wallet" className="wallet-action">
                            Withdraw
                        </Link>
                    </div>
                    <div className="wallet-card">
                        <span className="wallet-label">Pending Balance</span>
                        <span className="wallet-value">{displayCEDICurrency(stats?.overview?.pendingBalance || 0)}</span>
                        <span className="wallet-subtext">Processing orders</span>
                    </div>
                    <div className="wallet-card">
                        <span className="wallet-label">Today Revenue</span>
                        <span className="wallet-value">{displayCEDICurrency(stats?.today?.revenue || 0)}</span>
                        <span className="wallet-subtext">{stats?.today?.orders || 0} orders today</span>
                    </div>
                </div>
            </div>

            {/* Orders & Products Grid */}
            <div className="dashboard-grid">
                <div className="dashboard-card">
                    <div className="card-header">
                        <h3>Recent Orders</h3>
                        <Link to="/vendor-panel/orders">View All</Link>
                    </div>
                    <div className="card-content">
                        {stats?.recentOrders?.length > 0 ? (
                            <div className="orders-list">
                                {stats.recentOrders.map((order, index) => (
                                    <div key={index} className="order-item">
                                        <div className="order-image">
                                            {order.productId?.productImage?.[0] ? (
                                                <img src={order.productId.productImage[0]} alt="" />
                                            ) : (
                                                <span>📦</span>
                                            )}
                                        </div>
                                        <div className="order-details">
                                            <span className="order-name">{order.productId?.productName || 'Product'}</span>
                                            <span className="order-id">#{order.orderId}</span>
                                        </div>
                                        <div className="order-status">
                                            <span className={`status ${order.order_status}`}>
                                                {order.order_status}
                                            </span>
                                            <span className="order-amount">
                                                {displayCEDICurrency(order.totalAmt)}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="empty-state">
                                <span>📭</span>
                                <p>No recent orders</p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="dashboard-card">
                    <div className="card-header">
                        <h3>Top Products</h3>
                        <Link to="/vendor-panel/products">View All</Link>
                    </div>
                    <div className="card-content">
                        {stats?.topProducts?.length > 0 ? (
                            <div className="products-list">
                                {stats.topProducts.map((product, index) => (
                                    <div key={index} className="product-item">
                                        <div className="product-image">
                                            {product.productImage?.[0] ? (
                                                <img src={product.productImage[0]} alt="" />
                                            ) : (
                                                <span>📦</span>
                                            )}
                                        </div>
                                        <div className="product-details">
                                            <span className="product-name">{product.productName}</span>
                                            <span className="product-price">
                                                {displayCEDICurrency(product.sellingPrice)}
                                            </span>
                                        </div>
                                        <div className="product-stats">
                                            <span className="product-rating">★ {product.rating || 0}</span>
                                            <span className="product-stock">
                                                {product.quantity > 0 ? 'In Stock' : 'Out of Stock'}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="empty-state">
                                <span>📦</span>
                                <p>No products yet</p>
                                <Link to="/vendor-panel/products?action=add" className="btn-primary">
                                    Add Product
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Orders by Status */}
            <div className="orders-status-grid">
                <h3>Orders by Status</h3>
                <div className="status-cards">
                    <div className="status-card pending">
                        <span className="status-count">{stats?.overview?.pendingOrders || 0}</span>
                        <span className="status-label">Pending</span>
                    </div>
                    <div className="status-card processing">
                        <span className="status-count">{stats?.overview?.processingOrders || 0}</span>
                        <span className="status-label">Processing</span>
                    </div>
                    <div className="status-card shipped">
                        <span className="status-count">{stats?.overview?.shippedOrders || 0}</span>
                        <span className="status-label">Shipped</span>
                    </div>
                    <div className="status-card delivered">
                        <span className="status-count">{stats?.overview?.deliveredOrders || 0}</span>
                        <span className="status-label">Delivered</span>
                    </div>
                </div>
            </div>

            {/* Verification Status */}
            {stats?.verificationStatus !== 'verified' && (
                <div className="verification-banner">
                    <div className="verification-content">
                        <span className="verification-icon">
                            {stats?.verificationStatus === 'pending' ? '⏳' : '🔍'}
                        </span>
                        <div>
                            <h4>Complete Your Vendor Verification</h4>
                            <p>
                                {stats?.verificationStatus === 'pending' 
                                    ? 'Submit your business documents to start selling'
                                    : 'Your documents are being reviewed'}
                            </p>
                        </div>
                    </div>
                    <Link to="/vendor-panel/settings?tab=verification" className="btn-primary">
                        Complete Verification
                    </Link>
                </div>
            )}
        </div>
    )
}

export default VendorDashboard
