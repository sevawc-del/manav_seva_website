/**
 * CLOUDINARY CONFIGURATION
 * 
 * Sets up Cloudinary for cloud-based image storage and CDN delivery.
 * Instead of storing large image files on the server, we upload them to Cloudinary,
 * which provides:
 * - Reliable cloud storage
 * - Automatic optimization and resizing
 * - Global CDN for fast image delivery
 * - Transformation capabilities (crop, resize, filter, etc.)
 * 
 * Authentication uses credentials from environment variables.
 */

// ==================== IMPORTS ====================
const cloudinary = require('cloudinary').v2;  // Cloudinary v2 API SDK

/**
 * Configure Cloudinary API Credentials
 * 
 * These credentials are obtained from your Cloudinary dashboard:
 * https://cloudinary.com/console/
 * 
 * Environment Variables Required:
 * - CLOUDINARY_CLOUD_NAME: Your Cloudinary cloud identifier (e.g., "abc123def")
 * - CLOUDINARY_API_KEY: API key for authentication (e.g., "123456789")
 * - CLOUDINARY_API_SECRET: API secret key for signature generation (KEEP SECRET!)
 * 
 * WARNING: Never commit API_SECRET to version control!
 * Store it in .env file only (add .env to .gitignore)
 */
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,      // Public cloud identifier
  api_key: process.env.CLOUDINARY_API_KEY,            // API authentication key
  api_secret: process.env.CLOUDINARY_API_SECRET,      // Secret key for signing requests
});

/**
 * Usage Examples:
 * 
 * 1. Upload image to Cloudinary:
 *    cloudinary.uploader.upload('local_file.jpg')
 * 
 * 2. Delete image from Cloudinary:
 *    cloudinary.uploader.destroy('public_id')
 * 
 * 3. Transform/resize image:
 *    cloudinary.url('public_id', { width: 400, height: 300, crop: 'fill' })
 * 
 * 4. Generate signed URL (for private images):
 *    cloudinary.url('public_id', { sign_url: true })
 */

// ==================== EXPORTS ====================
module.exports = cloudinary;
