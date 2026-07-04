/**
 * DATABASE CONFIGURATION
 * 
 * Handles MongoDB connection setup and initialization.
 * This function is called from server.js to establish connection with MongoDB Atlas.
 */

// ==================== IMPORTS ====================
const mongoose = require('mongoose');  // MongoDB ODM (Object Document Mapper)

/**
 * Connect to MongoDB
 * 
 * Establishes connection to MongoDB database using connection string from environment.
 * Handles connection errors gracefully and exits process if connection fails.
 * 
 * @async
 * @returns {Promise<void>}
 * @throws {Error} If MongoDB connection fails or URI is invalid
 * 
 * Environment Variable:
 * - MONGO_URI: MongoDB connection string (must include credentials and database name)
 *   Format: mongodb+srv://username:password@cluster.mongodb.net/database_name
 * 
 * Connection is established with default Mongoose options:
 * - autoCreate: true (automatically create collections if they don't exist)
 * - autoIndex: true (automatically create indexes defined in schemas)
 * 
 * Usage:
 *   const connectDB = require('./config/db');
 *   await connectDB();
 * 
 * Example MONGO_URI:
 *   mongodb+srv://admin:password123@cluster0.mongodb.net/manav_seva
 */
const connectDB = async () => {
  try {
    // Establish connection to MongoDB using Mongoose
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      // Connection options are handled by Mongoose defaults
      // Options can be expanded here as needed for production
    });
    
    // Log successful connection with host information
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    // Log connection error for debugging
    console.error(error);
    
    // Exit process with error code if connection fails
    // This prevents server from running without database access
    process.exit(1);
  }
};

// ==================== EXPORTS ====================
module.exports = connectDB;
