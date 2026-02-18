const productModel = require("../../models/productModel")

const getCategoryProduct = async(req,res) => {
    try {
        const categories = await productModel.distinct("category")

        const categoryData = categories.filter(cat => cat).map((category, index) => ({
            id: index + 1,
            label: category,
            value: category.toLowerCase()
        }))

        res.json({
            message : "Categories",
            data : categoryData,
            success : true ,
            error : false 
        })
    } catch (err) {
            res.status(400).json({
            message : err.message || err ,
            error : true,
            success : false
        })
    }
}

module.exports = getCategoryProduct
