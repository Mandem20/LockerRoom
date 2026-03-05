const OrderModel = require('../../models/order.model')
const productModel = require('../../models/productModel')
const VendorModel = require('../../models/vendorModel')
const userModel = require('../../models/userModel')

const dashboardCache = new Map()
const CACHE_TTL = 60000

const getCachedData = (key) => {
    const cached = dashboardCache.get(key)
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
        return cached.data
    }
    return null
}

const setCachedData = (key, data) => {
    dashboardCache.set(key, { data, timestamp: Date.now() })
}

const clearVendorDashboardCache = (vendorId) => {
    const cacheKey = `vendor_dashboard_${vendorId}`
    dashboardCache.delete(cacheKey)
}

const clearAllVendorCaches = () => {
    dashboardCache.clear()
}

const getVendorDashboardStats = async (req, res) => {
    try {
        const vendor = await VendorModel.findOne({ userId: req.userId }).select('-bankDetails -payoutSettings')
        
        if (!vendor) {
            return res.status(404).json({
                message: 'Vendor profile not found',
                error: true,
                success: false
            })
        }

        const vendorProductIds = await productModel.distinct('_id', { 'more_details.vendorId': vendor._id })

        if (vendorProductIds.length === 0) {
            return res.status(200).json({
                message: 'Dashboard stats fetched successfully',
                data: {
                    overview: {
                        totalOrders: 0,
                        pendingOrders: 0,
                        processingOrders: 0,
                        shippedOrders: 0,
                        deliveredOrders: 0,
                        totalRevenue: 0,
                        totalSalesAmount: 0,
                        walletBalance: vendor.walletBalance || 0,
                        pendingBalance: vendor.pendingBalance || 0,
                        availableBalance: vendor.availableBalance || 0,
                        totalProducts: 0
                    },
                    today: { orders: 0, revenue: 0 },
                    thisWeek: { revenue: 0, orders: 0 },
                    monthly: { revenue: 0, orders: 0 },
                    topProducts: [],
                    recentOrders: [],
                    sellerScore: vendor.performanceMetrics?.sellerScore || 0,
                    averageRating: vendor.analytics?.averageRating || 0,
                    verificationStatus: vendor.verificationStatus
                },
                success: true,
                error: false
            })
        }

        const cacheKey = `vendor_dashboard_${vendor._id}`
        const cachedData = getCachedData(cacheKey)
        
        if (cachedData) {
            return res.status(200).json({
                message: 'Dashboard stats fetched successfully',
                data: cachedData,
                success: true,
                error: false,
                cached: true
            })
        }

        const today = new Date()
        today.setHours(0, 0, 0, 0)
        const thisWeek = new Date(today)
        thisWeek.setDate(thisWeek.getDate() - 7)
        const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)

        const [orderStatsResult, todayResult, weeklyResult, monthlyResult, topProducts, recentOrders] = await Promise.all([
            OrderModel.aggregate([
                { $match: { productId: { $in: vendorProductIds } } },
                {
                    $group: {
                        _id: '$order_status',
                        count: { $sum: 1 },
                        totalRevenue: { $sum: '$totalAmt' }
                    }
                }
            ]),
            OrderModel.aggregate([
                { 
                    $match: { 
                        productId: { $in: vendorProductIds },
                        createdAt: { $gte: today }
                    }
                },
                {
                    $group: {
                        _id: null,
                        orders: { $sum: 1 },
                        revenue: { $sum: '$totalAmt' }
                    }
                }
            ]),
            OrderModel.aggregate([
                { 
                    $match: { 
                        productId: { $in: vendorProductIds },
                        createdAt: { $gte: thisWeek },
                        order_status: { $nin: ['cancelled', 'refunded'] }
                    }
                },
                {
                    $group: {
                        _id: null,
                        revenue: { $sum: '$totalAmt' },
                        orders: { $sum: 1 }
                    }
                }
            ]),
            OrderModel.aggregate([
                { 
                    $match: { 
                        productId: { $in: vendorProductIds },
                        createdAt: { $gte: firstDayOfMonth },
                        order_status: { $nin: ['cancelled', 'refunded'] }
                    }
                },
                {
                    $group: {
                        _id: null,
                        revenue: { $sum: '$totalAmt' },
                        orders: { $sum: 1 }
                    }
                }
            ]),
            productModel
                .find({ 'more_details.vendorId': vendor._id })
                .sort({ rating: -1 })
                .limit(5)
                .select('productName productImage sellingPrice rating quantity')
                .lean(),
            OrderModel
                .find({ productId: { $in: vendorProductIds } })
                .populate('userId', 'name email')
                .populate('productId', 'productName productImage')
                .sort({ createdAt: -1 })
                .limit(5)
                .lean()
        ])

        const orderStats = {
            totalOrders: 0,
            pendingOrders: 0,
            processingOrders: 0,
            shippedOrders: 0,
            deliveredOrders: 0,
            totalRevenue: 0
        }

        orderStatsResult.forEach(stat => {
            orderStats.totalOrders += stat.count
            orderStats.totalRevenue += stat.totalRevenue || 0
            if (stat._id === 'pending') orderStats.pendingOrders = stat.count
            if (stat._id === 'processing') orderStats.processingOrders = stat.count
            if (stat._id === 'shipped') orderStats.shippedOrders = stat.count
            if (stat._id === 'delivered') orderStats.deliveredOrders = stat.count
        })

        const stats = {
            overview: {
                ...orderStats,
                totalSalesAmount: orderStats.totalRevenue,
                walletBalance: vendor.walletBalance || 0,
                pendingBalance: vendor.pendingBalance || 0,
                availableBalance: vendor.availableBalance || 0,
                totalProducts: vendor.analytics?.totalProducts || 0
            },
            today: {
                orders: todayResult[0]?.orders || 0,
                revenue: todayResult[0]?.revenue || 0
            },
            thisWeek: {
                revenue: weeklyResult[0]?.revenue || 0,
                orders: weeklyResult[0]?.orders || 0
            },
            monthly: {
                revenue: monthlyResult[0]?.revenue || 0,
                orders: monthlyResult[0]?.orders || 0
            },
            topProducts,
            recentOrders,
            sellerScore: vendor.performanceMetrics?.sellerScore || 0,
            averageRating: vendor.analytics?.averageRating || 0,
            verificationStatus: vendor.verificationStatus
        }

        setCachedData(cacheKey, stats)

        VendorModel.findByIdAndUpdate(vendor._id, {
            lastActiveAt: new Date()
        }).exec()

        res.status(200).json({
            message: 'Dashboard stats fetched successfully',
            data: stats,
            success: true,
            error: false
        })
    } catch (err) {
        res.status(400).json({
            message: err.message || err,
            data: [],
            error: true,
            success: false
        })
    }
}

const getVendorAnalytics = async (req, res) => {
    try {
        const vendor = await VendorModel.findOne({ userId: req.userId })
        
        if (!vendor) {
            return res.status(404).json({
                message: 'Vendor profile not found',
                error: true,
                success: false
            })
        }

        const { period = '7d' } = req.query

        let startDate = new Date()
        if (period === '7d') {
            startDate.setDate(startDate.getDate() - 7)
        } else if (period === '30d') {
            startDate.setDate(startDate.getDate() - 30)
        } else if (period === '90d') {
            startDate.setDate(startDate.getDate() - 90)
        } else if (period === '1y') {
            startDate.setFullYear(startDate.getFullYear() - 1)
        }

        const vendorProductIds = await productModel.distinct('_id', { 'more_details.vendorId': vendor._id })

        const dailyRevenue = await OrderModel.aggregate([
            {
                $match: {
                    productId: { $in: vendorProductIds },
                    createdAt: { $gte: startDate },
                    order_status: { $nin: ['cancelled'] }
                }
            },
            {
                $group: {
                    _id: {
                        $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
                    },
                    revenue: { $sum: '$totalAmt' },
                    orders: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ])

        const revenueByProduct = await OrderModel.aggregate([
            {
                $match: {
                    productId: { $in: vendorProductIds },
                    createdAt: { $gte: startDate },
                    order_status: { $nin: ['cancelled'] }
                }
            },
            {
                $group: {
                    _id: '$productId',
                    totalRevenue: { $sum: '$totalAmt' },
                    totalOrders: { $sum: 1 }
                }
            },
            { $sort: { totalRevenue: -1 } },
            { $limit: 10 }
        ])

        const populatedProducts = await productModel.find({
            _id: { $in: revenueByProduct.map(p => p._id) }
        }).select('productName productImage')

        const revenueByProductWithDetails = revenueByProduct.map(item => {
            const product = populatedProducts.find(p => p._id.toString() === item._id.toString())
            return {
                ...item,
                productName: product?.productName || 'Unknown',
                productImage: product?.productImage?.[0] || ''
            }
        })

        const orderStatusBreakdown = await OrderModel.aggregate([
            {
                $match: {
                    productId: { $in: vendorProductIds }
                }
            },
            {
                $group: {
                    _id: '$order_status',
                    count: { $sum: 1 },
                    revenue: { $sum: '$totalAmt' }
                }
            }
        ])

        const totalRevenue = orderStatusBreakdown
            .filter(s => s._id !== 'cancelled')
            .reduce((sum, s) => sum + s.revenue, 0)

        const totalOrders = orderStatusBreakdown.reduce((sum, s) => sum + s.count, 0)

        const conversionRate = totalOrders > 0 
            ? ((orderStatusBreakdown.find(s => s._id === 'delivered')?.count || 0) / totalOrders * 100).toFixed(2)
            : 0

        const analytics = {
            period,
            startDate,
            endDate: new Date(),
            dailyRevenue,
            revenueByProduct: revenueByProductWithDetails,
            orderStatusBreakdown: orderStatusBreakdown.map(s => ({
                status: s._id,
                count: s.count,
                revenue: s.revenue
            })),
            summary: {
                totalRevenue,
                totalOrders,
                averageOrderValue: totalOrders > 0 ? (totalRevenue / totalOrders).toFixed(2) : 0,
                conversionRate: parseFloat(conversionRate)
            }
        }

        res.status(200).json({
            message: 'Analytics fetched successfully',
            data: analytics,
            success: true,
            error: false
        })
    } catch (err) {
        res.status(400).json({
            message: err.message || err,
            data: [],
            error: true,
            success: false
        })
    }
}

const getVendorPerformanceMetrics = async (req, res) => {
    try {
        const vendor = await VendorModel.findOne({ userId: req.userId })
        
        if (!vendor) {
            return res.status(404).json({
                message: 'Vendor profile not found',
                error: true,
                success: false
            })
        }

        const vendorProductIds = await productModel.distinct('_id', { 'more_details.vendorId': vendor._id })

        const totalOrders = await OrderModel.countDocuments({ 
            productId: { $in: vendorProductIds }
        })

        const deliveredOrders = await OrderModel.countDocuments({ 
            productId: { $in: vendorProductIds },
            order_status: 'delivered'
        })

        const cancelledOrders = await OrderModel.countDocuments({ 
            productId: { $in: vendorProductIds },
            order_status: 'cancelled'
        })

        const onTimeDeliveryRate = deliveredOrders > 0 
            ? ((deliveredOrders - Math.floor(deliveredOrders * 0.05)) / deliveredOrders * 100)
            : 0

        const orderCancellationRate = totalOrders > 0 
            ? (cancelledOrders / totalOrders * 100)
            : 0

        const products = await productModel.find({ 'more_details.vendorId': vendor._id })
        const avgRating = products.length > 0 
            ? products.reduce((sum, p) => sum + (p.rating || 0), 0) / products.length
            : 0

        const sellerScore = calculateSellerScore({
            onTimeDeliveryRate,
            orderCancellationRate,
            avgRating,
            totalOrders
        })

        const metrics = {
            onTimeDeliveryRate: onTimeDeliveryRate.toFixed(2),
            orderCancellationRate: orderCancellationRate.toFixed(2),
            returnRate: vendor.performanceMetrics.returnRate,
            responseTime: vendor.performanceMetrics.responseTime,
            averageRating: avgRating.toFixed(2),
            totalOrders,
            sellerScore: sellerScore.toFixed(0),
            performanceGrade: getPerformanceGrade(sellerScore)
        }

        res.status(200).json({
            message: 'Performance metrics fetched successfully',
            data: metrics,
            success: true,
            error: false
        })
    } catch (err) {
        res.status(400).json({
            message: err.message || err,
            data: [],
            error: true,
            success: false
        })
    }
}

const calculateSellerScore = (metrics) => {
    const onTimeWeight = 30
    const cancellationWeight = 25
    const ratingWeight = 25
    const volumeWeight = 20

    const onTimeScore = Math.min(100, metrics.onTimeDeliveryRate)
    const cancellationScore = 100 - metrics.orderCancellationRate
    const ratingScore = metrics.avgRating * 20
    const volumeScore = Math.min(100, metrics.totalOrders * 2)

    return (onTimeScore * onTimeWeight / 100) +
           (cancellationScore * cancellationWeight / 100) +
           (ratingScore * ratingWeight / 100) +
           (volumeScore * volumeWeight / 100)
}

const getPerformanceGrade = (score) => {
    if (score >= 90) return 'Excellent'
    if (score >= 75) return 'Good'
    if (score >= 60) return 'Fair'
    return 'Needs Improvement'
}

const getVendorSalesChart = async (req, res) => {
    try {
        const vendor = await VendorModel.findOne({ userId: req.userId })
        
        if (!vendor) {
            return res.status(404).json({
                message: 'Vendor profile not found',
                error: true,
                success: false
            })
        }

        const { period = '30d' } = req.query

        let days = 30
        if (period === '7d') days = 7
        else if (period === '30d') days = 30
        else if (period === '90d') days = 90

        const startDate = new Date()
        startDate.setDate(startDate.getDate() - days)

        const vendorProductIds = await productModel.distinct('_id', { 'more_details.vendorId': vendor._id })

        const salesData = await OrderModel.aggregate([
            {
                $match: {
                    productId: { $in: vendorProductIds },
                    createdAt: { $gte: startDate },
                    order_status: { $nin: ['cancelled'] }
                }
            },
            {
                $group: {
                    _id: {
                        $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
                    },
                    orders: { $sum: 1 },
                    revenue: { $sum: '$totalAmt' }
                }
            },
            { $sort: { _id: 1 } }
        ])

        const chartData = []
        const currentDate = new Date(startDate)
        while (currentDate <= new Date()) {
            const dateStr = currentDate.toISOString().split('T')[0]
            const dayData = salesData.find(d => d._id === dateStr)
            chartData.push({
                date: dateStr,
                orders: dayData?.orders || 0,
                revenue: dayData?.revenue || 0
            })
            currentDate.setDate(currentDate.getDate() + 1)
        }

        res.status(200).json({
            message: 'Sales chart data fetched successfully',
            data: chartData,
            success: true,
            error: false
        })
    } catch (err) {
        res.status(400).json({
            message: err.message || err,
            data: [],
            error: true,
            success: false
        })
    }
}

module.exports = {
    getVendorDashboardStats,
    getVendorAnalytics,
    getVendorPerformanceMetrics,
    getVendorSalesChart,
    clearVendorDashboardCache,
    clearAllVendorCaches
}
