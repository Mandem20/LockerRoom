const productModel = require("../../models/productModel")

const searchProduct = async (req, res) => {
    console.log("Search Query:", req.query)
  try {
    const { keyword, category, brand, page = 1, limit = 12 } = req.query

    let filters = []

    if (keyword?.trim()) {
      const searchTerms = keyword.trim().split(/\s+/).filter(t => t.length > 0)
      
      const orConditions = []

      searchTerms.forEach(term => {
        orConditions.push(
          { productName: { $regex: term, $options: 'i' } },
          { brandName: { $regex: term, $options: 'i' } },
          { category: { $regex: term, $options: 'i' } },
          { description: { $regex: term, $options: 'i' } },
          { color: { $regex: term, $options: 'i' } },
          { material: { $regex: term, $options: 'i' } },
          { gender: { $regex: term, $options: 'i' } }
        )
      })

      filters.push({ $or: orConditions })
    }

    if (category?.trim()) {
      const categories = category.split(',').map(c => c.trim()).filter(c => c)
      if (categories.length > 0) {
        filters.push({
          $or: categories.map(c => ({ category: { $regex: c, $options: 'i' } }))
        })
      }
    }

    if (brand?.trim()) {
      const brands = brand.split(',').map(b => b.trim()).filter(b => b)
      if (brands.length > 0) {
        filters.push({
          $or: brands.map(b => ({ brandName: { $regex: b, $options: 'i' } }))
        })
      }
    }

    console.log("Filters:", JSON.stringify(filters))

    if (filters.length === 0) {
      return res.json({ data: [], success: true, totalPages: 0, currentPage: 1, total: 0 })
    }

    const pageNum = Math.max(1, parseInt(page) || 1)
    const limitNum = Math.max(1, parseInt(limit) || 12)
    const skip = (pageNum - 1) * limitNum

    console.log("Query filters:", JSON.stringify({ $and: filters }))

    if (keyword?.trim()) {
      const searchTerm = keyword.trim().split(/\s+/)[0]
      
      const products = await productModel.aggregate([
        { $match: { $and: filters } },
        {
          $addFields: {
            relevanceScore: {
              $sum: [
                { $cond: [{ $eq: [{ $toLower: "$productName" }, searchTerm.toLowerCase()] }, 10, 0] },
                { $cond: [{ $regexMatch: { input: "$productName", options: 'i', regex: searchTerm } }, 5, 0] },
                { $cond: [{ $regexMatch: { input: "$brandName", options: 'i', regex: searchTerm } }, 4, 0] },
                { $cond: [{ $regexMatch: { input: "$category", options: 'i', regex: searchTerm } }, 3, 0] },
                { $cond: [{ $regexMatch: { input: "$description", options: 'i', regex: searchTerm } }, 2, 0] },
                { $cond: [{ $regexMatch: { input: "$color", options: 'i', regex: searchTerm } }, 1, 0] },
                { $cond: [{ $regexMatch: { input: "$material", options: 'i', regex: searchTerm } }, 1, 0] },
                { $cond: [{ $regexMatch: { input: "$gender", options: 'i', regex: searchTerm } }, 1, 0] },
                { $cond: [{ $gt: ["$rating", 0] }, { $multiply: ["$rating", 0.5] }, 0] }
              ]
            }
          }
        },
        { $sort: { relevanceScore: -1 } },
        { $skip: skip },
        { $limit: limitNum }
      ])

      const totalAgg = await productModel.aggregate([
        { $match: { $and: filters } },
        { $count: "total" }
      ])
      const total = totalAgg[0]?.total || 0
      const totalPages = Math.ceil(total / limitNum)

      console.log("Products found:", products.length, "Total:", total)
      console.log("Sample product brands:", products.slice(0, 3).map(p => p.brandName))
      
      return res.json({
        data: products,
        success: true,
        error: false,
        totalPages,
        currentPage: pageNum,
        total
      })
    }

    const products = await productModel.find({ $and: filters }).skip(skip).limit(limitNum)
    const total = await productModel.countDocuments({ $and: filters })
    const totalPages = Math.ceil(total / limitNum)

    console.log("Products found:", products.length, "Total:", total)
    console.log("Sample product brands:", products.slice(0, 3).map(p => p.brandName))
    
    res.json({
      data: products,
      success: true,
      error: false,
      totalPages,
      currentPage: pageNum,
      total
    })
  } catch (err) {
    console.error("Search error:", err)
    res.status(500).json({
      message: err.message,
      error: true,
    })
  }
}


module.exports = searchProduct
