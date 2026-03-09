const uploadProductPermission = require("../../helpers/permission")
const productModel = require("../../models/productModel")

async function updateProductController(req,res) {
    try {

      if (!uploadProductPermission(req.userId)) {
                    throw new Error("Permission denied")
        }

        const { _id, ...resBody} = req.body

        const existingProduct = await productModel.findById(_id)
        
        if (!existingProduct) {
            return res.status(404).json({
                message: "Product not found",
                success: false,
                error: true
            })
        }

        if (!resBody.more_details || Object.keys(resBody.more_details).length === 0) {
            resBody.more_details = existingProduct.more_details
        } else {
            resBody.more_details = {
                ...existingProduct.more_details,
                ...resBody.more_details
            }
        }

        const updateProduct = await productModel.findByIdAndUpdate(_id, resBody, { new: true })

        res.json({
            message : "Product updated successfully",
            data : updateProduct,
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

module.exports = updateProductController