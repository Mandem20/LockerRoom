import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import SummaryApi from '../common'
import { FaStar } from "react-icons/fa";
import { FaStarHalfAlt } from "react-icons/fa";
import displayCEDICurrency from '../helpers/displayCurrency';
import { useCallback } from 'react';
import VerticalCardProduct from '../components/VerticalCardProduct';
import RecommendedProductDisplay from '../components/RecommendedProductDisplay';
import addToCart from '../helpers/addToCart';
import Context from '../context';
import { useContext } from 'react';

const ProductDetails = () => {
    const [data,setData] = useState({
        productName : "",
        brandName : "",
        category : "",
        productImage : [],
        description : "",
        stock : "",
        size : "",
        gender : "",
        color : "",
        material : "",
        price : "",
        sellingPrice : ""
    })
    
    const params = useParams()
    const [loading,setLoading] = useState(true)
    const productImageListLoading = new Array(4).fill(null)
    const [activeImage,setActiveImage] = useState("")

    const [zoomImageCoordinate,setZoomImageCoordinate] = useState({
      x : 0,
      y : 0
    })                       
const [zoomImage,setZoomImage]=useState(false)

 const { fetchUserAddToCart } = useContext(Context)

  const navigate = useNavigate()
    const fetchProductDetails = async() =>{
                   
         const response = await fetch(SummaryApi.ProductDetails.url,{
            method : SummaryApi.ProductDetails.method,
            headers : {
                "content-type" : "application/json"
            },
            body : JSON.stringify({
                productId : params?.id
            })
         })
         setLoading(false)
         const dataResponse = await response.json()

         setData(dataResponse?.data)
         setActiveImage(dataResponse?.data?.productImage[0])
    }
    console.log("data",data)

    useEffect(()=>{
       fetchProductDetails()
    },[params])

    const handleMouseEnterProduct = (imageURL) =>{
     setActiveImage(imageURL)
    }

    const handleZoomImage = useCallback((e) =>{
      setZoomImage(true)
      const { left , top , width , height} = e.target.getBoundingClientRect()

      const x = (e.clientX - left) / width
      const y = (e.clientY - top) / height

      setZoomImageCoordinate({
        x,
        y
      })
    },[zoomImageCoordinate])

    const handleLeaveImageZoom = ()=>{
      setZoomImage(false)
    }

    const handleAddToCart = async(e,id) =>{
        await addToCart(e,id)
        fetchUserAddToCart()
    } 

  const handleBuyProduct = async(e,id) =>{
      await addToCart(e,id)
      fetchUserAddToCart()
      navigate("/cart")
  }
  return (
    <div className='container mx-auto p-8'>
          <div className='min-h-[200px] flex flex-col lg:flex-row gap-4'>
            {/**Product Image */}
                <div className='h-96 flex flex-col lg:flex-row-reverse gap-4'>
                        <div className='h-[300px] w-[300px] lg:h-96 lg:w-96 bg-slate-200 relative p-2'>
                               <img src={activeImage} className='h-full w-full object-scale-down mix-blend-multiply' onMouseMove={handleZoomImage} onMouseLeave={handleLeaveImageZoom}/>
                            {/**Product image zoom */}
                            {
                              zoomImage && (
                                        <div className='hidden lg:block absolute min-w-[500px] overflow-hidden min-h-[400px] bg-slate-200 p-1 -right-[510px] top-0'>
                                    <div className='w-full h-full min-h-[400px] min-w-[500px]  mix-blend-multiply scale-150' 
                                    style={{
                                      backgroundImage:`url(${activeImage})`,
                                      backgroundRepeat : 'no-repeat',
                                      backgroundPosition : `${zoomImageCoordinate.x *100}%  ${zoomImageCoordinate.y *100}% `
                                      }}>

                                    </div>
                               </div>
                              )
                            }
                           
                        </div>
                      <div className='h-full'>
                             {
                              loading ? (

                                 <div className='flex gap-2 lg:flex-col overflow-scroll scrollbar-none h-full'>
                                          {
                                productImageListLoading.map((el,index) => {
                                  return(
                                        <div className='h-20 w-20 bg-slate-200 rounded animate-pulse' key={"loadingImage"+index}>
                                        </div>
                                  )
                                })
                                          }
                                 </div>
                            
                              ) : (
                              <div className='flex gap-2 lg:flex-col overflow-scroll scrollbar-none h-full'>
                                          {
                                data?.productImage?.map((imgURL,index) => {
                                  return(
                                        <div className='h-20 w-20 bg-slate-200 p-1 rounded' key={imgURL}>
                                          <img src={imgURL} className='w-full h-full object-scale-down mix-blend-multiply cursor-pointer' onMouseEnter={()=>handleMouseEnterProduct(imgURL)} onClick={()=>handleMouseEnterProduct(imgURL)}/>
                                        </div>
                                  )
                                })
                                          }
                               </div>
                              )
                             }
                      </div>
                </div>
            {/**Product Details */}
               {
                loading ? (
                     <div className='flex flex-col gap-1'>
                     <p className='bg-slate-200 animate-pulse h-4 w-full rounded-full font-bold inline-block'></p>
                     <h2 className='text-2xl lg:text-4xl font-semibold capitalize bg-slate-200 animate-pulse h-4'></h2>
                     <h2 className='text-slate-500 bg-slate-200 animate-pulse h-4'></h2>
                     <div className='flex items-center font-medium gap-5'>
                      <p className='capitalize min-w-[100px] animate-pulse h-6 bg-slate-200'></p>
                      <p className='capitalize min-w-[100px] animate-pulse h-6 bg-slate-200'></p>
                     </div>
                     <div className='text-red-600 bg-slate-200 h-6 animate-pulse flex items-center gap-2'>
                     </div>
                     <div className='flex items-center gap-2 text-2xl lg:text-3xl font-medium my-1 animate-pulse'>
                      <p className='text-red-600 min-w-[100px] animate-pulse h-6 bg-slate-200'></p>
                      <p className='text-slate-400 line-through min-w-[100px] animate-pulse h-6 bg-slate-200'></p>
                     </div>
                      <h2 className='capitalize min-w-[100px] animate-pulse h-6 bg-slate-200'></h2>
                      <p className='capitalize min-w-[100px] animate-pulse h-6 bg-slate-200'></p>
                      <div className='flex items-center gap-3 my-2'>
                        <button className='bg-slate-200 rounded animate-pulse min-w-[100px] h-6'></button>
                        <button className='bg-slate-200 rounded animate-pulse min-w-[100px] h-6'></button>
                      </div>
                      <div>
                        <p className='bg-slate-200 rounded animate-pulse min-w-[100px] h-6'></p>
                        <p className='bg-slate-200 rounded animate-pulse min-w-[100px] h-10'></p>
                      </div>
                      <h2 className='bg-slate-200 rounded animate-pulse min-w-[100px] h-6'></h2>

                    </div>
                ) : (
                    <div className='flex flex-col gap-1'>
                     <p className='bg-blue-200 text-blue-600 px-2 rounded-full font-bold inline-block w-fit'>{data?.brandName}</p>
                     <h2 className='text-2xl lg:text-4xl font-semibold capitalize'>{data?.productName}</h2>
                     <h2 className=' text-green-700'>{data?.stock}</h2>
                     <div className='flex items-center font-medium gap-5'>
                      <p className='capitalize'>{data?.gender}</p>
                      <p className='capitalize'>{data?.category}</p>
                     </div>
                     <div className='text-red-600 flex items-center gap-2'>
                      <FaStar/>
                      <FaStar/>
                      <FaStar/>
                      <FaStar/>
                      <FaStarHalfAlt/>
                     </div>
                     <div className='flex items-center gap-2 text-2xl lg:text-3xl font-medium my-1'>
                      <p className='text-red-600'>{displayCEDICurrency(data?.sellingPrice)}</p>
                      <p className='text-slate-400 line-through'>{displayCEDICurrency(data?.price)}</p>
                     </div>
                      <h2 className='capitalize'>Colour : {data?.color}</h2>
                      <p>Size : {data?.size}</p>
                      <div className='flex items-center gap-3 my-2'>
                        <button className='border-2 border-red-600 rounded px-3 py-1 min-w-[100px] text-red-600 font-medium hover:bg-red-600 hover:text-white' onClick={(e)=>handleBuyProduct(e,data?._id)} >Buy</button>
                        <button className='border-2 border-red-600 rounded px-3 py-1 min-w-[100px] text-white bg-red-600 font-medium hover:bg-white hover:text-red-600' onClick={(e)=>handleAddToCart(e,data?._id)}>Add To Cart</button>
                      </div>
                      <div>
                        <p className='text-slate-600 font-medium my-1'>Description :</p>
                        <p>{data?.description}</p>
                      </div>
                      <h2 className='text-slate-600 font-medium my-1'>Material Type : {data?.material}</h2>

                </div>
                )
               }


          </div>

         {
          data.category && (
             <RecommendedProductDisplay  category={data?.category} heading={"Recommended Product"}/>
          )
         }
          

    </div>
  )
}

export default ProductDetails


