const productModel = require("../../models/productModel")

const getBrandProduct = async(req,res) => {
    try {
        const brands = await productModel.distinct("brandName")
        
        const brandData = brands.filter(brand => brand).map((brand, index) => ({
            id: index + 1,
            label: brand,
            value: brand.toLowerCase(),
            code: brand
        })).sort((a, b) => a.label.localeCompare(b.label))

        res.json({
            message : "Brands",
            data : brandData,
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

module.exports = getBrandProduct
