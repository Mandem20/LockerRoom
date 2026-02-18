

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
      categoryProduct : {
         url : `${BackendDomain}/api/get-categoryProduct`,
         method : 'get'
      },
      categoryDynamic : {
         url : `${BackendDomain}/api/get-category-dynamic`,
         method : 'get'
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