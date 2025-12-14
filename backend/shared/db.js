// MongoDB connection utility (shared)
const mongoose = require('mongoose');

let isConnected = false;
let connectionAttempted = false;
let lastErrorTime = 0;
const ERROR_LOG_INTERVAL = 60000; // Only log errors once per minute

const connectDB = async () => {
  // If already connected, return
  if (mongoose.connection.readyState === 1) {
    isConnected = true;
    return;
  }

  // If connection is in progress, wait a bit
  if (mongoose.connection.readyState === 2) {
    // Connection is connecting, wait for it
    return new Promise((resolve) => {
      mongoose.connection.once('connected', () => {
        isConnected = true;
        resolve();
      });
      mongoose.connection.once('error', () => {
        isConnected = false;
        resolve();
      });
      // Timeout after 5 seconds
      setTimeout(() => resolve(), 5000);
    });
  }

  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/agentic_support';
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000, // 5 second timeout
      socketTimeoutMS: 45000,
    });
    isConnected = true;
    connectionAttempted = true;
    if (!connectionAttempted || Date.now() - lastErrorTime > ERROR_LOG_INTERVAL) {
      console.log('✅ MongoDB connected');
    }
  } catch (err) {
    isConnected = false;
    connectionAttempted = true;
    const now = Date.now();
    
    // Only log error if enough time has passed since last error
    if (now - lastErrorTime > ERROR_LOG_INTERVAL) {
      console.error('MongoDB connection error:', err.message);
      console.warn('⚠️  MongoDB is not running. Some features may not work.');
      console.warn('💡 To fix: Start MongoDB locally or set MONGO_URI environment variable');
      lastErrorTime = now;
    }
    // Don't exit - allow service to run without DB (for testing)
    // process.exit(1);
  }
};

module.exports = connectDB;
