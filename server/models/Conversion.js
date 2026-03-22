const mongoose = require('mongoose');

const conversionSchema = new mongoose.Schema({
  referralLink: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ReferralLink',
    required: true,
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  commissionAmount: {
    type: Number,
    required: true,
  },
  productPrice: {
    type: Number,
    required: true,
  },
  convertedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Conversion', conversionSchema);
