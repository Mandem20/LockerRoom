import React, { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Link, Outlet, useNavigate } from 'react-router-dom'
import ROLE from '../common/role'
import { toast } from 'react-toastify'
import SummaryApi from '../common'
import AdminSidebar from '../components/AdminSidebar'
import AdminNavbar from '../components/AdminNavbar'

const AdminPanel = () => {
    const user = useSelector(state => state?.user?.user)
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const [isLoading, setIsLoading] = useState(true)
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsLoading(false)
        }, 100)
        return () => clearTimeout(timer)
    }, [])

    useEffect(()=>{
         if (!isLoading && user && user?.role !== ROLE.ADMIN) {
            navigate("/")
         }
    },[user, isLoading])

    const handleLogout = async () => {
        try {
            const response = await fetch(SummaryApi.logout_user.url, {
                method: SummaryApi.logout_user.method,
                credentials: 'include'
            })
            const data = await response.json()
            
            if (data.success) {
                dispatch({ type: 'LOGOUT_USER' })
                toast.success('Logged out successfully')
                navigate('/')
            }
        } catch (error) {
            toast.error('Logout failed')
        }
    }

  return (
    <div className='flex flex-col h-screen'>
        <AdminNavbar user={user} onMenuToggle={() => setMobileMenuOpen(!mobileMenuOpen)} />
        
        <div className='flex flex-1 overflow-hidden relative'>
            <AdminSidebar 
                user={user} 
                onLogout={handleLogout}
                isCollapsed={sidebarCollapsed}
                setIsCollapsed={setSidebarCollapsed}
                mobileOpen={mobileMenuOpen}
                setMobileOpen={setMobileMenuOpen}
            />
            
            <main className={`flex-1 p-4 bg-gray-50 overflow-y-auto transition-all duration-300 ${sidebarCollapsed ? 'ml-0' : ''} ${mobileMenuOpen ? 'md:ml-0' : ''}`}>
                <Outlet/>
            </main>
        </div>
    </div>
  )
}

export default AdminPanel
