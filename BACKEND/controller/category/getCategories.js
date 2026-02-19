const categoryModel = require("../../models/categoryModel")

const getCategories = async(req,res) => {
    try {
        const categories = await categoryModel.find().sort({ createdAt: -1 })

        res.json({
            message : "Categories fetched successfully",
            data : categories,
            success : true,
            error : false
        })
    } catch (err) {
        res.status(400).json({
            message : err.message || err,
            error : true,
            success : false
        })
    }
}

module.exports = getCategories
