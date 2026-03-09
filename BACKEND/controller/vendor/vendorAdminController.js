const VendorModel = require('../../models/vendorModel')
const userModel = require('../../models/userModel')
const OrderModel = require('../../models/order.model')
const productModel = require('../../models/productModel')
const categoryModel = require('../../models/categoryModel')

const getAllVendorApplications = async (req, res) => {
    try {
        const { status, page = 1, limit = 20 } = req.query

        const query = {}
        if (status) {
            query.verificationStatus = status
        }

        const vendors = await VendorModel.find(query)
            .populate('userId', 'name email profilePic')
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit))

        const total = await VendorModel.countDocuments(query)

        res.status(200).json({
            message: 'Vendor applications fetched successfully',
            data: {
                applications: vendors,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    pages: Math.ceil(total / limit)
                }
            },
            success: true,
            error: false
        })
    } catch (err) {
        res.status(400).json({
            message: err.message || err,
            data: [],
            error: true,
            success: false
        })
    }
}

const getVendorApplicationById = async (req, res) => {
    try {
        const vendor = await VendorModel.findById(req.params.id).populate('userId', 'name email profilePic mobile')

        if (!vendor) {
            return res.status(404).json({
                message: 'Vendor application not found',
                error: true,
                success: false
            })
        }

        res.status(200).json({
            message: 'Vendor application fetched successfully',
            data: vendor,
            success: true,
            error: false
        })
    } catch (err) {
        res.status(400).json({
            message: err.message || err,
            data: [],
            error: true,
            success: false
        })
    }
}

const approveVendor = async (req, res) => {
    try {
        const { vendorId } = req.body

        const vendor = await VendorModel.findById(vendorId)

        if (!vendor) {
            return res.status(404).json({
                message: 'Vendor application not found',
                error: true,
                success: false
            })
        }

        if (vendor.verificationStatus === 'verified') {
            return res.status(400).json({
                message: 'Vendor is already verified',
                error: true,
                success: false
            })
        }

        vendor.verificationStatus = 'verified'
        vendor.verifiedAt = new Date()
        vendor.isActive = true
        await vendor.save()

        await userModel.findByIdAndUpdate(vendor.userId, {
            vendorId: vendor._id,
            isVendor: true
        })

        res.status(200).json({
            message: 'Vendor approved successfully',
            data: vendor,
            success: true,
            error: false
        })
    } catch (err) {
        res.status(400).json({
            message: err.message || err,
            data: [],
            error: true,
            success: false
        })
    }
}

const rejectVendor = async (req, res) => {
    try {
        const { vendorId, reason } = req.body

        const vendor = await VendorModel.findById(vendorId)

        if (!vendor) {
            return res.status(404).json({
                message: 'Vendor application not found',
                error: true,
                success: false
            })
        }

        vendor.verificationStatus = 'rejected'
        vendor.rejectionReason = reason || 'Your application did not meet our requirements'
        await vendor.save()

        await userModel.findByIdAndUpdate(vendor.userId, {
            vendorId: null,
            isVendor: false
        })

        res.status(200).json({
            message: 'Vendor application rejected',
            data: vendor,
            success: true,
            error: false
        })
    } catch (err) {
        res.status(400).json({
            message: err.message || err,
            data: [],
            error: true,
            success: false
        })
    }
}

const suspendVendor = async (req, res) => {
    try {
        const { vendorId, reason } = req.body

        const vendor = await VendorModel.findById(vendorId)

        if (!vendor) {
            return res.status(404).json({
                message: 'Vendor not found',
                error: true,
                success: false
            })
        }

        vendor.verificationStatus = 'suspended'
        vendor.suspendedAt = new Date()
        vendor.suspensionReason = reason || 'Account suspended'
        vendor.isActive = false
        await vendor.save()

        res.status(200).json({
            message: 'Vendor suspended successfully',
            data: vendor,
            success: true,
            error: false
        })
    } catch (err) {
        res.status(400).json({
            message: err.message || err,
            data: [],
            error: true,
            success: false
        })
    }
}

const reactivateVendor = async (req, res) => {
    try {
        const { vendorId } = req.body

        const vendor = await VendorModel.findById(vendorId)

        if (!vendor) {
            return res.status(404).json({
                message: 'Vendor not found',
                error: true,
                success: false
            })
        }

        vendor.verificationStatus = 'verified'
        vendor.suspendedAt = null
        vendor.suspensionReason = null
        vendor.isActive = true
        await vendor.save()

        res.status(200).json({
            message: 'Vendor reactivated successfully',
            data: vendor,
            success: true,
            error: false
        })
    } catch (err) {
        res.status(400).json({
            message: err.message || err,
            data: [],
            error: true,
            success: false
        })
    }
}

const getVendorStats = async (req, res) => {
    try {
        const totalVendors = await VendorModel.countDocuments()
        const pendingVendors = await VendorModel.countDocuments({ verificationStatus: 'pending' })
        const verifiedVendors = await VendorModel.countDocuments({ verificationStatus: 'verified' })
        const rejectedVendors = await VendorModel.countDocuments({ verificationStatus: 'rejected' })
        const suspendedVendors = await VendorModel.countDocuments({ verificationStatus: 'suspended' })

        res.status(200).json({
            message: 'Vendor stats fetched successfully',
            data: {
                totalVendors,
                pendingVendors,
                verifiedVendors,
                rejectedVendors,
                suspendedVendors
            },
            success: true,
            error: false
        })
    } catch (err) {
        res.status(400).json({
            message: err.message || err,
            data: [],
            error: true,
            success: false
        })
    }
}

const getAllVendors = async (req, res) => {
    try {
        const { status, search, page = 1, limit = 20 } = req.query

        const query = {}
        
        if (status && status !== 'all') {
            query.verificationStatus = status
        }

        if (search) {
            const vendorsWithUser = await VendorModel.find({
                $or: [
                    { businessName: { $regex: search, $options: 'i' } },
                    { businessEmail: { $regex: search, $options: 'i' } }
                ]
            }).populate('userId', 'name email')
            
            const matchingIds = vendorsWithUser.map(v => v._id)
            if (matchingIds.length > 0) {
                query._id = { $in: matchingIds }
            } else {
                query._id = { $in: [] }
            }
        }

        const vendors = await VendorModel.find(query)
            .populate('userId', 'name email profilePic mobile')
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit))

        const total = await VendorModel.countDocuments(query)

        const vendorsData = vendors.map(vendor => ({
            _id: vendor._id,
            businessName: vendor.businessName || 'N/A',
            businessEmail: vendor.businessEmail || 'N/A',
            businessPhone: vendor.businessPhone || 'N/A',
            businessAddress: vendor.businessAddress || {},
            storeName: vendor.storeName || 'N/A',
            ownerName: vendor.userId?.name || 'N/A',
            ownerEmail: vendor.userId?.email || 'N/A',
            profilePic: vendor.userId?.profilePic,
            verificationStatus: vendor.verificationStatus,
            isActive: vendor.isActive,
            commissionRate: vendor.commissionRate,
            platformFeePercent: vendor.platformFeePercent,
            payoutSettings: vendor.payoutSettings,
            walletBalance: vendor.walletBalance,
            availableBalance: vendor.availableBalance,
            createdAt: vendor.createdAt,
            verifiedAt: vendor.verifiedAt
        }))

        res.status(200).json({
            message: 'Vendors fetched successfully',
            data: {
                vendors: vendorsData,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    pages: Math.ceil(total / limit)
                }
            },
            success: true,
            error: false
        })
    } catch (err) {
        res.status(400).json({
            message: err.message || err,
            data: [],
            error: true,
            success: false
        })
    }
}

const getVendorById = async (req, res) => {
    try {
        const vendor = await VendorModel.findById(req.params.id)
            .populate('userId', 'name email profilePic mobile createdAt')

        if (!vendor) {
            return res.status(404).json({
                message: 'Vendor not found',
                error: true,
                success: false
            })
        }

        res.status(200).json({
            message: 'Vendor fetched successfully',
            data: vendor,
            success: true,
            error: false
        })
    } catch (err) {
        res.status(400).json({
            message: err.message || err,
            data: [],
            error: true,
            success: false
        })
    }
}

const updateVendorConfig = async (req, res) => {
    try {
        const { vendorId } = req.params
        const {
            commissionRate,
            platformFeePercent,
            payoutSettings,
            paymentSettings,
            shippingSettings,
            returnPolicy,
            isActive
        } = req.body

        const vendor = await VendorModel.findById(vendorId)

        if (!vendor) {
            return res.status(404).json({
                message: 'Vendor not found',
                error: true,
                success: false
            })
        }

        if (commissionRate !== undefined) {
            vendor.commissionRate = commissionRate
        }

        if (platformFeePercent !== undefined) {
            vendor.platformFeePercent = platformFeePercent
        }

        if (payoutSettings) {
            if (payoutSettings.payoutMethod) vendor.payoutSettings.payoutMethod = payoutSettings.payoutMethod
            if (payoutSettings.payoutSchedule) vendor.payoutSettings.payoutSchedule = payoutSettings.payoutSchedule
            if (payoutSettings.minimumPayout !== undefined) vendor.payoutSettings.minimumPayout = payoutSettings.minimumPayout
        }

        if (paymentSettings) {
            if (paymentSettings.acceptCashOnDelivery !== undefined) 
                vendor.paymentSettings.acceptCashOnDelivery = paymentSettings.acceptCashOnDelivery
            if (paymentSettings.acceptOnlinePayment !== undefined) 
                vendor.paymentSettings.acceptOnlinePayment = paymentSettings.acceptOnlinePayment
            if (paymentSettings.allowInstallments !== undefined) 
                vendor.paymentSettings.allowInstallments = paymentSettings.allowInstallments
        }

        if (shippingSettings) {
            if (shippingSettings.processingTime) vendor.shippingSettings.processingTime = shippingSettings.processingTime
            if (shippingSettings.freeShippingThreshold !== undefined) 
                vendor.shippingSettings.freeShippingThreshold = shippingSettings.freeShippingThreshold
            if (shippingSettings.flatRateShipping !== undefined) 
                vendor.shippingSettings.flatRateShipping = shippingSettings.flatRateShipping
            if (shippingSettings.shipsInternationally !== undefined) 
                vendor.shippingSettings.shipsInternationally = shippingSettings.shipsInternationally
            if (shippingSettings.internationalShippingCost !== undefined) 
                vendor.shippingSettings.internationalShippingCost = shippingSettings.internationalShippingCost
        }

        if (returnPolicy) {
            if (returnPolicy.acceptsReturns !== undefined) 
                vendor.returnPolicy.acceptsReturns = returnPolicy.acceptsReturns
            if (returnPolicy.returnDays !== undefined) 
                vendor.returnPolicy.returnDays = returnPolicy.returnDays
            if (returnPolicy.returnPolicyText !== undefined) 
                vendor.returnPolicy.returnPolicyText = returnPolicy.returnPolicyText
        }

        if (isActive !== undefined) {
            vendor.isActive = isActive
        }

        await vendor.save()

        res.status(200).json({
            message: 'Vendor configuration updated successfully',
            data: vendor,
            success: true,
            error: false
        })
    } catch (err) {
        res.status(400).json({
            message: err.message || err,
            data: [],
            error: true,
            success: false
        })
    }
}

const getAdminVendorAnalytics = async (req, res) => {
    try {
        const { vendorId } = req.params
        const { period = '30' } = req.query

        const vendor = await VendorModel.findById(vendorId)
        if (!vendor) {
            return res.status(404).json({
                message: 'Vendor not found',
                error: true,
                success: false
            })
        }

        const vendorProductIds = await productModel.distinct('_id', { 'more_details.vendorId': vendorId })

        const startDate = new Date()
        startDate.setDate(startDate.getDate() - parseInt(period))

        const ordersQuery = {
            productId: { $in: vendorProductIds },
            createdAt: { $gte: startDate }
        }

        const totalOrders = await OrderModel.countDocuments({
            productId: { $in: vendorProductIds }
        })

        const periodOrders = await OrderModel.countDocuments(ordersQuery)

        const deliveredOrders = await OrderModel.find({
            ...ordersQuery,
            order_status: 'delivered',
            payment_status: 'paid'
        })

        const cancelledOrders = await OrderModel.countDocuments({
            ...ordersQuery,
            order_status: 'cancelled'
        })

        const totalRevenue = deliveredOrders.reduce((sum, order) => sum + order.totalAmt, 0)
        const platformFee = vendor.platformFeePercent ? totalRevenue * (vendor.platformFeePercent / 100) : totalRevenue * 0.1
        const vendorEarnings = totalRevenue - platformFee

        const recentOrders = await OrderModel.find({ productId: { $in: vendorProductIds } })
            .populate('productId', 'productName')
            .sort({ createdAt: -1 })
            .limit(10)

        const orderStatusBreakdown = await OrderModel.aggregate([
            { $match: { productId: { $in: vendorProductIds } } },
            { $group: { _id: '$order_status', count: { $sum: 1 } } }
        ])

        res.status(200).json({
            message: 'Vendor analytics fetched successfully',
            data: {
                overview: {
                    totalOrders,
                    periodOrders,
                    deliveredOrders: deliveredOrders.length,
                    cancelledOrders,
                    totalRevenue,
                    vendorEarnings,
                    platformFee,
                    walletBalance: vendor.walletBalance || 0,
                    availableBalance: vendor.availableBalance || 0,
                    pendingBalance: vendor.pendingBalance || 0
                },
                orderStatusBreakdown: orderStatusBreakdown.reduce((acc, item) => {
                    acc[item._id] = item.count
                    return acc
                }, {}),
                recentOrders: recentOrders.map(order => ({
                    orderId: order.orderId,
                    productName: order.productId?.productName || 'Unknown',
                    amount: order.totalAmt,
                    status: order.order_status,
                    paymentStatus: order.payment_status,
                    date: order.createdAt
                }))
            },
            success: true,
            error: false
        })
    } catch (err) {
        res.status(400).json({
            message: err.message || err,
            data: [],
            error: true,
            success: false
        })
    }
}

const getAdminVendorOrders = async (req, res) => {
    try {
        const { vendorId } = req.params
        const { page = 1, limit = 20, status } = req.query

        const vendor = await VendorModel.findById(vendorId)
        if (!vendor) {
            return res.status(404).json({
                message: 'Vendor not found',
                error: true,
                success: false
            })
        }

        const vendorProductIds = await productModel.distinct('_id', { 'more_details.vendorId': vendorId })

        const query = { productId: { $in: vendorProductIds } }
        if (status) {
            query.order_status = status
        }

        const orders = await OrderModel.find(query)
            .populate('productId', 'productName productImage')
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit))

        const total = await OrderModel.countDocuments(query)

        res.status(200).json({
            message: 'Vendor orders fetched successfully',
            data: {
                orders: orders.map(order => ({
                    orderId: order.orderId,
                    productName: order.productId?.productName || 'Unknown',
                    productImage: order.productId?.productImage?.[0] || '',
                    amount: order.totalAmt,
                    status: order.order_status,
                    paymentStatus: order.payment_status,
                    date: order.createdAt,
                    customerName: order.userId?.name || 'N/A'
                })),
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    pages: Math.ceil(total / limit)
                }
            },
            success: true,
            error: false
        })
    } catch (err) {
        res.status(400).json({
            message: err.message || err,
            data: [],
            error: true,
            success: false
        })
    }
}

const getAdminVendorPayouts = async (req, res) => {
    try {
        const { vendorId } = req.params

        const vendor = await VendorModel.findById(vendorId)
        if (!vendor) {
            return res.status(404).json({
                message: 'Vendor not found',
                error: true,
                success: false
            })
        }

        const payouts = vendor.payouts || []

        res.status(200).json({
            message: 'Vendor payouts fetched successfully',
            data: {
                payouts: payouts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),
                walletBalance: vendor.walletBalance,
                pendingBalance: vendor.pendingBalance,
                availableBalance: vendor.availableBalance
            },
            success: true,
            error: false
        })
    } catch (err) {
        res.status(400).json({
            message: err.message || err,
            data: [],
            error: true,
            success: false
        })
    }
}

const deleteVendor = async (req, res) => {
    try {
        const { vendorId } = req.params

        const vendor = await VendorModel.findById(vendorId)
        if (!vendor) {
            return res.status(404).json({
                message: 'Vendor not found',
                error: true,
                success: false
            })
        }

        await userModel.findByIdAndUpdate(vendor.userId, {
            vendorId: null,
            isVendor: false
        })

        await VendorModel.findByIdAndDelete(vendorId)

        res.status(200).json({
            message: 'Vendor deleted successfully',
            success: true,
            error: false
        })
    } catch (err) {
        res.status(400).json({
            message: err.message || err,
            data: [],
            error: true,
            success: false
        })
    }
}

const getAdminVendorProducts = async (req, res) => {
    try {
        const { vendorId } = req.params
        const { page = 1, limit = 20, search, category, status } = req.query

        const vendor = await VendorModel.findById(vendorId)
        if (!vendor) {
            return res.status(404).json({
                message: 'Vendor not found',
                error: true,
                success: false
            })
        }

        const query = { 'more_details.vendorId': vendorId }

        if (search) {
            query.productName = { $regex: search, $options: 'i' }
        }

        if (category) {
            query.category = category
        }

        if (status === 'in_stock') {
            query.$expr = { $gt: [{ $toDouble: '$quantity' }, 0] }
        } else if (status === 'out_of_stock') {
            query.$or = [
                { quantity: { $lte: 0 } },
                { quantity: { $exists: false } },
                { quantity: null }
            ]
        }

        const products = await productModel.find(query)
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit))

        const total = await productModel.countDocuments(query)

        const productsWithStats = await Promise.all(products.map(async (product) => {
            const vendorInfo = vendor
            const orders = await OrderModel.countDocuments({
                productId: product._id
            })
            const deliveredOrders = await OrderModel.countDocuments({
                productId: product._id,
                order_status: 'delivered',
                payment_status: 'paid'
            })

            return {
                _id: product._id,
                productName: product.productName,
                productImage: product.productImage,
                category: product.category,
                brandName: product.brandName,
                price: product.price,
                sellingPrice: product.sellingPrice,
                quantity: product.quantity,
                status: product.order_status,
                orders,
                deliveredOrders,
                revenue: deliveredOrders * (product.sellingPrice || product.price),
                createdAt: product.createdAt
            }
        }))

        res.status(200).json({
            message: 'Vendor products fetched successfully',
            data: {
                products: productsWithStats,
                vendor: {
                    _id: vendor._id,
                    businessName: vendor.businessName || 'N/A',
                    storeName: vendor.storeName || 'N/A',
                    ownerName: vendor.userId?.name || 'N/A'
                },
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    pages: Math.ceil(total / limit)
                }
            },
            success: true,
            error: false
        })
    } catch (err) {
        res.status(400).json({
            message: err.message || err,
            data: [],
            error: true,
            success: false
        })
    }
}

const getAllProductsWithVendor = async (req, res) => {
    try {
        const { page = 1, limit = 20, search, vendorId, category, status } = req.query

        const query = {}

        if (vendorId) {
            query['more_details.vendorId'] = vendorId
        }

        if (search) {
            query.$or = [
                { productName: { $regex: search, $options: 'i' } },
                { brandName: { $regex: search, $options: 'i' } }
            ]
        }

        if (category) {
            query.category = category
        }

        if (status === 'in_stock') {
            query.$expr = { $gt: [{ $toDouble: '$quantity' }, 0] }
        } else if (status === 'out_of_stock') {
            query.$or = [
                { quantity: { $lte: 0 } },
                { quantity: { $exists: false } },
                { quantity: null }
            ]
        }

        const products = await productModel.find(query)
            .populate('vendorId', 'businessName storeName')
            .populate('more_details.vendorId', 'businessName storeName userId')
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit))

        const total = await productModel.countDocuments(query)

        const vendors = await VendorModel.find({ verificationStatus: 'verified' })
            .populate('userId', 'name')
            .select('businessName storeName')

        const categories = await categoryModel.find()

        const productsWithVendor = await Promise.all(products.map(async product => {
            let vendorData = product.more_details?.vendorId || product.vendorId
            
            let vendorInfo = null
            
            if (vendorData) {
                if (typeof vendorData === 'object' && vendorData.businessName) {
                    vendorInfo = {
                        _id: vendorData._id,
                        businessName: vendorData.businessName,
                        storeName: vendorData.storeName,
                        ownerName: vendorData.userId?.name
                    }
                } else {
                    const vendorIdStr = vendorData.toString()
                    const vendorDoc = await VendorModel.findById(vendorIdStr).populate('userId', 'name')
                    if (vendorDoc) {
                        vendorInfo = {
                            _id: vendorDoc._id,
                            businessName: vendorDoc.businessName || 'N/A',
                            storeName: vendorDoc.storeName || 'N/A',
                            ownerName: vendorDoc.userId?.name || 'N/A'
                        }
                    }
                }
            }
            
            return {
                _id: product._id,
                productName: product.productName,
                productImage: product.productImage,
                category: product.category,
                brandName: product.brandName,
                price: product.price,
                sellingPrice: product.sellingPrice,
                quantity: product.quantity,
                createdAt: product.createdAt,
                vendor: vendorInfo
            }
        }))

        res.status(200).json({
            message: 'Products fetched successfully',
            data: {
                products: productsWithVendor,
                vendors: vendors.map(v => ({
                    _id: v._id,
                    businessName: v.businessName || 'N/A',
                    storeName: v.storeName || 'N/A'
                })),
                categories: categories.map(c => c.categoryName),
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    pages: Math.ceil(total / limit)
                }
            },
            success: true,
            error: false
        })
    } catch (err) {
        res.status(400).json({
            message: err.message || err,
            data: [],
            error: true,
            success: false
        })
    }
}

const deleteAdminVendorProduct = async (req, res) => {
    try {
        const { id } = req.params

        const product = await productModel.findById(id)

        if (!product) {
            return res.status(404).json({
                message: 'Product not found',
                error: true,
                success: false
            })
        }

        const vendorId = product.more_details?.vendorId

        if (vendorId) {
            const vendor = await VendorModel.findById(vendorId)
            if (vendor) {
                vendor.productCount = Math.max(0, (vendor.productCount || 1) - 1)
                await vendor.save()
            }
        }

        await productModel.findByIdAndDelete(id)

        res.status(200).json({
            message: 'Product deleted successfully',
            success: true,
            error: false
        })
    } catch (err) {
        res.status(400).json({
            message: err.message || err,
            data: [],
            error: true,
            success: false
        })
    }
}

module.exports = {
    getAllVendorApplications,
    getVendorApplicationById,
    approveVendor,
    rejectVendor,
    suspendVendor,
    reactivateVendor,
    getVendorStats,
    getAllVendors,
    getVendorById,
    updateVendorConfig,
    getAdminVendorAnalytics,
    getAdminVendorOrders,
    getAdminVendorPayouts,
    deleteVendor,
    getAdminVendorProducts,
    getAllProductsWithVendor,
    deleteAdminVendorProduct
}
