const productModel = require("../../models/productModel")

const getAvailableFilters = async (req, res) => {
    try {
        const { category, brand, gender, color, sizes: selectedSizes } = req.body

        const buildQuery = (excludeField) => {
            const conditions = []
            if (category?.length > 0 && excludeField !== 'category') {
                conditions.push({ category: { $regex: category.join('|'), $options: 'i' } })
            }
            if (brand?.length > 0 && excludeField !== 'brand') {
                conditions.push({ brandName: { $regex: brand.join('|'), $options: 'i' } })
            }
            if (gender?.length > 0 && excludeField !== 'gender') {
                conditions.push({ gender: { $regex: gender.join('|'), $options: 'i' } })
            }
            if (color?.length > 0 && excludeField !== 'color') {
                conditions.push({
                    $or: [
                        { color: { $regex: color.join('|'), $options: 'i' } },
                        { 'colorVariants.colorName': { $regex: color.join('|'), $options: 'i' } }
                    ]
                })
            }
            if (selectedSizes?.length > 0 && excludeField !== 'sizes') {
                conditions.push({
                    $or: [
                        { sizes: { $in: selectedSizes } },
                        { 'colorVariants.sizes': { $in: selectedSizes } }
                    ]
                })
            }
            return conditions.length > 0 ? { $and: conditions } : {}
        }

        const [categories, brands, colors, sizesList, genders] = await Promise.all([
            productModel.distinct("category", buildQuery('category')),
            productModel.distinct("brandName", buildQuery('brand')),
            productModel.distinct("color", buildQuery('color')).then(colors => {
                return productModel.find(buildQuery('color'), { 'colorVariants.colorName': 1 }).then(products => {
                    const variantColors = products.flatMap(p => p.colorVariants?.map(v => v.colorName) || [])
                    return [...new Set([...colors, ...variantColors])].filter(Boolean)
                })
            }),
            productModel.distinct("sizes", buildQuery('sizes')).then(sizesResult => {
                return productModel.find(buildQuery('sizes'), { 'colorVariants.sizes': 1 }).then(products => {
                    const variantSizes = products.flatMap(p => p.colorVariants?.flatMap(v => v.sizes || []) || [])
                    return [...new Set([...sizesResult, ...variantSizes])].filter(Boolean)
                })
            }),
            productModel.distinct("gender", buildQuery('gender'))
        ])

        const allSizes = sizesList.filter(Boolean).map(s => s.toUpperCase()).sort()
        
        res.json({
            success: true,
            data: {
                categories: categories.filter(Boolean).map(c => ({ label: c, value: c })),
                brands: brands.filter(Boolean).map(b => ({ label: b, value: b.toLowerCase() })),
                colors: colors.filter(Boolean),
                sizes: allSizes,
                genders: genders.filter(Boolean).map(g => ({ label: g, value: g.toLowerCase() }))
            }
        })
    } catch (err) {
        res.status(400).json({
            message: err.message || err,
            error: true,
            success: false
        })
    }
}

module.exports = getAvailableFilters
