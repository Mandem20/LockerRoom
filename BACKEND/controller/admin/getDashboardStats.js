const OrderModel = require("../../models/order.model")
const userModel = require("../../models/userModel")
const refundRequestModel = require("../../models/refundRequest.model")
const mongoose = require("mongoose")

const getDashboardStats = async(req,res) => {
    try {
        const now = new Date()
        const startOfWeek = new Date(now)
        startOfWeek.setDate(now.getDate() - now.getDay())
        startOfWeek.setHours(0, 0, 0, 0)

        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

        const dashboardStats = await OrderModel.aggregate([
            {
                $facet: {
                    totalStats: [
                        {
                            $group: {
                                _id: null,
                                totalRevenue: { $sum: "$totalAmt" },
                                totalOrders: { $sum: 1 }
                            }
                        }
                    ],
                    weeklySales: [
                        { $match: { createdAt: { $gte: startOfWeek } } },
                        {
                            $group: {
                                _id: { $dayOfWeek: "$createdAt" },
                                sales: { $sum: "$totalAmt" },
                                orders: { $sum: 1 }
                            }
                        },
                        { $sort: { _id: 1 } }
                    ],
                    monthlySales: [
                        { $match: { createdAt: { $gte: startOfMonth } } },
                        {
                            $group: {
                                _id: { $dayOfMonth: "$createdAt" },
                                sales: { $sum: "$totalAmt" },
                                orders: { $sum: 1 }
                            }
                        },
                        { $sort: { _id: 1 } }
                    ],
                    topProducts: [
                        {
                            $group: {
                                _id: "$productId",
                                name: { $first: "$product_details.name" },
                                image: { $first: "$product_details.image" },
                                totalSold: { $sum: 1 },
                                totalRevenue: { $sum: "$totalAmt" }
                            }
                        },
                        { $sort: { totalSold: -1 } },
                        { $limit: 5 }
                    ],
                    ordersByStatus: [
                        {
                            $group: {
                                _id: "$status",
                                count: { $sum: 1 }
                            }
                        }
                    ]
                }
            }
        ])

        const stats = dashboardStats[0]
        const { totalRevenue, totalOrders } = stats.totalStats[0] || { totalRevenue: 0, totalOrders: 0 }

        const totalCustomers = await userModel.countDocuments({ role: "CUSTOMER" })

        const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
        const weeklyData = dayNames.map((day, index) => {
            const found = stats.weeklySales.find(d => d._id === index + 1)
            return {
                day,
                sales: found ? found.sales : 0,
                orders: found ? found.orders : 0
            }
        })

        const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
        const monthlyData = Array.from({ length: daysInMonth }, (_, i) => {
            const day = i + 1
            const found = stats.monthlySales.find(d => d._id === day)
            return {
                day: `${monthNames[now.getMonth()]} ${day}`,
                sales: found ? found.sales : 0,
                orders: found ? found.orders : 0
            }
        })

        const orderStatus = stats.ordersByStatus.reduce((acc, item) => {
            acc[item._id] = item.count
            return acc
        }, {})

        const refundStats = await refundRequestModel.aggregate([
            {
                $group: {
                    _id: "$status",
                    count: { $sum: 1 },
                    totalAmount: { $sum: "$amount" }
                }
            }
        ])

        const refundSummary = {
            total: 0,
            pending: 0,
            approved: 0,
            rejected: 0,
            refunded: 0,
            totalRefundAmount: 0
        }

        refundStats.forEach(item => {
            refundSummary.total += item.count
            refundSummary[item._id] = item.count
            if (item._id === 'refunded') {
                refundSummary.totalRefundAmount = item.totalAmount
            }
        })

        res.json({
            message : "Dashboard stats fetched successfully",
            data : {
                totalRevenue: totalRevenue || 0,
                totalOrders: totalOrders || 0,
                totalCustomers: totalCustomers,
                weeklySales: weeklyData,
                monthlySales: monthlyData,
                dailyOrders: weeklyData,
                topProducts: stats.topProducts,
                ordersByStatus: orderStatus,
                refundStats: refundSummary
            },
            success : true,
            error : false
        })
    } catch (err) {
        res.status(400).json({
            message : err.message || err,
            error : true,
            success : false
        })
    }
}

module.exports = getDashboardStats
