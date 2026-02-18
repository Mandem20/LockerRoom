const productModel = require("../../models/productModel")

const filterProductController = async(req,res) => {
     try {
        const { 
            category, 
            brand, 
            gender,
            sizes,
            color,
            sortBy = "newest",
            page = 1,
            limit = 12
        } = req.body

        console.log("Filter request:", { category, brand, gender, sizes, color })

        const categoryList = Array.isArray(category) ? category : []
        const brandList = Array.isArray(brand) ? brand : []
        const genderList = Array.isArray(gender) ? gender : []
        const sizeList = Array.isArray(sizes) ? sizes : []
        const colorList = Array.isArray(color) ? color : []

        const filterConditions = []

        if (categoryList.length > 0) {
            filterConditions.push({ 
                category: { $regex: categoryList.join('|'), $options: 'i' }
            })
        }

        if (brandList.length > 0) {
            filterConditions.push({ 
                brandName: { $regex: brandList.join('|'), $options: 'i' }
            })
        }

        if (genderList.length > 0) {
            filterConditions.push({ 
                gender: { $regex: genderList.join('|'), $options: 'i' }
            })
        }

        if (sizeList.length > 0) {
            filterConditions.push({ 
                sizes: { $in: sizeList }
            })
        }

        if (colorList.length > 0) {
            filterConditions.push({ 
                color: { $regex: colorList.join('|'), $options: 'i' }
            })
        }

        console.log("Filter conditions:", JSON.stringify(filterConditions))

        const filters = filterConditions.length > 0 ? { $and: filterConditions } : {}

        let sortOption = {}
        switch (sortBy) {
            case "price-low":
                sortOption = { sellingPrice: 1 }
                break
            case "price-high":
                sortOption = { sellingPrice: -1 }
                break
            case "name-asc":
                sortOption = { productName: 1 }
                break
            case "name-desc":
                sortOption = { productName: -1 }
                break
            case "newest":
            default:
                sortOption = { createdAt: -1 }
                break
        }

        const pageNum = Math.max(1, parseInt(page) || 1)
        const limitNum = Math.max(1, parseInt(limit) || 12)
        const skip = (pageNum - 1) * limitNum

        const products = await productModel.find(filters)
            .sort(sortOption)
            .skip(skip)
            .limit(limitNum)

        console.log("Products found:", products.length)
        if (products.length > 0) {
            console.log("Sample brands:", products.slice(0, 3).map(p => p.brandName))
        }

        const total = await productModel.countDocuments(filters)
        const totalPages = Math.ceil(total / limitNum)

        res.json({
            data: products,
            message: "product",
            success: true,
            error: false,
            totalPages,
            currentPage: pageNum,
            total
        })
     } catch (err) {
        console.error("Filter error:", err)
        res.json({
            message:  err.message || err,
            error: true,
            success: false
        })
     }
}

module.exports = filterProductController
