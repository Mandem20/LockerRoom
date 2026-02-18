import React, { useEffect, useState, useRef } from "react"
import { useLocation, useParams, useNavigate } from "react-router-dom"
import axios from "axios"
import SummaryApi from "../common"
import VerticalCard from "../components/VerticalCard"

const SearchProduct = () => {
  const location = useLocation()
  const params = useParams()
  const navigate = useNavigate()
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)
  const [totalPages, setTotalPages] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const isFirstRender = useRef(true)

  const keyword = params.keyword || ""
  const category = params.category || ""
  const brand = params.brand || ""

  const fetchProduct = async (page = 1) => {
    if (!keyword && !category && !brand) {
      navigate("/")
      return
    }

    try {
      setLoading(true)

      const queryParams = new URLSearchParams()
      if (keyword) queryParams.append("keyword", keyword)
      if (category) queryParams.append("category", category)
      if (brand) queryParams.append("brand", brand)
      queryParams.append("page", page)
      queryParams.append("limit", 12)

      const response = await axios.get(
        `${SummaryApi.searchProduct.url}?${queryParams.toString()}`
      )

      const products = response.data.data || []
      setData(products)
      setTotalPages(response.data.totalPages || 0)
      setCurrentPage(response.data.currentPage || 1)

      if (!isFirstRender.current && products.length === 0) {
        navigate("/")
      }
    } catch (error) {
      console.error("Search error:", error)
    } finally {
      setLoading(false)
      isFirstRender.current = false
    }
  }

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      fetchProduct(page)
      window.scrollTo({ top: 0, behavior: "smooth" })
    }
  }

  useEffect(() => {
    isFirstRender.current = true
    fetchProduct(1)
  }, [params.keyword, params.category, params.brand])

  return (
    <div className="container mx-auto p-4">
      {loading && <p className="text-lg text-center">Loading...</p>}

      {!loading && data.length > 0 && (
        <>
          <p className="text-lg font-semibold my-3">
            Search Results : {data.length}
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
      )}
    </div>
  )
}

export default SearchProduct
