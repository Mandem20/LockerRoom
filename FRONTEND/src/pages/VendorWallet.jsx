import { useEffect, useState } from 'react'
import SummaryApi from '../common'
import displayCEDICurrency from '../helpers/displayCurrency'
import { useNavigate } from 'react-router-dom'

const VendorWallet = () => {
    const [wallet, setWallet] = useState(null)
    const [payouts, setPayouts] = useState([])
    const [transactions, setTransactions] = useState([])
    const [loading, setLoading] = useState(true)
    const [txLoading, setTxLoading] = useState(false)
    const [error, setError] = useState(null)
    const [showPayoutModal, setShowPayoutModal] = useState(false)
    const [activeTab, setActiveTab] = useState('wallet')
    const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 })
    const navigate = useNavigate()

    useEffect(() => {
        fetchWallet()
    }, [])

    useEffect(() => {
        if (activeTab === 'transactions') {
            fetchTransactions()
        }
    }, [activeTab])

    const fetchWallet = async () => {
        setLoading(true)
        try {
            const response = await fetch(SummaryApi.vendorWallet.url, {
                method: SummaryApi.vendorWallet.method,
                credentials: 'include'
            })
            const data = await response.json()
            
            if (data.success) {
                setWallet(data.data)
            } else if (data.message === 'Please login first') {
                navigate('/login')
            } else {
                setError(data.message)
            }
        } catch (error) {
            console.error('Error fetching wallet:', error)
            setError('Failed to load wallet')
        } finally {
            setLoading(false)
        }
    }

    const handlePayoutRequest = async (amount) => {
        try {
            const response = await fetch(SummaryApi.requestVendorPayout.url, {
                method: SummaryApi.requestVendorPayout.method,
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ amount })
            })
            const data = await response.json()
            
            if (data.success) {
                alert('Payout request submitted successfully!')
                setShowPayoutModal(false)
                fetchWallet()
            } else {
                alert(data.message)
            }
        } catch (error) {
            console.error('Error requesting payout:', error)
        }
    }

    const fetchTransactions = async (page = 1) => {
        setTxLoading(true)
        try {
            const response = await fetch(`${SummaryApi.vendorTransactions.url}?page=${page}&limit=20`, {
                method: SummaryApi.vendorTransactions.method,
                credentials: 'include'
            })
            const data = await response.json()
            
            if (data.success) {
                setTransactions(data.data.transactions)
                setPagination(data.data.pagination)
            }
        } catch (error) {
            console.error('Error fetching transactions:', error)
        } finally {
            setTxLoading(false)
        }
    }

    const getStatusColor = (status) => {
        const colors = {
            delivered: 'success',
            pending: 'warning',
            processing: 'info',
            shipped: 'info',
            cancelled: 'danger'
        }
        return colors[status] || 'default'
    }

    const getPaymentStatusColor = (status) => {
        return status === 'paid' ? 'success' : 'warning'
    }

    if (loading) {
        return (
            <div className="loading-container">
                <div className="spinner"></div>
            </div>
        )
    }

    return (
        <div className="vendor-wallet">
            {/* Balance Cards */}
            <div className="balance-cards">
                <div className="balance-card primary">
                    <div className="card-icon">💰</div>
                    <div className="card-content">
                        <span className="card-label">Available Balance</span>
                        <span className="card-value">{displayCEDICurrency(wallet?.availableBalance || 0)}</span>
                        <button 
                            className="btn-withdraw"
                            onClick={() => setShowPayoutModal(true)}
                            disabled={!(wallet?.availableBalance > 0)}
                        >
                            Request Withdrawal
                        </button>
                    </div>
                </div>

                <div className="balance-card">
                    <div className="card-icon">⏳</div>
                    <div className="card-content">
                        <span className="card-label">Pending Balance</span>
                        <span className="card-value">{displayCEDICurrency(wallet?.pendingBalance || 0)}</span>
                        <span className="card-subtext">Processing orders</span>
                    </div>
                </div>

                <div className="balance-card">
                    <div className="card-icon">📈</div>
                    <div className="card-content">
                        <span className="card-label">Total Earnings</span>
                        <span className="card-value">{displayCEDICurrency(wallet?.totalEarnings || 0)}</span>
                        <span className="card-subtext">All time</span>
                    </div>
                </div>

                <div className="balance-card">
                    <div className="card-icon">💳</div>
                    <div className="card-content">
                        <span className="card-label">Platform Fees</span>
                        <span className="card-value">{displayCEDICurrency(wallet?.platformFees || 0)}</span>
                        <span className="card-subtext">{wallet?.payoutSettings?.payoutSchedule || 'Weekly'}</span>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="wallet-tabs">
                <button 
                    className={activeTab === 'wallet' ? 'active' : ''}
                    onClick={() => setActiveTab('wallet')}
                >
                    💰 Wallet Overview
                </button>
                <button 
                    className={activeTab === 'commission' ? 'active' : ''}
                    onClick={() => setActiveTab('commission')}
                >
                    📊 Commission Breakdown
                </button>
                <button 
                    className={activeTab === 'bank' ? 'active' : ''}
                    onClick={() => setActiveTab('bank')}
                >
                    🏦 Bank Details
                </button>
                <button 
                    className={activeTab === 'transactions' ? 'active' : ''}
                    onClick={() => setActiveTab('transactions')}
                >
                    📋 Transactions
                </button>
            </div>

            {/* Tab Content */}
            <div className="wallet-content">
                {activeTab === 'wallet' && (
                    <div className="wallet-overview">
                        <div className="overview-grid">
                            <div className="overview-card">
                                <h3>Net Earnings</h3>
                                <span className="value">{displayCEDICurrency(wallet?.netEarnings || 0)}</span>
                                <p>After platform fees</p>
                            </div>
                            <div className="overview-card">
                                <h3>Pending Earnings</h3>
                                <span className="value">{displayCEDICurrency(wallet?.pendingEarnings || 0)}</span>
                                <p>From processing orders</p>
                            </div>
                            <div className="overview-card">
                                <h3>Refunded</h3>
                                <span className="value">{displayCEDICurrency(wallet?.refundedAmount || 0)}</span>
                                <p>Total refunds</p>
                            </div>
                            <div className="overview-card">
                                <h3>Payout Schedule</h3>
                                <span className="value capitalize">{wallet?.payoutSettings?.payoutSchedule || 'Weekly'}</span>
                                <p>Min: {displayCEDICurrency(wallet?.payoutSettings?.minimumPayout || 50)}</p>
                            </div>
                        </div>

                        <div className="earnings-chart">
                            <h3>How Earnings Work</h3>
                            <div className="flow-diagram">
                                <div className="flow-step">
                                    <span className="step-icon">🛒</span>
                                    <span className="step-label">Order Placed</span>
                                </div>
                                <span className="flow-arrow">→</span>
                                <div className="flow-step">
                                    <span className="step-icon">📦</span>
                                    <span className="step-label">Order Shipped</span>
                                </div>
                                <span className="flow-arrow">→</span>
                                <div className="flow-step">
                                    <span className="step-icon">✅</span>
                                    <span className="step-label">Delivered</span>
                                </div>
                                <span className="flow-arrow">→</span>
                                <div className="flow-step">
                                    <span className="step-icon">💰</span>
                                    <span className="step-label">Funds Released</span>
                                </div>
                            </div>
                            <p className="flow-note">
                                Funds become available after order is delivered and payment is confirmed
                            </p>
                        </div>
                    </div>
                )}

                {activeTab === 'commission' && (
                    <div className="commission-breakdown">
                        <div className="commission-header">
                            <h3>Commission & Fees Breakdown</h3>
                            <p>Detailed breakdown of platform fees deducted from your sales</p>
                        </div>

                        <div className="commission-summary">
                            <div className="summary-item">
                                <span className="summary-label">Total Sales Amount</span>
                                <span className="summary-value">{displayCEDICurrency(wallet?.commissionBreakdown?.totalSales || 0)}</span>
                            </div>
                            <div className="summary-item">
                                <span className="summary-label">Platform Commission ({wallet?.commissionBreakdown?.commissionRate || 10}%)</span>
                                <span className="summary-value negative">-{displayCEDICurrency(wallet?.commissionBreakdown?.platformCommission || 0)}</span>
                            </div>
                            <div className="summary-item">
                                <span className="summary-label">Payment Processing Fee ({wallet?.commissionBreakdown?.paymentFeeRate || 2.5}%)</span>
                                <span className="summary-value negative">-{displayCEDICurrency(wallet?.commissionBreakdown?.paymentProcessingFee || 0)}</span>
                            </div>
                            <div className="summary-item">
                                <span className="summary-label">Service Fee</span>
                                <span className="summary-value negative">-{displayCEDICurrency(wallet?.commissionBreakdown?.serviceFee || 0)}</span>
                            </div>
                            <div className="summary-item total">
                                <span className="summary-label">Total Fees Deducted</span>
                                <span className="summary-value negative">{displayCEDICurrency(wallet?.commissionBreakdown?.totalFees || 0)}</span>
                            </div>
                            <div className="summary-item net">
                                <span className="summary-label">Net Earnings (Your Share)</span>
                                <span className="summary-value positive">{displayCEDICurrency(wallet?.commissionBreakdown?.netEarnings || 0)}</span>
                            </div>
                        </div>

                        <div className="commission-chart">
                            <h4>Fee Distribution</h4>
                            <div className="chart-bar">
                                <div 
                                    className="bar-segment platform" 
                                    style={{ width: `${((wallet?.commissionBreakdown?.platformCommission || 0) / (wallet?.commissionBreakdown?.totalSales || 1)) * 100}%` }}
                                >
                                    <span>Platform {((wallet?.commissionBreakdown?.platformCommission || 0) / (wallet?.commissionBreakdown?.totalSales || 1) * 100).toFixed(1)}%</span>
                                </div>
                                <div 
                                    className="bar-segment payment" 
                                    style={{ width: `${((wallet?.commissionBreakdown?.paymentProcessingFee || 0) / (wallet?.commissionBreakdown?.totalSales || 1)) * 100}%` }}
                                >
                                    <span>Payment {((wallet?.commissionBreakdown?.paymentProcessingFee || 0) / (wallet?.commissionBreakdown?.totalSales || 1) * 100).toFixed(1)}%</span>
                                </div>
                                <div 
                                    className="bar-segment net" 
                                    style={{ width: `${((wallet?.commissionBreakdown?.netEarnings || 0) / (wallet?.commissionBreakdown?.totalSales || 1)) * 100}%` }}
                                >
                                    <span>Your Share {((wallet?.commissionBreakdown?.netEarnings || 0) / (wallet?.commissionBreakdown?.totalSales || 1) * 100).toFixed(1)}%</span>
                                </div>
                            </div>
                        </div>

                        <div className="commission-note">
                            <h4>💡 How it's calculated</h4>
                            <ul>
                                <li><strong>Platform Commission:</strong> {wallet?.commissionBreakdown?.commissionRate || 10}% of sale price - covers platform services</li>
                                <li><strong>Payment Processing:</strong> {wallet?.commissionBreakdown?.paymentFeeRate || 2.5}% - covers payment gateway fees</li>
                                <li><strong>Service Fee:</strong> Fixed fee per transaction for order management</li>
                            </ul>
                        </div>
                    </div>
                )}

                {activeTab === 'bank' && (
                    <div className="bank-details">
                        {wallet?.bankDetails ? (
                            <div className="bank-card">
                                <div className="bank-header">
                                    <span className="bank-icon">🏦</span>
                                    <h3>{wallet.bankDetails.bankName}</h3>
                                </div>
                                <div className="bank-info">
                                    <div className="info-row">
                                        <span className="label">Account Name</span>
                                        <span className="value">{wallet.bankDetails.accountName}</span>
                                    </div>
                                    <div className="info-row">
                                        <span className="label">Account Number</span>
                                        <span className="value">{wallet.bankDetails.accountNumber}</span>
                                    </div>
                                    <div className="info-row">
                                        <span className="label">Country</span>
                                        <span className="value">{wallet.bankDetails.bankCountry}</span>
                                    </div>
                                    {wallet.bankDetails.swiftCode && (
                                        <div className="info-row">
                                            <span className="label">SWIFT Code</span>
                                            <span className="value">{wallet.bankDetails.swiftCode}</span>
                                        </div>
                                    )}
                                </div>
                                <p className="security-note">
                                    🔒 Your bank details are encrypted and securely stored
                                </p>
                            </div>
                        ) : (
                            <div className="no-bank">
                                <span>🏦</span>
                                <h3>No Bank Details</h3>
                                <p>Add your bank details to receive payouts</p>
                                <button className="btn-primary">
                                    Add Bank Details
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'transactions' && (
                    <div className="transactions-list">
                        <h3>Payment History</h3>
                        {txLoading ? (
                            <div className="loading-small">
                                <div className="spinner-small"></div>
                            </div>
                        ) : transactions.length > 0 ? (
                            <>
                                <div className="transactions-table">
                                    <div className="table-header">
                                        <span>Date</span>
                                        <span>Order ID</span>
                                        <span>Product</span>
                                        <span>Amount</span>
                                        <span>Status</span>
                                        <span>Payment</span>
                                    </div>
                                    {transactions.map((tx, index) => (
                                        <div key={index} className="table-row">
                                            <span className="date">
                                                {new Date(tx.date).toLocaleDateString('en-US', {
                                                    year: 'numeric',
                                                    month: 'short',
                                                    day: 'numeric'
                                                })}
                                            </span>
                                            <span className="order-id">{tx.orderId}</span>
                                            <span className="product-name">{tx.productName}</span>
                                            <span className="amount">{displayCEDICurrency(tx.amount)}</span>
                                            <span className={`status-badge ${getStatusColor(tx.status)}`}>
                                                {tx.status}
                                            </span>
                                            <span className={`status-badge ${getPaymentStatusColor(tx.paymentStatus)}`}>
                                                {tx.paymentStatus}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                                {pagination.pages > 1 && (
                                    <div className="pagination">
                                        <button 
                                            disabled={pagination.page === 1}
                                            onClick={() => fetchTransactions(pagination.page - 1)}
                                        >
                                            Previous
                                        </button>
                                        <span>Page {pagination.page} of {pagination.pages}</span>
                                        <button 
                                            disabled={pagination.page === pagination.pages}
                                            onClick={() => fetchTransactions(pagination.page + 1)}
                                        >
                                            Next
                                        </button>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="transaction-placeholder">
                                <span>📋</span>
                                <p>No transactions found</p>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Payout Modal */}
            {showPayoutModal && (
                <PayoutModal 
                    availableBalance={wallet?.availableBalance || 0}
                    minimumPayout={wallet?.payoutSettings?.minimumPayout || 50}
                    onClose={() => setShowPayoutModal(false)}
                    onSubmit={handlePayoutRequest}
                />
            )}
        </div>
    )
}

const PayoutModal = ({ availableBalance, minimumPayout, onClose, onSubmit }) => {
    const [amount, setAmount] = useState(availableBalance)
    const [loading, setLoading] = useState(false)

    const handleSubmit = (e) => {
        e.preventDefault()
        if (amount < minimumPayout) {
            alert(`Minimum payout is ${minimumPayout}`)
            return
        }
        if (amount > availableBalance) {
            alert('Insufficient balance')
            return
        }
        setLoading(true)
        onSubmit(amount)
    }

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Request Withdrawal</h2>
                    <button className="close-btn" onClick={onClose}>×</button>
                </div>
                <form onSubmit={handleSubmit} className="payout-form">
                    <div className="form-group">
                        <label>Available Balance</label>
                        <span className="balance-display">{displayCEDICurrency(availableBalance)}</span>
                    </div>
                    <div className="form-group">
                        <label>Minimum Payout</label>
                        <span className="min-display">{displayCEDICurrency(minimumPayout)}</span>
                    </div>
                    <div className="form-group">
                        <label>Withdrawal Amount</label>
                        <input 
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(Number(e.target.value))}
                            min={minimumPayout}
                            max={availableBalance}
                            required
                        />
                    </div>
                    <div className="quick-amounts">
                        <button type="button" onClick={() => setAmount(availableBalance * 0.25)}>
                            25%
                        </button>
                        <button type="button" onClick={() => setAmount(availableBalance * 0.5)}>
                            50%
                        </button>
                        <button type="button" onClick={() => setAmount(availableBalance * 0.75)}>
                            75%
                        </button>
                        <button type="button" onClick={() => setAmount(availableBalance)}>
                            100%
                        </button>
                    </div>
                    <div className="form-actions">
                        <button type="button" className="btn-secondary" onClick={onClose}>
                            Cancel
                        </button>
                        <button type="submit" className="btn-primary" disabled={loading}>
                            {loading ? 'Processing...' : 'Request Withdrawal'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default VendorWallet
