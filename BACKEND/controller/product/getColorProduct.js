const productModel = require("../../models/productModel")

const getColorProduct = async(req,res) => {
    try {
        const colors = await productModel.distinct("color")
        
        const productsWithColorVariants = await productModel.find(
            { "colorVariants.0": { $exists: true } },
            { "colorVariants.colorName": 1 }
        )
        
        const variantColors = productsWithColorVariants.flatMap(p => 
            p.colorVariants.map(v => v.colorName)
        )
        
        const allColors = [...colors, ...variantColors].filter(color => color)
        const uniqueColors = [...new Set(allColors.map(c => c.toLowerCase()))].map(c => 
            allColors.find(color => color.toLowerCase() === c)
        ).filter(Boolean)

        res.json({
            message : "Colors",
            data : uniqueColors,
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

module.exports = getColorProduct
