const addToCartModel = require("../../models/cartProduct")

const updateAddToCartProduct = async(req,res)=>{
    try {
        const currentUserId =req.currentUserId
        const addToCartProductId = req?.body?._id 

        const qty = req.body.quantity

        const updateProduct = await addToCartModel.updateOne({ _id : addToCartProductId},{
            ...(qty && {quantity : qty})
        })
       
        res.json({
            message : "Product updated",
            data : updateProduct,
            error : false,
            success : true
        })

    } catch (err) {
       res.json({
        message  : err?.message || err,
        success : false,
        error : true
       })  
    }
}

module.exports = updateAddToCartProduct