const productModel = require("../../models/productModel")

const updateInventory = async(req,res) => {
    try {
        const { productId, quantity, location, stock } = req.body

        if(!productId){
            return res.status(400).json({
                message : "Product ID is required",
                error : true,
                success : false
            })
        }

        const product = await productModel.findById(productId)

        if(!product){
            return res.status(404).json({
                message : "Product not found",
                error : true,
                success : false
            })
        }

        if(quantity !== undefined){
            product.quantity = quantity
            if (quantity === 0) {
                product.stock = "Out of Stock"
            } else if (quantity <= 5) {
                product.stock = "Low Stock"
            } else {
                product.stock = "In Stock"
            }
        }

        if(location !== undefined){
            product.location = location
        }

        if(stock !== undefined){
            product.stock = stock
        }

        product.lastUpdated = new Date()
        await product.save()

        res.json({
            message : "Inventory updated successfully",
            data : product,
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

module.exports = updateInventory
