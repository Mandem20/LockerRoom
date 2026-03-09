const CommissionSettings = require('../../models/commissionSettings.model');
const CommissionTransaction = require('../../models/commissionTransaction.model');
const VendorModel = require('../../models/vendorModel');
const commissionService = require('../../services/commissionService');
const mongoose = require('mongoose');

const getCommissionSettings = async (req, res) => {
    try {
        const settings = await commissionService.getCommissionSettings();
        
        res.status(200).json({
            message: 'Commission settings fetched successfully',
            data: settings,
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

const updateCommissionSettings = async (req, res) => {
    try {
        const updates = req.body;
        const settings = await commissionService.getCommissionSettings();
        
        if (updates.platform) {
            settings.platform = { ...settings.platform, ...updates.platform };
        }
        
        if (updates.platformFees) {
            settings.platformFees = { ...settings.platformFees, ...updates.platformFees };
        }
        
        if (updates.payoutSettings) {
            settings.payoutSettings = { ...settings.payoutSettings, ...updates.payoutSettings };
        }
        
        if (updates.refundSettings) {
            settings.refundSettings = { ...settings.refundSettings, ...updates.refundSettings };
        }
        
        settings.version += 1;
        await settings.save();
        
        res.status(200).json({
            message: 'Commission settings updated successfully',
            data: settings,
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

const updateCategoryCommission = async (req, res) => {
    try {
        const mongoose = require('mongoose');
        const { categoryId, categoryName, commissionRate } = req.body;
        
        console.log('Updating category commission:', { categoryId, categoryName, commissionRate });
        
        if (!categoryId || commissionRate === undefined) {
            return res.status(400).json({
                message: 'Category ID and commission rate are required',
                error: true,
                success: false
            });
        }
        
        const settings = await commissionService.getCommissionSettings();
        
        if (!settings.categoryCommissions) {
            settings.categoryCommissions = [];
        }
        
        const categoryObjectId = new mongoose.Types.ObjectId(categoryId);
        
        const existingIndex = settings.categoryCommissions.findIndex(
            c => c.category && c.category.toString() === categoryObjectId.toString()
        );
        
        console.log('Existing index:', existingIndex);
        
        if (existingIndex > -1) {
            settings.categoryCommissions[existingIndex].commissionRate = commissionRate;
            settings.categoryCommissions[existingIndex].effectiveFrom = new Date();
        } else {
            settings.categoryCommissions.push({
                category: categoryObjectId,
                categoryName: categoryName || 'Unknown',
                commissionRate,
                effectiveFrom: new Date(),
                isActive: true
            });
        }
        
        settings.version += 1;
        await settings.save();
        
        res.status(200).json({
            message: 'Category commission updated successfully',
            data: settings.categoryCommissions,
            success: true,
            error: false
        });
    } catch (err) {
        console.error('Error updating category commission:', err);
        res.status(400).json({
            message: err.message || err,
            data: null,
            error: true,
            success: false
        });
    }
};

const deleteCategoryCommission = async (req, res) => {
    try {
        const { categoryId } = req.params;
        
        console.log('Deleting category commission for:', categoryId);
        
        const settings = await commissionService.getCommissionSettings();
        
        settings.categoryCommissions = settings.categoryCommissions.filter(
            c => c.category && c.category.toString() !== categoryId
        );
        
        settings.version += 1;
        await settings.save();
        
        res.status(200).json({
            message: 'Category commission deleted successfully',
            success: true,
            error: false
        });
    } catch (err) {
        console.error('Error deleting category commission:', err);
        res.status(400).json({
            message: err.message || err,
            data: null,
            error: true,
            success: false
        });
    }
};

const addCommissionTier = async (req, res) => {
    try {
        const tierData = req.body;
        const settings = await commissionService.getCommissionSettings();
        
        const existingTier = settings.tiers.find(
            t => t.tierName === tierData.tierName
        );
        
        if (existingTier) {
            return res.status(400).json({
                message: 'Tier already exists',
                error: true,
                success: false
            });
        }
        
        settings.tiers.push(tierData);
        settings.version += 1;
        await settings.save();
        
        res.status(201).json({
            message: 'Commission tier added successfully',
            data: settings.tiers,
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

const updateCommissionTier = async (req, res) => {
    try {
        const { tierId } = req.params;
        const updates = req.body;
        const settings = await commissionService.getCommissionSettings();
        
        const tierIndex = settings.tiers.findIndex(
            t => t._id.toString() === tierId
        );
        
        if (tierIndex === -1) {
            return res.status(404).json({
                message: 'Tier not found',
                error: true,
                success: false
            });
        }
        
        settings.tiers[tierIndex] = { ...settings.tiers[tierIndex].toObject(), ...updates };
        settings.version += 1;
        await settings.save();
        
        res.status(200).json({
            message: 'Commission tier updated successfully',
            data: settings.tiers[tierIndex],
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

const deleteCommissionTier = async (req, res) => {
    try {
        const { tierId } = req.params;
        const settings = await commissionService.getCommissionSettings();
        
        settings.tiers = settings.tiers.filter(
            t => t._id.toString() !== tierId
        );
        
        settings.version += 1;
        await settings.save();
        
        res.status(200).json({
            message: 'Commission tier deleted successfully',
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

const setCategoryCommission = async (req, res) => {
    try {
        const { categoryId, categoryName, commissionRate } = req.body;
        const settings = await commissionService.getCommissionSettings();
        
        const existingCategory = settings.categoryCommissions.findIndex(
            c => c.category.toString() === categoryId
        );
        
        if (existingCategory > -1) {
            settings.categoryCommissions[existingCategory] = {
                ...settings.categoryCommissions[existingCategory].toObject(),
                commissionRate,
                effectiveFrom: new Date()
            };
        } else {
            settings.categoryCommissions.push({
                category: categoryId,
                categoryName,
                commissionRate,
                effectiveFrom: new Date(),
                isActive: true
            });
        }
        
        settings.version += 1;
        await settings.save();
        
        res.status(200).json({
            message: 'Category commission set successfully',
            data: settings.categoryCommissions,
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

const setVendorCommissionOverride = async (req, res) => async (err, data) => {
    try {
        const { vendorId, customCommissionRate, reason, effectiveUntil } = req.body;
        const settings = await commissionService.getCommissionSettings();
        
        const existingOverride = settings.vendorOverrides.findIndex(
            v => v.vendor.toString() === vendorId && v.isActive
        );
        
        if (existingOverride > -1) {
            settings.vendorOverrides[existingOverride] = {
                ...settings.vendorOverrides[existingOverride].toObject(),
                customCommissionRate,
                reason,
                effectiveUntil,
                effectiveFrom: new Date()
            };
        } else {
            settings.vendorOverrides.push({
                vendor: vendorId,
                customCommissionRate,
                reason,
                effectiveUntil,
                effectiveFrom: new Date(),
                isActive: true,
                createdBy: req.userId
            });
        }
        
        await VendorModel.findByIdAndUpdate(vendorId, {
            platformFeePercent: customCommissionRate
        });
        
        settings.version += 1;
        await settings.save();
        
        res.status(200).json({
            message: 'Vendor commission override set successfully',
            data: settings.vendorOverrides,
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

const getPlatformCommissionReport = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        
        const report = await commissionService.getPlatformCommissionReport(
            startDate ? new Date(startDate) : null,
            endDate ? new Date(endDate) : null
        );
        
        res.status(200).json({
            message: 'Platform commission report fetched successfully',
            data: report,
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

const getVendorCommissionReport = async (req, res) => {
    try {
        const { vendorId } = req.params;
        const { startDate, endDate } = req.query;
        
        const report = await commissionService.getVendorCommissionReport(
            vendorId,
            startDate ? new Date(startDate) : null,
            endDate ? new Date(endDate) : null
        );
        
        const vendor = await VendorModel.findById(vendorId);
        
        res.status(200).json({
            message: 'Vendor commission report fetched successfully',
            data: {
                vendor: {
                    vendorId: vendor._id,
                    storeName: vendor.storeName,
                    businessName: vendor.businessName
                },
                report
            },
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

const getAllTransactions = async (req, res) => {
    try {
        const { page = 1, limit = 50, type, status, vendorId, startDate, endDate } = req.query;
        
        const query = {};
        
        if (type) query.type = type;
        if (status) query.status = status;
        if (vendorId) query['vendor.vendorId'] = vendorId;
        
        if (startDate || endDate) {
            query.createdAt = {};
            if (startDate) query.createdAt.$gte = new Date(startDate);
            if (endDate) query.createdAt.$lte = new Date(endDate);
        }
        
        const transactions = await CommissionTransaction.find(query)
            .populate('vendor.vendorId', 'storeName businessName')
            .populate('orderId')
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit));
        
        const total = await CommissionTransaction.countDocuments(query);
        
        res.status(200).json({
            message: 'Transactions fetched successfully',
            data: {
                transactions,
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
            data: null,
            error: true,
            success: false
        });
    }
};

const recalculateOrderCommission = async (req, res) => {
    try {
        const { orderId } = req.params;
        
        const result = await commissionService.processOrderCommission(orderId, {
            metadata: {
                ipAddress: req.ip,
                userAgent: req.get('user-agent'),
                source: 'admin_recalculation',
                recalculatedBy: req.userId
            }
        });
        
        res.status(200).json({
            message: 'Order commission recalculated successfully',
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

module.exports = {
    getCommissionSettings,
    updateCommissionSettings,
    updateCategoryCommission,
    deleteCategoryCommission,
    addCommissionTier,
    updateCommissionTier,
    deleteCommissionTier,
    setCategoryCommission,
    setVendorCommissionOverride,
    getPlatformCommissionReport,
    getVendorCommissionReport,
    getAllTransactions,
    recalculateOrderCommission
};
