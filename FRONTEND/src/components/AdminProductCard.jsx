import React, { useState } from 'react'
import { MdModeEditOutline } from "react-icons/md";
import AdminEditProduct from './AdminEditProduct';
import displayCEDICurrency from '../helpers/displayCurrency';
import SummaryApi from '../common';
import { toast } from 'react-toastify';

const AdminProductCard = ({
     data,
     fetchdata
}) => {
    const [editProduct,setEditProduct] = useState(false)

    const handleDelete = async () => {
        if (!window.confirm('Are you sure you want to delete this product?')) {
            return
        }

        try {
            const response = await fetch(SummaryApi.deleteProduct.url, {
                method: SummaryApi.deleteProduct.method,
                credentials: 'include',
                headers: {
                    "content-type": "application/json"
                },
                body: JSON.stringify({ productId: data._id })
            })

            const result = await response.json()

            if (result.success) {
                toast.success(result.message || 'Product deleted successfully')
                fetchdata()
            } else {
                toast.error(result.message || 'Failed to delete product')
            }
        } catch (error) {
            toast.error('Something went wrong')
        }
    }

  return (
        <div className='bg-white p-4 rounded'>
          <div className='w-40'>
            <div className='w-40 h-32 flex justify-center items-center'>
                 <img src={data?.productImage[0]}  className='mx-auto object-fill h-full w-full'/>
            </div>
              <h1 className='text-ellipsis line-clamp-1'>{data.productName}</h1>
             
             <div>
               
               <p className='font-semibold'>
               {
                   displayCEDICurrency(data.sellingPrice)
               }
               </p>

                <div className='flex items-center gap-2'>
                 <div className='w-fit ml-auto p-2 bg-green-100 hover:bg-green-600 rounded-full hover:text-white cursor-pointer' onClick={()=>setEditProduct(true)}> 
                   <MdModeEditOutline />
                 </div>
                 <button 
                    onClick={handleDelete}
                    className='w-fit p-2 bg-red-100 hover:bg-red-600 rounded-full hover:text-white cursor-pointer'
                    title='Delete Product'
                 >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    </svg>
                 </button>
                </div>
             </div>
          </div>

              {
                editProduct && (
                     <AdminEditProduct productData={data} onClose={()=>setEditProduct(false)} fetchdata={fetchdata}/>
                )
              }
             
        </div>
  )
}

export default AdminProductCard
