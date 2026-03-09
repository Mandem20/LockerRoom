const userModel = require('../../models/userModel')
const VendorModel = require('../../models/vendorModel')

const generateSlug = (storeName) => {
    return storeName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')
}

const generateStoreName = (name) => {
    return name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '')
        .substring(0, 20)
}

const becomeVendor = async (req, res) => {
    try {
        const userId = req.userId
        const {
            businessName,
            businessEmail,
            businessPhone,
            businessAddress,
            taxId,
            businessLicense,
            businessDescription,
            storeName
        } = req.body

        const user = await userModel.findById(userId)
        if (!user) {
            return res.status(404).json({
                message: 'User not found',
                error: true,
                success: false
            })
        }

        if (user.isVendor) {
            return res.status(400).json({
                message: 'You are already a vendor',
                error: true,
                success: false
            })
        }

        const existingVendor = await VendorModel.findOne({
            $or: [
                { storeName: storeName },
                { storeSlug: generateSlug(storeName) }
            ]
        })

        if (existingVendor) {
            return res.status(400).json({
                message: 'Store name already taken',
                error: true,
                success: false
            })
        }

        const vendor = new VendorModel({
            userId,
            businessName,
            businessEmail,
            businessPhone,
            businessAddress,
            taxId,
            businessLicense,
            businessDescription,
            storeName,
            storeSlug: generateSlug(storeName),
            verificationStatus: 'pending',
            joinedAt: new Date()
        })

        await vendor.save()

        res.status(201).json({
            message: 'Vendor application submitted successfully. You will be notified once your application is reviewed.',
            data: {
                applicationStatus: 'pending',
                vendorId: vendor._id
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

const getVendorProfile = async (req, res) => {
    try {
        const vendor = req.vendor || await VendorModel.findOne({ userId: req.userId })
        
        if (!vendor) {
            return res.status(404).json({
                message: 'Vendor profile not found',
                error: true,
                success: false
            })
        }

        res.status(200).json({
            message: 'Vendor profile fetched successfully',
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

const updateVendorProfile = async (req, res) => {
    try {
        const vendor = req.vendor || await VendorModel.findOne({ userId: req.userId })
        
        if (!vendor) {
            return res.status(404).json({
                message: 'Vendor profile not found',
                error: true,
                success: false
            })
        }

        const allowedUpdates = [
            'businessName',
            'businessEmail',
            'businessPhone',
            'businessAddress',
            'businessDescription',
            'logo',
            'banner',
            'socialLinks',
            'customerSupportEmail',
            'customerSupportPhone',
            'paymentSettings',
            'shippingSettings',
            'returnPolicy'
        ]

        allowedUpdates.forEach(field => {
            if (req.body[field] !== undefined) {
                vendor[field] = req.body[field]
            }
        })

        if (req.body.storeName && req.body.storeName !== vendor.storeName) {
            const existingVendor = await VendorModel.findOne({
                storeName: req.body.storeName,
                _id: { $ne: vendor._id }
            })
            
            if (existingVendor) {
                return res.status(400).json({
                    message: 'Store name already taken',
                    error: true,
                    success: false
                })
            }

            vendor.storeName = req.body.storeName
            vendor.storeSlug = generateSlug(req.body.storeName)
        }

        await vendor.save()

        res.status(200).json({
            message: 'Vendor profile updated successfully',
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

const updateBankDetails = async (req, res) => {
    try {
        const vendor = req.vendor || await VendorModel.findOne({ userId: req.userId })
        
        if (!vendor) {
            return res.status(404).json({
                message: 'Vendor profile not found',
                error: true,
                success: false
            })
        }

        const { bankName, accountName, accountNumber, routingNumber, swiftCode, bankCountry } = req.body

        vendor.bankDetails = {
            bankName,
            accountName,
            accountNumber,
            routingNumber,
            swiftCode,
            bankCountry
        }

        await vendor.save()

        res.status(200).json({
            message: 'Bank details updated successfully',
            data: vendor.bankDetails,
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

const updatePayoutSettings = async (req, res) => {
    try {
        const vendor = req.vendor || await VendorModel.findOne({ userId: req.userId })
        
        if (!vendor) {
            return res.status(404).json({
                message: 'Vendor profile not found',
                error: true,
                success: false
            })
        }

        const { payoutMethod, payoutSchedule, minimumPayout } = req.body

        vendor.payoutSettings = {
            payoutMethod: payoutMethod || vendor.payoutSettings.payoutMethod,
            payoutSchedule: payoutSchedule || vendor.payoutSettings.payoutSchedule,
            minimumPayout: minimumPayout || vendor.payoutSettings.minimumPayout
        }

        await vendor.save()

        res.status(200).json({
            message: 'Payout settings updated successfully',
            data: vendor.payoutSettings,
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

const uploadVerificationDocuments = async (req, res) => {
    try {
        const vendor = req.vendor || await VendorModel.findOne({ userId: req.userId })
        
        if (!vendor) {
            return res.status(404).json({
                message: 'Vendor profile not found',
                error: true,
                success: false
            })
        }

        const { documents } = req.body

        if (!documents || !Array.isArray(documents)) {
            return res.status(400).json({
                message: 'Please provide documents array',
                error: true,
                success: false
            })
        }

        vendor.verificationDocuments = documents.map(doc => ({
            type: doc.type,
            url: doc.url,
            uploadedAt: new Date()
        }))

        if (vendor.verificationStatus === 'pending') {
            vendor.verificationStatus = 'under_review'
        }

        await vendor.save()

        res.status(200).json({
            message: 'Verification documents uploaded successfully',
            data: vendor.verificationDocuments,
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

const getVendorStatus = async (req, res) => {
    try {
        const user = req.user || await userModel.findById(req.userId)
        
        if (!user) {
            return res.status(404).json({
                message: 'User not found',
                error: true,
                success: false
            })
        }

        const vendor = req.vendor || await VendorModel.findOne({ userId: req.userId })

        if (!vendor) {
            return res.status(200).json({
                message: 'No vendor application',
                data: {
                    isVendor: false,
                    hasVendorApplication: false,
                    verificationStatus: 'none'
                },
                success: true,
                error: false
            })
        }

        // User has applied but not yet approved
        const isApproved = vendor.verificationStatus === 'verified'

        res.status(200).json({
            message: 'Vendor status fetched successfully',
            data: {
                isVendor: isApproved,
                hasVendorApplication: true,
                vendorId: vendor._id,
                verificationStatus: vendor.verificationStatus,
                isActive: vendor.isActive,
                isFeatured: vendor.isFeatured,
                businessName: vendor.businessName,
                storeName: vendor.storeName,
                analytics: isApproved ? vendor.analytics : null,
                walletBalance: isApproved ? vendor.walletBalance : 0,
                pendingBalance: isApproved ? vendor.pendingBalance : 0,
                availableBalance: isApproved ? vendor.availableBalance : 0
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
    becomeVendor,
    getVendorProfile,
    updateVendorProfile,
    updateBankDetails,
    updatePayoutSettings,
    uploadVerificationDocuments,
    getVendorStatus
}
