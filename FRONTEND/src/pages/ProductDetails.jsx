import React, { useEffect, useState, useCallback } from 'react'
import { useNavigate, useParams, useLocation } from 'react-router-dom'
import SummaryApi from '../common'
import { FaStar } from "react-icons/fa";
import { FaStarHalfAlt } from "react-icons/fa";
import { FaFacebook, FaTwitter, FaWhatsapp, FaLink, FaCheck, FaHeart, FaRegHeart } from "react-icons/fa";
import displayCEDICurrency from '../helpers/displayCurrency';
import VerticalCardProduct from '../components/VerticalCardProduct';
import RelatedProductDisplay from '../components/RelatedProductDisplay';
import RecommendedProducts from '../components/RecommendedProducts';
import addToCart from '../helpers/addToCart';
import addToWishlist from '../helpers/addToWishlist';
import Context from '../context';
import { useContext } from 'react';
import { toast } from 'react-toastify';
import { ProductSchema, BreadcrumbSchema } from '../components/StructuredData';
import Breadcrumb from '../components/Breadcrumb';

const ProductDetails = () => {
    const [data,setData] = useState({
        productName : "",
        brandName : "",
        category : "",
        productImage : [],
        description : "",
        stock : "",
        sizes : [],
        rating : 0,
        gender : "",
        color : "",
        colorVariants : [],
        material : "",
        price : "",
        sellingPrice : ""
    })
    
    const params = useParams()
    const location = useLocation()
    const [loading,setLoading] = useState(true)
    const productImageListLoading = new Array(4).fill(null)
    const [activeImage,setActiveImage] = useState("")
    const [selectedSize, setSelectedSize] = useState("")
    const [selectedColor, setSelectedColor] = useState("")

    const [zoomImageCoordinate,setZoomImageCoordinate] = useState({
      x : 0,
      y : 0
    })                       
const [zoomImage,setZoomImage]=useState(false)
const [copied, setCopied] = useState(false)
const [inWishlist, setInWishlist] = useState(false)
const [wishlistItems, setWishlistItems] = useState([])

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
          
          if (dataResponse?.data?.colorVariants && dataResponse?.data?.colorVariants.length > 0) {
              const firstColor = dataResponse?.data?.colorVariants[0]
              setSelectedColor(firstColor)
              setActiveImage(firstColor?.images[0] || dataResponse?.data?.productImage[0])
              if (firstColor?.sizes && firstColor?.sizes.length > 0) {
                  setSelectedSize(firstColor?.sizes[0])
              } else if (dataResponse?.data?.sizes && dataResponse?.data?.sizes.length > 0) {
                  setSelectedSize(dataResponse?.data?.sizes[0])
              }
          } else {
              setActiveImage(dataResponse?.data?.productImage[0])
              if (dataResponse?.data?.sizes && dataResponse?.data?.sizes.length > 0) {
                  setSelectedSize(dataResponse?.data?.sizes[0])
              }
          }
          
          checkWishlistStatus(dataResponse?.data?._id)
    }

    const checkWishlistStatus = async (productId) => {
      if (!productId) return
      try {
        const response = await fetch(SummaryApi.checkWishlist.url, {
          method: SummaryApi.checkWishlist.method,
          credentials: 'include',
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ productId })
        })
        const result = await response.json()
        setInWishlist(result.inWishlist || false)
      } catch (e) {
        console.error("Error checking wishlist:", e)
      }
    }

    const fetchWishlistItems = async () => {
      try {
        const response = await fetch(SummaryApi.getWishlist.url, {
          method: SummaryApi.getWishlist.method,
          credentials: 'include'
        })
        const result = await response.json()
        if (result.success && result.data) {
          const items = result.data.map(item => item._id)
          setWishlistItems(items)
        }
      } catch (e) {
        console.error("Error fetching wishlist:", e)
      }
    }

    const handleWishlist = async (productId) => {
      const result = await addToWishlist(productId)
      if (result.success) {
        setInWishlist(result.inWishlist)
      }
    }

    useEffect(()=>{
       window.scrollTo({ top: 0, behavior: 'instant' })
       fetchProductDetails()
       fetchWishlistItems()
    },[params])

    const handleMouseEnterProduct = (imageURL) =>{
      setActiveImage(imageURL)
    }

    const handleColorSelect = (colorVariant) => {
        setSelectedColor(colorVariant)
        if (colorVariant.images && colorVariant.images.length > 0) {
            setActiveImage(colorVariant.images[0])
        }
        if (colorVariant.sizes && colorVariant.sizes.length > 0) {
            if (!colorVariant.sizes.includes(selectedSize)) {
                setSelectedSize(colorVariant.sizes[0])
            }
        }
    }

    const getDisplayImages = () => {
        if (selectedColor && selectedColor.images && selectedColor.images.length > 0) {
            return selectedColor.images
        }
        return data?.productImage || []
    }

    const getDisplaySizes = () => {
        if (selectedColor && selectedColor.sizes && selectedColor.sizes.length > 0) {
            return selectedColor.sizes
        }
        return data?.sizes || []
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
        const availableSizes = getDisplaySizes()
        if (Array.isArray(availableSizes) && availableSizes.length > 0 && !selectedSize) {
            toast.error('Please select a size')
            return
        }
        const color = selectedColor?.colorName || data?.color || null
        await addToCart(e, id, selectedSize, color)
        fetchUserAddToCart()
    } 

  const handleBuyProduct = async(e,id) =>{
      const availableSizes = getDisplaySizes()
      if (Array.isArray(availableSizes) && availableSizes.length > 0 && !selectedSize) {
        toast.error('Please select a size')
        return
    }
      const color = selectedColor?.colorName || data?.color || null
      await addToCart(e, id, selectedSize, color)
      fetchUserAddToCart()
      navigate("/cart")
  }

  const getProductUrl = () => {
    const baseUrl = window.location.origin
    return `${baseUrl}/product/${params?.id}`
  }

  const shareOnFacebook = () => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(getProductUrl())}`
    window.open(url, '_blank', 'width=600,height=400')
  }

  const shareOnTwitter = () => {
    const text = `Check out this product: ${data?.productName}`
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(getProductUrl())}`
    window.open(url, '_blank', 'width=600,height=400')
  }

  const shareOnWhatsApp = () => {
    const text = `Check out this product: ${data?.productName} - ${getProductUrl()}`
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`
    window.open(url, '_blank')
  }

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(getProductUrl())
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const shareOptions = [
    { icon: <FaFacebook />, label: 'Facebook', onClick: shareOnFacebook, color: 'bg-blue-600 hover:bg-blue-700' },
    { icon: <FaTwitter />, label: 'Twitter', onClick: shareOnTwitter, color: 'bg-sky-500 hover:bg-sky-600' },
    { icon: <FaWhatsapp />, label: 'WhatsApp', onClick: shareOnWhatsApp, color: 'bg-green-500 hover:bg-green-600' },
    { icon: copied ? <FaCheck /> : <FaLink />, label: copied ? 'Copied!' : 'Copy Link', onClick: copyLink, color: copied ? 'bg-green-600' : 'bg-gray-600 hover:bg-gray-700' },
  ]
  return (
    <div className='container mx-auto px-3 md:px-6 lg:p-8'>
      <Breadcrumb items={data?.category ? [{ label: data.category, href: `/product-category?category=${data.category.toLowerCase()}` }, { label: data.productName }] : []} />
      <ProductSchema product={data} />
      <BreadcrumbSchema items={[
        { name: 'Home', url: 'https://lockerroom.com' },
        { name: data?.category || 'Products', url: `https://lockerroom.com/category/${data?.category}` },
        { name: data?.productName, url: `https://lockerroom.com/product/${data?._id}` }
      ]} />
          <div className='min-h-[200px] flex flex-col md:flex-row gap-4 md:gap-6'>
            {/**Product Image */}
                <div className='flex flex-col md:flex-row-reverse gap-3 md:gap-4 w-full md:w-auto'>
                        <div className='h-[280px] sm:h-[320px] md:h-72 lg:h-80 xl:h-96 w-full md:w-72 lg:w-80 xl:w-96 bg-slate-200 relative p-2'>
                               <img src={activeImage} className='h-full w-full object-contain md:object-scale-down mix-blend-multiply' onMouseMove={handleZoomImage} onMouseLeave={handleLeaveImageZoom}/>
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
                      <div className='overflow-x-auto scrollbar-none'>
                             {
                              loading ? (

                                 <div className='flex gap-2 md:flex-col overflow-x-auto md:overflow-x-hidden overflow-y-auto scrollbar-none'>
                                           {
                                 productImageListLoading.map((el,index) => {
                                   return(
                                         <div className='h-16 w-16 sm:h-20 sm:w-20 bg-slate-200 rounded animate-pulse flex-shrink-0' key={"loadingImage"+index}>
                                         </div>
                                   )
                                 })
                                           }
                                  </div>
                            
                              ) : (
                              <div className='flex gap-2 md:flex-col overflow-x-auto md:overflow-x-hidden overflow-y-auto scrollbar-none'>
                                          {
                                getDisplayImages().map((imgURL,index) => {
                                  return(
                                        <div className='h-16 w-16 sm:h-20 sm:w-20 bg-slate-200 p-1 rounded flex-shrink-0' key={`${imgURL}-${index}`}>
                                          <img src={imgURL} className='w-full h-full object-contain md:object-scale-down mix-blend-multiply cursor-pointer' onMouseEnter={()=>handleMouseEnterProduct(imgURL)} onClick={()=>handleMouseEnterProduct(imgURL)}/>
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
                    <div className='flex flex-col gap-1 w-full'>
                      <p className='bg-blue-200 text-blue-600 px-2 py-0.5 rounded-full font-bold inline-block w-fit text-xs sm:text-sm'>{data?.brandName}</p>
                      <h2 className='text-xl sm:text-2xl md:text-3xl lg:text-4xl font-semibold capitalize leading-tight'>{data?.productName}</h2>
                      <p className='text-xs text-slate-400'>Product ID: {data?._id}</p>
                      <h2 className='text-green-700 text-sm sm:text-base'>{data?.stock}</h2>
                     <div className='flex items-center font-medium gap-3 sm:gap-5 text-xs sm:text-sm'>
                      <p className='capitalize'>{data?.gender}</p>
                      <p className='capitalize'>{data?.category}</p>
                     </div>
                      <div className='flex items-center gap-1 sm:gap-2 text-sm sm:text-base'>
                       {(() => {
                         const rating = data?.rating || 0
                         const fullStars = Math.floor(rating)
                         const hasHalfStar = rating % 1 >= 0.5
                         const stars = []
                         
                         for (let i = 0; i < 5; i++) {
                           if (i < fullStars) {
                             stars.push(<FaStar key={i} />)
                           } else if (i === fullStars && hasHalfStar) {
                             stars.push(<FaStarHalfAlt key={i} />)
                           } else {
                             stars.push(<FaStar key={i} style={{ opacity: 0.3 }} />)
                           }
                         }
                         return stars
                       })()}
                       <span className='text-slate-500 text-xs sm:text-sm ml-1'>({data?.rating || 0})</span>
                      </div>
                      <div className='flex items-center gap-2 text-xl sm:text-2xl lg:text-3xl font-medium my-1'>
                       <p className='text-red-600'>{displayCEDICurrency(data?.sellingPrice)}</p>
                       <p className='text-slate-400 line-through text-base sm:text-lg'>{displayCEDICurrency(data?.price)}</p>
                       {data?.price > data?.sellingPrice && (
                          <span className='text-xs sm:text-sm bg-green-100 text-green-700 px-2 py-0.5 sm:py-1 rounded-full font-medium'>
                              -{Math.round(((data?.price - data?.sellingPrice) / data?.price) * 100)}%
                          </span>
                       )}
                      </div>
                       <h2 className='capitalize'>
                        {data?.colorVariants && data?.colorVariants.length > 0 ? (
                            <div className="my-2 sm:my-3">
                                <p className="font-medium mb-1 sm:mb-2 text-sm sm:text-base">Select Color:</p>
                                <div className="flex gap-2 flex-wrap">
                                    {data.colorVariants.map((colorVariant, idx) => (
                                        <button
                                            key={idx}
                                            type="button"
                                            onClick={() => handleColorSelect(colorVariant)}
                                            className={`px-3 sm:px-4 py-1.5 sm:py-2 border rounded-full font-medium transition-colors text-xs sm:text-sm ${
                                                selectedColor?.colorName === colorVariant.colorName 
                                                ? 'bg-red-600 text-white border-red-600' 
                                                : 'border-gray-300 hover:border-red-600'
                                            }`}
                                        >
                                            {colorVariant.colorName}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <p className='text-sm sm:text-base'>Colour : {data?.color}</p>
                        )}
                       </h2>
                      
                        <div className="my-2 sm:my-3">
                          <p className="font-medium mb-1 sm:mb-2 text-sm sm:text-base">Select Size:</p>
                          <div className="flex gap-2 flex-wrap">
                            {(() => {
                              const displaySizes = getDisplaySizes()
                              return Array.isArray(displaySizes) && displaySizes.map((size, idx) => (
                                <button
                                  key={idx}
                                  type="button"
                                  onClick={() => setSelectedSize(size)}
                                  className={`px-3 sm:px-4 py-1.5 sm:py-2 border rounded-full font-medium transition-colors text-xs sm:text-sm ${
                                    selectedSize === size 
                                    ? 'bg-red-600 text-white border-red-600' 
                                    : 'border-gray-300 hover:border-red-600'
                                  }`}
                                >
                                  {size}
                                </button>
                              ))
                            })()}
                            {getDisplaySizes().length === 0 && (
                              <span className="text-slate-500 text-sm">No sizes available</span>
                            )}
                          </div>
                        </div>
                      <div className='flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 my-3 sm:my-4'>
                         <button className='border-2 border-red-600 rounded px-3 sm:px-4 py-2.5 sm:py-2 min-w-[100px] sm:min-w-[120px] text-red-600 font-medium hover:bg-red-600 hover:text-white text-sm sm:text-base' onClick={(e)=>handleBuyProduct(e,data?._id)} >Buy</button>
                         <button className='border-2 border-red-600 rounded px-3 sm:px-4 py-2.5 sm:py-2 min-w-[100px] sm:min-w-[120px] text-white bg-red-600 font-medium hover:bg-white hover:text-red-600 text-sm sm:text-base' onClick={(e)=>handleAddToCart(e,data?._id)}>Add To Cart</button>
                      </div>

                      <div className='mt-3 sm:mt-4'>
                        <p className='text-slate-600 font-medium my-1 sm:my-2 text-sm sm:text-base'>Description :</p>
                        <div className='text-slate-600 whitespace-pre-wrap leading-relaxed text-sm sm:text-base'>
                          {data?.description}
                        </div>
                      </div>
                      <h2 className='text-slate-600 font-medium my-1 sm:my-2 text-sm sm:text-base'>Material Type : {data?.material}</h2>

                </div>
                )
               }


            </div>
                    <div className='my-4 sm:my-6 flex flex-col sm:flex-row gap-3 sm:gap-4 sm:items-center sm:justify-between'>
                      <button
                        onClick={() => handleWishlist(data?._id)}
                        className={`p-2.5 sm:p-2 rounded-full transition-colors w-fit ${
                          inWishlist 
                          ? 'bg-red-100 text-red-600' 
                          : 'bg-gray-100 text-gray-600 hover:bg-red-100 hover:text-red-600'
                        }`}
                        title={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
                      >
                        {inWishlist ? <FaHeart size={20} /> : <FaRegHeart size={20} />}
                      </button>
                      <div className='flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-2'>
                         <p className='text-slate-600 font-medium text-sm sm:text-base'>SHARE THIS PRODUCT:</p>
                         <div className='flex gap-2'>
                           {shareOptions.map((option, index) => (
                             <button
                               key={index}
                               onClick={option.onClick}
                               className={`${option.color} text-white p-2 sm:p-2 rounded-full transition-colors`}
                               title={option.label}
                             >
                               {option.icon}
                             </button>
                           ))}
                         </div>
                        </div>
                       </div>
          {
            data.category && (
               <RelatedProductDisplay  category={data?.category} heading={"Related Products"} gender={data?.gender}/>
            )
           }

          <RecommendedProducts currentProductId={data?._id} wishlistItems={wishlistItems} />


    </div>
  )
}

export default ProductDetails


