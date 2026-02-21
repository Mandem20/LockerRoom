const footerSettingsModel = require('../../models/footerSettings.model')
const footerSectionModel = require('../../models/footerSection.model')
const footerLinkModel = require('../../models/footerLink.model')

const getFooterSettings = async (req, res) => {
    try {
        const settings = await footerSettingsModel.findOne({ isActive: true })
        res.json({
            success: true,
            data: settings
        })
    } catch (error) {
        res.json({
            success: false,
            message: error.message
        })
    }
}

const updateFooterSettings = async (req, res) => {
    try {
        let settings = await footerSettingsModel.findOne()
        if (settings) {
            settings = await footerSettingsModel.findByIdAndUpdate(
                settings._id,
                req.body,
                { new: true }
            )
        } else {
            settings = await footerSettingsModel.create(req.body)
        }
        res.json({
            success: true,
            data: settings
        })
    } catch (error) {
        res.json({
            success: false,
            message: error.message
        })
    }
}

const getFooterSections = async (req, res) => {
    try {
        const sections = await footerSectionModel.find({ isActive: true }).sort({ order: 1 })
        res.json({
            success: true,
            data: sections
        })
    } catch (error) {
        res.json({
            success: false,
            message: error.message
        })
    }
}

const createFooterSection = async (req, res) => {
    try {
        const section = await footerSectionModel.create(req.body)
        res.json({
            success: true,
            data: section
        })
    } catch (error) {
        res.json({
            success: false,
            message: error.message
        })
    }
}

const updateFooterSection = async (req, res) => {
    try {
        const section = await footerSectionModel.findByIdAndUpdate(
            req.body._id,
            req.body,
            { new: true }
        )
        res.json({
            success: true,
            data: section
        })
    } catch (error) {
        res.json({
            success: false,
            message: error.message
        })
    }
}

const deleteFooterSection = async (req, res) => {
    try {
        await footerSectionModel.findByIdAndDelete(req.body._id)
        res.json({
            success: true,
            message: 'Section deleted'
        })
    } catch (error) {
        res.json({
            success: false,
            message: error.message
        })
    }
}

const getFooterLinks = async (req, res) => {
    try {
        const links = await footerLinkModel.find({ isActive: true }).sort({ order: 1 })
        res.json({
            success: true,
            data: links
        })
    } catch (error) {
        res.json({
            success: false,
            message: error.message
        })
    }
}

const createFooterLink = async (req, res) => {
    try {
        const link = await footerLinkModel.create(req.body)
        res.json({
            success: true,
            data: link
        })
    } catch (error) {
        res.json({
            success: false,
            message: error.message
        })
    }
}

const updateFooterLink = async (req, res) => {
    try {
        const link = await footerLinkModel.findByIdAndUpdate(
            req.body._id,
            req.body,
            { new: true }
        )
        res.json({
            success: true,
            data: link
        })
    } catch (error) {
        res.json({
            success: false,
            message: error.message
        })
    }
}

const deleteFooterLink = async (req, res) => {
    try {
        await footerLinkModel.findByIdAndDelete(req.body._id)
        res.json({
            success: true,
            message: 'Link deleted'
        })
    } catch (error) {
        res.json({
            success: false,
            message: error.message
        })
    }
}

module.exports = {
    getFooterSettings,
    updateFooterSettings,
    getFooterSections,
    createFooterSection,
    updateFooterSection,
    deleteFooterSection,
    getFooterLinks,
    createFooterLink,
    updateFooterLink,
    deleteFooterLink
}
