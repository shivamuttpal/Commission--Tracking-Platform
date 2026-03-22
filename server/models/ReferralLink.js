const mongoose = require('mongoose');

const referralLinkSchema = new mongoose.Schema({
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  code: {
    type: String,
    required: true,
    unique: true,
  },
}, { timestamps: true });

referralLinkSchema.index({ creator: 1, product: 1 }, { unique: true });

module.exports = mongoose.model('ReferralLink', referralLinkSchema);
