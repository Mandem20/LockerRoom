import React, { useEffect, useState } from 'react'
import SummaryApi from '../common'
import { toast } from 'react-toastify'
import { FaSearch, FaFilter, FaEye, FaTrash, FaBox, FaStore, FaDollarSign, FaShoppingBag, FaChartBar, FaTimes, FaCheck, FaExclamationTriangle } from 'react-icons/fa'
import displayCEDICurrency from '../helpers/displayCurrency'
import './VendorPages.css'

const VendorProductManagement = () => {
    const [products, setProducts] = useState([])
    const [vendors, setVendors] = useState([])
    const [categories, setCategories] = useState([])
    const [loading, setLoading] = useState(true)
    const [showViewModal, setShowViewModal] = useState(false)
    const [selectedProduct, setSelectedProduct] = useState(null)
    const [filterVendor, setFilterVendor] = useState('')
    const [filterCategory, setFilterCategory] = useState('')
    const [filterStatus, setFilterStatus] = useState('')
    const [searchTerm, setSearchTerm] = useState('')
    const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 })
    const [stats, setStats] = useState({ total: 0, inStock: 0, outOfStock: 0 })

    const fetchProducts = async (page = 1) => {
        setLoading(true)
        try {
            let url = `${SummaryApi.getAllVendorProducts.url}?page=${page}&limit=20`
            if (filterVendor) url += `&vendorId=${filterVendor}`
            if (filterCategory) url += `&category=${filterCategory}`
            if (filterStatus) url += `&status=${filterStatus}`
            if (searchTerm) url += `&search=${searchTerm}`
            
            const fetchData = await fetch(url, {
                method: SummaryApi.getAllVendorProducts.method,
                credentials: 'include'
            })

            const dataResponse = await fetchData.json()

            if (dataResponse.success) {
                setProducts(dataResponse.data?.products || [])
                setVendors(dataResponse.data?.vendors || [])
                setCategories(dataResponse.data?.categories || [])
                setPagination(dataResponse.data?.pagination || { page: 1, pages: 1, total: 0 })
                
                const total = dataResponse.data?.pagination?.total || 0
                const inStock = dataResponse.data?.products?.filter(p => p.quantity > 0).length || 0
                const outOfStock = total - inStock
                setStats({ total, inStock, outOfStock })
            } else {
                toast.error(dataResponse.message || 'Failed to fetch products')
            }
        } catch (error) {
            toast.error('Failed to fetch products')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchProducts()
    }, [filterVendor, filterCategory, filterStatus])

    useEffect(() => {
        const delaySearch = setTimeout(() => {
            fetchProducts(1)
        }, 500)
        return () => clearTimeout(delaySearch)
    }, [searchTerm])

    const handleViewProduct = (product) => {
        setSelectedProduct(product)
        setShowViewModal(true)
    }

    const handleDeleteProduct = async (product) => {
        if (!window.confirm(`Are you sure you want to delete "${product.productName}"? This action cannot be undone.`)) {
            return
        }

        try {
            const response = await fetch(
                `${SummaryApi.deleteAdminVendorProduct.url.replace(':id', product._id)}`,
                {
                    method: SummaryApi.deleteAdminVendorProduct.method,
                    credentials: 'include'
                }
            )

            const dataResponse = await response.json()

            if (dataResponse.success) {
                toast.success('Product deleted successfully')
                fetchProducts(pagination.page)
            } else {
                toast.error(dataResponse.message || 'Failed to delete product')
            }
        } catch (error) {
            toast.error('Failed to delete product')
        }
    }

    const formatCurrency = (amount) => {
        return displayCEDICurrency(amount || 0)
    }

    const getStockStatus = (quantity) => {
        if (!quantity || quantity <= 0) return { label: 'Out of Stock', class: 'danger' }
        if (quantity <= 10) return { label: 'Low Stock', class: 'warning' }
        return { label: 'In Stock', class: 'success' }
    }

    return (
        <div className="vpm-container">
            <div className="vpm-header">
                <div className="vpm-header-left">
                    <h1><FaBox className="header-icon" /> Vendor Products</h1>
                    <p>Manage and monitor products from all vendors</p>
                </div>
            </div>

            <div className="vpm-stats-grid">
                <div className="vpm-stat-card total">
                    <div className="vpm-stat-icon"><FaBox /></div>
                    <div className="vpm-stat-info">
                        <span className="vpm-stat-value">{stats.total}</span>
                        <span className="vpm-stat-label">Total Products</span>
                    </div>
                </div>
                <div className="vpm-stat-card instock">
                    <div className="vpm-stat-icon"><FaCheck /></div>
                    <div className="vpm-stat-info">
                        <span className="vpm-stat-value">{stats.inStock}</span>
                        <span className="vpm-stat-label">In Stock</span>
                    </div>
                </div>
                <div className="vpm-stat-card outofstock">
                    <div className="vpm-stat-icon"><FaExclamationTriangle /></div>
                    <div className="vpm-stat-info">
                        <span className="vpm-stat-value">{stats.outOfStock}</span>
                        <span className="vpm-stat-label">Out of Stock</span>
                    </div>
                </div>
                <div className="vpm-stat-card vendors">
                    <div className="vpm-stat-icon"><FaStore /></div>
                    <div className="vpm-stat-info">
                        <span className="vpm-stat-value">{vendors.length}</span>
                        <span className="vpm-stat-label">Active Vendors</span>
                    </div>
                </div>
            </div>

            <div className="vpm-content-card">
                <div className="vpm-toolbar">
                    <div className="vpm-search-wrapper">
                        <FaSearch className="search-icon" />
                        <input 
                            type="text" 
                            placeholder="Search products by name or brand..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="vpm-search-input"
                        />
                    </div>
                    <div className="vpm-toolbar-actions">
                        <div className="vpm-filter-group">
                            <FaStore className="filter-icon" />
                            <select 
                                value={filterVendor} 
                                onChange={(e) => setFilterVendor(e.target.value)}
                                className="vpm-filter-select"
                            >
                                <option value="">All Vendors</option>
                                {vendors.map(v => (
                                    <option key={v._id} value={v._id}>{v.businessName}</option>
                                ))}
                            </select>
                        </div>
                        <div className="vpm-filter-group">
                            <FaFilter className="filter-icon" />
                            <select 
                                value={filterCategory} 
                                onChange={(e) => setFilterCategory(e.target.value)}
                                className="vpm-filter-select"
                            >
                                <option value="">All Categories</option>
                                {categories.map(c => (
                                    <option key={c} value={c}>{c}</option>
                                ))}
                            </select>
                        </div>
                        <div className="vpm-filter-group">
                            <FaBox className="filter-icon" />
                            <select 
                                value={filterStatus} 
                                onChange={(e) => setFilterStatus(e.target.value)}
                                className="vpm-filter-select"
                            >
                                <option value="">All Stock</option>
                                <option value="in_stock">In Stock</option>
                                <option value="out_of_stock">Out of Stock</option>
                            </select>
                        </div>
                        <span className="vpm-result-count">{pagination.total} products</span>
                    </div>
                </div>

                <div className="vpm-table-wrapper">
                    {loading ? (
                        <div className="vpm-loading">
                            <div className="vpm-spinner"></div>
                        </div>
                    ) : products.length > 0 ? (
                        <table className="vpm-table">
                            <thead>
                                <tr>
                                    <th>Product</th>
                                    <th>Vendor</th>
                                    <th>Category</th>
                                    <th>Price</th>
                                    <th>Stock</th>
                                    <th>Status</th>
                                    <th>Added</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {products.map((product) => {
                                    const stockStatus = getStockStatus(product.quantity)
                                    return (
                                        <tr key={product._id}>
                                            <td>
                                                <div className="vpm-product-cell">
                                                    <div className="vpm-product-image">
                                                        {product.productImage?.[0] ? (
                                                            <img src={product.productImage[0]} alt={product.productName} />
                                                        ) : (
                                                            <FaBox />
                                                        )}
                                                    </div>
                                                    <div className="vpm-product-info">
                                                        <span className="vpm-product-name">{product.productName}</span>
                                                        <span className="vpm-product-brand">{product.brandName}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <div className="vpm-vendor-cell">
                                                    <span className="vpm-vendor-name">{product.vendor?.businessName || 'N/A'}</span>
                                                </div>
                                            </td>
                                            <td>
                                                <span className="vpm-category">{product.category}</span>
                                            </td>
                                            <td>
                                                <div className="vpm-price-cell">
                                                    <span className="vpm-price">{formatCurrency(product.sellingPrice || product.price)}</span>
                                                    {(product.price !== product.sellingPrice) && (
                                                        <span className="vpm-original-price">{formatCurrency(product.price)}</span>
                                                    )}
                                                </div>
                                            </td>
                                            <td>
                                                <span className={`vpm-stock ${stockStatus.class}`}>{product.quantity || 0}</span>
                                            </td>
                                            <td>
                                                <span className={`vpm-status-badge ${stockStatus.class}`}>
                                                    {stockStatus.label}
                                                </span>
                                            </td>
                                            <td>
                                                <span className="vpm-date">
                                                    {new Date(product.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                </span>
                                            </td>
                                            <td>
                                                <div className="vpm-actions">
                                                    <button 
                                                        className="vpm-action-btn view" 
                                                        title="View Details"
                                                        onClick={() => handleViewProduct(product)}
                                                    >
                                                        <FaEye />
                                                    </button>
                                                    <button 
                                                        className="vpm-action-btn delete" 
                                                        title="Delete"
                                                        onClick={() => handleDeleteProduct(product)}
                                                    >
                                                        <FaTrash />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    ) : (
                        <div className="vpm-empty">
                            <FaBox className="empty-icon" />
                            <h3>No products found</h3>
                            <p>Try adjusting your search or filter criteria</p>
                        </div>
                    )}
                </div>

                {pagination.pages > 1 && (
                    <div className="vpm-pagination">
                        <button 
                            disabled={pagination.page === 1}
                            onClick={() => fetchProducts(pagination.page - 1)}
                            className="vpm-pagination-btn"
                        >
                            Previous
                        </button>
                        <div className="vpm-pagination-info">
                            <span className="vpm-pagination-current">{pagination.page}</span>
                            <span className="vpm-pagination-separator">of</span>
                            <span className="vpm-pagination-total">{pagination.pages}</span>
                        </div>
                        <button 
                            disabled={pagination.page === pagination.pages}
                            onClick={() => fetchProducts(pagination.page + 1)}
                            className="vpm-pagination-btn"
                        >
                            Next
                        </button>
                    </div>
                )}
            </div>

            {showViewModal && selectedProduct && (
                <div className="vpm-modal-overlay" onClick={() => setShowViewModal(false)}>
                    <div className="vpm-modal" onClick={e => e.stopPropagation()}>
                        <div className="vpm-modal-header">
                            <h2>Product Details</h2>
                            <button className="vpm-modal-close" onClick={() => setShowViewModal(false)}>×</button>
                        </div>
                        
                        <div className="vpm-modal-body">
                            <div className="vpm-product-detail-grid">
                                <div className="vpm-product-detail-image">
                                    {selectedProduct.productImage?.[0] ? (
                                        <img src={selectedProduct.productImage[0]} alt={selectedProduct.productName} />
                                    ) : (
                                        <div className="vpm-no-image"><FaBox /></div>
                                    )}
                                </div>
                                <div className="vpm-product-detail-info">
                                    <h3>{selectedProduct.productName}</h3>
                                    <p className="vpm-brand">{selectedProduct.brandName}</p>
                                    
                                    <div className="vpm-detail-row">
                                        <span className="vpm-detail-label">Vendor</span>
                                        <span className="vpm-detail-value">{selectedProduct.vendor?.businessName || 'N/A'}</span>
                                    </div>
                                    <div className="vpm-detail-row">
                                        <span className="vpm-detail-label">Category</span>
                                        <span className="vpm-detail-value">{selectedProduct.category}</span>
                                    </div>
                                    <div className="vpm-detail-row">
                                        <span className="vpm-detail-label">Price</span>
                                        <span className="vpm-detail-value price">{formatCurrency(selectedProduct.sellingPrice || selectedProduct.price)}</span>
                                    </div>
                                    <div className="vpm-detail-row">
                                        <span className="vpm-detail-label">Stock</span>
                                        <span className={`vpm-detail-value stock ${getStockStatus(selectedProduct.quantity).class}`}>
                                            {selectedProduct.quantity || 0} units
                                        </span>
                                    </div>
                                    <div className="vpm-detail-row">
                                        <span className="vpm-detail-label">Status</span>
                                        <span className={`vpm-status-badge ${getStockStatus(selectedProduct.quantity).class}`}>
                                            {getStockStatus(selectedProduct.quantity).label}
                                        </span>
                                    </div>
                                    <div className="vpm-detail-row">
                                        <span className="vpm-detail-label">Added</span>
                                        <span className="vpm-detail-value">
                                            {new Date(selectedProduct.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default VendorProductManagement
