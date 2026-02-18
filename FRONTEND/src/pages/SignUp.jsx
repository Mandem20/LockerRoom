import React, { useState, useEffect, useRef } from 'react'
import loginIcons from '../assets/login.gif'
import { FaEye } from "react-icons/fa";
import { FaEyeSlash } from "react-icons/fa";
import { FaGoogle, FaFacebook, FaApple, FaMobileAlt, FaChevronDown } from "react-icons/fa";
import { Link, useNavigate } from 'react-router-dom';
import imageTobase64 from '../helpers/imageTobase64';
import SummaryApi from '../common';
import { toast } from 'react-toastify';

const countryCodes = [
  { code: '+1', country: 'US/Canada' },
  { code: '+44', country: 'UK' },
  { code: '+233', country: 'Ghana' },
  { code: '+234', country: 'Nigeria' },
  { code: '+254', country: 'Kenya' },
  { code: '+255', country: 'Tanzania' },
  { code: '+256', country: 'Uganda' },
  { code: '+91', country: 'India' },
  { code: '+86', country: 'China' },
  { code: '+81', country: 'Japan' },
  { code: '+82', country: 'South Korea' },
  { code: '+61', country: 'Australia' },
  { code: '+55', country: 'Brazil' },
  { code: '+52', country: 'Mexico' },
  { code: '+20', country: 'Egypt' },
  { code: '+27', country: 'South Africa' },
  { code: '+216', country: 'Tunisia' },
  { code: '+213', country: 'Algeria' },
  { code: '+212', country: 'Morocco' },
  { code: '+90', country: 'Turkey' },
  { code: '+972', country: 'Israel' },
  { code: '+966', country: 'Saudi Arabia' },
  { code: '+971', country: 'UAE' },
  { code: '+965', country: 'Kuwait' },
  { code: '+973', country: 'Bahrain' },
  { code: '+968', country: 'Oman' },
  { code: '+974', country: 'Qatar' },
  { code: '+223', country: 'Mali' },
  { code: '+225', country: 'Ivory Coast' },
  { code: '+229', country: 'Benin' },
  { code: '+237', country: 'Cameroon' },
  { code: '+241', country: 'Gabon' },
  { code: '+242', country: 'Congo' },
  { code: '+243', country: 'DR Congo' },
  { code: '+244', country: 'Angola' },
  { code: '+258', country: 'Mozambique' },
  { code: '+260', country: 'Zambia' },
  { code: '+263', country: 'Zimbabwe' },
  { code: '+264', country: 'Namibia' },
  { code: '+266', country: 'Lesotho' },
  { code: '+267', country: 'Botswana' },
  { code: '+269', country: 'Comoros' },
  { code: '+31', country: 'Netherlands' },
  { code: '+32', country: 'Belgium' },
  { code: '+33', country: 'France' },
  { code: '+34', country: 'Spain' },
  { code: '+39', country: 'Italy' },
  { code: '+41', country: 'Switzerland' },
  { code: '+43', country: 'Austria' },
  { code: '+45', country: 'Denmark' },
  { code: '+46', country: 'Sweden' },
  { code: '+47', country: 'Norway' },
  { code: '+48', country: 'Poland' },
  { code: '+49', country: 'Germany' },
  { code: '+351', country: 'Portugal' },
  { code: '+353', country: 'Ireland' },
  { code: '+358', country: 'Finland' },
  { code: '+36', country: 'Hungary' },
  { code: '+30', country: 'Greece' },
  { code: '+7', country: 'Russia' },
  { code: '+62', country: 'Indonesia' },
  { code: '+60', country: 'Malaysia' },
  { code: '+63', country: 'Philippines' },
  { code: '+66', country: 'Thailand' },
  { code: '+84', country: 'Vietnam' },
  { code: '+95', country: 'Myanmar' },
  { code: '+977', country: 'Nepal' },
  { code: '+92', country: 'Pakistan' },
  { code: '+880', country: 'Bangladesh' },
  { code: '+94', country: 'Sri Lanka' },
]

const SignUp = () => {
    const [showPassword,setShowPassword] = useState(false)
    const[showConfirmPassword,setShowConfirmPassword] = useState(false)
    const [signupMethod, setSignupMethod] = useState('email')
    const [otpSent, setOtpSent] = useState(false)
    const [otp, setOtp] = useState('')
    const [loading, setLoading] = useState(false)
    const [selectedCountryCode, setSelectedCountryCode] = useState('+233')
    const [showCountryDropdown, setShowCountryDropdown] = useState(false)
    
    const[data,setData] = useState ({
      email : "",
      password : "",
      name : "",
      mobileNumber : "",
      confirmPassword : "",
      profilePic : "",
    })

    const navigate = useNavigate()
   
    const handleOnChange = (e) =>{
        const { name , value } = e.target
  
        setData((previous)=>{
          return{
             ...previous,
             [name] : value
          }
        })
    }

    const handleUploadPic = async(e) =>{
        const file = e.target.files[0]
        
        const imagePic = await imageTobase64(file)
      
        setData((previous) => {
          return{
            ...previous,
            profilePic : imagePic
          }
        })
    }
      
    const handleSocialLogin = (provider) => {
      toast.info(` ${provider} login would require Firebase or OAuth setup`)
    }

    const handleSendOtp = async () => {
      if (!data.mobileNumber || data.mobileNumber.length < 6) {
        toast.error('Please enter a valid mobile number')
        return
      }
      setLoading(true)
      setTimeout(() => {
        setLoading(false)
        setOtpSent(true)
        toast.success('OTP sent to your mobile number')
      }, 1500)
    }

    const handleVerifyOtp = async () => {
      if (otp.length !== 6) {
        toast.error('Please enter valid 6-digit OTP')
        return
      }
      setLoading(true)
      setTimeout(() => {
        setLoading(false)
        toast.success('Mobile number verified!')
        navigate("/login")
      }, 1500)
    }

    const handleCountryCodeSelect = (code) => {
      setSelectedCountryCode(code)
      setShowCountryDropdown(false)
    }

    const filteredCountryCodes = countryCodes.filter(c => 
      c.code.includes(selectedCountryCode.replace('+', '')) || 
      c.country.toLowerCase().includes(selectedCountryCode.replace('+', '').toLowerCase())
    )

    const dropdownRef = useRef(null)

    useEffect(() => {
      const handleClickOutside = (event) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
          setShowCountryDropdown(false)
        }
      }
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    
    const handleSubmit = async(e) =>{
        e.preventDefault()

        if(data.password === data.confirmPassword){
       const dataResponse = await fetch(SummaryApi.SignUP.url,{
        method : SummaryApi.SignUP.method,
        headers : {
          "content-type": "application/json"
        },
        body : JSON.stringify(data)
       })
       
       const dataApi = await dataResponse.json()

       if(dataApi.success){
        toast.success(dataApi.message)
        navigate("/login")
       }

       if (dataApi.error) {
         toast.error(dataApi.message)
       }
      
        
        }else{
          toast.error("Please check Password and Confirm Password")
        }
    }

    const socialButtons = [
      { icon: <FaGoogle />, label: 'Google', color: 'bg-red-500 hover:bg-red-600', provider: 'Google' },
      { icon: <FaFacebook />, label: 'Facebook', color: 'bg-blue-600 hover:bg-blue-700', provider: 'Facebook' },
      { icon: <FaApple />, label: 'Apple', color: 'bg-gray-800 hover:bg-gray-900', provider: 'Apple' },
    ]

  return (
    <section id='signup'>
      <div className='mx-auto container p-4'>
        

        <div className='bg-white p-5 w-full max-w-sm mx-auto'>
          <div className='w-20 h-20 mx-auto relative overflow-hidden rounded-full'>
           <div>
              <img src={data.profilePic || loginIcons} className='w-20 h-20' alt='login icon'/>
           </div>
        <form>
          <label>
          <div className='text-xs bg-opacity-80 bg-slate-200 pb-4 pt-2 text-center absolute bottom-0 w-full cursor-pointer'>
                Upload Photo
          </div>
            <input type="file" className='hidden' onChange={handleUploadPic}/>
          </label>
        </form>
        </div>

        <div className='flex justify-center gap-2 mt-4 mb-2'>
          {socialButtons.map((btn, index) => (
            <button
              key={index}
              onClick={() => handleSocialLogin(btn.provider)}
              className={`${btn.color} text-white p-3 rounded-full transition-colors`}
              title={`Sign up with ${btn.label}`}
            >
              {btn.icon}
            </button>
          ))}
        </div>

        <div className='text-center text-gray-500 text-sm my-2'>or</div>

        <div className='flex border rounded mb-4'>
          <button
            onClick={() => { setSignupMethod('email'); setOtpSent(false) }}
            className={`flex-1 py-2 text-sm font-medium ${signupMethod === 'email' ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-600'}`}
          >
            Email
          </button>
          <button
            onClick={() => { setSignupMethod('mobile'); setOtpSent(false) }}
            className={`flex-1 py-2 text-sm font-medium ${signupMethod === 'mobile' ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-600'}`}
          >
            <FaMobileAlt className='inline mr-1' />
            Mobile
          </button>
        </div>

        {signupMethod === 'mobile' && !otpSent && (
          <div className='mb-4'>
            <label>Mobile Number : </label>
            <div className='bg-slate-100 p-2 flex gap-2 relative' ref={dropdownRef}>
              <div className='relative'>
                <button
                  type='button'
                  onClick={() => setShowCountryDropdown(!showCountryDropdown)}
                  className='flex items-center gap-1 text-gray-600 hover:text-gray-800'
                >
                  {selectedCountryCode}
                  <FaChevronDown className={`text-xs transition-transform ${showCountryDropdown ? 'rotate-180' : ''}`} />
                </button>
                {showCountryDropdown && (
                  <div className='absolute top-8 left-0 bg-white border rounded shadow-lg max-h-60 overflow-y-auto z-50 w-40'>
                    <input
                      type='text'
                      placeholder='Search...'
                      value={selectedCountryCode}
                      onChange={(e) => setSelectedCountryCode('+' + e.target.value.replace(/\D/g, ''))}
                      className='w-full p-2 border-b outline-none text-sm'
                    />
                    {filteredCountryCodes.length > 0 ? (
                      filteredCountryCodes.map((item, index) => (
                        <button
                          key={index}
                          type='button'
                          onClick={() => handleCountryCodeSelect(item.code)}
                          className='w-full text-left px-3 py-2 hover:bg-gray-100 text-sm'
                        >
                          {item.code} - {item.country}
                        </button>
                      ))
                    ) : (
                      <div className='px-3 py-2 text-gray-500 text-sm'>No results</div>
                    )}
                  </div>
                )}
              </div>
              <input
                type="tel"
                placeholder='123456789'
                name='mobileNumber'
                value={data.mobileNumber}
                onChange={handleOnChange}
                required
                className='w-full h-full outline-none bg-transparent'
                maxLength={12}
              />
            </div>
            <button
              onClick={handleSendOtp}
              disabled={loading}
              className='bg-red-600 hover:bg-red-700 text-white px-6 py-2 w-full rounded-full mt-2'
            >
              {loading ? 'Sending...' : 'Send OTP'}
            </button>
          </div>
        )}

        {signupMethod === 'mobile' && otpSent && (
          <div className='mb-4'>
            <label>Enter OTP : </label>
            <div className='bg-slate-100 p-2'>
              <input
                type="text"
                placeholder='Enter 6-digit OTP'
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                required
                className='w-full h-full outline-none bg-transparent text-center text-lg letter-spacing'
                maxLength={6}
              />
            </div>
            <button
              onClick={handleVerifyOtp}
              disabled={loading}
              className='bg-red-600 hover:bg-red-700 text-white px-6 py-2 w-full rounded-full mt-2'
            >
              {loading ? 'Verifying...' : 'Verify OTP'}
            </button>
            <button
              onClick={() => setOtpSent(false)}
              className='text-sm text-red-600 hover:underline mt-2 block w-full text-center'
            >
              Change mobile number
            </button>
          </div>
        )}

        {signupMethod === 'email' && (
          <form className='pt-2 flex flex-col gap-2' onSubmit={handleSubmit}>
          <div className='grid'>
            <label>Name : </label>
            <div className='bg-slate-100 p-2'>
            <input type="text" 
             placeholder='enter your name' 
             name = 'name'
             value= {data.name}
             onChange={handleOnChange}
             required
             className='w-full h-full outline-none bg-transparent'/>
            </div>
          </div>
          <div className='grid'>
            <label>Email : </label>
            <div className='bg-slate-100 p-2'>
            <input type="email" 
             placeholder='enter email' 
             name = 'email'
             value= {data.email}
             onChange={handleOnChange}
             required
             className='w-full h-full outline-none bg-transparent'/>
            </div>
          </div>


          <div className=''>
            <label>Password : </label>
            <div className='bg-slate-100 p-2 flex'>
            <input type={showPassword ? "text" : "password"}
              placeholder='enter password' 
              value={data.password}
              name='password'
              onChange={handleOnChange}
              required
              className='w-full h-full outline-none bg-transparent'/>
               <div className='cursor-pointer text-xl' onClick={()=>setShowPassword((preview)=>!preview)}> 
                 <span>
                   {
                     showPassword ? (
                           <FaEyeSlash/>
                     )
                     :
                     (
                       <FaEye/>
                     )
                   }
                   
                 
                 </span>
               
               </div>
            </div>
          </div>
      
        
          <div className=''>
            <label>Confirm password : </label>
            <div className='bg-slate-100 p-2 flex'>
            <input type={showConfirmPassword ? "text" : "password"}
              placeholder='enter confirm password' 
              value={data.confirmPassword}
              name='confirmPassword'
              onChange={handleOnChange}
              required
              className='w-full h-full outline-none bg-transparent'/>
               <div className='cursor-pointer text-xl' onClick={()=>setShowConfirmPassword((preview)=>!preview)}> 
                 <span>
                   {
                     showConfirmPassword ? (
                           <FaEyeSlash/>
                     )
                     :
                     (
                       <FaEye/>
                     )
                   }
                   
                 
                 </span>
               
               </div>
            </div>
          </div>

          <button className='bg-red-600 hover:bg-red-700 text-white px-6 py-2 w-full max-w-[150px] rounded-full hover:scale-110 transition-all mx-auto block  mt-4'>Sign Up</button>
      </form>
        )}

        <p className='my-5'>Already have an account? <Link to={'/login'} className='text-black-600 hover:underline hover: text-red-700'>Login</Link></p>
        </div>

      </div>
    </section>
  )
}

export default SignUp
