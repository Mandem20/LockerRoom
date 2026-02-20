const userModel = require("../../models/userModel")

async function updateMyProfile(req,res) {
    try {
        const sessionUser = req.userId

        const { name, phone, altPhone, gender, birthDate, profilePic } = req.body

        const payload = {
            ...( name && { name : name}),
            ...( phone && { phone : phone}),
            ...( altPhone !== undefined && { altPhone : altPhone}),
            ...( gender !== undefined && { gender : gender}),
            ...( birthDate !== undefined && { birthDate : birthDate}),
            ...( profilePic && { profilePic : profilePic})
        }

        const updateUser = await userModel.findByIdAndUpdate(
            sessionUser,
            payload,
            { new: true }
        )

        res.json({
            data : updateUser,
            message : "Profile Updated Successfully",
            success : true,
            error : false
        })
    } catch (err) {
        res.status(400).json({
            message : err.message || err ,
            error : true,
            success : false
        })
    }
}

module.exports = updateMyProfile
