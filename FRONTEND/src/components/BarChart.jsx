import React from 'react'

const BarChart = ({ data = [], title = "Sales Chart", dataKey = "sales", color = "#dc2626" }) => {
    const maxValue = Math.max(...data.map(d => d[dataKey]), 1)

    return (
        <div className='bg-white rounded-xl shadow-sm p-6'>
            <h3 className='text-lg font-semibold text-gray-800 mb-4'>{title}</h3>
            <div className='flex items-end justify-between gap-2 h-48'>
                {data.map((item, index) => (
                    <div key={index} className='flex flex-col items-center flex-1'>
                        <div className='w-full flex flex-col items-center justify-end h-40'>
                            <div 
                                className='w-full max-w-[40px] rounded-t-md transition-all duration-300 hover:opacity-80'
                                style={{ 
                                    height: `${(item[dataKey] / maxValue) * 100}%`,
                                    backgroundColor: color
                                }}
                                title={`${item.day}: ${item[dataKey]}`}
                            ></div>
                        </div>
                        <span className='text-xs text-gray-500 mt-2 truncate w-full text-center'>
                            {item.day.substring(0, 3)}
                        </span>
                    </div>
                ))}
            </div>
            
            <div className='mt-4 pt-4 border-t flex justify-between text-sm'>
                <div>
                    <span className='text-gray-500'>Total: </span>
                    <span className='font-semibold text-gray-800'>
                        GHS {data.reduce((sum, item) => sum + item[dataKey], 0).toLocaleString()}
                    </span>
                </div>
                <div>
                    <span className='text-gray-500'>Orders: </span>
                    <span className='font-semibold text-gray-800'>
                        {data.reduce((sum, item) => sum + (item.orders || 0), 0)}
                    </span>
                </div>
            </div>
        </div>
    )
}

export default BarChart
