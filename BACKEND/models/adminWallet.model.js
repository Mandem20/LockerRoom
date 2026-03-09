const mongoose = require('mongoose');

const adminWalletSchema = new mongoose.Schema({
    platformRevenue: {
        totalCommission: {
            type: Number,
            default: 0
        },
        totalFees: {
            type: Number,
            default: 0
        },
        totalRevenue: {
            type: Number,
            default: 0
        },
        pendingPayouts: {
            type: Number,
            default: 0
        },
        completedPayouts: {
            type: Number,
            default: 0
        }
    },
    transactions: [{
        type: {
            type: String,
            enum: ['commission', 'fee', 'payout', 'refund', 'adjustment', 'withdrawal']
        },
        amount: Number,
        description: String,
        reference: String,
        createdAt: {
            type: Date,
            default: Date.now
        }
    }],
    settings: {
        minimumPlatformRevenue: {
            type: Number,
            default: 0
        },
        autoWithdrawalEnabled: {
            type: Boolean,
            default: false
        },
        withdrawalAccount: {
            bankName: String,
            accountName: String,
            accountNumber: String,
            routingNumber: String
        }
    }
}, {
    timestamps: true
});

adminWalletSchema.methods.recordTransaction = async function(type, amount, description, reference) {
    this.transactions.push({
        type,
        amount,
        description,
        reference
    });
    
    if (type === 'commission') {
        this.platformRevenue.totalCommission += amount;
    } else if (type === 'fee') {
        this.platformRevenue.totalFees += amount;
    } else if (type === 'payout') {
        this.platformRevenue.completedPayouts += amount;
    }
    
    this.platformRevenue.totalRevenue = 
        this.platformRevenue.totalCommission + 
        this.platformRevenue.totalFees - 
        this.platformRevenue.completedPayouts;
    
    return this.save();
};

const AdminWallet = mongoose.model('AdminWallet', adminWalletSchema);

AdminWallet.getOrCreate = async function() {
    let wallet = await this.findOne();
    if (!wallet) {
        wallet = await this.create({});
    }
    return wallet;
};

module.exports = AdminWallet;
