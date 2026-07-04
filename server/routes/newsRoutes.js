/**
 * NEWS ROUTES
 * 
 * Defines all API endpoints for news resource.
 * Endpoints for creating, reading, updating, and deleting news articles.
 * 
 * Base URL: /api/news
 * 
 * Endpoint Summary:
 * - GET /              - Fetch all news articles
 * - GET /summary       - Fetch news with excerpts (optimized for lists)
 * - GET /slug/:slug    - Fetch article by URL slug
 * - POST /upload-image - Upload inline image (for rich text editors)
 * - GET /:id           - Fetch article by MongoDB ID
 * - POST /             - Create new article (admin-only)
 * - PUT /:id           - Update article (admin-only)
 * - DELETE /:id        - Delete article (admin-only)
 */

// ==================== IMPORTS ====================
const express = require('express');
const router = express.Router();

// Import all news controller functions
const {
  getAllNews,
  getNewsSummary,
  getNewsById,
  getNewsBySlug,
  createNews,
  uploadNewsImage,
  updateNews,
  deleteNews,
} = require('../controllers/newsController');

// Import authentication middleware
const { protect, admin } = require('../middleware/authMiddleware');

// Import file upload middleware
const upload = require('../middleware/uploadMiddleware');

// ==================== UPLOAD ERROR HANDLER ====================

/**
 * Upload Middleware Error Handler
 * 
 * Wraps multer upload middleware to catch and format upload errors.
 * Multer stores files in /uploads directory before Cloudinary transfer.
 * 
 * Handles errors:
 * - File not provided
 * - File exceeds size limit (5MB)
 * - File is not an image
 * 
 * Returns 400 Bad Request with error message if upload fails.
 */
const handleUploadError = (req, res, next) => {
  upload.single('imageFile')(req, res, (err) => {
    if (err) {
      // Upload failed, return error response
      return res.status(400).json({ message: 'Invalid image upload' });
    }
    // Upload successful, proceed to controller
    next();
  });
};

// ==================== ROUTES ====================

/**
 * GET /api/news
 * Fetch All News Articles
 * 
 * Returns all news articles with full content.
 * Public endpoint (no authentication required).
 * 
 * Query Parameters: None
 * 
 * Response: Array of news objects
 * Example:
 *   [
 *     { _id, title, slug, content, date, image },
 *     ...
 *   ]
 */
router.get('/', getAllNews);

/**
 * GET /api/news/summary
 * Fetch News Summary (Optimized for Lists)
 * 
 * Returns news articles with excerpts instead of full content.
 * Useful for homepage or news list pages.
 * Sorted by newest first.
 * Public endpoint (no authentication required).
 * 
 * Response: Array of news summaries with excerpts
 * Example:
 *   [
 *     { _id, slug, title, date, image, excerpt },
 *     ...
 *   ]
 */
router.get('/summary', getNewsSummary);

/**
 * GET /api/news/slug/:slug
 * Fetch News Article by URL Slug
 * 
 * Retrieves a single article using its URL slug.
 * Used for displaying full article on public website.
 * Public endpoint (no authentication required).
 * 
 * URL Parameter:
 * - slug: Article slug (e.g., "breaking-news-announcement")
 * 
 * Response: Full news object or 404 if not found
 * Example: GET /api/news/slug/breaking-news-announcement
 */
router.get('/slug/:slug', getNewsBySlug);

/**
 * POST /api/news/upload-image
 * Upload Image for Rich Text Editor
 * 
 * Uploads an image to Cloudinary for embedding in article content.
 * Used when editors insert images in the rich text editor.
 * Returns image URL for embedding in content markdown/HTML.
 * 
 * Authentication: Required (must be admin)
 * Methods: protect (check JWT token), admin (check admin role)
 * 
 * Request: Multipart form data
 * - imageFile: Image file (max 5MB, must be image/*  MIME type)
 * 
 * Response: { imageUrl: "https://cloudinary.com/..." }
 * or 400/401/403 errors
 * 
 * Note: Route order matters! This must come BEFORE /:id route
 * Otherwise /upload-image would be interpreted as an ID parameter
 */
router.post('/upload-image', protect, admin, handleUploadError, uploadNewsImage);

/**
 * GET /api/news/:id
 * Fetch News Article by MongoDB ID
 * 
 * Retrieves a single article by its ObjectID.
 * Used primarily by admin dashboard to fetch article for editing.
 * Public endpoint (no authentication required).
 * 
 * URL Parameter:
 * - id: MongoDB ObjectID (24-character hex string)
 * 
 * Response: Full news object or 404 if not found
 * Example: GET /api/news/507f1f77bcf86cd799439011
 */
router.get('/:id', getNewsById);

/**
 * POST /api/news
 * Create New News Article
 * 
 * Creates a new news article in the database.
 * Optionally uploads featured image to Cloudinary.
 * Auto-generates unique slug from title.
 * 
 * Authentication: Required (admin only)
 * Methods: protect (JWT token), admin (admin role check)
 * Upload: Optional featured image
 * 
 * Request: Multipart form data
 * - title: Article title (required, string)
 * - content: Article body (required, string, supports HTML/Markdown)
 * - slug: Custom slug (optional, auto-generated if not provided)
 * - date: Publication date (optional, defaults to now)
 * - imageFile: Featured image (optional, max 5MB, image/* MIME type)
 * 
 * Response: { _id, title, slug, content, date, image } (201 Created)
 * or 400/401/403 errors
 */
router.post('/', protect, admin, handleUploadError, createNews);

/**
 * PUT /api/news/:id
 * Update Existing News Article
 * 
 * Updates a news article by MongoDB ID.
 * Can update content and/or featured image.
 * Regenerates slug if title changes.
 * Deletes old image from Cloudinary if new image provided.
 * 
 * Authentication: Required (admin only)
 * Methods: protect (JWT token), admin (admin role check)
 * Upload: Optional new featured image
 * 
 * URL Parameter:
 * - id: MongoDB ObjectID of article to update
 * 
 * Request: Multipart form data
 * - title: New article title (optional)
 * - content: New article body (optional)
 * - slug: New custom slug (optional)
 * - date: New publication date (optional)
 * - imageFile: New featured image (optional, replaces old)
 * 
 * Response: Updated news object or 404 if not found
 */
router.put('/:id', protect, admin, handleUploadError, updateNews);

/**
 * DELETE /api/news/:id
 * Delete News Article
 * 
 * Permanently deletes a news article and its featured image.
 * Removes image from Cloudinary CDN.
 * 
 * Authentication: Required (admin only)
 * Methods: protect (JWT token), admin (admin role check)
 * 
 * URL Parameter:
 * - id: MongoDB ObjectID of article to delete
 * 
 * Response: { message: "News deleted" } or 404 if not found
 */
router.delete('/:id', protect, admin, deleteNews);

// ==================== EXPORTS ====================
module.exports = router;
