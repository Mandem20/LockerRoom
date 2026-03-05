import { useEffect, useState, useMemo, memo } from 'react'
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
        let isMounted = true
        
        const fetchDashboardStats = async () => {
            try {
                const response = await fetch(SummaryApi.vendorDashboardStats.url, {
                    method: SummaryApi.vendorDashboardStats.method,
                    credentials: 'include'
                })
                const data = await response.json()
                
                if (!isMounted) return
                
                if (data.success) {
                    setStats(data.data)
                } else if (data.message === 'Please login first') {
                    navigate('/login')
                } else {
                    setError(data.message)
                }
            } catch (err) {
                if (!isMounted) return
                console.error('Error fetching dashboard stats:', err)
                setError('Failed to load dashboard')
            } finally {
                if (isMounted) {
                    setLoading(false)
                }
            }
        }

        fetchDashboardStats()
        
        return () => {
            isMounted = false
        }
    }, [navigate])

    const memoizedCurrency = useMemo(() => displayCEDICurrency, [])

    if (loading) {
        return <DashboardSkeleton />
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
            <StatsGrid stats={stats} currency={memoizedCurrency} />
            <WalletSection stats={stats} currency={memoizedCurrency} />
            <DashboardGrid stats={stats} currency={memoizedCurrency} />
            <OrdersStatusGrid stats={stats} />
            <VerificationBanner stats={stats} />
        </div>
    )
}

const StatsGrid = memo(({ stats, currency }) => (
    <div className="stats-grid">
        <StatCard 
            icon="💰" 
            label="Total Revenue" 
            value={currency(stats?.overview?.totalRevenue || 0)}
            change="+12.5% from last month"
            positive
        />
        <StatCard 
            icon="🛒" 
            label="Total Orders" 
            value={stats?.overview?.totalOrders || 0}
            change={`${stats?.overview?.pendingOrders || 0} pending`}
        />
        <StatCard 
            icon="📦" 
            label="Products" 
            value={stats?.overview?.totalProducts || 0}
            change={`${stats?.overview?.deliveredOrders || 0} delivered`}
        />
        <StatCard 
            icon="⭐" 
            label="Seller Score" 
            value={stats?.sellerScore || 0}
            change={`★ ${stats?.averageRating || 0} rating`}
            positive
        />
    </div>
))

const StatCard = memo(({ icon, label, value, change, positive }) => (
    <div className="stat-card">
        <div className="stat-icon">{icon}</div>
        <div className="stat-content">
            <span className="stat-label">{label}</span>
            <span className="stat-value">{value}</span>
            <span className={`stat-change ${positive ? 'positive' : ''}`}>{change}</span>
        </div>
    </div>
))

const WalletSection = memo(({ stats, currency }) => (
    <div className="wallet-section">
        <h2>💼 Wallet Overview</h2>
        <div className="wallet-grid">
            <WalletCard 
                label="Available Balance" 
                value={currency(stats?.overview?.availableBalance || 0)}
                action="Withdraw"
                primary
                link="/vendor-panel/wallet"
            />
            <WalletCard 
                label="Pending Balance" 
                value={currency(stats?.overview?.pendingBalance || 0)}
                subtext="Processing orders"
            />
            <WalletCard 
                label="Today Revenue" 
                value={currency(stats?.today?.revenue || 0)}
                subtext={`${stats?.today?.orders || 0} orders today`}
            />
            <WalletCard 
                label="Monthly Revenue" 
                value={currency(stats?.monthly?.revenue || 0)}
                subtext={`${stats?.monthly?.orders || 0} orders this month`}
            />
        </div>
    </div>
))

const WalletCard = memo(({ label, value, action, subtext, primary, link }) => (
    <div className={`wallet-card ${primary ? 'primary' : ''}`}>
        <span className="wallet-label">{label}</span>
        <span className="wallet-value">{value}</span>
        {action && link ? (
            <Link to={link} className="wallet-action">{action}</Link>
        ) : subtext && (
            <span className="wallet-subtext">{subtext}</span>
        )}
    </div>
))

const DashboardGrid = memo(({ stats, currency }) => (
    <div className="dashboard-grid">
        <RecentOrders orders={stats?.recentOrders || []} currency={currency} />
        <TopProducts products={stats?.topProducts || []} currency={currency} />
    </div>
))

const RecentOrders = memo(({ orders, currency }) => (
    <div className="dashboard-card">
        <div className="card-header">
            <h3>Recent Orders</h3>
            <Link to="/vendor-panel/orders">View All</Link>
        </div>
        <div className="card-content">
            {orders.length > 0 ? (
                <div className="orders-list">
                    {orders.map((order, index) => (
                        <div key={order._id || index} className="order-item">
                            <div className="order-image">
                                {order.productId?.productImage?.[0] ? (
                                    <img src={order.productId.productImage[0]} alt="" loading="lazy" />
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
                                    {currency(order.totalAmt)}
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
))

const TopProducts = memo(({ products, currency }) => (
    <div className="dashboard-card">
        <div className="card-header">
            <h3>Top Products</h3>
            <Link to="/vendor-panel/products">View All</Link>
        </div>
        <div className="card-content">
            {products.length > 0 ? (
                <div className="products-list">
                    {products.map((product, index) => (
                        <div key={product._id || index} className="product-item">
                            <div className="product-image">
                                {product.productImage?.[0] ? (
                                    <img src={product.productImage[0]} alt="" loading="lazy" />
                                ) : (
                                    <span>📦</span>
                                )}
                            </div>
                            <div className="product-details">
                                <span className="product-name">{product.productName}</span>
                                <span className="product-price">
                                    {currency(product.sellingPrice)}
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
))

const OrdersStatusGrid = memo(({ stats }) => (
    <div className="orders-status-grid">
        <h3>Orders by Status</h3>
        <div className="status-cards">
            <StatusCard status="pending" count={stats?.overview?.pendingOrders || 0} label="Pending" />
            <StatusCard status="processing" count={stats?.overview?.processingOrders || 0} label="Processing" />
            <StatusCard status="shipped" count={stats?.overview?.shippedOrders || 0} label="Shipped" />
            <StatusCard status="delivered" count={stats?.overview?.deliveredOrders || 0} label="Delivered" />
        </div>
    </div>
))

const StatusCard = memo(({ status, count, label }) => (
    <div className={`status-card ${status}`}>
        <span className="status-count">{count}</span>
        <span className="status-label">{label}</span>
    </div>
))

const VerificationBanner = memo(({ stats }) => {
    if (stats?.verificationStatus === 'verified') return null
    
    return (
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
    )
})

const DashboardSkeleton = () => (
    <div className="vendor-dashboard">
        <div className="stats-grid">
            {[...Array(4)].map((_, i) => (
                <div key={i} className="stat-card skeleton">
                    <div className="skeleton-icon"></div>
                    <div className="skeleton-content">
                        <div className="skeleton-label"></div>
                        <div className="skeleton-value"></div>
                        <div className="skeleton-change"></div>
                    </div>
                </div>
            ))}
        </div>
        <div className="wallet-section">
            <div className="skeleton-title"></div>
            <div className="wallet-grid">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="wallet-card skeleton">
                        <div className="skeleton-label"></div>
                        <div className="skeleton-value"></div>
                    </div>
                ))}
            </div>
        </div>
    </div>
)

export default memo(VendorDashboard)
