import React, { useState, useEffect, useCallback } from 'react'
import { useParams } from 'react-router-dom'
import VerticalCard from '../components/VerticalCard'
import SummaryApi from '../common'

const CategoryBrand = () => {
    const params = useParams()
    const brandName = params?.brandName
    const [data, setData] = useState([])
    const [loading, setLoading] = useState(true)
    const [totalPages, setTotalPages] = useState(0)
    const [currentPage, setCurrentPage] = useState(1)

    const fetchData = useCallback(async (page = 1) => {
        if (!brandName) return

        try {
            setLoading(true)
            const response = await fetch(SummaryApi.filterProduct.url, {
                method: SummaryApi.filterProduct.method,
                headers: {
                    "content-type": "application/json"
                },
                body: JSON.stringify({
                    brand: [brandName],
                    page: page,
                    limit: 12
                })
            })

            const dataResponse = await response.json()
            setData(dataResponse?.data || [])
            setTotalPages(dataResponse?.totalPages || 0)
            setCurrentPage(dataResponse?.currentPage || 1)
        } catch (error) {
            console.error("Brand filter error:", error)
        } finally {
            setLoading(false)
        }
    }, [brandName])

    useEffect(() => {
        fetchData(1)
    }, [fetchData])

    const handlePageChange = (page) => {
        if (page >= 1 && page <= totalPages) {
            fetchData(page)
            window.scrollTo({ top: 0, behavior: "smooth" })
        }
    }

    return (
        <div className='container mx-auto p-4'>
            <h2 className='text-2xl font-bold py-4 capitalize'>{brandName} Products</h2>
            
            <div className='min-h-[calc(100vh-120px)]'>
                {loading ? (
                    <p className="text-lg text-center">Loading...</p>
                ) : data.length > 0 ? (
                    <>
                        <p className="text-lg font-semibold mb-3">
                            Results: {data.length}
                        </p>
                        <VerticalCard data={data} loading={loading} />
                        
                        {totalPages > 1 && (
                            <div className="flex justify-center items-center gap-2 mt-6">
                                <button
                                    onClick={() => handlePageChange(currentPage - 1)}
                                    disabled={currentPage === 1}
                                    className="px-4 py-2 bg-red-600 text-white rounded disabled:bg-gray-300 disabled:cursor-not-allowed"
                                >
                                    Previous
                                </button>
                                
                                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                    <button
                                        key={page}
                                        onClick={() => handlePageChange(page)}
                                        className={`px-4 py-2 rounded ${
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
                                    className="px-4 py-2 bg-red-600 text-white rounded disabled:bg-gray-300 disabled:cursor-not-allowed"
                                >
                                    Next
                                </button>
                            </div>
                        )}
                    </>
                ) : (
                    <p className="text-lg text-center p-4">No products found for this brand</p>
                )}
            </div>
        </div>
    )
}

export default CategoryBrand
