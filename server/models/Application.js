const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
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
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
  },
}, { timestamps: true });

applicationSchema.index({ creator: 1, product: 1 }, { unique: true });

module.exports = mongoose.model('Application', applicationSchema);
