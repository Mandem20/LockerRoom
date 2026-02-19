const OrderModel = require("../../models/order.model")
const userModel = require("../../models/userModel")

const getDashboardStats = async(req,res) => {
    try {
        const totalRevenue = await OrderModel.aggregate([
            {
                $group: {
                    _id: null,
                    total: { $sum: "$totalAmt" }
                }
            }
        ])

        const totalOrders = await OrderModel.countDocuments()
        
        const totalCustomers = await userModel.countDocuments({ role: "CUSTOMER" })

        const revenue = totalRevenue[0]?.total || 0

        const now = new Date()
        const startOfWeek = new Date(now)
        startOfWeek.setDate(now.getDate() - now.getDay())
        startOfWeek.setHours(0, 0, 0, 0)

        const dailySales = await OrderModel.aggregate([
            {
                $match: {
                    createdAt: { $gte: startOfWeek }
                }
            },
            {
                $group: {
                    _id: { $dayOfWeek: "$createdAt" },
                    total: { $sum: "$totalAmt" },
                    count: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ])

        const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
        const weeklyData = dayNames.map((day, index) => {
            const found = dailySales.find(d => d._id === index + 1)
            return {
                day,
                sales: found ? found.total : 0,
                orders: found ? found.count : 0
            }
        })

        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
        
        const monthlySales = await OrderModel.aggregate([
            {
                $match: {
                    createdAt: { $gte: startOfMonth }
                }
            },
            {
                $group: {
                    _id: { $dayOfMonth: "$createdAt" },
                    total: { $sum: "$totalAmt" },
                    count: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ])

        const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
        const monthlyData = Array.from({ length: daysInMonth }, (_, i) => {
            const day = i + 1
            const found = monthlySales.find(d => d._id === day)
            return {
                day: `${monthNames[now.getMonth()]} ${day}`,
                sales: found ? found.total : 0,
                orders: found ? found.count : 0
            }
        })

        const topProducts = await OrderModel.aggregate([
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
        ])

        res.json({
            message : "Dashboard stats fetched successfully",
            data : {
                totalRevenue: revenue,
                totalOrders: totalOrders,
                totalCustomers: totalCustomers,
                weeklySales: weeklyData,
                monthlySales: monthlyData,
                dailyOrders: weeklyData,
                topProducts: topProducts
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
