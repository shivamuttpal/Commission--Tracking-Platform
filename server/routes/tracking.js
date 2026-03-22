const express = require('express');
const crypto = require('crypto');
const ReferralLink = require('../models/ReferralLink');
const Click = require('../models/Click');
const Conversion = require('../models/Conversion');
const Product = require('../models/Product');
const Wallet = require('../models/Wallet');
const LedgerEntry = require('../models/LedgerEntry');
const Application = require('../models/Application');

const router = express.Router();

// In-memory click dedup (24h window) — in production use Redis
const clickDedup = new Map();

// Clean up expired keys every hour
setInterval(() => {
  const now = Date.now();
  for (const [key, timestamp] of clickDedup.entries()) {
    if (now - timestamp > 24 * 60 * 60 * 1000) {
      clickDedup.delete(key);
    }
  }
}, 60 * 60 * 1000);

// @route   GET /api/track/click/:productId?ref=creatorId — Record click
router.get('/click/:productId', async (req, res) => {
  try {
    const { productId } = req.params;
    const { ref: creatorId } = req.query;

    if (!creatorId) {
      return res.json({ success: true, tracked: false, message: 'No referral' });
    }

    // Verify creator is approved for this product
    const application = await Application.findOne({
      creator: creatorId,
      product: productId,
      status: 'approved',
    });

    if (!application) {
      return res.json({ success: true, tracked: false, message: 'Creator not approved' });
    }

    // Find the referral link
    const referralLink = await ReferralLink.findOne({
      creator: creatorId,
      product: productId,
    });

    if (!referralLink) {
      return res.json({ success: true, tracked: false, message: 'No referral link' });
    }

    // Dedup by IP hash
    const ip = req.headers['x-forwarded-for'] || req.ip || '127.0.0.1';
    const ipHash = crypto.createHash('sha256').update(ip).digest('hex');
    const dedupKey = `${creatorId}:${productId}:${ipHash}`;

    const lastClick = clickDedup.get(dedupKey);
    if (lastClick && Date.now() - lastClick < 24 * 60 * 60 * 1000) {
      return res.json({ success: true, tracked: false, message: 'Already counted in this window' });
    }

    // Record click
    await Click.create({
      referralLink: referralLink._id,
      ipHash,
    });

    clickDedup.set(dedupKey, Date.now());

    res.json({ success: true, tracked: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/track/purchase — Simulate purchase
router.post('/purchase', async (req, res) => {
  try {
    const { productId, creatorId } = req.body;

    if (!productId) {
      return res.status(400).json({ success: false, message: 'Product ID required' });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    // If no creator ref, it's a direct purchase — no commission
    if (!creatorId) {
      return res.json({
        success: true,
        message: 'Direct purchase — no commission',
        commission: 0,
      });
    }

    // Verify creator is approved
    const application = await Application.findOne({
      creator: creatorId,
      product: productId,
      status: 'approved',
    });

    if (!application) {
      return res.json({
        success: true,
        message: 'Creator not approved — no commission',
        commission: 0,
      });
    }

    const referralLink = await ReferralLink.findOne({
      creator: creatorId,
      product: productId,
    });

    if (!referralLink) {
      return res.json({
        success: true,
        message: 'No referral link found — no commission',
        commission: 0,
      });
    }

    // Calculate commission
    const commission = (product.price * product.commissionPercent) / 100;

    // Create conversion
    const conversion = await Conversion.create({
      referralLink: referralLink._id,
      product: product._id,
      creator: creatorId,
      commissionAmount: commission,
      productPrice: product.price,
    });

    // Update wallet
    await Wallet.findOneAndUpdate(
      { creator: creatorId },
      {
        $inc: {
          totalEarnings: commission,
          availableBalance: commission,
        },
      },
      { upsert: true }
    );

    // Write ledger entry
    await LedgerEntry.create({
      creator: creatorId,
      amount: commission,
      type: 'commission',
      status: 'approved',
      referenceId: conversion._id,
      description: `Commission for ${product.name} — ₹${product.price} × ${product.commissionPercent}%`,
    });

    res.json({
      success: true,
      message: 'Purchase successful',
      commission,
      product: {
        name: product.name,
        price: product.price,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
