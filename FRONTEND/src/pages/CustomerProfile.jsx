import React, { useState, useRef } from 'react'
import { useOutletContext, useNavigate } from 'react-router-dom'
import SummaryApi from '../common'
import { toast } from 'react-toastify'
import { FaUser, FaEnvelope, FaPhone, FaCamera, FaSave, FaKey, FaCalendar, FaVenusMars, FaEdit, FaTimes } from 'react-icons/fa'

const CustomerProfile = () => {
    const { user } = useOutletContext()
    const navigate = useNavigate()
    const fileInputRef = useRef(null)
    const [isEditing, setIsEditing] = useState(false)
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        altPhone: '',
        gender: '',
        birthDate: ''
    })
    const [profilePic, setProfilePic] = useState(null)
    const [previewUrl, setPreviewUrl] = useState(null)
    const [loading, setLoading] = useState(false)
    const [uploading, setUploading] = useState(false)

    React.useEffect(() => {
        if (user) {
            const formatPhone = (phone) => {
                if (!phone) return ''
                if (phone.startsWith('+')) return phone
                return `+233 ${phone}`
            }
            
            setFormData({
                name: user.name || '',
                email: user.email || '',
                phone: formatPhone(user.phone || ''),
                altPhone: formatPhone(user.altPhone || ''),
                gender: user.gender || '',
                birthDate: user.birthDate || user.birthdate || ''
            })
            if (user.profilePic) {
                setPreviewUrl(user.profilePic)
            }
        }
    }, [user])

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleProfilePicChange = (e) => {
        const file = e.target.files[0]
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                toast.error('Image size must be less than 5MB')
                return
            }
            setProfilePic(file)
            setPreviewUrl(URL.createObjectURL(file))
        }
    }

    const uploadProfilePic = async () => {
        if (!profilePic) return null
        
        setUploading(true)
        const formDataUpload = new FormData()
        formDataUpload.append('profilePic', profilePic)
        
        try {
            const response = await fetch(SummaryApi.uploadProfilePic?.url || `${SummaryApi.updateUser.url}/picture`, {
                method: 'POST',
                credentials: 'include',
                body: formDataUpload
            })
            const data = await response.json()
            if (data.success) {
                return data.data?.profilePic || data.profilePic
            }
            return null
        } catch (error) {
            console.error('Upload error:', error)
            return null
        } finally {
            setUploading(false)
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        
        if (!formData.name.trim()) {
            toast.error('Name is required')
            return
        }
        
        setLoading(true)
        try {
            let profilePicUrl = previewUrl
            
            if (profilePic && profilePic !== user?.profilePic) {
                const uploadedUrl = await uploadProfilePic()
                if (uploadedUrl) {
                    profilePicUrl = uploadedUrl
                }
            }

            const updateData = {
                _id: user?._id,
                name: formData.name,
                phone: formData.phone,
                altPhone: formData.altPhone,
                gender: formData.gender,
                birthDate: formData.birthDate,
                ...(profilePicUrl && profilePicUrl !== user?.profilePic && { profilePic: profilePicUrl })
            }

            const response = await fetch(SummaryApi.updateMyProfile.url, {
                method: SummaryApi.updateMyProfile.method,
                credentials: 'include',
                headers: { 'content-type': 'application/json' },
                body: JSON.stringify(updateData)
            })
            
            const data = await response.json()
            if (data.success) {
                toast.success('Profile updated successfully')
                setProfilePic(null)
                setIsEditing(false)
                const userResponse = await fetch(SummaryApi.current_user.url, {
                    credentials: 'include'
                })
                const userData = await userResponse.json()
                if (userData.success) {
                    window.location.reload()
                }
            } else {
                toast.error(data.message || 'Failed to update profile')
            }
        } catch (error) {
            console.error('Update error:', error)
            toast.error('Failed to update profile')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className='space-y-6'>
            <div className='flex items-center justify-between'>
                <div>
                    <h1 className='text-2xl font-bold text-gray-800'>My Profile</h1>
                    <p className='text-gray-500 text-sm mt-1'>Manage your account information</p>
                </div>
                <button
                    type='button'
                    onClick={() => setIsEditing(!isEditing)}
                    className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
                        isEditing 
                            ? 'bg-gray-200 text-gray-700 hover:bg-gray-300' 
                            : 'bg-red-600 text-white hover:bg-red-700'
                    }`}
                >
                    {isEditing ? <><FaTimes /> Cancel</> : <><FaEdit /> Edit Profile</>}
                </button>
            </div>

            <div className='bg-white rounded-lg shadow-sm p-6'>
                <div className='flex flex-col md:flex-row gap-8'>
                    <div className='flex flex-col items-center'>
                        <div className='relative'>
                            <div className='w-32 h-32 rounded-full overflow-hidden bg-gray-100 border-4 border-red-100'>
                                {previewUrl ? (
                                    <img 
                                        src={previewUrl} 
                                        alt='Profile' 
                                        className='w-full h-full object-cover'
                                    />
                                ) : (
                                    <div className='w-full h-full flex items-center justify-center'>
                                        <FaUser className='text-4xl text-gray-300' />
                                    </div>
                                )}
                            </div>
                            {isEditing && (
                                <button
                                    type='button'
                                    onClick={() => fileInputRef.current?.click()}
                                    className='absolute bottom-0 right-0 bg-red-600 text-white p-2 rounded-full hover:bg-red-700 transition-colors'
                                >
                                    <FaCamera size={16} />
                                </button>
                            )}
                            <input
                                ref={fileInputRef}
                                type='file'
                                accept='image/*'
                                onChange={handleProfilePicChange}
                                className='hidden'
                            />
                        </div>
                        {isEditing && <p className='text-xs text-gray-500 mt-2'>Click to change photo</p>}
                    </div>

                    <div className='flex-1'>
                        {isEditing ? (
                            <form onSubmit={handleSubmit} className='space-y-4'>
                                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                                    <div>
                                        <label className='block text-sm font-medium text-gray-700 mb-2'>
                                            <FaUser className='inline mr-2' />Full Name
                                        </label>
                                        <input
                                            type='text'
                                            name='name'
                                            value={formData.name}
                                            onChange={handleChange}
                                            className='w-full p-3 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500'
                                            placeholder='Enter your name'
                                        />
                                    </div>
                                    <div>
                                        <label className='block text-sm font-medium text-gray-700 mb-2'>
                                            <FaEnvelope className='inline mr-2' />Email Address
                                        </label>
                                        <input
                                            type='email'
                                            name='email'
                                            value={formData.email}
                                            disabled
                                            className='w-full p-3 border rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed'
                                            placeholder='Enter your email'
                                        />
                                        <p className='text-xs text-gray-400 mt-1'>Email cannot be changed</p>
                                    </div>
                                <div>
                                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                                        <FaPhone className='inline mr-2' />Mobile Number
                                    </label>
                                    <input
                                        type='tel'
                                        name='phone'
                                        value={formData.phone || ''}
                                        onChange={handleChange}
                                        className='w-full p-3 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500'
                                        placeholder='+233 50 123 4567'
                                    />
                                </div>
                                <div>
                                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                                        <FaPhone className='inline mr-2' />Alternate Mobile (Optional)
                                    </label>
                                    <input
                                        type='tel'
                                        name='altPhone'
                                        value={formData.altPhone || ''}
                                        onChange={handleChange}
                                        className='w-full p-3 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500'
                                        placeholder='+233 50 123 4567'
                                    />
                                </div>
                                <div>
                                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                                        <FaVenusMars className='inline mr-2' />Gender
                                    </label>
                                    <select
                                        name='gender'
                                        value={formData.gender}
                                        onChange={handleChange}
                                        className='w-full p-3 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500'
                                    >
                                        <option value=''>Select gender</option>
                                        <option value='male'>Male</option>
                                        <option value='female'>Female</option>
                                        <option value='other'>Other</option>
                                    </select>
                                </div>
                                <div>
                                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                                        <FaCalendar className='inline mr-2' />Birth Date
                                    </label>
                                    <input
                                        type='date'
                                        name='birthDate'
                                        value={formData.birthDate}
                                        onChange={handleChange}
                                        className='w-full p-3 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500'
                                    />
                                </div>
                            </div>
                            <div className='pt-4'>
                                <button
                                    type='submit'
                                    disabled={loading || uploading}
                                    className='px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center gap-2'
                                >
                                    <FaSave />
                                    {loading ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>
                        </form>
                        ) : (
                        <div className='space-y-4'>
                            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                                <div className='p-4 bg-gray-50 rounded-lg'>
                                    <p className='text-xs text-gray-500 mb-1'><FaUser className='inline mr-1' />Full Name</p>
                                    <p className='font-medium text-gray-800'>{formData.name || 'Not set'}</p>
                                </div>
                                <div className='p-4 bg-gray-50 rounded-lg'>
                                    <p className='text-xs text-gray-500 mb-1'><FaEnvelope className='inline mr-1' />Email Address</p>
                                    <p className='font-medium text-gray-800'>{formData.email}</p>
                                </div>
                                <div className='p-4 bg-gray-50 rounded-lg'>
                                    <p className='text-xs text-gray-500 mb-1'><FaPhone className='inline mr-1' />Mobile Number</p>
                                    <p className='font-medium text-gray-800'>{formData.phone || 'Not set'}</p>
                                </div>
                                <div className='p-4 bg-gray-50 rounded-lg'>
                                    <p className='text-xs text-gray-500 mb-1'><FaPhone className='inline mr-1' />Alternate Mobile</p>
                                    <p className='font-medium text-gray-800'>{formData.altPhone || 'Not set'}</p>
                                </div>
                                <div className='p-4 bg-gray-50 rounded-lg'>
                                    <p className='text-xs text-gray-500 mb-1'><FaVenusMars className='inline mr-1' />Gender</p>
                                    <p className='font-medium text-gray-800 capitalize'>{formData.gender || 'Not set'}</p>
                                </div>
                                <div className='p-4 bg-gray-50 rounded-lg'>
                                    <p className='text-xs text-gray-500 mb-1'><FaCalendar className='inline mr-1' />Birth Date</p>
                                    <p className='font-medium text-gray-800'>
                                        {formData.birthDate ? new Date(formData.birthDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'Not set'}
                                    </p>
                                </div>
                            </div>
                        </div>
                        )}
                    </div>
                </div>
            </div>

            <div className='bg-white rounded-lg shadow-sm p-6'>
                <h2 className='text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2'>
                    <FaKey className='text-red-600' /> Security
                </h2>
                <div className='space-y-3'>
                    <div className='flex items-center justify-between p-4 border rounded-lg'>
                        <div>
                            <p className='font-medium text-gray-800'>Password</p>
                            <p className='text-sm text-gray-500'>Change your account password</p>
                        </div>
                        <button 
                            onClick={() => navigate('/forgot-password')}
                            className='px-4 py-2 border border-red-600 text-red-600 rounded-lg hover:bg-red-50'
                        >
                            Change Password
                        </button>
                    </div>
                </div>
            </div>

            <div className='bg-white rounded-lg shadow-sm p-6'>
                <h2 className='text-lg font-semibold text-gray-800 mb-4'>Account Information</h2>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                    <div className='p-4 bg-gray-50 rounded-lg'>
                        <p className='text-xs text-gray-500'>Member Since</p>
                        <p className='font-medium text-gray-800'>
                            {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { 
                                year: 'numeric', 
                                month: 'long', 
                                day: 'numeric' 
                            }) : 'N/A'}
                        </p>
                    </div>
                    <div className='p-4 bg-gray-50 rounded-lg'>
                        <p className='text-xs text-gray-500'>Account Type</p>
                        <p className='font-medium text-gray-800 capitalize'>{user?.role || 'Customer'}</p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default CustomerProfile
