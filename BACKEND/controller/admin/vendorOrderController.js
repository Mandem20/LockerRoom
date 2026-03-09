const OrderModel = require('../../models/order.model')
const productModel = require('../../models/productModel')
const VendorModel = require('../../models/vendorModel')
const userModel = require('../../models/userModel')

const getAllVendorOrders = async (req, res) => {
    try {
        const { page = 1, limit = 20, status, search, vendorId, startDate, endDate, sort } = req.query

        const query = {}

        if (vendorId) {
            const vendorProductIds = await productModel.distinct('_id', {
                $or: [
                    { 'more_details.vendorId': vendorId },
                    { vendorId: vendorId }
                ]
            })
            query.productId = { $in: vendorProductIds }
        }

        if (status) {
            query.order_status = status
        }

        if (search) {
            query.$or = [
                { orderId: { $regex: search, $options: 'i' } },
                { 'product_details.name': { $regex: search, $options: 'i' } }
            ]
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

        const orders = await OrderModel.find(query)
            .populate('userId', 'name email mobile')
            .populate('productId', 'productName productImage brandName')
            .sort(sortOption)
            .skip((page - 1) * limit)
            .limit(parseInt(limit))

        const total = await OrderModel.countDocuments(query)

        const ordersWithVendor = await Promise.all(orders.map(async (order) => {
            let vendorInfo = null
            
            if (order.productId) {
                const product = await productModel.findById(order.productId)
                if (product) {
                    const vendorId = product.more_details?.vendorId || product.vendorId
                    if (vendorId) {
                        const vendorIdStr = vendorId.toString()
                        const vendor = await VendorModel.findById(vendorIdStr).populate('userId', 'name email')
                        if (vendor) {
                            vendorInfo = {
                                _id: vendor._id,
                                businessName: vendor.businessName || 'N/A',
                                storeName: vendor.storeName || 'N/A',
                                ownerName: vendor.userId?.name || 'N/A'
                            }
                        }
                    }
                }
            }

            return {
                _id: order._id,
                orderId: order.orderId,
                productId: order.productId,
                product_details: order.product_details,
                payment_status: order.payment_status,
                order_status: order.order_status,
                order_status_history: order.order_status_history,
                payment_mode: order.payment_mode,
                delivery_address: order.delivery_address,
                subTotalAmt: order.subTotalAmt,
                totalAmt: order.totalAmt,
                createdAt: order.createdAt,
                userId: order.userId,
                vendor: vendorInfo
            }
        }))

        const vendors = await VendorModel.find({ verificationStatus: 'verified' })
            .select('businessName storeName')

        res.status(200).json({
            message: 'Vendor orders fetched successfully',
            data: {
                orders: ordersWithVendor,
                vendors: vendors.map(v => ({
                    _id: v._id,
                    businessName: v.businessName,
                    storeName: v.storeName
                })),
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

const getVendorOrderStats = async (req, res) => {
    try {
        const vendors = await VendorModel.find({ verificationStatus: 'verified' })
        
        const vendorStats = await Promise.all(vendors.map(async (vendor) => {
            const vendorProductIds = await productModel.distinct('_id', {
                $or: [
                    { 'more_details.vendorId': vendor._id },
                    { vendorId: vendor._id }
                ]
            })

            const totalOrders = await OrderModel.countDocuments({
                productId: { $in: vendorProductIds }
            })

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

            const fulfillmentRate = totalOrders > 0 
                ? ((deliveredOrders / totalOrders) * 100).toFixed(1) 
                : 0

            const cancellationRate = totalOrders > 0 
                ? ((cancelledOrders / totalOrders) * 100).toFixed(1) 
                : 0

            return {
                vendorId: vendor._id,
                businessName: vendor.businessName,
                storeName: vendor.storeName,
                totalOrders,
                pendingOrders,
                processingOrders,
                shippedOrders,
                deliveredOrders,
                cancelledOrders,
                fulfillmentRate,
                cancellationRate
            }
        }))

        res.status(200).json({
            message: 'Vendor order stats fetched successfully',
            data: vendorStats,
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

const adminOverrideOrderStatus = async (req, res) => {
    try {
        const { orderId, newStatus, reason } = req.body

        if (!orderId || !newStatus) {
            return res.status(400).json({
                message: 'Order ID and new status are required',
                error: true,
                success: false
            })
        }

        const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled']
        if (!validStatuses.includes(newStatus)) {
            return res.status(400).json({
                message: 'Invalid status',
                error: true,
                success: false
            })
        }

        const order = await OrderModel.findById(orderId)

        if (!order) {
            return res.status(404).json({
                message: 'Order not found',
                error: true,
                success: false
            })
        }

        const oldStatus = order.order_status
        order.order_status = newStatus
        order.order_status_history.push({
            status: newStatus,
            updatedAt: new Date(),
            note: reason || `Status overridden by admin: ${newStatus} (was: ${oldStatus})`
        })

        await order.save()

        res.status(200).json({
            message: 'Order status overridden successfully',
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

const adminResolveDispute = async (req, res) => {
    try {
        const { orderId, resolution, refundAmount } = req.body

        if (!orderId || !resolution) {
            return res.status(400).json({
                message: 'Order ID and resolution are required',
                error: true,
                success: false
            })
        }

        const order = await OrderModel.findById(orderId)

        if (!order) {
            return res.status(404).json({
                message: 'Order not found',
                error: true,
                success: false
            })
        }

        order.order_status_history.push({
            status: order.order_status,
            updatedAt: new Date(),
            note: `DISPUTE RESOLVED by admin: ${resolution}. Refund: ${refundAmount || 0}`
        })

        if (resolution === 'refund' || resolution === 'full_refund') {
            order.payment_status = 'refunded'
        } else if (resolution === 'reject') {
            order.order_status_history.push({
                status: order.order_status,
                updatedAt: new Date(),
                note: 'Dispute rejected by admin'
            })
        }

        await order.save()

        res.status(200).json({
            message: 'Dispute resolved successfully',
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

const adminCancelOrder = async (req, res) => {
    try {
        const { orderId, reason } = req.body

        if (!orderId) {
            return res.status(400).json({
                message: 'Order ID is required',
                error: true,
                success: false
            })
        }

        const order = await OrderModel.findById(orderId)

        if (!order) {
            return res.status(404).json({
                message: 'Order not found',
                error: true,
                success: false
            })
        }

        if (order.order_status === 'delivered') {
            return res.status(400).json({
                message: 'Cannot cancel a delivered order',
                error: true,
                success: false
            })
        }

        order.order_status = 'cancelled'
        order.order_status_history.push({
            status: 'cancelled',
            updatedAt: new Date(),
            note: reason || 'Order cancelled by admin'
        })

        await order.save()

        res.status(200).json({
            message: 'Order cancelled successfully',
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

module.exports = {
    getAllVendorOrders,
    getVendorOrderStats,
    adminOverrideOrderStatus,
    adminResolveDispute,
    adminCancelOrder
}
