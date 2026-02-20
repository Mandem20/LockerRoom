const userModel = require("../../models/userModel")

async function updateMyAddress(req,res) {
    try {
        const sessionUser = req.userId
        const { addresses } = req.body

        const updateUser = await userModel.findByIdAndUpdate(
            sessionUser,
            { addresses: addresses },
            { new: true }
        )

        res.json({
            data : updateUser,
            message : "Addresses Updated Successfully",
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

module.exports = updateMyAddress
