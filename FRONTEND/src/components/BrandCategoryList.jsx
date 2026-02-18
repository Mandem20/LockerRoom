import React, { useState } from "react"
import { Link } from "react-router-dom"
import brandCategory from "../helpers/brandCategory"

const BrandCategoryList = ({ heading }) => {
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 9
  const totalPages = Math.ceil(brandCategory.length / itemsPerPage)
  
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentBrands = brandCategory.slice(indexOfFirstItem, indexOfLastItem)

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page)
    }
  }

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold py-4">{heading}</h2>
      <div className="flex items-center gap-4 justify-between overflow-scroll scrollbar-none">
        {currentBrands.map((brand) => (
          <Link
            to={"/brand-category/" + encodeURIComponent(brand.value)}
            className="cursor-pointer shrink-0"
            key={brand.id}
          >
            <div className="w-16 h-16 md:w-20 md:h-20 rounded-full overflow-hidden bg-slate-200 flex items-center justify-center">
              <img
                src={brand.logo}
                alt={brand.label}
                className="w-full h-full object-contain p-1 hover:scale-110 transition-all"
              />
            </div>
            <p className="text-center text-sm md:text-base capitalize">
              {brand.label}
            </p>
          </Link>
        ))}
      </div>
      
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-4">
          <button
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-3 py-1 bg-red-600 text-white rounded disabled:bg-gray-300 disabled:cursor-not-allowed text-sm"
          >
            Prev
          </button>
          
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => goToPage(page)}
              className={`px-3 py-1 rounded text-sm ${
                currentPage === page
                  ? "bg-red-600 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              {page}
            </button>
          ))}
          
          <button
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-3 py-1 bg-red-600 text-white rounded disabled:bg-gray-300 disabled:cursor-not-allowed text-sm"
          >
            Next
          </button>
        </div>
      )}
    </div>
  )
}

export default BrandCategoryList
