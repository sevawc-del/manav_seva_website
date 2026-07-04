/**
 * FILE UPLOAD MIDDLEWARE (Documents)
 * 
 * Handles document uploads (PDF, Word, Excel, PowerPoint, etc.) using multer.
 * Different from uploadMiddleware.js which handles image uploads.
 * 
 * This middleware is used for uploading:
 * - PDF reports and documents
 * - Word documents and forms
 * - Excel spreadsheets
 * - PowerPoint presentations
 * - Text files and CSV data
 * - Compressed archives (ZIP files)
 * 
 * Files are temporarily stored on server before transfer to Cloudinary.
 */

// ==================== IMPORTS ====================
const multer = require('multer');     // Multipart form data parser
const path = require('path');          // File path utilities

// ==================== STORAGE CONFIGURATION ====================

/**
 * Disk Storage Configuration for Documents
 * 
 * Stores uploaded document files temporarily on server disk.
 * 
 * Directory: /uploads/ - Temporary storage location
 * Filename: Unique timestamp-based names to prevent collisions
 */
const storage = multer.diskStorage({
  /**
   * Destination folder for uploaded files
   * 
   * @param {Object} req - Express request object
   * @param {Object} file - File object from multipart form
   * @param {Function} cb - Callback(error, destination_path)
   */
  destination: (req, file, cb) => {
    cb(null, 'uploads/');  // Store all uploads in /uploads directory
  },
  
  /**
   * Generate unique filename for uploaded document
   * 
   * Filename format: fieldname-timestamp-randomstring.extension
   * Example: report-1704067200000-123456789.pdf
   * 
   * @param {Object} req - Express request object
   * @param {Object} file - File object from multipart form
   * @param {Function} cb - Callback(error, filename)
   */
  filename: (req, file, cb) => {
    // Generate unique suffix: current timestamp + random number
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    
    // Construct filename: fieldname + unique-suffix + original-extension
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// ==================== ALLOWED FILE TYPES ====================

/**
 * List of allowed MIME types for document uploads
 * 
 * Includes support for:
 * - Documents: PDF, Word (DOC, DOCX)
 * - Spreadsheets: Excel (XLS, XLSX)
 * - Presentations: PowerPoint (PPT, PPTX)
 * - Text: Plain text, CSV
 * - Archives: ZIP files
 */
const allowedMimeTypes = [
  'application/pdf',                    // PDF files
  'application/msword',                 // Old Word format (.doc)
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',  // New Word format (.docx)
  'application/vnd.ms-excel',           // Old Excel format (.xls)
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',         // New Excel format (.xlsx)
  'application/vnd.ms-powerpoint',      // Old PowerPoint format (.ppt)
  'application/vnd.openxmlformats-officedocument.presentationml.presentation', // New PowerPoint format (.pptx)
  'text/plain',                         // Plain text files
  'text/csv',                           // CSV (Comma-separated values)
  'application/zip',                    // ZIP archives
  'application/x-zip-compressed',       // Alternative ZIP MIME type
  'application/octet-stream'            // Binary/unknown files (fallback)
];

// ==================== MULTER CONFIGURATION ====================

/**
 * Multer Upload Instance for Documents
 * 
 * Configures document upload with:
 * - Storage location and naming strategy
 * - File size limit: 10MB per file
 * - File type validation: Only allowed document types
 */
const fileUpload = multer({
  storage,
  
  // File size limit: 10MB (10 * 1024 * 1024 bytes)
  // Note: Documents can be larger than images, so 10MB instead of 5MB
  limits: { fileSize: 10 * 1024 * 1024 },
  
  /**
   * File Validation Function
   * 
   * Ensures only allowed document types are uploaded.
   * Checks MIME type against allowlist.
   * 
   * @param {Object} req - Express request object
   * @param {Object} file - File object with filename, mimetype, size, etc.
   * @param {Function} cb - Callback(error, accept_boolean)
   * 
   * Prevents:
   * - Executable files (exe, bat, sh, etc.)
   * - Media files (mp3, mp4, etc.) unless specifically allowed
   * - Scripts (js, py, rb, etc.)
   * - Other potentially unsafe file types
   */
  fileFilter: (req, file, cb) => {
    // Check if file MIME type is in the allowed list
    if (allowedMimeTypes.includes(file.mimetype)) {
      // File type is allowed, accept it
      cb(null, true);
      return;
    }

    // File type is not allowed, reject it
    cb(new Error('Only document files are allowed'));
  }
});

// ==================== EXPORTS ====================
module.exports = fileUpload;
