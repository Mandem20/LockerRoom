const refundRequestModel = require('../../models/refundRequest.model')
const OrderModel = require('../../models/order.model')

const getAllRefundRequests = async (req, res) => {
    try {
        const { status } = req.body
        const query = status && status !== 'all' ? { status } : {}

        const refunds = await refundRequestModel.find(query)
            .populate('userId', 'name email phone')
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

const updateRefundStatus = async (req, res) => {
    try {
        const { refundId, status, adminNote } = req.body

        if (!refundId || !status) {
            return res.json({
                message: "Refund ID and status are required",
                error: true,
                success: false
            })
        }

        const validStatuses = ['approved', 'rejected', 'refunded']
        if (!validStatuses.includes(status)) {
            return res.json({
                message: "Invalid status",
                error: true,
                success: false
            })
        }

        const refund = await refundRequestModel.findById(refundId)

        if (!refund) {
            return res.json({
                message: "Refund request not found",
                error: true,
                success: false
            })
        }

        const updateData = {
            status,
            adminNote: adminNote || ''
        }

        if (status === 'refunded') {
            updateData.refundDate = new Date()
        }

        const updatedRefund = await refundRequestModel.findByIdAndUpdate(
            refundId,
            updateData,
            { new: true }
        ).populate('userId', 'name email')

        if (status === 'approved' || status === 'rejected') {
            await OrderModel.findByIdAndUpdate(refund.orderId, {
                order_status: status === 'approved' ? 'refund_requested' : 'cancelled'
            })
        }

        res.json({
            message: `Refund request ${status} successfully`,
            data: updatedRefund,
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

const getRefundStats = async (req, res) => {
    try {
        const stats = await refundRequestModel.aggregate([
            {
                $group: {
                    _id: "$status",
                    count: { $sum: 1 },
                    totalAmount: { $sum: "$amount" }
                }
            }
        ])

        const result = stats.reduce((acc, item) => {
            acc[item._id] = { count: item.count, totalAmount: item.totalAmount }
            return acc
        }, {})

        res.json({
            message: "Refund stats fetched successfully",
            data: result,
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
    getAllRefundRequests,
    updateRefundStatus,
    getRefundStats
}
