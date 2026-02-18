const productModel = require("../../models/productModel")

const getColorProduct = async(req,res) => {
    try {
        const colors = await productModel.distinct("color")

        const colorData = colors.filter(color => color).map((color, index) => ({
            id: index + 1,
            label: color,
            value: color.toLowerCase(),
            code: color
        }))

        res.json({
            message : "Colors",
            data : colorData,
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
