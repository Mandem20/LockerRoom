import React, { useEffect, useRef, useState } from 'react'
import fetchCategoryWiseProduct from '../helpers/fetchCategoryWiseProduct'
import displayCEDICurrency from '../helpers/displayCurrency'
import { FaAngleLeft, FaAngleRight } from 'react-icons/fa6'
import { Link } from 'react-router-dom'
import addToCart from '../helpers/addToCart'
import addToWishlist from '../helpers/addToWishlist'
import Context from '../context'
import { useContext } from 'react'
import { FaHeart, FaRegHeart } from 'react-icons/fa'
//CategoryWiseProduct//

const HorizontalCardProduct = ({category, heading}) => {
    const [data,setData] = useState([])
    const [loading,setLoading] = useState(true)
    const loadingList = new Array(13).fill(null)

    const [scroll,setScroll] = useState(0)
    const scrollElement = useRef()
    const [wishlistItems, setWishlistItems] = useState({})

    const { fetchUserAddToCart } = useContext(Context)
    
    const handleAddToCart = async(e,id)=>{
           await addToCart(e,id)
            fetchUserAddToCart()
        }

    const handleWishlist = async (e, productId) => {
        e.preventDefault()
        e.stopPropagation()
        const result = await addToWishlist(productId)
        if (result.success) {
            setWishlistItems(prev => ({
                ...prev,
                [productId]: result.inWishlist
            }))
        }
    }

     const fetchData = async()=>{
         setLoading(true)
          const categoryProduct = await fetchCategoryWiseProduct(category)
          setLoading(false)
          
          console.log("horizontal data",categoryProduct.data)
          
          const sortedData = (categoryProduct?.data || []).sort((a, b) => {
            return new Date(b.createdAt) - new Date(a.createdAt)
          })
          setData(sortedData)
      }
     useEffect(()=>{
         fetchData() 
     },[])

    const scrollRight = () =>{
        scrollElement.current.scrollLeft += 300
    }

        const scrollLeft = () =>{
        scrollElement.current.scrollLeft -= 300
    }

  return (
    <div className='container mx-auto px-4 my-6 relative'>

             <div className='flex items-center justify-between py-4'>
              <h2 className='text-2xl font-bold'>{heading}</h2>
              <Link to={`/product-category?category=${category}`} className='text-red-600 hover:underline text-sm font-medium'>
                See All
              </Link>
             </div>

    <div className='flex items-center gap-4 md:gap-6 overflow-scroll scrollbar-none transition-all' ref={scrollElement}>
         <button  className='bg-white shadow-md rounded-full p-1 absolute left-0 text-lg hidden md:block' onClick={scrollLeft}><FaAngleLeft/></button>
         <button  className='bg-white shadow-md rounded-full p-1 absolute right-0 text-lg hidden md:block' onClick={scrollRight}><FaAngleRight/></button>
         {  loading ? (
                            loadingList.map((product,index)=>{
                    return(
             <div className='w-full min-w-[340px] md:min-w-[320px] max-w-[300px] md:max-w-[330px] h-[165px] bg-white rounded-sm shadow flex' key={"Horizon"+index}>
                  <div className='bg-white-200 h-full p-4 min-w-[120px] md:min-w-[140px] shadow animate-pulse'>
                  
                  </div>
                  <div className='p-4 w-full gap-2'>
                    <h2 className='font-medium text-base md:text-md text-ellipsis line-clamp-2 text-black bg-slate-200 animate-pulse p-1 rounded-full'></h2>
                    <p className='capitalize text-slate-500 p-1 bg-slate-200 animate-pulse rounded-full'></p>
                    <div className='gap-1 w-full'>
                       <p className='text-red-600 font-medium p-1 bg-slate-200 w-full animate-pulse rounded-full'></p>
                       <p className='text-slate-500 line-through p-1 bg-slate-200 w-full animate-pulse rounded-full'></p>
                    </div>
                    <button className='text-sm text-white px-3 py-0.5 rounded-full w-full bg-slate-200 animate-pulse'></button>
                  </div>
             </div>
                    )
                })
         ) : (
                data.map((product,index)=>{
                    return(
              <Link to={"product/"+product?._id} className='w-full min-w-[340px] md:min-w-[320px] max-w-[300px] md:max-w-[330px] h-[165px] bg-white rounded-sm shadow flex' key={"Horizontal"+index}>
                  <div className='bg-white-200 h-full p-4 min-w-[120px] md:min-w-[140px] shadow relative'>
                    {product?.price > product?.sellingPrice && (
                        <span className='absolute top-2 right-2 text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium'>
                            -{Math.round(((product?.price - product?.sellingPrice) / product?.price) * 100)}%
                        </span>
                    )}
                    <button
                        onClick={(e) => handleWishlist(e, product?._id)}
                        className='absolute top-2 left-2 p-1 bg-white rounded-full shadow hover:bg-red-50'
                        title='Add to wishlist'
                    >
                        {wishlistItems[product?._id] ? (
                            <FaHeart className='text-red-500 text-sm' />
                        ) : (
                            <FaRegHeart className='text-gray-500 text-sm' />
                        )}
                    </button>
                    <img src={product.productImage[0]} className='object-fill h-full  hover:scale-110 transition-all'/>
                  </div>
                  <div className='p-4'>
                    <h2 className='font-medium text-base md:text-md text-ellipsis line-clamp-2 text-black'>{product?.productName}</h2>
                    <div className='flex gap-2'>
                       <p className='capitalize text-slate-500'>{product?.category}</p>  
                       <p className='capitalize text-slate-500'>{product?.brandName}</p>  
                    </div>
                  
                    <div className='gap-1'>
                       <p className='text-red-600 font-medium'>{displayCEDICurrency(product?.sellingPrice)}</p>
                       <p className='text-slate-500 line-through'>{displayCEDICurrency(product?.price)}</p>
                    </div>
                    <button className='text-sm bg-red-600 hover:bg-red-700 text-white px-3 py-0.5 rounded-full' onClick={(e)=>handleAddToCart(e,product?._id)}>Add to cart</button>
                  </div>
              </Link>
                    )
                })
         )

         }
    </div>
    </div>
  )
}

export default HorizontalCardProduct