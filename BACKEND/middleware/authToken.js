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

module.exports = { authToken, adminOnly }
