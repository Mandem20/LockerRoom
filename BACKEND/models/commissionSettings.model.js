const mongoose = require('mongoose');

const commissionTierSchema = new mongoose.Schema({
    tierName: {
        type: String,
        required: true,
        enum: ['bronze', 'silver', 'gold', 'platinum', 'diamond']
    },
    minSales: {
        type: Number,
        default: 0
    },
    maxSales: {
        type: Number,
        default: Infinity
    },
    commissionRate: {
        type: Number,
        required: true
    },
    transactionFeePercent: {
        type: Number,
        default: 0
    },
    payoutSchedule: {
        type: String,
        enum: ['daily', 'weekly', 'biweekly', 'monthly'],
        default: 'weekly'
    },
    isActive: {
        type: Boolean,
        default: true
    }
});

const categoryCommissionSchema = new mongoose.Schema({
    category: {
        type: mongoose.Schema.ObjectId,
        ref: 'category',
        required: true
    },
    categoryName: String,
    commissionRate: {
        type: Number,
        required: true
    },
    effectiveFrom: {
        type: Date,
        default: Date.now
    },
    isActive: {
        type: Boolean,
        default: true
    }
});

const vendorCommissionOverrideSchema = new mongoose.Schema({
    vendor: {
        type: mongoose.Schema.ObjectId,
        ref: 'vendor',
        required: true
    },
    customCommissionRate: {
        type: Number,
        required: true
    },
    reason: String,
    effectiveFrom: {
        type: Date,
        default: Date.now
    },
    effectiveUntil: Date,
    isActive: {
        type: Boolean,
        default: true
    },
    createdBy: {
        type: mongoose.Schema.ObjectId,
        ref: 'user'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const platformFeeSchema = new mongoose.Schema({
    paymentGatewayFee: {
        type: Number,
        default: 2.5
    },
    fixedTransactionFee: {
        type: Number,
        default: 0.30
    },
    platformServiceFee: {
        type: Number,
        default: 0
    },
    taxRate: {
        type: Number,
        default: 0
    },
    currency: {
        type: String,
        default: 'USD'
    }
});

const commissionSettingsSchema = new mongoose.Schema({
    platform: {
        defaultCommissionRate: {
            type: Number,
            default: 10
        },
        minimumCommissionRate: {
            type: Number,
            default: 0
        },
        maximumCommissionRate: {
            type: Number,
            default: 50
        },
        isActive: {
            type: Boolean,
            default: true
        }
    },
    tiers: [commissionTierSchema],
    categoryCommissions: [categoryCommissionSchema],
    vendorOverrides: [vendorCommissionOverrideSchema],
    platformFees: platformFeeSchema,
    payoutSettings: {
        defaultMinimumPayout: {
            type: Number,
            default: 50
        },
        defaultPayoutSchedule: {
            type: String,
            enum: ['daily', 'weekly', 'biweekly', 'monthly'],
            default: 'weekly'
        },
        payoutMethods: [{
            type: String,
            enum: ['bank_transfer', 'paypal', 'stripe', 'momo', 'airtel_money']
        }],
        autoPayoutEnabled: {
            type: Boolean,
            default: false
        },
        payoutProcessingDays: {
            type: Number,
            default: 3
        }
    },
    refundSettings: {
        commissionRefundPolicy: {
            type: String,
            enum: ['full_refund', 'partial_refund', 'no_refund'],
            default: 'full_refund'
        },
        platformFeeRefundPolicy: {
            type: String,
            enum: ['full_refund', 'partial_refund', 'no_refund'],
            default: 'full_refund'
        },
        gracePeriodDays: {
            type: Number,
            default: 7
        }
    },
    isActive: {
        type: Boolean,
        default: true
    },
    version: {
        type: Number,
        default: 1
    }
}, {
    timestamps: true
});

commissionSettingsSchema.index({ 'categoryCommissions.category': 1 });
commissionSettingsSchema.index({ 'vendorOverrides.vendor': 1 });

commissionSettingsSchema.methods.getCommissionRate = async function(vendorId, categoryId, orderAmount) {
    let commissionRate = this.platform.defaultCommissionRate;
    
    const vendorOverride = this.vendorOverrides.find(
        v => v.vendor.toString() === vendorId.toString() && v.isActive && 
        (!v.effectiveUntil || new Date(v.effectiveUntil) > new Date())
    );
    if (vendorOverride) {
        return {
            rate: vendorOverride.customCommissionRate,
            type: 'vendor_override',
            reason: vendorOverride.reason
        };
    }
    
    if (categoryId) {
        const categoryCommission = this.categoryCommissions.find(
            c => c.category.toString() === categoryId.toString() && c.isActive
        );
        if (categoryCommission) {
            commissionRate = categoryCommission.commissionRate;
            return {
                rate: commissionRate,
                type: 'category_based',
                categoryName: categoryCommission.categoryName
            };
        }
    }
    
    if (this.tiers && this.tiers.length > 0) {
        const sortedTiers = [...this.tiers]
            .filter(t => t.isActive)
            .sort((a, b) => b.minSales - a.minSales);
        
        for (const tier of sortedTiers) {
            if (orderAmount >= tier.minSales && orderAmount <= tier.maxSales) {
                return {
                    rate: tier.commissionRate,
                    type: 'tier_based',
                    tierName: tier.tierName
                };
            }
        }
    }
    
    return {
        rate: commissionRate,
        type: 'default'
    };
};

commissionSettingsSchema.methods.calculateFees = function(amount, includePlatformFee = true) {
    const gatewayFee = amount * (this.platformFees.paymentGatewayFee / 100);
    const fixedFee = this.platformFees.fixedTransactionFee;
    const platformServiceFee = includePlatformFee ? 
        (amount * (this.platformFees.platformServiceFee / 100)) : 0;
    
    return {
        gatewayFee: Math.round(gatewayFee * 100) / 100,
        fixedFee: Math.round(fixedFee * 100) / 100,
        platformServiceFee: Math.round(platformServiceFee * 100) / 100,
        totalFees: Math.round((gatewayFee + fixedFee + platformServiceFee) * 100) / 100
    };
};

const CommissionSettings = mongoose.model('CommissionSettings', commissionSettingsSchema);

module.exports = CommissionSettings;
