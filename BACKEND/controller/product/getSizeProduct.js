const productModel = require("../../models/productModel")

const getSizeProduct = async(req,res) => {
    try {
        const sizes = await productModel.distinct("sizes")
        
        const productsWithColorVariants = await productModel.find(
            { "colorVariants.0": { $exists: true } },
            { "colorVariants.sizes": 1 }
        )
        
        const variantSizes = productsWithColorVariants.flatMap(p => 
            p.colorVariants.flatMap(v => v.sizes || [])
        )
        
        const allSizes = [...(sizes || []), ...variantSizes].filter(size => size)
        const uniqueSizes = [...new Set(allSizes.map(s => s.toUpperCase()))].sort()

        res.json({
            message : "Sizes",
            data : uniqueSizes,
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

module.exports = getSizeProduct
