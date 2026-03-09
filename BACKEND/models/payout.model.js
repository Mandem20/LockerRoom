const mongoose = require('mongoose');

const payoutItemSchema = new mongoose.Schema({
    transactionId: {
        type: mongoose.Schema.ObjectId,
        ref: 'CommissionTransaction'
    },
    orderId: {
        type: mongoose.Schema.ObjectId,
        ref: 'order'
    },
    orderNumber: String,
    amount: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'included', 'paid', 'failed'],
        default: 'pending'
    }
});

const payoutSchema = new mongoose.Schema({
    payoutId: {
        type: String,
        required: true,
        unique: true
    },
    vendor: {
        vendorId: {
            type: mongoose.Schema.ObjectId,
            ref: 'vendor',
            required: true
        },
        storeName: String,
        businessName: String,
        email: String
    },
    type: {
        type: String,
        enum: ['manual', 'scheduled', 'threshold', 'emergency'],
        default: 'manual'
    },
    status: {
        type: String,
        enum: ['draft', 'pending', 'approved', 'processing', 'completed', 'failed', 'cancelled', 'on_hold'],
        default: 'draft'
    },
    currency: {
        type: String,
        default: 'USD'
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
        platformFees: {
            type: Number,
            default: 0
        },
        taxWithheld: {
            type: Number,
            default: 0
        },
        adjustment: {
            type: Number,
            default: 0
        },
        adjustmentReason: String,
        netAmount: {
            type: Number,
            required: true
        }
    },
    items: [payoutItemSchema],
    bankDetails: {
        bankName: String,
        accountName: String,
        accountNumber: String,
        routingNumber: String,
        swiftCode: String,
        bankCountry: String,
        bankAddress: String
    },
    paymentMethod: {
        type: String,
        enum: ['bank_transfer', 'paypal', 'stripe', 'momo', 'airtel_money', 'check'],
        default: 'bank_transfer'
    },
    externalTransactionId: String,
    processingDetails: {
        initiatedAt: Date,
        approvedAt: Date,
        processedAt: Date,
        completedAt: Date,
        failedAt: Date,
        retryCount: {
            type: Number,
            default: 0
        },
        maxRetries: {
            type: Number,
            default: 3
        },
        failureReason: String
    },
    timeline: [{
        status: String,
        note: String,
        changedBy: {
            type: mongoose.Schema.ObjectId,
            ref: 'user'
        },
        changedAt: {
            type: Date,
            default: Date.now
        }
    }],
    approval: {
        required: {
            type: Boolean,
            default: false
        },
        approvedBy: {
            type: mongoose.Schema.ObjectId,
            ref: 'user'
        },
        approvedAt: Date,
        rejectionReason: String
    },
    notes: String,
    attachments: [{
        name: String,
        url: String,
        uploadedAt: {
            type: Date,
            default: Date.now
        }
    }],
    createdBy: {
        type: mongoose.Schema.ObjectId,
        ref: 'user'
    },
    processedBy: {
        type: mongoose.Schema.ObjectId,
        ref: 'user'
    }
}, {
    timestamps: true
});

payoutSchema.index({ 'vendor.vendorId': 1 });
payoutSchema.index({ status: 1 });
payoutSchema.index({ createdAt: -1 });

payoutSchema.statics.generatePayoutId = function() {
    return `PAY-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
};

payoutSchema.methods.addTimelineEntry = function(status, note, changedBy = null) {
    this.timeline.push({
        status,
        note,
        changedBy,
        changedAt: new Date()
    });
};

payoutSchema.methods.approve = async function(approvedBy, note = 'Approved') {
    this.status = 'approved';
    this.approval.approvedBy = approvedBy;
    this.approval.approvedAt = new Date();
    this.processingDetails.approvedAt = new Date();
    this.addTimelineEntry('approved', note, approvedBy);
    return this.save();
};

payoutSchema.methods.reject = async function(rejectedBy, reason) {
    this.status = 'cancelled';
    this.approval.rejectionReason = reason;
    this.addTimelineEntry('rejected', reason, rejectedBy);
    return this.save();
};

payoutSchema.methods.markAsProcessing = async function(processedBy = null) {
    this.status = 'processing';
    this.processingDetails.initiatedAt = new Date();
    this.addTimelineEntry('processing', 'Payout processing initiated', processedBy);
    return this.save();
};

payoutSchema.methods.markAsCompleted = async function(externalTransactionId, processedBy = null) {
    this.status = 'completed';
    this.externalTransactionId = externalTransactionId;
    this.processingDetails.processedAt = new Date();
    this.processingDetails.completedAt = new Date();
    this.addTimelineEntry('completed', 'Payout completed successfully', processedBy);
    return this.save();
};

payoutSchema.methods.markAsFailed = async function(reason, processedBy = null) {
    this.status = 'failed';
    this.processingDetails.failureReason = reason;
    this.processingDetails.failedAt = new Date();
    this.processingDetails.retryCount += 1;
    this.addTimelineEntry('failed', reason, processedBy);
    return this.save();
};

payoutSchema.methods.cancel = async function(cancelledBy, reason) {
    if (['processing', 'completed'].includes(this.status)) {
        throw new Error('Cannot cancel a processing or completed payout');
    }
    this.status = 'cancelled';
    this.addTimelineEntry('cancelled', reason, cancelledBy);
    return this.save();
};

payoutSchema.statics.getVendorPayoutStats = async function(vendorId) {
    const stats = await this.aggregate([
        { $match: { 'vendor.vendorId': vendorId } },
        {
            $group: {
                _id: '$status',
                count: { $sum: 1 },
                totalAmount: { $sum: '$amount' },
                totalNetAmount: { $sum: '$breakdown.netAmount' }
            }
        }
    ]);
    
    return stats;
};

const Payout = mongoose.model('Payout', payoutSchema);

module.exports = Payout;
