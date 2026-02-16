import React from 'react'
import CategoryList from '../components/CategoryList'
import BannerProduct from '../components/BannerProduct'
import HorizontalCardProduct from '../components/HorizontalCardProduct'
import VerticalCardProduct from '../components/VerticalCardProduct'
import BrandCategoryList from '../components/BrandCategoryList'

const Home = () => {
  return (
    <div>
      <CategoryList/>
      <BannerProduct/>
      <HorizontalCardProduct category={"jersey"} heading={"Rep Ur Jersey"}/>

       <HorizontalCardProduct category={"boots"} heading={"Style it with"}/>

      <HorizontalCardProduct category={"sneakers"} heading={"Trending Sneakers"}/>

      <VerticalCardProduct category={"polo"} heading={"Teams polo's shirt"}/>

      <BrandCategoryList heading={"Shop Our Top Brands"}/>

      <VerticalCardProduct category={"shinpads"} heading={"Guard Your Shin"}/>
    </div>
  )
}

export default Home