const productModel = require("../../models/productModel")

const searchSuggestions = async (req, res) => {
  try {
    const { q } = req.query

    if (!q?.trim() || q.trim().length < 2) {
      return res.json({ data: [], success: true })
    }

    const searchTerm = q.trim()

    const suggestions = await productModel.find({
      $or: [
        { productName: { $regex: searchTerm, $options: 'i' } },
        { category: { $regex: searchTerm, $options: 'i' } },
        { brandName: { $regex: searchTerm, $options: 'i' } },
        { description: { $regex: searchTerm, $options: 'i' } },
        { color: { $regex: searchTerm, $options: 'i' } },
        { material: { $regex: searchTerm, $options: 'i' } },
        { gender: { $regex: searchTerm, $options: 'i' } },
      ]
    })
    .select('productName category brandName description color material gender')
    .limit(15)

    const uniqueSuggestions = []
    const seen = new Set()

    suggestions.forEach(item => {
      if (item.productName && !seen.has(item.productName.toLowerCase())) {
        seen.add(item.productName.toLowerCase())
        uniqueSuggestions.push({ type: 'product', value: item.productName })
      }
      if (item.category && !seen.has(item.category.toLowerCase())) {
        seen.add(item.category.toLowerCase())
        uniqueSuggestions.push({ type: 'category', value: item.category })
      }
      if (item.brandName && !seen.has(item.brandName.toLowerCase())) {
        seen.add(item.brandName.toLowerCase())
        uniqueSuggestions.push({ type: 'brand', value: item.brandName })
      }
      if (item.color && !seen.has(item.color.toLowerCase())) {
        seen.add(item.color.toLowerCase())
        uniqueSuggestions.push({ type: 'color', value: item.color })
      }
      if (item.material && !seen.has(item.material.toLowerCase())) {
        seen.add(item.material.toLowerCase())
        uniqueSuggestions.push({ type: 'material', value: item.material })
      }
      if (item.gender && !seen.has(item.gender.toLowerCase())) {
        seen.add(item.gender.toLowerCase())
        uniqueSuggestions.push({ type: 'gender', value: item.gender })
      }
    })

    res.json({
      data: uniqueSuggestions.slice(0, 8),
      success: true
    })
  } catch (err) {
    console.error("Search suggestions error:", err)
    res.status(500).json({
      message: err.message,
      error: true,
    })
  }
}

module.exports = searchSuggestions
