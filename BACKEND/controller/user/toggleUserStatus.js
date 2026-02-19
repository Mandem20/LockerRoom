const userModel = require("../../models/userModel")

const toggleUserStatus = async(req,res) => {
    try {
        const { id } = req.body

        if(!id){
            return res.status(400).json({
                message : "User ID is required",
                error : true,
                success : false
            })
        }

        const user = await userModel.findById(id)

        if(!user){
            return res.status(404).json({
                message : "User not found",
                error : true,
                success : false
            })
        }

        if(user.role === "ADMIN"){
            return res.status(400).json({
                message : "Cannot change status of admin user",
                error : true,
                success : false
            })
        }

        user.isActive = !user.isActive
        await user.save()

        res.json({
            message : user.isActive ? "User activated successfully" : "User deactivated successfully",
            data : { isActive: user.isActive },
            success : true,
            error : false
        })
    } catch (err) {
        res.status(400).json({
            message : err.message || err,
            error : true,
            success : false
        })
    }
}

module.exports = toggleUserStatus
