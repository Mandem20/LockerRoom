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
        quantity : {
            type: Number,
            default: 0
        },
        location : {
            type: String,
            default: ''
        },
        more_details : {
            type : Object,
            default : {}
        },
        sizes : {
            type: [String],
            default: []
        },
        rating : {
            type: Number,
            default: 0
        },
        gender : String,
        color : String,
        material : String,
        price : Number,
        sellingPrice : Number,
        lastUpdated : {
            type: Date,
            default: Date.now
        }
},{
    timestamps : true 
})


const productModel = mongoose.model("product",productSchema)


module.exports = productModel