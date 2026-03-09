const mongoose = require('mongoose')

const orderSchema = new mongoose.Schema({
    userId : {
        type : mongoose.Schema.ObjectId,
        ref : 'user'
    },
    parentOrderId: {
        type: mongoose.Schema.ObjectId,
        ref: 'ParentOrder',
        default: null
    },
    subOrderNumber: {
        type: String,
        default: null
    },
       orderId : {
        type : String,
        required : [true, "Provide orderId"],
        unique : true
    },
       productId : {
       type : mongoose.Schema.ObjectId,
        ref : 'product'
    },
    vendorId: {
        type: mongoose.Schema.ObjectId,
        ref: 'vendor'
    },
    additionalItems: [{
        productId: mongoose.Schema.ObjectId,
        productName: String,
        productImage: [String],
        quantity: Number,
        price: Number,
        size: String,
        color: String
    }],
    quantity: {
        type: Number,
        default: 1
    },
    multiVendor: {
        type: Boolean,
        default: false
    },
    parentOrderNumber: {
        type: String,
        default: null
    },
       product_details : {
        name  : String,
        image : Array,
    },
    paymentId : {
        type  : String,
        default : "",
    },
    payment_status : {
        type  : String,
        default : "",
    },
    order_status : {
        type  : String,
        enum : ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
        default : 'pending'
    },
    order_status_history : [{
        status: String,
        updatedAt: { type: Date, default: Date.now },
        note: String
    }],
    payment_mode : {
        type  : String,
        default : "",
    },
    delivery_address : {
        type  : mongoose.Schema.ObjectId,
        ref : 'address',
    },
    subTotalAmt : {
        type : Number,
        default : 0
    },
    totalAmt : {
        type : Number,
        default : 0,
    },
    invoice_receipt : {
        type : Number,
        default : "",
    },
    commission: {
        rate: Number,
        type: {
            type: String,
            enum: ['default', 'category_based', 'tier_based', 'vendor_override'],
            default: 'default'
        },
        platformCommission: {
            type: Number,
            default: 0
        },
        netVendorEarnings: {
            type: Number,
            default: 0
        },
        transactionId: {
            type: mongoose.Schema.ObjectId,
            ref: 'CommissionTransaction'
        },
        calculatedAt: Date
    },
    vendorEarnings: {
        type: Number,
        default: 0
    },
    platformFees: {
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
        totalFees: {
            type: Number,
            default: 0
        }
    }
    
},{
    timestamps : true
})

const OrderModel = mongoose.model('order',orderSchema)

module.exports = OrderModel 