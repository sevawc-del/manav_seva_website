/**
 * FILE UPLOAD MIDDLEWARE
 * 
 * Handles file uploads using multer library.
 * Files are temporarily stored on server disk, then transferred to Cloudinary
 * for permanent storage and CDN delivery.
 * 
 * This middleware intercepts multipart/form-data requests with file attachments.
 */

// ==================== IMPORTS ====================
const multer = require('multer');     // Multipart form data parser
const path = require('path');          // File path utilities

// ==================== STORAGE CONFIGURATION ====================

/**
 * Disk Storage Configuration
 * 
 * Configures where and how multer stores uploaded files on the server.
 * Files are stored temporarily in /uploads directory before being
 * transferred to Cloudinary.
 * 
 * Directory: /uploads/ - Temporary storage for uploaded files
 * Filename: Unique timestamp-based naming to prevent collisions
 */
const storage = multer.diskStorage({
  /**
   * Set destination folder for uploaded files
   * 
   * @param {Object} req - Express request object
   * @param {Object} file - File object from multipart form
   * @param {Function} cb - Callback(error, destination_path)
   */
  destination: (req, file, cb) => {
    cb(null, 'uploads/');  // Store all uploads in /uploads directory
  },
  
  /**
   * Generate unique filename for uploaded file
   * 
   * Filename format: fieldname-timestamp-randomstring.extension
   * Example: avatar-1704067200000-123456789.jpg
   * 
   * @param {Object} req - Express request object
   * @param {Object} file - File object from multipart form
   * @param {Function} cb - Callback(error, filename)
   */
  filename: (req, file, cb) => {
    // Generate unique suffix using current timestamp + random number
    // Prevents filename collisions when multiple files uploaded with same name
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    
    // Construct final filename: fieldname + unique-suffix + original-extension
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// ==================== MULTER CONFIGURATION ====================

/**
 * Multer Upload Instance
 * 
 * Configures file upload settings:
 * - Storage: Use disk storage defined above
 * - Size limit: 5MB per file
 * - File validation: Only image files allowed
 * 
 * Rejects non-image files and files exceeding size limit.
 */
const upload = multer({
  storage: storage,
  
  // File size limit: 5MB (5 * 1024 * 1024 bytes)
  limits: { fileSize: 5 * 1024 * 1024 },
  
  /**
   * File Validation Function
   * 
   * Filters uploaded files to ensure only images are accepted.
   * Checks MIME type (Content-Type header from client).
   * 
   * @param {Object} req - Express request object
   * @param {Object} file - File object with: filename, mimetype, size, etc.
   * @param {Function} cb - Callback(error, accept_boolean)
   * 
   * MIME types allowed:
   * - image/jpeg
   * - image/png
   * - image/gif
   * - image/webp
   * - etc. (anything starting with 'image/')
   */
  fileFilter: (req, file, cb) => {
    // Check if file MIME type starts with 'image/'
    if (file.mimetype.startsWith('image/')) {
      // File is an image, accept it
      cb(null, true);
    } else {
      // File is not an image, reject it
      cb(new Error('Only image files are allowed'));
    }
  }
});

// ==================== EXPORTS ====================
module.exports = upload;
