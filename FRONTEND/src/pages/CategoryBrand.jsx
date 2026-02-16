import React from 'react'
import { useParams } from 'react-router-dom'

//category list @ homepage //
const CategoryBrand= () => {
    const params = useParams()
  return (
    <div>{params?.brandName}</div>
  )
}
export default CategoryBrand


