import React from 'react'
import { Link } from 'react-router-dom'
import { FaHome } from 'react-icons/fa'

const Breadcrumb = ({ items }) => {
  if (!items || items.length === 0) return null

  return (
    <nav className="breadcrumb-nav mb-4 px-2 md:px-0">
      <ol className="flex items-center flex-wrap gap-1 text-sm">
        <li className="flex items-center">
          <Link 
            to="/" 
            className="text-slate-500 hover:text-red-600 transition-colors flex items-center"
          >
            <FaHome className="mr-1" />
            <span className="hidden sm:inline">Home</span>
          </Link>
        </li>
        
        {items.map((item, index) => (
          <li key={index} className="flex items-center">
            <span className="mx-2 text-slate-400">/</span>
            {item.href ? (
              <Link 
                to={item.href} 
                className="text-slate-500 hover:text-red-600 transition-colors capitalize"
              >
                {item.label}
              </Link>
            ) : (
              <span className="text-slate-800 font-medium capitalize">
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  )
}

export default Breadcrumb
