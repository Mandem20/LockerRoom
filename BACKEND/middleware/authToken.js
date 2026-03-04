const jwt = require('jsonwebtoken')
const userModel = require('../models/userModel')

async function authToken(req, res, next) {
    try {
        const token = req.cookies?.token 

        if (!token) {
            return res.status(200).json({
                message: 'Please login first',
                error: true,
                success: false
            })
        }

        jwt.verify(token, process.env.TOKEN_SECRET_KEY, async function(err, decoded) {
            if (err) {
                return res.status(200).json({
                    message: 'Invalid token',
                    error: true,
                    success: false
                })
            }

            const user = await userModel.findById(decoded._id).select('-password')
            if (!user) {
                return res.status(200).json({
                    message: 'User not found',
                    error: true,
                    success: false
                })
            }

            if (user.isActive === false) {
                return res.status(200).json({
                    message: 'Account is deactivated. Please contact admin.',
                    error: true,
                    success: false
                })
            }

            req.userId = decoded._id
            req.user = user
            next()
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

async function adminOnly(req, res, next) {
    try {
        if (!req.user) {
            return res.status(200).json({
                message: 'Please login first',
                error: true,
                success: false
            })
        }

        const user = await userModel.findById(req.user._id)
        
        if (!user) {
            return res.status(200).json({
                message: 'User not found',
                error: true,
                success: false
            })
        }

        if (user.isActive === false) {
            return res.status(200).json({
                message: 'Account is deactivated. Please contact admin.',
                error: true,
                success: false
            })
        }

        if (user.role !== 'ADMIN') {
            return res.status(403).json({
                message: 'Access denied. Admin only.',
                error: true,
                success: false
            })
        }

        next()
    } catch (err) {
        res.status(400).json({
            message: err.message || err,
            data: [],
            error: true,
            success: false
        })
    }
}

async function vendorOnly(req, res, next) {
    try {
        if (!req.user) {
            return res.status(200).json({
                message: 'Please login first',
                error: true,
                success: false
            })
        }

        const user = await userModel.findById(req.user._id)
        
        if (!user) {
            return res.status(200).json({
                message: 'User not found',
                error: true,
                success: false
            })
        }

        if (user.isActive === false) {
            return res.status(200).json({
                message: 'Account is deactivated. Please contact admin.',
                error: true,
                success: false
            })
        }

        if (!user.isVendor || !user.vendorId) {
            return res.status(403).json({
                message: 'Access denied. Vendor account required.',
                error: true,
                success: false
            })
        }

        const VendorModel = require('../models/vendorModel')
        const vendor = await VendorModel.findById(user.vendorId)
        
        if (!vendor) {
            return res.status(403).json({
                message: 'Vendor profile not found.',
                error: true,
                success: false
            })
        }

        if (vendor.verificationStatus === 'suspended') {
            return res.status(403).json({
                message: 'Your vendor account is suspended. Please contact support.',
                error: true,
                success: false
            })
        }

        if (vendor.verificationStatus !== 'verified' && vendor.verificationStatus !== 'pending') {
            return res.status(403).json({
                message: 'Your vendor account is not active. Please complete verification.',
                error: true,
                success: false
            })
        }

        req.vendorId = user.vendorId
        req.vendor = vendor
        next()
    } catch (err) {
        res.status(400).json({
            message: err.message || err,
            data: [],
            error: true,
            success: false
        })
    }
}

async function adminOrVendor(req, res, next) {
    try {
        if (!req.user) {
            return res.status(200).json({
                message: 'Please login first',
                error: true,
                success: false
            })
        }

        const user = await userModel.findById(req.user._id)
        
        if (!user) {
            return res.status(200).json({
                message: 'User not found',
                error: true,
                success: false
            })
        }

        if (user.isActive === false) {
            return res.status(200).json({
                message: 'Account is deactivated. Please contact admin.',
                error: true,
                success: false
            })
        }

        if (user.role === 'ADMIN') {
            req.isAdmin = true
            next()
        } else if (user.isVendor && user.vendorId) {
            const VendorModel = require('../models/vendorModel')
            const vendor = await VendorModel.findById(user.vendorId)
            
            if (!vendor) {
                return res.status(403).json({
                    message: 'Vendor profile not found.',
                    error: true,
                    success: false
                })
            }

            if (vendor.verificationStatus === 'suspended') {
                return res.status(403).json({
                    message: 'Your vendor account is suspended.',
                    error: true,
                    success: false
                })
            }

            req.isVendor = true
            req.vendorId = user.vendorId
            req.vendor = vendor
            next()
        } else {
            return res.status(403).json({
                message: 'Access denied. Admin or Vendor only.',
                error: true,
                success: false
            })
        }
    } catch (err) {
        res.status(400).json({
            message: err.message || err,
            data: [],
            error: true,
            success: false
        })
    }
}

module.exports = { authToken, adminOnly, vendorOnly, adminOrVendor }
