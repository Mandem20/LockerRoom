import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Breadcrumb from '../components/Breadcrumb'
import SummaryApi from '../common'
import { toast } from 'react-toastify'
import { FaExclamationTriangle, FaBox, FaFlag } from 'react-icons/fa'

const ReportProduct = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    productId: '',
    productName: '',
    issueType: '',
    description: '',
    email: '',
    orderId: ''
  })

  const issueTypes = [
    { value: 'damaged', label: 'Product Damaged' },
    { value: 'defective', label: 'Defective Product' },
    { value: 'wrong_item', label: 'Wrong Item Received' },
    { value: 'counterfeit', label: 'Counterfeit/Suspected Fake' },
    { value: 'misleading', label: 'Misleading Product Description' },
    { value: 'safety', label: 'Safety Concern' },
    { value: 'illegal', label: 'Illegal Product' },
    { value: 'other', label: 'Other Issue' }
  ]

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.productId && !formData.productName) {
      toast.error('Please provide product ID or name')
      return
    }
    
    if (!formData.issueType) {
      toast.error('Please select an issue type')
      return
    }
    
    if (!formData.description) {
      toast.error('Please describe the issue')
      return
    }
    
    if (!formData.email) {
      toast.error('Please provide your email address')
      return
    }

    setLoading(true)
    try {
      const response = await fetch(SummaryApi.reportProduct?.url || '/api/report-product', {
        method: 'POST',
        headers: {
          'content-type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (data.success) {
        toast.success('Report submitted successfully. We will review and take action within 48 hours.')
        setFormData({
          productId: '',
          productName: '',
          issueType: '',
          description: '',
          email: '',
          orderId: ''
        })
      } else {
        toast.error(data.message || 'Failed to submit report')
      }
    } catch (error) {
      console.error('Report error:', error)
      toast.error('Failed to submit report. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Breadcrumb items={[{ label: 'Report a Product' }]} />
      
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6 md:p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
              <FaFlag className="text-2xl text-red-600" />
            </div>
            <h1 className="text-3xl font-bold mb-2">Report a Product</h1>
            <p className="text-gray-600">
              Help us maintain quality and safety by reporting suspicious or problematic products.
            </p>
          </div>

          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
            <div className="flex items-start">
              <FaExclamationTriangle className="text-yellow-500 mt-1 mr-3 flex-shrink-0" />
              <div>
                <p className="font-medium text-yellow-800">Your Report Matters</p>
                <p className="text-sm text-yellow-700 mt-1">
                  All reports are reviewed by our compliance team. We take action on every report within 48 hours.
                  Your information is kept confidential.
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Product ID (optional)
                </label>
                <div className="relative">
                  <FaBox className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    name="productId"
                    value={formData.productId}
                    onChange={handleChange}
                    placeholder="e.g., PRD123456"
                    className="w-full pl-10 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">Found on the product page URL</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Product Name *
                </label>
                <input
                  type="text"
                  name="productName"
                  value={formData.productName}
                  onChange={handleChange}
                  placeholder="Enter product name"
                  required
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Order ID (if applicable)
                </label>
                <input
                  type="text"
                  name="orderId"
                  value={formData.orderId}
                  onChange={handleChange}
                  placeholder="e.g., ORD123456"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Email *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="your@email.com"
                  required
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Issue Type *
              </label>
              <select
                name="issueType"
                value={formData.issueType}
                onChange={handleChange}
                required
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              >
                <option value="">Select an issue type</option>
                {issueTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Detailed Description *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Please describe the issue in detail. Include any relevant information such as:
- What you expected vs. what you received
- Any safety concerns
- Dates of purchase or discovery"
                required
                rows={6}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-3 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Submitting Report...' : 'Submit Report'}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t">
            <p className="text-sm text-gray-600 text-center">
              For urgent safety concerns, please contact us immediately at{' '}
              <span className="text-red-600">+233 123 456 789</span>
            </p>
          </div>

          <div className="mt-4 flex justify-center">
            <Link to="/" className="text-red-600 hover:underline text-sm">
              &larr; Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ReportProduct
