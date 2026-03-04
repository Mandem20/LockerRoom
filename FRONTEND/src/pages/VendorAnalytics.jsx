import { useEffect, useState } from 'react'
import SummaryApi from '../common'
import displayCEDICurrency from '../helpers/displayCurrency'
import { useNavigate } from 'react-router-dom'

const VendorAnalytics = () => {
    const [period, setPeriod] = useState('30d')
    const [analytics, setAnalytics] = useState(null)
    const [performance, setPerformance] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const navigate = useNavigate()

    useEffect(() => {
        fetchAnalytics()
        fetchPerformance()
    }, [period])

    const fetchAnalytics = async () => {
        setLoading(true)
        try {
            const response = await fetch(`${SummaryApi.vendorAnalytics.url}?period=${period}`, {
                method: SummaryApi.vendorAnalytics.method,
                credentials: 'include'
            })
            const data = await response.json()
            
            if (data.success) {
                setAnalytics(data.data)
            } else if (data.message === 'Please login first') {
                navigate('/login')
            } else {
                setError(data.message)
            }
        } catch (error) {
            console.error('Error fetching analytics:', error)
            setError('Failed to load analytics')
        } finally {
            setLoading(false)
        }
    }

    const fetchPerformance = async () => {
        try {
            const response = await fetch(SummaryApi.vendorPerformanceMetrics.url, {
                method: SummaryApi.vendorPerformanceMetrics.method,
                credentials: 'include'
            })
            const data = await response.json()
            
            if (data.success) {
                setPerformance(data.data)
            }
        } catch (error) {
            console.error('Error fetching performance:', error)
        }
    }

    if (loading) {
        return (
            <div className="loading-container">
                <div className="spinner"></div>
            </div>
        )
    }

    return (
        <div className="vendor-analytics">
            {/* Period Selector */}
            <div className="analytics-header">
                <h2>Analytics Overview</h2>
                <div className="period-selector">
                    <button 
                        className={period === '7d' ? 'active' : ''}
                        onClick={() => setPeriod('7d')}
                    >
                        7 Days
                    </button>
                    <button 
                        className={period === '30d' ? 'active' : ''}
                        onClick={() => setPeriod('30d')}
                    >
                        30 Days
                    </button>
                    <button 
                        className={period === '90d' ? 'active' : ''}
                        onClick={() => setPeriod('90d')}
                    >
                        90 Days
                    </button>
                    <button 
                        className={period === '1y' ? 'active' : ''}
                        onClick={() => setPeriod('1y')}
                    >
                        1 Year
                    </button>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="analytics-summary">
                <div className="summary-card">
                    <div className="card-icon">💰</div>
                    <div className="card-content">
                        <span className="card-label">Total Revenue</span>
                        <span className="card-value">{displayCEDICurrency(analytics?.summary?.totalRevenue || 0)}</span>
                    </div>
                </div>
                <div className="summary-card">
                    <div className="card-icon">🛒</div>
                    <div className="card-content">
                        <span className="card-label">Total Orders</span>
                        <span className="card-value">{analytics?.summary?.totalOrders || 0}</span>
                    </div>
                </div>
                <div className="summary-card">
                    <div className="card-icon">📊</div>
                    <div className="card-content">
                        <span className="card-label">Avg. Order Value</span>
                        <span className="card-value">{displayCEDICurrency(analytics?.summary?.averageOrderValue || 0)}</span>
                    </div>
                </div>
                <div className="summary-card">
                    <div className="card-icon">📈</div>
                    <div className="card-content">
                        <span className="card-label">Conversion Rate</span>
                        <span className="card-value">{analytics?.summary?.conversionRate || 0}%</span>
                    </div>
                </div>
            </div>

            {/* Sales Chart */}
            <div className="analytics-section">
                <h3>Revenue & Orders Over Time</h3>
                <div className="chart-container">
                    {analytics?.dailyRevenue?.length > 0 ? (
                        <div className="chart">
                            <div className="chart-bars">
                                {analytics.dailyRevenue.slice(-14).map((day, index) => {
                                    const maxRevenue = Math.max(...analytics.dailyRevenue.map(d => d.revenue))
                                    const height = maxRevenue > 0 ? (day.revenue / maxRevenue) * 100 : 0
                                    return (
                                        <div key={index} className="chart-bar-wrapper">
                                            <div 
                                                className="chart-bar revenue"
                                                style={{ height: `${height}%` }}
                                                title={`Revenue: ${displayCEDICurrency(day.revenue)}`}
                                            >
                                                <span className="bar-value">{displayCEDICurrency(day.revenue)}</span>
                                            </div>
                                            <span className="bar-label">{day._id?.slice(5)}</span>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    ) : (
                        <div className="empty-chart">
                            <span>📊</span>
                            <p>No data available for this period</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Performance Metrics */}
            <div className="analytics-section">
                <h3>Performance Metrics</h3>
                <div className="performance-grid">
                    <div className="performance-card">
                        <div className="score-circle" style={{
                            background: `conic-gradient(#10b981 ${(performance?.sellerScore || 0) * 3.6}deg, #e5e7eb 0deg)`
                        }}>
                            <div className="score-inner">
                                <span className="score-value">{performance?.sellerScore || 0}</span>
                                <span className="score-label">Seller Score</span>
                            </div>
                        </div>
                        <span className="performance-grade">{performance?.performanceGrade}</span>
                    </div>

                    <div className="metrics-list">
                        <div className="metric-item">
                            <div className="metric-info">
                                <span className="metric-label">On-Time Delivery</span>
                                <span className="metric-value">{performance?.onTimeDeliveryRate || 0}%</span>
                            </div>
                            <div className="metric-bar">
                                <div 
                                    className="metric-fill"
                                    style={{ width: `${performance?.onTimeDeliveryRate || 0}%` }}
                                ></div>
                            </div>
                        </div>

                        <div className="metric-item">
                            <div className="metric-info">
                                <span className="metric-label">Order Cancellation Rate</span>
                                <span className="metric-value">{performance?.orderCancellationRate || 0}%</span>
                            </div>
                            <div className="metric-bar">
                                <div 
                                    className="metric-fill warning"
                                    style={{ width: `${performance?.orderCancellationRate || 0}%` }}
                                ></div>
                            </div>
                        </div>

                        <div className="metric-item">
                            <div className="metric-info">
                                <span className="metric-label">Average Rating</span>
                                <span className="metric-value">★ {performance?.averageRating || 0}</span>
                            </div>
                            <div className="metric-bar">
                                <div 
                                    className="metric-fill success"
                                    style={{ width: `${(performance?.averageRating || 0) * 20}%` }}
                                ></div>
                            </div>
                        </div>

                        <div className="metric-item">
                            <div className="metric-info">
                                <span className="metric-label">Total Orders</span>
                                <span className="metric-value">{performance?.totalOrders || 0}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Order Status Breakdown */}
            <div className="analytics-section">
                <h3>Order Status Breakdown</h3>
                <div className="status-breakdown">
                    {analytics?.orderStatusBreakdown?.map((item, index) => (
                        <div key={index} className={`status-item ${item.status}`}>
                            <span className="status-name">{item.status}</span>
                            <span className="status-count">{item.count}</span>
                            <span className="status-revenue">{displayCEDICurrency(item.revenue)}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Top Products */}
            <div className="analytics-section">
                <h3>Top Performing Products</h3>
                <div className="top-products">
                    {analytics?.revenueByProduct?.length > 0 ? (
                        analytics.revenueByProduct.map((product, index) => (
                            <div key={index} className="top-product-item">
                                <span className="rank">#{index + 1}</span>
                                <div className="product-image">
                                    {product.productImage ? (
                                        <img src={product.productImage} alt="" />
                                    ) : (
                                        <span>📦</span>
                                    )}
                                </div>
                                <div className="product-info">
                                    <span className="product-name">{product.productName}</span>
                                    <span className="product-orders">{product.totalOrders} orders</span>
                                </div>
                                <span className="product-revenue">{displayCEDICurrency(product.totalRevenue)}</span>
                            </div>
                        ))
                    ) : (
                        <div className="empty-state">
                            <span>📦</span>
                            <p>No products data available</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default VendorAnalytics
