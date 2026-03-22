const express = require('express');
const Wallet = require('../models/Wallet');
const LedgerEntry = require('../models/LedgerEntry');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/wallet — Creator's wallet balance
router.get('/', protect, authorize('creator'), async (req, res) => {
  try {
    let wallet = await Wallet.findOne({ creator: req.user._id });
    if (!wallet) {
      wallet = await Wallet.create({ creator: req.user._id });
    }

    res.json({ success: true, wallet });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/wallet/transactions — Ledger entries for creator
router.get('/transactions', protect, authorize('creator'), async (req, res) => {
  try {
    const transactions = await LedgerEntry.find({ creator: req.user._id })
      .sort('-createdAt')
      .limit(100);

    res.json({ success: true, transactions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
