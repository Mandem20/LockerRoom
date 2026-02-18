const productModel = require("../../models/productModel")

const searchProduct = async (req, res) => {
    console.log("Search Query:", req.query)
  try {
    const { keyword, category, brand, page = 1, limit = 12 } = req.query

    let filters = []

    if (keyword?.trim()) {
      const searchTerm = keyword.trim()
      filters.push({
        $or: [
          { productName: { $regex: searchTerm, $options: 'i' } },
          { category: { $regex: searchTerm, $options: 'i' } },
          { brandName: { $regex: searchTerm, $options: 'i' } },
        ],
      })
    }

    if (category?.trim()) {
      filters.push({
        $or: [
          { category: { $regex: category.trim(), $options: 'i' } },
        ],
      })
    }

    if (brand?.trim()) {
      filters.push({
        $or: [
          { brandName: { $regex: brand.trim(), $options: 'i' } },
        ],
      })
    }

    console.log("Filters:", JSON.stringify(filters))

    if (filters.length === 0) {
      return res.json({ data: [], success: true, totalPages: 0, currentPage: 1, total: 0 })
    }

    const pageNum = Math.max(1, parseInt(page) || 1)
    const limitNum = Math.max(1, parseInt(limit) || 12)
    const skip = (pageNum - 1) * limitNum

    console.log("Query filters:", JSON.stringify({ $and: filters }))
    
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