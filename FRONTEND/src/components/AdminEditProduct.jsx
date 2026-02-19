
import React, { useState } from 'react'
import { CgClose } from "react-icons/cg";
import productCategory from '../helpers/productCategory';
import stockAvailable from '../helpers/stockAvailable';
import genderType from '../helpers/genderType'
import { FaCloudUploadAlt } from "react-icons/fa";
import uploadImage from '../helpers/uploadImage';
import DisplayImage from './DisplayImage';
import { MdDelete } from "react-icons/md";
import SummaryApi from '../common';
import { toast } from 'react-toastify'

const AdminEditProduct = ({
      onClose,
      productData,
      fetchdata
    }
) => {
    const [data,setData] = useState({
        ...productData,
        productName : productData?.productName,
        brandName : productData?.brandName,
        category : productData?.category,
        productImage : productData?.productImage || [],
        description : productData?.description,
        stock : productData?.stock,
        quantity : productData?.quantity || 0,
        location : productData?.location || '',
        color : productData?.color,
        sizes : productData?.sizes || [],
        price : productData?.price,
        sellingPrice : productData?.sellingPrice,
        rating : productData?.rating || 0
    })
    const [openFullScreenImage,setOpenFullScreenImage] = useState(false)
    const [fullScreenImage,setFullScreenImage] = useState("")
    const [sizeInput, setSizeInput] = useState("")

    const handleOnChange = (e)=>{
       const { name, value } = e.target


        setData((previous)=> {
            return{
                ...previous,
               [name] : value
            }
        })
    }

    const handleUploadProduct = async(e) =>{
    const file = e.target.files[0]
    const uploadImageCloudinary = await uploadImage(file)

        setData((previous)=> {
            return{
                ...previous,
                productImage : [ ...previous.productImage, uploadImageCloudinary.url]
            }
        })
    }
    const handleDeleteProductImage = async(index)=>{
     console.log("image index",index)

      const newProductImage = [...data.productImage]
      newProductImage.splice(index,1)


        setData((previous)=> {
            return{
                ...previous,
                productImage : [ ...newProductImage]
            }
        })
    }

    const handleAddSize = () => {
        if (!sizeInput.trim()) return
        if (data.sizes.includes(sizeInput.trim())) {
            return
        }
        setData((previous) => ({
            ...previous,
            sizes: [...previous.sizes, sizeInput.trim()]
        }))
        setSizeInput("")
    }

    const handleRemoveSize = (index) => {
        const newSizes = [...data.sizes]
        newSizes.splice(index, 1)
        setData((previous) => ({
            ...previous,
            sizes: newSizes
        }))
    }

    {/**upload product */}
    const handleSubmit = async(e) =>{
      e.preventDefault()
      
      const response = await fetch (SummaryApi.updateProduct.url,{
        method : SummaryApi.updateProduct.method,
        credentials : 'include',
        headers : {
            "content-type" : "application/json"
        },
        body : JSON.stringify(data)
      })


      const responseData = await response.json()

     if (responseData.success) {
       toast.success(responseData?.message)
       onClose()
       fetchdata()
     }

        if (responseData.error) {
       toast.error(responseData?.message)
     }

    }
  return (
     <div className='fixed w-full h-full bg-slate-200 bg-opacity-35 top-0 bottom-0 left-0 right-0 flex justify-center items-center z-50'>
           <div className='bg-white p-4 rounded w-full max-w-2xl h-full max-h-[80%] overflow-hidden'>
               <div className='flex justify-between items-center pb-3'>
                   <h2 className='font-bold text-lg'>Edit Product</h2>
                   <div className='w-fit ml-auto text-2xl hover:text-red-600 cursor-pointer' onClick={onClose}>
                       <CgClose />
                    </div>
               </div>
               
            <form className='grid p-4 gap-2 overflow-y-scroll h-full pb-5' onSubmit={handleSubmit}> 
               <label htmlFor='productName'>Product Name :</label>
               <input 
               type='text'
               id='productName' 
               placeholder='enter product name' 
               name='productName'
               value={data.productName} 
               onChange={handleOnChange}
               className='p-2 bg-slate-100 border rounded'
               required
               />
   
   
              <label htmlFor='brandName' className='mt-3'>Brand Name :</label>
               <input 
               type="text" 
               id='brandName' 
               placeholder='enter brand name' 
               name='brandName'
               value={data.brandName} 
               onChange={handleOnChange}
               className='p-2 bg-slate-100 border rounded'
               required
               />
   
               <label htmlFor='category' className='mt-3'>Category :</label>
               <select required value={data.category} name='category' onChange={handleOnChange} className='p-2 bg-slate-100 border rounded'>
                    <option value={""}>Select Category</option>
                  {
                   productCategory.map((el,index)=>{
                       return(
                           <option value={el.value} key={el.value+index}>{el.label}</option>
                       )
                   })
                  }
   
               </select>

                           <label htmlFor='gender' className='mt-3'>Gender :</label>
                           <select required value={data.gender} name='gender' onChange={handleOnChange} className='p-2 bg-slate-100 border rounded'>
                                <option value={""}>Select Gender</option>
                              {
                               genderType.map((el,index)=>{
                                   return(
                                       <option value={el.value} key={el.value+index}>{el.label}</option>
                                   )
                               })
                              }
               
                   </select>

            <label htmlFor='stock' className='mt-3'>Stock :</label>
            <select required value={data.stock} name='stock' onChange={handleOnChange} className='p-2 bg-slate-100 border rounded'>
                 <option value={""}>Select Stock</option>
               {
                stockAvailable.map((el,index)=>{
                    return(
                        <option value={el.value} key={el.value+index}>{el.label}</option>
                    )
                })
               }

            </select>

            <label htmlFor='quantity' className='mt-3'>Quantity :</label>
            <input 
            type='number' 
            id='quantity' 
            placeholder='Enter quantity' 
            name='quantity'
            value={data.quantity} 
            onChange={handleOnChange}
            className='p-2 bg-slate-100 border rounded'
            min="0"
            />

            <label htmlFor='location' className='mt-3'>Location :</label>
            <input 
            type='text' 
            id='location' 
            placeholder='Enter location' 
            name='location'
            value={data.location} 
            onChange={handleOnChange}
            className='p-2 bg-slate-100 border rounded'
            />
    
               <label htmlFor='productImage' className='mt-3'>Product Photo :</label>
                  <label htmlFor='uploadImageInput'>
                      <div className='p-2 bg-slate-100 border rounded h-32 w-full flex justify-center items-center cursor-pointer'>
                     <div className='text-slate-500 flex justify-center items-center flex-col gap-2'>
                       <span className='text-4xl'> <FaCloudUploadAlt /></span>
                        <p className='text-sm'>Upload Product Photo</p>
                        <input type="file" id='uploadImageInput' className='hidden' onChange={handleUploadProduct}/>
                     </div>
                    </div>
                 </label>
                <div>
                   {
                       data?.productImage[0] ? (
                      <div className='flex items-center gap-2'>
                           {
                               data.productImage.map((el,index)=>{
                               return(
                                   <div className='relative group'>
                                   <img 
                                   src={el}
                                   alt={el} 
                                   width={80} 
                                   height={80}    
                                   className='bg-slate-100 border cursor-pointer' 
                                   onClick={()=>{
                                    setOpenFullScreenImage(true)
                                    setFullScreenImage(el)
                                  }}/>
   
                                  <div className='absolute bottom-0 right-0 p-1 text-white bg-red-600 rounded-full cursor-pointer hidden group-hover:block' onClick={()=>handleDeleteProductImage(index)}>
                                   <MdDelete/>
                                  </div>
                                </div>
                              
                               )
                            })
                           }
                      </div>
                       ) : (
                         <p className='text-red-600 text-xs'>*Please upload product image</p>
                       )
                   }
                  
                </div>
   
               <label htmlFor='price' className='mt-3'>Price :</label>
               <input 
               type='number' 
               id='price' 
               placeholder='enter price' 
               name='price'
               value={data.price} 
               onChange={handleOnChange}
               className='p-2 bg-slate-100 border rounded'
               required
               />
   
   
   
               <label htmlFor='sellingPrice' className='mt-3'>Selling Price :</label>
               <input 
               type='number'
               id='sellingPrice' 
               placeholder='enter selling price' 
               name='sellingPrice'
               value={data.sellingPrice} 
               onChange={handleOnChange}
               className='p-2 bg-slate-100 border rounded'
               required
               />

             <label htmlFor='rating' className='mt-3'>Rating (0-5):</label>
             <input 
             type='number'
             id='rating' 
             placeholder='enter rating (0-5)' 
             name='rating'
             value={data.rating} 
             onChange={handleOnChange}
             min="0"
             max="5"
             step="0.1"
             className='p-2 bg-slate-100 border rounded'
             />
          
             <label htmlFor='size' className='mt-3'>Sizes (select multiple):</label>
            <div className='flex gap-2 mb-2'>
                <input 
                type="text" 
                id='size' 
                placeholder='e.g., S, M, L, XL' 
                name='size'
                value={sizeInput} 
                onChange={(e) => setSizeInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSize())}
                className='p-2 bg-slate-100 border rounded flex-1'
                />
                <button
                    type='button'
                    onClick={handleAddSize}
                    className='px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600'
                >
                    Add
                </button>
            </div>
            <div className='flex gap-2 flex-wrap mb-2'>
                {data.sizes.map((size, index) => (
                    <span key={index} className='px-3 py-1 bg-slate-200 rounded-full flex items-center gap-1'>
                        {size}
                        <button
                            type='button'
                            onClick={() => handleRemoveSize(index)}
                            className='text-red-500 hover:text-red-700'
                        >
                            ×
                        </button>
                    </span>
                ))}
            </div>

            <label htmlFor='color' className='mt-3'>Colour :</label>
            <input 
            type="text" 
            id='color' 
            placeholder='enter product colour' 
            name='color'
            value={data.color} 
            onChange={handleOnChange}
            className='p-2 bg-slate-100 border rounded'
            required
            />
   
                <label htmlFor='description' className='mt-3'>Description :</label>
                  <textarea 
                  className='h-40 bg-slate-100 border p-2 resize-none' 
                  placeholder='Enter product description. Use new lines for paragraphs.' 
                  rows={5} 
                  onChange={handleOnChange} 
                  name='description'
                  value={data.description}
                  >
                  </textarea>
                  <p className='text-xs text-slate-500 mt-1'>Use new lines to separate paragraphs</p>
   
                 <button className='px-3 py-2 bg-red-600 text-white mb-10 hover:bg-red-700'>Update Product</button>
            </form>
   
           </div>
   
   
           {/***Display image full width */}
           {
               openFullScreenImage && (
                 <DisplayImage onClose={()=>setOpenFullScreenImage(false)} imgUrl={fullScreenImage}/>  
               )
           }
           
       </div>
  )
}

export default AdminEditProduct