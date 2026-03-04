import { useEffect, useState } from 'react'
import SummaryApi from '../common'
import { useNavigate } from 'react-router-dom'

const VendorSettings = () => {
    const [profile, setProfile] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [activeTab, setActiveTab] = useState('profile')
    const [saving, setSaving] = useState(false)
    const [message, setMessage] = useState(null)
    const navigate = useNavigate()

    useEffect(() => {
        fetchProfile()
    }, [])

    const fetchProfile = async () => {
        setLoading(true)
        try {
            const response = await fetch(SummaryApi.vendorProfile.url, {
                method: SummaryApi.vendorProfile.method,
                credentials: 'include'
            })
            const data = await response.json()
            
            if (data.success) {
                setProfile(data.data)
            } else if (data.message === 'Please login first') {
                navigate('/login')
            } else {
                setError(data.message)
            }
        } catch (error) {
            console.error('Error fetching profile:', error)
            setError('Failed to load settings')
        } finally {
            setLoading(false)
        }
    }

    const handleSave = async (section, data) => {
        setSaving(true)
        setMessage(null)

        try {
            const response = await fetch(SummaryApi.updateVendorProfile.url, {
                method: SummaryApi.updateVendorProfile.method,
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            })
            const result = await response.json()
            
            if (result.success) {
                setMessage({ type: 'success', text: 'Settings saved successfully!' })
                fetchProfile()
            } else {
                setMessage({ type: 'error', text: result.message })
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Failed to save settings' })
        } finally {
            setSaving(false)
        }
    }

    const handleBankSave = async (data) => {
        setSaving(true)
        setMessage(null)

        try {
            const response = await fetch(SummaryApi.updateVendorBankDetails.url, {
                method: SummaryApi.updateVendorBankDetails.method,
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            })
            const result = await response.json()
            
            if (result.success) {
                setMessage({ type: 'success', text: 'Bank details saved successfully!' })
                fetchProfile()
            } else {
                setMessage({ type: 'error', text: result.message })
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Failed to save bank details' })
        } finally {
            setSaving(false)
        }
    }

    if (loading) {
        return (
            <div className="loading-container">
                <div className="spinner"></div>
            </div>
        )
    }

    return (
        <div className="vendor-settings">
            {/* Tabs */}
            <div className="settings-tabs">
                <button 
                    className={activeTab === 'profile' ? 'active' : ''}
                    onClick={() => setActiveTab('profile')}
                >
                    🏪 Store Profile
                </button>
                <button 
                    className={activeTab === 'business' ? 'active' : ''}
                    onClick={() => setActiveTab('business')}
                >
                    📋 Business Info
                </button>
                <button 
                    className={activeTab === 'bank' ? 'active' : ''}
                    onClick={() => setActiveTab('bank')}
                >
                    💳 Bank Details
                </button>
                <button 
                    className={activeTab === 'shipping' ? 'active' : ''}
                    onClick={() => setActiveTab('shipping')}
                >
                    📦 Shipping
                </button>
                <button 
                    className={activeTab === 'verification' ? 'active' : ''}
                    onClick={() => setActiveTab('verification')}
                >
                    ✅ Verification
                </button>
            </div>

            {/* Message */}
            {message && (
                <div className={`message ${message.type}`}>
                    {message.text}
                </div>
            )}

            {/* Tab Content */}
            <div className="settings-content">
                {activeTab === 'profile' && (
                    <StoreProfileTab 
                        profile={profile} 
                        onSave={handleSave} 
                        saving={saving} 
                    />
                )}
                {activeTab === 'business' && (
                    <BusinessInfoTab 
                        profile={profile} 
                        onSave={handleSave} 
                        saving={saving} 
                    />
                )}
                {activeTab === 'bank' && (
                    <BankDetailsTab 
                        profile={profile} 
                        onSave={handleBankSave} 
                        saving={saving} 
                    />
                )}
                {activeTab === 'shipping' && (
                    <ShippingTab 
                        profile={profile} 
                        onSave={handleSave} 
                        saving={saving} 
                    />
                )}
                {activeTab === 'verification' && (
                    <VerificationTab 
                        profile={profile} 
                    />
                )}
            </div>
        </div>
    )
}

const StoreProfileTab = ({ profile, onSave, saving }) => {
    const [formData, setFormData] = useState({
        storeName: profile?.storeName || '',
        businessDescription: profile?.businessDescription || '',
        logo: profile?.logo || '',
        banner: profile?.banner || '',
        customerSupportEmail: profile?.customerSupportEmail || '',
        customerSupportPhone: profile?.customerSupportPhone || ''
    })

    useEffect(() => {
        setFormData({
            storeName: profile?.storeName || '',
            businessDescription: profile?.businessDescription || '',
            logo: profile?.logo || '',
            banner: profile?.banner || '',
            customerSupportEmail: profile?.customerSupportEmail || '',
            customerSupportPhone: profile?.customerSupportPhone || ''
        })
    }, [profile])

    return (
        <div className="settings-section">
            <h3>Store Profile</h3>
            <p className="section-desc">Customize your store appearance</p>

            <div className="form-grid">
                <div className="form-group">
                    <label>Store Name</label>
                    <input 
                        type="text"
                        value={formData.storeName}
                        onChange={(e) => setFormData({...formData, storeName: e.target.value})}
                    />
                </div>
                <div className="form-group">
                    <label>Customer Support Email</label>
                    <input 
                        type="email"
                        value={formData.customerSupportEmail}
                        onChange={(e) => setFormData({...formData, customerSupportEmail: e.target.value})}
                    />
                </div>
                <div className="form-group">
                    <label>Customer Support Phone</label>
                    <input 
                        type="tel"
                        value={formData.customerSupportPhone}
                        onChange={(e) => setFormData({...formData, customerSupportPhone: e.target.value})}
                    />
                </div>
                <div className="form-group full-width">
                    <label>Store Description</label>
                    <textarea 
                        value={formData.businessDescription}
                        onChange={(e) => setFormData({...formData, businessDescription: e.target.value})}
                        rows="4"
                    />
                </div>
                <div className="form-group">
                    <label>Logo URL</label>
                    <input 
                        type="url"
                        value={formData.logo}
                        onChange={(e) => setFormData({...formData, logo: e.target.value})}
                        placeholder="https://..."
                    />
                </div>
                <div className="form-group">
                    <label>Banner URL</label>
                    <input 
                        type="url"
                        value={formData.banner}
                        onChange={(e) => setFormData({...formData, banner: e.target.value})}
                        placeholder="https://..."
                    />
                </div>
            </div>

            <div className="form-actions">
                <button className="btn-primary" onClick={() => onSave('profile', formData)} disabled={saving}>
                    {saving ? 'Saving...' : 'Save Changes'}
                </button>
            </div>
        </div>
    )
}

const BusinessInfoTab = ({ profile, onSave, saving }) => {
    const [formData, setFormData] = useState({
        businessName: profile?.businessName || '',
        businessEmail: profile?.businessEmail || '',
        businessPhone: profile?.businessPhone || '',
        taxId: profile?.taxId || '',
        businessLicense: profile?.businessLicense || '',
        businessAddress: profile?.businessAddress || {}
    })

    useEffect(() => {
        setFormData({
            businessName: profile?.businessName || '',
            businessEmail: profile?.businessEmail || '',
            businessPhone: profile?.businessPhone || '',
            taxId: profile?.taxId || '',
            businessLicense: profile?.businessLicense || '',
            businessAddress: profile?.businessAddress || {}
        })
    }, [profile])

    const handleAddressChange = (field, value) => {
        setFormData({
            ...formData,
            businessAddress: {
                ...formData.businessAddress,
                [field]: value
            }
        })
    }

    return (
        <div className="settings-section">
            <h3>Business Information</h3>
            <p className="section-desc">Your official business details</p>

            <div className="form-grid">
                <div className="form-group">
                    <label>Business Name</label>
                    <input 
                        type="text"
                        value={formData.businessName}
                        onChange={(e) => setFormData({...formData, businessName: e.target.value})}
                    />
                </div>
                <div className="form-group">
                    <label>Business Email</label>
                    <input 
                        type="email"
                        value={formData.businessEmail}
                        onChange={(e) => setFormData({...formData, businessEmail: e.target.value})}
                    />
                </div>
                <div className="form-group">
                    <label>Business Phone</label>
                    <input 
                        type="tel"
                        value={formData.businessPhone}
                        onChange={(e) => setFormData({...formData, businessPhone: e.target.value})}
                    />
                </div>
                <div className="form-group">
                    <label>Tax ID</label>
                    <input 
                        type="text"
                        value={formData.taxId}
                        onChange={(e) => setFormData({...formData, taxId: e.target.value})}
                    />
                </div>
                <div className="form-group">
                    <label>Business License Number</label>
                    <input 
                        type="text"
                        value={formData.businessLicense}
                        onChange={(e) => setFormData({...formData, businessLicense: e.target.value})}
                    />
                </div>
                <div className="form-group">
                    <label>Street Address</label>
                    <input 
                        type="text"
                        value={formData.businessAddress?.street || ''}
                        onChange={(e) => handleAddressChange('street', e.target.value)}
                    />
                </div>
                <div className="form-group">
                    <label>City</label>
                    <input 
                        type="text"
                        value={formData.businessAddress?.city || ''}
                        onChange={(e) => handleAddressChange('city', e.target.value)}
                    />
                </div>
                <div className="form-group">
                    <label>State/Region</label>
                    <input 
                        type="text"
                        value={formData.businessAddress?.state || ''}
                        onChange={(e) => handleAddressChange('state', e.target.value)}
                    />
                </div>
                <div className="form-group">
                    <label>Country</label>
                    <input 
                        type="text"
                        value={formData.businessAddress?.country || ''}
                        onChange={(e) => handleAddressChange('country', e.target.value)}
                    />
                </div>
                <div className="form-group">
                    <label>Postal Code</label>
                    <input 
                        type="text"
                        value={formData.businessAddress?.postalCode || ''}
                        onChange={(e) => handleAddressChange('postalCode', e.target.value)}
                    />
                </div>
            </div>

            <div className="form-actions">
                <button className="btn-primary" onClick={() => onSave('business', formData)} disabled={saving}>
                    {saving ? 'Saving...' : 'Save Changes'}
                </button>
            </div>
        </div>
    )
}

const BankDetailsTab = ({ profile, onSave, saving }) => {
    const [formData, setFormData] = useState({
        bankName: profile?.bankDetails?.bankName || '',
        accountName: profile?.bankDetails?.accountName || '',
        accountNumber: profile?.bankDetails?.accountNumber || '',
        routingNumber: profile?.bankDetails?.routingNumber || '',
        swiftCode: profile?.bankDetails?.swiftCode || '',
        bankCountry: profile?.bankDetails?.bankCountry || ''
    })

    useEffect(() => {
        setFormData({
            bankName: profile?.bankDetails?.bankName || '',
            accountName: profile?.bankDetails?.accountName || '',
            accountNumber: profile?.bankDetails?.accountNumber || '',
            routingNumber: profile?.bankDetails?.routingNumber || '',
            swiftCode: profile?.bankDetails?.swiftCode || '',
            bankCountry: profile?.bankDetails?.bankCountry || ''
        })
    }, [profile])

    return (
        <div className="settings-section">
            <h3>Bank Details</h3>
            <p className="section-desc">Add your bank details to receive payouts</p>

            <div className="security-banner">
                🔒 Your bank details are encrypted and securely stored
            </div>

            <div className="form-grid">
                <div className="form-group">
                    <label>Bank Name</label>
                    <input 
                        type="text"
                        value={formData.bankName}
                        onChange={(e) => setFormData({...formData, bankName: e.target.value})}
                    />
                </div>
                <div className="form-group">
                    <label>Account Name</label>
                    <input 
                        type="text"
                        value={formData.accountName}
                        onChange={(e) => setFormData({...formData, accountName: e.target.value})}
                    />
                </div>
                <div className="form-group">
                    <label>Account Number</label>
                    <input 
                        type="text"
                        value={formData.accountNumber}
                        onChange={(e) => setFormData({...formData, accountNumber: e.target.value})}
                    />
                </div>
                <div className="form-group">
                    <label>Routing Number</label>
                    <input 
                        type="text"
                        value={formData.routingNumber}
                        onChange={(e) => setFormData({...formData, routingNumber: e.target.value})}
                    />
                </div>
                <div className="form-group">
                    <label>SWIFT Code</label>
                    <input 
                        type="text"
                        value={formData.swiftCode}
                        onChange={(e) => setFormData({...formData, swiftCode: e.target.value})}
                    />
                </div>
                <div className="form-group">
                    <label>Bank Country</label>
                    <input 
                        type="text"
                        value={formData.bankCountry}
                        onChange={(e) => setFormData({...formData, bankCountry: e.target.value})}
                    />
                </div>
            </div>

            <div className="form-actions">
                <button className="btn-primary" onClick={() => onSave(formData)} disabled={saving}>
                    {saving ? 'Saving...' : 'Save Bank Details'}
                </button>
            </div>
        </div>
    )
}

const ShippingTab = ({ profile, onSave, saving }) => {
    const [formData, setFormData] = useState({
        shippingSettings: profile?.shippingSettings || {
            processingTime: '3-5_days',
            freeShippingThreshold: 0,
            flatRateShipping: 0,
            shipsInternationally: false,
            internationalShippingCost: 0
        },
        returnPolicy: profile?.returnPolicy || {
            acceptsReturns: true,
            returnDays: 14,
            returnPolicyText: ''
        }
    })

    useEffect(() => {
        setFormData({
            shippingSettings: profile?.shippingSettings || {
                processingTime: '3-5_days',
                freeShippingThreshold: 0,
                flatRateShipping: 0,
                shipsInternationally: false,
                internationalShippingCost: 0
            },
            returnPolicy: profile?.returnPolicy || {
                acceptsReturns: true,
                returnDays: 14,
                returnPolicyText: ''
            }
        })
    }, [profile])

    const handleShippingChange = (field, value) => {
        setFormData({
            ...formData,
            shippingSettings: {
                ...formData.shippingSettings,
                [field]: value
            }
        })
    }

    const handleReturnChange = (field, value) => {
        setFormData({
            ...formData,
            returnPolicy: {
                ...formData.returnPolicy,
                [field]: value
            }
        })
    }

    return (
        <div className="settings-section">
            <h3>Shipping Settings</h3>
            <p className="section-desc">Configure your shipping preferences</p>

            <div className="form-grid">
                <div className="form-group">
                    <label>Processing Time</label>
                    <select 
                        value={formData.shippingSettings.processingTime}
                        onChange={(e) => handleShippingChange('processingTime', e.target.value)}
                    >
                        <option value="same_day">Same Day</option>
                        <option value="1-2_days">1-2 Days</option>
                        <option value="3-5_days">3-5 Days</option>
                        <option value="7-14_days">7-14 Days</option>
                    </select>
                </div>
                <div className="form-group">
                    <label>Free Shipping Threshold</label>
                    <input 
                        type="number"
                        value={formData.shippingSettings.freeShippingThreshold}
                        onChange={(e) => handleShippingChange('freeShippingThreshold', Number(e.target.value))}
                    />
                </div>
                <div className="form-group">
                    <label>Flat Rate Shipping</label>
                    <input 
                        type="number"
                        value={formData.shippingSettings.flatRateShipping}
                        onChange={(e) => handleShippingChange('flatRateShipping', Number(e.target.value))}
                    />
                </div>
                <div className="form-group">
                    <label>International Shipping Cost</label>
                    <input 
                        type="number"
                        value={formData.shippingSettings.internationalShippingCost}
                        onChange={(e) => handleShippingChange('internationalShippingCost', Number(e.target.value))}
                    />
                </div>
                <div className="form-group">
                    <label className="checkbox-label">
                        <input 
                            type="checkbox"
                            checked={formData.shippingSettings.shipsInternationally}
                            onChange={(e) => handleShippingChange('shipsInternationally', e.target.checked)}
                        />
                        Ship Internationally
                    </label>
                </div>
            </div>

            <h3 style={{ marginTop: '32px' }}>Return Policy</h3>
            <div className="form-grid">
                <div className="form-group">
                    <label className="checkbox-label">
                        <input 
                            type="checkbox"
                            checked={formData.returnPolicy.acceptsReturns}
                            onChange={(e) => handleReturnChange('acceptsReturns', e.target.checked)}
                        />
                        Accept Returns
                    </label>
                </div>
                <div className="form-group">
                    <label>Return Days</label>
                    <input 
                        type="number"
                        value={formData.returnPolicy.returnDays}
                        onChange={(e) => handleReturnChange('returnDays', Number(e.target.value))}
                        disabled={!formData.returnPolicy.acceptsReturns}
                    />
                </div>
                <div className="form-group full-width">
                    <label>Return Policy Text</label>
                    <textarea 
                        value={formData.returnPolicy.returnPolicyText}
                        onChange={(e) => handleReturnChange('returnPolicyText', e.target.value)}
                        rows="3"
                        placeholder="Describe your return policy..."
                    />
                </div>
            </div>

            <div className="form-actions">
                <button className="btn-primary" onClick={() => onSave('shipping', formData)} disabled={saving}>
                    {saving ? 'Saving...' : 'Save Shipping Settings'}
                </button>
            </div>
        </div>
    )
}

const VerificationTab = ({ profile }) => {
    return (
        <div className="settings-section">
            <h3>Account Verification</h3>
            <p className="section-desc">Verify your vendor account to start selling</p>

            <div className="verification-status">
                <div className={`status-badge large ${profile?.verificationStatus}`}>
                    {profile?.verificationStatus === 'verified' && '✓'}
                    {profile?.verificationStatus === 'pending' && '⏳'}
                    {profile?.verificationStatus === 'under_review' && '🔍'}
                    {profile?.verificationStatus === 'rejected' && '✕'}
                    {profile?.verificationStatus === 'suspended' && '⚠️'}
                    <span>{profile?.verificationStatus || 'Unknown'}</span>
                </div>

                {profile?.verificationStatus === 'verified' && (
                    <p className="verified-msg">
                        Your account is verified! You can now list and sell products.
                    </p>
                )}

                {profile?.verificationStatus === 'pending' && (
                    <p className="pending-msg">
                        Your application is being reviewed. This usually takes 2-3 business days.
                    </p>
                )}

                {profile?.verificationStatus === 'under_review' && (
                    <p className="review-msg">
                        Your documents are currently under review.
                    </p>
                )}

                {profile?.rejectionReason && (
                    <div className="rejection-reason">
                        <h4>Rejection Reason:</h4>
                        <p>{profile.rejectionReason}</p>
                    </div>
                )}
            </div>

            <div className="verification-docs">
                <h4>Submitted Documents</h4>
                {profile?.verificationDocuments?.length > 0 ? (
                    <div className="docs-list">
                        {profile.verificationDocuments.map((doc, index) => (
                            <div key={index} className="doc-item">
                                <span className="doc-type">{doc.type}</span>
                                <span className="doc-date">
                                    Uploaded: {new Date(doc.uploadedAt).toLocaleDateString()}
                                </span>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="no-docs">No documents uploaded yet</p>
                )}
            </div>

            {(profile?.verificationStatus === 'pending' || profile?.verificationStatus === 'rejected') && (
                <div className="verification-cta">
                    <button className="btn-primary">
                        Upload Verification Documents
                    </button>
                </div>
            )}
        </div>
    )
}

export default VendorSettings
