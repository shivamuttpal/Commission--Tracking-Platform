const express = require('express');
const PayoutRequest = require('../models/PayoutRequest');
const Wallet = require('../models/Wallet');
const LedgerEntry = require('../models/LedgerEntry');
const User = require('../models/User');
const Product = require('../models/Product');
const Click = require('../models/Click');
const Conversion = require('../models/Conversion');
const Application = require('../models/Application');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/admin/payouts — All payout requests
router.get('/payouts', protect, authorize('admin'), async (req, res) => {
  try {
    const payouts = await PayoutRequest.find()
      .populate('creator', 'name email')
      .sort('-createdAt');

    res.json({ success: true, payouts });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   PUT /api/admin/payouts/:id — Approve / Reject / Mark as Paid
router.put('/payouts/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const { status, adminNote } = req.body;
    const validTransitions = {
      pending: ['approved', 'rejected'],
      approved: ['paid', 'rejected'],
    };

    const payout = await PayoutRequest.findById(req.params.id);
    if (!payout) {
      return res.status(404).json({ success: false, message: 'Payout not found' });
    }

    if (!validTransitions[payout.status] || !validTransitions[payout.status].includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot transition from '${payout.status}' to '${status}'`,
      });
    }

    const wallet = await Wallet.findOne({ creator: payout.creator });

    if (status === 'approved') {
      // Ledger entry for approval
      await LedgerEntry.create({
        creator: payout.creator,
        amount: payout.amount,
        type: 'payout_approved',
        status: 'approved',
        referenceId: payout._id,
        description: `Payout of ₹${payout.amount} approved by admin`,
      });
    } else if (status === 'paid') {
      // Move from pending to paid
      if (wallet) {
        wallet.pendingEarnings -= payout.amount;
        await wallet.save();
      }

      await LedgerEntry.create({
        creator: payout.creator,
        amount: payout.amount,
        type: 'payout_paid',
        status: 'paid',
        referenceId: payout._id,
        description: `Payout of ₹${payout.amount} marked as paid`,
      });

      payout.processedAt = new Date();
    } else if (status === 'rejected') {
      // Return money to available balance
      if (wallet) {
        wallet.availableBalance += payout.amount;
        wallet.pendingEarnings -= payout.amount;
        await wallet.save();
      }

      await LedgerEntry.create({
        creator: payout.creator,
        amount: payout.amount,
        type: 'payout_rejected',
        status: 'rejected',
        referenceId: payout._id,
        description: `Payout of ₹${payout.amount} rejected by admin`,
      });
    }

    payout.status = status;
    if (adminNote) payout.adminNote = adminNote;
    await payout.save();

    await payout.populate('creator', 'name email');

    res.json({ success: true, payout });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/admin/metrics — Platform-wide stats
router.get('/metrics', protect, authorize('admin'), async (req, res) => {
  try {
    const [
      totalBrands,
      totalCreators,
      totalProducts,
      totalClicks,
      totalConversions,
      totalCommissionPaid,
      pendingPayouts,
      totalPayoutsPaid,
      totalApplications,
      approvedApplications,
    ] = await Promise.all([
      User.countDocuments({ role: 'brand' }),
      User.countDocuments({ role: 'creator' }),
      Product.countDocuments({ isActive: true }),
      Click.countDocuments(),
      Conversion.countDocuments(),
      Conversion.aggregate([{ $group: { _id: null, total: { $sum: '$commissionAmount' } } }]),
      PayoutRequest.countDocuments({ status: 'pending' }),
      PayoutRequest.aggregate([
        { $match: { status: 'paid' } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
      Application.countDocuments(),
      Application.countDocuments({ status: 'approved' }),
    ]);

    res.json({
      success: true,
      metrics: {
        totalBrands,
        totalCreators,
        totalProducts,
        totalClicks,
        totalConversions,
        totalCommissionGenerated: totalCommissionPaid.length > 0 ? totalCommissionPaid[0].total : 0,
        pendingPayouts,
        totalPayoutsPaid: totalPayoutsPaid.length > 0 ? totalPayoutsPaid[0].total : 0,
        totalApplications,
        approvedApplications,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/admin/brands — All brands with stats
router.get('/brands', protect, authorize('admin'), async (req, res) => {
  try {
    const brands = await User.find({ role: 'brand' }).select('-password');
    const brandsWithStats = await Promise.all(
      brands.map(async (brand) => {
        const products = await Product.countDocuments({ brand: brand._id });
        return { ...brand.toObject(), productCount: products };
      })
    );
    res.json({ success: true, brands: brandsWithStats });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/admin/creators — All creators with stats
router.get('/creators', protect, authorize('admin'), async (req, res) => {
  try {
    const creators = await User.find({ role: 'creator' }).select('-password');
    const creatorsWithStats = await Promise.all(
      creators.map(async (creator) => {
        const wallet = await Wallet.findOne({ creator: creator._id });
        const conversions = await Conversion.countDocuments({ creator: creator._id });
        return {
          ...creator.toObject(),
          totalEarnings: wallet ? wallet.totalEarnings : 0,
          availableBalance: wallet ? wallet.availableBalance : 0,
          conversions,
        };
      })
    );
    res.json({ success: true, creators: creatorsWithStats });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/admin/analytics — Brand analytics for admin
router.get('/analytics', protect, authorize('admin'), async (req, res) => {
  try {
    const brandProducts = await Product.find().populate('brand', 'name email');
    const analytics = await Promise.all(
      brandProducts.map(async (product) => {
        const clicks = await Click.countDocuments({
          referralLink: { $in: await require('../models/ReferralLink').find({ product: product._id }).select('_id') },
        });
        const conversions = await Conversion.countDocuments({ product: product._id });
        const commissionData = await Conversion.aggregate([
          { $match: { product: product._id } },
          { $group: { _id: null, total: { $sum: '$commissionAmount' } } },
        ]);

        return {
          product: { id: product._id, name: product.name, price: product.price },
          brand: product.brand,
          clicks,
          conversions,
          totalCommission: commissionData.length > 0 ? commissionData[0].total : 0,
        };
      })
    );

    res.json({ success: true, analytics });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
