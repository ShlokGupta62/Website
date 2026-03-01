const mongoose = require("mongoose");

// Cache the connection across serverless invocations (Vercel / AWS Lambda).
// On a regular Node process the cached value is simply reused between requests.
let cachedConn = null;

const connectDB = async () => {
  if (cachedConn && mongoose.connection.readyState === 1) return cachedConn;
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 10000,
    });
    cachedConn = conn;
    console.log(`MongoDB connected: ${conn.connection.host}`);
    return conn;
  } catch (err) {
    console.error("MongoDB connection error:", err.message);
    // In serverless we throw instead of process.exit so the function returns a 500
    if (process.env.VERCEL) throw err;
    process.exit(1);
  }
};

module.exports = connectDB;
