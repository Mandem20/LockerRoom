const express = require('express')


const router = express.Router()


const userSignUpController = require("../controller/user/userSignUp")
const userSignInController = require('../controller/user/userSignin')
const userDetailsController = require('../controller/user/userDetails')
const { authToken, adminOnly } = require('../middleware/authToken')
const userLogout = require('../controller/user/userLogout')
const allUsers = require('../controller/user/allUsers')
const updateUser = require('../controller/user/updateUser')
const updateMyProfile = require('../controller/user/updateMyProfile')
const updateMyAddress = require('../controller/user/updateMyAddress')
const deleteUser = require('../controller/user/deleteUser')
const toggleUserStatus = require('../controller/user/toggleUserStatus')
const UploadProductController = require('../controller/product/uploadProduct')
const getProductController = require('../controller/product/getProduct')
const updateProductController = require('../controller/product/updateProduct')
const updateInventory = require('../controller/product/updateInventory')
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
const searchSuggestions = require('../controller/product/searchSuggestions')
const getRecommendations = require('../controller/product/getRecommendations')
const filterProductController = require('../controller/product/filterProduct')
const deleteProductController = require('../controller/product/deleteProduct')
const { addToWishlist, getWishlist, removeFromWishlist, checkWishlist } = require('../controller/product/wishlistController')
const { forgotPasswordController, verifyOtpController, resetPasswordController } = require('../controller/user/forgotPassword')
const verifyCustomerController = require('../controller/user/verifyCustomer')
const { createRefundRequest, getMyRefundRequests, getRefundRequestDetails } = require('../controller/user/refundController')
const { getAllRefundRequests, updateRefundStatus, getRefundStats } = require('../controller/admin/refundAdminController')

//footer
const {
    getFooterSettings,
    updateFooterSettings,
    getFooterSections,
    createFooterSection,
    updateFooterSection,
    deleteFooterSection,
    getFooterLinks,
    createFooterLink,
    updateFooterLink,
    deleteFooterLink
} = require('../controller/footer/footerController')

//category
const createCategory = require('../controller/category/createCategory')
const getCategories = require('../controller/category/getCategories')
const deleteCategory = require('../controller/category/deleteCategory')
const updateCategory = require('../controller/category/updateCategory')

//admin
const getDashboardStats = require('../controller/admin/getDashboardStats')
const exportReport = require('../controller/admin/exportReport')
const getAllOrders = require('../controller/admin/getAllOrders')
const updateOrderStatus = require('../controller/admin/updateOrderStatus')
const downloadInvoice = require('../controller/admin/downloadInvoice')
const sendOrderNotification = require('../controller/admin/sendOrderNotification')

router.post("/signup", userSignUpController)
router.post("/signin",userSignInController)
router.get("/user-details",authToken,userDetailsController)
router.post("/update-my-profile",authToken,updateMyProfile)
router.post("/update-my-address",authToken,updateMyAddress)
router.get("/userLogout",userLogout)

//password reset
router.post("/forgot-password", forgotPasswordController)
router.post("/verify-otp", verifyOtpController)
router.post("/reset-password", resetPasswordController)

//customer verification
router.post("/verify-customer", verifyCustomerController)

//refund request
router.post("/refund-request", authToken, createRefundRequest)
router.get("/my-refund-requests", authToken, getMyRefundRequests)
router.post("/refund-details", authToken, getRefundRequestDetails)

//admin refund management
router.get("/all-refund-requests", authToken, adminOnly, getAllRefundRequests)
router.post("/update-refund-status", authToken, adminOnly, updateRefundStatus)
router.get("/refund-stats", authToken, adminOnly, getRefundStats)

//admin panel
router.get("/all-user",authToken,adminOnly,allUsers)
router.get("/dashboard-stats",authToken,adminOnly,getDashboardStats)
router.post("/export-report",authToken,adminOnly,exportReport)
router.get("/all-orders",authToken,adminOnly,getAllOrders)
router.post("/update-order-status",authToken,adminOnly,updateOrderStatus)
router.post("/send-order-notification",authToken,adminOnly,sendOrderNotification)
router.get("/download-invoice",authToken,adminOnly,downloadInvoice)
router.post("/update-user",authToken,adminOnly,updateUser)
router.post("/delete-user",authToken,adminOnly,deleteUser)
router.post("/toggle-user-status",authToken,adminOnly,toggleUserStatus)


//product
router.post("/create-category",authToken,adminOnly,createCategory)
router.get("/get-categories",getCategories)
router.post("/delete-category",authToken,adminOnly,deleteCategory)
router.post("/update-category",authToken,adminOnly,updateCategory)
router.post("/upload-product",authToken,adminOnly,UploadProductController)
router.get("/get-product",getProductController)
router.post("/update-product",authToken,adminOnly,updateProductController)
router.post("/delete-product",authToken,adminOnly,deleteProductController)
router.post("/update-inventory",authToken,adminOnly,updateInventory)
router.get("/get-categoryProduct",getCategoryProduct)
router.get("/get-category-dynamic",getCategoryDynamic)
router.post("/category-product",getCategoryWiseProduct)
router.get("/get-brandCategoryProduct",getBrandCategoryProduct)
router.get("/get-colorProduct",getColorProduct)
router.post("/Product-Details",getProductDetails)
router.get("/search",searchProduct)
router.get("/search-suggestions",searchSuggestions)
router.post("/recommendations",getRecommendations)
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

//footer
router.get("/footer-settings", getFooterSettings)
router.post("/footer-settings", authToken, adminOnly, updateFooterSettings)
router.get("/footer-sections", getFooterSections)
router.post("/footer-sections", authToken, adminOnly, createFooterSection)
router.post("/footer-sections/update", authToken, adminOnly, updateFooterSection)
router.post("/footer-sections/delete", authToken, adminOnly, deleteFooterSection)
router.get("/footer-links", getFooterLinks)
router.post("/footer-links", authToken, adminOnly, createFooterLink)
router.post("/footer-links/update", authToken, adminOnly, updateFooterLink)
router.post("/footer-links/delete", authToken, adminOnly, deleteFooterLink)


module.exports = router