const mongoose = require('mongoose');

const walletSchema = new mongoose.Schema({
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  totalEarnings: {
    type: Number,
    default: 0,
  },
  pendingEarnings: {
    type: Number,
    default: 0,
  },
  availableBalance: {
    type: Number,
    default: 0,
  },
}, { timestamps: true });

module.exports = mongoose.model('Wallet', walletSchema);
