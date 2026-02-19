const OrderModel = require("../../models/order.model")
const productModel = require("../../models/productModel")
const userModel = require("../../models/userModel")

const exportReport = async(req,res) => {
    try {
        const { type, format = 'json' } = req.body
        
        let data = []
        let filename = ''

        switch(type) {
            case 'orders':
                data = await OrderModel.find().sort({ createdAt: -1 }).lean()
                filename = 'orders-report'
                break
            case 'products':
                data = await productModel.find().sort({ createdAt: -1 }).lean()
                filename = 'products-report'
                break
            case 'users':
                data = await userModel.find({ role: 'CUSTOMER' }).sort({ createdAt: -1 }).lean()
                data = data.map(u => ({
                    name: u.name,
                    email: u.email,
                    mobile: u.mobile,
                    isActive: u.isActive,
                    createdAt: u.createdAt
                }))
                filename = 'customers-report'
                break
            case 'sales':
                const orders = await OrderModel.find().sort({ createdAt: -1 }).lean()
                data = orders.map(o => ({
                    orderId: o.orderId,
                    productName: o.product_details?.name,
                    amount: o.totalAmt,
                    paymentStatus: o.payment_status,
                    date: o.createdAt
                }))
                filename = 'sales-report'
                break
            default:
                return res.status(400).json({
                    message: 'Invalid report type',
                    error: true,
                    success: false
                })
        }

        if (format === 'csv') {
            if (data.length === 0) {
                return res.status(404).json({
                    message: 'No data to export',
                    error: true,
                    success: false
                })
            }

            const headers = Object.keys(data[0]).join(',')
            const rows = data.map(row => 
                Object.values(row).map(val => {
                    if (val === null || val === undefined) return ''
                    if (typeof val === 'object') return JSON.stringify(val)
                    return String(val).includes(',') ? `"${val}"` : val
                }).join(',')
            )
            
            const csv = [headers, ...rows].join('\n')
            
            res.setHeader('Content-Type', 'text/csv')
            res.setHeader('Content-Disposition', `attachment; filename=${filename}.csv`)
            return res.send(csv)
        }

        res.json({
            message: 'Report exported successfully',
            data: data,
            filename: filename,
            count: data.length,
            success: true,
            error: false
        })

    } catch (err) {
        res.status(400).json({
            message : err.message || err,
            error : true,
            success : false
        })
    }
}

module.exports = exportReport
