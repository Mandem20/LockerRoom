const Payout = require('../models/payout.model');
const VendorModel = require('../models/vendorModel');
const CommissionTransaction = require('../models/commissionTransaction.model');
const CommissionSettings = require('../models/commissionSettings.model');

class PayoutService {
    async getSettings() {
        return await CommissionSettings.findOne({ isActive: true });
    }

    async validatePayoutRequest(vendorId, amount) {
        const vendor = await VendorModel.findById(vendorId);
        
        if (!vendor) {
            throw new Error('Vendor not found');
        }
        
        if (!vendor.bankDetails || !vendor.bankDetails.bankName) {
            throw new Error('Bank details not configured');
        }
        
        const settings = await this.getSettings();
        
        if (amount < settings.payoutSettings.defaultMinimumPayout) {
            throw new Error(`Minimum payout amount is ${settings.payoutSettings.defaultMinimumPayout}`);
        }
        
        if (amount > vendor.availableBalance) {
            throw new Error('Insufficient available balance');
        }
        
        const pendingPayouts = await Payout.countDocuments({
            'vendor.vendorId': vendorId,
            status: { $in: ['pending', 'processing', 'approved'] }
        });
        
        if (pendingPayouts > 0) {
            throw new Error('You already have a payout in progress');
        }
        
        return { vendor, settings };
    }

    async createPayoutRequest(vendorId, amount, createdBy = null) {
        const { vendor, settings } = await this.validatePayoutRequest(vendorId, amount);
        
        const platformFeePercent = vendor.platformFeePercent || settings.platform.defaultCommissionRate;
        const platformFees = Math.round(amount * (platformFeePercent / 100) * 100) / 100;
        
        const grossAmount = amount;
        const netAmount = grossAmount - platformFees;
        
        const pendingTransactions = await CommissionTransaction.find({
            'vendor.vendorId': vendorId,
            status: 'completed',
            type: { $in: ['sale'] },
            'payout.payoutStatus': { $in: [null, 'pending'] }
        }).sort({ createdAt: -1 }).limit(50);
        
        const items = pendingTransactions.slice(0, Math.ceil(amount / 50)).map(t => ({
            transactionId: t._id,
            orderId: t.orderId,
            orderNumber: t.orderNumber,
            amount: t.breakdown.netVendorAmount,
            status: 'included'
        }));
        
        const payout = await Payout.create({
            payoutId: Payout.generatePayoutId(),
            vendor: {
                vendorId: vendor._id,
                storeName: vendor.storeName,
                businessName: vendor.businessName,
                email: vendor.businessEmail
            },
            type: 'manual',
            status: settings.payoutSettings.autoPayoutEnabled ? 'approved' : 'pending',
            currency: settings.platformFees.currency,
            amount: grossAmount,
            breakdown: {
                grossAmount,
                platformFees,
                taxWithheld: 0,
                adjustment: 0,
                netAmount
            },
            items,
            bankDetails: vendor.bankDetails,
            paymentMethod: vendor.payoutSettings?.payoutMethod || 'bank_transfer',
            timeline: [{
                status: 'created',
                note: 'Payout request created',
                changedBy: createdBy,
                changedAt: new Date()
            }],
            approval: {
                required: !settings.payoutSettings.autoPayoutEnabled
            },
            createdBy
        });
        
        await VendorModel.findByIdAndUpdate(vendorId, {
            $inc: {
                walletBalance: -grossAmount,
                availableBalance: -grossAmount,
                pendingBalance: grossAmount
            }
        });
        
        if (items.length > 0) {
            await CommissionTransaction.updateMany(
                { _id: { $in: items.map(i => i.transactionId) } },
                {
                    $set: {
                        'payout.payoutId': payout._id,
                        'payout.payoutStatus': 'pending'
                    }
                }
            );
        }
        
        return payout;
    }

    async approvePayout(payoutId, approvedBy) {
        const payout = await Payout.findById(payoutId);
        
        if (!payout) {
            throw new Error('Payout not found');
        }
        
        if (payout.status !== 'pending') {
            throw new Error('Payout is not in pending status');
        }
        
        if (payout.approval.required && !approvedBy) {
            throw new Error('Approval required but no approver specified');
        }
        
        await payout.approve(approvedBy, 'Approved for processing');
        
        return payout;
    }

    async processPayout(payoutId, processedBy = null) {
        const payout = await Payout.findById(payoutId);
        
        if (!payout) {
            throw new Error('Payout not found');
        }
        
        if (!['pending', 'approved'].includes(payout.status)) {
            throw new Error('Payout cannot be processed in current status');
        }
        
        await payout.markAsProcessing(processedBy);
        
        try {
            const externalTransactionId = await this.executePayout(payout);
            
            await payout.markAsCompleted(externalTransactionId, processedBy);
            
            await VendorModel.findByIdAndUpdate(payout.vendor.vendorId, {
                $inc: {
                    pendingBalance: -payout.amount
                }
            });
            
            await CommissionTransaction.updateMany(
                { 'payout.payoutId': payout._id },
                {
                    $set: {
                        'payout.payoutStatus': 'paid',
                        'payout.payoutDate': new Date()
                    }
                }
            );
            
            return { success: true, payout, externalTransactionId };
        } catch (error) {
            await payout.markAsFailed(error.message, processedBy);
            
            if (payout.processingDetails.retryCount < payout.processingDetails.maxRetries) {
                await VendorModel.findByIdAndUpdate(payout.vendor.vendorId, {
                    $inc: {
                        pendingBalance: -payout.amount,
                        availableBalance: payout.amount
                    }
                });
            } else {
                await this.handlePayoutFailure(payout);
            }
            
            throw error;
        }
    }

    async executePayout(payout) {
        switch (payout.paymentMethod) {
            case 'bank_transfer':
                return await this.processBankTransfer(payout);
            case 'paypal':
                return await this.processPayPalPayout(payout);
            case 'stripe':
                return await this.processStripePayout(payout);
            case 'momo':
            case 'airtel_money':
                return await this.processMobileMoneyPayout(payout);
            default:
                throw new Error(`Unsupported payment method: ${payout.paymentMethod}`);
        }
    }

    async processBankTransfer(payout) {
        console.log(`Processing bank transfer: ${payout.payoutId}`);
        
        const externalId = `BT-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
        
        await new Promise(resolve => setTimeout(resolve, 500));
        
        return externalId;
    }

    async processPayPalPayout(payout) {
        console.log(`Processing PayPal payout: ${payout.payoutId}`);
        
        const externalId = `PP-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
        
        return externalId;
    }

    async processStripePayout(payout) {
        console.log(`Processing Stripe payout: ${payout.payoutId}`);
        
        const externalId = `ST-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
        
        return externalId;
    }

    async processMobileMoneyPayout(payout) {
        console.log(`Processing mobile money payout: ${payout.payoutId}`);
        
        const externalId = `MM-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
        
        return externalId;
    }

    async handlePayoutFailure(payout) {
        await VendorModel.findByIdAndUpdate(payout.vendor.vendorId, {
            $inc: {
                pendingBalance: -payout.amount,
                walletBalance: payout.amount,
                availableBalance: payout.amount
            }
        });
        
        await CommissionTransaction.updateMany(
            { 'payout.payoutId': payout._id },
            {
                $set: {
                    'payout.payoutStatus': 'failed'
                }
            }
        );
    }

    async cancelPayout(payoutId, cancelledBy, reason) {
        const payout = await Payout.findById(payoutId);
        
        if (!payout) {
            throw new Error('Payout not found');
        }
        
        if (['processing', 'completed'].includes(payout.status)) {
            throw new Error('Cannot cancel a processing or completed payout');
        }
        
        await payout.cancel(cancelledBy, reason);
        
        await VendorModel.findByIdAndUpdate(payout.vendor.vendorId, {
            $inc: {
                walletBalance: payout.amount,
                pendingBalance: -payout.amount,
                availableBalance: payout.amount
            }
        });
        
        await CommissionTransaction.updateMany(
            { 'payout.payoutId': payout._id },
            {
                $set: {
                    'payout.payoutStatus': 'cancelled'
                }
            }
        );
        
        return payout;
    }

    async getVendorPayoutHistory(vendorId, options = {}) {
        const { page = 1, limit = 20, status, startDate, endDate } = options;
        
        const query = { 'vendor.vendorId': vendorId };
        
        if (status) {
            query.status = status;
        }
        
        if (startDate || endDate) {
            query.createdAt = {};
            if (startDate) query.createdAt.$gte = new Date(startDate);
            if (endDate) query.createdAt.$lte = new Date(endDate);
        }
        
        const payouts = await Payout.find(query)
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit);
        
        const total = await Payout.countDocuments(query);
        
        return {
            payouts,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        };
    }

    async getAllPayouts(options = {}) {
        const { page = 1, limit = 20, status, vendorId, startDate, endDate } = options;
        
        const query = {};
        
        if (status) query.status = status;
        if (vendorId) query['vendor.vendorId'] = vendorId;
        
        if (startDate || endDate) {
            query.createdAt = {};
            if (startDate) query.createdAt.$gte = new Date(startDate);
            if (endDate) query.createdAt.$lte = new Date(endDate);
        }
        
        const payouts = await Payout.find(query)
            .populate('vendor.vendorId', 'storeName businessName')
            .populate('processedBy', 'firstname lastname email')
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit);
        
        const total = await Payout.countDocuments(query);
        
        return {
            payouts,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        };
    }

    async processScheduledPayouts() {
        const settings = await this.getSettings();
        
        if (!settings.payoutSettings.autoPayoutEnabled) {
            return { message: 'Auto payout is disabled' };
        }
        
        const vendors = await VendorModel.find({
            isActive: true,
            'payoutSettings.payoutSchedule': settings.payoutSettings.defaultPayoutSchedule,
            availableBalance: { $gte: settings.payoutSettings.defaultMinimumPayout }
        });
        
        const results = [];
        
        for (const vendor of vendors) {
            try {
                if (vendor.availableBalance >= settings.payoutSettings.defaultMinimumPayout) {
                    const payout = await this.createPayoutRequest(
                        vendor._id,
                        vendor.availableBalance,
                        null
                    );
                    
                    if (payout.status === 'approved') {
                        await this.processPayout(payout._id, null);
                    }
                    
                    results.push({ vendorId: vendor._id, status: 'success', payoutId: payout.payoutId });
                }
            } catch (error) {
                results.push({ vendorId: vendor._id, status: 'error', message: error.message });
            }
        }
        
        return { processed: results.length, results };
    }

    async retryFailedPayout(payoutId, processedBy = null) {
        const payout = await Payout.findById(payoutId);
        
        if (!payout) {
            throw new Error('Payout not found');
        }
        
        if (payout.status !== 'failed') {
            throw new Error('Payout is not in failed status');
        }
        
        if (payout.processingDetails.retryCount >= payout.processingDetails.maxRetries) {
            throw new Error('Maximum retry attempts reached');
        }
        
        payout.status = 'pending';
        await payout.save();
        
        return await this.processPayout(payoutId, processedBy);
    }
}

module.exports = new PayoutService();
