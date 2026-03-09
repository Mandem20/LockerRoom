const productModel = require("../../models/productModel")
const VendorModel = require("../../models/vendorModel")

const deleteProductController = async (req, res) => {
  try {
    const { productId } = req.body

    if (!productId) {
      return res.json({
        message: "Product ID is required",
        error: true,
        success: false
      })
    }

    const product = await productModel.findById(productId)

    if (!product) {
      return res.json({
        message: "Product not found",
        error: true,
        success: false
      })
    }

    const vendorId = product.more_details?.vendorId

    if (vendorId) {
      const vendor = await VendorModel.findById(vendorId)
      if (vendor) {
        vendor.analytics.totalProducts = Math.max(0, (vendor.analytics.totalProducts || 1) - 1)
        await vendor.save()
      }
    }

    await productModel.findByIdAndDelete(productId)

    res.json({
      message: "Product deleted successfully",
      success: true,
      error: false
    })
  } catch (err) {
    res.json({
      message: err.message || "Something went wrong",
      error: true,
      success: false
    })
  }
}

module.exports = deleteProductController
