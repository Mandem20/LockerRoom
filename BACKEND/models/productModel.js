const mongoose = require('mongoose')

const productSchema = new mongoose.Schema({
        productName : String,
        brandName : String,
        category : String,
        productImage : [],
        description : String,
        unit : String,
        discount : {
            type : Number,
            default : null
        },
        stock : String,
        more_details : {
            type : Object,
            default : {}
        },
        size : String,
        gender : String,
        color : String,
        material : String,
        price : Number,
        sellingPrice : Number
},{
    timestamps : true 
})


const productModel = mongoose.model("product",productSchema)


module.exports = productModel