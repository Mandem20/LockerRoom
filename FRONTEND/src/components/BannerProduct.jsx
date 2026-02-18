import React, { useEffect, useState } from 'react'
import { FaAngleRight } from "react-icons/fa6";
import { FaAngleLeft } from "react-icons/fa6";
import image1 from '../assets/banner/53386621_NjIwLTU1MC0zY2Q5NThjNGQw.webp'
import image2 from '../assets/banner/74116783.jpg'
import image3 from '../assets/banner/Black-Stars-Antoine-Semenyo-in-Ghana-yellow1.jpg'
import image4 from '../assets/banner/blackstars.png'
import image5 from '../assets/banner/hearts-of-oak-1.jpg'
import image6 from '../assets/banner/OakFront-650x0.jpg'
import image7 from '../assets/banner/puma.png'
import image8 from '../assets/banner/a826f9bc-a3ef-429c-9e82-e522b0905994.webp'


const BannerProduct = () => {
   const [currentImage,setCurrentImage] = useState(0)


    const desktopImages =[
        image1,
        image2,
        image3,
        image4,
     
        
    ]


    const mobileImages =[
        image5,
         image6,
        image7,
        image8
        
    ]

    const nextImage = () =>{
        if(desktopImages.length - 1 > currentImage){
            setCurrentImage(previous => previous + 1) 
        }    
    }

        const previousImage = () =>{
        if(currentImage !=0){
            setCurrentImage(previous => previous - 1) 
        }    
    }

    useEffect(()=>{
        const interval = setInterval(()=>{
           if(desktopImages.length - 1 > currentImage){
            nextImage()
           }else{
            setCurrentImage(0)
           }
        },5000)

        return ()=> clearInterval(interval)
    },[currentImage])

  return (
    <div className='container mx-auto px-4 rounded'>
        <div className='h-72 md:h-72 w-full bg-slate-200 relative'>

            <div className='absolute z-10 h-full w-full md:flex items-center hidden'>
                  <div className='flex justify-between w-full text-2xl'>
                       <button onClick={previousImage} className='bg-white shadow-md rounded-full p-1'><FaAngleLeft/></button>
                       <button onClick={nextImage} className='bg-white shadow-md rounded-full p-1'><FaAngleRight/></button>
                  </div>
            </div>
            {/**Desktop and tablet version */}
            <div className='hidden md:flex w-full h-full overflow-hidden'>
                 {
                mobileImages.map((imageURL,index)=>{
                    return(
                 <div className='w-full h-full  min-w-full min-h-full transition-all' key={imageURL} style={{transform : `translateX(-${currentImage * 100}%)`}}> 
                 <img src={imageURL} className='w-full h-full'/>
                 </div>  
                    )
                  })
               }
            </div>


                {/**mobile version */}
            <div className='flex w-full h-full overflow-hidden md:hidden'>
                 {
                desktopImages.map((imageURL,index)=>{
                    return(
                 <div className='w-full h-full  min-w-full min-h-full transition-all' key={imageURL} style={{transform : `translateX(-${currentImage * 100}%)`}}> 
                 <img src={imageURL} className='w-full h-full'/>
                 </div>  
                    )
                  })
               }
            </div>
         </div>
    </div>
  )
}

export default BannerProduct