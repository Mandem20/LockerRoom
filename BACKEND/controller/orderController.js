const mongoose = require('mongoose');
const OrderSplitService = require('../services/orderSplitService');
const ParentOrder = require('../models/parentOrder.model');
const OrderModel = require('../models/order.model');
const addToCartModel = require('../models/cartProduct');

const createOrder = async (req, res) => {
    const session = await mongoose.startSession();
    try {
        const userId = req.userId;
        const { 
            items,
            deliveryAddress,
            contactPhone,
            paymentId,
            paymentMode,
            paymentMethod,
            notes,
            shippingCost = 0,
            taxAmount = 0,
            discountAmount = 0,
            shippingAddress,
            billingAddress
        } = req.body;

        if (!items || items.length === 0) {
            return res.status(400).json({
                message: 'Cart is empty',
                error: true,
                success: false
            });
        }

        if (!deliveryAddress) {
            return res.status(400).json({
                message: 'Delivery address is required',
                error: true,
                success: false
            });
        }

        const result = await OrderSplitService.processCheckout(userId, items, {
            deliveryAddress,
            contactPhone,
            paymentId,
            paymentMode,
            paymentMethod,
            notes,
            shippingCost,
            taxAmount,
            discountAmount,
            shippingAddress,
            billingAddress
        });

        await addToCartModel.deleteMany({ userId });

        res.status(201).json({
            message: 'Order placed successfully',
            data: {
                parentOrderId: result.parentOrder.parentOrderId,
                totalAmount: result.parentOrder.totalAmount,
                vendorCount: result.vendorCount,
                itemCount: result.itemCount,
                subOrders: result.subOrders.map(so => ({
                    subOrderId: so._id,
                    orderId: so.orderId,
                    vendorId: so.vendorId,
                    amount: so.totalAmt
                }))
            },
            success: true,
            error: false
        });

    } catch (err) {
        console.error('Order creation error:', err);
        res.status(400).json({
            message: err.message || 'Failed to create order',
            error: true,
            success: false
        });
    }
};

const getMyOrders = async (req, res) => {
    try {
        const userId = req.userId;
        const { page = 1, limit = 10, status } = req.query;

        const result = await OrderSplitService.getUserOrders(userId, {
            page: parseInt(page),
            limit: parseInt(limit),
            status
        });

        res.status(200).json({
            message: 'Orders fetched successfully',
            data: result,
            success: true,
            error: false
        });

    } catch (err) {
        res.status(400).json({
            message: err.message || err,
            data: [],
            error: true,
            success: false
        });
    }
};

const getOrderDetails = async (req, res) => {
    try {
        const userId = req.userId;
        const { orderId } = req.params;

        let parentOrder = await ParentOrder.findOne({
            $or: [
                { parentOrderId: orderId },
                { _id: orderId }
            ],
            userId
        });

        if (!parentOrder) {
            const subOrder = await OrderModel.findOne({
                $or: [{ orderId }, { _id: orderId }],
                userId
            });

            if (!subOrder) {
                return res.status(404).json({
                    message: 'Order not found',
                    error: true,
                    success: false
                });
            }

            parentOrder = await ParentOrder.findById(subOrder.parentOrderId);
        }

        const result = await OrderSplitService.getParentOrderDetails(parentOrder._id, userId);

        res.status(200).json({
            message: 'Order details fetched successfully',
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

const cancelOrder = async (req, res) => {
    try {
        const userId = req.userId;
        const { orderId } = req.params;
        const { reason } = req.body;

        const parentOrder = await ParentOrder.findOne({
            $or: [{ parentOrderId: orderId }, { _id: orderId }],
            userId
        });

        if (!parentOrder) {
            return res.status(404).json({
                message: 'Order not found',
                error: true,
                success: false
            });
        }

        if (['delivered', 'cancelled', 'refunded'].includes(parentOrder.overallStatus)) {
            return res.status(400).json({
                message: 'Order cannot be cancelled',
                error: true,
                success: false
            });
        }

        const subOrders = await OrderModel.find({
            parentOrderId: parentOrder._id,
            order_status: { $nin: ['delivered', 'cancelled'] }
        });

        for (const subOrder of subOrders) {
            await OrderSplitService.updateSubOrderStatus(
                subOrder._id,
                'cancelled',
                reason || 'Cancelled by customer'
            );
        }

        res.status(200).json({
            message: 'Order cancelled successfully',
            success: true,
            error: false
        });

    } catch (err) {
        res.status(400).json({
            message: err.message || err,
            error: true,
            success: false
        });
    }
};

const getVendorSubOrders = async (req, res) => {
    try {
        const vendor = req.vendor;
        
        const { page = 1, limit = 20, status } = req.query;

        const query = { vendorId: vendor._id };
        
        if (status) {
            query.order_status = status;
        }

        const subOrders = await OrderModel.find(query)
            .populate('userId', 'firstname lastname email')
            .populate('parentOrderId', 'parentOrderId shippingAddress contactPhone paymentStatus overallStatus')
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        const total = await OrderModel.countDocuments(query);

        const groupedOrders = await ParentOrder.aggregate([
            { $match: { 'items.vendorId': vendor._id } },
            { $unwind: '$items' },
            { $match: { 'items.vendorId': vendor._id } },
            {
                $group: {
                    _id: '$_id',
                    parentOrderId: { $first: '$parentOrderId' },
                    totalAmount: { $first: '$totalAmount' },
                    overallStatus: { $first: '$overallStatus' },
                    createdAt: { $first: '$createdAt' }
                }
            }
        ]);

        res.status(200).json({
            message: 'Orders fetched successfully',
            data: {
                subOrders,
                groupedOrders,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    pages: Math.ceil(total / limit)
                }
            },
            success: true,
            error: false
        });

    } catch (err) {
        res.status(400).json({
            message: err.message || err,
            data: [],
            error: true,
            success: false
        });
    }
};

module.exports = {
    createOrder,
    getMyOrders,
    getOrderDetails,
    cancelOrder,
    getVendorSubOrders
};
