const mongoose = require('mongoose');

const payoutRequestSchema = new mongoose.Schema({
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  amount: {
    type: Number,
    required: true,
    min: [500, 'Minimum payout is ₹500'],
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'paid', 'rejected'],
    default: 'pending',
  },
  idempotencyKey: {
    type: String,
    required: true,
    unique: true,
  },
  adminNote: {
    type: String,
    default: '',
  },
  processedAt: {
    type: Date,
  },
}, { timestamps: true });

payoutRequestSchema.index({ creator: 1, status: 1 });

module.exports = mongoose.model('PayoutRequest', payoutRequestSchema);
