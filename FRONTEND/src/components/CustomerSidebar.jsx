import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { FaHome, FaShoppingCart, FaHeart, FaBox, FaUser, FaCog, FaSignOutAlt, FaChevronLeft, FaChevronRight, FaMapMarkerAlt, FaCreditCard, FaShieldAlt } from 'react-icons/fa'

const CustomerSidebar = ({ user, wishlistCount = 0, onLogout, isCollapsed, setIsCollapsed, mobileOpen, setMobileOpen, isLoggingOut = false }) => {
    const location = useLocation()
    
    const menuItems = [
        { path: '/my-account', label: 'Dashboard', icon: <FaHome /> },
        { path: '/orders', label: 'My Orders', icon: <FaBox /> },
        { path: '/cart', label: 'Cart', icon: <FaShoppingCart />, badge: null },
        { path: '/wishlist', label: 'Wishlist', icon: <FaHeart />, badge: wishlistCount },
        { path: '/my-account/addresses', label: 'Addresses', icon: <FaMapMarkerAlt /> },
        { path: '/my-account/payment-methods', label: 'Payment Methods', icon: <FaCreditCard /> },
        { path: '/my-account/profile', label: 'Profile', icon: <FaUser /> },
        { path: '/my-account/security', label: 'Security', icon: <FaShieldAlt /> },
    ]

    const isActive = (path) => {
        return location.pathname === path || location.pathname.includes(path)
    }

    const handleLinkClick = () => {
        if (window.innerWidth < 768 && setMobileOpen) {
            setMobileOpen(false)
        }
    }

    return (
        <>
            {mobileOpen && (
                <div 
                    className='md:hidden fixed inset-0 bg-black bg-opacity-50 z-30'
                    onClick={() => setMobileOpen(false)}
                />
            )}

            <aside className={`
                bg-white flex flex-col transition-all duration-300 ease-in-out
                ${isCollapsed ? 'w-20' : 'w-64'}
                ${mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
                fixed md:relative z-40 h-full
            `}>
                <button 
                    className='hidden md:flex absolute -right-3 top-6 bg-white border rounded-full p-1 shadow-md hover:bg-gray-100 z-10'
                    onClick={() => setIsCollapsed(!isCollapsed)}
                >
                    {isCollapsed ? <FaChevronRight size={12} /> : <FaChevronLeft size={12} />}
                </button>

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
                            <p className='text-xs text-gray-500'>{user?.email}</p>
                        </>
                    )}
                </div>
                
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
                                    <span className='text-lg relative'>
                                        {item.icon}
                                        {item.badge > 0 && (
                                            <span className='absolute -top-2 -right-2 bg-red-600 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center'>
                                                {item.badge > 9 ? '9+' : item.badge}
                                            </span>
                                        )}
                                    </span>
                                    {!isCollapsed && <span className='font-medium'>{item.label}</span>}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </nav>

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

export default CustomerSidebar
