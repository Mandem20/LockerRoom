const OrderModel = require("../../models/order.model")

const getAllOrders = async(req,res) => {
    try {
        const orders = await OrderModel.find()
            .populate('userId', 'name email mobile')
            .populate('delivery_address')
            .sort({ createdAt: -1 })

        res.json({
            message : "Orders fetched successfully",
            data : orders,
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

module.exports = getAllOrders
