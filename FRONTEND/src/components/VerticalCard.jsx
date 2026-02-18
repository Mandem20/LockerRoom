import React, { useContext } from 'react'
import scrollTop from '../helpers/scrollTop'
import displayCEDICurrency from '../helpers/displayCurrency'
import Context from '../context'
import addToCart from '../helpers/addToCart'
import { Link } from 'react-router-dom'

const VerticalCard = ({ loading, data = [] }) => {
  const loadingList = new Array(13).fill(null)
  const { fetchUserAddToCart } = useContext(Context)

  const handleAddToCart = async (e, id) => {
    await addToCart(e, id)
    fetchUserAddToCart()
  }

  return (
    <div className='grid grid-cols-[repeat(auto-fit,minmax(260px,300px))] justify-center md:justify-between md:gap-4 overflow-x-scroll scrollbar-none transition-all'>

      {/* 🔄 LOADING SKELETON */}
      {loading &&
        loadingList.map((_, index) => (
          <div
            key={index}
            className='w-full min-w-[340px] md:min-w-[320px] max-w-[300px] md:max-w-[330px] bg-white rounded-sm shadow'
          >
            <div className='h-40 p-4 flex justify-center items-center animate-pulse bg-slate-200'></div>
            <div className='p-4 grid gap-3'>
              <div className='h-4 bg-slate-200 rounded-full animate-pulse'></div>
              <div className='h-4 bg-slate-200 rounded-full animate-pulse'></div>
              <div className='h-4 bg-slate-200 rounded-full animate-pulse'></div>
            </div>
          </div>
        ))}

      {/* ✅ REAL PRODUCTS */}
      {!loading &&
        data.map((product) => (
          <Link
            key={product._id}   // ✅ correct key
            to={`/product/${product._id}`}
            onClick={scrollTop}
            className='w-full min-w-[340px] md:min-w-[300px] max-w-[300px] bg-white rounded-sm shadow'
          >
            <div className='h-40 p-4 flex justify-center items-center relative'>
              {product.price > product.sellingPrice && (
                <span className='absolute top-2 right-2 text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium'>
                  -{Math.round(((product.price - product.sellingPrice) / product.price) * 100)}%
                </span>
              )}
              <img
                src={product?.productImage?.[0]}
                alt={product?.productName}
                className='object-fill h-full hover:scale-110 transition-all mix-blend-multiply'
              />
            </div>

            <div className='p-4 grid gap-3'>
              <h2 className='font-medium text-base line-clamp-2'>
                {product?.productName}
              </h2>

              <div className='flex gap-3 text-slate-500'>
                <p>{product?.gender}</p>
                <p>{product?.category}</p>
                <p>{product?.brandName}</p>
              </div>

              <div className='flex gap-3'>
                <p className='text-red-600 font-medium'>
                  {displayCEDICurrency(product.sellingPrice)}
                </p>
                <p className='line-through text-slate-500'>
                  {displayCEDICurrency(product.price)}
                </p>
              </div>

              <button
                className='text-sm bg-red-600 hover:bg-red-700 text-white px-3 py-0.5 rounded-full'
                onClick={(e) => handleAddToCart(e, product._id)}
              >
                Add to cart
              </button>
            </div>
          </Link>
        
        ))}
    </div>
  )
}

export default VerticalCard
