import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FaEye } from "react-icons/fa";
import { FaEyeSlash } from "react-icons/fa";
import SummaryApi from '../common'
import { toast } from 'react-toastify'

const ForgotPassword = () => {
  const [step, setStep] = useState('email')
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  
  const navigate = useNavigate()

  const handleSendResetLink = async (e) => {
    e.preventDefault()
    if (!email) {
      toast.error('Please enter your email address')
      return
    }
    
    setLoading(true)
    try {
      const response = await fetch(SummaryApi.forgotPassword.url, {
        method: SummaryApi.forgotPassword.method,
        headers: {
          "content-type": "application/json"
        },
        body: JSON.stringify({ email })
      })
      const data = await response.json()
      
      if (data.success) {
        toast.success(data.message || 'Reset link sent to your email')
        setStep('verify')
      } else {
        toast.error(data.message || 'Failed to send reset link')
      }
    } catch (error) {
      toast.error('Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOtp = async (e) => {
    e.preventDefault()
    if (!otp) {
      toast.error('Please enter the OTP')
      return
    }
    
    setLoading(true)
    try {
      const response = await fetch(SummaryApi.verifyOtp.url, {
        method: SummaryApi.verifyOtp.method,
        headers: {
          "content-type": "application/json"
        },
        body: JSON.stringify({ email, otp })
      })
      const data = await response.json()
      
      if (data.success) {
        toast.success(data.message || 'OTP verified successfully')
        setStep('reset')
      } else {
        toast.error(data.message || 'Invalid OTP')
      }
    } catch (error) {
      toast.error('Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const handleResetPassword = async (e) => {
    e.preventDefault()
    
    if (!newPassword || !confirmPassword) {
      toast.error('Please fill in all fields')
      return
    }
    
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match')
      return
    }
    
    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }
    
    setLoading(true)
    try {
      const response = await fetch(SummaryApi.resetPassword.url, {
        method: SummaryApi.resetPassword.method,
        headers: {
          "content-type": "application/json"
        },
        body: JSON.stringify({ email, otp, newPassword })
      })
      const data = await response.json()
      
      if (data.success) {
        toast.success(data.message || 'Password reset successfully')
        navigate('/login')
      } else {
        toast.error(data.message || 'Failed to reset password')
      }
    } catch (error) {
      toast.error('Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className='forgot-password'>
      <div className='mx-auto container p-4'>
        <div className='bg-white p-5 w-full max-w-sm mx-auto'>
          <div className='w-20 h-20 mx-auto mb-4'>
            <img 
              src="https://cdn-icons-png.flaticon.com/512/564/564619.png" 
              alt="forgot password" 
              className='w-full h-full'
            />
          </div>

          <h2 className='text-xl font-semibold text-center mb-4'>
            {step === 'email' && 'Forgot Password'}
            {step === 'verify' && 'Verify OTP'}
            {step === 'reset' && 'Reset Password'}
          </h2>

          {step === 'email' && (
            <form onSubmit={handleSendResetLink} className='flex flex-col gap-3'>
              <div>
                <label className='block mb-1'>Email Address</label>
                <div className='bg-slate-100 p-2'>
                  <input
                    type="email"
                    placeholder='enter your email'
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className='w-full outline-none bg-transparent'
                  />
                </div>
              </div>

              <button 
                type='submit'
                disabled={loading}
                className='bg-red-600 hover:bg-red-700 text-white px-6 py-2 w-full rounded-full mt-2 disabled:opacity-50'
              >
                {loading ? 'Sending...' : 'Send Reset Link'}
              </button>
            </form>
          )}

          {step === 'verify' && (
            <form onSubmit={handleVerifyOtp} className='flex flex-col gap-3'>
              <p className='text-sm text-gray-600 mb-2'>
                We sent a 6-digit OTP to <strong>{email}</strong>
              </p>

              <div>
                <label className='block mb-1'>Enter OTP</label>
                <div className='bg-slate-100 p-2'>
                  <input
                    type="text"
                    placeholder='enter 6-digit OTP'
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    maxLength={6}
                    required
                    className='w-full outline-none bg-transparent text-center text-lg letter-spacing'
                  />
                </div>
              </div>

              <button 
                type='submit'
                disabled={loading}
                className='bg-red-600 hover:bg-red-700 text-white px-6 py-2 w-full rounded-full mt-2 disabled:opacity-50'
              >
                {loading ? 'Verifying...' : 'Verify OTP'}
              </button>

              <button
                type='button'
                onClick={() => handleSendResetLink({ preventDefault: () => {} })}
                disabled={loading}
                className='text-sm text-red-600 hover:underline disabled:opacity-50'
              >
                Resend OTP
              </button>
            </form>
          )}

          {step === 'reset' && (
            <form onSubmit={handleResetPassword} className='flex flex-col gap-3'>
              <p className='text-sm text-gray-600 mb-2'>
                Enter your new password
              </p>

              <div>
                <label className='block mb-1'>New Password</label>
                <div className='bg-slate-100 p-2 flex'>
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder='enter new password'
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    className='w-full outline-none bg-transparent'
                  />
                  <button
                    type='button'
                    onClick={() => setShowPassword(!showPassword)}
                    className='text-xl'
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>

              <div>
                <label className='block mb-1'>Confirm Password</label>
                <div className='bg-slate-100 p-2 flex'>
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder='confirm new password'
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className='w-full outline-none bg-transparent'
                  />
                  <button
                    type='button'
                    onClick={() => setShowPassword(!showPassword)}
                    className='text-xl'
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>

              <button 
                type='submit'
                disabled={loading}
                className='bg-red-600 hover:bg-red-700 text-white px-6 py-2 w-full rounded-full mt-2 disabled:opacity-50'
              >
                {loading ? 'Resetting...' : 'Reset Password'}
              </button>
            </form>
          )}

          <p className='my-4 text-center'>
            Remember your password? <Link to={'/login'} className='text-red-600 hover:underline'>Login</Link>
          </p>
        </div>
      </div>
    </section>
  )
}

export default ForgotPassword
