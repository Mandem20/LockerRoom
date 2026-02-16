import React, { useEffect, useState } from "react"
import { useLocation } from "react-router-dom"
import axios from "axios"
import SummaryApi from "../common"
import VerticalCard from "../components/VerticalCard"

const SearchProduct = () => {
  const location = useLocation()
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)

  // ✅ Parse query params
  const params = new URLSearchParams(location.search)
  const keyword = params.get("keyword") || ""
  const category = params.get("category") || ""
  const brand = params.get("brand") || ""

const fetchProduct = async () => {
  try {
    setLoading(true)

    const params = new URLSearchParams()
    if (keyword) params.append("keyword", keyword)
    if (category) params.append("category", category)
    if (brand) params.append("brand", brand)

    const response = await axios.get(
      `${SummaryApi.search}?${params.toString()}`
    )

    setData(response.data.data || [])
  } catch (error) {
    console.error("Search error:", error)
  } finally {
    setLoading(false)
  }
}


  useEffect(() => {
    fetchProduct()
  }, [location.search]) // 🔥 re-run when search params change

  return (
    <div className="container mx-auto p-4">
      {loading && <p className="text-lg text-center">Loading...</p>}

      <p className="text-lg font-semibold my-3">
        Search Results : {data.length}
      </p>

      {!loading && data.length === 0 && (
        <p className="bg-white text-lg text-center p-4">
          No Product Found...
        </p>
      )}

      {!loading && data.length > 0 && (
        <VerticalCard data={data} loading={loading} />
      )}
    </div>
  )
}

export default SearchProduct
