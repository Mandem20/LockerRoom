import React, { useState, useEffect, useCallback } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { FaFilter, FaTimes } from 'react-icons/fa'
import fetchCategories from '../helpers/fetchCategories'
import brandCategory from '../helpers/brandCategory'
import genderType from '../helpers/genderType'
import VerticalCard from '../components/VerticalCard'
import SummaryApi from '../common'

const CategoryProduct = () => {
    const [data, setData] = useState([])
    const [loading, setLoading] = useState(true)
    const [totalPages, setTotalPages] = useState(0)
    const [currentPage, setCurrentPage] = useState(1)
    const [categories, setCategories] = useState([])
    const [showMobileFilters, setShowMobileFilters] = useState(false)
    const navigate = useNavigate()
    const location = useLocation()
    
    const [selectedCategories, setSelectedCategories] = useState([])
    const [selectedBrands, setSelectedBrands] = useState([])
    const [selectedGenders, setSelectedGenders] = useState([])
    const [sortBy, setSortBy] = useState("newest")

    useEffect(() => {
        fetchCategories().then(setCategories)
    }, [])

    const fetchData = useCallback(async (page = 1) => {
        const urlSearch = new URLSearchParams(location.search)
        const categoryParams = urlSearch.getAll("category")
        const brandParams = urlSearch.getAll("brand")
        const genderParams = urlSearch.getAll("gender")

        try {
            setLoading(true)
            const response = await fetch(SummaryApi.filterProduct.url, {
                method: SummaryApi.filterProduct.method,
                headers: {
                    "content-type": "application/json"
                },
                body: JSON.stringify({
                    category: categoryParams,
                    brand: brandParams,
                    gender: genderParams,
                    sortBy: sortBy,
                    page: page,
                    limit: 12
                })
            })

            const dataResponse = await response.json()
            setData(dataResponse?.data || [])
            setTotalPages(dataResponse?.totalPages || 0)
            setCurrentPage(dataResponse?.currentPage || 1)
        } catch (error) {
            console.error("Filter error:", error)
        } finally {
            setLoading(false)
        }
    }, [location.search, sortBy])

    useEffect(() => {
        fetchData(1)
    }, [fetchData])

    const updateUrl = (categories, brands, genders) => {
        const params = new URLSearchParams()
        
        categories.forEach(cat => {
            params.append("category", cat)
        })
        
        brands.forEach(brand => {
            params.append("brand", brand)
        })
        
        genders.forEach(gender => {
            params.append("gender", gender)
        })
        
        const queryString = params.toString()
        navigate(`/product-category${queryString ? '?' + queryString : ''}`)
    }

    const handleCategoryChange = (value, checked) => {
        let newCategories
        if (checked) {
            newCategories = [...selectedCategories, value]
        } else {
            newCategories = selectedCategories.filter(item => item !== value)
        }
        setSelectedCategories(newCategories)
        updateUrl(newCategories, selectedBrands, selectedGenders)
    }

    const handleBrandChange = (value, checked) => {
        let newBrands
        if (checked) {
            newBrands = [...selectedBrands, value]
        } else {
            newBrands = selectedBrands.filter(item => item !== value)
        }
        setSelectedBrands(newBrands)
        updateUrl(selectedCategories, newBrands, selectedGenders)
    }

    const handleGenderChange = (value, checked) => {
        let newGenders
        if (checked) {
            newGenders = [...selectedGenders, value]
        } else {
            newGenders = selectedGenders.filter(item => item !== value)
        }
        setSelectedGenders(newGenders)
        updateUrl(selectedCategories, selectedBrands, newGenders)
    }

    const handleSortChange = (e) => {
        setSortBy(e.target.value)
    }

    const handlePageChange = (page) => {
        if (page >= 1 && page <= totalPages) {
            fetchData(page)
            window.scrollTo({ top: 0, behavior: "smooth" })
        }
    }

    const clearAllFilters = () => {
        setSelectedCategories([])
        setSelectedBrands([])
        setSelectedGenders([])
        setSortBy("newest")
        navigate("/product-category")
    }

    useEffect(() => {
        const urlSearch = new URLSearchParams(location.search)
        setSelectedCategories(urlSearch.getAll("category"))
        setSelectedBrands(urlSearch.getAll("brand"))
        setSelectedGenders(urlSearch.getAll("gender"))
    }, [location.search])

    const hasActiveFilters = selectedCategories.length > 0 || selectedBrands.length > 0 || selectedGenders.length > 0

    const FilterPanel = ({ onClose }) => (
        <div className='bg-white p-4 min-h-screen lg:min-h-[calc(100vh-120px)] overflow-y-scroll'>
            {hasActiveFilters && (
                <button 
                    onClick={() => { clearAllFilters(); onClose?.(); }}
                    className='text-sm text-red-600 hover:underline mb-2'
                >
                    Clear All Filters
                </button>
            )}

            <div className=''>
                <h3 className='text-base uppercase font-medium text-slate-500 border-b pb-1 border-slate-300'>Sort by</h3>
                <select 
                    value={sortBy} 
                    onChange={handleSortChange}
                    className='w-full mt-2 p-2 text-sm border rounded'
                >
                    <option value="newest">Newest</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                    <option value="name-asc">Name: A-Z</option>
                    <option value="name-desc">Name: Z-A</option>
                </select>
            </div>

            <div className=''>
                <h3 className='text-base uppercase font-medium text-slate-500 border-b pb-1 border-slate-300 mt-4'>Category</h3>
                <form className='text-sm flex flex-col gap-2 py-2'>
                    {categories.map((categoryName, index) => (
                        <div className='flex items-center gap-3' key={"cat_" + index}>
                            <input 
                                type='checkbox' 
                                name="category" 
                                checked={selectedCategories.includes(categoryName?.value)} 
                                value={categoryName?.value}  
                                id={"cat_m_" + categoryName?.value} 
                                onChange={(e) => handleCategoryChange(e.target.value, e.target.checked)}
                            />
                            <label htmlFor={"cat_m_" + categoryName?.value}>{categoryName?.label}</label>
                        </div>
                    ))}
                </form>
            </div>

            <div className=''>
                <h3 className='text-base uppercase font-medium text-slate-500 border-b pb-1 border-slate-300 mt-4'>Brand</h3>
                <form className='text-sm flex flex-col gap-2 py-2'>
                    {brandCategory.map((brandName, index) => (
                        <div className='flex items-center gap-3' key={"brand_" + index}>
                            <input 
                                type='checkbox' 
                                name="brand" 
                                checked={selectedBrands.includes(brandName?.value)} 
                                value={brandName?.value} 
                                id={"brand_m_" + brandName?.value} 
                                onChange={(e) => handleBrandChange(e.target.value, e.target.checked)}
                            />
                            <label htmlFor={"brand_m_" + brandName?.value}>{brandName?.label}</label>
                        </div>
                    ))}
                </form>
            </div>

            <div className=''>
                <h3 className='text-base uppercase font-medium text-slate-500 border-b pb-1 border-slate-300 mt-4'>Gender</h3>
                <form className='text-sm flex flex-col gap-2 py-2'>
                    {genderType.map((genderItem, index) => (
                        <div className='flex items-center gap-3' key={"gender_" + index}>
                            <input 
                                type='checkbox' 
                                name="gender" 
                                checked={selectedGenders.includes(genderItem?.value)} 
                                value={genderItem?.value} 
                                id={"gender_m_" + genderItem?.value} 
                                onChange={(e) => handleGenderChange(e.target.value, e.target.checked)}
                            />
                            <label htmlFor={"gender_m_" + genderItem?.value}>{genderItem?.label}</label>
                        </div>
                    ))}
                </form>
            </div>
        </div>
    )

    const ProductSection = () => (
        <div className='px-0 lg:px-4'>
            <div className='flex items-center justify-between mb-2'>
                <p className='font-medium text-slate-800 text-lg'>
                    Results : {data.length}
                </p>
                <button 
                    onClick={() => setShowMobileFilters(true)}
                    className='lg:hidden flex items-center gap-2 px-3 py-2 bg-red-600 text-white rounded text-sm'
                >
                    <FaFilter /> Filters
                </button>
            </div>
            <div className='min-h-[50vh] lg:min-h-[calc(100vh-120px)] overflow-y-auto'>
                {loading ? (
                    <p className="text-lg text-center">Loading...</p>
                ) : data.length !== 0 ? (
                    <VerticalCard data={data} loading={loading} />
                ) : (
                    <p className="text-lg text-center p-4">No products found</p>
                )}
            </div>

            {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 mt-6 pb-4 flex-wrap">
                    <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="px-3 lg:px-4 py-2 bg-red-600 text-white rounded disabled:bg-gray-300 disabled:cursor-not-allowed text-sm"
                    >
                        Prev
                    </button>
                    
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <button
                            key={page}
                            onClick={() => handlePageChange(page)}
                            className={`px-3 lg:px-4 py-2 rounded text-sm ${
                                currentPage === page
                                    ? "bg-red-600 text-white"
                                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                            }`}
                        >
                            {page}
                        </button>
                    ))}
                    
                    <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="px-3 lg:px-4 py-2 bg-red-600 text-white rounded disabled:bg-gray-300 disabled:cursor-not-allowed text-sm"
                    >
                        Next
                    </button>
                </div>
            )}
        </div>
    )

    return (
        <div className='container mx-auto p-2 lg:p-4'>
            {/* Mobile Filter Drawer */}
            {showMobileFilters && (
                <div className='fixed inset-0 z-50 lg:hidden'>
                    <div className='absolute inset-0 bg-black bg-opacity-50' onClick={() => setShowMobileFilters(false)} />
                    <div className='absolute right-0 top-0 h-full w-80 bg-white overflow-y-auto'>
                        <div className='flex justify-between items-center p-4 border-b'>
                            <h3 className='font-bold text-lg'>Filters</h3>
                            <button onClick={() => setShowMobileFilters(false)} className='p-2'>
                                <FaTimes />
                            </button>
                        </div>
                        <FilterPanel onClose={() => setShowMobileFilters(false)} />
                    </div>
                </div>
            )}

            {/* Desktop Layout */}
            <div className='hidden lg:grid grid-cols-[200px,1fr] gap-4'>
                <FilterPanel />
                <ProductSection />
            </div>

            {/* Mobile Layout */}
            <div className='lg:hidden'>
                <ProductSection />
            </div>
        </div>
    )
}

export default CategoryProduct
