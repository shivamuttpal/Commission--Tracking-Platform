const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db');

// Route imports
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const applicationRoutes = require('./routes/applications');
const referralRoutes = require('./routes/referrals');
const trackingRoutes = require('./routes/tracking');
const walletRoutes = require('./routes/wallet');
const payoutRoutes = require('./routes/payouts');
const adminRoutes = require('./routes/admin');
const brandRoutes = require('./routes/brand');

const app = express();

// Middleware
// app.use(cors({
//   origin: process.env.CLIENT_URL || 'http://localhost:5173',
//   credentials: true,
// }));
app.use(cors({
  origin: '*'
}));
app.use(express.json());
app.use(cookieParser());

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/referrals', referralRoutes);
app.use('/api/track', trackingRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/payouts', payoutRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/brand', brandRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});

module.exports = app;
