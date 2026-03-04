const VendorModel = require('../../models/vendorModel')
const userModel = require('../../models/userModel')

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

module.exports = {
    getAllVendorApplications,
    getVendorApplicationById,
    approveVendor,
    rejectVendor,
    suspendVendor,
    reactivateVendor,
    getVendorStats
}
