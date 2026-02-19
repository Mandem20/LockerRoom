import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { FaUsers, FaBox, FaTags, FaSignOutAlt, FaChevronLeft, FaChevronRight, FaHome, FaShoppingCart, FaUserCircle, FaChartBar } from 'react-icons/fa'

const AdminSidebar = ({ user, onLogout, isCollapsed, setIsCollapsed, mobileOpen, setMobileOpen, isLoggingOut = false }) => {
    const location = useLocation()
    
    const menuItems = [
        { path: '', label: 'Dashboard', icon: <FaHome /> },
        { path: 'orders', label: 'Orders', icon: <FaShoppingCart /> },
        { path: 'customers', label: 'Customers', icon: <FaUserCircle /> },
        { path: 'analytics', label: 'Analytics', icon: <FaChartBar /> },
        { path: 'all-products', label: 'Products', icon: <FaBox /> },
        { path: 'All-users', label: 'Users', icon: <FaUsers /> },
        { path: 'categories', label: 'Categories', icon: <FaTags /> },
    ]

    const isActive = (path) => {
        const currentPath = location.pathname
        if (path === '') {
            return currentPath === '/admin-panel' || currentPath.endsWith('admin-panel')
        }
        return currentPath.includes(path)
    }

    const handleLinkClick = () => {
        if (window.innerWidth < 768 && setMobileOpen) {
            setMobileOpen(false)
        }
    }

    return (
        <>
            {/* Overlay for mobile */}
            {mobileOpen && (
                <div 
                    className='md:hidden fixed inset-0 bg-black bg-opacity-50 z-30'
                    onClick={() => setMobileOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`
                bg-white flex flex-col transition-all duration-300 ease-in-out
                ${isCollapsed ? 'w-20' : 'w-64'}
                ${mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
                fixed md:relative z-40 h-full
            `}>
                {/* Collapse Toggle - Desktop */}
                <button 
                    className='hidden md:flex absolute -right-3 top-6 bg-white border rounded-full p-1 shadow-md hover:bg-gray-100 z-10'
                    onClick={() => setIsCollapsed(!isCollapsed)}
                >
                    {isCollapsed ? <FaChevronRight size={12} /> : <FaChevronLeft size={12} />}
                </button>

                {/* User Profile Section */}
                <div className={`flex justify-center items-center flex-col border-b p-4 ${isCollapsed ? 'py-6' : 'py-8'}`}>
                    <div className='relative'>
                        {user?.profilePic ? (
                            <img 
                                src={user?.profilePic} 
                                className={`rounded-full object-cover ${isCollapsed ? 'w-12 h-12' : 'w-20 h-20'}`} 
                                alt={user?.name}
                            />
                        ) : (
                            <div className={`rounded-full bg-gray-200 flex items-center justify-center ${isCollapsed ? 'w-12 h-12' : 'w-20 h-20'}`}>
                                <span className={`font-bold text-gray-500 ${isCollapsed ? 'text-xl' : 'text-3xl'}`}>
                                    {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                                </span>
                            </div>
                        )}
                    </div>
                    
                    {!isCollapsed && (
                        <>
                            <p className='capitalize text-lg font-semibold mt-3'>{user?.name}</p>
                            <p className='text-xs text-gray-500'>{user?.role}</p>
                        </>
                    )}
                </div>
                
                {/* Navigation */}
                <nav className='flex-1 p-3 overflow-y-auto'>
                    <ul className='space-y-1'>
                        {menuItems.map((item) => (
                            <li key={item.path}>
                                <Link 
                                    to={item.path}
                                    onClick={handleLinkClick}
                                    className={`
                                        flex items-center gap-3 px-3 py-3 rounded-lg transition-all
                                        ${isCollapsed ? 'justify-center' : 'px-4'}
                                        ${isActive(item.path) 
                                            ? 'bg-red-600 text-white' 
                                            : 'hover:bg-slate-100 text-gray-700'
                                        }
                                    `}
                                    title={isCollapsed ? item.label : ''}
                                >
                                    <span className='text-lg'>{item.icon}</span>
                                    {!isCollapsed && <span className='font-medium'>{item.label}</span>}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </nav>

                {/* Logout Button */}
                <div className={`p-3 border-t ${isCollapsed ? 'flex justify-center' : ''}`}>
                    <button 
                        onClick={onLogout}
                        disabled={isLoggingOut}
                        className={`
                            flex items-center gap-3 px-3 py-3 w-full rounded-lg hover:bg-red-50 text-gray-700 hover:text-red-600 transition-all
                            ${isCollapsed ? 'justify-center' : 'px-4'}
                            ${isLoggingOut ? 'opacity-50 cursor-not-allowed' : ''}
                        `}
                        title={isCollapsed ? 'Logout' : ''}
                    >
                        {isLoggingOut ? (
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-red-600"></div>
                        ) : (
                            <FaSignOutAlt className='text-lg' />
                        )}
                        {!isCollapsed && <span className='font-medium'>{isLoggingOut ? 'Logging out...' : 'Logout'}</span>}
                    </button>
                </div>
            </aside>
        </>
    )
}

export default AdminSidebar
