const express = require('express');
const crypto = require('crypto');
const ReferralLink = require('../models/ReferralLink');
const Application = require('../models/Application');
const Click = require('../models/Click');
const Conversion = require('../models/Conversion');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// @route   POST /api/referrals/generate — Creator generates link (only if approved)
router.post('/generate', protect, authorize('creator'), async (req, res) => {
  try {
    const { productId } = req.body;

    if (!productId) {
      return res.status(400).json({ success: false, message: 'Please provide productId' });
    }

    // Check approval
    const application = await Application.findOne({
      creator: req.user._id,
      product: productId,
      status: 'approved',
    });

    if (!application) {
      return res.status(403).json({ success: false, message: 'You must be approved for this product first' });
    }

    // Check if link already exists
    let referralLink = await ReferralLink.findOne({
      creator: req.user._id,
      product: productId,
    });

    if (referralLink) {
      return res.json({ success: true, referralLink, message: 'Link already exists' });
    }

    // Generate unique code
    const code = crypto.randomBytes(6).toString('hex');

    referralLink = await ReferralLink.create({
      creator: req.user._id,
      product: productId,
      code,
    });

    res.status(201).json({ success: true, referralLink });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/referrals — Creator's links with stats
router.get('/', protect, authorize('creator'), async (req, res) => {
  try {
    const referralLinks = await ReferralLink.find({ creator: req.user._id })
      .populate('product', 'name price commissionPercent');

    // Get stats for each link
    const linksWithStats = await Promise.all(
      referralLinks.map(async (link) => {
        const clicks = await Click.countDocuments({ referralLink: link._id });
        const conversions = await Conversion.countDocuments({ referralLink: link._id });
        const earnings = await Conversion.aggregate([
          { $match: { referralLink: link._id } },
          { $group: { _id: null, total: { $sum: '$commissionAmount' } } },
        ]);

        return {
          ...link.toObject(),
          clicks,
          conversions,
          earnings: earnings.length > 0 ? earnings[0].total : 0,
        };
      })
    );

    res.json({ success: true, referralLinks: linksWithStats });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
