

const BackendDomain = "http://localhost:8080"

const SummaryApi = {
     SignUP : {
           url : `${BackendDomain}/api/signup`,
           method : "post"
     },
     SignIn : {
      url : `${BackendDomain}/api/signIn`,
      method : "post"
     },
     current_user : {
      url : `${BackendDomain}/api/user-details`,
      method : "get"
     },
     logout_user : {
      url : `${BackendDomain}/api/userLogout`,
      method : 'get'
     },
     allUser : {
      url : `${BackendDomain}/api/all-user`,
      method : 'get'
     },
       updateUser : {
         url : `${BackendDomain}/api/update-user`,
         method : "post"
       },
       updateMyProfile : {
         url : `${BackendDomain}/api/update-my-profile`,
         method : "post"
       },
       updateMyAddress : {
         url : `${BackendDomain}/api/update-my-address`,
         method : "post"
       },
      dashboardStats : {
        url : `${BackendDomain}/api/dashboard-stats`,
        method : "get"
      },
      exportReport : {
        url : `${BackendDomain}/api/export-report`,
        method : "post"
      },
      allOrders : {
        url : `${BackendDomain}/api/all-orders`,
        method : "get"
      },
      updateOrderStatus : {
        url : `${BackendDomain}/api/update-order-status`,
        method : "post"
      },
      sendOrderNotification : {
        url : `${BackendDomain}/api/send-order-notification`,
        method : "post"
      },
      downloadInvoice : {
        url : `${BackendDomain}/api/download-invoice`,
        method : "get"
      },
       deleteUser : {
         url : `${BackendDomain}/api/delete-user`,
         method : "post"
       },
       toggleUserStatus : {
         url : `${BackendDomain}/api/toggle-user-status`,
         method : "post"
       },
     uploadProduct : {
      url : `${BackendDomain}/api/upload-product`,
      method : "post"
     },
     allProduct : {
      url : `${BackendDomain}/api/get-product`,
      method : 'get'
     },
      updateProduct : {
       url : `${BackendDomain}/api/update-product`,
       method : 'post'
      },
      updateInventory : {
       url : `${BackendDomain}/api/update-inventory`,
       method : 'post'
      },
        categoryProduct : {
          url : `${BackendDomain}/api/get-categoryProduct`,
          method : 'get'
       },
       categoryDynamic : {
          url : `${BackendDomain}/api/get-category-dynamic`,
          method : 'get'
       },
       createCategory : {
          url : `${BackendDomain}/api/create-category`,
          method : 'post'
       },
       getCategories : {
          url : `${BackendDomain}/api/get-categories`,
          method : 'get'
       },
       deleteCategory : {
          url : `${BackendDomain}/api/delete-category`,
          method : 'post'
       },
       updateCategory : {
          url : `${BackendDomain}/api/update-category`,
          method : 'post'
       },
     brandCategory : {
       url : `${BackendDomain}/api/get-brandCategoryProduct`,
       method : 'get'
      },
      colorProduct : {
       url : `${BackendDomain}/api/get-colorProduct`,
       method : 'get'
      },
     categoryWiseProduct : {
      url : `${BackendDomain}/api/category-product`,
      method : 'post'
     },
     ProductDetails : {
       url : `${BackendDomain}/api/product-details`,
       method : 'post'
     },
     addToCartProduct : {
      url : `${BackendDomain}/api/addtocart`,
      method : 'post'
     },
     addToCartProductCount : {
      url : `${BackendDomain}/api/countAddToCartProduct`,
      method : 'get'
     },
     addToCartProductView : {
      url : `${BackendDomain}/api/view-cart-product`,
      method : 'get'
     },
     updateCartProduct : {
      url : `${BackendDomain}/api/update-cart-product`,
      method : 'post'
     },
     deleteCartProduct : {
      url : `${BackendDomain}/api/delete-cart-product`,
      method : 'post'
     },
     searchProduct : {
       url : `${BackendDomain}/api/search`,
       method : 'get'
      },
      searchSuggestions : {
       url : `${BackendDomain}/api/search-suggestions`,
       method : 'get'
      },
      recommendations : {
       url : `${BackendDomain}/api/recommendations`,
       method : 'post'
      },
       filterProduct : {
       url : `${BackendDomain}/api/filter-product`,
       method : 'post'
      },
      deleteProduct : {
       url : `${BackendDomain}/api/delete-product`,
       method : 'post'
      },
      forgotPassword : {
       url : `${BackendDomain}/api/forgot-password`,
       method : 'post'
      },
      verifyOtp : {
       url : `${BackendDomain}/api/verify-otp`,
       method : 'post'
      },
       resetPassword : {
        url : `${BackendDomain}/api/reset-password`,
        method : 'post'
       },
       addToWishlist : {
        url : `${BackendDomain}/api/wishlist`,
        method : 'post'
       },
       getWishlist : {
        url : `${BackendDomain}/api/wishlist`,
        method : 'get'
       },
       removeFromWishlist : {
        url : `${BackendDomain}/api/wishlist/remove`,
        method : 'post'
       },
       checkWishlist : {
        url : `${BackendDomain}/api/wishlist/check`,
        method : 'post'
       }
}

export default SummaryApi