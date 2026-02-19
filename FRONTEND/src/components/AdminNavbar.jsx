import React from 'react'
import { Link } from 'react-router-dom'
import { FaBell, FaHome, FaBars } from 'react-icons/fa'

const AdminNavbar = ({ user, onMenuToggle }) => {
    const currentDate = new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    })

    return (
        <nav className='bg-white shadow-sm px-4 md:px-6 py-3 flex items-center justify-between'>
            <div className='flex items-center gap-4'>
                <button 
                    className='md:hidden p-2 hover:bg-gray-100 rounded-lg'
                    onClick={onMenuToggle}
                >
                    <FaBars className='text-gray-600 text-xl' />
                </button>
                
                <Link 
                    to='/' 
                    className='flex items-center gap-2 text-gray-600 hover:text-red-600 transition-colors'
                >
                    <FaHome />
                    <span className='text-sm font-medium hidden sm:inline'>Go to Store</span>
                </Link>
            </div>

            <div className='flex items-center gap-4 md:gap-6'>
                <div className='text-sm text-gray-500 hidden md:block'>
                    {currentDate}
                </div>

                <div className='relative'>
                    <button className='p-2 hover:bg-gray-100 rounded-full relative'>
                        <FaBell className='text-gray-600' />
                        <span className='absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full'></span>
                    </button>
                </div>

                <div className='flex items-center gap-3'>
                    <div className='text-right hidden md:block'>
                        <p className='text-sm font-medium text-gray-700'>{user?.name}</p>
                        <p className='text-xs text-gray-500'>{user?.role}</p>
                    </div>
                    <div className='w-10 h-10 rounded-full bg-red-600 flex items-center justify-center text-white font-bold'>
                        {user?.name?.charAt(0)?.toUpperCase() || 'A'}
                    </div>
                </div>
            </div>
        </nav>
    )
}

export default AdminNavbar
