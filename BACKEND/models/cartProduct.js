const mongoose = require('mongoose')

const addToCart = mongoose.Schema({
  productId : {
    type : String,
    ref : 'product'
  },
  quantity : Number,
  userId : {
    type : String,
    ref : 'product'
  },
},{
    timestamps : true 
})


const addToCartModel = mongoose.model("addToCart",addToCart)

module.exports = addToCartModel 