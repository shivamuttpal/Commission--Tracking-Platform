const express = require('express');
const Application = require('../models/Application');
const Product = require('../models/Product');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// @route   POST /api/applications — Creator applies to product
router.post('/', protect, authorize('creator'), async (req, res) => {
  try {
    const { productId } = req.body;

    if (!productId) {
      return res.status(400).json({ success: false, message: 'Please provide productId' });
    }

    const product = await Product.findById(productId);
    if (!product || !product.isActive) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    // Check if already applied
    const existing = await Application.findOne({
      creator: req.user._id,
      product: productId,
    });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Already applied to this product' });
    }

    const application = await Application.create({
      creator: req.user._id,
      product: productId,
    });

    await application.populate([
      { path: 'product', select: 'name price commissionPercent' },
      { path: 'creator', select: 'name email' },
    ]);

    res.status(201).json({ success: true, application });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/applications — List applications
router.get('/', protect, async (req, res) => {
  try {
    let query = {};

    if (req.user.role === 'creator') {
      query = { creator: req.user._id };
    } else if (req.user.role === 'brand') {
      // Get all products owned by the brand
      const brandProducts = await Product.find({ brand: req.user._id }).select('_id');
      const productIds = brandProducts.map((p) => p._id);
      query = { product: { $in: productIds } };
    }

    const applications = await Application.find(query)
      .populate('product', 'name price commissionPercent')
      .populate('creator', 'name email')
      .sort('-createdAt');

    res.json({ success: true, applications });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   PUT /api/applications/:id — Brand approves/rejects
router.put('/:id', protect, authorize('brand'), async (req, res) => {
  try {
    const { status } = req.body;

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Status must be approved or rejected' });
    }

    const application = await Application.findById(req.params.id).populate('product');
    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    // Ensure the brand owns the product
    if (application.product.brand.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    application.status = status;
    await application.save();

    await application.populate('creator', 'name email');

    res.json({ success: true, application });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
