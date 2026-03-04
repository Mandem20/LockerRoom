import { useEffect, useState } from 'react'
import SummaryApi from '../common'
import displayCEDICurrency from '../helpers/displayCurrency'
import { useNavigate } from 'react-router-dom'

const VendorProducts = () => {
    const [products, setProducts] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, pages: 0 })
    const [filters, setFilters] = useState({ search: '', category: '', status: '', sort: 'newest' })
    const [showModal, setShowModal] = useState(false)
    const [editingProduct, setEditingProduct] = useState(null)
    const [categories, setCategories] = useState([])
    const navigate = useNavigate()

    useEffect(() => {
        fetchProducts()
        fetchCategories()
    }, [pagination.page, filters])

    const fetchProducts = async () => {
        setLoading(true)
        try {
            const params = new URLSearchParams({
                page: pagination.page,
                limit: pagination.limit,
                ...filters
            })
            
            const response = await fetch(`${SummaryApi.vendorProducts.url}?${params}`, {
                method: SummaryApi.vendorProducts.method,
                credentials: 'include'
            })
            const data = await response.json()
            
            if (data.success) {
                setProducts(data.data.products)
                setPagination(prev => ({ ...prev, ...data.data.pagination }))
            } else if (data.message === 'Please login first') {
                navigate('/login')
            } else {
                setError(data.message)
            }
        } catch (error) {
            console.error('Error fetching products:', error)
            setError('Failed to load products')
        } finally {
            setLoading(false)
        }
    }

    const fetchCategories = async () => {
        try {
            const response = await fetch(SummaryApi.getCategories.url, {
                method: SummaryApi.getCategories.method
            })
            const data = await response.json()
            if (data.success) {
                setCategories(data.data)
            }
        } catch (error) {
            console.error('Error fetching categories:', error)
        }
    }

    const handleDelete = async (productId) => {
        if (!window.confirm('Are you sure you want to delete this product?')) return
        
        try {
            const response = await fetch(SummaryApi.deleteVendorProduct.url, {
                method: 'DELETE',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ productId })
            })
            const data = await response.json()
            
            if (data.success) {
                fetchProducts()
            } else {
                alert(data.message)
            }
        } catch (error) {
            console.error('Error deleting product:', error)
        }
    }

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }))
        setPagination(prev => ({ ...prev, page: 1 }))
    }

    return (
        <div className="vendor-products">
            {/* Header */}
            <div className="products-header">
                <div className="header-left">
                    <h2>My Products</h2>
                    <span className="product-count">{pagination.total} products</span>
                </div>
                <button className="btn-primary" onClick={() => { setEditingProduct(null); setShowModal(true) }}>
                    + Add Product
                </button>
            </div>

            {/* Filters */}
            <div className="products-filters">
                <div className="search-box">
                    <span>🔍</span>
                    <input 
                        type="text" 
                        placeholder="Search products..."
                        value={filters.search}
                        onChange={(e) => handleFilterChange('search', e.target.value)}
                    />
                </div>
                <select 
                    value={filters.category}
                    onChange={(e) => handleFilterChange('category', e.target.value)}
                >
                    <option value="">All Categories</option>
                    {categories.map(cat => (
                        <option key={cat._id} value={cat.category}>{cat.category}</option>
                    ))}
                </select>
                <select 
                    value={filters.status}
                    onChange={(e) => handleFilterChange('status', e.target.value)}
                >
                    <option value="">All Status</option>
                    <option value="In Stock">In Stock</option>
                    <option value="Out of Stock">Out of Stock</option>
                </select>
                <select 
                    value={filters.sort}
                    onChange={(e) => handleFilterChange('sort', e.target.value)}
                >
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                    <option value="price_asc">Price: Low to High</option>
                    <option value="price_desc">Price: High to Low</option>
                    <option value="name_asc">Name: A-Z</option>
                    <option value="name_desc">Name: Z-A</option>
                </select>
            </div>

            {/* Products Table */}
            <div className="products-table-wrapper">
                {loading ? (
                    <div className="loading-container">
                        <div className="spinner"></div>
                    </div>
                ) : products.length > 0 ? (
                    <table className="products-table">
                        <thead>
                            <tr>
                                <th>Product</th>
                                <th>Category</th>
                                <th>Price</th>
                                <th>Stock</th>
                                <th>Rating</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {products.map(product => (
                                <tr key={product._id}>
                                    <td>
                                        <div className="product-cell">
                                            <div className="product-image">
                                                {product.productImage?.[0] ? (
                                                    <img src={product.productImage[0]} alt={product.productName} />
                                                ) : (
                                                    <span>📦</span>
                                                )}
                                            </div>
                                            <div className="product-info">
                                                <span className="product-name">{product.productName}</span>
                                                <span className="product-brand">{product.brandName}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td>{product.category}</td>
                                    <td>
                                        <div className="price-cell">
                                            <span className="selling-price">{displayCEDICurrency(product.sellingPrice)}</span>
                                            {product.discount && (
                                                <span className="original-price">{displayCEDICurrency(product.price)}</span>
                                            )}
                                        </div>
                                    </td>
                                    <td>
                                        <span className={`stock-badge ${product.stock === 'In Stock' ? 'in-stock' : 'out-of-stock'}`}>
                                            {product.quantity} units
                                        </span>
                                    </td>
                                    <td>
                                        <span className="rating">★ {product.rating || 0}</span>
                                    </td>
                                    <td>
                                        <div className="actions">
                                            <button 
                                                className="btn-edit"
                                                onClick={() => { setEditingProduct(product); setShowModal(true) }}
                                            >
                                                ✏️ Edit
                                            </button>
                                            <button 
                                                className="btn-delete"
                                                onClick={() => handleDelete(product._id)}
                                            >
                                                🗑️ Delete
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <div className="empty-state">
                        <span>📦</span>
                        <h3>No products found</h3>
                        <p>Start adding products to your store</p>
                        <button className="btn-primary" onClick={() => setShowModal(true)}>
                            Add Your First Product
                        </button>
                    </div>
                )}
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
                <div className="pagination">
                    <button 
                        disabled={pagination.page === 1}
                        onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                    >
                        Previous
                    </button>
                    <span>Page {pagination.page} of {pagination.pages}</span>
                    <button 
                        disabled={pagination.page === pagination.pages}
                        onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                    >
                        Next
                    </button>
                </div>
            )}

            {/* Product Modal */}
            {showModal && (
                <ProductModal 
                    product={editingProduct}
                    categories={categories}
                    onClose={() => setShowModal(false)}
                    onSave={() => { setShowModal(false); fetchProducts() }}
                />
            )}
        </div>
    )
}

const ProductModal = ({ product, categories, onClose, onSave }) => {
    const [formData, setFormData] = useState({
        productName: product?.productName || '',
        brandName: product?.brandName || '',
        category: product?.category || '',
        description: product?.description || '',
        price: product?.price || '',
        sellingPrice: product?.sellingPrice || '',
        quantity: product?.quantity || 0,
        stock: product?.stock || 'In Stock',
        discount: product?.discount || null,
        productImage: product?.productImage || [],
        sizes: product?.sizes || [],
        color: product?.color || '',
        gender: product?.gender || '',
        material: product?.material || ''
    })
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)

        try {
            const url = product 
                ? `${SummaryApi.updateVendorProduct.url}/${product._id}`
                : SummaryApi.uploadVendorProduct.url
            
            const method = product ? 'PUT' : 'POST'

            const response = await fetch(url, {
                method,
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            })
            
            const data = await response.json()
            
            if (data.success) {
                onSave()
            } else {
                alert(data.message)
            }
        } catch (error) {
            console.error('Error saving product:', error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>{product ? 'Edit Product' : 'Add New Product'}</h2>
                    <button className="close-btn" onClick={onClose}>×</button>
                </div>
                <form onSubmit={handleSubmit} className="product-form">
                    <div className="form-grid">
                        <div className="form-group">
                            <label>Product Name *</label>
                            <input 
                                type="text"
                                value={formData.productName}
                                onChange={e => setFormData({...formData, productName: e.target.value})}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Brand Name</label>
                            <input 
                                type="text"
                                value={formData.brandName}
                                onChange={e => setFormData({...formData, brandName: e.target.value})}
                            />
                        </div>
                        <div className="form-group">
                            <label>Category *</label>
                            <select 
                                value={formData.category}
                                onChange={e => setFormData({...formData, category: e.target.value})}
                                required
                            >
                                <option value="">Select Category</option>
                                {categories.map(cat => (
                                    <option key={cat._id} value={cat.category}>{cat.category}</option>
                                ))}
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Price *</label>
                            <input 
                                type="number"
                                value={formData.price}
                                onChange={e => setFormData({...formData, price: Number(e.target.value)})}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Selling Price *</label>
                            <input 
                                type="number"
                                value={formData.sellingPrice}
                                onChange={e => setFormData({...formData, sellingPrice: Number(e.target.value)})}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Quantity</label>
                            <input 
                                type="number"
                                value={formData.quantity}
                                onChange={e => setFormData({...formData, quantity: Number(e.target.value)})}
                            />
                        </div>
                        <div className="form-group">
                            <label>Discount (%)</label>
                            <input 
                                type="number"
                                value={formData.discount || ''}
                                onChange={e => setFormData({...formData, discount: e.target.value ? Number(e.target.value) : null})}
                            />
                        </div>
                        <div className="form-group">
                            <label>Color</label>
                            <input 
                                type="text"
                                value={formData.color}
                                onChange={e => setFormData({...formData, color: e.target.value})}
                            />
                        </div>
                        <div className="form-group">
                            <label>Gender</label>
                            <select 
                                value={formData.gender}
                                onChange={e => setFormData({...formData, gender: e.target.value})}
                            >
                                <option value="">Select Gender</option>
                                <option value="Men">Men</option>
                                <option value="Women">Women</option>
                                <option value="Unisex">Unisex</option>
                                <option value="Kids">Kids</option>
                            </select>
                        </div>
                        <div className="form-group full-width">
                            <label>Description</label>
                            <textarea 
                                value={formData.description}
                                onChange={e => setFormData({...formData, description: e.target.value})}
                                rows="4"
                            />
                        </div>
                        <div className="form-group full-width">
                            <label>Image URLs (comma separated)</label>
                            <input 
                                type="text"
                                value={formData.productImage.join(', ')}
                                onChange={e => setFormData({
                                    ...formData, 
                                    productImage: e.target.value.split(',').map(url => url.trim()).filter(Boolean)
                                })}
                                placeholder="https://example.com/image1.jpg, https://example.com/image2.jpg"
                            />
                        </div>
                    </div>
                    <div className="form-actions">
                        <button type="button" className="btn-secondary" onClick={onClose}>
                            Cancel
                        </button>
                        <button type="submit" className="btn-primary" disabled={loading}>
                            {loading ? 'Saving...' : (product ? 'Update Product' : 'Add Product')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default VendorProducts
