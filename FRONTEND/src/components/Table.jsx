import React from 'react'
import { FaSort, FaSortUp, FaSortDown } from 'react-icons/fa'

const Table = ({ 
    columns = [], 
    data = [], 
    onRowClick,
    sortConfig,
    onSort,
    emptyMessage = 'No data available',
    loading = false,
    loadingRows = 5
}) => {
    const getSortIcon = (columnKey) => {
        if (!onSort || !columnKey) return null
        
        if (sortConfig?.field !== columnKey) {
            return <FaSort className="ml-1 text-gray-400" />
        }
        return sortConfig.direction === 'asc' 
            ? <FaSortUp className="ml-1 text-red-600" />
            : <FaSortDown className="ml-1 text-red-600" />
    }

    const handleSort = (columnKey) => {
        if (onSort && columnKey) {
            onSort(columnKey)
        }
    }

    return (
        <div className='overflow-x-auto bg-white rounded-lg shadow'>
            <table className='w-full'>
                <thead className='bg-gray-50 border-b'>
                    <tr>
                        {columns.map((column, index) => (
                            <th 
                                key={index}
                                className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider
                                    ${column.sortable ? 'cursor-pointer hover:bg-gray-100' : ''}
                                    ${column.className || ''}
                                `}
                                onClick={() => column.sortable && handleSort(column.key)}
                                style={column.width ? { width: column.width } : {}}
                            >
                                <div className='flex items-center'>
                                    {column.header}
                                    {column.sortable && getSortIcon(column.key)}
                                </div>
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className='divide-y divide-gray-200'>
                    {loading ? (
                        Array.from({ length: loadingRows }).map((_, index) => (
                            <tr key={index}>
                                {columns.map((column, colIndex) => (
                                    <td key={colIndex} className='px-6 py-4'>
                                        <div className='h-4 bg-gray-200 rounded animate-pulse'></div>
                                    </td>
                                ))}
                            </tr>
                        ))
                    ) : data.length === 0 ? (
                        <tr>
                            <td 
                                colSpan={columns.length} 
                                className='px-6 py-12 text-center text-gray-500'
                            >
                                {emptyMessage}
                            </td>
                        </tr>
                    ) : (
                        data.map((row, rowIndex) => (
                            <tr 
                                key={rowIndex}
                                className={`hover:bg-gray-50 ${onRowClick ? 'cursor-pointer' : ''}`}
                                onClick={() => onRowClick && onRowClick(row)}
                            >
                                {columns.map((column, colIndex) => (
                                    <td 
                                        key={colIndex} 
                                        className={`px-6 py-4 whitespace-nowrap text-sm text-gray-700 ${column.className || ''}`}
                                    >
                                        {column.render ? column.render(row[column.key], row) : row[column.key]}
                                    </td>
                                ))}
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    )
}

export default Table
