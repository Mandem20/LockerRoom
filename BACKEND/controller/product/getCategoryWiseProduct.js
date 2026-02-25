const productModel = require("../../models/productModel")

const getCategoryWiseProduct = async(req,res) =>{
    try {
        const { category, gender } = req?.body || req?.query
        
        let query = { category }
        if (gender) {
            query.gender = gender
        }
        
        const product = await productModel.find(query)

        res.json({
            data : product,
            message : "Product",
            success : true,
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

module.exports = getCategoryWiseProduct