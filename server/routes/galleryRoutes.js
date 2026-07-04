/**
 * GALLERY ROUTES
 * 
 * Defines API endpoints for photo gallery management.
 * 
 * Base URL: /api/gallery
 * 
 * Endpoints:
 * - GET /           - Fetch all gallery photos
 * - GET /:id        - Fetch single gallery item
 * - POST /          - Create new gallery item (admin-only)
 * - PUT /:id        - Update gallery item (admin-only)
 * - DELETE /:id     - Delete gallery item (admin-only)
 */

// ==================== IMPORTS ====================
const express = require('express');
const router = express.Router();

// Import gallery controller functions
const {
  getAllGalleryItems,
  getGalleryItemById,
  createGalleryItem,
  updateGalleryItem,
  deleteGalleryItem,
} = require('../controllers/galleryController');

// Import authentication middleware
const { protect, admin } = require('../middleware/authMiddleware');

// Import file upload middleware
const upload = require('../middleware/uploadMiddleware');

// ==================== UPLOAD ERROR HANDLER ====================

/**
 * Upload Middleware Error Handler
 * 
 * Catches multer errors during image upload.
 * Returns 400 Bad Request if upload fails.
 */
const handleUploadError = (req, res, next) => {
  upload.single('imageFile')(req, res, (err) => {
    if (err) {
      return res.status(400).json({ message: 'Invalid image upload' });
    }
    next();
  });
};

// ==================== ROUTES ====================

/**
 * GET /api/gallery
 * Fetch All Gallery Items
 * 
 * Returns all photos in the gallery.
 * Public endpoint (no authentication required).
 * 
 * Response: Array of gallery items
 * Example:
 *   [
 *     { _id, title, image, description, date, showOnHome },
 *     ...
 *   ]
 */
router.get('/', getAllGalleryItems);

/**
 * GET /api/gallery/:id
 * Fetch Single Gallery Item by ID
 * 
 * Retrieves a specific photo from the gallery.
 * Public endpoint (no authentication required).
 * 
 * URL Parameter:
 * - id: MongoDB ObjectID of gallery item
 * 
 * Response: Gallery item object or 404 if not found
 */
router.get('/:id', getGalleryItemById);

/**
 * POST /api/gallery
 * Create New Gallery Item
 * 
 * Adds a new photo to the gallery.
 * Uploads image to Cloudinary.
 * 
 * Authentication: Required (admin only)
 * 
 * Request: Multipart form data
 * - title: Photo title/caption (required)
 * - description: Photo description (optional)
 * - imageFile: Image file (required, max 5MB, image/* MIME type)
 * - showOnHome: Show on homepage (optional, defaults to true)
 * 
 * Response: Created gallery item (201 Created)
 */
router.post('/', protect, admin, handleUploadError, createGalleryItem);

/**
 * PUT /api/gallery/:id
 * Update Gallery Item
 * 
 * Updates an existing gallery photo.
 * Can update title, description, and/or image.
 * 
 * Authentication: Required (admin only)
 * 
 * URL Parameter:
 * - id: MongoDB ObjectID of item to update
 * 
 * Request: Multipart form data
 * - title: New title (optional)
 * - description: New description (optional)
 * - imageFile: New image (optional, replaces old)
 * - showOnHome: Update display flag (optional)
 * 
 * Response: Updated gallery item
 */
router.put('/:id', protect, admin, handleUploadError, updateGalleryItem);

/**
 * DELETE /api/gallery/:id
 * Delete Gallery Item
 * 
 * Permanently removes a photo from gallery.
 * Deletes image from Cloudinary.
 * 
 * Authentication: Required (admin only)
 * 
 * URL Parameter:
 * - id: MongoDB ObjectID of item to delete
 * 
 * Response: { message: "Gallery item deleted" }
 */
router.delete('/:id', protect, admin, deleteGalleryItem);

// ==================== EXPORTS ====================
module.exports = router;
