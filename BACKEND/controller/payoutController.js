const payoutService = require('../services/payoutService');
const VendorModel = require('../models/vendorModel');

const requestPayout = async (req, res) => {
    try {
        const vendor = req.vendor || await VendorModel.findOne({ userId: req.userId });
        
        if (!vendor) {
            return res.status(404).json({
                message: 'Vendor profile not found',
                error: true,
                success: false
            });
        }
        
        const { amount } = req.body;
        
        if (!amount || amount <= 0) {
            return res.status(400).json({
                message: 'Please provide a valid amount',
                error: true,
                success: false
            });
        }
        
        const payout = await payoutService.createPayoutRequest(
            vendor._id,
            amount,
            req.userId
        );
        
        res.status(201).json({
            message: payout.status === 'approved' ? 
                'Payout processed successfully' : 
                'Payout request submitted successfully',
            data: payout,
            success: true,
            error: false
        });
    } catch (err) {
        res.status(400).json({
            message: err.message || err,
            data: null,
            error: true,
            success: false
        });
    }
};

const getVendorPayouts = async (req, res) => {
    try {
        const vendor = req.vendor || await VendorModel.findOne({ userId: req.userId });
        
        if (!vendor) {
            return res.status(404).json({
                message: 'Vendor profile not found',
                error: true,
                success: false
            });
        }
        
        const { page = 1, limit = 20, status, startDate, endDate } = req.query;
        
        const result = await payoutService.getVendorPayoutHistory(vendor._id, {
            page: parseInt(page),
            limit: parseInt(limit),
            status,
            startDate,
            endDate
        });
        
        res.status(200).json({
            message: 'Payouts fetched successfully',
            data: result,
            success: true,
            error: false
        });
    } catch (err) {
        res.status(400).json({
            message: err.message || err,
            data: null,
            error: true,
            success: false
        });
    }
};

const getVendorPayoutById = async (req, res) => {
    try {
        const { payoutId } = req.params;
        const Payout = require('../models/payout.model');
        
        const payout = await Payout.findById(payoutId);
        
        if (!payout) {
            return res.status(404).json({
                message: 'Payout not found',
                error: true,
                success: false
            });
        }
        
        const vendor = req.vendor || await VendorModel.findOne({ userId: req.userId });
        
        if (payout.vendor.vendorId.toString() !== vendor._id.toString()) {
            return res.status(403).json({
                message: 'Access denied',
                error: true,
                success: false
            });
        }
        
        res.status(200).json({
            message: 'Payout fetched successfully',
            data: payout,
            success: true,
            error: false
        });
    } catch (err) {
        res.status(400).json({
            message: err.message || err,
            data: null,
            error: true,
            success: false
        });
    }
};

const getVendorWalletSummary = async (req, res) => {
    try {
        const vendor = req.vendor || await VendorModel.findOne({ userId: req.userId });
        
        if (!vendor) {
            return res.status(404).json({
                message: 'Vendor profile not found',
                error: true,
                success: false
            });
        }
        
        const walletSummary = {
            walletBalance: vendor.walletBalance || 0,
            pendingBalance: vendor.pendingBalance || 0,
            availableBalance: vendor.availableBalance || 0,
            currency: 'USD',
            payoutSettings: vendor.payoutSettings,
            bankDetails: vendor.bankDetails ? {
                bankName: vendor.bankDetails.bankName,
                accountName: vendor.bankDetails.accountName,
                accountNumber: vendor.bankDetails.accountNumber?.slice(-4)?.padStart(vendor.bankDetails.accountNumber?.length || 0, '*'),
                bankCountry: vendor.bankDetails.bankCountry
            } : null
        };
        
        res.status(200).json({
            message: 'Wallet summary fetched successfully',
            data: walletSummary,
            success: true,
            error: false
        });
    } catch (err) {
        res.status(400).json({
            message: err.message || err,
            data: null,
            error: true,
            success: false
        });
    }
};

const getAllPayouts = async (req, res) => {
    try {
        const { page = 1, limit = 20, status, vendorId, startDate, endDate } = req.query;
        
        const result = await payoutService.getAllPayouts({
            page: parseInt(page),
            limit: parseInt(limit),
            status,
            vendorId,
            startDate,
            endDate
        });
        
        res.status(200).json({
            message: 'Payouts fetched successfully',
            data: result,
            success: true,
            error: false
        });
    } catch (err) {
        res.status(400).json({
            message: err.message || err,
            data: null,
            error: true,
            success: false
        });
    }
};

const getPayoutById = async (req, res) => {
    try {
        const { payoutId } = req.params;
        const Payout = require('../models/payout.model');
        
        const payout = await Payout.findById(payoutId)
            .populate('vendor.vendorId', 'storeName businessName businessEmail')
            .populate('processedBy', 'firstname lastname email');
        
        if (!payout) {
            return res.status(404).json({
                message: 'Payout not found',
                error: true,
                success: false
            });
        }
        
        res.status(200).json({
            message: 'Payout fetched successfully',
            data: payout,
            success: true,
            error: false
        });
    } catch (err) {
        res.status(400).json({
            message: err.message || err,
            data: null,
            error: true,
            success: false
        });
    }
};

const approvePayout = async (req, res) => {
    try {
        const { payoutId } = req.params;
        
        const payout = await payoutService.approvePayout(payoutId, req.userId);
        
        res.status(200).json({
            message: 'Payout approved successfully',
            data: payout,
            success: true,
            error: false
        });
    } catch (err) {
        res.status(400).json({
            message: err.message || err,
            data: null,
            error: true,
            success: false
        });
    }
};

const processPayout = async (req, res) => {
    try {
        const { payoutId } = req.params;
        
        const result = await payoutService.processPayout(payoutId, req.userId);
        
        res.status(200).json({
            message: 'Payout processed successfully',
            data: result,
            success: true,
            error: false
        });
    } catch (err) {
        res.status(400).json({
            message: err.message || err,
            data: null,
            error: true,
            success: false
        });
    }
};

const cancelPayout = async (req, res) => {
    try {
        const { payoutId } = req.params;
        const { reason } = req.body;
        
        if (!reason) {
            return res.status(400).json({
                message: 'Cancellation reason is required',
                error: true,
                success: false
            });
        }
        
        const payout = await payoutService.cancelPayout(payoutId, req.userId, reason);
        
        res.status(200).json({
            message: 'Payout cancelled successfully',
            data: payout,
            success: true,
            error: false
        });
    } catch (err) {
        res.status(400).json({
            message: err.message || err,
            data: null,
            error: true,
            success: false
        });
    }
};

const retryPayout = async (req, res) => {
    try {
        const { payoutId } = req.params;
        
        const result = await payoutService.retryFailedPayout(payoutId, req.userId);
        
        res.status(200).json({
            message: 'Payout retried successfully',
            data: result,
            success: true,
            error: false
        });
    } catch (err) {
        res.status(400).json({
            message: err.message || err,
            data: null,
            error: true,
            success: false
        });
    }
};

const getPayoutStats = async (req, res) => {
    try {
        const { vendorId, startDate, endDate } = req.query;
        
        const Payout = require('../models/payout.model');
        
        const match = {};
        if (vendorId) match['vendor.vendorId'] = vendorId;
        
        if (startDate || endDate) {
            match.createdAt = {};
            if (startDate) match.createdAt.$gte = new Date(startDate);
            if (endDate) match.createdAt.$lte = new Date(endDate);
        }
        
        const stats = await Payout.aggregate([
            { $match: match },
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 },
                    totalAmount: { $sum: '$amount' },
                    totalNetAmount: { $sum: '$breakdown.netAmount' }
                }
            }
        ]);
        
        const summary = stats.reduce((acc, curr) => ({
            ...acc,
            [curr._id]: {
                count: curr.count,
                amount: curr.totalAmount,
                netAmount: curr.totalNetAmount
            }
        }), {});
        
        const totalPending = summary.pending?.amount || 0;
        const totalProcessing = summary.processing?.amount || 0;
        const totalCompleted = summary.completed?.amount || 0;
        const totalFailed = summary.failed?.amount || 0;
        
        res.status(200).json({
            message: 'Payout stats fetched successfully',
            data: {
                byStatus: summary,
                totals: {
                    pending: totalPending,
                    processing: totalProcessing,
                    completed: totalCompleted,
                    failed: totalFailed,
                    totalVolume: totalPending + totalProcessing + totalCompleted + totalFailed
                }
            },
            success: true,
            error: false
        });
    } catch (err) {
        res.status(400).json({
            message: err.message || err,
            data: null,
            error: true,
            success: false
        });
    }
};

const runScheduledPayouts = async (req, res) => {
    try {
        const result = await payoutService.processScheduledPayouts();
        
        res.status(200).json({
            message: 'Scheduled payouts processed',
            data: result,
            success: true,
            error: false
        });
    } catch (err) {
        res.status(400).json({
            message: err.message || err,
            data: null,
            error: true,
            success: false
        });
    }
};

module.exports = {
    requestPayout,
    getVendorPayouts,
    getVendorPayoutById,
    getVendorWalletSummary,
    getAllPayouts,
    getPayoutById,
    approvePayout,
    processPayout,
    cancelPayout,
    retryPayout,
    getPayoutStats,
    runScheduledPayouts
};
