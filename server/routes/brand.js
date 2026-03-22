const express = require('express');
const Click = require('../models/Click');
const Conversion = require('../models/Conversion');
const ReferralLink = require('../models/ReferralLink');
const Product = require('../models/Product');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/brand/analytics — Brand analytics
router.get('/analytics', protect, authorize('brand'), async (req, res) => {
  try {
    // Get all products for this brand
    const products = await Product.find({ brand: req.user._id });
    const productIds = products.map((p) => p._id);

    // Get referral links for brand's products
    const referralLinks = await ReferralLink.find({ product: { $in: productIds } });
    const linkIds = referralLinks.map((l) => l._id);

    // Aggregate stats
    const totalClicks = await Click.countDocuments({ referralLink: { $in: linkIds } });
    const totalConversions = await Conversion.countDocuments({ product: { $in: productIds } });
    const commissionData = await Conversion.aggregate([
      { $match: { product: { $in: productIds } } },
      { $group: { _id: null, total: { $sum: '$commissionAmount' } } },
    ]);

    // Per-product breakdown
    const productStats = await Promise.all(
      products.map(async (product) => {
        const pLinks = await ReferralLink.find({ product: product._id });
        const pLinkIds = pLinks.map((l) => l._id);
        const clicks = await Click.countDocuments({ referralLink: { $in: pLinkIds } });
        const conversions = await Conversion.countDocuments({ product: product._id });
        const commission = await Conversion.aggregate([
          { $match: { product: product._id } },
          { $group: { _id: null, total: { $sum: '$commissionAmount' } } },
        ]);

        return {
          product: { id: product._id, name: product.name, price: product.price, commissionPercent: product.commissionPercent },
          clicks,
          conversions,
          totalCommission: commission.length > 0 ? commission[0].total : 0,
        };
      })
    );

    res.json({
      success: true,
      analytics: {
        totalClicks,
        totalConversions,
        totalCommissionPaid: commissionData.length > 0 ? commissionData[0].total : 0,
        productStats,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
