import React from 'react'
import { useState } from 'react'
import SummaryApi from '../common'
import { useEffect } from 'react'
import { useContext } from 'react'
import Context from '../context'
import displayCEDICurrency from '../helpers/displayCurrency'
import { MdDelete } from "react-icons/md";
import { FaShippingFast, FaShieldAlt, FaUndo } from 'react-icons/fa'
import { useNavigate } from 'react-router-dom'

const Cart = () => {
    const [data,setData] = useState([])
    const [loading,setLoading] = useState(false)
    const context = useContext(Context)
    const navigate = useNavigate()
    const loadingCart = new Array(context.cartProductCount).fill(null)
    const [address, setAddress] = useState('')
    const [phone, setPhone] = useState('')


    const fetchData = async() =>{
     
        const response = await fetch(SummaryApi.addToCartProductView.url,{
            method : SummaryApi.addToCartProductView.method,
            credentials : 'include',
            headers : {
                 "content-type" : 'application/json'
            },
        })
      


        const responseData = await response.json()

        if(responseData.success){
            setData(responseData.data)
        }
    }

    const handleLoading = async()=>{
       await fetchData()
    }
    useEffect(()=>{
        setLoading(true)
        handleLoading()
        setLoading(false)    
    },[])

   const increaseQty = async(id,qty) =>{
     const response = await fetch(SummaryApi.updateCartProduct.url,{
        method : SummaryApi.updateCartProduct.method,
        credentials : 'include',
        headers : {
            "content-type" : "application/json"
        },
        body : JSON.stringify(
            {
             _id : id,
             quantity : qty + 1
            }
        )
     })

     const responseData = await response.json()

     if(responseData.success){
        fetchData()
     }
   }

   const decreaseQty = async(id,qty) =>{
     if(qty >= 2){
        const response = await fetch(SummaryApi.updateCartProduct.url,{
        method : SummaryApi.updateCartProduct.method,
        credentials : 'include',
        headers : {
            "content-type" : "application/json"
        },
        body : JSON.stringify(
            {
              _id : id,
             quantity : qty - 1
            }
        )
     })

     const responseData = await response.json()

     if(responseData.success){
         fetchData()
       }
     }
   }

    const deleteCartProduct = async (id) =>{
         const response = await fetch(SummaryApi.deleteCartProduct.url,{
         method : SummaryApi.deleteCartProduct.method,
         credentials : 'include',
         headers : {
             "content-type" : "application/json"
         },
         body : JSON.stringify(
             {
               _id : id,
             }
         )
      })

      const responseData = await response.json()

      if(responseData.success){
          fetchData()
          context.fetchUserAddToCart()
        }
    }

    const totalQty = data.reduce((previousValue,currentValue)=>previousValue + currentValue.quantity,0)
    const subtotal = data.reduce((preve,curr) => preve + (curr.quantity * curr?.productId?.sellingPrice) ,0 )
    const tax = subtotal * 0.15
    const shipping = subtotal >= 500 ? 0 : 20
    const totalPrice = subtotal + tax + shipping
  return (
    <div className='container mx-auto pt-6'>
        <div className='text-center text-lg my-3'>
         {
            data.length === 0 && !loading && (
                <p className='bg-white py-5'>No Data</p>
            )
        }
        </div>

        <div className='flex flex-col lg:flex-row gap-10 lg:justify-between p-4'>
            {/**View Cart Product */}
               <div className='w-full max-w-3xl'>
                   {
                    loading ? (
                        loadingCart.map((el,index) => {
                            return(
                          <div key={el+"Add To Cart Loading"+index} className='w-full bg-slate-200 h-32 my-2 border border-slate-300 animate-pulse rounded'>

                          </div>
                            )
                        })
                        
                    ) : (
                      data.map((product,index)=>{
                          return(
                            <div key={product?._id+"Add To Cart Loading"} className='w-full bg-white border border-slate-200 rounded-lg overflow-hidden'>
                                <div className='flex'>
                                    <div className='w-24 md:w-32 h-24 md:h-32 bg-slate-100 flex-shrink-0'>
                                        {product?.productId?.productImage?.[0] ? (
                                            <img 
                                                src={product?.productId?.productImage[0]} 
                                                alt={product?.productId?.productName}
                                                className='w-full h-full object-cover'
                                            />
                                        ) : (
                                            <div className='w-full h-full flex items-center justify-center text-slate-400'>
                                                No Image
                                            </div>
                                        )}
                                    </div>
                                    <div className='p-3 flex-1 relative'>
                                        {/**Delete product */}
                                        <div className='absolute right-2 top-2 text-red-600 rounded-full p-1 hover:bg-red-600 hover:text-white cursor-pointer' onClick={()=>deleteCartProduct(product?._id)}>
                                            <MdDelete size={18}/>
                                        </div>
                                        <h2 className='text-lg text-ellipsis line-clamp-1 font-medium'>{product?.productId?.productName}</h2>
                                        <p className='capitalize text-sm text-slate-500'>{product?.productId?.category}</p>
                                        {product?.productId?.brand && (
                                            <p className='text-sm text-slate-500'>Brand: {product?.productId?.brand}</p>
                                        )}
                                        {product?.color && (
                                            <p className='text-sm text-slate-500'>Color: {product?.color}</p>
                                        )}
                                        {product?.size && (
                                            <p className='text-sm text-slate-500'>Size: {product?.size}</p>
                                        )}
                                        <p className='text-sm text-green-600 mt-1'>In Stock</p>
                                        <div className='flex items-center justify-between mt-2'> 
                                            <p className='text-red-600 font-bold'>{displayCEDICurrency(product?.productId?.sellingPrice)}</p>
                                            <p className='font-semibold text-slate-700'>{displayCEDICurrency(product?.productId?.sellingPrice * product?.quantity)}</p>
                                        </div>
                                        <div className='flex items-center gap-3 mt-2'>
                                            <button className='border border-red-600 text-red-600 hover:bg-red-600 hover:text-white w-6 h-6 flex justify-center items-center rounded text-sm' onClick={()=>decreaseQty(product?._id,product?.quantity)}>-</button>
                                            <span className='text-sm font-medium'>{product?.quantity}</span>
                                            <button className='border border-red-600 text-red-600 hover:bg-red-600 hover:text-white w-6 h-6 flex justify-center items-center rounded text-sm' onClick={()=>increaseQty(product?._id,product?.quantity)}>+</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                          )
                      })
                    )
                   }
               </div>

               {/**TOTAL PRODUCT PURCHASED */}
             <div className='mt-5 lg:mt-0 w-full max-w-sm'> 
                  {
                     loading ? (
                         <div className='h-64 bg-slate-200 border border-slate-300 animate-pulse'>
                                             
                         </div>
                     ) : (
                     <div className='bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden'>
                         <h2 className='text-white bg-red-600 px-4 py-3 font-semibold'>Order Summary</h2>
                         
                         {data.length > 0 && (
                             <div className='p-4 space-y-3'>
                                 <div className='flex items-center justify-between text-sm'>
                                     <p className='text-slate-500'>Subtotal ({totalQty} items)</p>
                                     <p className='font-medium'>{displayCEDICurrency(subtotal)}</p>
                                 </div>
                                 <div className='flex items-center justify-between text-sm'>
                                     <p className='text-slate-500'>Tax (15%)</p>
                                     <p className='font-medium'>{displayCEDICurrency(tax)}</p>
                                 </div>
                                 <div className='flex items-center justify-between text-sm'>
                                     <p className='text-slate-500'>Shipping</p>
                                     <p className='font-medium text-green-600'>
                                         {shipping === 0 ? 'Free' : displayCEDICurrency(shipping)}
                                     </p>
                                 </div>
                                 
                                 <div className='border-t pt-3'>
                                     <div className='flex items-center justify-between font-bold text-lg'>
                                         <p>Total</p>
                                         <p className='text-red-600'>{displayCEDICurrency(totalPrice)}</p>
                                     </div>
                                 </div>

                                 <div className='pt-3 space-y-2'>
                                     <label className='text-sm text-slate-500 block'>Delivery Address</label>
                                     <textarea
                                         value={address}
                                         onChange={(e) => setAddress(e.target.value)}
                                         placeholder='Enter your delivery address'
                                         className='w-full border rounded px-3 py-2 text-sm focus:outline-none focus:border-red-500 h-20 resize-none'
                                     />
                                 </div>

                                 <div className='pt-3 space-y-2'>
                                     <label className='text-sm text-slate-500 block'>Phone Number</label>
                                     <input
                                         type='tel'
                                         value={phone}
                                         onChange={(e) => setPhone(e.target.value)}
                                         placeholder='Enter phone number'
                                         className='w-full border rounded px-3 py-2 text-sm focus:outline-none focus:border-red-500'
                                     />
                                 </div>
                             </div>
                         )}

                         <div className='border-t p-4 space-y-3'>
                             <div className='flex items-center gap-3 text-sm text-slate-600'>
                                 <FaShippingFast className='text-red-600' />
                                 <span>Free shipping on orders above GHS 500</span>
                             </div>
                             <div className='flex items-center gap-3 text-sm text-slate-600'>
                                 <FaShieldAlt className='text-red-600' />
                                 <span>Secure payment</span>
                             </div>
                             <div className='flex items-center gap-3 text-sm text-slate-600'>
                                 <FaUndo className='text-red-600' />
                                 <span>Easy returns within 7 days</span>
                             </div>
                         </div>

                         {data.length > 0 && (
                             <div className='p-4 border-t bg-gray-50'>
                                 <button 
                                    onClick={() => {
                                        if (!address || !phone) {
                                            toast.error('Please enter delivery address and phone number')
                                            return
                                        }
                                        toast.success('Proceeding to checkout...')
                                    }}
                                    className='bg-red-600 p-3 text-white w-full font-semibold rounded-lg hover:bg-red-700 transition-colors'
                                 >
                                     Proceed to Checkout
                                 </button>
                             </div>
                         )}
                     </div>  
                     )
                }
              </div>
               
        </div>
    </div>
  )
}

export default Cart