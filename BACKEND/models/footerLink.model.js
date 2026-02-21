const mongoose = require('mongoose')

const footerLinkSchema = new mongoose.Schema({
    label: {
        type: String,
        required: true,
        trim: true
    },
    url: {
        type: String,
        required: true,
        trim: true
    },
    section: {
        type: String,
        trim: true
    },
    order: {
        type: Number,
        default: 0
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
})

const footerLinkModel = mongoose.model("footerLink", footerLinkSchema)

module.exports = footerLinkModel
