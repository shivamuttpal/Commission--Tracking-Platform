const express = require('express');
const crypto = require('crypto');
const PayoutRequest = require('../models/PayoutRequest');
const Wallet = require('../models/Wallet');
const LedgerEntry = require('../models/LedgerEntry');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// @route   POST /api/payouts/request — Creator requests payout
router.post('/request', protect, authorize('creator'), async (req, res) => {
  try {
    const { amount } = req.body;

    if (!amount || amount < 500) {
      return res.status(400).json({ success: false, message: 'Minimum payout amount is ₹500' });
    }

    // Check for existing pending payout
    const pendingPayout = await PayoutRequest.findOne({
      creator: req.user._id,
      status: 'pending',
    });

    if (pendingPayout) {
      return res.status(400).json({
        success: false,
        message: 'You already have a pending payout request. Please wait for it to be processed.',
      });
    }

    // Check available balance
    const wallet = await Wallet.findOne({ creator: req.user._id });
    if (!wallet || wallet.availableBalance < amount) {
      return res.status(400).json({
        success: false,
        message: `Insufficient balance. Available: ₹${wallet ? wallet.availableBalance : 0}`,
      });
    }

    // Generate idempotency key
    const idempotencyKey = `${req.user._id}-${crypto.randomUUID()}`;

    // Create payout request
    const payout = await PayoutRequest.create({
      creator: req.user._id,
      amount,
      idempotencyKey,
    });

    // Update wallet: move from available to pending
    wallet.availableBalance -= amount;
    wallet.pendingEarnings += amount;
    await wallet.save();

    // Write ledger entry
    await LedgerEntry.create({
      creator: req.user._id,
      amount,
      type: 'payout_request',
      status: 'pending',
      referenceId: payout._id,
      description: `Payout request of ₹${amount}`,
    });

    res.status(201).json({ success: true, payout });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/payouts — Creator's payout history
router.get('/', protect, authorize('creator'), async (req, res) => {
  try {
    const payouts = await PayoutRequest.find({ creator: req.user._id }).sort('-createdAt');
    res.json({ success: true, payouts });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
