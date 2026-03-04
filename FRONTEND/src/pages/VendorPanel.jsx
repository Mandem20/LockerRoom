import { useEffect, useState } from 'react'
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom'
import { useSelector } from 'react-redux'
import SummaryApi from '../common'
import './VendorPanel.css'
import './VendorPages.css'
import { FaBars, FaTimes } from 'react-icons/fa'

const VendorPanel = () => {
    const user = useSelector(state => state?.user?.user)
    const navigate = useNavigate()
    const location = useLocation()
    const [vendorStatus, setVendorStatus] = useState(null)
    const [loading, setLoading] = useState(true)
    const [sidebarOpen, setSidebarOpen] = useState(false)

    useEffect(() => {
        fetchVendorStatus()
    }, [])

    const isVendor = vendorStatus?.isVendor === true
    const verificationStatus = vendorStatus?.verificationStatus || 'none'

    useEffect(() => {
        if (!loading && vendorStatus) {
            if (!vendorStatus.hasVendorApplication && verificationStatus === 'none') {
                navigate('/become-vendor')
            }
        }
    }, [loading, vendorStatus, verificationStatus, navigate])

    const fetchVendorStatus = async () => {
        try {
            const response = await fetch(SummaryApi.vendorStatus.url, {
                method: SummaryApi.vendorStatus.method,
                credentials: 'include'
            })
            const data = await response.json()
            
            if (data.success) {
                setVendorStatus(data.data)
            } else {
                setVendorStatus({ isVendor: false, verificationStatus: 'none' })
            }
        } catch (error) {
            console.error('Error fetching vendor status:', error)
            setVendorStatus({ isVendor: false, verificationStatus: 'none' })
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <div className="vendor-loading">
                <div className="spinner"></div>
                <p>Loading vendor panel...</p>
            </div>
        )
    }

    const menuItems = [
        {
            id: 'dashboard',
            label: 'Dashboard',
            icon: '📊',
            path: '/vendor-panel'
        },
        {
            id: 'products',
            label: 'Products',
            icon: '📦',
            path: '/vendor-panel/products'
        },
        {
            id: 'orders',
            label: 'Orders',
            icon: '🛒',
            path: '/vendor-panel/orders'
        },
        {
            id: 'analytics',
            label: 'Analytics',
            icon: '📈',
            path: '/vendor-panel/analytics'
        },
        {
            id: 'wallet',
            label: 'Wallet & Payouts',
            icon: '💰',
            path: '/vendor-panel/wallet'
        },
        {
            id: 'profile',
            label: 'Store Settings',
            icon: '⚙️',
            path: '/vendor-panel/settings'
        }
    ]

    const currentPath = location.pathname
    const activeItem = menuItems.find(item => 
        item.path === currentPath || 
        (item.path !== '/vendor-panel' && currentPath.startsWith(item.path))
    )

    return (
        <div className="vendor-panel">
            <aside className={`vendor-sidebar ${sidebarOpen ? 'open' : ''}`}>
                <div className="vendor-sidebar-header">
                    <h2>🛒 Vendor Panel</h2>
                    {vendorStatus?.storeName && (
                        <span className="store-name">{vendorStatus.storeName}</span>
                    )}
                </div>

                {verificationStatus !== 'verified' && verificationStatus !== 'none' && (
                    <div className="verification-warning">
                        {verificationStatus === 'pending' && (
                            <>
                                <p>⏳ Your vendor application is pending review</p>
                                <button 
                                    className="btn-become-vendor"
                                    onClick={() => navigate('/become-vendor')}
                                >
                                    View Application
                                </button>
                            </>
                        )}
                        {verificationStatus === 'under_review' && (
                            <>
                                <p>🔍 Your documents are under review</p>
                                <button 
                                    className="btn-become-vendor"
                                    onClick={() => navigate('/become-vendor')}
                                >
                                    View Status
                                </button>
                            </>
                        )}
                        {verificationStatus === 'suspended' && (
                            <p>⚠️ Your account is suspended</p>
                        )}
                        {verificationStatus === 'rejected' && (
                            <>
                                <p>❌ Your application was rejected</p>
                                <button 
                                    className="btn-become-vendor"
                                    onClick={() => navigate('/become-vendor')}
                                >
                                    Reapply
                                </button>
                            </>
                        )}
                    </div>
                )}

                {isVendor && (
                <nav className="vendor-nav">
                    {menuItems.map(item => (
                        <Link
                            key={item.id}
                            to={item.path}
                            className={`vendor-nav-item ${activeItem?.id === item.id ? 'active' : ''}`}
                            onClick={() => setSidebarOpen(false)}
                        >
                            <span className="nav-icon">{item.icon}</span>
                            <span className="nav-label">{item.label}</span>
                        </Link>
                    ))}
                </nav>
                )}

                <div className="vendor-sidebar-footer">
                    {isVendor && (
                        <div className="vendor-stats-mini">
                            <div className="stat">
                                <span className="stat-value">${vendorStatus?.availableBalance?.toFixed(2) || '0.00'}</span>
                                <span className="stat-label">Available</span>
                            </div>
                            <div className="stat">
                                <span className="stat-value">{vendorStatus?.analytics?.totalOrders || 0}</span>
                                <span className="stat-label">Orders</span>
                            </div>
                        </div>
                    )}
                </div>
            </aside>

            <main className="vendor-main">
                <header className="vendor-header">
                    <div className="vendor-header-left">
                        {isVendor && (
                            <button 
                                className="mobile-menu-btn"
                                onClick={() => setSidebarOpen(!sidebarOpen)}
                            >
                                {sidebarOpen ? <FaTimes /> : <FaBars />}
                            </button>
                        )}
                        <h1>{isVendor ? (activeItem?.label || 'Dashboard') : 'Vendor Access'}</h1>
                    </div>
                    <div className="vendor-header-right">
                        <div className="vendor-info">
                            <span className="vendor-name">{user?.name}</span>
                            {isVendor && (
                                <span className={`status-badge ${vendorStatus?.verificationStatus}`}>
                                    {vendorStatus?.verificationStatus || 'N/A'}
                                </span>
                            )}
                        </div>
                    </div>
                </header>
                <div className="vendor-content">
                    {isVendor ? (
                        <Outlet />
                    ) : (
                        <div className="not-vendor-message">
                            <div className="not-vendor-card">
                                <span className="not-vendor-icon">🏪</span>
                                <h2>Become a Vendor</h2>
                                <p>Start selling your products on LockerRoom</p>
                                <button 
                                    className="btn-primary"
                                    onClick={() => navigate('/become-vendor')}
                                >
                                    Apply Now
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </main>
            
            {/* Mobile overlay */}
            {sidebarOpen && (
                <div 
                    className="sidebar-overlay"
                    onClick={() => setSidebarOpen(false)}
                />
            )}
        </div>
    )
}

export default VendorPanel
