const OrderModel = require("../../models/order.model")
const userModel = require("../../models/userModel")

const downloadInvoice = async(req,res) => {
    try {
        const { orderId } = req.body

        if(!orderId){
            return res.status(400).json({
                message : "Order ID is required",
                error : true,
                success : false
            })
        }

        const order = await OrderModel.findById(orderId)
            .populate('userId', 'name email mobile')

        if(!order){
            return res.status(404).json({
                message : "Order not found",
                error : true,
                success : false
            })
        }

        const invoiceHtml = `
<!DOCTYPE html>
<html>
<head>
    <title>Invoice - ${order.orderId}</title>
    <style>
        body { font-family: Arial, sans-serif; padding: 20px; }
        .header { text-align: center; margin-bottom: 30px; }
        .company { font-size: 24px; font-weight: bold; color: #dc2626; }
        .invoice-details { display: flex; justify-content: space-between; margin-bottom: 30px; }
        .invoice-details div { width: 45%; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
        th { background-color: #f3f4f6; }
        .total { font-size: 18px; font-weight: bold; text-align: right; }
        .footer { text-align: center; margin-top: 50px; color: #666; font-size: 12px; }
    </style>
</head>
<body>
    <div class="header">
        <div class="company">LOCKERROOM</div>
        <p>Sports & Fashion Store</p>
    </div>
    
    <div class="invoice-details">
        <div>
            <strong>Invoice Number:</strong> ${order.orderId}<br>
            <strong>Date:</strong> ${new Date(order.createdAt).toLocaleDateString()}
        </div>
        <div>
            <strong>Customer:</strong><br>
            ${order.userId?.name || 'N/A'}<br>
            ${order.userId?.email || 'N/A'}<br>
            ${order.userId?.mobile || 'N/A'}
        </div>
    </div>

    <table>
        <thead>
            <tr>
                <th>Product</th>
                <th>Quantity</th>
                <th>Unit Price</th>
                <th>Total</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td>${order.product_details?.name || 'N/A'}</td>
                <td>1</td>
                <td>GHS ${order.subTotalAmt?.toLocaleString() || 0}</td>
                <td>GHS ${order.totalAmt?.toLocaleString() || 0}</td>
            </tr>
        </tbody>
    </table>

    <div class="total">
        <p>Subtotal: GHS ${order.subTotalAmt?.toLocaleString() || 0}</p>
        <p>Total: GHS ${order.totalAmt?.toLocaleString() || 0}</p>
    </div>

    <div class="footer">
        <p>Thank you for your business!</p>
        <p>Generated on ${new Date().toLocaleString()}</p>
    </div>
</body>
</html>
        `

        res.setHeader('Content-Type', 'text/html')
        res.setHeader('Content-Disposition', `attachment; filename=invoice-${order.orderId}.html`)
        res.send(invoiceHtml)

    } catch (err) {
        res.status(400).json({
            message : err.message || err,
            error : true,
            success : false
        })
    }
}

module.exports = downloadInvoice
