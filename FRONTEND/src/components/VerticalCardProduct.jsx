import React, { useEffect, useRef, useState } from 'react'
import fetchCategoryWiseProduct from '../helpers/fetchCategoryWiseProduct'
import displayCEDICurrency from '../helpers/displayCurrency'
import { FaAngleLeft, FaAngleRight } from 'react-icons/fa6'
import { Link } from 'react-router-dom'
import addToCart from '../helpers/addToCart'
import Context from '../context'
import { useContext } from 'react'


const VerticalCardProduct = ({category, heading}) => {
    const [data,setData] = useState([])
    const [loading,setLoading] = useState(true)
    const loadingList = new Array(13).fill(null)

    const [scroll,setScroll] = useState(0)
    const scrollElement = useRef()

    const { fetchUserAddToCart } = useContext(Context)
        
    const handleAddToCart = async(e,id)=>{
               await addToCart(e,id)
                fetchUserAddToCart()
            }

     const fetchData = async()=>{
         setLoading(true)
          const categoryProduct = await fetchCategoryWiseProduct(category)
          setLoading(false)

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

    <div className='flex items-center gap-4 md:gap-6 overflow-x-scroll scrollbar-none transition-all' ref={scrollElement}>
         <button  className='bg-white shadow-md rounded-full p-1 absolute left-0 text-lg hidden md:block' onClick={scrollLeft}><FaAngleLeft/></button>
         <button  className='bg-white shadow-md rounded-full p-1 absolute right-0 text-lg hidden md:block' onClick={scrollRight}><FaAngleRight/></button>
         {


              loading ? (
                       loadingList.map((_, index) =>{
                    return(
             <div  key={index}  className='w-full min-w-[340px]  md:min-w-[320px] max-w-[300px] md:max-w-[330px]  bg-white rounded-sm shadow'>
                  <div className='bg-white-200 h-40 p-4 min-w-[300px] md:min-w-[145px] flex justify-center items-center animate-pulse'>
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
                    )  
                })

              ) : (
                  data.map((product)=>{
                    return(
             <Link key={product._id}  to={"product/"+product?._id} className='w-full min-w-[340px]  md:min-w-[320px] max-w-[300px] md:max-w-[330px]  bg-white rounded-sm shadow'>
                  <div className='bg-white-200 h-40 p-4 min-w-[300px] md:min-w-[145px] flex justify-center items-center'>
                    <img src={product.productImage[0]} className='object-fill h-full  hover:scale-110 transition-all mix-blend-multiply'/>
                  </div>
                  <div className='p-4 grid gap-3'>
                    <h2 className='font-medium text-base md:text-md text-ellipsis line-clamp-2 text-black'>{product?.productName}</h2>
                    <div className='flex items-center gap-3'> 
                     <p className='capitalize text-slate-500'>{product?.gender}</p>
                     <p className='capitalize text-slate-500'>{product?.category}</p>
                     <p className='capitalize text-slate-500'>{product?.brandName}</p>
                    </div>
                    <div className='flex gap-3 items-center'>
                        <div className='flex gap-3'>
                            <p className='text-red-600 font-medium'>{displayCEDICurrency(product?.sellingPrice)}</p>
                            <p className='text-slate-500 line-through'>{displayCEDICurrency(product?.price)}</p>
                        </div>
                        {product?.price > product?.sellingPrice && (
                            <span className='text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium'>
                                -{Math.round(((product?.price - product?.sellingPrice) / product?.price) * 100)}%
                            </span>
                        )}
                    </div>
                    <button className='text-sm bg-red-600 hover:bg-red-700 text-white px-3 py-0.5 rounded-full'onClick={(e)=>handleAddToCart(e,product?._id)}>Add to cart</button>
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

export default VerticalCardProduct