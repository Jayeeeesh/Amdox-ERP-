const mongoose = require('mongoose');
const { MONGO_URI, NODE_ENV } = require('./env');

let isConnected = false;
let retryCount = 0;
const MAX_RETRIES = 5;

const connectDB = async () => {
  // Avoid duplicate connections
  if (isConnected) {
    console.log('⚡ Using existing MongoDB connection');
    return;
  }

  try {
    mongoose.set('strictQuery', true);

    const conn = await mongoose.connect(MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      maxPoolSize: 10,
      minPoolSize: 2,
      retryWrites: true,
      retryReads: true,
    });

    isConnected = true;
    retryCount = 0;

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`📦 Database: ${conn.connection.name}`);

  } catch (error) {
    console.error(`❌ MongoDB Error: ${error.message}`);

    if (retryCount < MAX_RETRIES) {
      retryCount++;
      console.log(`🔄 Retrying (${retryCount}/${MAX_RETRIES})...`);
      setTimeout(connectDB, 5000);
    } else {
      console.error('❌ Max retries reached. Exiting...');
      process.exit(1);
    }
  }
};

// Connection Events
mongoose.connection.on('connected', () => {
  console.log('🟢 MongoDB connection established');
});

mongoose.connection.on('disconnected', () => {
  isConnected = false;
  console.warn('⚠️ MongoDB disconnected');
});

mongoose.connection.on('reconnected', () => {
  isConnected = true;
  console.log('🔄 MongoDB reconnected');
});

mongoose.connection.on('error', (err) => {
  console.error(`❌ MongoDB Error: ${err.message}`);
});

// Graceful Close
process.on('SIGINT', async () => {
  await mongoose.connection.close();
  console.log('✅ MongoDB connection closed');
  process.exit(0);
});

// Debug in development only
if (NODE_ENV === 'development') {
  mongoose.set('debug', true);
}

module.exports = { connectDB };