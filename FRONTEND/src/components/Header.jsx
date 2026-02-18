import React, { useState, useEffect, useRef } from 'react'
import Logo from './Logo'
import {  GrSearch } from "react-icons/gr";
import { FaRegUserCircle } from "react-icons/fa";
import { FaShoppingCart } from "react-icons/fa";
import { FaHeart } from "react-icons/fa";
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import SummaryApi from '../common';
import { toast } from 'react-toastify';
import { setUserDetails } from '../store/userSlice';
import ROLE from '../common/role';
import { useContext } from 'react';
import Context from '../context';

const Header = () => {
    const user = useSelector(state => state?.user?.user)
    const dispatch = useDispatch()
    const [menuDisplay,setMenuDisplay] = useState(false)
    const context = useContext(Context)
    const navigate = useNavigate()
    const searchInput = useLocation()
    const URLSearch = new URLSearchParams(searchInput?.search)
    const searchQuery = URLSearch.getAll("q")
    const [search,setSearch] = useState(searchQuery)
    const hasUserTyped = useRef(false)

    const handleLogout = async() =>{
        const fetchData = await fetch(SummaryApi.logout_user.url,{
            method : SummaryApi.logout_user.method,
            credentials : 'include'
        })

        const data = await fetchData.json()

        if (data.success) {
            toast.success(data.message)
            dispatch(setUserDetails(null))
            navigate("/")
        }

        if (data.error) {
             toast.error(data.message)
        }
    }

   useEffect(() => {
        if (!hasUserTyped.current) return
         
        const timer = setTimeout(() => {
            if (search) {
                navigate(`/search/${search}`)
            } else {
                navigate("/")
            }
        }, 500)

        return () => clearTimeout(timer)
   }, [search, navigate])

    const handleSearch =(e) =>{
       const { value } = e.target
       setSearch(value)
       hasUserTyped.current = true
    }
  return (
    <header className='h-22 shadow-md bg-white fixed w-full z-40'>
        <div className='h-full container mx-auto flex items-center px-4 justify-between'>
            <div className=''>
                <Link to ={"/"}>
                 <Logo w={80} h={40}/>
                </Link>
            </div>

            <div className='hidden lg:flex items-center w-full justify-between max-w-sm border rounded-full focus-within:shadow pl-2'>
                <input type='text' placeholder='Search products, brands, categories'className='w-full outline-none' onChange={handleSearch } value={search}/>
                <div className='text-lg min-w-[50px] h-8 bg-red-600 flex items-center justify-center rounded-r-full text-white'>
                    <GrSearch/> 
                </div>
            </div>

            <div className='flex items-center gap-7'>

                <div className='relative group flex justify-center'>
                    {
                        user?._id && (
             <div className='text-3xl cursor-pointer relative flex justify-center' onClick={()=>setMenuDisplay(previous => !previous)}>
                    {
                        user?.profilePic ? (
                            <img src={user?.profilePic} className='w-10 h-10 rounded-full' alt={user?.name}/>
                        ) : (
                             <FaRegUserCircle/>
                        )
                    }
                  </div>
                        )
                    }
                  {
                    menuDisplay &&  (
                     <div className='absolute bg-white bottom-0 top-11 h-fit p-2 shadow-lg rounded'>
                    <nav>
                        {
                            user?.role === ROLE.ADMIN && (
                                <>
                                <Link to={"/admin-panel"} className='whitespace-nowrap hidden md:block hover:bg-slate-100 p-2'  onClick={()=>setMenuDisplay(previous => !previous)}>Admin Panel</Link>
                                <Link to={"/admin-panel/all-products"} className='whitespace-nowrap hidden md:block hover:bg-slate-100 p-2'  onClick={()=>setMenuDisplay(previous => !previous)}>Manage Products</Link>
                                <Link to={"/admin-panel/all-users"} className='whitespace-nowrap hidden md:block hover:bg-slate-100 p-2'  onClick={()=>setMenuDisplay(previous => !previous)}>Manage Users</Link>
                                </>
                            )
                        }
                        
                    </nav>
                  </div>
                    )
                  }
              
               </div>
                  
                  {
                    user?._id && (
                <Link to={"/cart"} className='text-2xl relative'>
                    <span><FaShoppingCart/></span>
                    
                    <div className='bg-red-600 text-white w-5 h-5 rounded-full p-1 flex items-center justify-center absolute -top-2 -right-3'>
                        <p className='text-sm'>{context?.cartProductCount}</p>
                    </div>
                </Link>
                    )
                  }

                  {
                    user?._id && (
                <Link to={"/wishlist"} className='text-2xl relative ml-3'>
                    <span><FaHeart/></span>
                </Link>
                    )
                  }


            <div>
                {
                    user?._id ? (
                        <button onClick={handleLogout} className='px-3 py-1 rounded-full text-white bg-red-600 hover:bg-red-700'>Logout</button>
                    )
                    : (
                        <Link to={"/login"} className='px-3 py-1 rounded-full text-white bg-red-600 hover:bg-red-700'>Login</Link>
                    )
                }
                
            </div>


            </div>

        </div>
    </header>
  )
}

export default Header