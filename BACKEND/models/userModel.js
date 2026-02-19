const mongoose =require('mongoose')


const userSchema = new mongoose.Schema({
    name : {
        type : String,
        required : [true, "Provide name"]
    },
    email : {
        type : String,
        unique : true,
        required : [true, "Provide email"]
    },
    password : {
    type : String,
    required : [true, "Provide password"]
     },
    profilePic : {
     type : String,
     default : ""
    },
    mobile : {
        type : Number,
        default : null
    },
    role : {
        type : String,
    },
    isActive : {
        type : Boolean,
        default : true
    },
    resetOtp : {
        type : String,
        default : null
    },
    resetOtpExpiry : {
        type : Number,
        default : null
    },
},{
    timestamps : true
})


const userModel = mongoose.model("user",userSchema)

module.exports = userModel