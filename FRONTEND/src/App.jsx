import { useEffect, useState, Suspense } from 'react'
import './App.css'
import { Outlet } from 'react-router-dom'
import Header from './components/Header'
import Footer from './components/Footer'
import { ToastContainer } from 'react-toastify';
import SummaryApi from './common'
import Context from './context'
import { useDispatch } from 'react-redux'
import { setUserDetails } from './store/userSlice'
import RealTimeNotifications from './components/RealTimeNotifications'

const Loading = () => <div className="min-h-screen flex items-center justify-center">Loading...</div>;

function App() {
  const dispatch = useDispatch()
  const [cartProductCount,setCartProductCount] = useState(0)


  const fetchUserDetails = async()=> {
    const dataResponse = await fetch(SummaryApi.current_user.url,{
      method : SummaryApi.current_user.method,
      credentials : 'include'
    })

    const dataApi = await dataResponse.json()


    if (dataApi.success) {
    dispatch(setUserDetails(dataApi.data))
      
    }
  } 

  const fetchUserAddToCart = async()=>{
      const dataResponse = await fetch(SummaryApi.addToCartProductCount.url,{
      method : SummaryApi.addToCartProductCount.method,
      credentials : 'include'
    })

    const dataApi = await dataResponse.json()

    setCartProductCount(dataApi?.data?.count)
  }

    useEffect(()=>{
  /**User Profile Details */
  fetchUserDetails()

  /**User cart product details */
  fetchUserAddToCart()
    },[])
    return (
    <>
    <Context.Provider value = {{
        fetchUserDetails, // user detail fetch
        cartProductCount, // current user add to cart product count
        fetchUserAddToCart
    }}>
    <ToastContainer
    position='top-center'
    />

    <Header/>
    <main className='min-h-[calc(100vh-120px)] pt-16'>
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
          <Outlet/>
        </Suspense>
    </main>
    <Footer/>
    <RealTimeNotifications/>
    </Context.Provider>
    </>
  )
}

export default App
