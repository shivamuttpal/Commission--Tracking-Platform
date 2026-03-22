const mongoose = require('mongoose');

const ledgerEntrySchema = new mongoose.Schema({
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  type: {
    type: String,
    enum: ['commission', 'payout_request', 'payout_approved', 'payout_paid', 'payout_rejected'],
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'paid', 'rejected'],
    required: true,
  },
  referenceId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  description: {
    type: String,
    default: '',
  },
}, { timestamps: true });

ledgerEntrySchema.index({ creator: 1, createdAt: -1 });

module.exports = mongoose.model('LedgerEntry', ledgerEntrySchema);
