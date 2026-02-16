const userModel = require("../../models/userModel")
 const bcrypt = require('bcryptjs');
 //const sendEmail = require('../../config/sendEmail');
//const verifyEmailTemplate  = require("../../helpers/verifyEmailTemplate")

async function userSignUpController(req,res){
    try {
        const { email, password, name } = req.body

        const user = await userModel.findOne({email})
        
       

        if (user) {
            throw new Error ("User already created")
        }

        if (!email) {
            throw new Error("Please provide email")
        }

        if (!password) {
            throw new Error("Please provide password")
        }

        if (!name) {
            throw new Error("Please provide name")
        }
        
        const salt = bcrypt.genSaltSync(10);
        const hashPassword = await bcrypt.hashSync(password, salt);


        if (!hashPassword) {
            throw new Error ("Something is wrong")   
        }

        const payload = {
            ...req.body,
            name,
            email,
            role : "GENERAL",
            password : hashPassword
        }

        const userData = new userModel(payload)
        const saveUser = await userData.save()
        
        {/** const VerifyEmailUrl = `${process.env.FRONTEND_URL}/verify-email?code=${saveUser?._id}`

        const verifyEmail = await sendEmail({
            sendTo : email,
            subject : "verify email from LockerRoom",
            html : verifyEmailTemplate({
                name,
                url : VerifyEmailUrl
            })
        }) */}

       return res.status(201).json({
            data : saveUser,
            success : true, 
            error : false,
            message : "User created successfully " 
        })

    } catch (err) {
        res.json({
            message : err.message || err ,
            error : true,
            success : false,
        })
    }
}


module.exports = userSignUpController