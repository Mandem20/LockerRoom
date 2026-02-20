const mongoose = require('mongoose')

const refundRequestSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.ObjectId,
        ref: 'user',
        required: true
    },
    orderId: {
        type: mongoose.Schema.ObjectId,
        ref: 'order',
        required: true
    },
    productId: {
        type: mongoose.Schema.ObjectId,
        ref: 'product'
    },
    reason: {
        type: String,
        required: true
    },
    description: {
        type: String,
        default: ''
    },
    amount: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected', 'refunded'],
        default: 'pending'
    },
    adminNote: {
        type: String,
        default: ''
    },
    refundDate: {
        type: Date
    }
}, {
    timestamps: true
})

const refundRequestModel = mongoose.model('refundRequest', refundRequestSchema)

module.exports = refundRequestModel
