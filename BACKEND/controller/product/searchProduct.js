const productModel = require("../../models/productModel")

const searchProduct = async (req, res) => {
    console.log(req.query)
  try {
    const { keyword, category, brand } = req.query

    let filters = []

    if (keyword?.trim()) {
      filters.push({
        $or: [
          { productName: { $regex: keyword, $options: "i" } },
          { category: { $regex: keyword, $options: "i" } },
          { brand: { $regex: keyword, $options: "i" } },
        ],
      })
    }

    if (category?.trim()) {
      filters.push({
        category: { $regex: category, $options: "i" },
      })
    }

    if (brand?.trim()) {
      filters.push({
        brand: { $regex: brand, $options: "i" },
      })
    }

    if (filters.length === 0) {
      return res.json({ data: [], success: true })
    }

    const products = await productModel.find({ $and: filters })
console.log("SEARCH QUERY:", req.query)
    res.json({
      data: products,
      success: true,
      error: false,
    })
  } catch (err) {
    res.status(500).json({
      message: err.message,
      error: true,
    })
  }
}


module.exports = searchProduct