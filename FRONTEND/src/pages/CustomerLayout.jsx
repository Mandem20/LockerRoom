import React, { useEffect, useState } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import CustomerSidebar from '../components/CustomerSidebar'
import SummaryApi from '../common'
import { toast } from 'react-toastify'
import { useDispatch } from 'react-redux'
import { setUserDetails } from '../store/userSlice'

const CustomerLayout = () => {
    const navigate = useNavigate()
    const dispatch = useDispatch()
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)
    const [isCollapsed, setIsCollapsed] = useState(false)
    const [mobileOpen, setMobileOpen] = useState(false)
    const [isLoggingOut, setIsLoggingOut] = useState(false)
    const [wishlistCount, setWishlistCount] = useState(0)

    useEffect(() => {
        fetchUserData()
        fetchWishlistCount()
    }, [])

    const fetchUserData = async () => {
        try {
            const response = await fetch(SummaryApi.current_user.url, {
                credentials: 'include'
            })
            const data = await response.json()
            if (data.success) {
                setUser(data.data)
                if (data.data.role === 'admin') {
                    navigate('/admin-panel')
                }
            } else {
                navigate('/login')
            }
        } catch (error) {
            console.error('Error fetching user:', error)
            navigate('/login')
        } finally {
            setLoading(false)
        }
    }

    const fetchWishlistCount = async () => {
        try {
            const response = await fetch(SummaryApi.getWishlist.url, {
                credentials: 'include'
            })
            const data = await response.json()
            if (data.success) {
                setWishlistCount(data.data?.length || 0)
            }
        } catch (error) {
            console.error('Error fetching wishlist:', error)
        }
    }

    const handleLogout = async () => {
        setIsLoggingOut(true)
        try {
            const response = await fetch(SummaryApi.logout_user.url, {
                method: SummaryApi.logout_user.method,
                credentials: 'include'
            })
            const data = await response.json()
            if (data.success) {
                toast.success(data.message)
                dispatch(setUserDetails(null))
                navigate('/')
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            toast.error('Logout failed')
        } finally {
            setIsLoggingOut(false)
        }
    }

    if (loading) {
        return (
            <div className='flex items-center justify-center h-screen'>
                <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-red-600'></div>
            </div>
        )
    }

    return (
        <div className='flex h-screen bg-gray-50'>
            <CustomerSidebar 
                user={user}
                wishlistCount={wishlistCount}
                onLogout={handleLogout}
                isCollapsed={isCollapsed}
                setIsCollapsed={setIsCollapsed}
                mobileOpen={mobileOpen}
                setMobileOpen={setMobileOpen}
                isLoggingOut={isLoggingOut}
            />
            <main className='flex-1 overflow-y-auto p-6'>
                <Outlet context={{ user, wishlistCount }} />
            </main>
        </div>
    )
}

export default CustomerLayout
