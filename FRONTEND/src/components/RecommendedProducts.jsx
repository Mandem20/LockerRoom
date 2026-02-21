import React, { useEffect, useState, useRef } from 'react'
import getRecommendations, { getRecentlyViewed, addToRecentlyViewed } from '../helpers/getRecommendations'
import displayCEDICurrency from '../helpers/displayCurrency'
import { FaAngleLeft, FaAngleRight } from 'react-icons/fa6'
import { Link } from 'react-router-dom'
import addToCart from '../helpers/addToCart'
import { useContext } from 'react'
import Context from '../context'

const RecommendedProducts = ({ currentProductId, wishlistItems = [] }) => {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const loadingList = new Array(6).fill(null)
  const scrollRef = useRef(null)

  const { fetchUserAddToCart } = useContext(Context)

  const handleAddToCart = async (e, id) => {
    await addToCart(e, id)
    fetchUserAddToCart()
  }

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      
      addToRecentlyViewed(currentProductId)
      
      const viewedProducts = getRecentlyViewed()
      
      const recommendations = await getRecommendations(wishlistItems, viewedProducts)
      
      const productsData = recommendations?.data || []
      const filteredData = productsData.filter(
        product => product._id !== currentProductId
      )
      
      setData(filteredData)
      setLoading(false)
    }

    if (currentProductId) {
      fetchData()
    }
  }, [currentProductId, wishlistItems.join(',')])

  const scroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = 320
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      })
    }
  }

  if (loading) {
    return null
  }

  return (
    <div className='container mx-auto px-4 my-6 relative'>
      <h2 className='text-2xl font-bold py-4'>Recommended For You</h2>

      {data.length === 0 ? (
        <p className="text-gray-500 py-4">No recommendations available</p>
      ) : (
      <div className='relative'>
        <button 
          onClick={() => scroll('left')}
          className='absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow-lg p-2 rounded-full hover:bg-gray-100 hidden md:block'
        >
          <FaAngleLeft size={20} />
        </button>
        
        <div ref={scrollRef} className='flex gap-4 overflow-x-auto scrollbar-none scroll-smooth px-8'>
          {loading ? (
            loadingList.map((_, index) => (
              <div key={index} className='min-w-[280px] bg-white rounded-sm shadow'>
                <div className='bg-slate-200 h-40 p-4 flex justify-center items-center animate-pulse'>
                </div>
                <div className='p-4 grid gap-3'>
                  <h2 className='font-medium text-base md:text-md text-ellipsis line-clamp-2 text-black p-1 py-2 animate-pulse rounded-full bg-slate-200'></h2>
                  <p className='capitalize text-slate-500 p-1 animate-pulse rounded-full bg-slate-200 py-2'></p>
                  <div className='flex gap-3'>
                    <p className='text-red-600 font-medium p-1 animate-pulse rounded-full bg-slate-200 py-2'></p>
                    <p className='text-slate-500 line-through p-1 animate-pulse rounded-full bg-slate-200 w-full py-2'></p>
                  </div>
                  <button className='text-sm hover:bg-red-700 text-white px-3 animate-pulse rounded-full bg-slate-200 py-2'></button>
                </div>
              </div>
            ))
          ) : (
            data.slice(0, 8).filter(product => product.productImage?.length > 0).map((product) => (
              <Link 
                key={product._id} 
                to={"/product/" + product._id} 
                className='min-w-[280px] bg-white rounded-sm shadow hover:shadow-lg transition-shadow' 
              >
                <div className='bg-slate-200 h-40 p-4 flex justify-center items-center'>
                  <img 
                    src={product.productImage?.[0]} 
                    className='object-fill h-full hover:scale-110 transition-transform mix-blend-multiply' 
                    alt={product.productName}
                    loading="lazy"
                  />
                </div>
                <div className='p-4 grid gap-3'>
                  <h2 className='font-medium text-base md:text-md text-ellipsis line-clamp-2 text-black'>
                    {product.productName}
                  </h2>
                  <div className='flex items-center gap-3'> 
                    <p className='capitalize text-slate-500'>{product.gender}</p>
                    <p className='capitalize text-slate-500'>{product.category}</p>
                  </div>
                  <div className='flex gap-3 items-center'>
                    <div className='flex gap-3'>
                      <p className='text-red-600 font-medium'>
                        {displayCEDICurrency(product.sellingPrice)}
                      </p>
                      <p className='text-slate-500 line-through'>
                        {displayCEDICurrency(product.price)}
                      </p>
                    </div>
                    {product.price > product.sellingPrice && (
                      <span className='text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium'>
                        -{Math.round(((product.price - product.sellingPrice) / product.price) * 100)}%
                      </span>
                    )}
                  </div>
                  <button 
                    className='text-sm bg-red-600 hover:bg-red-700 text-white px-3 py-0.5 rounded-full'
                    onClick={(e) => handleAddToCart(e, product._id)}
                  >
                    Add to cart
                  </button>
                </div>
              </Link>
            ))
          )}
        </div>
        
        <button 
          onClick={() => scroll('right')}
          className='absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow-lg p-2 rounded-full hover:bg-gray-100 hidden md:block'
        >
          <FaAngleRight size={20} />
        </button>
      </div>
      )}
    </div>
  )
}

export default RecommendedProducts
