import React, { useEffect, useState } from "react"
import SummaryApi from "../common"
import { Link } from "react-router-dom"

const CategoryList = () => {
  const [categoryProduct, setCategoryProduct] = useState([])
  const [loading, setLoading] = useState(true)

  const categoryLoading = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13]

  const fetchCategoryProduct = async () => {
    try {
      const response = await fetch(SummaryApi.categoryProduct.url)
      const dataResponse = await response.json()

      setCategoryProduct(dataResponse?.data || [])
    } catch (error) {
      console.error("Category fetch error:", error)
      setCategoryProduct([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCategoryProduct()
  }, [])

  return (
    <div className="container mx-auto p-4">
      <div className="flex items-center gap-4 justify-between overflow-scroll scrollbar-none">
        {loading
          ? categoryLoading.map((_, index) => (
              <div
                className="h-16 w-16 md:h-20 md:w-20 rounded-full overflow-hidden bg-slate-200 animate-pulse shrink-0"
                key={"categoryLoading" + index}
              />
            ))
          : categoryProduct.map((product) => (
              <Link
                key={product?.category}
                to={`/product-category?category=${encodeURIComponent(
                  product?.category
                )}`}
                className="cursor-pointer shrink-0"
              >
                <div className="w-16 h-16 md:w-20 md:h-20 rounded-full overflow-hidden p-4 bg-slate-200 flex items-center justify-center">
                  <img
                    src={product?.productImage?.[0]}
                    alt={product?.category}
                    className="h-full object-scale-down mix-blend-multiply hover:scale-x-125 transition-all"
                    loading="lazy"
                  />
                </div>
                <p className="text-center text-sm md:text-base capitalize">
                  {product?.category}
                </p>
              </Link>
            ))}
      </div>
    </div>
  )
}

export default CategoryList
