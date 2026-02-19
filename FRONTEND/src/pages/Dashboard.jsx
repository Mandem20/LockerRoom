import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import SummaryApi from '../common'
import { toast } from 'react-toastify'
import StatCard from '../components/StatCard'
import BarChart from '../components/BarChart'
import displayCEDICurrency from '../helpers/displayCurrency'
import { FaUsers, FaBox, FaTags, FaShoppingCart, FaDollarSign, FaExclamationCircle, FaDownload } from 'react-icons/fa'

const Dashboard = () => {
    const navigate = useNavigate()
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalProducts: 0,
        totalCategories: 0,
        lowStockProducts: 0,
        totalRevenue: 0,
        totalOrders: 0,
        totalCustomers: 0,
        weeklySales: [],
        monthlySales: [],
        dailyOrders: [],
        topProducts: [],
    })
    const [loading, setLoading] = useState(true)
    const [recentProducts, setRecentProducts] = useState([])
    const [exporting, setExporting] = useState(null)

    const handleExport = async (type, format = 'json') => {
        setExporting(type)
        try {
            const response = await fetch(SummaryApi.exportReport.url, {
                method: SummaryApi.exportReport.method,
                credentials: 'include',
                headers: { 'content-type': 'application/json' },
                body: JSON.stringify({ type, format })
            })
            
            if (format === 'csv') {
                const blob = await response.blob()
                const url = window.URL.createObjectURL(blob)
                const a = document.createElement('a')
                a.href = url
                a.download = `${type}-report.csv`
                document.body.appendChild(a)
                a.click()
                window.URL.revokeObjectURL(url)
                document.body.removeChild(a)
            } else {
                const data = await response.json()
                if (data.success) {
                    const blob = new Blob([JSON.stringify(data.data, null, 2)], { type: 'application/json' })
                    const url = window.URL.createObjectURL(blob)
                    const a = document.createElement('a')
                    a.href = url
                    a.download = `${type}-report.json`
                    document.body.appendChild(a)
                    a.click()
                    window.URL.revokeObjectURL(url)
                    document.body.removeChild(a)
                }
            }
        } catch (error) {
            console.error('Export error:', error)
        } finally {
            setExporting(null)
        }
    }

    const fetchDashboardData = async () => {
        setLoading(true)
        try {
            const [usersRes, productsRes, categoriesRes, statsRes] = await Promise.all([
                fetch(SummaryApi.allUser.url, { credentials: 'include' }),
                fetch(SummaryApi.allProduct.url),
                fetch(SummaryApi.getCategories.url, { credentials: 'include' }),
                fetch(SummaryApi.dashboardStats.url, { credentials: 'include' })
            ])

            const usersData = await usersRes.json()
            const productsData = await productsRes.json()
            const categoriesData = await categoriesRes.json()
            const statsData = await statsRes.json()

            if (usersRes.status === 403 || statsRes.status === 403) {
                toast.error('Access denied. Admin only.')
                navigate('/')
                return
            }

            const products = productsData?.data || []
            const lowStock = products.filter(p => p.stock === 'Low Stock' || p.stock === 'Out of Stock').length

            setStats({
                totalUsers: usersData?.data?.length || 0,
                totalProducts: products.length,
                totalCategories: categoriesData?.data?.length || 0,
                lowStockProducts: lowStock,
                totalRevenue: statsData?.data?.totalRevenue || 0,
                totalOrders: statsData?.data?.totalOrders || 0,
                totalCustomers: statsData?.data?.totalCustomers || 0,
                weeklySales: statsData?.data?.weeklySales || [],
                monthlySales: statsData?.data?.monthlySales || [],
                dailyOrders: statsData?.data?.dailyOrders || [],
                topProducts: statsData?.data?.topProducts || [],
            })

            const sortedProducts = [...products].sort((a, b) => 
                new Date(b.createdAt) - new Date(a.createdAt)
            ).slice(0, 5)
            setRecentProducts(sortedProducts)

        } catch (error) {
            console.error('Error fetching dashboard data:', error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchDashboardData()
    }, [])

    const statCards = [
        {
            title: 'Total Revenue',
            value: loading ? '...' : displayCEDICurrency(stats.totalRevenue),
            icon: 'revenue',
            color: 'green',
        },
        {
            title: 'Total Orders',
            value: stats.totalOrders,
            icon: 'orders',
            color: 'blue',
        },
        {
            title: 'Total Products',
            value: stats.totalProducts,
            icon: 'products',
            color: 'green',
            link: 'all-products'
        },
        {
            title: 'Total Customers',
            value: stats.totalCustomers,
            icon: 'users',
            color: 'indigo',
            link: 'all-users'
        },
        {
            title: 'Categories',
            value: stats.totalCategories,
            icon: 'categories',
            color: 'purple',
            link: 'categories'
        },
        {
            title: 'Low Stock',
            value: stats.lowStockProducts,
            icon: 'orders',
            color: 'red',
            link: 'all-products'
        },
    ]

    return (
        <div className='space-y-6'>
            {/* Page Header */}
            <div className='flex items-center justify-between'>
                <div>
                    <h1 className='text-2xl font-bold text-gray-800'>Dashboard</h1>
                    <p className='text-gray-500 text-sm mt-1'>Welcome back! Here's an overview of your store.</p>
                </div>
                <div className='text-sm text-gray-500'>
                    Last updated: {new Date().toLocaleTimeString()}
                </div>
            </div>

            {/* Stats Cards */}
            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4'>
                {statCards.map((stat, index) => (
                    stat.link ? (
                        <Link key={index} to={stat.link}>
                            <StatCard 
                                title={stat.title}
                                value={stat.value}
                                icon={stat.icon}
                                color={stat.color}
                            />
                        </Link>
                    ) : (
                        <StatCard 
                            key={index}
                            title={stat.title}
                            value={stat.value}
                            icon={stat.icon}
                            color={stat.color}
                        />
                    )
                ))}
            </div>

            {/* Sales Chart */}
            <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
                <BarChart 
                    data={stats.weeklySales} 
                    title="Sales This Week" 
                    dataKey="sales" 
                    color="#dc2626"
                />
                <BarChart 
                    data={stats.monthlySales} 
                    title="Revenue This Month" 
                    dataKey="sales" 
                    color="#2563eb"
                />
                <BarChart 
                    data={stats.dailyOrders} 
                    title="Orders This Week" 
                    dataKey="orders" 
                    color="#16a34a"
                />
            </div>

            {/* Top Selling Products */}
            <div className='bg-white rounded-xl shadow-sm p-6'>
                <h3 className='text-lg font-semibold text-gray-800 mb-4'>Top Selling Products</h3>
                {stats.topProducts.length === 0 ? (
                    <p className='text-gray-500 text-center py-4'>No sales data available</p>
                ) : (
                    <div className='space-y-4'>
                        {stats.topProducts.map((product, index) => (
                            <div key={product._id || index} className='flex items-center gap-4 p-3 hover:bg-gray-50 rounded-lg'>
                                <div className='w-8 h-8 rounded-full bg-red-100 flex items-center justify-center text-red-600 font-bold text-sm'>
                                    {index + 1}
                                </div>
                                <img 
                                    src={product.image?.[0] || '/placeholder.png'} 
                                    alt={product.name}
                                    className='w-12 h-12 object-cover rounded-lg bg-gray-100'
                                />
                                <div className='flex-1 min-w-0'>
                                    <p className='font-medium text-gray-800 truncate'>{product.name || 'Unknown Product'}</p>
                                    <p className='text-sm text-gray-500'>{product.totalSold} sold</p>
                                </div>
                                <div className='text-right'>
                                    <p className='font-semibold text-gray-800'>{displayCEDICurrency(product.totalRevenue)}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Low Stock Products Section */}
            {stats.lowStockProducts > 0 && (
                <div className='bg-white rounded-xl shadow-sm p-6'>
                    <div className='flex items-center gap-3 mb-4'>
                        <div className='p-2 bg-red-50 rounded-lg'>
                            <FaExclamationCircle className='text-red-600 text-xl' />
                        </div>
                        <h2 className='text-lg font-semibold text-gray-800'>Low Stock Alert</h2>
                        <span className='ml-auto bg-red-100 text-red-700 text-xs px-2 py-1 rounded-full'>
                            {stats.lowStockProducts} products
                        </span>
                    </div>
                    <div className='space-y-3 max-h-64 overflow-y-auto'>
                        {recentProducts
                            .filter(p => p.stock === 'Low Stock' || p.stock === 'Out of Stock')
                            .map((product) => (
                                <div key={product._id} className='flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg'>
                                    <img 
                                        src={product.productImage?.[0] || '/placeholder.png'} 
                                        alt={product.productName}
                                        className='w-10 h-10 object-cover rounded bg-gray-100'
                                    />
                                    <div className='flex-1 min-w-0'>
                                        <p className='text-sm font-medium text-gray-800 truncate'>{product.productName}</p>
                                        <p className='text-xs text-gray-500'>Qty: {product.quantity || 0}</p>
                                    </div>
                                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                                        product.stock === 'Out of Stock' 
                                            ? 'bg-red-100 text-red-700' 
                                            : 'bg-yellow-100 text-yellow-700'
                                    }`}>
                                        {product.stock}
                                    </span>
                                </div>
                            ))}
                    </div>
                    <Link 
                        to='all-products?inventory=low-stock' 
                        className='block text-center mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm'
                    >
                        View All Low Stock Products
                    </Link>
                </div>
            )}

            {/* Export Reports */}
            <div className='bg-white rounded-xl shadow-sm p-6'>
                <h2 className='text-lg font-semibold text-gray-800 mb-4'>Export Reports</h2>
                <div className='grid grid-cols-2 md:grid-cols-4 gap-3'>
                    <button 
                        onClick={() => handleExport('sales', 'csv')}
                        disabled={exporting === 'sales'}
                        className='flex items-center justify-center gap-2 p-3 bg-red-50 hover:bg-red-100 rounded-lg transition-colors disabled:opacity-50'
                    >
                        <FaDownload className='text-red-600' />
                        <span className='text-sm font-medium text-red-700'>Sales Report</span>
                    </button>
                    <button 
                        onClick={() => handleExport('orders', 'csv')}
                        disabled={exporting === 'orders'}
                        className='flex items-center justify-center gap-2 p-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors disabled:opacity-50'
                    >
                        <FaDownload className='text-blue-600' />
                        <span className='text-sm font-medium text-blue-700'>Orders Report</span>
                    </button>
                    <button 
                        onClick={() => handleExport('products', 'csv')}
                        disabled={exporting === 'products'}
                        className='flex items-center justify-center gap-2 p-3 bg-green-50 hover:bg-green-100 rounded-lg transition-colors disabled:opacity-50'
                    >
                        <FaDownload className='text-green-600' />
                        <span className='text-sm font-medium text-green-700'>Products Report</span>
                    </button>
                    <button 
                        onClick={() => handleExport('users', 'csv')}
                        disabled={exporting === 'users'}
                        className='flex items-center justify-center gap-2 p-3 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors disabled:opacity-50'
                    >
                        <FaDownload className='text-purple-600' />
                        <span className='text-sm font-medium text-purple-700'>Customers Report</span>
                    </button>
                </div>
            </div>

            {/* Quick Actions */}
            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                <div className='bg-white rounded-xl shadow-sm p-6'>
                    <h2 className='text-lg font-semibold text-gray-800 mb-4'>Quick Actions</h2>
                    <div className='grid grid-cols-2 gap-3'>
                        <Link 
                            to='all-products' 
                            className='p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors text-center'
                        >
                            <FaBox className='text-2xl text-gray-600 mx-auto mb-2' />
                            <span className='text-sm font-medium text-gray-700'>Add Product</span>
                        </Link>
                        <Link 
                            to='categories' 
                            className='p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors text-center'
                        >
                            <FaTags className='text-2xl text-gray-600 mx-auto mb-2' />
                            <span className='text-sm font-medium text-gray-700'>Manage Categories</span>
                        </Link>
                        <Link 
                            to='all-users' 
                            className='p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors text-center'
                        >
                            <FaUsers className='text-2xl text-gray-600 mx-auto mb-2' />
                            <span className='text-sm font-medium text-gray-700'>View Users</span>
                        </Link>
                        <Link 
                            to='/' 
                            className='p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors text-center'
                        >
                            <FaShoppingCart className='text-2xl text-gray-600 mx-auto mb-2' />
                            <span className='text-sm font-medium text-gray-700'>Go to Store</span>
                        </Link>
                    </div>
                </div>
            </div>

            {/* Recent Products */}
            <div className='bg-white rounded-xl shadow-sm p-6'>
                <div className='flex items-center justify-between mb-4'>
                    <h2 className='text-lg font-semibold text-gray-800'>Recent Products</h2>
                    <Link 
                        to='all-products' 
                        className='text-sm text-red-600 hover:text-red-700 font-medium'
                    >
                        View All →
                    </Link>
                </div>
                
                {loading ? (
                    <div className='space-y-3'>
                        {[1, 2, 3].map((i) => (
                            <div key={i} className='flex items-center gap-4 animate-pulse'>
                                <div className='w-12 h-12 bg-gray-200 rounded'></div>
                                <div className='flex-1'>
                                    <div className='h-4 bg-gray-200 rounded w-1/3 mb-2'></div>
                                    <div className='h-3 bg-gray-200 rounded w-1/4'></div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : recentProducts.length === 0 ? (
                    <p className='text-gray-500 text-center py-8'>No products found</p>
                ) : (
                    <div className='space-y-3'>
                        {recentProducts.map((product) => (
                            <div key={product._id} className='flex items-center gap-4 p-3 hover:bg-gray-50 rounded-lg transition-colors'>
                                <img 
                                    src={product.productImage?.[0] || '/placeholder.png'} 
                                    alt={product.productName}
                                    className='w-12 h-12 object-cover rounded-lg bg-gray-100'
                                />
                                <div className='flex-1 min-w-0'>
                                    <p className='font-medium text-gray-800 truncate'>{product.productName}</p>
                                    <p className='text-sm text-gray-500'>{product.category} • {product.brandName}</p>
                                </div>
                                <div className='text-right'>
                                    <p className='font-medium text-gray-800'>{displayCEDICurrency(product.sellingPrice)}</p>
                                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                                        product.stock === 'In Stock' ? 'bg-green-100 text-green-700' :
                                        product.stock === 'Low Stock' ? 'bg-yellow-100 text-yellow-700' :
                                        'bg-red-100 text-red-700'
                                    }`}>
                                        {product.stock || 'Unknown'}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

export default Dashboard
