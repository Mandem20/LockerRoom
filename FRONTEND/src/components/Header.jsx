import React, { useState, useEffect, useRef } from 'react'
import Logo from './Logo'
import {  GrSearch } from "react-icons/gr";
import { FaRegUserCircle } from "react-icons/fa";
import { FaShoppingCart } from "react-icons/fa";
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
    const [suggestions, setSuggestions] = useState([])
    const [showSuggestions, setShowSuggestions] = useState(false)
    const searchRef = useRef(null)
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
        const handleClickOutside = (event) => {
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setShowSuggestions(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
   }, [])

   useEffect(() => {
        const fetchSuggestions = async () => {
            if (!search || search.length < 2) {
                setSuggestions([])
                return
            }
            try {
                const query = new URLSearchParams({ q: search }).toString()
                const response = await fetch(`${SummaryApi.searchSuggestions.url}?${query}`)
                const data = await response.json()
                if (data.success) {
                    setSuggestions(data.data)
                }
            } catch (error) {
                console.error('Failed to fetch suggestions:', error)
            }
        }
        
        const debounceTimer = setTimeout(fetchSuggestions, 300)
        return () => clearTimeout(debounceTimer)
   }, [search])

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
       setShowSuggestions(true)
       hasUserTyped.current = true
    }

    const handleSuggestionClick = (suggestion) => {
        setSearch(suggestion.value)
        setShowSuggestions(false)
        navigate(`/search/${suggestion.value}`)
    }
  return (
    <header className='h-22 shadow-md bg-white fixed w-full z-40'>
        <div className='h-full container mx-auto flex items-center px-4 justify-between'>
            <div className=''>
                <Link to ={"/"}>
                 <Logo w={80} h={40}/>
                </Link>
            </div>

            <div className='hidden lg:flex items-center w-full justify-between max-w-sm border rounded-full focus-within:shadow pl-2 relative' ref={searchRef}>
                <input 
                    type='text' 
                    placeholder='Search products, brands, categories'
                    className='w-full outline-none'
                    onChange={handleSearch } 
                    value={search}
                    onFocus={() => setShowSuggestions(true)}
                />
                <div className='text-lg min-w-[50px] h-8 bg-red-600 flex items-center justify-center rounded-r-full text-white'>
                    <GrSearch/> 
                </div>
                {showSuggestions && suggestions.length > 0 && (
                    <div className='absolute top-full left-0 right-0 bg-white shadow-lg rounded-lg mt-1 max-h-80 overflow-y-auto z-50'>
                        {suggestions.map((suggestion, index) => (
                            <div
                                key={index}
                                className='px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center gap-2'
                                onClick={() => handleSuggestionClick(suggestion)}
                            >
                                <span className='text-xs px-2 py-0.5 rounded bg-gray-200 text-gray-600 uppercase'>
                                    {suggestion.type}
                                </span>
                                <span>{suggestion.value}</span>
                            </div>
                        ))}
                    </div>
                )}
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
                        {user?.role !== ROLE.ADMIN && (
                            <Link to={"/my-account"} className='whitespace-nowrap hidden md:block hover:bg-slate-100 p-2' onClick={()=>setMenuDisplay(previous => !previous)}>My Account</Link>
                        )}
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

                  <Link to={"/help"} className='text-xl ml-3'>
                    Help
                  </Link>


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