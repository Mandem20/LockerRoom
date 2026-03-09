import { useEffect, useState } from 'react'
import SummaryApi from '../common'
import displayCEDICurrency from '../helpers/displayCurrency'
import { useNavigate } from 'react-router-dom'
import VendorUploadProduct from '../components/VendorUploadProduct'
import VendorEditProduct from '../components/VendorEditProduct'
import productCategory from '../helpers/productCategory'
import genderType from '../helpers/genderType'
import stockAvailable from '../helpers/stockAvailable'

const ITEMS_PER_PAGE = 12

const VendorProducts = () => {
    const [products, setProducts] = useState([])
    const [filteredProducts, setFilteredProducts] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [pagination, setPagination] = useState({ page: 1, limit: ITEMS_PER_PAGE, total: 0, pages: 0 })
    const [filters, setFilters] = useState({ search: '', category: '', brand: '', gender: '', stock: '', inventory: '', sort: 'newest' })
    const [uniqueBrands, setUniqueBrands] = useState([])
    const [showUploadModal, setShowUploadModal] = useState(false)
    const [showEditModal, setShowEditModal] = useState(false)
    const [editingProduct, setEditingProduct] = useState(null)
    const [inventorySummary, setInventorySummary] = useState({ total: 0, inStock: 0, lowStock: 0, outOfStock: 0 })
    const navigate = useNavigate()

    useEffect(() => {
        fetchProducts()
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
                setFilteredProducts(data.data.products)
                setPagination(prev => ({ ...prev, ...data.data.pagination }))
                
                const brands = [...new Set(data.data.products.map(p => p.brandName).filter(Boolean))]
                setUniqueBrands(brands)
                
                const summary = {
                    total: data.data.pagination.total,
                    inStock: data.data.products.filter(p => p.stock === 'In Stock').length,
                    lowStock: data.data.products.filter(p => p.stock === 'Low Stock').length,
                    outOfStock: data.data.products.filter(p => p.stock === 'Out of Stock').length
                }
                setInventorySummary(summary)
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

    const handleDelete = async (productId) => {
        if (!window.confirm('Are you sure you want to delete this product?')) return
        
        try {
            const response = await fetch(SummaryApi.deleteVendorProduct.url.replace(':id', productId), {
                method: 'DELETE',
                credentials: 'include'
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

    const clearFilters = () => {
        setFilters({
            search: '',
            category: '',
            brand: '',
            gender: '',
            stock: '',
            inventory: '',
            sort: 'newest'
        })
    }

    const totalPages = Math.ceil(pagination.total / ITEMS_PER_PAGE)

    const goToPage = (page) => {
        if (page >= 1 && page <= totalPages) {
            setPagination(prev => ({ ...prev, page }))
        }
    }

    const handleEdit = (product) => {
        setEditingProduct(product)
        setShowEditModal(true)
    }

    return (
        <div className="vendor-products">
            {/* Header */}
            <div className="products-header">
                <div className="header-left">
                    <h2>My Products</h2>
                </div>
                <button className="btn-primary" onClick={() => setShowUploadModal(true)}>
                    + Add Product
                </button>
            </div>

            {/* Inventory Summary */}
            <div className="bg-white p-4 mb-4 rounded">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div className="bg-blue-50 p-3 rounded text-center">
                        <p className="text-2xl font-bold text-blue-600">{inventorySummary.total}</p>
                        <p className="text-sm text-gray-600">Total Products</p>
                    </div>
                    <div className="bg-green-50 p-3 rounded text-center">
                        <p className="text-2xl font-bold text-green-600">{inventorySummary.inStock}</p>
                        <p className="text-sm text-gray-600">In Stock</p>
                    </div>
                    <div className="bg-yellow-50 p-3 rounded text-center">
                        <p className="text-2xl font-bold text-yellow-600">{inventorySummary.lowStock}</p>
                        <p className="text-sm text-gray-600">Low Stock</p>
                    </div>
                    <div className="bg-red-50 p-3 rounded text-center">
                        <p className="text-2xl font-bold text-red-600">{inventorySummary.outOfStock}</p>
                        <p className="text-sm text-gray-600">Out of Stock</p>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 mb-4 rounded">
                <div className="flex flex-wrap gap-3 items-end">
                    <div className="flex-1 min-w-[150px]">
                        <label className="text-sm text-gray-600">Search</label>
                        <input
                            type="text"
                            name="search"
                            placeholder="Search by name or brand..."
                            value={filters.search}
                            onChange={(e) => handleFilterChange('search', e.target.value)}
                            className="w-full p-2 border rounded text-sm"
                        />
                    </div>

                    <div className="min-w-[150px]">
                        <label className="text-sm text-gray-600">Category</label>
                        <select
                            name="category"
                            value={filters.category}
                            onChange={(e) => handleFilterChange('category', e.target.value)}
                            className="w-full p-2 border rounded text-sm"
                        >
                            <option value="">All Categories</option>
                            {productCategory.map((el) => (
                                <option value={el.value} key={el.value}>{el.label}</option>
                            ))}
                        </select>
                    </div>

                    <div className="min-w-[150px]">
                        <label className="text-sm text-gray-600">Brand</label>
                        <select
                            name="brand"
                            value={filters.brand}
                            onChange={(e) => handleFilterChange('brand', e.target.value)}
                            className="w-full p-2 border rounded text-sm"
                        >
                            <option value="">All Brands</option>
                            {uniqueBrands.map((brand) => (
                                <option value={brand} key={brand}>{brand}</option>
                            ))}
                        </select>
                    </div>

                    <div className="min-w-[150px]">
                        <label className="text-sm text-gray-600">Gender</label>
                        <select
                            name="gender"
                            value={filters.gender}
                            onChange={(e) => handleFilterChange('gender', e.target.value)}
                            className="w-full p-2 border rounded text-sm"
                        >
                            <option value="">All Genders</option>
                            {genderType.map((el) => (
                                <option value={el.value} key={el.value}>{el.label}</option>
                            ))}
                        </select>
                    </div>

                    <div className="min-w-[150px]">
                        <label className="text-sm text-gray-600">Stock</label>
                        <select
                            name="stock"
                            value={filters.stock}
                            onChange={(e) => handleFilterChange('stock', e.target.value)}
                            className="w-full p-2 border rounded text-sm"
                        >
                            <option value="">All Stock</option>
                            {stockAvailable.map((el) => (
                                <option value={el.value} key={el.value}>{el.label}</option>
                            ))}
                        </select>
                    </div>

                    <div className="min-w-[150px]">
                        <label className="text-sm text-gray-600">Inventory</label>
                        <select
                            name="inventory"
                            value={filters.inventory}
                            onChange={(e) => handleFilterChange('inventory', e.target.value)}
                            className="w-full p-2 border rounded text-sm"
                        >
                            <option value="">All Inventory</option>
                            <option value="in-stock">In Stock</option>
                            <option value="low-stock">Low Stock</option>
                            <option value="out-of-stock">Out of Stock</option>
                        </select>
                    </div>

                    <div className="min-w-[150px]">
                        <label className="text-sm text-gray-600">Sort By</label>
                        <select
                            name="sort"
                            value={filters.sort}
                            onChange={(e) => handleFilterChange('sort', e.target.value)}
                            className="w-full p-2 border rounded text-sm"
                        >
                            <option value="newest">Newest First</option>
                            <option value="oldest">Oldest First</option>
                            <option value="price_asc">Price: Low to High</option>
                            <option value="price_desc">Price: High to Low</option>
                            <option value="name_asc">Name: A-Z</option>
                            <option value="name_desc">Name: Z-A</option>
                        </select>
                    </div>

                    <button
                        onClick={clearFilters}
                        className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded text-sm"
                    >
                        Clear Filters
                    </button>
                </div>

                <div className="mt-2 text-sm text-gray-500">
                    Showing {filteredProducts.length > 0 ? ((pagination.page - 1) * ITEMS_PER_PAGE) + 1 : 0}-{Math.min(pagination.page * ITEMS_PER_PAGE, pagination.total)} of {pagination.total} products
                </div>
            </div>

            {/* Products Table */}
            <div className="products-table-wrapper">
                {loading ? (
                    <div className="loading-container">
                        <div className="spinner"></div>
                    </div>
                ) : filteredProducts.length > 0 ? (
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
                            {filteredProducts.map(product => (
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
                                        <span className={`stock-badge ${product.stock === 'In Stock' ? 'in-stock' : product.stock === 'Low Stock' ? 'low-stock' : 'out-of-stock'}`}>
                                            {product.quantity} units ({product.stock})
                                        </span>
                                    </td>
                                    <td>
                                        <span className="rating">★ {product.rating || 0}</span>
                                    </td>
                                    <td>
                                        <div className="actions">
                                            <button 
                                                className="btn-edit"
                                                onClick={() => handleEdit(product)}
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
                        <button className="btn-primary" onClick={() => setShowUploadModal(true)}>
                            Add Your First Product
                        </button>
                    </div>
                )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="pagination">
                    <button 
                        disabled={pagination.page === 1}
                        onClick={() => goToPage(pagination.page - 1)}
                    >
                        Previous
                    </button>
                    
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                        <button
                            key={page}
                            onClick={() => goToPage(page)}
                            className={pagination.page === page ? 'active' : ''}
                        >
                            {page}
                        </button>
                    ))}
                    
                    <button 
                        disabled={pagination.page === totalPages}
                        onClick={() => goToPage(pagination.page + 1)}
                    >
                        Next
                    </button>
                </div>
            )}

            {/* Upload Modal */}
            {showUploadModal && (
                <VendorUploadProduct 
                    onClose={() => setShowUploadModal(false)}
                    fetchData={fetchProducts}
                />
            )}

            {/* Edit Modal */}
            {showEditModal && editingProduct && (
                <VendorEditProduct 
                    onClose={() => { setShowEditModal(false); setEditingProduct(null) }}
                    productData={editingProduct}
                    fetchData={fetchProducts}
                />
            )}
        </div>
    )
}

export default VendorProducts
