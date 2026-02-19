import React, { useEffect, useState } from 'react'
import UploadProduct from '../components/UploadProduct'
import SummaryApi from '../common'
import AdminProductCard from '../components/AdminProductCard'
import productCategory from '../helpers/productCategory'
import genderType from '../helpers/genderType'
import stockAvailable from '../helpers/stockAvailable'

const ITEMS_PER_PAGE = 12

const AllProducts = () => {
    const [openUploadProduct,setOpenUploadProduct] = useState(false)
    const [allProduct, setAllProduct] = useState([])
    const [filteredProduct, setFilteredProduct] = useState([])
    const [filters, setFilters] = useState({
        category: '',
        brand: '',
        gender: '',
        stock: '',
        search: '',
        inventory: ''
    })
    const [uniqueBrands, setUniqueBrands] = useState([])
    const [currentPage, setCurrentPage] = useState(1)
    const [inventorySummary, setInventorySummary] = useState({ total: 0, inStock: 0, lowStock: 0, outOfStock: 0 })

    const fetchAllProduct = async() => {
      const response = await fetch (SummaryApi.allProduct.url)
      const dataResponse = await response.json()
      console.log("product data",dataResponse)

      const products = dataResponse?.data || []
      setAllProduct(products)
      setFilteredProduct(products)
      
      const brands = [...new Set(products.map(p => p.brandName).filter(Boolean))]
      setUniqueBrands(brands)

      const summary = {
        total: products.length,
        inStock: products.filter(p => p.stock === 'In Stock').length,
        lowStock: products.filter(p => p.stock === 'Low Stock').length,
        outOfStock: products.filter(p => p.stock === 'Out of Stock').length
      }
      setInventorySummary(summary)
    }

    useEffect(() => {
      fetchAllProduct()
    },[])

    useEffect(() => {
        const searchTerm = filters.search?.toLowerCase().trim() || ''
        
        const result = allProduct.filter(p => {
            // Search filter
            if (searchTerm) {
                const productName = (p.productName || '').toLowerCase()
                const brandName = (p.brandName || '').toLowerCase()
                if (!productName.includes(searchTerm) && !brandName.includes(searchTerm)) {
                    return false
                }
            }

            // Category filter
            if (filters.category && p.category !== filters.category) {
                return false
            }

            // Brand filter
            if (filters.brand) {
                const brandMatch = (p.brandName || '').toLowerCase().includes(filters.brand.toLowerCase())
                if (!brandMatch) return false
            }

            // Gender filter
            if (filters.gender && p.gender !== filters.gender) {
                return false
            }

            // Stock filter
            if (filters.stock && p.stock !== filters.stock) {
                return false
            }

            // Inventory status filter
            if (filters.inventory) {
                if (filters.inventory === 'in-stock' && p.stock !== 'In Stock') return false
                if (filters.inventory === 'low-stock' && p.stock !== 'Low Stock') return false
                if (filters.inventory === 'out-of-stock' && p.stock !== 'Out of Stock') return false
            }

            return true
        })

        setFilteredProduct(result)
        setCurrentPage(1)

        const summary = {
            total: result.length,
            inStock: result.filter(p => p.stock === 'In Stock').length,
            lowStock: result.filter(p => p.stock === 'Low Stock').length,
            outOfStock: result.filter(p => p.stock === 'Out of Stock').length
        }
        setInventorySummary(summary)
    }, [filters, allProduct])

    const totalPages = Math.ceil(filteredProduct.length / ITEMS_PER_PAGE)
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
    const paginatedProducts = filteredProduct.slice(startIndex, startIndex + ITEMS_PER_PAGE)

    const goToPage = (page) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page)
        }
    }

    const handleFilterChange = (e) => {
        const { name, value } = e.target
        setFilters(prev => ({ ...prev, [name]: value }))
    }

    const clearFilters = () => {
        setFilters({
            category: '',
            brand: '',
            gender: '',
            stock: '',
            search: '',
            inventory: ''
        })
        const summary = {
            total: allProduct.length,
            inStock: allProduct.filter(p => p.stock === 'In Stock').length,
            lowStock: allProduct.filter(p => p.stock === 'Low Stock').length,
            outOfStock: allProduct.filter(p => p.stock === 'Out of Stock').length
        }
        setInventorySummary(summary)
    }

  return (
    <div>
       <div className='bg-white py-2 px-4 flex justify-between items-center'>
         <h2 className='font-bold text-lg'> All Products</h2>
         <button className='border-2 border-red-600 text-red-600 hover:bg-red-600 hover:text-white transition-all py-1 px-3 rounded-full' onClick={()=>setOpenUploadProduct(true)}>Upload Products</button>
      </div>

      <div className='bg-white p-4 mb-4 rounded'>
        <div className='grid grid-cols-2 md:grid-cols-4 gap-4 mb-4'>
            <div className='bg-blue-50 p-3 rounded text-center'>
                <p className='text-2xl font-bold text-blue-600'>{inventorySummary.total}</p>
                <p className='text-sm text-gray-600'>Total Products</p>
            </div>
            <div className='bg-green-50 p-3 rounded text-center'>
                <p className='text-2xl font-bold text-green-600'>{inventorySummary.inStock}</p>
                <p className='text-sm text-gray-600'>In Stock</p>
            </div>
            <div className='bg-yellow-50 p-3 rounded text-center'>
                <p className='text-2xl font-bold text-yellow-600'>{inventorySummary.lowStock}</p>
                <p className='text-sm text-gray-600'>Low Stock</p>
            </div>
             <div className='bg-red-50 p-3 rounded text-center'>
                <p className='text-2xl font-bold text-red-600'>{inventorySummary.outOfStock}</p>
                <p className='text-sm text-gray-600'>Out of Stock</p>
            </div>
        </div>

        <div className='flex flex-wrap gap-3 items-end mt-4'>
            <div className='flex-1 min-w-[150px]'>
                <label className='text-sm text-gray-600'>Search</label>
                <input
                    type='text'
                    name='search'
                    placeholder='Search by name or brand...'
                    value={filters.search || ''}
                    onChange={handleFilterChange}
                    className='w-full p-2 border rounded text-sm'
                />
            </div>

            <div className='min-w-[150px]'>
                <label className='text-sm text-gray-600'>Category</label>
                <select
                    name='category'
                    value={filters.category}
                    onChange={handleFilterChange}
                    className='w-full p-2 border rounded text-sm'
                >
                    <option value="">All Categories</option>
                    {productCategory.map((el) => (
                        <option value={el.value} key={el.value}>{el.label}</option>
                    ))}
                </select>
            </div>

            <div className='min-w-[150px]'>
                <label className='text-sm text-gray-600'>Brand</label>
                <select
                    name='brand'
                    value={filters.brand}
                    onChange={handleFilterChange}
                    className='w-full p-2 border rounded text-sm'
                >
                    <option value="">All Brands</option>
                    {uniqueBrands.map((brand) => (
                        <option value={brand} key={brand}>{brand}</option>
                    ))}
                </select>
            </div>

            <div className='min-w-[150px]'>
                <label className='text-sm text-gray-600'>Gender</label>
                <select
                    name='gender'
                    value={filters.gender}
                    onChange={handleFilterChange}
                    className='w-full p-2 border rounded text-sm'
                >
                    <option value="">All Genders</option>
                    {genderType.map((el) => (
                        <option value={el.value} key={el.value}>{el.label}</option>
                    ))}
                </select>
            </div>

            <div className='min-w-[150px]'>
                <label className='text-sm text-gray-600'>Stock</label>
                <select
                    name='stock'
                    value={filters.stock}
                    onChange={handleFilterChange}
                    className='w-full p-2 border rounded text-sm'
                >
                    <option value="">All Stock</option>
                    {stockAvailable.map((el) => (
                        <option value={el.value} key={el.value}>{el.label}</option>
                    ))}
                </select>
            </div>

            <div className='min-w-[150px]'>
                <label className='text-sm text-gray-600'>Inventory</label>
                <select
                    name='inventory'
                    value={filters.inventory}
                    onChange={handleFilterChange}
                    className='w-full p-2 border rounded text-sm'
                >
                    <option value="">All Inventory</option>
                    <option value="in-stock">In Stock</option>
                    <option value="low-stock">Low Stock</option>
                    <option value="out-of-stock">Out of Stock</option>
                </select>
            </div>

            <button
                onClick={clearFilters}
                className='px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded text-sm'
            >
                Clear Filters
            </button>
        </div>

        <div className='mt-2 text-sm text-gray-500'>
            Showing {startIndex + 1}-{Math.min(startIndex + ITEMS_PER_PAGE, filteredProduct.length)} of {filteredProduct.length} products
        </div>
      </div>


      {/**All product */}
    <div className='flex items-center flex-wrap gap-5 py-4 overflow-y-scroll'>
       {
        paginatedProducts.length > 0 ? (
            paginatedProducts.map((product,index)=>{
              return(
                <AdminProductCard data={product} key={index+"allProduct"} fetchdata={fetchAllProduct}/>
              )
            })
        ) : (
            <div className='w-full py-10 text-center text-gray-500'>
                No products found matching your filters
            </div>
        )
       }
    </div>

    {totalPages > 1 && (
        <div className='flex justify-center items-center gap-2 py-4'>
            <button
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
                className='px-3 py-1 border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100'
            >
                Previous
            </button>
            
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                    key={page}
                    onClick={() => goToPage(page)}
                    className={`px-3 py-1 border rounded ${
                        currentPage === page 
                            ? 'bg-red-600 text-white' 
                            : 'hover:bg-gray-100'
                    }`}
                >
                    {page}
                </button>
            ))}
            
            <button
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className='px-3 py-1 border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100'
            >
                Next
            </button>
        </div>
    )}


      { /**Upload Product Component */}
       
       {
        openUploadProduct && (
             <UploadProduct onClose={()=>setOpenUploadProduct(false)} fetchData={fetchAllProduct}/>
        )
       }
      
    </div>
  )
}

export default AllProducts
