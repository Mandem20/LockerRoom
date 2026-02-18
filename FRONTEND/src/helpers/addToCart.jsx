import { toast } from "react-toastify"
import SummaryApi from "../common"

const addToCart = async(e, id, size = null)=>{
   e?.stopPropagation()
   e?.preventDefault()

   const response = await fetch(SummaryApi.addToCartProduct.url,{
      method : SummaryApi.addToCartProduct.method,
      credentials : 'include',
      headers : {
         "content-type" : "application/json"
      },
      body : JSON.stringify(
        { productId : id, size }
      )
   })

   const responseData = await response.json()

   if (responseData.success) {
      toast.success(responseData.message)
   }

   if (responseData.error) {
      toast.error(responseData.message)
   }

   return responseData

}

export default addToCart