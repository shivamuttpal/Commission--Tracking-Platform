const mongoose = require('mongoose');
const dns = require('node:dns');


// Force ipv4 to fix connection issues
dns.setServers(['8.8.8.8', '8.8.4.4']); // Google Public DNS
dns.setDefaultResultOrder('ipv4first');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
