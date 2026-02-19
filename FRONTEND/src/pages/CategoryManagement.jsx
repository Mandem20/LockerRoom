import React, { useEffect, useState } from 'react'
import SummaryApi from '../common'
import { toast } from 'react-toastify'

const CategoryManagement = () => {
    const [categories, setCategories] = useState([])
    const [isLoading, setIsLoading] = useState(false)
    const [showModal, setShowModal] = useState(false)
    const [editingCategory, setEditingCategory] = useState(null)
    const [formData, setFormData] = useState({
        name: '',
        value: ''
    })

    const fetchCategories = async () => {
        try {
            const response = await fetch(SummaryApi.getCategories.url, {
                method: SummaryApi.getCategories.method,
                credentials: 'include'
            })
            const data = await response.json()
            if (data.success) {
                setCategories(data.data)
            }
        } catch (error) {
            console.error('Error fetching categories:', error)
        }
    }

    useEffect(() => {
        fetchCategories()
    }, [])

    const handleSubmit = async (e) => {
        e.preventDefault()
        setIsLoading(true)

        try {
            const url = editingCategory 
                ? SummaryApi.updateCategory.url 
                : SummaryApi.createCategory.url
            
            const body = editingCategory 
                ? { id: editingCategory._id, ...formData }
                : formData

            const response = await fetch(url, {
                method: editingCategory ? SummaryApi.updateCategory.method : SummaryApi.createCategory.method,
                credentials: 'include',
                headers: {
                    'content-type': 'application/json'
                },
                body: JSON.stringify(body)
            })

            const data = await response.json()

            if (data.success) {
                toast.success(data.message)
                setShowModal(false)
                setFormData({ name: '', value: '' })
                setEditingCategory(null)
                fetchCategories()
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            toast.error('Something went wrong')
        } finally {
            setIsLoading(false)
        }
    }

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this category?')) return

        try {
            const response = await fetch(SummaryApi.deleteCategory.url, {
                method: SummaryApi.deleteCategory.method,
                credentials: 'include',
                headers: {
                    'content-type': 'application/json'
                },
                body: JSON.stringify({ id })
            })

            const data = await response.json()

            if (data.success) {
                toast.success('Category deleted successfully')
                fetchCategories()
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            toast.error('Something went wrong')
        }
    }

    const handleEdit = (category) => {
        setEditingCategory(category)
        setFormData({ name: category.name, value: category.value })
        setShowModal(true)
    }

    const openModal = () => {
        setEditingCategory(null)
        setFormData({ name: '', value: '' })
        setShowModal(true)
    }

    return (
        <div className='pb-4'>
            <div className='bg-white py-2 px-4 flex justify-between items-center rounded mb-4'>
                <h2 className='font-bold text-lg'>Category Management</h2>
                <button
                    onClick={openModal}
                    className='bg-red-600 text-white px-4 py-1 rounded hover:bg-red-700'
                >
                    Add Category
                </button>
            </div>

            <div className='bg-white rounded overflow-hidden'>
                <table className='w-full'>
                    <thead className='bg-gray-100'>
                        <tr>
                            <th className='p-2 text-left'>Name</th>
                            <th className='p-2 text-left'>Value</th>
                            <th className='p-2 text-left'>Created At</th>
                            <th className='p-2 text-center'>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {categories.length === 0 ? (
                            <tr>
                                <td colSpan={4} className='p-4 text-center text-gray-500'>
                                    No categories found. Add one to get started.
                                </td>
                            </tr>
                        ) : (
                            categories.map((category) => (
                                <tr key={category._id} className='border-b'>
                                    <td className='p-2'>{category.name}</td>
                                    <td className='p-2'>{category.value}</td>
                                    <td className='p-2 text-gray-500'>
                                        {new Date(category.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className='p-2 flex justify-center gap-2'>
                                        <button
                                            onClick={() => handleEdit(category)}
                                            className='bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600'
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDelete(category._id)}
                                            className='bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600'
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {showModal && (
                <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
                    <div className='bg-white p-6 rounded-lg w-96'>
                        <h3 className='font-bold text-lg mb-4'>
                            {editingCategory ? 'Edit Category' : 'Add Category'}
                        </h3>
                        <form onSubmit={handleSubmit}>
                            <div className='mb-4'>
                                <label className='block text-sm mb-1'>Category Name</label>
                                <input
                                    type='text'
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className='w-full p-2 border rounded'
                                    placeholder='e.g., Jersey'
                                    required
                                />
                            </div>
                            <div className='mb-4'>
                                <label className='block text-sm mb-1'>Category Value</label>
                                <input
                                    type='text'
                                    value={formData.value}
                                    onChange={(e) => setFormData({ ...formData, value: e.target.value.toLowerCase().replace(/\s+/g, '') })}
                                    className='w-full p-2 border rounded'
                                    placeholder='e.g., jersey'
                                    required
                                />
                            </div>
                            <div className='flex justify-end gap-2'>
                                <button
                                    type='button'
                                    onClick={() => setShowModal(false)}
                                    className='px-4 py-2 bg-gray-300 rounded hover:bg-gray-400'
                                >
                                    Cancel
                                </button>
                                <button
                                    type='submit'
                                    disabled={isLoading}
                                    className='px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50'
                                >
                                    {isLoading ? 'Saving...' : 'Save'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}

export default CategoryManagement
