const categoryModel = require("../../models/categoryModel")

const updateCategory = async(req,res) => {
    try {
        const { id, name, value } = req.body

        if(!id || !name || !value){
            return res.status(400).json({
                message : "ID, name and value are required",
                error : true,
                success : false
            })
        }

        const existingCategory = await categoryModel.findOne({ 
            $or: [{ name }, { value }],
            _id: { $ne: id }
        })
        
        if(existingCategory){
            return res.status(400).json({
                message : "Category name or value already exists",
                error : true,
                success : false
            })
        }

        const category = await categoryModel.findByIdAndUpdate(
            id,
            { name, value },
            { new: true }
        )

        if(!category){
            return res.status(404).json({
                message : "Category not found",
                error : true,
                success : false
            })
        }

        res.json({
            message : "Category updated successfully",
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

module.exports = updateCategory
