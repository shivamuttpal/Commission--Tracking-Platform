const express = require('express');
const Product = require('../models/Product');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// @route   POST /api/products — Brand creates product
router.post('/', protect, authorize('brand'), async (req, res) => {
  try {
    const { name, price, commissionPercent, description } = req.body;

    if (!name || price == null || commissionPercent == null) {
      return res.status(400).json({ success: false, message: 'Please provide name, price, and commission percent' });
    }

    const product = await Product.create({
      name,
      price,
      commissionPercent,
      description: description || '',
      brand: req.user._id,
    });

    res.status(201).json({ success: true, product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/products — List products
router.get('/', async (req, res) => {
  try {
    let query = { isActive: true };

    // If brand, show only their products
    if (req.headers.authorization) {
      const jwt = require('jsonwebtoken');
      try {
        const token = req.headers.authorization.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const User = require('../models/User');
        const user = await User.findById(decoded.id);
        if (user && user.role === 'brand') {
          query = { brand: user._id };
        }
      } catch (e) {
        // Not authenticated — show all active products
      }
    }

    const products = await Product.find(query)
      .populate('brand', 'name email')
      .sort('-createdAt');

    res.json({ success: true, products });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/products/all — All active products (for creators)
router.get('/all', async (req, res) => {
  try {
    const products = await Product.find({ isActive: true })
      .populate('brand', 'name email')
      .sort('-createdAt');

    res.json({ success: true, products });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/products/:id — Single product (public)
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('brand', 'name email');
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    res.json({ success: true, product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   PUT /api/products/:id — Brand updates product
router.put('/:id', protect, authorize('brand'), async (req, res) => {
  try {
    let product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    if (product.brand.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to update this product' });
    }

    product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.json({ success: true, product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   DELETE /api/products/:id — Brand deletes product
router.delete('/:id', protect, authorize('brand'), async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    if (product.brand.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this product' });
    }

    product.isActive = false;
    await product.save();

    res.json({ success: true, message: 'Product deactivated' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
