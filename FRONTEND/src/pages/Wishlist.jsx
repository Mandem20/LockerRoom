import React, { useEffect, useState, useContext } from 'react'
import SummaryApi from '../common'
import Context from '../context'
import displayCEDICurrency from '../helpers/displayCurrency'
import addToCart from '../helpers/addToCart'
import { Link, useNavigate } from 'react-router-dom'
import { FaHeart, FaShoppingCart, FaTrash, FaArrowRight } from 'react-icons/fa'
import { toast } from 'react-toastify'

const Wishlist = () => {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()
  const { fetchUserAddToCart } = useContext(Context)

  const fetchWishlist = async () => {
    try {
      setLoading(true)
      const response = await fetch(SummaryApi.getWishlist.url, {
        method: SummaryApi.getWishlist.method,
        credentials: 'include',
        headers: {
          "content-type": "application/json"
        }
      })

      const dataResponse = await response.json()
      setData(dataResponse?.data || [])
    } catch (error) {
      console.error("Wishlist error:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchWishlist()
  }, [])

  const handleMoveToCart = async (e, product) => {
    e.preventDefault()
    e.stopPropagation()
    
    try {
      const response = await fetch(SummaryApi.addToCartProduct.url, {
        method: SummaryApi.addToCartProduct.method,
        credentials: 'include',
        headers: {
          "content-type": "application/json"
        },
        body: JSON.stringify({
          productId: product._id,
          quantity: 1
        })
      })
      
      const dataResponse = await response.json()
      
      if (dataResponse.success) {
        await removeFromWishlist(product._id)
        fetchUserAddToCart()
        toast.success('Item moved to cart!')
      } else {
        toast.error(dataResponse.message || 'Failed to add to cart')
      }
    } catch (error) {
      console.error('Move to cart error:', error)
      toast.error('Failed to move item to cart')
    }
  }

  const removeFromWishlist = async (productId) => {
    try {
      const response = await fetch(SummaryApi.removeFromWishlist.url, {
        method: SummaryApi.removeFromWishlist.method,
        credentials: 'include',
        headers: {
          "content-type": "application/json"
        },
        body: JSON.stringify({ productId })
      })
      
      const dataResponse = await response.json()
      
      if (dataResponse.success) {
        setData(data.filter(item => item._id !== productId))
      }
    } catch (error) {
      console.error('Remove from wishlist error:', error)
    }
  }

  if (loading) {
    return (
      <div className='container mx-auto p-4'>
        <h2 className='text-2xl font-bold py-4'>My Wishlist</h2>
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
          {[1, 2, 3].map(i => (
            <div key={i} className='bg-white rounded-lg shadow animate-pulse'>
              <div className='h-48 bg-slate-200'></div>
              <div className='p-4 space-y-3'>
                <div className='h-4 bg-slate-200 rounded'></div>
                <div className='h-4 bg-slate-200 rounded w-2/3'></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className='container mx-auto p-4'>
      <h2 className='text-2xl font-bold py-4'>My Wishlist</h2>
      
      {data.length > 0 ? (
        <>
          <p className="text-lg font-semibold mb-4">
            Wishlist Items: {data.length}
          </p>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
            {data.map((product) => (
              <div key={product._id} className='bg-white rounded-lg shadow overflow-hidden hover:shadow-md transition-shadow'>
                <Link to={`/product/${product._id}`} className='block'>
                  <div className='relative h-48 bg-gray-100'>
                    {product.price > product.sellingPrice && (
                      <span className='absolute top-2 left-2 text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium'>
                        -{Math.round(((product.price - product.sellingPrice) / product.price) * 100)}%
                      </span>
                    )}
                    <img
                      src={product?.productImage?.[0]}
                      alt={product?.productName}
                      className='w-full h-full object-cover'
                    />
                  </div>
                </Link>
                
                <div className='p-4'>
                  <Link to={`/product/${product._id}`}>
                    <h3 className='font-medium text-gray-800 line-clamp-2 hover:text-red-600'>
                      {product?.productName}
                    </h3>
                  </Link>
                  
                  <div className='flex items-center gap-2 text-sm text-gray-500 mt-1'>
                    <span>{product?.category}</span>
                    {product?.brandName && (
                      <>
                        <span>•</span>
                        <span>{product.brandName}</span>
                      </>
                    )}
                  </div>

                  <div className='flex items-center gap-3 mt-2'>
                    <span className='text-red-600 font-bold'>
                      {displayCEDICurrency(product.sellingPrice)}
                    </span>
                    {product.price > product.sellingPrice && (
                      <span className='line-through text-gray-400 text-sm'>
                        {displayCEDICurrency(product.price)}
                      </span>
                    )}
                  </div>

                  <div className='flex gap-2 mt-4'>
                    <button
                      onClick={(e) => handleMoveToCart(e, product)}
                      className='flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 text-sm font-medium transition-colors'
                    >
                      <FaShoppingCart /> Move to Cart
                    </button>
                    <button
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        removeFromWishlist(product._id)
                        toast.success('Removed from wishlist')
                      }}
                      className='p-2 border border-gray-300 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors'
                      title='Remove from wishlist'
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="text-center py-16">
          <div className='inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-4'>
            <FaHeart className="text-3xl text-gray-300" />
          </div>
          <p className="text-lg text-gray-500 mb-2">Your wishlist is empty</p>
          <p className="text-sm text-gray-400 mb-4">Save items you love by clicking the heart icon</p>
          <Link to="/" className="inline-flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
            Continue Shopping <FaArrowRight />
          </Link>
        </div>
      )}
    </div>
  )
}

export default Wishlist
