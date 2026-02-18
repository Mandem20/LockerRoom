const addToCartModel = require("../../models/cartProduct")

const addToCartController = async(req,res)=>{
    try {
         const { productId, size } = req?.body
         const currentUser = req.userId

         const isProductAvailable = await addToCartModel.findOne({ 
             productId,
             size: size || null,
             userId: currentUser
         })

         console.log("isProductAvailable   ",isProductAvailable)

         if (isProductAvailable) {
            const updateQuantity = await addToCartModel.findByIdAndUpdate(isProductAvailable._id, {
                quantity: isProductAvailable.quantity + 1
            }, { new: true })
            
            return res.json({
                data: updateQuantity,
                message : "Product quantity updated in cart",
                success : true,
                error : false
            })
         }

         const payload = {
            productId : productId,
            quantity : 1,
            size : size || null,
            userId : currentUser,
         }

        const newAddToCart = new addToCartModel(payload)
        const saveProduct = await newAddToCart.save()

         return res.json({
            data : saveProduct,
            message : "Product Added Successfully",
            success : true,
            error : false
        })


    } catch (err) {
        res.json({
            message : err?.message || err,
            error : true,
            success : false
        })
    }
}

module.exports = addToCartController