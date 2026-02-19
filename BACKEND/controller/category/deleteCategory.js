const categoryModel = require("../../models/categoryModel")

const deleteCategory = async(req,res) => {
    try {
        const { id } = req.body

        if(!id){
            return res.status(400).json({
                message : "Category ID is required",
                error : true,
                success : false
            })
        }

        const category = await categoryModel.findByIdAndDelete(id)

        if(!category){
            return res.status(404).json({
                message : "Category not found",
                error : true,
                success : false
            })
        }

        res.json({
            message : "Category deleted successfully",
            data : category,
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

module.exports = deleteCategory
