const mongoose = require('mongoose')

const addressSchema = new mongoose.Schema({
    address_line : {
        type : String,
        default : ""
    },
        gps_address : {
        type : String,
        default : ""
    },
       city : {
        type : String,
        default : ""
    },
        town : {
        type : String,
        default : ""
    },
        country : {
        type : String,
        default : ""
    },
        mobile : {
        type : Number,
        default : ""
    },
    status : {
        type : Boolean,
        default : true
    },
},{
    timestamps : true
})

const AddressModel = mongoose.model('address',addressSchema)

module.exports = AddressModel