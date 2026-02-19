import React from 'react'
import { FaUsers, FaBox, FaTags, FaShoppingCart, FaDollarSign, FaChartLine } from 'react-icons/fa'

const StatCard = ({ title, value, icon, color = 'red', trend, trendUp = true }) => {
    const colorClasses = {
        red: 'bg-red-50 text-red-600',
        blue: 'bg-blue-50 text-blue-600',
        green: 'bg-green-50 text-green-600',
        yellow: 'bg-yellow-50 text-yellow-600',
        purple: 'bg-purple-50 text-purple-600',
        indigo: 'bg-indigo-50 text-indigo-600',
    }

    const iconMap = {
        users: <FaUsers />,
        products: <FaBox />,
        categories: <FaTags />,
        orders: <FaShoppingCart />,
        revenue: <FaDollarSign />,
        growth: <FaChartLine />,
    }

    return (
        <div className='bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow'>
            <div className='flex items-start justify-between'>
                <div>
                    <p className='text-sm text-gray-500 font-medium'>{title}</p>
                    <p className='text-2xl font-bold text-gray-800 mt-2'>{value}</p>
                    
                    {trend && (
                        <div className={`flex items-center gap-1 mt-2 text-sm ${trendUp ? 'text-green-600' : 'text-red-600'}`}>
                            <span>{trend}</span>
                            <span className='text-xs'>{trendUp ? '↑' : '↓'}</span>
                        </div>
                    )}
                </div>
                
                <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
                    <span className='text-xl'>
                        {iconMap[icon] || icon}
                    </span>
                </div>
            </div>
        </div>
    )
}

export default StatCard
