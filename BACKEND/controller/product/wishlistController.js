const wishlistModel = require('../../models/wishlistModel')
const productModel = require('../../models/productModel')

const addToWishlist = async (req, res) => {
  try {
    const { productId } = req.body
    const userId = req.userId

    if (!productId) {
      return res.json({
        message: 'Product ID is required',
        error: true,
        success: false
      })
    }

    const existingItem = await wishlistModel.findOne({ userId, productId })

    if (existingItem) {
      await wishlistModel.findByIdAndDelete(existingItem._id)
      return res.json({
        message: 'Removed from wishlist',
        success: true,
        error: false,
        inWishlist: false
      })
    }

    const newWishlistItem = new wishlistModel({ userId, productId })
    await newWishlistItem.save()

    return res.json({
      message: 'Added to wishlist',
      success: true,
      error: false,
      inWishlist: true
    })
  } catch (err) {
    res.json({
      message: err.message || 'Something went wrong',
      error: true,
      success: false
    })
  }
}

const getWishlist = async (req, res) => {
  try {
    const userId = req.userId

    const wishlistItems = await wishlistModel.find({ userId }).sort({ createdAt: -1 })
    
    const productIds = wishlistItems.map(item => item.productId)
    const products = await productModel.find({ _id: { $in: productIds } })

    return res.json({
      data: products,
      message: 'Wishlist products',
      success: true,
      error: false
    })
  } catch (err) {
    res.json({
      message: err.message || 'Something went wrong',
      error: true,
      success: false
    })
  }
}

const removeFromWishlist = async (req, res) => {
  try {
    const { productId } = req.body
    const userId = req.userId

    await wishlistModel.findOneAndDelete({ userId, productId })

    return res.json({
      message: 'Removed from wishlist',
      success: true,
      error: false
    })
  } catch (err) {
    res.json({
      message: err.message || 'Something went wrong',
      error: true,
      success: false
    })
  }
}

const checkWishlist = async (req, res) => {
  try {
    const { productId } = req.body
    const userId = req.userId

    const existingItem = await wishlistModel.findOne({ userId, productId })

    return res.json({
      inWishlist: !!existingItem,
      success: true,
      error: false
    })
  } catch (err) {
    res.json({
      message: err.message || 'Something went wrong',
      error: true,
      success: false
    })
  }
}

module.exports = {
  addToWishlist,
  getWishlist,
  removeFromWishlist,
  checkWishlist
}
