import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import SummaryApi from '../common'
import './VendorPages.css'

const BecomeVendor = () => {
    const navigate = useNavigate()
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const [vendorStatus, setVendorStatus] = useState(null)
    const [formData, setFormData] = useState({
        businessName: '',
        businessEmail: '',
        businessPhone: '',
        storeName: '',
        businessAddress: {
            street: '',
            city: '',
            state: '',
            country: '',
            postalCode: ''
        },
        taxId: '',
        businessLicense: '',
        businessDescription: ''
    })
    const [errors, setErrors] = useState({})
    const [step, setStep] = useState(1)

    useEffect(() => {
        checkVendorStatus()
    }, [])

    const checkVendorStatus = async () => {
        try {
            const response = await fetch(SummaryApi.vendorStatus.url, {
                method: SummaryApi.vendorStatus.method,
                credentials: 'include'
            })
            const data = await response.json()
            
            if (data.success) {
                setVendorStatus(data.data)
                if (data.data.isVendor && data.data.verificationStatus === 'verified') {
                    navigate('/vendor-panel')
                }
            }
        } catch (error) {
            console.error('Error checking vendor status:', error)
        } finally {
            setLoading(false)
        }
    }

    const validateForm = () => {
        const newErrors = {}
        
        if (!formData.businessName.trim()) newErrors.businessName = 'Business name is required'
        if (!formData.businessEmail.trim()) newErrors.businessEmail = 'Business email is required'
        if (!formData.businessPhone.trim()) newErrors.businessPhone = 'Business phone is required'
        if (!formData.storeName.trim()) newErrors.storeName = 'Store name is required'
        else if (formData.storeName.length < 3) newErrors.storeName = 'Store name must be at least 3 characters'
        
        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        
        if (step === 1) {
            if (validateForm()) {
                setStep(2)
            }
            return
        }
        
        setSubmitting(true)
        
        try {
            const response = await fetch(SummaryApi.becomeVendor.url, {
                method: SummaryApi.becomeVendor.method,
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            })
            const data = await response.json()
            
            if (data.success) {
                setStep(3)
            } else {
                alert(data.message)
            }
        } catch (error) {
            console.error('Error submitting application:', error)
        } finally {
            setSubmitting(false)
        }
    }

    const handleChange = (e) => {
        const { name, value } = e.target
        
        if (name.includes('.')) {
            const [parent, child] = name.split('.')
            setFormData(prev => ({
                ...prev,
                [parent]: {
                    ...prev[parent],
                    [child]: value
                }
            }))
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }))
        }
        
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: null }))
        }
    }

    if (loading) {
        return (
            <div className="bv-loading">
                <div className="bv-spinner"></div>
            </div>
        )
    }

    // Show pending status if user has applied
    if (vendorStatus?.hasVendorApplication && vendorStatus?.verificationStatus !== 'verified') {
        return (
            <div className="bv-container">
                <div className="bv-pending-card">
                    <div className="bv-pending-icon">
                        {vendorStatus.verificationStatus === 'pending' ? '📝' : 
                         vendorStatus.verificationStatus === 'under_review' ? '🔍' : 
                         vendorStatus.verificationStatus === 'rejected' ? '❌' : '⏳'}
                    </div>
                    <h2>
                        {vendorStatus.verificationStatus === 'rejected' ? 'Application Declined' : 'Application Under Review'}
                    </h2>
                    <p className="bv-pending-desc">
                        {vendorStatus.verificationStatus === 'pending' && 
                            'Your vendor application is being reviewed. We will notify you once the review is complete.'}
                        {vendorStatus.verificationStatus === 'under_review' && 
                            'Your application is currently being processed by our team.'}
                        {vendorStatus.verificationStatus === 'rejected' && 
                            'Unfortunately, your application was not approved. Please contact our support team for more information.'}
                    </p>
                    
                    <div className="bv-application-info">
                        <div className="bv-info-row">
                            <span className="bv-info-label">Business Name</span>
                            <span className="bv-info-value">{vendorStatus.businessName || 'N/A'}</span>
                        </div>
                        <div className="bv-info-row">
                            <span className="bv-info-label">Store Name</span>
                            <span className="bv-info-value">{vendorStatus.storeName || 'N/A'}</span>
                        </div>
                        <div className="bv-info-row">
                            <span className="bv-info-label">Status</span>
                            <span className={`bv-status-badge ${vendorStatus.verificationStatus}`}>
                                {vendorStatus.verificationStatus}
                            </span>
                        </div>
                    </div>

                    <div className="bv-pending-actions">
                        {vendorStatus.verificationStatus === 'rejected' ? (
                            <button 
                                className="bv-btn-primary"
                                onClick={() => {
                                    setVendorStatus(null)
                                    setStep(1)
                                }}
                            >
                                Submit New Application
                            </button>
                        ) : (
                            <>
                                <p className="bv-review-time">Typical review time: 2-3 business days</p>
                                <button 
                                    className="bv-btn-secondary"
                                    onClick={() => navigate('/')}
                                >
                                    Back to Home
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="bv-container">
            {/* Progress Steps */}
            <div className="bv-progress">
                <div className={`bv-step ${step >= 1 ? 'active' : ''} ${step > 1 ? 'completed' : ''}`}>
                    <div className="bv-step-number">1</div>
                    <div className="bv-step-label">Business Info</div>
                </div>
                <div className="bv-step-line"></div>
                <div className={`bv-step ${step >= 2 ? 'active' : ''} ${step > 2 ? 'completed' : ''}`}>
                    <div className="bv-step-number">2</div>
                    <div className="bv-step-label">Additional Details</div>
                </div>
                <div className="bv-step-line"></div>
                <div className={`bv-step ${step >= 3 ? 'active' : ''}`}>
                    <div className="bv-step-number">3</div>
                    <div className="bv-step-label">Complete</div>
                </div>
            </div>

            {step === 3 ? (
                // Success Step
                <div className="bv-success-card">
                    <div className="bv-success-icon">✅</div>
                    <h2>Application Submitted!</h2>
                    <p>Your vendor application has been received and is under review.</p>
                    
                    <div className="bv-success-details">
                        <div className="bv-detail-item">
                            <span className="bv-detail-label">Business Name</span>
                            <span className="bv-detail-value">{formData.businessName}</span>
                        </div>
                        <div className="bv-detail-item">
                            <span className="bv-detail-label">Store Name</span>
                            <span className="bv-detail-value">{formData.storeName}</span>
                        </div>
                    </div>

                    <div className="bv-success-actions">
                        <p>We'll send you an email once your application is approved.</p>
                        <button 
                            className="bv-btn-primary"
                            onClick={() => navigate('/')}
                        >
                            Return to Home
                        </button>
                    </div>
                </div>
            ) : (
                // Form Steps
                <div className="bv-form-card">
                    <div className="bv-form-header">
                        <h1>{step === 1 ? 'Start Selling Today' : 'Additional Information'}</h1>
                        <p>{step === 1 
                            ? 'Fill in your business details to begin your journey as a seller'
                            : 'Tell us more about your business to help us serve you better'
                        }</p>
                    </div>

                    <form onSubmit={handleSubmit} className="bv-form">
                        {step === 1 ? (
                            <div className="bv-form-section">
                                <div className="bv-form-group">
                                    <label>Business Name *</label>
                                    <input 
                                        type="text"
                                        name="businessName"
                                        value={formData.businessName}
                                        onChange={handleChange}
                                        className={errors.businessName ? 'error' : ''}
                                        placeholder="Your registered business name"
                                    />
                                    {errors.businessName && <span className="bv-error">{errors.businessName}</span>}
                                </div>

                                <div className="bv-form-row">
                                    <div className="bv-form-group">
                                        <label>Business Email *</label>
                                        <input 
                                            type="email"
                                            name="businessEmail"
                                            value={formData.businessEmail}
                                            onChange={handleChange}
                                            className={errors.businessEmail ? 'error' : ''}
                                            placeholder="business@company.com"
                                        />
                                        {errors.businessEmail && <span className="bv-error">{errors.businessEmail}</span>}
                                    </div>
                                    <div className="bv-form-group">
                                        <label>Business Phone *</label>
                                        <input 
                                            type="tel"
                                            name="businessPhone"
                                            value={formData.businessPhone}
                                            onChange={handleChange}
                                            className={errors.businessPhone ? 'error' : ''}
                                            placeholder="+1 234 567 8900"
                                        />
                                        {errors.businessPhone && <span className="bv-error">{errors.businessPhone}</span>}
                                    </div>
                                </div>

                                <div className="bv-form-group">
                                    <label>Store Name *</label>
                                    <input 
                                        type="text"
                                        name="storeName"
                                        value={formData.storeName}
                                        onChange={handleChange}
                                        className={errors.storeName ? 'error' : ''}
                                        placeholder="your-store-name"
                                    />
                                    {errors.storeName && <span className="bv-error">{errors.storeName}</span>}
                                    <span className="bv-hint">This will be displayed to customers as your shop URL</span>
                                </div>

                                <div className="bv-form-group">
                                    <label>Business Description</label>
                                    <textarea 
                                        name="businessDescription"
                                        value={formData.businessDescription}
                                        onChange={handleChange}
                                        rows="3"
                                        placeholder="Tell customers about your business, products, and what makes you unique..."
                                    />
                                </div>
                            </div>
                        ) : (
                            <div className="bv-form-section">
                                <div className="bv-form-row">
                                    <div className="bv-form-group">
                                        <label>Tax ID (Optional)</label>
                                        <input 
                                            type="text"
                                            name="taxId"
                                            value={formData.taxId}
                                            onChange={handleChange}
                                            placeholder="Tax identification number"
                                        />
                                    </div>
                                    <div className="bv-form-group">
                                        <label>Business License (Optional)</label>
                                        <input 
                                            type="text"
                                            name="businessLicense"
                                            value={formData.businessLicense}
                                            onChange={handleChange}
                                            placeholder="Business registration number"
                                        />
                                    </div>
                                </div>

                                <div className="bv-form-group">
                                    <label>Street Address</label>
                                    <input 
                                        type="text"
                                        name="businessAddress.street"
                                        value={formData.businessAddress.street}
                                        onChange={handleChange}
                                        placeholder="123 Business Street"
                                    />
                                </div>

                                <div className="bv-form-row">
                                    <div className="bv-form-group">
                                        <label>City</label>
                                        <input 
                                            type="text"
                                            name="businessAddress.city"
                                            value={formData.businessAddress.city}
                                            onChange={handleChange}
                                            placeholder="City"
                                        />
                                    </div>
                                    <div className="bv-form-group">
                                        <label>State/Region</label>
                                        <input 
                                            type="text"
                                            name="businessAddress.state"
                                            value={formData.businessAddress.state}
                                            onChange={handleChange}
                                            placeholder="State"
                                        />
                                    </div>
                                </div>

                                <div className="bv-form-row">
                                    <div className="bv-form-group">
                                        <label>Country</label>
                                        <input 
                                            type="text"
                                            name="businessAddress.country"
                                            value={formData.businessAddress.country}
                                            onChange={handleChange}
                                            placeholder="Country"
                                        />
                                    </div>
                                    <div className="bv-form-group">
                                        <label>Postal Code</label>
                                        <input 
                                            type="text"
                                            name="businessAddress.postalCode"
                                            value={formData.businessAddress.postalCode}
                                            onChange={handleChange}
                                            placeholder="12345"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="bv-form-actions">
                            {step === 2 && (
                                <button 
                                    type="button"
                                    className="bv-btn-secondary"
                                    onClick={() => setStep(1)}
                                >
                                    Back
                                </button>
                            )}
                            <button 
                                type="submit" 
                                className="bv-btn-primary"
                                disabled={submitting}
                            >
                                {submitting 
                                    ? 'Submitting...' 
                                    : step === 1 
                                        ? 'Continue' 
                                        : 'Submit Application'
                                }
                            </button>
                        </div>
                    </form>

                    <p className="bv-terms">
                        By submitting, you agree to our <a href="/terms">Terms of Service</a> and <a href="/privacy">Privacy Policy</a>
                    </p>
                </div>
            )}

            {/* Benefits Section */}
            {step < 3 && (
                <div className="bv-benefits">
                    <h3>Why Sell With Us?</h3>
                    <div className="bv-benefits-grid">
                        <div className="bv-benefit">
                            <div className="bv-benefit-icon">🌍</div>
                            <h4>Global Reach</h4>
                            <p>Access millions of customers across Africa and beyond</p>
                        </div>
                        <div className="bv-benefit">
                            <div className="bv-benefit-icon">💰</div>
                            <h4>Secure Payments</h4>
                            <p>Get paid securely with multiple payment options</p>
                        </div>
                        <div className="bv-benefit">
                            <div className="bv-benefit-icon">📊</div>
                            <h4>Powerful Analytics</h4>
                            <p>Track your sales and growth with detailed insights</p>
                        </div>
                        <div className="bv-benefit">
                            <div className="bv-benefit-icon">🚚</div>
                            <h4>Easy Shipping</h4>
                            <p>Integrated shipping solutions to reach your customers</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default BecomeVendor
