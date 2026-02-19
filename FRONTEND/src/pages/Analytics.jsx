import React, { useEffect, useState } from 'react'
import SummaryApi from '../common'
import { toast } from 'react-toastify'
import { useNavigate } from 'react-router-dom'
import { FaChartLine, FaBox, FaUsers, FaShoppingCart, FaMoneyBillWave, FaArrowUp, FaArrowDown, FaCalendar, FaPercent, FaUserPlus } from 'react-icons/fa'
import { Bar } from 'react-chartjs-2'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, PointElement, LineElement } from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, PointElement, LineElement)

const Analytics = () => {
    const navigate = useNavigate()
    const [loading, setLoading] = useState(true)
    const [dateRange, setDateRange] = useState('7')
    const [stats, setStats] = useState({
        totalRevenue: 0,
        totalOrders: 0,
        totalCustomers: 0,
        totalProducts: 0,
        revenueChange: 0,
        ordersChange: 0,
        customersChange: 0,
        productsChange: 0,
        conversionRate: 0,
        conversionChange: 0,
        newCustomers: 0,
    })
    const [salesData, setSalesData] = useState([])
    const [topProducts, setTopProducts] = useState([])

    const fetchAnalytics = async () => {
        setLoading(true)
        try {
            const [ordersRes, productsRes, usersRes, statsRes] = await Promise.all([
                fetch(SummaryApi.allOrders.url, { credentials: 'include' }),
                fetch(SummaryApi.allProduct.url),
                fetch(SummaryApi.allUser.url, { credentials: 'include' }),
                fetch(SummaryApi.dashboardStats.url, { credentials: 'include' })
            ])

            if (ordersRes.status === 403 || statsRes.status === 403) {
                toast.error('Access denied. Admin only.')
                navigate('/')
                return
            }

            const ordersData = await ordersRes.json()
            const productsData = await productsRes.json()
            const usersData = await usersRes.json()
            const statsData = await statsRes.json()

            const orders = ordersData?.data || []
            const products = productsData?.data || []
            const allUsers = usersData?.data || []
            const customers = allUsers.filter(u => u.role === 'CUSTOMER')

            const days = parseInt(dateRange)
            const startDate = new Date()
            startDate.setDate(startDate.getDate() - days)

            const filteredOrders = orders.filter(o => new Date(o.createdAt) >= startDate)
            
            const previousStartDate = new Date()
            previousStartDate.setDate(previousStartDate.getDate() - days * 2)
            const previousEndDate = new Date()
            previousEndDate.setDate(previousEndDate.getDate() - days)
            const previousOrders = orders.filter(o => {
                const date = new Date(o.createdAt)
                return date >= previousStartDate && date < previousEndDate
            })

            const currentCustomers = customers.filter(c => new Date(c.createdAt) >= startDate)
            const previousCustomers = customers.filter(c => {
                const date = new Date(c.createdAt)
                return date >= previousStartDate && date < previousEndDate
            })

            const newCustomersCount = currentCustomers.length
            const previousNewCustomersCount = previousCustomers.length
            const customerGrowth = previousNewCustomersCount > 0 ? parseFloat(((newCustomersCount - previousNewCustomersCount) / previousNewCustomersCount * 100).toFixed(1)) : newCustomersCount > 0 ? 100 : 0

            const currentRevenue = filteredOrders.reduce((sum, o) => sum + (o.totalAmt || 0), 0)
            const previousRevenue = previousOrders.reduce((sum, o) => sum + (o.totalAmt || 0), 0)
            const revenueChange = previousRevenue > 0 ? parseFloat(((currentRevenue - previousRevenue) / previousRevenue * 100).toFixed(1)) : 0

            const currentOrders = filteredOrders.length
            const previousOrdersCount = previousOrders.length
            const ordersChange = previousOrdersCount > 0 ? parseFloat(((currentOrders - previousOrdersCount) / previousOrdersCount * 100).toFixed(1)) : 0

            const conversionRate = customers.length > 0 ? parseFloat(((currentOrders / customers.length) * 100).toFixed(1)) : 0
            const previousConversionRate = (usersData?.data?.length || 0) > 0 ? parseFloat(((previousOrdersCount / (usersData?.data?.length || 1)) * 100).toFixed(1)) : 0
            const conversionChange = previousConversionRate > 0 ? parseFloat((conversionRate - previousConversionRate).toFixed(1)) : 0

            setStats({
                totalRevenue: currentRevenue,
                totalOrders: currentOrders,
                totalCustomers: customers.length,
                totalProducts: products.length,
                revenueChange: revenueChange,
                ordersChange: ordersChange,
                customersChange: customerGrowth,
                productsChange: 0,
                conversionRate: conversionRate,
                conversionChange: conversionChange,
                newCustomers: newCustomersCount,
            })

            const dailySales = {}
            for (let i = days - 1; i >= 0; i--) {
                const date = new Date()
                date.setDate(date.getDate() - i)
                const key = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                dailySales[key] = 0
            }

            filteredOrders.forEach(order => {
                const date = new Date(order.createdAt)
                const key = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                if (dailySales[key] !== undefined) {
                    dailySales[key] += order.totalAmt || 0
                }
            })

            setSalesData(Object.entries(dailySales).map(([date, amount]) => ({ date, amount })))

            const productSales = {}
            filteredOrders.forEach(order => {
                const productName = order.product_details?.name || 'Unknown'
                productSales[productName] = (productSales[productName] || 0) + 1
            })

            const sortedProducts = Object.entries(productSales)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 5)
            setTopProducts(sortedProducts)

        } catch (error) {
            console.error('Error fetching analytics:', error)
            toast.error('Failed to load analytics')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchAnalytics()
    }, [dateRange])

    const chartData = {
        labels: salesData.map(d => d.date),
        datasets: [
            {
                label: 'Revenue (GHS)',
                data: salesData.map(d => d.amount),
                backgroundColor: 'rgba(59, 130, 246, 0.5)',
                borderColor: 'rgb(59, 130, 246)',
                borderWidth: 1,
            },
        ],
    }

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top',
            },
            title: {
                display: false,
            },
        },
        scales: {
            y: {
                beginAtZero: true,
            },
        },
    }

    const StatCard = ({ title, value, change, icon: Icon, prefix = '', suffix = '' }) => {
        const changeNum = Number(change) || 0
        return (
            <div className='bg-white rounded-lg shadow-sm p-6'>
                <div className='flex items-center justify-between'>
                    <div>
                        <p className='text-sm text-gray-500'>{title}</p>
                        <p className='text-2xl font-bold text-gray-800 mt-1'>
                            {prefix}{typeof value === 'number' ? value.toLocaleString() : value}{suffix}
                        </p>
                    </div>
                    <div className='p-3 bg-blue-50 rounded-lg'>
                        <Icon className='text-blue-600 text-xl' />
                    </div>
                </div>
                {changeNum !== 0 && (
                    <div className={`flex items-center mt-2 text-sm ${changeNum >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {changeNum >= 0 ? <FaArrowUp className='mr-1' /> : <FaArrowDown className='mr-1' />}
                        <span>{Math.abs(changeNum)}%</span>
                        <span className='text-gray-400 ml-1'>vs previous period</span>
                    </div>
                )}
            </div>
        )
    }

    if (loading) {
        return (
            <div className='flex items-center justify-center h-64'>
                <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600'></div>
            </div>
        )
    }

    return (
        <div className='space-y-6'>
            <div className='flex flex-col md:flex-row md:items-center md:justify-between gap-4'>
                <div>
                    <h1 className='text-2xl font-bold text-gray-800'>Analytics</h1>
                    <p className='text-gray-500 text-sm mt-1'>Track your store performance</p>
                </div>
                <div className='flex items-center gap-2'>
                    <FaCalendar className='text-gray-400' />
                    <select
                        value={dateRange}
                        onChange={(e) => setDateRange(e.target.value)}
                        className='p-2 border rounded-lg text-sm'
                    >
                        <option value='7'>Last 7 days</option>
                        <option value='14'>Last 14 days</option>
                        <option value='30'>Last 30 days</option>
                        <option value='90'>Last 90 days</option>
                    </select>
                </div>
            </div>

            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
                <StatCard
                    title='Total Revenue'
                    value={stats.totalRevenue}
                    change={stats.revenueChange}
                    icon={FaMoneyBillWave}
                    prefix='GHS '
                />
                <StatCard
                    title='Total Orders'
                    value={stats.totalOrders}
                    change={stats.ordersChange}
                    icon={FaShoppingCart}
                />
                <StatCard
                    title='Total Customers'
                    value={stats.totalCustomers}
                    change={stats.customersChange}
                    icon={FaUsers}
                />
                <StatCard
                    title='Total Products'
                    value={stats.totalProducts}
                    change={stats.productsChange}
                    icon={FaBox}
                />
                <StatCard
                    title='Conversion Rate'
                    value={stats.conversionRate}
                    change={stats.conversionChange}
                    icon={FaPercent}
                    suffix='%'
                />
                <StatCard
                    title='Customer Growth'
                    value={stats.newCustomers}
                    change={stats.customersChange}
                    icon={FaUserPlus}
                />
            </div>

            <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
                <div className='bg-white rounded-lg shadow-sm p-6'>
                    <h2 className='text-lg font-semibold text-gray-800 mb-4'>Revenue Over Time</h2>
                    <div className='h-64'>
                        <Bar data={chartData} options={chartOptions} />
                    </div>
                </div>

                <div className='bg-white rounded-lg shadow-sm p-6'>
                    <h2 className='text-lg font-semibold text-gray-800 mb-4'>Top Selling Products</h2>
                    {topProducts.length === 0 ? (
                        <div className='text-center text-gray-500 py-8'>No sales data available</div>
                    ) : (
                        <div className='space-y-4'>
                            {topProducts.map(([name, count], index) => (
                                <div key={index} className='flex items-center justify-between'>
                                    <div className='flex items-center gap-3'>
                                        <span className='w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium'>
                                            {index + 1}
                                        </span>
                                        <span className='text-gray-700 truncate max-w-[200px]'>{name}</span>
                                    </div>
                                    <div className='flex items-center gap-2'>
                                        <div className='w-24 h-2 bg-gray-200 rounded-full overflow-hidden'>
                                            <div
                                                className='h-full bg-blue-600 rounded-full'
                                                style={{ width: `${(count / topProducts[0][1]) * 100}%` }}
                                            ></div>
                                        </div>
                                        <span className='text-sm text-gray-500 w-12 text-right'>{count} sales</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <div className='bg-white rounded-lg shadow-sm p-6'>
                <h2 className='text-lg font-semibold text-gray-800 mb-4'>Summary</h2>
                <div className='grid grid-cols-1 md:grid-cols-3 gap-4 text-center'>
                    <div className='p-4 bg-gray-50 rounded-lg'>
                        <p className='text-sm text-gray-500'>Average Order Value</p>
                        <p className='text-xl font-bold text-gray-800'>
                            GHS {stats.totalOrders > 0 ? (stats.totalRevenue / stats.totalOrders).toFixed(2) : 0}
                        </p>
                    </div>
                    <div className='p-4 bg-gray-50 rounded-lg'>
                        <p className='text-sm text-gray-500'>Orders Per Day</p>
                        <p className='text-xl font-bold text-gray-800'>
                            {dateRange ? (stats.totalOrders / parseInt(dateRange)).toFixed(1) : 0}
                        </p>
                    </div>
                    <div className='p-4 bg-gray-50 rounded-lg'>
                        <p className='text-sm text-gray-500'>Revenue Per Day</p>
                        <p className='text-xl font-bold text-gray-800'>
                            GHS {dateRange ? (stats.totalRevenue / parseInt(dateRange)).toFixed(2) : 0}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Analytics
