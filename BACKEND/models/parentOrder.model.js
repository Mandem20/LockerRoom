const mongoose = require('mongoose');

const parentOrderSchema = new mongoose.Schema({
    parentOrderId: {
        type: String,
        required: true,
        unique: true
    },
    userId: {
        type: mongoose.Schema.ObjectId,
        ref: 'user',
        required: true
    },
    items: [{
        productId: {
            type: mongoose.Schema.ObjectId,
            ref: 'product'
        },
        productName: String,
        productImage: [String],
        quantity: Number,
        price: Number,
        size: String,
        color: String,
        vendorId: {
            type: mongoose.Schema.ObjectId,
            ref: 'vendor'
        },
        vendorName: String,
        subOrderId: {
            type: mongoose.Schema.ObjectId,
            ref: 'order'
        }
    }],
    groupedByVendor: {
        type: Boolean,
        default: true
    },
    deliveryAddress: {
        type: mongoose.Schema.ObjectId,
        ref: 'address'
    },
    contactPhone: String,
    totalAmount: {
        type: Number,
        required: true
    },
    subTotalAmount: {
        type: Number,
        required: true
    },
    shippingCost: {
        type: Number,
        default: 0
    },
    taxAmount: {
        type: Number,
        default: 0
    },
    discountAmount: {
        type: Number,
        default: 0
    },
    paymentId: {
        type: String,
        default: ''
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'paid', 'failed', 'refunded', 'partially_refunded'],
        default: 'pending'
    },
    paymentMode: {
        type: String,
        default: ''
    },
    paymentMethod: String,
    orderStatus: {
        type: String,
        enum: ['pending', 'processing', 'shipped', 'delivered', 'partially_delivered', 'cancelled', 'refunded'],
        default: 'pending'
    },
    overallStatus: {
        type: String,
        enum: ['pending', 'processing', 'shipped', 'delivered', 'partially_delivered', 'cancelled', 'refunded'],
        default: 'pending'
    },
    shippingAddress: {
        name: String,
        phone: String,
        address: String,
        city: String,
        state: String,
        country: String,
        postalCode: String
    },
    billingAddress: {
        name: String,
        phone: String,
        address: String,
        city: String,
        state: String,
        country: String,
        postalCode: String
    },
    notes: String,
    vendorCount: {
        type: Number,
        default: 0
    },
    itemCount: {
        type: Number,
        default: 0
    },
    subOrderCount: {
        type: Number,
        default: 0
    },
    deliveredSubOrders: {
        type: Number,
        default: 0
    },
    cancelledSubOrders: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

parentOrderSchema.index({ parentOrderId: 1 });
parentOrderSchema.index({ userId: 1 });
parentOrderSchema.index({ orderStatus: 1 });
parentOrderSchema.index({ createdAt: -1 });

parentOrderSchema.statics.generateParentOrderId = function() {
    return `PO-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
};

parentOrderSchema.methods.calculateOverallStatus = function() {
    const statuses = this.items.map(item => item.subOrderId?.order_status).filter(Boolean);
    
    if (statuses.length === 0) return 'pending';
    if (statuses.every(s => s === 'delivered')) return 'delivered';
    if (statuses.every(s => s === 'cancelled')) return 'cancelled';
    if (statuses.some(s => s === 'cancelled')) return 'partially_delivered';
    if (statuses.every(s => s === 'shipped')) return 'shipped';
    if (statuses.every(s => s === 'processing' || s === 'shipped')) return 'processing';
    return 'pending';
};

parentOrderSchema.methods.getVendorGroups = function() {
    const vendorMap = new Map();
    
    this.items.forEach(item => {
        const vendorId = item.vendorId?.toString();
        if (!vendorMap.has(vendorId)) {
            vendorMap.set(vendorId, {
                vendorId: item.vendorId,
                vendorName: item.vendorName,
                items: [],
                subOrderId: item.subOrderId,
                subtotal: 0
            });
        }
        const group = vendorMap.get(vendorId);
        group.items.push(item);
        group.subtotal += item.price * item.quantity;
        if (item.subOrderId) {
            group.subOrderId = item.subOrderId;
        }
    });
    
    return Array.from(vendorMap.values());
};

const ParentOrder = mongoose.model('ParentOrder', parentOrderSchema);

module.exports = ParentOrder;
