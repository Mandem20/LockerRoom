import SummaryApi from "../common"
import { toast } from "react-toastify"

const addToWishlist = async (productId) => {
  try {
    const response = await fetch(SummaryApi.addToWishlist.url, {
      method: SummaryApi.addToWishlist.method,
      credentials: 'include',
      headers: {
        "content-type": "application/json"
      },
      body: JSON.stringify({ productId })
    })

    const responseData = await response.json()

    if (responseData.success) {
      toast.success(responseData.message)
      return { success: true, inWishlist: responseData.inWishlist }
    }

    if (responseData.error) {
      toast.error(responseData.message)
      return { success: false }
    }

    return responseData
  } catch (error) {
    toast.error("Failed to update wishlist")
    return { success: false }
  }
}

export default addToWishlist
