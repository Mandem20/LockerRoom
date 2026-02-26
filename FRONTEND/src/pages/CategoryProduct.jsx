import React, { useState, useEffect, useCallback } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { FaFilter, FaTimes } from 'react-icons/fa'
import VerticalCard from '../components/VerticalCard'
import SummaryApi from '../common'

const CategoryProduct = () => {
    const [data, setData] = useState([])
    const [loading, setLoading] = useState(true)
    const [totalPages, setTotalPages] = useState(0)
    const [currentPage, setCurrentPage] = useState(1)
    const [showMobileFilters, setShowMobileFilters] = useState(false)
    const navigate = useNavigate()
    const location = useLocation()
    
    const [selectedCategories, setSelectedCategories] = useState([])
    const [selectedBrands, setSelectedBrands] = useState([])
    const [selectedGenders, setSelectedGenders] = useState([])
    const [selectedColors, setSelectedColors] = useState([])
    const [selectedSizes, setSelectedSizes] = useState([])
    const [allCategories, setAllCategories] = useState([])
    const [availableColors, setAvailableColors] = useState([])
    const [availableSizes, setAvailableSizes] = useState([])
    const [availableBrands, setAvailableBrands] = useState([])
    const [availableGenders, setAvailableGenders] = useState([])
    const [availableCategories, setAvailableCategories] = useState([])
    const [sortBy, setSortBy] = useState("newest")

    useEffect(() => {
        const fetchFilters = async () => {
            try {
                const [categoriesRes, brandsRes, colorsRes, sizesRes, gendersRes] = await Promise.all([
                    fetch("http://localhost:8080/api/get-category-dynamic"),
                    fetch("http://localhost:8080/api/get-brandProduct"),
                    fetch("http://localhost:8080/api/get-colorProduct"),
                    fetch("http://localhost:8080/api/get-sizeProduct"),
                    fetch("http://localhost:8080/api/get-genderProduct")
                ])

                const categoriesData = await categoriesRes.json()
                const brandsData = await brandsRes.json()
                const colorsData = await colorsRes.json()
                const sizesData = await sizesRes.json()
                const gendersData = await gendersRes.json()

                setAllCategories(categoriesData.data || [])
                setAvailableBrands(brandsData.data || [])
                setAvailableColors(colorsData.data || [])
                setAvailableSizes(sizesData.data || [])
                setAvailableGenders(gendersData.data || [])
                setAvailableCategories(categoriesData.data || [])
            } catch (error) {
                console.error("Error fetching filters:", error)
            }
        }

        fetchFilters()
    }, [])

    const fetchData = useCallback(async (page = 1) => {
        const urlSearch = new URLSearchParams(location.search)
        const categoryParams = urlSearch.getAll("category")
        const brandParams = urlSearch.getAll("brand")
        const genderParams = urlSearch.getAll("gender")
        const colorParams = urlSearch.getAll("color")
        const sizeParams = urlSearch.getAll("size")

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
                    color: colorParams,
                    sizes: sizeParams,
                    sortBy: sortBy,
                    page: page,
                    limit: 12
                })
            })

            if (!response.ok) {
                throw new Error('Network response was not ok')
            }

            const dataResponse = await response.json()
            setData(dataResponse?.data || [])
            setTotalPages(dataResponse?.totalPages || 0)
            setCurrentPage(dataResponse?.currentPage || 1)
        } catch (error) {
            console.warn("Filter error:", error.message)
            setData([])
        } finally {
            setLoading(false)
        }
    }, [location.search, sortBy])

    const fetchAvailableFilters = async (currentFilters) => {
        try {
            const response = await fetch(SummaryApi.availableFilters.url, {
                method: SummaryApi.availableFilters.method,
                headers: { "content-type": "application/json" },
                body: JSON.stringify(currentFilters)
            })
            
            if (!response.ok) {
                console.warn("Failed to fetch available filters")
                return
            }
            
            const data = await response.json()
            if (data.success) {
                setAvailableCategories(data.data.categories || [])
                setAvailableBrands(data.data.brands || [])
                setAvailableColors(data.data.colors || [])
                setAvailableSizes(data.data.sizes || [])
                setAvailableGenders(data.data.genders || [])
            }
        } catch (error) {
            console.warn("Error fetching available filters:", error.message)
        }
    }

    useEffect(() => {
        fetchData(1)
    }, [fetchData])

    const updateUrl = (categories, brands, genders, colors, sizes) => {
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
        
        colors.forEach(color => {
            params.append("color", color)
        })
        
        sizes.forEach(size => {
            params.append("size", size)
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
        updateUrl(newCategories, selectedBrands, selectedGenders, selectedColors, selectedSizes)
        fetchAvailableFilters({
            category: newCategories,
            brand: selectedBrands,
            gender: selectedGenders,
            color: selectedColors,
            sizes: selectedSizes
        })
    }

    const handleBrandChange = (value, checked) => {
        let newBrands
        if (checked) {
            newBrands = [...selectedBrands, value]
        } else {
            newBrands = selectedBrands.filter(item => item !== value)
        }
        setSelectedBrands(newBrands)
        updateUrl(selectedCategories, newBrands, selectedGenders, selectedColors, selectedSizes)
        fetchAvailableFilters({
            category: selectedCategories,
            brand: newBrands,
            gender: selectedGenders,
            color: selectedColors,
            sizes: selectedSizes
        })
    }

    const handleGenderChange = (value, checked) => {
        let newGenders
        if (checked) {
            newGenders = [...selectedGenders, value]
        } else {
            newGenders = selectedGenders.filter(item => item !== value)
        }
        setSelectedGenders(newGenders)
        updateUrl(selectedCategories, selectedBrands, newGenders, selectedColors, selectedSizes)
        fetchAvailableFilters({
            category: selectedCategories,
            brand: selectedBrands,
            gender: newGenders,
            color: selectedColors,
            sizes: selectedSizes
        })
    }

    const handleColorChange = (value, checked) => {
        let newColors
        if (checked) {
            newColors = [...selectedColors, value]
        } else {
            newColors = selectedColors.filter(item => item !== value)
        }
        setSelectedColors(newColors)
        updateUrl(selectedCategories, selectedBrands, selectedGenders, newColors, selectedSizes)
        fetchAvailableFilters({
            category: selectedCategories,
            brand: selectedBrands,
            gender: selectedGenders,
            color: newColors,
            sizes: selectedSizes
        })
    }

    const handleSizeChange = (value, checked) => {
        let newSizes
        if (checked) {
            newSizes = [...selectedSizes, value]
        } else {
            newSizes = selectedSizes.filter(item => item !== value)
        }
        setSelectedSizes(newSizes)
        updateUrl(selectedCategories, selectedBrands, selectedGenders, selectedColors, newSizes)
        fetchAvailableFilters({
            category: selectedCategories,
            brand: selectedBrands,
            gender: selectedGenders,
            color: selectedColors,
            sizes: newSizes
        })
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
        setSelectedColors([])
        setSelectedSizes([])
        setSortBy("newest")
        navigate("/product-category")
    }

    useEffect(() => {
        const urlSearch = new URLSearchParams(location.search)
        setSelectedCategories(urlSearch.getAll("category"))
        setSelectedBrands(urlSearch.getAll("brand"))
        setSelectedGenders(urlSearch.getAll("gender"))
        setSelectedColors(urlSearch.getAll("color"))
        setSelectedSizes(urlSearch.getAll("size"))
    }, [location.search])

    const hasActiveFilters = selectedCategories.length > 0 || selectedBrands.length > 0 || selectedGenders.length > 0 || selectedColors.length > 0 || selectedSizes.length > 0

    const FilterPanel = ({ onClose }) => (
        <div className='bg-white p-4 min-h-screen lg:min-h-[calc(100vh-120px)] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100'>
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
                    {allCategories.map((categoryName, index) => {
                        const isAvailable = availableCategories.length === 0 || 
                            availableCategories.some(c => c.value === categoryName?.value)
                        return (
                        <div className='flex items-center gap-3' key={"cat_" + index}>
                            <input 
                                type='checkbox' 
                                name="category" 
                                checked={selectedCategories.includes(categoryName?.value)} 
                                value={categoryName?.value}  
                                id={"cat_m_" + categoryName?.value} 
                                onChange={(e) => handleCategoryChange(e.target.value, e.target.checked)}
                                disabled={!isAvailable}
                            />
                            <label htmlFor={"cat_m_" + categoryName?.value} className={!isAvailable ? 'text-slate-300' : ''}>{categoryName?.label}</label>
                        </div>
                    )})}
                </form>
            </div>

            <div className=''>
                <h3 className='text-base uppercase font-medium text-slate-500 border-b pb-1 border-slate-300 mt-4'>Brand</h3>
                <form className='text-sm flex flex-col gap-2 py-2'>
                    {availableBrands.length > 0 ? availableBrands.map((brand, index) => {
                        const brandValue = brand?.value || brand?.label?.toLowerCase() || brand
                        const brandLabel = brand?.label || brand
                        return (
                            <div className='flex items-center gap-3' key={"brand_" + index}>
                                <input 
                                    type='checkbox' 
                                    name="brand" 
                                    checked={selectedBrands.includes(brandValue)} 
                                    value={brandValue} 
                                    id={"brand_m_" + brandValue} 
                                    onChange={(e) => handleBrandChange(e.target.value, e.target.checked)}
                                />
                                <label htmlFor={"brand_m_" + brandValue}>{brandLabel}</label>
                            </div>
                        )
                    }) : (
                        <p className="text-sm text-slate-400 py-2">No brands available</p>
                    )}
                </form>
            </div>

            <div className=''>
                <h3 className='text-base uppercase font-medium text-slate-500 border-b pb-1 border-slate-300 mt-4'>Gender</h3>
                <form className='text-sm flex flex-col gap-2 py-2'>
                    {availableGenders.length > 0 ? availableGenders.map((genderItem, index) => {
                        const genderValue = genderItem?.value || genderItem?.label?.toLowerCase() || genderItem
                        const genderLabel = genderItem?.label || genderItem
                        return (
                        <div className='flex items-center gap-3' key={"gender_" + index}>
                            <input 
                                type='checkbox' 
                                name="gender" 
                                checked={selectedGenders.includes(genderValue)} 
                                value={genderValue} 
                                id={"gender_m_" + genderValue} 
                                onChange={(e) => handleGenderChange(e.target.value, e.target.checked)}
                            />
                            <label htmlFor={"gender_m_" + genderValue}>{genderLabel}</label>
                        </div>
                    )}) : (
                        <p className="text-sm text-slate-400 py-2">No genders available</p>
                    )}
                </form>
            </div>

            <div className=''>
                <h3 className='text-base uppercase font-medium text-slate-500 border-b pb-1 border-slate-300 mt-4'>Color</h3>
                <form className='text-sm flex flex-col gap-2 py-2'>
                    {availableColors.length > 0 ? availableColors.map((color, index) => (
                        <div className='flex items-center gap-3' key={"color_" + index}>
                            <input 
                                type='checkbox' 
                                name="color" 
                                checked={selectedColors.includes(color)} 
                                value={color} 
                                id={"color_m_" + color} 
                                onChange={(e) => handleColorChange(e.target.value, e.target.checked)}
                            />
                            <label htmlFor={"color_m_" + color} className="capitalize">{color}</label>
                        </div>
                    )) : (
                        <p className="text-sm text-slate-400 py-2">No colors available</p>
                    )}
                </form>
            </div>

            <div className=''>
                <h3 className='text-base uppercase font-medium text-slate-500 border-b pb-1 border-slate-300 mt-4'>Size</h3>
                <form className='text-sm flex flex-col gap-2 py-2'>
                    {availableSizes.map((size, index) => (
                        <div className='flex items-center gap-3' key={"size_" + index}>
                            <input 
                                type='checkbox' 
                                name="size" 
                                checked={selectedSizes.includes(size)} 
                                value={size} 
                                id={"size_m_" + size} 
                                onChange={(e) => handleSizeChange(e.target.value, e.target.checked)}
                            />
                            <label htmlFor={"size_m_" + size}>{size}</label>
                        </div>
                    ))}
                </form>
            </div>
        </div>
    )

    const ProductSection = () => (
        <div className='px-0 md:px-2 lg:px-4'>
            <div className='flex items-center justify-between mb-3 md:mb-4'>
                <p className='font-medium text-slate-800 text-base sm:text-lg'>
                    {data.length} Results
                </p>
                <button 
                    onClick={() => setShowMobileFilters(true)}
                    className='lg:hidden flex items-center gap-2 px-3 py-2 bg-red-600 text-white rounded text-sm'
                >
                    <FaFilter /> <span className='hidden sm:inline'>Filters</span>
                </button>
            </div>
            <div className='min-h-[40vh] md:min-h-[50vh] lg:min-h-[calc(100vh-120px)] overflow-y-auto'>
                {loading ? (
                    <p className="text-base sm:text-lg text-center py-8">Loading...</p>
                ) : data.length !== 0 ? (
                    <VerticalCard data={data} loading={loading} />
                ) : (
                    <p className="text-base sm:text-lg text-center p-4">No products found</p>
                )}
            </div>

            {totalPages > 1 && (
                <div className="flex justify-center items-center gap-1 sm:gap-2 mt-4 sm:mt-6 pb-4 flex-wrap">
                    <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="px-2 sm:px-3 lg:px-4 py-1.5 sm:py-2 bg-red-600 text-white rounded disabled:bg-gray-300 disabled:cursor-not-allowed text-xs sm:text-sm"
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
                        className="px-2 sm:px-3 lg:px-4 py-1.5 sm:py-2 bg-red-600 text-white rounded disabled:bg-gray-300 disabled:cursor-not-allowed text-xs sm:text-sm"
                    >
                        Next
                    </button>
                </div>
            )}
        </div>
    )

    return (
        <div className='container mx-auto px-2 md:px-4 lg:p-4'>
            {/* Mobile Filter Drawer */}
            {showMobileFilters && (
                <div className='fixed inset-0 z-50 lg:hidden'>
                    <div className='absolute inset-0 bg-black bg-opacity-50' onClick={() => setShowMobileFilters(false)} />
                    <div className='absolute right-0 top-0 h-full w-full sm:w-80 bg-white overflow-y-auto'>
                        <div className='flex justify-between items-center p-4 border-b sticky top-0 bg-white z-10'>
                            <h3 className='font-bold text-lg'>Filters</h3>
                            <button onClick={() => setShowMobileFilters(false)} className='p-2 hover:bg-gray-100 rounded'>
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

            {/* Tablet Layout */}
            <div className='hidden md:block lg:hidden'>
                <div className='flex gap-4'>
                    <div className='w-48 flex-shrink-0'>
                        <FilterPanel />
                    </div>
                    <div className='flex-1'>
                        <ProductSection />
                    </div>
                </div>
            </div>

            {/* Mobile Layout */}
            <div className='md:hidden'>
                <div className='flex items-center justify-between mb-3 px-1'>
                    <p className='font-medium text-slate-800 text-base sm:text-lg'>
                        {data.length} Results
                    </p>
                    <button 
                        onClick={() => setShowMobileFilters(true)}
                        className='flex items-center gap-2 px-3 py-2 bg-red-600 text-white rounded text-sm hover:bg-red-700'
                    >
                        <FaFilter /> <span className='hidden sm:inline'>Filters</span>
                    </button>
                </div>
                <ProductSection />
            </div>
        </div>
    )
}

export default CategoryProduct
