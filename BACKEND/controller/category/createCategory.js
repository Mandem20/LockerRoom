const categoryModel = require("../../models/categoryModel")

const createCategory = async(req,res) => {
    try {
        const { name, value } = req.body
        
        if(!name || !value){
            return res.status(400).json({
                message : "Name and value are required",
                error : true,
                success : false
            })
        }

        const existingCategory = await categoryModel.findOne({ $or: [{ name }, { value }] })
        if(existingCategory){
            return res.status(400).json({
                message : "Category already exists",
                error : true,
                success : false
            })
        }

        const category = new categoryModel({ name, value })
        await category.save()

        res.json({
            message : "Category created successfully",
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

module.exports = createCategory
