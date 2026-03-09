const express = require('express')


const router = express.Router()


const userSignUpController = require("../controller/user/userSignUp")
const userSignInController = require('../controller/user/userSignin')
const userDetailsController = require('../controller/user/userDetails')
const { authToken, adminOnly, vendorOnly, adminOrVendor } = require('../middleware/authToken')
const userLogout = require('../controller/user/userLogout')
const allUsers = require('../controller/user/allUsers')
const updateUser = require('../controller/user/updateUser')
const updateMyProfile = require('../controller/user/updateMyProfile')
const updateMyAddress = require('../controller/user/updateMyAddress')
const deleteUser = require('../controller/user/deleteUser')
const toggleUserStatus = require('../controller/user/toggleUserStatus')
const orderController = require('../controller/orderController')
const UploadProductController = require('../controller/product/uploadProduct')
const getProductController = require('../controller/product/getProduct')
const updateProductController = require('../controller/product/updateProduct')
const updateInventory = require('../controller/product/updateInventory')
const getCategoryProduct = require('../controller/product/getCategoryProductOne')
const getCategoryDynamic = require('../controller/product/getCategoryProduct')
const getCategoryWiseProduct = require('../controller/product/getCategoryWiseProduct')
const getBrandCategoryProduct = require('../controller/product/getBrandCategoryProduct')
const getBrandProduct = require('../controller/product/getBrandProduct')
const getColorProduct = require('../controller/product/getColorProduct')
const getSizeProduct = require('../controller/product/getSizeProduct')
const getGenderProduct = require('../controller/product/getGenderProduct')
const getAvailableFilters = require('../controller/product/getAvailableFilters')
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

//vendor controllers (moved to top)
const {
    becomeVendor,
    getVendorProfile,
    updateVendorProfile,
    updateBankDetails,
    updatePayoutSettings,
    uploadVerificationDocuments,
    getVendorStatus
} = require('../controller/vendor/vendorController')

const {
    uploadVendorProduct,
    getVendorProducts,
    getVendorProductById,
    updateVendorProduct,
    deleteVendorProduct,
    updateVendorInventory,
    bulkUpdateInventory,
    getVendorProductAnalytics
} = require('../controller/vendor/vendorProductController')

const {
    getVendorOrders,
    getVendorOrderById,
    updateVendorOrderStatus,
    getVendorOrderStats,
    getRecentVendorOrders,
    requestVendorRefund,
    processVendorRefund
} = require('../controller/vendor/vendorOrderController')

const {
    getVendorDashboardStats,
    getVendorAnalytics,
    getVendorPerformanceMetrics,
    getVendorSalesChart
} = require('../controller/vendor/vendorAnalyticsController')

const {
    getVendorPayouts,
    requestPayout,
    getVendorWallet,
    getVendorTransactions
} = require('../controller/vendor/vendorPayoutController')

const {
    getAllVendorApplications,
    getVendorApplicationById,
    approveVendor,
    rejectVendor,
    suspendVendor,
    reactivateVendor,
    getVendorStats,
    getAllVendors,
    getVendorById,
    updateVendorConfig,
    getAdminVendorAnalytics,
    getAdminVendorOrders,
    getAdminVendorPayouts,
    deleteVendor,
    getAdminVendorProducts,
    getAllProductsWithVendor,
    deleteAdminVendorProduct
} = require('../controller/vendor/vendorAdminController')

const {
    getAllVendorOrders,
    getVendorOrderStats: getAdminVendorOrderStats,
    adminOverrideOrderStatus,
    adminResolveDispute,
    adminCancelOrder
} = require('../controller/admin/vendorOrderController')

// commission & payout
const commissionController = require('../controller/admin/commissionController')
const payoutController = require('../controller/payoutController')

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

//order checkout (multi-vendor)
router.post("/create-order", authToken, orderController.createOrder)
router.get("/my-orders", authToken, orderController.getMyOrders)
router.get("/order-details/:orderId", authToken, orderController.getOrderDetails)
router.post("/cancel-order/:orderId", authToken, orderController.cancelOrder)

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

//admin vendor order management
router.get("/admin/vendor-orders", authToken, adminOnly, getAllVendorOrders)
router.get("/admin/vendor-order-stats", authToken, adminOnly, getAdminVendorOrderStats)
router.post("/admin/override-order-status", authToken, adminOnly, adminOverrideOrderStatus)
router.post("/admin/resolve-dispute", authToken, adminOnly, adminResolveDispute)
router.post("/admin/cancel-order", authToken, adminOnly, adminCancelOrder)

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
router.get("/get-brandProduct",getBrandProduct)
router.get("/get-colorProduct",getColorProduct)
router.get("/get-sizeProduct",getSizeProduct)
router.get("/get-genderProduct",getGenderProduct)
router.post("/available-filters",getAvailableFilters)
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


//vendor routes
//vendor authentication & profile
router.post("/become-vendor", authToken, becomeVendor)
router.get("/vendor-status", authToken, vendorOnly, getVendorStatus)
router.get("/vendor-profile", authToken, vendorOnly, getVendorProfile)
router.post("/vendor-profile", authToken, vendorOnly, updateVendorProfile)
router.post("/vendor-bank-details", authToken, vendorOnly, updateBankDetails)
router.post("/vendor-payout-settings", authToken, vendorOnly, updatePayoutSettings)
router.post("/vendor-verification-documents", authToken, vendorOnly, uploadVerificationDocuments)

//vendor products
router.get("/vendor/products", authToken, vendorOnly, getVendorProducts)
router.post("/vendor/products", authToken, vendorOnly, uploadVendorProduct)
router.get("/vendor/products/:id", authToken, vendorOnly, getVendorProductById)
router.put("/vendor/products/:id", authToken, vendorOnly, updateVendorProduct)
router.delete("/vendor/products/:id", authToken, vendorOnly, deleteVendorProduct)
router.post("/vendor/inventory", authToken, vendorOnly, updateVendorInventory)
router.post("/vendor/inventory/bulk", authToken, vendorOnly, bulkUpdateInventory)
router.get("/vendor/product-analytics", authToken, vendorOnly, getVendorProductAnalytics)

//vendor orders
router.get("/vendor/orders", authToken, vendorOnly, getVendorOrders)
router.get("/vendor/orders/:id", authToken, vendorOnly, getVendorOrderById)
router.post("/vendor/order-status", authToken, vendorOnly, updateVendorOrderStatus)
router.post("/vendor/refund-request", authToken, vendorOnly, requestVendorRefund)
router.post("/vendor/process-refund", authToken, vendorOnly, processVendorRefund)
router.get("/vendor/order-stats", authToken, vendorOnly, getVendorOrderStats)
router.get("/vendor/recent-orders", authToken, vendorOnly, getRecentVendorOrders)
router.get("/vendor/sub-orders", authToken, vendorOnly, orderController.getVendorSubOrders)

//vendor analytics & dashboard
router.get("/vendor/dashboard-stats", authToken, vendorOnly, getVendorDashboardStats)
router.get("/vendor/analytics", authToken, vendorOnly, getVendorAnalytics)
router.get("/vendor/performance-metrics", authToken, vendorOnly, getVendorPerformanceMetrics)
router.get("/vendor/sales-chart", authToken, vendorOnly, getVendorSalesChart)

//vendor payouts & wallet
router.get("/vendor/payouts", authToken, vendorOnly, getVendorPayouts)
router.post("/vendor/request-payout", authToken, vendorOnly, requestPayout)
router.get("/vendor/wallet", authToken, vendorOnly, getVendorWallet)
router.get("/vendor/transactions", authToken, vendorOnly, getVendorTransactions)

//admin vendor management
router.get("/admin/vendor-applications", authToken, adminOnly, getAllVendorApplications)
router.get("/admin/vendor-applications/:id", authToken, adminOnly, getVendorApplicationById)
router.post("/admin/approve-vendor", authToken, adminOnly, approveVendor)
router.post("/admin/reject-vendor", authToken, adminOnly, rejectVendor)
router.post("/admin/suspend-vendor", authToken, adminOnly, suspendVendor)
router.post("/admin/reactivate-vendor", authToken, adminOnly, reactivateVendor)
router.get("/admin/vendor-stats", authToken, adminOnly, getVendorStats)
router.get("/admin/vendors", authToken, adminOnly, getAllVendors)
router.get("/admin/vendors/:vendorId", authToken, adminOnly, getVendorById)

//admin vendor products
router.get("/admin/vendor-products", authToken, adminOnly, getAllProductsWithVendor)
router.get("/admin/vendors/:vendorId/products", authToken, adminOnly, getAdminVendorProducts)
router.delete("/admin/products/:id", authToken, adminOnly, deleteAdminVendorProduct)

//commission management (admin)
router.get("/admin/commission-settings", authToken, adminOnly, commissionController.getCommissionSettings)
router.put("/admin/commission-settings", authToken, adminOnly, commissionController.updateCommissionSettings)
router.post("/admin/category-commission", authToken, adminOnly, commissionController.updateCategoryCommission)
router.delete("/admin/category-commission/:categoryId", authToken, adminOnly, commissionController.deleteCategoryCommission)
router.post("/admin/commission-tiers", authToken, adminOnly, commissionController.addCommissionTier)
router.put("/admin/commission-tiers/:tierId", authToken, adminOnly, commissionController.updateCommissionTier)
router.delete("/admin/commission-tiers/:tierId", authToken, adminOnly, commissionController.deleteCommissionTier)
router.post("/admin/vendor-commission-override", authToken, adminOnly, commissionController.setVendorCommissionOverride)
router.get("/admin/commission-report", authToken, adminOnly, commissionController.getPlatformCommissionReport)
router.get("/admin/vendor-commission-report/:vendorId", authToken, adminOnly, commissionController.getVendorCommissionReport)
router.get("/admin/commission-transactions", authToken, adminOnly, commissionController.getAllTransactions)
router.post("/admin/recalculate-commission/:orderId", authToken, adminOnly, commissionController.recalculateOrderCommission)

//payout management (admin)
router.get("/admin/payouts", authToken, adminOnly, payoutController.getAllPayouts)
router.get("/admin/payouts/:payoutId", authToken, adminOnly, payoutController.getPayoutById)
router.post("/admin/payouts/:payoutId/approve", authToken, adminOnly, payoutController.approvePayout)
router.post("/admin/payouts/:payoutId/process", authToken, adminOnly, payoutController.processPayout)
router.post("/admin/payouts/:payoutId/cancel", authToken, adminOnly, payoutController.cancelPayout)
router.post("/admin/payouts/:payoutId/retry", authToken, adminOnly, payoutController.retryPayout)
router.get("/admin/payout-stats", authToken, adminOnly, payoutController.getPayoutStats)
router.post("/admin/run-scheduled-payouts", authToken, adminOnly, payoutController.runScheduledPayouts)

//vendor payouts & wallet (enhanced)
router.get("/vendor/payout-history", authToken, vendorOnly, payoutController.getVendorPayouts)
router.get("/vendor/payouts/:payoutId", authToken, vendorOnly, payoutController.getVendorPayoutById)
router.get("/vendor/wallet-summary", authToken, vendorOnly, payoutController.getVendorWalletSummary)

module.exports = router