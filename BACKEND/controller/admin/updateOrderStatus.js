const OrderModel = require("../../models/order.model")

const updateOrderStatus = async(req,res) => {
    try {
        const { orderId, payment_status, order_status, note } = req.body

        if(!orderId){
            return res.status(400).json({
                message : "Order ID is required",
                error : true,
                success : false
            })
        }

        const order = await OrderModel.findById(orderId)

        if(!order){
            return res.status(404).json({
                message : "Order not found",
                error : true,
                success : false
            })
        }

        const statusFlow = {
            'pending': ['processing', 'cancelled'],
            'processing': ['shipped', 'cancelled'],
            'shipped': ['delivered'],
            'delivered': [],
            'cancelled': []
        }

        if(order_status){
            const currentStatus = order.order_status || 'pending'
            
            if(order_status === 'cancelled' && currentStatus !== 'cancelled'){
                order.order_status = 'cancelled'
                order.order_status_history.push({
                    status: 'cancelled',
                    note: note || 'Order cancelled'
                })
            } else if (statusFlow[currentStatus].includes(order_status)){
                order.order_status = order_status
                order.order_status_history.push({
                    status: order_status,
                    note: note || ''
                })
            } else {
                return res.status(400).json({
                    message : `Cannot change status from ${currentStatus} to ${order_status}`,
                    error : true,
                    success : false
                })
            }
        }

        if(payment_status){
            order.payment_status = payment_status
        }

        await order.save()

        res.json({
            message : "Order status updated successfully",
            data : order,
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

module.exports = updateOrderStatus
