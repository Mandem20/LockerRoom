import React from 'react'
import logo from '../assets/IMG_2808.JPG'

const Logo = ({ w = 70, h = 70 }) => {
  return (
    <img 
      src={logo} 
      width={w} 
      height={h} 
      alt='LockerRoom Logo'
      className='object-contain'
      style={{ background: 'transparent' }}
    />
  )
}

export default Logo
