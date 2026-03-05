import React, { useState, useEffect } from 'react'
import { CgClose } from "react-icons/cg"
import productCategory from '../helpers/productCategory'
import genderType from '../helpers/genderType'
import stockAvailable from '../helpers/stockAvailable'
import { FaCloudUploadAlt } from "react-icons/fa"
import uploadImage from '../helpers/uploadImage'
import DisplayImage from './DisplayImage'
import { MdDelete } from "react-icons/md"
import SummaryApi from '../common'
import { toast } from 'react-toastify'

const VendorUploadProduct = ({
    onClose,
    fetchData
}) => {
    const [data, setData] = useState({
        productName: "",
        brandName: "",
        category: "",
        productImage: [],
        description: "",
        sizes: [],
        material: "",
        stock: "",
        quantity: "",
        location: "",
        color: "",
        colorVariants: [],
        gender: "",
        price: "",
        sellingPrice: "",
        rating: 0
    })
    const [colorInput, setColorInput] = useState("")
    const [selectedColorIndex, setSelectedColorIndex] = useState(null)
    const [colorSizeInput, setColorSizeInput] = useState({})
    const [openFullScreenImage, setOpenFullScreenImage] = useState(false)
    const [fullScreenImage, setFullScreenImage] = useState("")
    const [sizeInput, setSizeInput] = useState("")
    const [categories, setCategories] = useState([])

    const fetchCategories = async () => {
        try {
            const response = await fetch(SummaryApi.getCategories.url, {
                method: SummaryApi.getCategories.method,
                credentials: 'include'
            })
            const dataResponse = await response.json()
            if (dataResponse.success && dataResponse.data.length > 0) {
                setCategories(dataResponse.data)
            }
        } catch (error) {
            console.error('Error fetching categories:', error)
        }
    }

    useEffect(() => {
        fetchCategories()
    }, [])

    const handleOnChange = (e) => {
        const { name, value } = e.target
        setData((previous) => {
            return {
                ...previous,
                [name]: value
            }
        })
    }

    const handleUploadProduct = async (e) => {
        const file = e.target.files[0]
        const uploadImageCloudinary = await uploadImage(file)

        setData((previous) => {
            return {
                ...previous,
                productImage: [...previous.productImage, uploadImageCloudinary.url]
            }
        })
    }

    const handleDeleteProductImage = async (index) => {
        const newProductImage = [...data.productImage]
        newProductImage.splice(index, 1)
        setData((previous) => {
            return {
                ...previous,
                productImage: [...newProductImage]
            }
        })
    }

    const handleAddSize = () => {
        if (!sizeInput.trim()) return
        if (data.sizes.includes(sizeInput.trim())) {
            return
        }
        setData((previous) => ({
            ...previous,
            sizes: [...previous.sizes, sizeInput.trim()]
        }))
        setSizeInput("")
    }

    const handleRemoveSize = (index) => {
        const newSizes = [...data.sizes]
        newSizes.splice(index, 1)
        setData((previous) => ({
            ...previous,
            sizes: newSizes
        }))
    }

    const handleAddColorVariant = () => {
        if (!colorInput.trim()) return
        const existingColor = data.colorVariants.find(
            c => c.colorName.toLowerCase() === colorInput.trim().toLowerCase()
        )
        if (existingColor) {
            toast.error("Color already added")
            return
        }
        setData((previous) => ({
            ...previous,
            colorVariants: [...previous.colorVariants, { colorName: colorInput.trim(), images: [], sizes: [] }]
        }))
        setColorInput("")
    }

    const handleAddColorSize = (colorIndex) => {
        const sizeVal = colorSizeInput[colorIndex]?.trim()
        if (!sizeVal) return

        const newColorVariants = [...data.colorVariants]
        if (newColorVariants[colorIndex].sizes.includes(sizeVal)) {
            toast.error("Size already added for this color")
            return
        }
        newColorVariants[colorIndex].sizes.push(sizeVal)
        setData((previous) => ({
            ...previous,
            colorVariants: newColorVariants
        }))
        setColorSizeInput(prev => ({ ...prev, [colorIndex]: "" }))
    }

    const handleRemoveColorSize = (colorIndex, sizeIndex) => {
        const newColorVariants = [...data.colorVariants]
        newColorVariants[colorIndex].sizes.splice(sizeIndex, 1)
        setData((previous) => ({
            ...previous,
            colorVariants: newColorVariants
        }))
    }

    const handleRemoveColorVariant = (index) => {
        const newColorVariants = [...data.colorVariants]
        newColorVariants.splice(index, 1)
        setData((previous) => ({
            ...previous,
            colorVariants: newColorVariants
        }))
        if (selectedColorIndex === index) {
            setSelectedColorIndex(null)
        } else if (selectedColorIndex > index) {
            setSelectedColorIndex(selectedColorIndex - 1)
        }
    }

    const handleUploadColorImage = async (e, colorIndex) => {
        const file = e.target.files[0]
        const uploadImageCloudinary = await uploadImage(file)

        setData((previous) => {
            const newColorVariants = [...previous.colorVariants]
            newColorVariants[colorIndex].images = [
                ...newColorVariants[colorIndex].images,
                uploadImageCloudinary.url
            ]
            return {
                ...previous,
                colorVariants: newColorVariants
            }
        })
    }

    const handleDeleteColorImage = (colorIndex, imageIndex) => {
        setData((previous) => {
            const newColorVariants = [...previous.colorVariants]
            newColorVariants[colorIndex].images.splice(imageIndex, 1)
            return {
                ...previous,
                colorVariants: newColorVariants
            }
        })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        const response = await fetch(SummaryApi.uploadVendorProduct.url, {
            method: SummaryApi.uploadVendorProduct.method,
            credentials: 'include',
            headers: {
                "content-type": "application/json"
            },
            body: JSON.stringify(data)
        })

        const responseData = await response.json()

        if (responseData.success) {
            toast.success(responseData?.message)
            onClose()
            fetchData()
        } else {
            toast.error(responseData?.message || 'Failed to upload product')
        }
    }

    return (
        <div className='fixed w-full h-full bg-slate-200 bg-opacity-35 top-0 bottom-0 left-0 right-0 flex justify-center items-center z-50'>
            <div className='bg-white p-4 rounded w-full max-w-2xl h-full max-h-[80%] overflow-hidden'>
                <div className='flex justify-between items-center pb-3'>
                    <h2 className='font-bold text-lg'>Add Product</h2>
                    <div className='w-fit ml-auto text-2xl hover:text-red-600 cursor-pointer' onClick={onClose}>
                        <CgClose />
                    </div>
                </div>

                <form className='grid p-4 gap-2 overflow-y-scroll h-full pb-5' onSubmit={handleSubmit}>
                    <label htmlFor='productName'>Product Name :</label>
                    <input
                        type='text'
                        id='productName'
                        placeholder='enter product name'
                        name='productName'
                        value={data.productName}
                        onChange={handleOnChange}
                        className='p-2 bg-slate-100 border rounded'
                        required
                    />

                    <label htmlFor='brandName' className='mt-3'>Brand Name :</label>
                    <input
                        type="text"
                        id='brandName'
                        placeholder='enter brand name'
                        name='brandName'
                        value={data.brandName}
                        onChange={handleOnChange}
                        className='p-2 bg-slate-100 border rounded'
                        required
                    />

                    <label htmlFor='category' className='mt-3'>Category :</label>
                    <select required value={data.category} name='category' onChange={handleOnChange} className='p-2 bg-slate-100 border rounded'>
                        <option value={""}>Select Category</option>
                        {
                            categories.length > 0 ? (
                                categories.map((el, index) => {
                                    return (
                                        <option value={el.value} key={el._id || index}>{el.name}</option>
                                    )
                                })
                            ) : (
                                productCategory.map((el, index) => {
                                    return (
                                        <option value={el.value} key={el.value + index}>{el.label}</option>
                                    )
                                })
                            )
                        }
                    </select>

                    <label htmlFor='gender' className='mt-3'>Gender :</label>
                    <select required value={data.gender} name='gender' onChange={handleOnChange} className='p-2 bg-slate-100 border rounded'>
                        <option value={""}>Select Gender</option>
                        {
                            genderType.map((el, index) => {
                                return (
                                    <option value={el.value} key={el.value + index}>{el.label}</option>
                                )
                            })
                        }
                    </select>

                    <label htmlFor='stock' className='mt-3'>Stock :</label>
                    <select required value={data.stock} name='stock' onChange={handleOnChange} className='p-2 bg-slate-100 border rounded'>
                        <option value={""}>Select Stock</option>
                        {
                            stockAvailable.map((el, index) => {
                                return (
                                    <option value={el.value} key={el.value + index}>{el.label}</option>
                                )
                            })
                        }
                    </select>

                    <label htmlFor='quantity' className='mt-3'>Quantity :</label>
                    <input
                        type='number'
                        id='quantity'
                        placeholder='Enter quantity'
                        name='quantity'
                        value={data.quantity}
                        onChange={handleOnChange}
                        className='p-2 bg-slate-100 border rounded'
                        min="0"
                    />

                    <label htmlFor='location' className='mt-3'>Location :</label>
                    <input
                        type='text'
                        id='location'
                        placeholder='Enter location (e.g., Warehouse A)'
                        name='location'
                        value={data.location}
                        onChange={handleOnChange}
                        className='p-2 bg-slate-100 border rounded'
                    />

                    <label htmlFor='productImage' className='mt-3'>Product Photo :</label>
                    <label htmlFor='uploadImageInput'>
                        <div className='p-2 bg-slate-100 border rounded h-32 w-full flex justify-center items-center cursor-pointer'>
                            <div className='text-slate-500 flex justify-center items-center flex-col gap-2'>
                                <span className='text-4xl'> <FaCloudUploadAlt /></span>
                                <p className='text-sm'>Upload Product Photo</p>
                                <input type="file" id='uploadImageInput' className='hidden' onChange={handleUploadProduct} />
                            </div>
                        </div>
                    </label>
                    <div>
                        {
                            data?.productImage[0] ? (
                                <div className='flex items-center gap-2'>
                                    {
                                        data.productImage.map((el, index) => {
                                            return (
                                                <div className='relative group' key={`product-img-${index}`}>
                                                    <img
                                                        src={el}
                                                        alt={el}
                                                        width={80}
                                                        height={80}
                                                        className='bg-slate-100 border cursor-pointer'
                                                        onClick={() => {
                                                            setOpenFullScreenImage(true)
                                                            setFullScreenImage(el)
                                                        }} />

                                                    <div className='absolute bottom-0 right-0 p-1 text-white bg-red-600 rounded-full cursor-pointer hidden group-hover:block' onClick={() => handleDeleteProductImage(index)}>
                                                        <MdDelete />
                                                    </div>
                                                </div>

                                            )
                                        })
                                    }
                                </div>
                            ) : (
                                <p className='text-red-600 text-xs'>*Please upload product image</p>
                            )
                        }

                    </div>

                    <label htmlFor='price' className='mt-3'>Price :</label>
                    <input
                        type='number'
                        id='price'
                        placeholder='enter price'
                        name='price'
                        value={data.price}
                        onChange={handleOnChange}
                        className='p-2 bg-slate-100 border rounded'
                        required
                    />

                    <label htmlFor='sellingPrice' className='mt-3'>Selling Price :</label>
                    <input
                        type='number'
                        id='sellingPrice'
                        placeholder='enter selling price'
                        name='sellingPrice'
                        value={data.sellingPrice}
                        onChange={handleOnChange}
                        className='p-2 bg-slate-100 border rounded'
                        required
                    />

                    <label htmlFor='rating' className='mt-3'>Rating (0-5):</label>
                    <input
                        type='number'
                        id='rating'
                        placeholder='enter rating (0-5)'
                        name='rating'
                        value={data.rating}
                        onChange={handleOnChange}
                        min="0"
                        max="5"
                        step="0.1"
                        className='p-2 bg-slate-100 border rounded'
                    />

                    <label htmlFor='size' className='mt-3'>Sizes (select multiple):</label>
                    <div className='flex gap-2 mb-2'>
                        <input
                            type="text"
                            id='size'
                            placeholder='e.g., S, M, L, XL'
                            name='size'
                            value={sizeInput}
                            onChange={(e) => setSizeInput(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSize())}
                            className='p-2 bg-slate-100 border rounded flex-1'
                        />
                        <button
                            type='button'
                            onClick={handleAddSize}
                            className='px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600'
                        >
                            Add
                        </button>
                    </div>
                    <div className='flex gap-2 flex-wrap mb-2'>
                        {data.sizes.map((size, index) => (
                            <span key={index} className='px-3 py-1 bg-slate-200 rounded-full flex items-center gap-1'>
                                {size}
                                <button
                                    type='button'
                                    onClick={() => handleRemoveSize(index)}
                                    className='text-red-500 hover:text-red-700'
                                >
                                    ×
                                </button>
                            </span>
                        ))}
                    </div>

                    <label htmlFor='color' className='mt-3'>Colour Variants :</label>
                    <div className='flex gap-2 mb-2'>
                        <input
                            type="text"
                            id='color'
                            placeholder='e.g., Red, Blue, Green'
                            name='color'
                            value={colorInput}
                            onChange={(e) => setColorInput(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddColorVariant())}
                            className='p-2 bg-slate-100 border rounded flex-1'
                        />
                        <button
                            type='button'
                            onClick={handleAddColorVariant}
                            className='px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600'
                        >
                            Add Color
                        </button>
                    </div>

                    <div className='space-y-4 mb-2'>
                        {data.colorVariants.map((colorVariant, colorIndex) => (
                            <div key={colorIndex} className='border rounded p-3 bg-slate-50'>
                                <div className='flex justify-between items-center mb-2'>
                                    <span className='font-medium'>{colorVariant.colorName}</span>
                                    <div className='flex gap-2'>
                                        <button
                                            type='button'
                                            onClick={() => setSelectedColorIndex(selectedColorIndex === colorIndex ? null : colorIndex)}
                                            className='text-sm text-blue-600 hover:text-blue-800'
                                        >
                                            {selectedColorIndex === colorIndex ? 'Close' : 'Add Images'}
                                        </button>
                                        <button
                                            type='button'
                                            onClick={() => handleRemoveColorVariant(colorIndex)}
                                            className='text-red-500 hover:text-red-700'
                                        >
                                            ×
                                        </button>
                                    </div>
                                </div>

                                {colorVariant.images.length > 0 && (
                                    <div className='flex gap-2 flex-wrap mb-2'>
                                        {colorVariant.images.map((img, imgIndex) => (
                                            <div key={`color-${colorIndex}-img-${imgIndex}`} className='relative group'>
                                                <img
                                                    src={img}
                                                    alt={img}
                                                    width={60}
                                                    height={60}
                                                    className='bg-slate-100 border cursor-pointer'
                                                    onClick={() => {
                                                        setOpenFullScreenImage(true)
                                                        setFullScreenImage(img)
                                                    }}
                                                />
                                                <div className='absolute bottom-0 right-0 p-1 text-white bg-red-600 rounded-full cursor-pointer hidden group-hover:block'
                                                    onClick={() => handleDeleteColorImage(colorIndex, imgIndex)}>
                                                    <MdDelete />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {selectedColorIndex === colorIndex && (
                                    <label htmlFor={`colorImageInput-${colorIndex}`}>
                                        <div className='p-2 bg-slate-100 border rounded h-20 w-full flex justify-center items-center cursor-pointer'>
                                            <div className='text-slate-500 flex justify-center items-center flex-col gap-1'>
                                                <span className='text-2xl'> <FaCloudUploadAlt /></span>
                                                <p className='text-xs'>Upload Image</p>
                                                <input
                                                    type="file"
                                                    id={`colorImageInput-${colorIndex}`}
                                                    className='hidden'
                                                    onChange={(e) => handleUploadColorImage(e, colorIndex)}
                                                />
                                            </div>
                                        </div>
                                    </label>
                                )}

                                <div className='mt-3'>
                                    <p className='text-sm font-medium mb-1'>Sizes for {colorVariant.colorName}:</p>
                                    <div className='flex gap-2 mb-2'>
                                        <input
                                            type="text"
                                            placeholder='e.g., S, M, L'
                                            value={colorSizeInput[colorIndex] || ""}
                                            onChange={(e) => setColorSizeInput(prev => ({ ...prev, [colorIndex]: e.target.value }))}
                                            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddColorSize(colorIndex))}
                                            className='p-2 bg-slate-100 border rounded flex-1 text-sm'
                                        />
                                        <button
                                            type='button'
                                            onClick={() => handleAddColorSize(colorIndex)}
                                            className='px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm'
                                        >
                                            Add
                                        </button>
                                    </div>
                                    <div className='flex gap-2 flex-wrap'>
                                        {colorVariant.sizes.map((size, sizeIndex) => (
                                            <span key={sizeIndex} className='px-2 py-1 bg-slate-200 rounded-full flex items-center gap-1 text-sm'>
                                                {size}
                                                <button
                                                    type='button'
                                                    onClick={() => handleRemoveColorSize(colorIndex, sizeIndex)}
                                                    className='text-red-500 hover:text-red-700'
                                                >
                                                    ×
                                                </button>
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {data.colorVariants.length === 0 && (
                        <input
                            type="text"
                            id='color'
                            placeholder='enter product colour'
                            name='color'
                            value={data.color}
                            onChange={handleOnChange}
                            className='p-2 bg-slate-100 border rounded'
                        />
                    )}

                    <label htmlFor='description' className='mt-3'>Description :</label>
                    <textarea
                        className='h-40 bg-slate-100 border p-2 resize-none'
                        placeholder='Enter product description. Use new lines for paragraphs.'
                        rows={5}
                        onChange={handleOnChange}
                        name='description'
                        value={data.description}
                    >
                    </textarea>
                    <p className='text-xs text-slate-500 mt-1'>Use new lines to separate paragraphs</p>

                    <button className='px-3 py-2 bg-red-600 text-white mb-10 hover:bg-red-700'>Add Product</button>
                </form>

            </div>

            {openFullScreenImage && (
                <DisplayImage onClose={() => setOpenFullScreenImage(false)} imgUrl={fullScreenImage} />
            )}

        </div>
    )
}

export default VendorUploadProduct
