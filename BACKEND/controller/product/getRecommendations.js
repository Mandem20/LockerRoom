const mongoose = require('mongoose')
const productModel = require("../../models/productModel")

const getRecommendations = async (req, res) => {
  try {
    const { wishlist = [], viewed = [] } = req.body

    let recommendationFilters = []
    let shouldExclude = []

    try {
      shouldExclude = viewed
        .filter(id => mongoose.Types.ObjectId.isValid(id))
        .map(id => new mongoose.Types.ObjectId(id))
    } catch (e) {
      shouldExclude = []
    }

    if (wishlist.length > 0) {
      const validWishlistIds = wishlist.filter(id => mongoose.Types.ObjectId.isValid(id)).map(id => new mongoose.Types.ObjectId(id))
      
      const wishlistProducts = await productModel.find({
        _id: { $in: validWishlistIds }
      }).limit(10)

      const categories = [...new Set(wishlistProducts.map(p => p.category).filter(Boolean))]
      const brands = [...new Set(wishlistProducts.map(p => p.brandName).filter(Boolean))]
      const genders = [...new Set(wishlistProducts.map(p => p.gender).filter(Boolean))]

      if (categories.length > 0 || brands.length > 0) {
        recommendationFilters.push({
          $or: [
            ...categories.map(c => ({ category: { $regex: c, $options: 'i' } })),
            ...brands.map(b => ({ brandName: { $regex: b, $options: 'i' } })),
            ...genders.map(g => ({ gender: { $regex: g, $options: 'i' } }))
          ]
        })
      }
    }

    if (viewed.length > 0) {
      const validViewedIds = viewed.filter(id => mongoose.Types.ObjectId.isValid(id)).map(id => new mongoose.Types.ObjectId(id))
      
      const viewedProducts = await productModel.find({
        _id: { $in: validViewedIds }
      }).limit(10)

      const viewedCategories = [...new Set(viewedProducts.map(p => p.category).filter(Boolean))]
      const viewedBrands = [...new Set(viewedProducts.map(p => p.brandName).filter(Boolean))]

      if (viewedCategories.length > 0 || viewedBrands.length > 0) {
        recommendationFilters.push({
          $or: [
            ...viewedCategories.map(c => ({ category: { $regex: c, $options: 'i' } })),
            ...viewedBrands.map(b => ({ brandName: { $regex: b, $options: 'i' } }))
          ]
        })
      }
    }

    if (recommendationFilters.length === 0) {
      const randomProducts = await productModel.aggregate([
        { $sample: { size: 12 } }
      ])
      return res.json({
        data: randomProducts,
        success: true
      })
    }

    const finalFilter = recommendationFilters.length > 1
      ? { $or: recommendationFilters }
      : recommendationFilters[0]

    const matchFilter = { ...finalFilter }
    if (shouldExclude.length > 0) {
      matchFilter._id = { $nin: shouldExclude }
    }

    const recommendations = await productModel.aggregate([
      { $match: matchFilter },
      {
        $addFields: {
          relevanceScore: {
            $sum: [
              { $cond: [{ $gt: ["$rating", 0] }, { $multiply: ["$rating", 2] }, 0] },
              { $cond: [{ $gt: ["$sellingPrice", 0] }, { $cond: [{ $lt: ["$sellingPrice", 500] }, 3, 0] }, 0] }
            ]
          }
        }
      },
      { $sort: { relevanceScore: -1 } },
      { $limit: 12 }
    ])

    if (recommendations.length < 4 && viewed.length > 0) {
      const excludeIds = [
        ...shouldExclude,
        ...recommendations.map(p => p._id)
      ]
      const additionalProducts = await productModel.find({
        _id: { $nin: excludeIds }
      }).limit(12 - recommendations.length)

      recommendations.push(...additionalProducts)
    }

    res.json({
      data: recommendations,
      success: true
    })
  } catch (err) {
    console.error("Recommendations error:", err)
    res.status(500).json({
      message: err.message,
      error: true,
    })
  }
}

module.exports = getRecommendations
