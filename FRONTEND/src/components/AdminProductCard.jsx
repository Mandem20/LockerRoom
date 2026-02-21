import React, { useState } from 'react'
import { MdModeEditOutline } from "react-icons/md";
import AdminEditProduct from './AdminEditProduct';
import displayCEDICurrency from '../helpers/displayCurrency';
import SummaryApi from '../common';
import { toast } from 'react-toastify';
import moment from 'moment';

const AdminProductCard = ({
     data,
     fetchdata
}) => {
    const [editProduct,setEditProduct] = useState(false)
    const [showInventory, setShowInventory] = useState(false)
    const [inventory, setInventory] = useState({
        quantity: data?.quantity || 0,
        location: data?.location || ''
    })

    const getStockStatus = () => {
        const qty = data?.quantity || 0
        if (qty === 0) return { label: 'Out of Stock', color: 'bg-red-100 text-red-700' }
        if (qty <= 5) return { label: 'Low Stock', color: 'bg-yellow-100 text-yellow-700' }
        return { label: 'In Stock', color: 'bg-green-100 text-green-700' }
    }

    const stockStatus = getStockStatus()

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

    const handleUpdateInventory = async () => {
        try {
            const response = await fetch(SummaryApi.updateInventory.url, {
                method: SummaryApi.updateInventory.method,
                credentials: 'include',
                headers: {
                    "content-type": "application/json"
                },
                body: JSON.stringify({ 
                    productId: data._id,
                    quantity: parseInt(inventory.quantity),
                    location: inventory.location
                })
            })

            const result = await response.json()

            if (result.success) {
                toast.success('Inventory updated successfully')
                fetchdata()
                setShowInventory(false)
            } else {
                toast.error(result.message || 'Failed to update inventory')
            }
        } catch (error) {
            toast.error('Something went wrong')
        }
    }

  return (
        <div className='bg-white p-4 rounded relative'>
          <div className='w-40'>
            <div className='w-40 h-32 flex justify-center items-center'>
                 <img src={data?.productImage[0]}  className='mx-auto object-fill h-full w-full' loading="lazy" alt={data?.productName}/>
            </div>
              <h1 className='text-ellipsis line-clamp-1'>{data.productName}</h1>
              
              <div>
                
                <p className='font-semibold'>
                {
                    displayCEDICurrency(data.sellingPrice)
                }
                </p>

                <div className='mt-1'>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${stockStatus.color}`}>
                        {stockStatus.label}
                    </span>
                </div>

                <div className='text-xs text-gray-500 mt-1'>
                    Qty: {data?.quantity || 0}
                </div>

                 <div className='flex items-center gap-2 mt-2'>
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
