const productModel = require("../../models/productModel")

const getGenderProduct = async(req,res) => {
    try {
        const genders = await productModel.distinct("gender")
        
        const genderData = genders.filter(gender => gender).map((gender, index) => ({
            id: index + 1,
            label: gender,
            value: gender.toLowerCase(),
            code: gender
        }))

        res.json({
            message : "Genders",
            data : genderData,
            success : true ,
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

module.exports = getGenderProduct
