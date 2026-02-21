const mongoose = require('mongoose')

const footerSettingsSchema = new mongoose.Schema({
    logo: {
        type: String,
        default: ''
    },
    description: {
        type: String,
        default: ''
    },
    email: {
        type: String,
        default: ''
    },
    phone: {
        type: String,
        default: ''
    },
    address: {
        type: String,
        default: ''
    },
    socialLinks: [{
        platform: String,
        url: String
    }],
    copyrightText: {
        type: String,
        default: ''
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
})

const footerSettingsModel = mongoose.model("footerSettings", footerSettingsSchema)

module.exports = footerSettingsModel
