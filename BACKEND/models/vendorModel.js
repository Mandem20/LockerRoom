const mongoose = require('mongoose')

const vendorSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.ObjectId,
        ref: 'user',
        required: true,
        unique: true
    },
    businessName: {
        type: String,
        required: [true, "Provide business name"]
    },
    businessEmail: {
        type: String,
        required: [true, "Provide business email"]
    },
    businessPhone: {
        type: String,
        required: [true, "Provide business phone"]
    },
    businessAddress: {
        street: String,
        city: String,
        state: String,
        country: String,
        postalCode: String
    },
    taxId: {
        type: String,
        default: ''
    },
    businessLicense: {
        type: String,
        default: ''
    },
    businessDescription: {
        type: String,
        default: ''
    },
    logo: {
        type: String,
        default: ''
    },
    banner: {
        type: String,
        default: ''
    },
    storeName: {
        type: String,
        unique: true,
        required: [true, "Provide store name"]
    },
    storeSlug: {
        type: String,
        unique: true,
        required: [true, "Provide store slug"]
    },
    verificationStatus: {
        type: String,
        enum: ['pending', 'under_review', 'verified', 'rejected', 'suspended'],
        default: 'pending'
    },
    verificationDocuments: [{
        type: {
            type: String,
            enum: ['business_license', 'id_card', 'tax_certificate', 'bank_statement', 'other']
        },
        url: String,
        uploadedAt: Date
    }],
    verifiedAt: Date,
    rejectionReason: String,
    suspendedAt: Date,
    suspensionReason: String,
    bankDetails: {
        bankName: String,
        accountName: String,
        accountNumber: String,
        routingNumber: String,
        swiftCode: String,
        bankCountry: String
    },
    payoutSettings: {
        payoutMethod: {
            type: String,
            enum: ['bank_transfer', 'paypal', 'momo', 'airtel_money', 'stripe'],
            default: 'bank_transfer'
        },
        payoutSchedule: {
            type: String,
            enum: ['daily', 'weekly', 'biweekly', 'monthly'],
            default: 'weekly'
        },
        minimumPayout: {
            type: Number,
            default: 50
        }
    },
    commissionRate: {
        type: Number,
        default: 10
    },
    platformFeePercent: {
        type: Number,
        default: 10
    },
    paymentSettings: {
        acceptCashOnDelivery: {
            type: Boolean,
            default: true
        },
        acceptOnlinePayment: {
            type: Boolean,
            default: true
        },
        allowInstallments: {
            type: Boolean,
            default: false
        }
    },
    shippingSettings: {
        processingTime: {
            type: String,
            enum: ['same_day', '1-2_days', '3-5_days', '7-14_days'],
            default: '3-5_days'
        },
        freeShippingThreshold: {
            type: Number,
            default: 0
        },
        flatRateShipping: {
            type: Number,
            default: 0
        },
        shipsInternationally: {
            type: Boolean,
            default: false
        },
        internationalShippingCost: {
            type: Number,
            default: 0
        }
    },
    returnPolicy: {
        acceptsReturns: {
            type: Boolean,
            default: true
        },
        returnDays: {
            type: Number,
            default: 14
        },
        returnPolicyText: String
    },
    analytics: {
        totalSales: {
            type: Number,
            default: 0
        },
        totalOrders: {
            type: Number,
            default: 0
        },
        totalRevenue: {
            type: Number,
            default: 0
        },
        totalRefunds: {
            type: Number,
            default: 0
        },
        totalProducts: {
            type: Number,
            default: 0
        },
        averageRating: {
            type: Number,
            default: 0
        },
        totalReviews: {
            type: Number,
            default: 0
        },
        conversionRate: {
            type: Number,
            default: 0
        }
    },
    performanceMetrics: {
        onTimeDeliveryRate: {
            type: Number,
            default: 0
        },
        orderCancellationRate: {
            type: Number,
            default: 0
        },
        returnRate: {
            type: Number,
            default: 0
        },
        responseTime: {
            type: Number,
            default: 0
        },
        sellerScore: {
            type: Number,
            default: 0
        }
    },
    payouts: [{
        amount: Number,
        status: {
            type: String,
            enum: ['pending', 'processing', 'completed', 'failed', 'cancelled'],
            default: 'pending'
        },
        method: String,
        transactionId: String,
        processedAt: Date,
        createdAt: {
            type: Date,
            default: Date.now
        }
    }],
    walletBalance: {
        type: Number,
        default: 0
    },
    pendingBalance: {
        type: Number,
        default: 0
    },
    availableBalance: {
        type: Number,
        default: 0
    },
    isActive: {
        type: Boolean,
        default: true
    },
    isFeatured: {
        type: Boolean,
        default: false
    },
    joinedAt: {
        type: Date,
        default: Date.now
    },
    lastActiveAt: Date,
    socialLinks: {
        website: String,
        facebook: String,
        instagram: String,
        twitter: String
    },
    customerSupportEmail: String,
    customerSupportPhone: String
}, {
    timestamps: true
})

vendorSchema.index({ storeName: 'text', businessName: 'text' })

const VendorModel = mongoose.model('vendor', vendorSchema)

module.exports = VendorModel
