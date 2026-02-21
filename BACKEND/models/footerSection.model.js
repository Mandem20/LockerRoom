const mongoose = require('mongoose')

const footerSectionSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    links: [{
        label: String,
        url: String
    }],
    description: {
        type: String,
        default: ''
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

const footerSectionModel = mongoose.model("footerSection", footerSectionSchema)

module.exports = footerSectionModel
