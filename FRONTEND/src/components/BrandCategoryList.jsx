import React from 'react'
import { useEffect } from 'react'
import { useState } from 'react'
import SummaryApi from '../common'
import { Link } from 'react-router-dom'


const BrandCategoryList = ({heading}) => {
   const [brandCategoryProduct,setBrandCategoryProduct] = useState([])
   const [loading,setLoading] = useState(false)

   const categoryLoading = new Array(13).fill(null)
  
   const fetchBrandCategoryProduct = async()=>{
    setLoading(true)
    const response = await fetch(SummaryApi.brandCategory.url)
    const dataResponse = await response.json()
    setLoading(false)
    setBrandCategoryProduct(dataResponse.data)
   }

   useEffect(()=>{
      fetchBrandCategoryProduct()
   },[])

  return (
    <div className='container mx-auto p-4'>
        <h2 className='text-2xl font-bold py-4'>{heading}</h2>
      <div className='flex items-center gap-4 justify-between overflow-scroll scrollbar-none'>
        { 
             
             loading ? (
                
                    categoryLoading.map((el,index)=>{
                        return(
                              <div className='h-16 w-16 md:h-20 md:w-20 rounded-full overflow-hidden bg-slate-200 animate-pulse' key={"categoryLoading"+index}>  </div>
                        )
                    })
             ) :
            (
                brandCategoryProduct.map((product,index)=>{
                return(
                    <Link to={"/brand-category/"+product?.brandName} className='cursor-pointer' key={product?.brandName}>
                        <div className='w-16 h-16 md:w-20 md:h-20 rounded-full overflow-hidden p-4 bg-slate-200 flex items-center justify-center'>
                            <img src ={product?.productImage[0]} alt={product?.brandName} className='h-full object-scale-down mix-blend-multiply hover:scale-x-125 transition-all' />
                        </div>
                        <p className='text-center text-sm md:text-base capitalize'>{product?.brandName}</p>
                    </Link>
                )
            })
            )
        }
      </div>
    </div>
  )
}

export default BrandCategoryList