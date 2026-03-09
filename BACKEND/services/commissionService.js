const CommissionSettings = require('../models/commissionSettings.model');
const CommissionTransaction = require('../models/commissionTransaction.model');
const VendorModel = require('../models/vendorModel');
const OrderModel = require('../models/order.model');

class CommissionService {
    async getCommissionSettings() {
        let settings = await CommissionSettings.findOne({ isActive: true });
        
        if (!settings) {
            settings = await CommissionSettings.create({
                platform: {
                    defaultCommissionRate: 10,
                    minimumCommissionRate: 0,
                    maximumCommissionRate: 50,
                    isActive: true
                },
                platformFees: {
                    paymentGatewayFee: 2.5,
                    fixedTransactionFee: 0.30,
                    platformServiceFee: 0,
                    taxRate: 0,
                    currency: 'USD'
                },
                payoutSettings: {
                    defaultMinimumPayout: 50,
                    defaultPayoutSchedule: 'weekly',
                    payoutMethods: ['bank_transfer', 'paypal', 'stripe'],
                    autoPayoutEnabled: false,
                    payoutProcessingDays: 3
                },
                refundSettings: {
                    commissionRefundPolicy: 'full_refund',
                    platformFeeRefundPolicy: 'full_refund',
                    gracePeriodDays: 7
                },
                categoryCommissions: [],
                tiers: [],
                vendorOverrides: [],
                isActive: true,
                version: 1
            });
        }
        
        return settings;
    }

    async calculateCommission(order, vendor, category = null) {
        const settings = await this.getCommissionSettings();
        
        const vendorTotalSales = await this.getVendorTotalSales(vendor._id);
        const orderAmount = order.totalAmt || order.subTotalAmt || 0;
        
        const commissionInfo = await settings.getCommissionRate(
            vendor._id,
            category?._id || order.productId?.category,
            vendorTotalSales + orderAmount
        );
        
        const grossAmount = orderAmount;
        const commissionRate = commissionInfo.rate;
        
        const platformCommission = Math.round(grossAmount * (commissionRate / 100) * 100) / 100;
        
        const fees = settings.calculateFees(grossAmount);
        
        const taxAmount = grossAmount * (settings.platformFees.taxRate / 100);
        
        const netVendorAmount = Math.round(
            (grossAmount - platformCommission - fees.totalFees - taxAmount) * 100
        ) / 100;
        
        return {
            grossAmount,
            commissionRate,
            commissionType: commissionInfo.type,
            commissionDetails: commissionInfo,
            platformCommission,
            paymentGatewayFee: fees.gatewayFee,
            fixedTransactionFee: fees.fixedFee,
            platformServiceFee: fees.platformServiceFee,
            totalFees: fees.totalFees,
            taxAmount,
            netVendorAmount,
            currency: settings.platformFees.currency
        };
    }

    async getVendorTotalSales(vendorId) {
        const result = await OrderModel.aggregate([
            {
                $lookup: {
                    from: 'products',
                    localField: 'productId',
                    foreignField: '_id',
                    as: 'product'
                }
            },
            { $unwind: '$product' },
            { $unwind: '$product.more_details' },
            {
                $match: {
                    'product.more_details.vendorId': vendorId,
                    order_status: { $in: ['delivered', 'shipped', 'processing'] },
                    payment_status: 'paid'
                }
            },
            {
                $group: {
                    _id: null,
                    totalSales: { $sum: '$totalAmt' }
                }
            }
        ]);
        
        return result[0]?.totalSales || 0;
    }

    async processOrderCommission(orderId, options = {}) {
        const order = await OrderModel.findById(orderId)
            .populate('productId')
            .populate('userId');
        
        if (!order) {
            throw new Error('Order not found');
        }
        
        if (order.payment_status !== 'paid') {
            throw new Error('Order payment not completed');
        }
        
        if (order.commission?.transactionId) {
            console.log(`Commission already processed for order ${orderId}`);
            return { message: 'Commission already processed', order };
        }
        
        const vendorId = order.productId?.more_details?.vendorId;
        if (!vendorId) {
            throw new Error('Vendor not found for this order');
        }
        
        const vendor = await VendorModel.findById(vendorId);
        if (!vendor) {
            throw new Error('Vendor not found');
        }
        
        const category = order.productId?.category ? 
            await require('../models/categoryModel').findById(order.productId.category) : 
            null;
        
        const commissionBreakdown = await this.calculateCommission(order, vendor, category);
        
        const transaction = await CommissionTransaction.create({
            transactionId: CommissionTransaction.generateTransactionId('sale'),
            orderId: order._id,
            orderNumber: order.orderId,
            type: 'sale',
            status: 'completed',
            currency: commissionBreakdown.currency,
            customer: {
                customerId: order.userId?._id,
                email: order.userId?.email,
                name: order.userId?.firstname + ' ' + order.userId?.lastname
            },
            vendor: {
                vendorId: vendor._id,
                storeName: vendor.storeName,
                businessName: vendor.businessName
            },
            amount: commissionBreakdown.netVendorAmount,
            breakdown: {
                grossAmount: commissionBreakdown.grossAmount,
                platformCommission: commissionBreakdown.platformCommission,
                commissionRate: commissionBreakdown.commissionRate,
                commissionType: commissionBreakdown.commissionType,
                paymentGatewayFee: commissionBreakdown.paymentGatewayFee,
                fixedTransactionFee: commissionBreakdown.fixedTransactionFee,
                platformServiceFee: commissionBreakdown.platformServiceFee,
                taxAmount: commissionBreakdown.taxAmount,
                netVendorAmount: commissionBreakdown.netVendorAmount,
                refundedCommission: 0,
                refundedFees: 0
            },
            payment: {
                paymentId: order.paymentId,
                paymentMethod: order.payment_mode,
                paymentStatus: order.payment_status,
                paymentDate: order.createdAt
            },
            category: {
                categoryId: category?._id,
                categoryName: category?.categoryName
            },
            product: {
                productId: order.productId?._id,
                productName: order.productId?.productName
            },
            processedAt: new Date(),
            metadata: options.metadata || {}
        });
        
        await this.updateVendorWallet(vendor._id, commissionBreakdown.netVendorAmount, 'credit');
        
        await this.updatePlatformRevenue(commissionBreakdown.platformCommission, commissionBreakdown.totalFees);
        
        await OrderModel.findByIdAndUpdate(orderId, {
            'commission': {
                rate: commissionBreakdown.commissionRate,
                type: commissionBreakdown.commissionType,
                platformCommission: commissionBreakdown.platformCommission,
                netVendorEarnings: commissionBreakdown.netVendorAmount,
                transactionId: transaction._id
            }
        });
        
        return {
            transaction,
            commission: commissionBreakdown
        };
    }

    async processRefundCommission(orderId, refundAmount, refundPercentage = 100) {
        const order = await OrderModel.findById(orderId);
        if (!order) {
            throw new Error('Order not found');
        }
        
        if (!order.commission || !order.commission.transactionId) {
            throw new Error('Original commission transaction not found');
        }
        
        const originalTransaction = await CommissionTransaction.findById(order.commission.transactionId);
        if (!originalTransaction) {
            throw new Error('Original transaction not found');
        }
        
        const settings = await this.getCommissionSettings();
        const { commissionRefundPolicy, platformFeeRefundPolicy } = settings.refundSettings;
        
        let refundedCommission = 0;
        let refundedFees = 0;
        
        if (commissionRefundPolicy === 'full_refund') {
            refundedCommission = originalTransaction.breakdown.platformCommission * (refundPercentage / 100);
        } else if (commissionRefundPolicy === 'partial_refund') {
            refundedCommission = (originalTransaction.breakdown.platformCommission * (refundPercentage / 100)) * 0.5;
        }
        
        if (platformFeeRefundPolicy === 'full_refund') {
            refundedFees = (originalTransaction.breakdown.paymentGatewayFee + 
                           originalTransaction.breakdown.fixedTransactionFee) * (refundPercentage / 100);
        }
        
        const refundTransaction = await CommissionTransaction.create({
            transactionId: CommissionTransaction.generateTransactionId('refund'),
            orderId: order._id,
            orderNumber: order.orderId,
            type: 'refund',
            status: 'completed',
            currency: originalTransaction.currency,
            customer: originalTransaction.customer,
            vendor: originalTransaction.vendor,
            amount: -(refundAmount),
            breakdown: {
                grossAmount: -refundAmount,
                platformCommission: -refundedCommission,
                commissionRate: originalTransaction.breakdown.commissionRate,
                commissionType: originalTransaction.breakdown.commissionType,
                paymentGatewayFee: -refundedFees,
                fixedTransactionFee: 0,
                platformServiceFee: 0,
                taxAmount: 0,
                netVendorAmount: -(refundAmount - refundedCommission - refundedFees),
                refundedCommission,
                refundedFees
            },
            payment: {
                paymentStatus: 'refunded'
            },
            category: originalTransaction.category,
            product: originalTransaction.product,
            reference: `Refund of transaction ${originalTransaction.transactionId}`,
            processedAt: new Date()
        });
        
        const vendorNetAmount = refundAmount - refundedCommission - refundedFees;
        await this.updateVendorWallet(originalTransaction.vendor.vendorId, vendorNetAmount, 'debit');
        
        await this.updatePlatformRevenue(-refundedCommission, -refundedFees);
        
        return {
            refundTransaction,
            refundedCommission,
            refundedFees,
            vendorDebited: vendorNetAmount
        };
    }

    async updateVendorWallet(vendorId, amount, type) {
        const updateField = type === 'credit' ? 
            { $inc: { walletBalance: amount, availableBalance: amount } } :
            { $inc: { walletBalance: -Math.abs(amount) } };
        
        if (type === 'debit') {
            const vendor = await VendorModel.findById(vendorId);
            const availableBalance = vendor.availableBalance || 0;
            
            if (availableBalance >= Math.abs(amount)) {
                updateField.$inc.availableBalance = -Math.abs(amount);
            } else {
                updateField.$inc.pendingBalance = -Math.abs(amount);
            }
        }
        
        await VendorModel.findByIdAndUpdate(vendorId, updateField);
    }

    async updatePlatformRevenue(commissionAmount, feesAmount) {
        const AdminWallet = require('../models/adminWallet.model');
        
        let adminWallet = await AdminWallet.findOne();
        
        if (!adminWallet) {
            adminWallet = await AdminWallet.create({});
        }
        
        await adminWallet.recordTransaction(
            'commission',
            commissionAmount,
            'Platform commission from order',
            'system'
        );
        
        if (feesAmount > 0) {
            await adminWallet.recordTransaction(
                'fee',
                feesAmount,
                'Platform fees from order',
                'system'
            );
        }
    }

    async getVendorCommissionReport(vendorId, startDate, endDate) {
        const match = {
            'vendor.vendorId': vendorId,
            status: 'completed'
        };
        
        if (startDate || endDate) {
            match.createdAt = {};
            if (startDate) match.createdAt.$gte = new Date(startDate);
            if (endDate) match.createdAt.$lte = new Date(endDate);
        }
        
        const transactions = await CommissionTransaction.aggregate([
            { $match: match },
            { $sort: { createdAt: -1 } },
            {
                $group: {
                    _id: {
                        type: '$type',
                        month: { $month: '$createdAt' },
                        year: { $year: '$createdAt' }
                    },
                    totalAmount: { $sum: '$amount' },
                    grossAmount: { $sum: '$breakdown.grossAmount' },
                    platformCommission: { $sum: '$breakdown.platformCommission' },
                    totalFees: { $sum: '$breakdown.totalFees' },
                    netVendorAmount: { $sum: '$breakdown.netVendorAmount' },
                    count: { $sum: 1 }
                }
            },
            { $sort: { '_id.year': -1, '_id.month': -1 } }
        ]);
        
        return transactions;
    }

    async getPlatformCommissionReport(startDate, endDate) {
        const match = { status: 'completed' };
        
        if (startDate || endDate) {
            match.createdAt = {};
            if (startDate) match.createdAt.$gte = new Date(startDate);
            if (endDate) match.createdAt.$lte = new Date(endDate);
        }
        
        const report = await CommissionTransaction.aggregate([
            { $match: match },
            {
                $group: {
                    _id: '$type',
                    totalAmount: { $sum: '$amount' },
                    grossAmount: { $sum: '$breakdown.grossAmount' },
                    platformCommission: { $sum: '$breakdown.platformCommission' },
                    paymentGatewayFees: { $sum: '$breakdown.paymentGatewayFee' },
                    fixedTransactionFees: { $sum: '$breakdown.fixedTransactionFee' },
                    platformServiceFees: { $sum: '$breakdown.platformServiceFee' },
                    totalFees: { $sum: '$breakdown.totalFees' },
                    netVendorAmount: { $sum: '$breakdown.netVendorAmount' },
                    count: { $sum: 1 }
                }
            }
        ]);
        
        const totals = report.reduce((acc, curr) => ({
            totalGrossAmount: acc.totalGrossAmount + curr.grossAmount,
            totalPlatformCommission: acc.totalPlatformCommission + curr.platformCommission,
            totalFees: acc.totalFees + curr.totalFees,
            totalNetVendorAmount: acc.totalNetVendorAmount + curr.netVendorAmount,
            totalCount: acc.totalCount + curr.count
        }), {
            totalGrossAmount: 0,
            totalPlatformCommission: 0,
            totalFees: 0,
            totalNetVendorAmount: 0,
            totalCount: 0
        });
        
        return { breakdown: report, totals };
    }
}

module.exports = new CommissionService();
