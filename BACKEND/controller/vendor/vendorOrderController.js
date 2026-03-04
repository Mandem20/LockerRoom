const OrderModel = require('../../models/order.model')
const productModel = require('../../models/productModel')
const VendorModel = require('../../models/vendorModel')

const getVendorOrders = async (req, res) => {
    try {
        const vendor = await VendorModel.findOne({ userId: req.userId })
        
        if (!vendor) {
            return res.status(404).json({
                message: 'Vendor profile not found',
                error: true,
                success: false
            })
        }

        const { page = 1, limit = 20, status, search, startDate, endDate, sort } = req.query

        const vendorProductIds = await productModel.distinct('_id', { 'more_details.vendorId': vendor._id })

        const query = { productId: { $in: vendorProductIds } }

        if (status) {
            query.order_status = status
        }

        if (search) {
            query.orderId = { $regex: search, $options: 'i' }
        }

        if (startDate || endDate) {
            query.createdAt = {}
            if (startDate) query.createdAt.$gte = new Date(startDate)
            if (endDate) query.createdAt.$lte = new Date(endDate)
        }

        let sortOption = { createdAt: -1 }
        if (sort === 'oldest') sortOption = { createdAt: 1 }
        else if (sort === 'price_asc') sortOption = { totalAmt: 1 }
        else if (sort === 'price_desc') sortOption = { totalAmt: -1 }

        const orders = await OrderModel
            .find(query)
            .populate('userId', 'name email mobile')
            .populate('productId', 'productName productImage brandName')
            .sort(sortOption)
            .skip((page - 1) * limit)
            .limit(parseInt(limit))

        const total = await OrderModel.countDocuments(query)

        res.status(200).json({
            message: 'Orders fetched successfully',
            data: {
                orders,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    pages: Math.ceil(total / limit)
                }
            },
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

const getVendorOrderById = async (req, res) => {
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

        const order = await OrderModel.findOne({
            _id: req.params.id,
            productId: { $in: vendorProductIds }
        })
        .populate('userId', 'name email mobile addresses')
        .populate('productId', 'productName productImage brandName sellingPrice')
        .populate('delivery_address')

        if (!order) {
            return res.status(404).json({
                message: 'Order not found',
                error: true,
                success: false
            })
        }

        res.status(200).json({
            message: 'Order fetched successfully',
            data: order,
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

const updateVendorOrderStatus = async (req, res) => {
    try {
        const vendor = await VendorModel.findOne({ userId: req.userId })
        
        if (!vendor) {
            return res.status(404).json({
                message: 'Vendor profile not found',
                error: true,
                success: false
            })
        }

        const { orderId, status, note } = req.body

        const vendorProductIds = await productModel.distinct('_id', { 'more_details.vendorId': vendor._id })

        const order = await OrderModel.findOne({
            _id: orderId,
            productId: { $in: vendorProductIds }
        })

        if (!order) {
            return res.status(404).json({
                message: 'Order not found',
                error: true,
                success: false
            })
        }

        const statusFlow = {
            'pending': ['processing', 'cancelled'],
            'processing': ['shipped', 'cancelled'],
            'shipped': ['delivered'],
            'delivered': [],
            'cancelled': []
        }

        if (!statusFlow[order.order_status]?.includes(status)) {
            return res.status(400).json({
                message: `Cannot change status from ${order.order_status} to ${status}`,
                error: true,
                success: false
            })
        }

        order.order_status = status
        order.order_status_history.push({
            status,
            updatedAt: new Date(),
            note: note || `Status updated by vendor: ${status}`
        })

        await order.save()

        res.status(200).json({
            message: 'Order status updated successfully',
            data: order,
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

const getVendorOrderStats = async (req, res) => {
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

        const totalOrders = await OrderModel.countDocuments({ productId: { $in: vendorProductIds } })
        
        const pendingOrders = await OrderModel.countDocuments({ 
            productId: { $in: vendorProductIds },
            order_status: 'pending'
        })
        
        const processingOrders = await OrderModel.countDocuments({ 
            productId: { $in: vendorProductIds },
            order_status: 'processing'
        })
        
        const shippedOrders = await OrderModel.countDocuments({ 
            productId: { $in: vendorProductIds },
            order_status: 'shipped'
        })
        
        const deliveredOrders = await OrderModel.countDocuments({ 
            productId: { $in: vendorProductIds },
            order_status: 'delivered'
        })
        
        const cancelledOrders = await OrderModel.countDocuments({ 
            productId: { $in: vendorProductIds },
            order_status: 'cancelled'
        })

        const revenueResult = await OrderModel.aggregate([
            { 
                $match: { 
                    productId: { $in: vendorProductIds },
                    order_status: { $in: ['delivered', 'shipped', 'processing'] }
                }
            },
            {
                $group: {
                    _id: null,
                    totalRevenue: { $sum: '$totalAmt' },
                    totalSales: { $sum: 1 }
                }
            }
        ])

        const stats = {
            totalOrders,
            pendingOrders,
            processingOrders,
            shippedOrders,
            deliveredOrders,
            cancelledOrders,
            totalRevenue: revenueResult[0]?.totalRevenue || 0,
            totalSales: revenueResult[0]?.totalSales || 0
        }

        res.status(200).json({
            message: 'Order stats fetched successfully',
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

const getRecentVendorOrders = async (req, res) => {
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

        const orders = await OrderModel
            .find({ productId: { $in: vendorProductIds } })
            .populate('userId', 'name email')
            .populate('productId', 'productName productImage sellingPrice')
            .sort({ createdAt: -1 })
            .limit(10)

        res.status(200).json({
            message: 'Recent orders fetched successfully',
            data: orders,
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
    getVendorOrders,
    getVendorOrderById,
    updateVendorOrderStatus,
    getVendorOrderStats,
    getRecentVendorOrders
}
