const refundRequestModel = require('../../models/refundRequest.model')
const OrderModel = require('../../models/order.model')

const createRefundRequest = async (req, res) => {
    try {
        const userId = req.userId
        const { orderId, reason, description } = req.body

        if (!orderId || !reason) {
            return res.json({
                message: "Order ID and reason are required",
                error: true,
                success: false
            })
        }

        const order = await OrderModel.findOne({ _id: orderId, userId })

        if (!order) {
            return res.json({
                message: "Order not found",
                error: true,
                success: false
            })
        }

        if (order.order_status === 'cancelled') {
            return res.json({
                message: "Cannot request refund for cancelled order",
                error: true,
                success: false
            })
        }

        const existingRequest = await refundRequestModel.findOne({
            userId,
            orderId,
            status: { $in: ['pending', 'approved'] }
        })

        if (existingRequest) {
            return res.json({
                message: "Refund request already exists for this order",
                error: true,
                success: false
            })
        }

        const refundRequest = await refundRequestModel.create({
            userId,
            orderId,
            productId: order.productId,
            reason,
            description: description || '',
            amount: order.totalAmt
        })

        res.json({
            message: "Refund request submitted successfully",
            data: refundRequest,
            success: true,
            error: false
        })
    } catch (err) {
        res.json({
            message: err.message || "Something went wrong",
            error: true,
            success: false
        })
    }
}

const getMyRefundRequests = async (req, res) => {
    try {
        const userId = req.userId

        const refunds = await refundRequestModel.find({ userId })
            .populate('orderId', 'orderId order_status totalAmt')
            .sort({ createdAt: -1 })

        res.json({
            message: "Refund requests fetched successfully",
            data: refunds,
            success: true,
            error: false
        })
    } catch (err) {
        res.json({
            message: err.message || "Something went wrong",
            error: true,
            success: false
        })
    }
}

const getRefundRequestDetails = async (req, res) => {
    try {
        const userId = req.userId
        const { refundId } = req.body

        const refund = await refundRequestModel.findOne({ _id: refundId, userId })
            .populate('orderId')

        if (!refund) {
            return res.json({
                message: "Refund request not found",
                error: true,
                success: false
            })
        }

        res.json({
            message: "Refund request details fetched successfully",
            data: refund,
            success: true,
            error: false
        })
    } catch (err) {
        res.json({
            message: err.message || "Something went wrong",
            error: true,
            success: false
        })
    }
}

module.exports = {
    createRefundRequest,
    getMyRefundRequests,
    getRefundRequestDetails
}
