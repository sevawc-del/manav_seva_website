/**
 * MANAV SEVA BACKEND SERVER
 * 
 * This is the main Express.js REST API server for the Manav Seva non-profit application.
 * It handles:
 * - RESTful API endpoints for all resources (news, events, donations, etc.)
 * - MongoDB database connection and operations
 * - JWT authentication and authorization
 * - File uploads to Cloudinary
 * - CORS for cross-origin requests from admin/client apps
 * - Security headers via Helmet
 */

// ==================== DEPENDENCIES ====================
const express = require('express');          // Web framework for REST API
const mongoose = require('mongoose');         // MongoDB object modeling
const cors = require('cors');                 // Enable cross-origin requests
const helmet = require('helmet');             // Add security headers to responses
const dotenv = require('dotenv');             // Load environment variables from .env
const path = require('path');                 // File path utilities
const fs = require('fs');                     // File system operations
const dns = require('dns');                   // DNS configuration

// Load environment variables from .env file
dotenv.config();

// ==================== CONFIGURATION ====================

// DNS Configuration: Use IPv4 first for platforms that don't fully support IPv6 (e.g., Render)
// This prevents connection timeouts on platforms with limited IPv6 routing
dns.setDefaultResultOrder('ipv4first');

// Ensure the uploads directory exists for storing temporary files before Cloudinary transfer
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log('✅ Uploads directory created');
}

// Initialize Express application
const app = express();

// ==================== MIDDLEWARE SETUP ====================

// Trust proxy: For deployment on Render/Vercel - ensures proper IP detection for rate limiting
app.set('trust proxy', 1);

// CORS Middleware: Allow requests from specified client and admin URLs
// - Filters undefined URLs to prevent issues
// - Enables credentials (cookies/auth headers) in cross-origin requests
app.use(cors({
  origin: [
    process.env.CLIENT_URL,    // Public website URL
    process.env.ADMIN_URL      // Admin dashboard URL
  ].filter(Boolean),           // Remove undefined values
  credentials: true            // Allow cookies and authorization headers
}));

// Helmet Middleware: Add security headers to all responses
// - Protects against common web vulnerabilities (XSS, clickjacking, etc.)
// - Set CORS policy to 'cross-origin' to allow images/assets from other origins
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}));

// Body Parser Middleware: Parse incoming JSON requests
// - Limit payload size to 1MB for security
// - Special handling for Razorpay webhook: store raw body for signature verification
app.use(express.json({
  limit: '1mb',
  verify: (req, res, buf) => {
    if (req.originalUrl && req.originalUrl.startsWith('/api/donations/webhook')) {
      req.rawBody = buf;  // Preserve raw body for webhook signature validation
    }
  }
}));

// Parse URL-encoded form data (e.g., form submissions)
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Static File Serving: Serve uploaded files from /uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ==================== DATABASE CONNECTION ====================

// Connect to MongoDB using Mongoose
mongoose
  .connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('MongoDB connected');

    // ==================== AUTO-SEEDING ADMIN USER ====================
    // Automatically create a default admin user on first deployment (if enabled)
    // Set SEED_ADMIN=false after first deployment to prevent recreating admin
    
    if (process.env.SEED_ADMIN === 'true') {
      try {
        const User = require('./models/User');
        const bcrypt = require('bcryptjs');
        const { ADMIN_USERNAME, ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;

        // Validate required environment variables for admin creation
        if (!ADMIN_USERNAME || !ADMIN_EMAIL || !ADMIN_PASSWORD) {
          throw new Error('Missing ADMIN_USERNAME, ADMIN_EMAIL, or ADMIN_PASSWORD for admin seeding');
        }

        // Check if admin user already exists to prevent duplicates
        const existingAdmin = await User.findOne({ role: 'admin' });
        if (!existingAdmin) {
          // Hash password with bcrypt (10 salt rounds for security)
          const hashedPassword = await bcrypt.hash(
            ADMIN_PASSWORD,
            10
          );

          // Create new admin user with provided credentials
          const adminUser = new User({
            username: ADMIN_USERNAME,
            email: ADMIN_EMAIL,
            password: hashedPassword,
            role: 'admin'
          });

          // Save admin user to database
          await adminUser.save();
          console.log('✅ Admin user auto-seeded successfully');
          console.log('Email:', adminUser.email);
          console.log('⚠️  Remember to set SEED_ADMIN=false after first deployment');
        } else {
          console.log('ℹ️  Admin user already exists, skipping auto-seed');
        }
      } catch (error) {
        console.error('❌ Error auto-seeding admin:', error);
      }
    }

    // ==================== API ROUTES ====================
    // Mount route handlers for different resource endpoints
    // Each route module contains CRUD operations for its resource
    
    // Public/Mixed access routes (some operations public, some protected by auth middleware in their route files)
    app.use('/api/sliders', require('./routes/sliderRoutes'));
    app.use('/api/news', require('./routes/newsRoutes'));
    app.use('/api/events', require('./routes/eventRoutes'));
    app.use('/api/testimonials', require('./routes/testimonialRoutes'));
    app.use('/api/sponsors', require('./routes/sponsorRoutes'));
    app.use('/api/site-settings', require('./routes/siteSettingsRoutes'));
    app.use('/api/donation-settings', require('./routes/donationSettingsRoutes'));
    app.use('/api/donations', require('./routes/donationRoutes'));
    app.use('/api/tenders', require('./routes/tenderRoutes'));
    app.use('/api/gallery', require('./routes/galleryRoutes'));
    app.use('/api/reports', require('./routes/reportRoutes'));
    
    // Authentication routes (login, register, logout)
    app.use('/api/auth', require('./routes/authRoutes'));
    
    // User interaction routes (contact messages, activity tracking)
    app.use('/api/contact', require('./routes/contactRoutes'));
    app.use('/api/about', require('./routes/aboutRoutes'));
    app.use('/api', require('./routes/activityRoutes'));
    app.use('/api', require('./routes/adminActivityRoutes'));
    app.use('/api', require('./routes/geographicActivityRoutes'));
    
    // Organization content routes (journeys, job listings, volunteering)
    app.use('/api/journeys', require('./routes/journeyRoutes'));
    app.use('/api/jobs', require('./routes/jobRoutes'));
    app.use('/api/volunteers', require('./routes/volunteerRoutes'));
    
    // Admin routes (user management)
    app.use('/api/users', require('./routes/userRoutes'));

    // ==================== ERROR HANDLING ====================
    // Central error handler middleware (MUST be last)
    // Catches any unhandled errors from routes and sends appropriate response
    // - Returns 500 for server errors
    // - Returns specific status codes for client errors
    // - Includes error details only in development environment for security
    
    app.use((err, req, res, next) => {
      console.error('Server error:', err);
      res.status(err.status || 500).json({
        message: err.status && err.status < 500 ? 'Request failed' : 'Internal Server Error',
        error: process.env.NODE_ENV === 'development' ? err : {}
      });
    });

    // ==================== START SERVER ====================
    // Get port from environment or default to 5000
    // Listen on specified port and log server start message
    
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () =>
      console.log(`Server running on port ${PORT}`)
    );
  })
  .catch(err => {
    // Handle MongoDB connection failure
    console.error('MongoDB connection error:', err);
    process.exit(1);  // Exit process if database connection fails
  });
