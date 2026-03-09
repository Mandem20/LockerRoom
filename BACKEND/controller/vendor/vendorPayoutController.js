const VendorModel = require('../../models/vendorModel')
const OrderModel = require('../../models/order.model')
const productModel = require('../../models/productModel')

const getVendorPayouts = async (req, res) => {
    try {
        const vendor = req.vendor || await VendorModel.findOne({ userId: req.userId })
        
        if (!vendor) {
            return res.status(404).json({
                message: 'Vendor profile not found',
                error: true,
                success: false
            })
        }

        const { page = 1, limit = 20, status } = req.query

        const query = {}

        if (status) {
            query.status = status
        }

        const payouts = vendor.payouts || []

        const filteredPayouts = status 
            ? payouts.filter(p => p.status === status)
            : payouts

        const total = filteredPayouts.length
        const paginatedPayouts = filteredPayouts
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .skip((page - 1) * limit)
            .limit(parseInt(limit))

        res.status(200).json({
            message: 'Payouts fetched successfully',
            data: {
                payouts: paginatedPayouts,
                walletBalance: vendor.walletBalance,
                pendingBalance: vendor.pendingBalance,
                availableBalance: vendor.availableBalance,
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

const requestPayout = async (req, res) => {
    try {
        const vendor = req.vendor || await VendorModel.findOne({ userId: req.userId })
        
        if (!vendor) {
            return res.status(404).json({
                message: 'Vendor profile not found',
                error: true,
                success: false
            })
        }

        if (!vendor.bankDetails || !vendor.bankDetails.bankName) {
            return res.status(400).json({
                message: 'Please add bank details first',
                error: true,
                success: false
            })
        }

        const { amount } = req.body

        if (!amount || amount <= 0) {
            return res.status(400).json({
                message: 'Please provide a valid amount',
                error: true,
                success: false
            })
        }

        if (amount < vendor.payoutSettings.minimumPayout) {
            return res.status(400).json({
                message: `Minimum payout amount is ${vendor.payoutSettings.minimumPayout}`,
                error: true,
                success: false
            })
        }

        if (amount > vendor.availableBalance) {
            return res.status(400).json({
                message: 'Insufficient balance',
                error: true,
                success: false
            })
        }

        const pendingPayouts = vendor.payouts.filter(p => p.status === 'pending' || p.status === 'processing')
        if (pendingPayouts.length > 0) {
            return res.status(400).json({
                message: 'You already have a pending payout request',
                error: true,
                success: false
            })
        }

        const payout = {
            amount,
            status: 'pending',
            method: vendor.payoutSettings.payoutMethod,
            transactionId: `PAY-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            createdAt: new Date()
        }

        vendor.payouts.push(payout)
        vendor.walletBalance -= amount
        vendor.availableBalance -= amount
        vendor.pendingBalance += amount

        await vendor.save()

        res.status(201).json({
            message: 'Payout request submitted successfully',
            data: payout,
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

const getVendorWallet = async (req, res) => {
    try {
        const vendor = req.vendor || await VendorModel.findOne({ userId: req.userId })
        
        if (!vendor) {
            return res.status(404).json({
                message: 'Vendor profile not found',
                error: true,
                success: false
            })
        }

        const vendorProductIds = await productModel.distinct('_id', { 'more_details.vendorId': vendor._id })

        const deliveredOrders = await OrderModel.find({
            productId: { $in: vendorProductIds },
            order_status: 'delivered',
            payment_status: 'paid'
        })

        const completedRevenue = deliveredOrders.reduce((sum, order) => sum + order.totalAmt, 0)

        const commissionRate = vendor.platformFeePercent || 10
        const paymentFeeRate = 2.5
        const serviceFee = 1.00

        const platformCommission = completedRevenue * (commissionRate / 100)
        const paymentProcessingFee = completedRevenue * (paymentFeeRate / 100)
        const totalServiceFee = deliveredOrders.length * serviceFee
        const totalFees = platformCommission + paymentProcessingFee + totalServiceFee
        const netRevenue = completedRevenue - totalFees

        const pendingOrders = await OrderModel.find({
            productId: { $in: vendorProductIds },
            order_status: { $in: ['pending', 'processing', 'shipped'] },
            payment_status: 'paid'
        })

        const pendingRevenue = pendingOrders.reduce((sum, order) => sum + order.totalAmt, 0)

        const refundedOrders = await OrderModel.find({
            productId: { $in: vendorProductIds },
            order_status: 'cancelled'
        })

        const refundedAmount = refundedOrders.reduce((sum, order) => sum + order.totalAmt, 0)

        const walletSummary = {
            totalEarnings: completedRevenue,
            platformFees: platformCommission,
            netEarnings: netRevenue,
            pendingEarnings: pendingRevenue,
            refundedAmount,
            currentBalance: vendor.walletBalance,
            pendingBalance: vendor.pendingBalance,
            availableBalance: vendor.availableBalance,
            payoutSettings: vendor.payoutSettings,
            bankDetails: vendor.bankDetails ? {
                bankName: vendor.bankDetails.bankName,
                accountName: vendor.bankDetails.accountName,
                accountNumber: vendor.bankDetails.accountNumber?.slice(-4)?.padStart(vendor.bankDetails.accountNumber?.length || 0, '*'),
                bankCountry: vendor.bankDetails.bankCountry
            } : null,
            commissionBreakdown: {
                totalSales: completedRevenue,
                commissionRate: commissionRate,
                platformCommission: platformCommission,
                paymentFeeRate: paymentFeeRate,
                paymentProcessingFee: paymentProcessingFee,
                serviceFee: totalServiceFee,
                totalFees: totalFees,
                netEarnings: netRevenue
            }
        }

        res.status(200).json({
            message: 'Wallet fetched successfully',
            data: walletSummary,
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

const getVendorTransactions = async (req, res) => {
    try {
        const vendor = req.vendor || await VendorModel.findOne({ userId: req.userId })
        
        if (!vendor) {
            return res.status(404).json({
                message: 'Vendor profile not found',
                error: true,
                success: false
            })
        }

        const vendorProductIds = await productModel.distinct('_id', { 'more_details.vendorId': vendor._id })

        const { page = 1, limit = 20, type, startDate, endDate } = req.query

        const query = { productId: { $in: vendorProductIds } }

        if (type === 'order') {
            query.order_status = { $nin: ['cancelled'] }
        } else if (type === 'refund') {
            query.order_status = 'cancelled'
        }

        if (startDate || endDate) {
            query.createdAt = {}
            if (startDate) query.createdAt.$gte = new Date(startDate)
            if (endDate) query.createdAt.$lte = new Date(endDate)
        }

        const orders = await OrderModel
            .find(query)
            .populate('productId', 'productName productImage')
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit))

        const total = await OrderModel.countDocuments(query)

        const transactions = orders.map(order => ({
            type: order.order_status === 'cancelled' ? 'refund' : 'order',
            orderId: order.orderId,
            productName: order.productId?.productName || 'Unknown',
            productImage: order.productId?.productImage?.[0] || '',
            amount: order.totalAmt,
            status: order.order_status,
            paymentStatus: order.payment_status,
            date: order.createdAt
        }))

        res.status(200).json({
            message: 'Transactions fetched successfully',
            data: {
                transactions,
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

module.exports = {
    getVendorPayouts,
    requestPayout,
    getVendorWallet,
    getVendorTransactions
}
