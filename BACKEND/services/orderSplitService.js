const mongoose = require('mongoose');
const ParentOrder = require('../models/parentOrder.model');
const OrderModel = require('../models/order.model');
const VendorModel = require('../models/vendorModel');
const ProductModel = require('../models/productModel');
const commissionService = require('./commissionService');

class OrderSplitService {
    async generateOrderId() {
        const timestamp = Date.now();
        const random = Math.random().toString(36).substr(2, 9).toUpperCase();
        return `ORD-${timestamp}-${random}`;
    }

    async processCheckout(userId, cartItems, checkoutData) {
        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            const { 
                deliveryAddress, 
                contactPhone, 
                paymentId, 
                paymentMode,
                paymentMethod,
                notes,
                shippingCost = 0,
                taxAmount = 0,
                discountAmount = 0
            } = checkoutData;

            const enrichedItems = await this.enrichCartItems(cartItems);
            
            if (enrichedItems.length === 0) {
                throw new Error('No valid items in cart');
            }

            const vendorGroups = this.groupItemsByVendor(enrichedItems);
            
            const totalAmount = enrichedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
            const subTotalAmount = totalAmount;

            const parentOrder = await ParentOrder.create([{
                parentOrderId: ParentOrder.generateParentOrderId(),
                userId,
                items: enrichedItems.map(item => ({
                    productId: item.productId,
                    productName: item.productName,
                    productImage: item.productImage,
                    quantity: item.quantity,
                    price: item.price,
                    size: item.size,
                    color: item.color,
                    vendorId: item.vendorId,
                    vendorName: item.vendorName
                })),
                groupedByVendor: true,
                deliveryAddress,
                contactPhone,
                totalAmount: totalAmount + shippingCost + taxAmount - discountAmount,
                subTotalAmount,
                shippingCost,
                taxAmount,
                discountAmount,
                paymentId: paymentId || '',
                paymentMode: paymentMode || '',
                paymentMethod: paymentMethod || '',
                paymentStatus: 'paid',
                orderStatus: 'pending',
                overallStatus: 'pending',
                shippingAddress: checkoutData.shippingAddress,
                billingAddress: checkoutData.billingAddress,
                notes,
                vendorCount: vendorGroups.length,
                itemCount: enrichedItems.length,
                subOrderCount: 0,
                deliveredSubOrders: 0,
                cancelledSubOrders: 0
            }], { session });

            const parentOrderData = parentOrder[0];
            const createdSubOrders = [];

            for (const group of vendorGroups) {
                const subOrder = await this.createSubOrder(
                    parentOrderData,
                    group,
                    {
                        deliveryAddress,
                        contactPhone,
                        paymentId,
                        paymentMode,
                        paymentMethod,
                        shippingCost: shippingCost / vendorGroups.length,
                        notes
                    },
                    session
                );
                
                createdSubOrders.push(subOrder);

                await ParentOrder.updateOne(
                    { _id: parentOrderData._id, 'items.vendorId': group.vendorId },
                    { 
                        $set: { 
                            'items.$.subOrderId': subOrder._id,
                            'subOrderCount': createdSubOrders.length
                        }
                    },
                    { session }
                );
            }

            await ParentOrder.updateOne(
                { _id: parentOrderData._id },
                { 
                    $set: { 
                        paymentStatus: 'paid',
                        orderStatus: 'processing',
                        overallStatus: 'processing'
                    }
                },
                { session }
            );

            parentOrderData.subOrderCount = createdSubOrders.length;
            parentOrderData.items = parentOrderData.items.map(item => {
                const subOrder = createdSubOrders.find(so => 
                    so.vendorId?.toString() === item.vendorId?.toString()
                );
                if (subOrder) {
                    item.subOrderId = subOrder._id;
                }
                return item;
            });

            await session.commitTransaction();

            return {
                success: true,
                parentOrder: parentOrderData,
                subOrders: createdSubOrders,
                vendorCount: vendorGroups.length,
                itemCount: enrichedItems.length
            };

        } catch (error) {
            await session.abortTransaction();
            throw error;
        } finally {
            session.endSession();
        }
    }

    async enrichCartItems(cartItems) {
        const enrichedItems = [];
        
        for (const item of cartItems) {
            try {
                const product = await ProductModel.findById(item.productId)
                    .populate('category', 'categoryName')
                    .populate('more_details.vendorId', 'storeName businessName');
                
                if (!product) continue;
                if (!product.more_details?.vendorId) continue;
                if (product.stock < item.quantity) continue;

                enrichedItems.push({
                    productId: product._id,
                    productName: product.productName,
                    productImage: product.productImage,
                    quantity: item.quantity,
                    price: product.sellingPrice || product.productPrice,
                    size: item.size,
                    color: item.color,
                    vendorId: product.more_details.vendorId._id,
                    vendorName: product.more_details.vendorId.storeName,
                    categoryId: product.category?._id,
                    categoryName: product.category?.categoryName,
                    stock: product.stock
                });
            } catch (error) {
                console.error('Error enriching cart item:', error);
                continue;
            }
        }
        
        return enrichedItems;
    }

    groupItemsByVendor(items) {
        const vendorMap = new Map();
        
        items.forEach(item => {
            const vendorId = item.vendorId?.toString();
            
            if (!vendorMap.has(vendorId)) {
                vendorMap.set(vendorId, {
                    vendorId: item.vendorId,
                    vendorName: item.vendorName,
                    items: [],
                    subtotal: 0
                });
            }
            
            const group = vendorMap.get(vendorId);
            group.items.push(item);
            group.subtotal += item.price * item.quantity;
        });
        
        return Array.from(vendorMap.values());
    }

    async createSubOrder(parentOrder, vendorGroup, checkoutData, session) {
        const subOrderNumber = await this.generateOrderId();
        
        const firstItem = vendorGroup.items[0];
        
        const subOrderData = {
            userId: parentOrder.userId,
            parentOrderId: parentOrder._id,
            subOrderNumber: subOrderNumber,
            orderId: subOrderNumber,
            productId: firstItem.productId,
            product_details: {
                name: firstItem.productName,
                image: firstItem.productImage
            },
            vendorId: vendorGroup.vendorId,
            paymentId: checkoutData.paymentId || '',
            payment_status: 'paid',
            order_status: 'processing',
            order_status_history: [{
                status: 'processing',
                updatedAt: new Date(),
                note: 'Order received and being processed'
            }],
            payment_mode: checkoutData.paymentMode || '',
            delivery_address: checkoutData.deliveryAddress,
            subTotalAmt: vendorGroup.subtotal,
            totalAmt: vendorGroup.subtotal + (checkoutData.shippingCost || 0),
            paymentMethod: checkoutData.paymentMethod || '',
            multiVendor: true,
            parentOrderNumber: parentOrder.parentOrderId,
            notes: checkoutData.notes
        };

        const [subOrder] = await OrderModel.create([subOrderData], { session });

        for (const item of vendorGroup.items.slice(1)) {
            await OrderModel.updateOne(
                { _id: subOrder._id },
                { 
                    $push: {
                        additionalItems: {
                            productId: item.productId,
                            productName: item.productName,
                            productImage: item.productImage,
                            quantity: item.quantity,
                            price: item.price,
                            size: item.size,
                            color: item.color
                        }
                    }
                },
                { session }
            );
        }

        await this.processVendorCommission(subOrder, vendorGroup.vendorId);

        return subOrder;
    }

    async processVendorCommission(subOrder, vendorId) {
        try {
            await commissionService.processOrderCommission(subOrder._id);
        } catch (error) {
            console.error('Error processing vendor commission:', error);
        }
    }

    async getParentOrderDetails(parentOrderId, userId) {
        const parentOrder = await ParentOrder.findOne({ 
            _id: parentOrderId,
            userId 
        });

        if (!parentOrder) {
            throw new Error('Order not found');
        }

        const subOrders = await OrderModel.find({ 
            parentOrderId: parentOrder._id 
        })
        .select('orderId subOrderNumber order_status payment_status totalAmt subTotalAmt createdAt product_details')
        .lean();

        return {
            parentOrder: {
                _id: parentOrder._id,
                parentOrderId: parentOrder.parentOrderId,
                totalAmount: parentOrder.totalAmount,
                subTotalAmount: parentOrder.subTotalAmount,
                overallStatus: parentOrder.overallStatus,
                paymentStatus: parentOrder.paymentStatus,
                createdAt: parentOrder.createdAt
            },
            subOrders
        };
    }

    async updateSubOrderStatus(subOrderId, newStatus, note, updatedBy) {
        const subOrder = await OrderModel.findById(subOrderId);
        
        if (!subOrder) {
            throw new Error('Sub-order not found');
        }

        const oldStatus = subOrder.order_status;
        subOrder.order_status = newStatus;
        subOrder.order_status_history.push({
            status: newStatus,
            updatedAt: new Date(),
            note: note || `Status changed from ${oldStatus} to ${newStatus}`
        });

        await subOrder.save();

        await this.updateParentOrderStatus(subOrder.parentOrderId);

        return subOrder;
    }

    async updateParentOrderStatus(parentOrderId) {
        const parentOrder = await ParentOrder.findById(parentOrderId);
        
        if (!parentOrder) return;

        const subOrders = await OrderModel.find({ parentOrderId });
        
        const statuses = subOrders.map(o => o.order_status);
        const deliveredCount = statuses.filter(s => s === 'delivered').length;
        const cancelledCount = statuses.filter(s => s === 'cancelled').length;

        let overallStatus;
        if (cancelledCount === subOrders.length) {
            overallStatus = 'cancelled';
        } else if (deliveredCount === subOrders.length) {
            overallStatus = 'delivered';
        } else if (deliveredCount > 0 || cancelledCount > 0) {
            overallStatus = 'partially_delivered';
        } else if (statuses.every(s => s === 'shipped')) {
            overallStatus = 'shipped';
        } else if (statuses.every(s => s === 'processing')) {
            overallStatus = 'processing';
        } else {
            overallStatus = 'pending';
        }

        parentOrder.orderStatus = overallStatus;
        parentOrder.overallStatus = overallStatus;
        parentOrder.deliveredSubOrders = deliveredCount;
        parentOrder.cancelledSubOrders = cancelledCount;

        await parentOrder.save();

        if (overallStatus === 'cancelled') {
            await this.processRefundForCancelledParentOrder(parentOrderId);
        }

        return parentOrder;
    }

    async processRefundForCancelledParentOrder(parentOrderId) {
        const parentOrder = await ParentOrder.findById(parentOrderId);
        
        if (!parentOrder || parentOrder.paymentStatus !== 'paid') return;

        const subOrders = await OrderModel.find({ 
            parentOrderId,
            order_status: 'cancelled',
            payment_status: 'paid'
        });

        for (const subOrder of subOrders) {
            try {
                await commissionService.processRefundCommission(subOrder._id, subOrder.totalAmt, 100);
            } catch (error) {
                console.error('Error processing refund:', error);
            }
        }

        parentOrder.paymentStatus = 'refunded';
        await parentOrder.save();
    }

    async getUserOrders(userId, options = {}) {
        const { page = 1, limit = 10, status } = options;
        
        const query = { userId };
        if (status) {
            query.overallStatus = status;
        }

        const parentOrders = await ParentOrder.find(query)
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit)
            .lean();

        const total = await ParentOrder.countDocuments(query);

        for (const order of parentOrders) {
            const subOrders = await OrderModel.find({ parentOrderId: order._id })
                .select('orderId subOrderNumber order_status payment_status totalAmt createdAt')
                .lean();
            
            order.subOrders = subOrders;
            order.subOrderCount = subOrders.length;
            
            delete order.items;
        }

        return {
            orders: parentOrders,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        };
    }
}

module.exports = new OrderSplitService();
