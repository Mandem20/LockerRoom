const mongoose = require('mongoose');

const commissionTransactionSchema = new mongoose.Schema({
    transactionId: {
        type: String,
        required: true,
        unique: true
    },
    orderId: {
        type: mongoose.Schema.ObjectId,
        ref: 'order',
        required: true
    },
    orderNumber: String,
    type: {
        type: String,
        enum: ['sale', 'refund', 'payout', 'adjustment', 'bonus', 'penalty', 'withdrawal'],
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'completed', 'failed', 'cancelled', 'reversed'],
        default: 'pending'
    },
    currency: {
        type: String,
        default: 'USD'
    },
    customer: {
        customerId: {
            type: mongoose.Schema.ObjectId,
            ref: 'user'
        },
        email: String,
        name: String
    },
    vendor: {
        vendorId: {
            type: mongoose.Schema.ObjectId,
            ref: 'vendor',
            required: true
        },
        storeName: String,
        businessName: String
    },
    amount: {
        type: Number,
        required: true
    },
    breakdown: {
        grossAmount: {
            type: Number,
            required: true
        },
        platformCommission: {
            type: Number,
            default: 0
        },
        commissionRate: {
            type: Number,
            default: 0
        },
        commissionType: {
            type: String,
            enum: ['default', 'category_based', 'tier_based', 'vendor_override'],
            default: 'default'
        },
        paymentGatewayFee: {
            type: Number,
            default: 0
        },
        fixedTransactionFee: {
            type: Number,
            default: 0
        },
        platformServiceFee: {
            type: Number,
            default: 0
        },
        taxAmount: {
            type: Number,
            default: 0
        },
        netVendorAmount: {
            type: Number,
            required: true
        },
        refundedCommission: {
            type: Number,
            default: 0
        },
        refundedFees: {
            type: Number,
            default: 0
        }
    },
    payout: {
        payoutId: {
            type: mongoose.Schema.ObjectId,
            ref: 'Payout'
        },
        payoutStatus: {
            type: String,
            enum: ['pending', 'processing', 'completed', 'failed']
        },
        payoutDate: Date
    },
    payment: {
        paymentId: String,
        paymentMethod: String,
        paymentStatus: {
            type: String,
            enum: ['pending', 'completed', 'failed', 'refunded', 'partially_refunded']
        },
        paymentDate: Date
    },
    category: {
        categoryId: {
            type: mongoose.Schema.ObjectId,
            ref: 'category'
        },
        categoryName: String
    },
    product: {
        productId: {
            type: mongoose.Schema.ObjectId,
            ref: 'product'
        },
        productName: String
    },
    reference: {
        type: String,
        description: String
    },
    notes: String,
    processedBy: {
        type: mongoose.Schema.ObjectId,
        ref: 'user'
    },
    processedAt: Date,
    metadata: {
        ipAddress: String,
        userAgent: String,
        source: String
    }
}, {
    timestamps: true
});

commissionTransactionSchema.index({ orderId: 1 });
commissionTransactionSchema.index({ 'vendor.vendorId': 1 });
commissionTransactionSchema.index({ type: 1, status: 1 });
commissionTransactionSchema.index({ createdAt: -1 });

commissionTransactionSchema.statics.generateTransactionId = function(type) {
    const prefix = {
        'sale': 'SALE',
        'refund': 'REF',
        'payout': 'PAY',
        'adjustment': 'ADJ',
        'bonus': 'BON',
        'penalty': 'PEN',
        'withdrawal': 'WTH'
    }[type] || 'TXN';
    
    return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
};

commissionTransactionSchema.methods.markAsCompleted = async function(processedBy = null) {
    this.status = 'completed';
    this.processedBy = processedBy;
    this.processedAt = new Date();
    return this.save();
};

commissionTransactionSchema.methods.markAsFailed = async function(reason, processedBy = null) {
    this.status = 'failed';
    this.notes = reason;
    this.processedBy = processedBy;
    this.processedAt = new Date();
    return this.save();
};

commissionTransactionSchema.statics.getVendorSummary = async function(vendorId, startDate, endDate) {
    const match = {
        'vendor.vendorId': vendorId,
        status: 'completed'
    };
    if (startDate || endDate) {
        match.createdAt = {};
        if (startDate) match.createdAt.$gte = new Date(startDate);
        if (endDate) match.createdAt.$lte = new Date(endDate);
    }
    
    const summary = await this.aggregate([
        { $match: match },
        {
            $group: {
                _id: '$type',
                totalAmount: { $sum: '$amount' },
                count: { $sum: 1 },
                totalCommission: { $sum: '$breakdown.platformCommission' },
                totalGatewayFees: { $sum: '$breakdown.paymentGatewayFee' },
                totalNetVendorAmount: { $sum: '$breakdown.netVendorAmount' }
            }
        }
    ]);
    
    return summary;
};

const CommissionTransaction = mongoose.model('CommissionTransaction', commissionTransactionSchema);

module.exports = CommissionTransaction;
