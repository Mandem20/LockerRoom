import React from 'react'
import logo from '../assets/IMG_2808.JPG'

const Logo = ({w, h}) => {
  return (
    <div className='w-[70px] h-[70px]'>
        <img src={logo} width={w} height={h} alt='Logo'/>
    </div>
  )
}

export default Logo