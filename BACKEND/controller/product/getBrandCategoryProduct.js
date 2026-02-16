const productModel = require("../../models/productModel")



const getBrandCategoryProduct = async(req,res) => {
    try {
        const brandCategory = await productModel.distinct("brandName")

        console.log ("brandName",brandCategory)

//array to store one product from each Brand
        const brandByCategory = []

        for(const brandName of brandCategory){
            const product = await productModel.findOne({brandName})
        
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