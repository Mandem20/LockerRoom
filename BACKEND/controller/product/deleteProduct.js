const productModel = require("../../models/productModel")

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

    const deletedProduct = await productModel.findByIdAndDelete(productId)

    if (!deletedProduct) {
      return res.json({
        message: "Product not found",
        error: true,
        success: false
      })
    }

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
