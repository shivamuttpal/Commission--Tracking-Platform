const dotenv = require('dotenv');
dotenv.config();

const dns = require('node:dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);
dns.setDefaultResultOrder('ipv4first');

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Wallet = require('./models/Wallet');

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Create admin user if not exists
    const adminExists = await User.findOne({ email: 'admin@popcom.com' });
    if (!adminExists) {
      const admin = await User.create({
        name: 'Admin',
        email: 'admin@popcom.com',
        password: 'admin123',
        role: 'admin',
      });
      console.log('Admin user created:', admin.email);
    } else {
      console.log('Admin user already exists');
    }

    // Create demo brand
    const brandExists = await User.findOne({ email: 'brand@popcom.com' });
    if (!brandExists) {
      const brand = await User.create({
        name: 'Demo Brand',
        email: 'brand@popcom.com',
        password: 'brand123',
        role: 'brand',
      });
      console.log('Demo brand created:', brand.email);
    }

    // Create demo creator
    const creatorExists = await User.findOne({ email: 'creator@popcom.com' });
    if (!creatorExists) {
      const creator = await User.create({
        name: 'Demo Creator',
        email: 'creator@popcom.com',
        password: 'creator123',
        role: 'creator',
      });
      await Wallet.create({ creator: creator._id });
      console.log('Demo creator created:', creator.email);
    }

    console.log('Seed complete!');
    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error.message);
    process.exit(1);
  }
};

seedDB();
