import React, { useState } from 'react'
import { useOutletContext, useNavigate } from 'react-router-dom'
import SummaryApi from '../common'
import { toast } from 'react-toastify'
import { FaShieldAlt, FaLock, FaEye, FaEyeSlash, FaCheckCircle, FaTimesCircle, FaMobileAlt, FaTrash, FaExclamationTriangle } from 'react-icons/fa'

const CustomerSecurity = () => {
    const { user } = useOutletContext()
    const navigate = useNavigate()
    const [loading, setLoading] = useState(false)
    const [showCurrentPassword, setShowCurrentPassword] = useState(false)
    const [showNewPassword, setShowNewPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [twoFactorEnabled, setTwoFactorEnabled] = useState(user?.twoFactorEnabled || false)
    const [showOtpInput, setShowOtpInput] = useState(false)
    const [otp, setOtp] = useState('')
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
    const [deletePassword, setDeletePassword] = useState('')
    const [deleting, setDeleting] = useState(false)
    const [formData, setFormData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    })
    const [passwordStrength, setPasswordStrength] = useState({
        length: false,
        number: false,
        special: false,
        match: false
    })

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
        
        if (name === 'newPassword' || name === 'confirmPassword') {
            const newPwd = name === 'newPassword' ? value : formData.newPassword
            const confirmPwd = name === 'confirmPassword' ? value : formData.confirmPassword
            
            setPasswordStrength({
                length: newPwd.length >= 8,
                number: /\d/.test(newPwd),
                special: /[!@#$%^&*(),.?":{}|<>]/.test(newPwd),
                match: newPwd === confirmPwd && newPwd.length > 0
            })
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        
        if (!formData.currentPassword) {
            toast.error('Please enter your current password')
            return
        }
        
        if (!formData.newPassword) {
            toast.error('Please enter a new password')
            return
        }
        
        if (!passwordStrength.length || !passwordStrength.number || !passwordStrength.special) {
            toast.error('Password does not meet requirements')
            return
        }
        
        if (!passwordStrength.match) {
            toast.error('Passwords do not match')
            return
        }
        
        setLoading(true)
        try {
            const response = await fetch(SummaryApi.resetPassword?.url || `${SummaryApi.forgotPassword?.url?.replace('/forgot-password', '')}/reset-password`, {
                method: 'POST',
                credentials: 'include',
                headers: { 'content-type': 'application/json' },
                body: JSON.stringify({
                    email: user?.email,
                    currentPassword: formData.currentPassword,
                    newPassword: formData.newPassword
                })
            })
            
            const data = await response.json()
            
            if (data.success) {
                toast.success('Password changed successfully')
                setFormData({
                    currentPassword: '',
                    newPassword: '',
                    confirmPassword: ''
                })
                setPasswordStrength({
                    length: false,
                    number: false,
                    special: false,
                    match: false
                })
            } else {
                toast.error(data.message || 'Failed to change password')
            }
        } catch (error) {
            console.error('Error changing password:', error)
            toast.error('Failed to change password')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className='space-y-6'>
            <div>
                <h1 className='text-2xl font-bold text-gray-800'>Security Settings</h1>
                <p className='text-gray-500 text-sm mt-1'>Manage your account security</p>
            </div>

            <div className='bg-white rounded-lg shadow-sm p-6'>
                <h2 className='text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2'>
                    <FaLock className='text-red-600' /> Change Password
                </h2>
                
                <form onSubmit={handleSubmit} className='space-y-4 max-w-lg'>
                    <div>
                        <label className='block text-sm font-medium text-gray-700 mb-2'>Current Password</label>
                        <div className='relative'>
                            <input
                                type={showCurrentPassword ? 'text' : 'password'}
                                name='currentPassword'
                                value={formData.currentPassword}
                                onChange={handleChange}
                                className='w-full p-3 border rounded-lg pr-12 focus:ring-2 focus:ring-red-500 focus:border-red-500'
                                placeholder='Enter current password'
                            />
                            <button
                                type='button'
                                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                className='absolute right-3 top-1/2 -translate-y-1/2 text-gray-500'
                            >
                                {showCurrentPassword ? <FaEyeSlash /> : <FaEye />}
                            </button>
                        </div>
                    </div>

                    <div>
                        <label className='block text-sm font-medium text-gray-700 mb-2'>New Password</label>
                        <div className='relative'>
                            <input
                                type={showNewPassword ? 'text' : 'password'}
                                name='newPassword'
                                value={formData.newPassword}
                                onChange={handleChange}
                                className='w-full p-3 border rounded-lg pr-12 focus:ring-2 focus:ring-red-500 focus:border-red-500'
                                placeholder='Enter new password'
                            />
                            <button
                                type='button'
                                onClick={() => setShowNewPassword(!showNewPassword)}
                                className='absolute right-3 top-1/2 -translate-y-1/2 text-gray-500'
                            >
                                {showNewPassword ? <FaEyeSlash /> : <FaEye />}
                            </button>
                        </div>
                        
                        <div className='mt-3 space-y-2'>
                            <div className='flex items-center gap-2 text-sm'>
                                {passwordStrength.length ? 
                                    <FaCheckCircle className='text-green-500' /> : <FaTimesCircle className='text-gray-300' />
                                }
                                <span className={passwordStrength.length ? 'text-green-600' : 'text-gray-500'}>
                                    At least 8 characters
                                </span>
                            </div>
                            <div className='flex items-center gap-2 text-sm'>
                                {passwordStrength.number ? 
                                    <FaCheckCircle className='text-green-500' /> : <FaTimesCircle className='text-gray-300' />
                                }
                                <span className={passwordStrength.number ? 'text-green-600' : 'text-gray-500'}>
                                    At least one number
                                </span>
                            </div>
                            <div className='flex items-center gap-2 text-sm'>
                                {passwordStrength.special ? 
                                    <FaCheckCircle className='text-green-500' /> : <FaTimesCircle className='text-gray-300' />
                                }
                                <span className={passwordStrength.special ? 'text-green-600' : 'text-gray-500'}>
                                    At least one special character (!@#$%^&*)
                                </span>
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className='block text-sm font-medium text-gray-700 mb-2'>Confirm New Password</label>
                        <div className='relative'>
                            <input
                                type={showConfirmPassword ? 'text' : 'password'}
                                name='confirmPassword'
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                className='w-full p-3 border rounded-lg pr-12 focus:ring-2 focus:ring-red-500 focus:border-red-500'
                                placeholder='Confirm new password'
                            />
                            <button
                                type='button'
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className='absolute right-3 top-1/2 -translate-y-1/2 text-gray-500'
                            >
                                {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                            </button>
                        </div>
                        {formData.confirmPassword && (
                            <div className='flex items-center gap-2 text-sm mt-2'>
                                {passwordStrength.match ? 
                                    <FaCheckCircle className='text-green-500' /> : <FaTimesCircle className='text-red-500' />
                                }
                                <span className={passwordStrength.match ? 'text-green-600' : 'text-red-500'}>
                                    {passwordStrength.match ? 'Passwords match' : 'Passwords do not match'}
                                </span>
                            </div>
                        )}
                    </div>

                    <button
                        type='submit'
                        disabled={loading}
                        className='w-full px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50'
                    >
                        {loading ? 'Changing Password...' : 'Change Password'}
                    </button>
                </form>
            </div>

            <div className='bg-white rounded-lg shadow-sm p-6'>
                <h2 className='text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2'>
                    <FaMobileAlt className='text-red-600' /> Two-Factor Authentication (Optional)
                </h2>
                
                <div className='space-y-4'>
                    <div className='flex items-center justify-between p-4 border rounded-lg'>
                        <div className='flex items-center gap-3'>
                            <div className={`p-3 rounded-full ${twoFactorEnabled ? 'bg-green-100' : 'bg-gray-100'}`}>
                                <FaMobileAlt className={`text-xl ${twoFactorEnabled ? 'text-green-600' : 'text-gray-500'}`} />
                            </div>
                            <div>
                                <p className='font-medium text-gray-800'>SMS Authentication</p>
                                <p className='text-sm text-gray-500'>
                                    {twoFactorEnabled ? 'Enabled - Receive codes via SMS' : 'Receive verification codes via SMS'}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={() => {
                                if (!twoFactorEnabled) {
                                    setShowOtpInput(true)
                                } else {
                                    setTwoFactorEnabled(false)
                                    toast.info('Two-factor authentication disabled')
                                }
                            }}
                            className={`px-4 py-2 rounded-lg font-medium ${
                                twoFactorEnabled 
                                    ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' 
                                    : 'bg-red-600 text-white hover:bg-red-700'
                            }`}
                        >
                            {twoFactorEnabled ? 'Disable' : 'Enable'}
                        </button>
                    </div>

                    {showOtpInput && (
                        <div className='p-4 border border-red-200 bg-red-50 rounded-lg'>
                            <p className='text-sm text-gray-600 mb-3'>
                                Enter the 6-digit code sent to your phone ending in ****{user?.phone?.slice(-4) || '****'}
                            </p>
                            <div className='flex gap-2'>
                                <input
                                    type='text'
                                    maxLength={6}
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                    placeholder='Enter 6-digit code'
                                    className='flex-1 p-3 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500'
                                />
                                <button
                                    onClick={() => {
                                        if (otp.length === 6) {
                                            setTwoFactorEnabled(true)
                                            setShowOtpInput(false)
                                            setOtp('')
                                            toast.success('Two-factor authentication enabled!')
                                        } else {
                                            toast.error('Please enter a valid 6-digit code')
                                        }
                                    }}
                                    className='px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700'
                                >
                                    Verify
                                </button>
                                <button
                                    onClick={() => {
                                        setShowOtpInput(false)
                                        setOtp('')
                                    }}
                                    className='px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100'
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    )}

                    {!twoFactorEnabled && !showOtpInput && (
                        <div className='p-4 bg-blue-50 rounded-lg'>
                            <p className='text-sm text-blue-700'>
                                <strong>Why enable 2FA?</strong> Two-factor authentication adds an extra layer of security to your account by requiring a verification code in addition to your password.
                            </p>
                        </div>
                    )}
                </div>
            </div>

            <div className='bg-white rounded-lg shadow-sm p-6'>
                <h2 className='text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2'>
                    <FaShieldAlt className='text-red-600' /> Security Tips
                </h2>
                <ul className='space-y-3 text-sm text-gray-600'>
                    <li className='flex items-start gap-2'>
                        <FaCheckCircle className='text-green-500 mt-1 flex-shrink-0' />
                        Use a strong, unique password that you don't use elsewhere
                    </li>
                    <li className='flex items-start gap-2'>
                        <FaCheckCircle className='text-green-500 mt-1 flex-shrink-0' />
                        Include a mix of letters, numbers, and special characters
                    </li>
                    <li className='flex items-start gap-2'>
                        <FaCheckCircle className='text-green-500 mt-1 flex-shrink-0' />
                        Avoid using personal information like birthdays or names
                    </li>
                    <li className='flex items-start gap-2'>
                        <FaCheckCircle className='text-green-500 mt-1 flex-shrink-0' />
                        Change your password periodically for better security
                    </li>
                </ul>
            </div>

            <div className='bg-white rounded-lg shadow-sm p-6'>
                <h2 className='text-lg font-semibold text-gray-800 mb-4'>Account Activity</h2>
                <div className='space-y-3'>
                    <div className='flex items-center justify-between p-3 bg-gray-50 rounded-lg'>
                        <div>
                            <p className='font-medium text-gray-800'>Account Created</p>
                            <p className='text-sm text-gray-500'>
                                {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { 
                                    year: 'numeric', 
                                    month: 'long', 
                                    day: 'numeric' 
                                }) : 'N/A'}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className='bg-white rounded-lg shadow-sm p-6 border border-red-200'>
                <h2 className='text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2'>
                    <FaTrash className='text-red-600' /> Delete Account
                </h2>
                
                {!showDeleteConfirm ? (
                    <div className='space-y-4'>
                        <div className='p-4 bg-red-50 rounded-lg'>
                            <div className='flex items-start gap-3'>
                                <FaExclamationTriangle className='text-red-500 mt-1 flex-shrink-0' />
                                <div>
                                    <p className='text-sm text-red-700 font-medium'>Warning: This action cannot be undone</p>
                                    <p className='text-sm text-red-600 mt-1'>
                                        Deleting your account will permanently remove all your data including order history, saved addresses, and wishlist items.
                                    </p>
                                </div>
                            </div>
                        </div>
                        
                        <button
                            onClick={() => setShowDeleteConfirm(true)}
                            className='px-4 py-2 border border-red-600 text-red-600 rounded-lg hover:bg-red-50 flex items-center gap-2'
                        >
                            <FaTrash /> Delete My Account
                        </button>
                    </div>
                ) : (
                    <div className='space-y-4'>
                        <div className='p-4 bg-red-50 rounded-lg border border-red-200'>
                            <p className='text-sm text-red-700 font-medium mb-2'>
                                Are you sure you want to delete your account? This is permanent.
                            </p>
                            <p className='text-sm text-red-600'>
                                Type your password to confirm deletion.
                            </p>
                        </div>
                        
                        <div>
                            <input
                                type='password'
                                value={deletePassword}
                                onChange={(e) => setDeletePassword(e.target.value)}
                                placeholder='Enter your password'
                                className='w-full p-3 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500'
                            />
                        </div>
                        
                        <div className='flex gap-3'>
                            <button
                                onClick={async () => {
                                    if (!deletePassword) {
                                        toast.error('Please enter your password')
                                        return
                                    }
                                    
                                    setDeleting(true)
                                    try {
                                        const response = await fetch(SummaryApi.deleteMyAccount?.url || `${SummaryApi.current_user.url}/delete`, {
                                            method: 'POST',
                                            credentials: 'include',
                                            headers: { 'content-type': 'application/json' },
                                            body: JSON.stringify({ password: deletePassword })
                                        })
                                        
                                        const data = await response.json()
                                        
                                        if (data.success) {
                                            toast.success('Account deleted successfully')
                                            navigate('/')
                                        } else {
                                            toast.error(data.message || 'Failed to delete account')
                                        }
                                    } catch (error) {
                                        console.error('Delete account error:', error)
                                        toast.error('Failed to delete account')
                                    } finally {
                                        setDeleting(false)
                                    }
                                }}
                                disabled={deleting}
                                className='px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center gap-2'
                            >
                                <FaTrash /> {deleting ? 'Deleting...' : 'Confirm Delete'}
                            </button>
                            <button
                                onClick={() => {
                                    setShowDeleteConfirm(false)
                                    setDeletePassword('')
                                }}
                                className='px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100'
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default CustomerSecurity
