const productModel = require('../../models/productModel')
const VendorModel = require('../../models/vendorModel')

const uploadVendorProduct = async (req, res) => {
    try {
        const vendor = await VendorModel.findOne({ userId: req.userId })
        
        if (!vendor) {
            return res.status(404).json({
                message: 'Vendor profile not found',
                error: true,
                success: false
            })
        }

        if (!vendor.isActive) {
            return res.status(400).json({
                message: 'Your vendor account is not active',
                error: true,
                success: false
            })
        }

        const {
            productName,
            brandName,
            category,
            productImage,
            description,
            unit,
            discount,
            stock,
            quantity,
            location,
            more_details,
            sizes,
            gender,
            color,
            colorVariants,
            material,
            price,
            sellingPrice
        } = req.body

        const product = new productModel({
            productName,
            brandName,
            category,
            productImage,
            description,
            unit,
            discount,
            stock,
            quantity,
            location,
            more_details: {
                ...more_details,
                vendorId: vendor._id,
                vendorName: vendor.businessName,
                storeName: vendor.storeName
            },
            sizes,
            gender,
            color,
            colorVariants,
            material,
            price,
            sellingPrice,
            vendorId: vendor._id,
            lastUpdated: new Date()
        })

        await product.save()

        vendor.analytics.totalProducts += 1
        await vendor.save()

        res.status(201).json({
            message: 'Product uploaded successfully',
            data: product,
            success: true,
            error: false
        })
    } catch (err) {
        res.status(400).json({
            message: err.message || err,
            data: [],
            error: true,
            success: false
        })
    }
}

const getVendorProducts = async (req, res) => {
    try {
        const vendor = await VendorModel.findOne({ userId: req.userId })
        
        if (!vendor) {
            return res.status(404).json({
                message: 'Vendor profile not found',
                error: true,
                success: false
            })
        }

        const { page = 1, limit = 20, search, category, status, sort } = req.query

        const query = { 'more_details.vendorId': vendor._id }

        if (search) {
            query.$or = [
                { productName: { $regex: search, $options: 'i' } },
                { brandName: { $regex: search, $options: 'i' } }
            ]
        }

        if (category) {
            query.category = category
        }

        if (status) {
            query.stock = status
        }

        let sortOption = { createdAt: -1 }
        if (sort === 'price_asc') sortOption = { sellingPrice: 1 }
        else if (sort === 'price_desc') sortOption = { sellingPrice: -1 }
        else if (sort === 'name_asc') sortOption = { productName: 1 }
        else if (sort === 'name_desc') sortOption = { productName: -1 }
        else if (sort === 'newest') sortOption = { createdAt: -1 }
        else if (sort === 'oldest') sortOption = { createdAt: 1 }

        const products = await productModel
            .find(query)
            .sort(sortOption)
            .skip((page - 1) * limit)
            .limit(parseInt(limit))

        const total = await productModel.countDocuments(query)

        res.status(200).json({
            message: 'Products fetched successfully',
            data: {
                products,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    pages: Math.ceil(total / limit)
                }
            },
            success: true,
            error: false
        })
    } catch (err) {
        res.status(400).json({
            message: err.message || err,
            data: [],
            error: true,
            success: false
        })
    }
}

const getVendorProductById = async (req, res) => {
    try {
        const vendor = await VendorModel.findOne({ userId: req.userId })
        
        if (!vendor) {
            return res.status(404).json({
                message: 'Vendor profile not found',
                error: true,
                success: false
            })
        }

        const product = await productModel.findOne({
            _id: req.params.id,
            'more_details.vendorId': vendor._id
        })

        if (!product) {
            return res.status(404).json({
                message: 'Product not found',
                error: true,
                success: false
            })
        }

        res.status(200).json({
            message: 'Product fetched successfully',
            data: product,
            success: true,
            error: false
        })
    } catch (err) {
        res.status(400).json({
            message: err.message || err,
            data: [],
            error: true,
            success: false
        })
    }
}

const updateVendorProduct = async (req, res) => {
    try {
        const vendor = await VendorModel.findOne({ userId: req.userId })
        
        if (!vendor) {
            return res.status(404).json({
                message: 'Vendor profile not found',
                error: true,
                success: false
            })
        }

        const product = await productModel.findOne({
            _id: req.params.id,
            'more_details.vendorId': vendor._id
        })

        if (!product) {
            return res.status(404).json({
                message: 'Product not found',
                error: true,
                success: false
            })
        }

        const allowedUpdates = [
            'productName',
            'brandName',
            'category',
            'productImage',
            'description',
            'unit',
            'discount',
            'stock',
            'quantity',
            'location',
            'more_details',
            'sizes',
            'gender',
            'color',
            'colorVariants',
            'material',
            'price',
            'sellingPrice'
        ]

        allowedUpdates.forEach(field => {
            if (req.body[field] !== undefined) {
                product[field] = req.body[field]
            }
        })

        product.lastUpdated = new Date()

        await product.save()

        res.status(200).json({
            message: 'Product updated successfully',
            data: product,
            success: true,
            error: false
        })
    } catch (err) {
        res.status(400).json({
            message: err.message || err,
            data: [],
            error: true,
            success: false
        })
    }
}

const deleteVendorProduct = async (req, res) => {
    try {
        const vendor = await VendorModel.findOne({ userId: req.userId })
        
        if (!vendor) {
            return res.status(404).json({
                message: 'Vendor profile not found',
                error: true,
                success: false
            })
        }

        const product = await productModel.findOneAndDelete({
            _id: req.params.id,
            'more_details.vendorId': vendor._id
        })

        if (!product) {
            return res.status(404).json({
                message: 'Product not found',
                error: true,
                success: false
            })
        }

        vendor.analytics.totalProducts = Math.max(0, vendor.analytics.totalProducts - 1)
        await vendor.save()

        res.status(200).json({
            message: 'Product deleted successfully',
            success: true,
            error: false
        })
    } catch (err) {
        res.status(400).json({
            message: err.message || err,
            data: [],
            error: true,
            success: false
        })
    }
}

const updateVendorInventory = async (req, res) => {
    try {
        const vendor = await VendorModel.findOne({ userId: req.userId })
        
        if (!vendor) {
            return res.status(404).json({
                message: 'Vendor profile not found',
                error: true,
                success: false
            })
        }

        const { productId, quantity, operation } = req.body

        const product = await productModel.findOne({
            _id: productId,
            'more_details.vendorId': vendor._id
        })

        if (!product) {
            return res.status(404).json({
                message: 'Product not found',
                error: true,
                success: false
            })
        }

        if (operation === 'add') {
            product.quantity += quantity
        } else if (operation === 'subtract') {
            product.quantity = Math.max(0, product.quantity - quantity)
        } else if (operation === 'set') {
            product.quantity = quantity
        }

        product.stock = product.quantity > 0 ? 'In Stock' : 'Out of Stock'
        product.lastUpdated = new Date()

        await product.save()

        res.status(200).json({
            message: 'Inventory updated successfully',
            data: product,
            success: true,
            error: false
        })
    } catch (err) {
        res.status(400).json({
            message: err.message || err,
            data: [],
            error: true,
            success: false
        })
    }
}

const bulkUpdateInventory = async (req, res) => {
    try {
        const vendor = await VendorModel.findOne({ userId: req.userId })
        
        if (!vendor) {
            return res.status(404).json({
                message: 'Vendor profile not found',
                error: true,
                success: false
            })
        }

        const { updates } = req.body

        if (!updates || !Array.isArray(updates)) {
            return res.status(400).json({
                message: 'Please provide updates array',
                error: true,
                success: false
            })
        }

        const results = await Promise.all(
            updates.map(async (update) => {
                try {
                    const product = await productModel.findOne({
                        _id: update.productId,
                        'more_details.vendorId': vendor._id
                    })

                    if (!product) {
                        return { productId: update.productId, success: false, message: 'Product not found' }
                    }

                    if (update.operation === 'add') {
                        product.quantity += update.quantity
                    } else if (update.operation === 'subtract') {
                        product.quantity = Math.max(0, product.quantity - update.quantity)
                    } else if (update.operation === 'set') {
                        product.quantity = update.quantity
                    }

                    product.stock = product.quantity > 0 ? 'In Stock' : 'Out of Stock'
                    product.lastUpdated = new Date()

                    await product.save()

                    return { productId: update.productId, success: true }
                } catch (error) {
                    return { productId: update.productId, success: false, message: error.message }
                }
            })
        )

        const successful = results.filter(r => r.success).length
        const failed = results.filter(r => !r.success).length

        res.status(200).json({
            message: `Inventory update completed: ${successful} successful, ${failed} failed`,
            data: results,
            success: true,
            error: false
        })
    } catch (err) {
        res.status(400).json({
            message: err.message || err,
            data: [],
            error: true,
            success: false
        })
    }
}

const getVendorProductAnalytics = async (req, res) => {
    try {
        const vendor = await VendorModel.findOne({ userId: req.userId })
        
        if (!vendor) {
            return res.status(404).json({
                message: 'Vendor profile not found',
                error: true,
                success: false
            })
        }

        const products = await productModel.find({ 'more_details.vendorId': vendor._id })

        const totalProducts = products.length
        const inStock = products.filter(p => p.stock === 'In Stock').length
        const outOfStock = products.filter(p => p.stock === 'Out of Stock').length
        const lowStock = products.filter(p => p.quantity > 0 && p.quantity <= 5).length

        const totalValue = products.reduce((sum, p) => sum + (p.sellingPrice * p.quantity), 0)

        const topProducts = products
            .sort((a, b) => (b.rating || 0) - (a.rating || 0))
            .slice(0, 10)
            .map(p => ({
                _id: p._id,
                productName: p.productName,
                sellingPrice: p.sellingPrice,
                quantity: p.quantity,
                rating: p.rating,
                productImage: p.productImage
            }))

        res.status(200).json({
            message: 'Product analytics fetched successfully',
            data: {
                totalProducts,
                inStock,
                outOfStock,
                lowStock,
                totalInventoryValue: totalValue,
                topProducts
            },
            success: true,
            error: false
        })
    } catch (err) {
        res.status(400).json({
            message: err.message || err,
            data: [],
            error: true,
            success: false
        })
    }
}

module.exports = {
    uploadVendorProduct,
    getVendorProducts,
    getVendorProductById,
    updateVendorProduct,
    deleteVendorProduct,
    updateVendorInventory,
    bulkUpdateInventory,
    getVendorProductAnalytics
}
