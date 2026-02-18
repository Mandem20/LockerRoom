const mongoose = require('mongoose')

const wishlistSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true
  },
  productId: {
    type: String,
    required: true
  }
}, {
  timestamps: true
})

const wishlistModel = mongoose.model('wishlist', wishlistSchema)

module.exports = wishlistModel
