const mongoose = require('mongoose');

const clickSchema = new mongoose.Schema({
  referralLink: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ReferralLink',
    required: true,
  },
  ipHash: {
    type: String,
    required: true,
  },
  clickedAt: {
    type: Date,
    default: Date.now,
  },
});

clickSchema.index({ referralLink: 1, ipHash: 1, clickedAt: 1 });

module.exports = mongoose.model('Click', clickSchema);
