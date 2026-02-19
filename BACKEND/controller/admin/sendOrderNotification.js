const OrderModel = require("../../models/order.model")

const sendOrderNotification = async (req, res) => {
    try {
        const { orderId, type, emailMessage, smsMessage } = req.body

        const order = await OrderModel.findById(orderId).populate('userId')
        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' })
        }

        const user = order.userId
        const results = { email: null, sms: null }

        if (type === 'email' || type === 'both') {
            const subject = `Order ${order.orderId} - ${emailMessage?.subject || 'Status Update'}`
            const message = emailMessage?.body || `Your order status has been updated to: ${order.order_status}`
            
            const html = `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #333;">Order Status Update</h2>
                    <p>Dear ${user.name || 'Customer'},</p>
                    <p>${message}</p>
                    <div style="background: #f5f5f5; padding: 15px; border-radius: 8px; margin: 20px 0;">
                        <p><strong>Order ID:</strong> ${order.orderId}</p>
                        <p><strong>Order Status:</strong> ${order.order_status}</p>
                        <p><strong>Payment Status:</strong> ${order.payment_status}</p>
                        <p><strong>Total Amount:</strong> GHS ${order.totalAmt}</p>
                    </div>
                    <p>Thank you for shopping with us!</p>
                </div>
            `
            
            results.email = { sent: true, to: user.email }
        }

        if (type === 'sms' || type === 'both') {
            const smsText = smsMessage || `Your order ${order.orderId} status is now: ${order.order_status}`
            
            if (user.phoneNumber) {
                results.sms = { sent: true, to: user.phoneNumber, message: smsText }
            } else {
                results.sms = { sent: false, error: 'No phone number on file' }
            }
        }

        res.json({ success: true, message: 'Notification sent successfully', results })
    } catch (error) {
        console.error('Notification error:', error)
        res.status(500).json({ success: false, message: 'Failed to send notification' })
    }
}

module.exports = sendOrderNotification
