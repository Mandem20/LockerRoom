const express = require('express')


const router = express.Router()


const userSignUpController = require("../controller/user/userSignUp")
const userSignInController = require('../controller/user/userSignin')
const userDetailsController = require('../controller/user/userDetails')
const authToken = require('../middleware/authToken')
const userLogout = require('../controller/user/userLogout')
const allUsers = require('../controller/user/allUsers')
const updateUser = require('../controller/user/updateUser')
const UploadProductController = require('../controller/product/uploadProduct')
const getProductController = require('../controller/product/getProduct')
const updateProductController = require('../controller/product/updateProduct')
const getCategoryProduct = require('../controller/product/getCategoryProductOne')
const getCategoryDynamic = require('../controller/product/getCategoryProduct')
const getCategoryWiseProduct = require('../controller/product/getCategoryWiseProduct')
const getBrandCategoryProduct = require('../controller/product/getBrandCategoryProduct')
const getColorProduct = require('../controller/product/getColorProduct')
const getProductDetails = require('../controller/product/getProductDetails')
const addToCartController = require('../controller/user/addToCartController')
const countAddToCartProduct = require('../controller/user/countAddToCartProduct')
const addToCartViewProduct = require('../controller/user/addToCartViewProduct')
const updateAddToCartProduct = require('../controller/user/updateAddToCartProduct')
const deleteAddToCartProduct = require('../controller/user/deleteAddToCartProduct')
const searchProduct = require('../controller/product/searchProduct')
const filterProductController = require('../controller/product/filterProduct')
const deleteProductController = require('../controller/product/deleteProduct')
const { addToWishlist, getWishlist, removeFromWishlist, checkWishlist } = require('../controller/product/wishlistController')
const { forgotPasswordController, verifyOtpController, resetPasswordController } = require('../controller/user/forgotPassword')

router.post("/signup", userSignUpController)
router.post("/signin",userSignInController)
router.get("/user-details",authToken,userDetailsController)
router.get("/userLogout",userLogout)

//password reset
router.post("/forgot-password", forgotPasswordController)
router.post("/verify-otp", verifyOtpController)
router.post("/reset-password", resetPasswordController)

//admin panel
router.get("/all-user",authToken,allUsers)
router.post("/update-user",authToken,updateUser)


//product
router.post("/upload-product",authToken,UploadProductController)
router.get("/get-product",getProductController)
router.post("/update-product",authToken,updateProductController)
router.post("/delete-product",authToken,deleteProductController)
router.get("/get-categoryProduct",getCategoryProduct)
router.get("/get-category-dynamic",getCategoryDynamic)
router.post("/category-product",getCategoryWiseProduct)
router.get("/get-brandCategoryProduct",getBrandCategoryProduct)
router.get("/get-colorProduct",getColorProduct)
router.post("/Product-Details",getProductDetails)
router.get("/search",searchProduct)
router.post("/filter-product",filterProductController)


//user add to cart
router.post("/addtocart",authToken,addToCartController)
router.get("/countAddToCartProduct",authToken,countAddToCartProduct)
router.get("/view-cart-product",authToken,addToCartViewProduct)
router.post("/update-cart-product",authToken,updateAddToCartProduct)
router.post("/delete-cart-product",authToken,deleteAddToCartProduct)

//wishlist
router.post("/wishlist", authToken, addToWishlist)
router.get("/wishlist", authToken, getWishlist)
router.post("/wishlist/remove", authToken, removeFromWishlist)
router.post("/wishlist/check", authToken, checkWishlist)


module.exports = router