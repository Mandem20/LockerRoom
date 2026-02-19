const userModel = require("../../models/userModel")

const deleteUser = async(req,res) => {
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
                message : "Cannot delete admin user",
                error : true,
                success : false
            })
        }

        await userModel.findByIdAndDelete(id)

        res.json({
            message : "User deleted successfully",
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

module.exports = deleteUser
