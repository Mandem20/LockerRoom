const productModel = require("../../models/productModel")



const getBrandCategoryProduct = async(req,res) => {
    try {
        const brandCategory = await productModel.distinct("brandName")

        console.log ("brandName",brandCategory)

        const brandByCategory = []

        for(const brandName of brandCategory){
            const product = await productModel.findOne({ brandName: { $regex: new RegExp(`^${brandName}$`, 'i') } })
        
            if (product) {
                brandByCategory.push(product)
            }
        }

        res.json({
            message : "Brand Category",
            data : brandByCategory,
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

module.exports = getBrandCategoryProduct