import { useEffect, useState } from 'react'
import SummaryApi from '../common'
import displayCEDICurrency from '../helpers/displayCurrency'
import { FaMoneyBillWave, FaChartLine, FaCreditCard, FaPercentage, FaCheckCircle, FaClock, FaTimesCircle, FaFilter, FaSync, FaCheck, FaTimes, FaEdit, FaTrash, FaPlus, FaTimesCircle as FaClose } from 'react-icons/fa'

const CommissionManagement = () => {
    const [settings, setSettings] = useState(null)
    const [loading, setLoading] = useState(true)
    const [activeTab, setActiveTab] = useState('overview')
    const [report, setReport] = useState(null)
    const [stats, setStats] = useState(null)

    useEffect(() => {
        fetchSettings()
        fetchPayoutStats()
    }, [])

    const fetchSettings = async () => {
        try {
            const response = await fetch(SummaryApi.getCommissionSettings.url, {
                credentials: 'include'
            })
            const data = await response.json()
            if (data.success) {
                setSettings(data.data)
            }
        } catch (error) {
            console.error('Error:', error)
        } finally {
            setLoading(false)
        }
    }

    const fetchPayoutStats = async () => {
        try {
            const response = await fetch(SummaryApi.getPayoutStats.url, {
                credentials: 'include'
            })
            const data = await response.json()
            if (data.success) {
                setStats(data.data)
            }
        } catch (error) {
            console.error('Error:', error)
        }
    }

    const fetchReport = async () => {
        try {
            const response = await fetch(SummaryApi.getCommissionReport.url, {
                credentials: 'include'
            })
            const data = await response.json()
            if (data.success) {
                setReport(data.data)
            }
        } catch (error) {
            console.error('Error:', error)
        }
    }

    useEffect(() => {
        if (activeTab === 'report') {
            fetchReport()
        }
    }, [activeTab])

    const refreshSettings = () => {
        fetchSettings()
        fetchPayoutStats()
    }

    const tabs = [
        { id: 'overview', label: 'Commission Settings', icon: FaPercentage },
        { id: 'categories', label: 'Category Rates', icon: FaChartLine },
        { id: 'report', label: 'Commission Report', icon: FaChartLine },
        { id: 'payouts', label: 'Payout Requests', icon: FaCreditCard },
    ]

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
            </div>
        )
    }

    return (
        <div className="p-4 md:p-6">
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Commission & Payout Management</h1>
                <p className="text-gray-500 mt-1">Configure platform commissions and manage vendor payouts</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <StatCard 
                    icon={FaMoneyBillWave}
                    label="Total Volume"
                    value={displayCEDICurrency(stats?.totals?.totalVolume || 0)}
                    bgColor="bg-gradient-to-br from-blue-500 to-blue-600"
                />
                <StatCard 
                    icon={FaCheckCircle}
                    label="Completed"
                    value={displayCEDICurrency(stats?.byStatus?.completed?.amount || 0)}
                    bgColor="bg-gradient-to-br from-green-500 to-green-600"
                />
                <StatCard 
                    icon={FaClock}
                    label="Pending"
                    value={displayCEDICurrency(stats?.byStatus?.pending?.amount || 0)}
                    bgColor="bg-gradient-to-br from-yellow-500 to-yellow-600"
                />
                <StatCard 
                    icon={FaTimesCircle}
                    label="Failed"
                    value={displayCEDICurrency(stats?.byStatus?.failed?.amount || 0)}
                    bgColor="bg-gradient-to-br from-red-500 to-red-600"
                />
            </div>

            {/* Tabs */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="flex overflow-x-auto scrollbar-thin">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`
                                flex items-center gap-2 px-6 py-4 text-sm font-medium whitespace-nowrap transition-all
                                border-b-2 
                                ${activeTab === tab.id 
                                    ? 'border-red-600 text-red-600 bg-red-50/50' 
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                                }
                            `}
                        >
                            <tab.icon className="text-lg" />
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Tab Content */}
                <div className="p-6">
                    {activeTab === 'overview' && <SettingsPanel settings={settings} onUpdate={refreshSettings} />}
                    {activeTab === 'categories' && <CategoryCommissionPanel settings={settings} onUpdate={refreshSettings} />}
                    {activeTab === 'report' && <ReportPanel report={report} loading={!report} />}
                    {activeTab === 'payouts' && <PayoutManagementTab onUpdate={fetchPayoutStats} />}
                </div>
            </div>
        </div>
    )
}

const StatCard = ({ icon: Icon, label, value, bgColor }) => (
    <div className={`${bgColor} rounded-xl p-5 text-white shadow-lg`}>
        <div className="flex items-center justify-between">
            <div>
                <p className="text-white/80 text-sm font-medium">{label}</p>
                <p className="text-2xl font-bold mt-1">{value}</p>
            </div>
            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                <Icon className="text-xl" />
            </div>
        </div>
    </div>
)

const SettingsPanel = ({ settings, onUpdate }) => {
    const [editing, setEditing] = useState(false)
    const [formData, setFormData] = useState({
        platform: {},
        platformFees: {},
        payoutSettings: {},
        refundSettings: {}
    })
    const [saving, setSaving] = useState(false)

    useEffect(() => {
        if (settings) {
            setFormData({
                platform: { ...settings.platform },
                platformFees: { ...settings.platformFees },
                payoutSettings: { ...settings.payoutSettings },
                refundSettings: { ...settings.refundSettings }
            })
        }
    }, [settings])

    const handleChange = (section, field, value) => {
        setFormData(prev => ({
            ...prev,
            [section]: {
                ...prev[section],
                [field]: value
            }
        }))
    }

    const handleSave = async () => {
        setSaving(true)
        try {
            const response = await fetch(SummaryApi.updateCommissionSettings.url, {
                method: 'PUT',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            })
            const data = await response.json()
            if (data.success) {
                setEditing(false)
                onUpdate()
                alert('Settings saved successfully!')
            } else {
                alert(data.message)
            }
        } catch (error) {
            console.error('Error:', error)
        } finally {
            setSaving(false)
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-800">Platform Settings</h3>
                {!editing ? (
                    <button 
                        onClick={() => setEditing(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                    >
                        <FaEdit /> Edit Settings
                    </button>
                ) : (
                    <div className="flex gap-2">
                        <button 
                            onClick={() => setEditing(false)}
                            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                        >
                            <FaClose /> Cancel
                        </button>
                        <button 
                            onClick={handleSave}
                            disabled={saving}
                            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                        >
                            {saving ? <FaSync className="animate-spin" /> : <FaCheck />} Save Changes
                        </button>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                        <FaPercentage className="text-red-500" />
                        Commission Rates
                    </h3>
                    <div className="space-y-4">
                        <SettingInput 
                            label="Default Commission Rate (%)" 
                            value={formData.platform.defaultCommissionRate}
                            onChange={(v) => handleChange('platform', 'defaultCommissionRate', parseFloat(v))}
                            editable={editing}
                            type="number"
                            step="0.1"
                        />
                        <SettingInput 
                            label="Minimum Commission Rate (%)" 
                            value={formData.platform.minimumCommissionRate}
                            onChange={(v) => handleChange('platform', 'minimumCommissionRate', parseFloat(v))}
                            editable={editing}
                            type="number"
                            step="0.1"
                        />
                        <SettingInput 
                            label="Maximum Commission Rate (%)" 
                            value={formData.platform.maximumCommissionRate}
                            onChange={(v) => handleChange('platform', 'maximumCommissionRate', parseFloat(v))}
                            editable={editing}
                            type="number"
                            step="0.1"
                        />
                    </div>
                </div>

                <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                        <FaCreditCard className="text-blue-500" />
                        Platform Fees
                    </h3>
                    <div className="space-y-4">
                        <SettingInput 
                            label="Payment Gateway Fee (%)" 
                            value={formData.platformFees.paymentGatewayFee}
                            onChange={(v) => handleChange('platformFees', 'paymentGatewayFee', parseFloat(v))}
                            editable={editing}
                            type="number"
                            step="0.1"
                        />
                        <SettingInput 
                            label="Fixed Transaction Fee ($)" 
                            value={formData.platformFees.fixedTransactionFee}
                            onChange={(v) => handleChange('platformFees', 'fixedTransactionFee', parseFloat(v))}
                            editable={editing}
                            type="number"
                            step="0.01"
                        />
                    </div>
                </div>

                <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                        <FaClock className="text-yellow-500" />
                        Payout Settings
                    </h3>
                    <div className="space-y-4">
                        <SettingInput 
                            label="Minimum Payout ($)" 
                            value={formData.payoutSettings.defaultMinimumPayout}
                            onChange={(v) => handleChange('payoutSettings', 'defaultMinimumPayout', parseFloat(v))}
                            editable={editing}
                            type="number"
                        />
                        {editing ? (
                            <div className="py-2">
                                <label className="block text-sm text-gray-600 mb-1">Payout Schedule</label>
                                <select 
                                    value={formData.payoutSettings.defaultPayoutSchedule}
                                    onChange={(e) => handleChange('payoutSettings', 'defaultPayoutSchedule', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                >
                                    <option value="daily">Daily</option>
                                    <option value="weekly">Weekly</option>
                                    <option value="biweekly">Bi-weekly</option>
                                    <option value="monthly">Monthly</option>
                                </select>
                            </div>
                        ) : (
                            <SettingDisplay 
                                label="Payout Schedule" 
                                value={formData.payoutSettings.defaultPayoutSchedule}
                            />
                        )}
                        {editing && (
                            <div className="flex items-center gap-2 py-2">
                                <input 
                                    type="checkbox"
                                    id="autoPayout"
                                    checked={formData.payoutSettings.autoPayoutEnabled}
                                    onChange={(e) => handleChange('payoutSettings', 'autoPayoutEnabled', e.target.checked)}
                                    className="w-4 h-4 text-red-600"
                                />
                                <label htmlFor="autoPayout" className="text-sm text-gray-700">Enable Auto Payout</label>
                            </div>
                        )}
                    </div>
                </div>

                <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                        <FaTimesCircle className="text-red-500" />
                        Refund Settings
                    </h3>
                    <div className="space-y-4">
                        {editing ? (
                            <div className="py-2">
                                <label className="block text-sm text-gray-600 mb-1">Commission Refund Policy</label>
                                <select 
                                    value={formData.refundSettings.commissionRefundPolicy}
                                    onChange={(e) => handleChange('refundSettings', 'commissionRefundPolicy', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                >
                                    <option value="full_refund">Full Refund</option>
                                    <option value="partial_refund">Partial Refund (50%)</option>
                                    <option value="no_refund">No Refund</option>
                                </select>
                            </div>
                        ) : (
                            <SettingDisplay 
                                label="Commission Refund Policy" 
                                value={formData.refundSettings.commissionRefundPolicy?.replace('_', ' ')}
                            />
                        )}
                        <SettingInput 
                            label="Grace Period (days)" 
                            value={formData.refundSettings.gracePeriodDays}
                            onChange={(v) => handleChange('refundSettings', 'gracePeriodDays', parseInt(v))}
                            editable={editing}
                            type="number"
                        />
                    </div>
                </div>
            </div>
        </div>
    )
}

const SettingInput = ({ label, value, onChange, editable, type = 'text', step = 1 }) => (
    <div className="py-2 border-b border-gray-200 last:border-0">
        <label className="block text-sm text-gray-600 mb-1">{label}</label>
        {editable ? (
            <input 
                type={type}
                value={value || 0}
                onChange={(e) => onChange(e.target.value)}
                step={step}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
            />
        ) : (
            <span className="font-semibold text-gray-900">{value}</span>
        )}
    </div>
)

const SettingDisplay = ({ label, value }) => (
    <div className="py-2 border-b border-gray-200 last:border-0">
        <span className="text-sm text-gray-600">{label}</span>
        <p className="font-semibold text-gray-900 capitalize">{value}</p>
    </div>
)

const CategoryCommissionPanel = ({ settings, onUpdate }) => {
    const [categories, setCategories] = useState([])
    const [loading, setLoading] = useState(true)
    const [showModal, setShowModal] = useState(false)
    const [editingCategory, setEditingCategory] = useState(null)
    const [commissionRate, setCommissionRate] = useState(10)
    const [saving, setSaving] = useState(false)

    console.log('CategoryCommissionPanel settings:', settings)

    useEffect(() => {
        fetchCategories()
    }, [])

    const fetchCategories = async () => {
        setLoading(true)
        try {
            const response = await fetch(SummaryApi.getAllCategories.url, {
                credentials: 'include'
            })
            const data = await response.json()
            console.log('Categories response:', response.status, data)
            if (data.data) {
                setCategories(data.data)
            }
        } catch (error) {
            console.error('Error:', error)
        } finally {
            setLoading(false)
        }
    }

    const getCategoryCommission = (categoryId) => {
        const commission = settings?.categoryCommissions?.find(
            c => String(c.category) === String(categoryId)
        )
        return commission?.commissionRate ?? settings?.platform?.defaultCommissionRate ?? 10
    }

    const getCategoryName = (categoryId) => {
        const category = categories.find(c => String(c._id) === String(categoryId))
        return category?.categoryName || 'Unknown'
    }

    const openEditModal = (categoryId) => {
        console.log('Opening edit for category:', categoryId, typeof categoryId)
        setEditingCategory(String(categoryId))
        setCommissionRate(getCategoryCommission(String(categoryId)))
        setShowModal(true)
    }

    const handleSave = async () => {
        if (!editingCategory) return
        
        console.log('Saving commission rate:', {
            categoryId: editingCategory,
            categoryName: getCategoryName(editingCategory),
            commissionRate: commissionRate
        })
        
        setSaving(true)
        try {
            const response = await fetch(SummaryApi.updateCategoryCommission.url, {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    categoryId: editingCategory,
                    categoryName: getCategoryName(editingCategory),
                    commissionRate: parseFloat(commissionRate)
                })
            })
            const data = await response.json()
            console.log('Response:', response.status, data)
            
            if (data.success) {
                setShowModal(false)
                onUpdate()
                alert('Category commission updated!')
            } else {
                alert(data.message || 'Failed to update commission')
            }
        } catch (error) {
            console.error('Error:', error)
            alert('Error: ' + error.message)
        } finally {
            setSaving(false)
        }
    }

    const handleDelete = async (categoryId) => {
        if (!confirm('Remove custom commission rate for this category?')) return
        
        try {
            const response = await fetch(
                SummaryApi.deleteCategoryCommission.url.replace(':categoryId', categoryId),
                { method: 'DELETE', credentials: 'include' }
            )
            const data = await response.json()
            if (data.success) {
                onUpdate()
                alert('Category commission removed!')
            } else {
                alert(data.message)
            }
        } catch (error) {
            console.error('Error:', error)
        }
    }

    const defaultRate = settings?.platform?.defaultCommissionRate || 10

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-semibold text-gray-800">Category-Based Commission Rates</h3>
                    <p className="text-gray-500 text-sm mt-1">
                        Default rate: <span className="font-semibold">{defaultRate}%</span>. 
                        Set custom rates per category to override the default.
                    </p>
                </div>
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-red-600"></div>
                </div>
            ) : categories.length > 0 ? (
                <div className="overflow-x-auto rounded-xl border border-gray-200">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-gray-50">
                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Category</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Commission Rate</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Status</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {categories.map((category) => {
                                const commission = settings?.categoryCommissions?.find(
                                    c => String(c.category) === String(category._id)
                                )
                                const isCustom = !!commission
                                
                                return (
                                    <tr key={category._id} className="hover:bg-gray-50">
                                        <td className="px-4 py-3 font-medium text-gray-800">
                                            {category.categoryName}
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${isCustom ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}>
                                                {commission?.commissionRate ?? defaultRate}%
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            {isCustom ? (
                                                <span className="text-green-600 text-sm">Custom Rate</span>
                                            ) : (
                                                <span className="text-gray-500 text-sm">Default</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-2">
                                                <button 
                                                    onClick={() => openEditModal(category._id)}
                                                    className="p-1.5 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200"
                                                    title="Edit"
                                                >
                                                    <FaEdit className="text-sm" />
                                                </button>
                                                {isCustom && (
                                                    <button 
                                                        onClick={() => handleDelete(category._id)}
                                                        className="p-1.5 bg-red-100 text-red-600 rounded-lg hover:bg-red-200"
                                                        title="Remove Custom Rate"
                                                    >
                                                        <FaTrash className="text-sm" />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="text-center py-12 bg-gray-50 rounded-xl">
                    <div className="text-5xl mb-4">📁</div>
                    <h3 className="text-xl font-semibold text-gray-700">No Categories</h3>
                    <p className="text-gray-500 mt-2">Create categories to set commission rates</p>
                </div>
            )}

            {/* Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold">Edit Category Commission</h3>
                            <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                                <FaTimes />
                            </button>
                        </div>
                        
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Category: <span className="font-semibold">{getCategoryName(editingCategory)}</span>
                            </label>
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Commission Rate (%)
                            </label>
                            <input 
                                type="number"
                                value={commissionRate}
                                onChange={(e) => setCommissionRate(e.target.value)}
                                step="0.1"
                                min="0"
                                max="100"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                            />
                            <p className="text-sm text-gray-500 mt-1">
                                Default rate is {defaultRate}%
                            </p>
                        </div>

                        <div className="flex gap-3">
                            <button 
                                onClick={() => setShowModal(false)}
                                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={handleSave}
                                disabled={saving}
                                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                            >
                                {saving ? <FaSync className="animate-spin mx-auto" /> : 'Save'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

const ReportPanel = ({ report, loading }) => {
    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-red-600"></div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                    <p className="text-blue-600 text-sm font-medium">Gross Sales</p>
                    <p className="text-xl font-bold text-blue-700 mt-1">
                        {displayCEDICurrency(report?.totals?.totalGrossAmount || 0)}
                    </p>
                </div>
                <div className="bg-green-50 rounded-xl p-4 border border-green-100">
                    <p className="text-green-600 text-sm font-medium">Platform Commission</p>
                    <p className="text-xl font-bold text-green-700 mt-1">
                        {displayCEDICurrency(report?.totals?.totalPlatformCommission || 0)}
                    </p>
                </div>
                <div className="bg-purple-50 rounded-xl p-4 border border-purple-100">
                    <p className="text-purple-600 text-sm font-medium">Total Fees</p>
                    <p className="text-xl font-bold text-purple-700 mt-1">
                        {displayCEDICurrency(report?.totals?.totalFees || 0)}
                    </p>
                </div>
                <div className="bg-yellow-50 rounded-xl p-4 border border-yellow-100">
                    <p className="text-yellow-600 text-sm font-medium">Net Vendor</p>
                    <p className="text-xl font-bold text-yellow-700 mt-1">
                        {displayCEDICurrency(report?.totals?.totalNetVendorAmount || 0)}
                    </p>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="bg-gray-50">
                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Type</th>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Count</th>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Gross Amount</th>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Commission</th>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Fees</th>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Net Vendor</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {report?.breakdown?.map((item, index) => (
                            <tr key={index} className="hover:bg-gray-50">
                                <td className="px-4 py-3">
                                    <span className="px-2 py-1 bg-gray-100 rounded-full text-xs font-medium capitalize">
                                        {item._id}
                                    </span>
                                </td>
                                <td className="px-4 py-3 text-gray-600">{item.count}</td>
                                <td className="px-4 py-3 font-medium">{displayCEDICurrency(item.grossAmount)}</td>
                                <td className="px-4 py-3 text-green-600">{displayCEDICurrency(item.platformCommission)}</td>
                                <td className="px-4 py-3 text-purple-600">{displayCEDICurrency(item.totalFees)}</td>
                                <td className="px-4 py-3 font-semibold">{displayCEDICurrency(item.netVendorAmount)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

const PayoutManagementTab = ({ onUpdate }) => {
    const [payouts, setPayouts] = useState([])
    const [loading, setLoading] = useState(true)
    const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 })
    const [statusFilter, setStatusFilter] = useState('')
    const [processingId, setProcessingId] = useState(null)

    useEffect(() => {
        fetchPayouts()
    }, [pagination.page, statusFilter])

    const fetchPayouts = async () => {
        setLoading(true)
        try {
            const url = new URL(SummaryApi.getAllPayouts.url, window.location.origin)
            url.searchParams.append('page', pagination.page)
            url.searchParams.append('limit', 20)
            if (statusFilter) url.searchParams.append('status', statusFilter)
            
            const response = await fetch(url, { credentials: 'include' })
            const data = await response.json()
            if (data.success) {
                setPayouts(data.data.payouts)
                setPagination(data.data.pagination)
            }
        } catch (error) {
            console.error('Error:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleApprove = async (payoutId) => {
        try {
            const response = await fetch(
                SummaryApi.approvePayout.url.replace(':payoutId', payoutId), 
                { method: 'POST', credentials: 'include' }
            )
            const data = await response.json()
            if (data.success) {
                fetchPayouts()
                onUpdate?.()
            } else {
                alert(data.message)
            }
        } catch (error) {
            console.error('Error:', error)
        }
    }

    const handleProcess = async (payoutId) => {
        setProcessingId(payoutId)
        try {
            const response = await fetch(
                SummaryApi.processPayout.url.replace(':payoutId', payoutId), 
                { method: 'POST', credentials: 'include' }
            )
            const data = await response.json()
            if (data.success) {
                fetchPayouts()
                onUpdate?.()
            } else {
                alert(data.message)
            }
        } catch (error) {
            console.error('Error:', error)
        } finally {
            setProcessingId(null)
        }
    }

    const handleCancel = async (payoutId) => {
        const reason = prompt('Please provide a reason for cancellation:')
        if (!reason) return
        
        try {
            const response = await fetch(
                SummaryApi.cancelPayout.url.replace(':payoutId', payoutId), 
                { 
                    method: 'POST', 
                    credentials: 'include',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ reason })
                }
            )
            const data = await response.json()
            if (data.success) {
                fetchPayouts()
                onUpdate?.()
            } else {
                alert(data.message)
            }
        } catch (error) {
            console.error('Error:', error)
        }
    }

    const getStatusBadge = (status) => {
        const styles = {
            draft: 'bg-gray-100 text-gray-700',
            pending: 'bg-yellow-100 text-yellow-700',
            approved: 'bg-blue-100 text-blue-700',
            processing: 'bg-purple-100 text-purple-700',
            completed: 'bg-green-100 text-green-700',
            failed: 'bg-red-100 text-red-700',
            cancelled: 'bg-red-100 text-red-700',
            on_hold: 'bg-orange-100 text-orange-700'
        }
        return styles[status] || 'bg-gray-100 text-gray-700'
    }

    return (
        <div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <h3 className="text-lg font-semibold text-gray-800">Payout Requests</h3>
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <FaFilter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <select 
                            value={statusFilter} 
                            onChange={(e) => {
                                setStatusFilter(e.target.value)
                                setPagination(p => ({ ...p, page: 1 }))
                            }}
                            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                        >
                            <option value="">All Status</option>
                            <option value="pending">Pending</option>
                            <option value="approved">Approved</option>
                            <option value="processing">Processing</option>
                            <option value="completed">Completed</option>
                            <option value="failed">Failed</option>
                            <option value="cancelled">Cancelled</option>
                        </select>
                    </div>
                    <button 
                        onClick={fetchPayouts}
                        className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                        <FaSync className={`text-gray-600 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-red-600"></div>
                </div>
            ) : payouts.length > 0 ? (
                <>
                    <div className="overflow-x-auto rounded-xl border border-gray-200">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-gray-50">
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Payout ID</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Vendor</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Amount</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Net Amount</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Method</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Status</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Date</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {payouts.map((payout) => (
                                    <tr key={payout._id} className="hover:bg-gray-50">
                                        <td className="px-4 py-3">
                                            <span className="font-mono text-sm text-gray-600">
                                                {payout.payoutId?.slice(0, 18)}...
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 font-medium text-gray-800">
                                            {payout.vendor?.storeName || 'Unknown'}
                                        </td>
                                        <td className="px-4 py-3 font-semibold">
                                            {displayCEDICurrency(payout.amount)}
                                        </td>
                                        <td className="px-4 py-3 text-green-600 font-medium">
                                            {displayCEDICurrency(payout.breakdown?.netAmount)}
                                        </td>
                                        <td className="px-4 py-3 capitalize text-gray-600">
                                            {payout.paymentMethod?.replace('_', ' ')}
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(payout.status)}`}>
                                                {payout.status}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-gray-600 text-sm">
                                            {new Date(payout.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-2">
                                                {payout.status === 'pending' && (
                                                    <button 
                                                        onClick={() => handleApprove(payout._id)}
                                                        className="p-1.5 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200"
                                                        title="Approve"
                                                    >
                                                        <FaCheck className="text-sm" />
                                                    </button>
                                                )}
                                                {(payout.status === 'approved' || payout.status === 'pending') && (
                                                    <button 
                                                        onClick={() => handleProcess(payout._id)}
                                                        disabled={processingId === payout._id}
                                                        className="p-1.5 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 disabled:opacity-50"
                                                        title="Process"
                                                    >
                                                        {processingId === payout._id ? (
                                                            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-green-600"></div>
                                                        ) : (
                                                            <FaSync className="text-sm" />
                                                        )}
                                                    </button>
                                                )}
                                                {['pending', 'approved', 'on_hold'].includes(payout.status) && (
                                                    <button 
                                                        onClick={() => handleCancel(payout._id)}
                                                        className="p-1.5 bg-red-100 text-red-600 rounded-lg hover:bg-red-200"
                                                        title="Cancel"
                                                    >
                                                        <FaTimes className="text-sm" />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {pagination.pages > 1 && (
                        <div className="flex items-center justify-between mt-6">
                            <p className="text-sm text-gray-500">
                                Showing {((pagination.page - 1) * 20) + 1} to {Math.min(pagination.page * 20, pagination.total)} of {pagination.total}
                            </p>
                            <div className="flex items-center gap-2">
                                <button 
                                    disabled={pagination.page === 1}
                                    onClick={() => setPagination(p => ({ ...p, page: p.page - 1 }))}
                                    className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                                >
                                    Previous
                                </button>
                                <span className="px-4 py-2 bg-gray-100 rounded-lg text-sm font-medium">
                                    Page {pagination.page} of {pagination.pages}
                                </span>
                                <button 
                                    disabled={pagination.page === pagination.pages}
                                    onClick={() => setPagination(p => ({ ...p, page: p.page + 1 }))}
                                    className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    )}
                </>
            ) : (
                <div className="text-center py-12 bg-gray-50 rounded-xl">
                    <div className="text-5xl mb-4">💸</div>
                    <h3 className="text-xl font-semibold text-gray-700">No Payout Requests</h3>
                    <p className="text-gray-500 mt-2">There are no payout requests matching your filters</p>
                </div>
            )}
        </div>
    )
}

export default CommissionManagement
