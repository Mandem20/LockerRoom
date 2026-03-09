import React, { useEffect, useState } from 'react'
import SummaryApi from '../common'
import { toast } from 'react-toastify'
import moment from 'moment'
import { FaCheck, FaTimes, FaEye, FaStore, FaSearch, FaFilter } from 'react-icons/fa'
import './VendorPages.css'

const VendorApplications = () => {
    const [applications, setApplications] = useState([])
    const [loading, setLoading] = useState(true)
    const [selectedApplication, setSelectedApplication] = useState(null)
    const [showModal, setShowModal] = useState(false)
    const [filterStatus, setFilterStatus] = useState('')
    const [searchTerm, setSearchTerm] = useState('')
    const [actionLoading, setActionLoading] = useState(false)

    const fetchApplications = async () => {
        setLoading(true)
        try {
            const url = filterStatus 
                ? `${SummaryApi.getAllVendorApplications.url}?status=${filterStatus}`
                : SummaryApi.getAllVendorApplications.url
            
            const fetchData = await fetch(url, {
                method: SummaryApi.getAllVendorApplications.method,
                credentials: 'include'
            })

            const dataResponse = await fetchData.json()

            if (dataResponse.success) {
                setApplications(dataResponse.data?.applications || [])
            } else {
                toast.error(dataResponse.message || 'Failed to fetch applications')
            }
        } catch (error) {
            toast.error('Failed to fetch applications')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchApplications()
    }, [filterStatus])

    const handleApprove = async (vendorId) => {
        setActionLoading(true)
        try {
            const response = await fetch(SummaryApi.approveVendor.url, {
                method: SummaryApi.approveVendor.method,
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ vendorId })
            })

            const dataResponse = await response.json()

            if (dataResponse.success) {
                toast.success('Vendor approved successfully')
                fetchApplications()
            } else {
                toast.error(dataResponse.message || 'Failed to approve vendor')
            }
        } catch (error) {
            toast.error('Failed to approve vendor')
        } finally {
            setActionLoading(false)
        }
    }

    const handleReject = async (vendorId) => {
        const reason = prompt('Enter rejection reason (optional):')
        setActionLoading(true)
        try {
            const response = await fetch(SummaryApi.rejectVendor.url, {
                method: SummaryApi.rejectVendor.method,
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ vendorId, reason })
            })

            const dataResponse = await response.json()

            if (dataResponse.success) {
                toast.success('Vendor rejected')
                fetchApplications()
            } else {
                toast.error(dataResponse.message || 'Failed to reject vendor')
            }
        } catch (error) {
            toast.error('Failed to reject vendor')
        } finally {
            setActionLoading(false)
        }
    }

    const viewApplication = (application) => {
        setSelectedApplication(application)
        setShowModal(true)
    }

    const filteredApplications = applications.filter(app => {
        if (!searchTerm) return true
        const search = searchTerm.toLowerCase()
        return (
            app.businessName?.toLowerCase().includes(search) ||
            app.storeName?.toLowerCase().includes(search) ||
            app.businessEmail?.toLowerCase().includes(search) ||
            app.userId?.name?.toLowerCase().includes(search) ||
            app.userId?.email?.toLowerCase().includes(search)
        )
    })

    const getStatusBadge = (status) => {
        const statusClasses = {
            pending: 'bg-yellow-100 text-yellow-800',
            under_review: 'bg-blue-100 text-blue-800',
            verified: 'bg-green-100 text-green-800',
            rejected: 'bg-red-100 text-red-800',
            suspended: 'bg-gray-100 text-gray-800'
        }
        return (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusClasses[status] || 'bg-gray-100 text-gray-800'}`}>
                {status?.replace('_', ' ').toUpperCase()}
            </span>
        )
    }

    return (
        <div className="bg-white rounded-lg shadow p-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <div>
                    <h2 className="text-2xl font-semibold text-gray-800">Vendor Applications</h2>
                    <p className="text-sm text-gray-500 mt-1">Review and manage vendor applications</p>
                </div>
                <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
                    <div className="relative">
                        <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search applications..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 pr-4 py-2 border rounded-lg w-full md:w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div className="relative">
                        <FaFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">All Status</option>
                            <option value="pending">Pending</option>
                            <option value="under_review">Under Review</option>
                            <option value="verified">Verified</option>
                            <option value="rejected">Rejected</option>
                            <option value="suspended">Suspended</option>
                        </select>
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
            ) : filteredApplications.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                    <FaStore className="text-4xl mb-3" />
                    <p className="text-lg">No vendor applications found</p>
                    <p className="text-sm">Applications will appear here when users submit them</p>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Business</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Store</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Submitted</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {filteredApplications.map((app) => (
                                <tr key={app._id} className="hover:bg-gray-50">
                                    <td className="px-4 py-4">
                                        <div className="font-medium text-gray-900">{app.businessName}</div>
                                        <div className="text-sm text-gray-500">{app.businessEmail}</div>
                                        <div className="text-sm text-gray-500">{app.businessPhone}</div>
                                    </td>
                                    <td className="px-4 py-4">
                                        <div className="text-gray-900">{app.storeName}</div>
                                        <div className="text-sm text-gray-500">/{app.storeSlug}</div>
                                    </td>
                                    <td className="px-4 py-4">
                                        <div className="text-gray-900">{app.userId?.name || 'N/A'}</div>
                                        <div className="text-sm text-gray-500">{app.userId?.email || 'N/A'}</div>
                                    </td>
                                    <td className="px-4 py-4">
                                        {getStatusBadge(app.verificationStatus)}
                                    </td>
                                    <td className="px-4 py-4 text-sm text-gray-500">
                                        {moment(app.createdAt).format('MMM DD, YYYY')}
                                    </td>
                                    <td className="px-4 py-4">
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => viewApplication(app)}
                                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                                                title="View Details"
                                            >
                                                <FaEye />
                                            </button>
                                            {app.verificationStatus === 'pending' || app.verificationStatus === 'under_review' ? (
                                                <>
                                                    <button
                                                        onClick={() => handleApprove(app._id)}
                                                        disabled={actionLoading}
                                                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg disabled:opacity-50"
                                                        title="Approve"
                                                    >
                                                        <FaCheck />
                                                    </button>
                                                    <button
                                                        onClick={() => handleReject(app._id)}
                                                        disabled={actionLoading}
                                                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg disabled:opacity-50"
                                                        title="Reject"
                                                    >
                                                        <FaTimes />
                                                    </button>
                                                </>
                                            ) : null}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Application Details Modal */}
            {showModal && selectedApplication && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <div className="flex justify-between items-start mb-6">
                                <h3 className="text-xl font-semibold">Vendor Application Details</h3>
                                <button
                                    onClick={() => setShowModal(false)}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <FaTimes />
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">Business Name</label>
                                        <p className="text-gray-900">{selectedApplication.businessName}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">Store Name</label>
                                        <p className="text-gray-900">{selectedApplication.storeName}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">Business Email</label>
                                        <p className="text-gray-900">{selectedApplication.businessEmail}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">Business Phone</label>
                                        <p className="text-gray-900">{selectedApplication.businessPhone}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">Tax ID</label>
                                        <p className="text-gray-900">{selectedApplication.taxId || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">Status</label>
                                        <div className="mt-1">{getStatusBadge(selectedApplication.verificationStatus)}</div>
                                    </div>
                                </div>

                                {selectedApplication.businessAddress && (
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">Business Address</label>
                                        <p className="text-gray-900">
                                            {selectedApplication.businessAddress.street}, {selectedApplication.businessAddress.city}, {selectedApplication.businessAddress.state}, {selectedApplication.businessAddress.country} {selectedApplication.businessAddress.postalCode}
                                        </p>
                                    </div>
                                )}

                                {selectedApplication.businessDescription && (
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">Business Description</label>
                                        <p className="text-gray-900">{selectedApplication.businessDescription}</p>
                                    </div>
                                )}

                                <div className="border-t pt-4">
                                    <h4 className="font-medium mb-2">User Information</h4>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-sm font-medium text-gray-500">Name</label>
                                            <p className="text-gray-900">{selectedApplication.userId?.name || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-gray-500">Email</label>
                                            <p className="text-gray-900">{selectedApplication.userId?.email || 'N/A'}</p>
                                        </div>
                                        {selectedApplication.userId?.mobile && (
                                            <div>
                                                <label className="text-sm font-medium text-gray-500">Phone</label>
                                                <p className="text-gray-900">{selectedApplication.userId.mobile}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <label className="text-sm font-medium text-gray-500">Submitted</label>
                                    <p className="text-gray-900">{moment(selectedApplication.createdAt).format('MMMM DD, YYYY [at] h:mm A')}</p>
                                </div>

                                {selectedApplication.rejectionReason && (
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">Rejection Reason</label>
                                        <p className="text-red-600">{selectedApplication.rejectionReason}</p>
                                    </div>
                                )}
                            </div>

                            <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
                                <button
                                    onClick={() => setShowModal(false)}
                                    className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                                >
                                    Close
                                </button>
                                {(selectedApplication.verificationStatus === 'pending' || selectedApplication.verificationStatus === 'under_review') && (
                                    <>
                                        <button
                                            onClick={() => {
                                                handleApprove(selectedApplication._id)
                                                setShowModal(false)
                                            }}
                                            disabled={actionLoading}
                                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                                        >
                                            Approve
                                        </button>
                                        <button
                                            onClick={() => {
                                                handleReject(selectedApplication._id)
                                                setShowModal(false)
                                            }}
                                            disabled={actionLoading}
                                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                                        >
                                            Reject
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default VendorApplications
