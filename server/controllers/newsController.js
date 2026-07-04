/**
 * NEWS CONTROLLER
 * 
 * Handles all CRUD operations for news articles.
 * Manages news creation, retrieval, updates, and deletion.
 * Integrates with Cloudinary for image storage and CDN delivery.
 * 
 * Key Features:
 * - Automatic slug generation (URL-friendly identifiers)
 * - Image upload to Cloudinary with temporary file cleanup
 * - News summary generation with HTML-stripped excerpts
 * - News retrieval by ID or slug
 * - Support for bulk news fetching and filtered summaries
 */

// ==================== IMPORTS ====================
const News = require('../models/News');                    // News database model
const cloudinary = require('../config/cloudinary');        // Cloudinary SDK for image uploads
const fs = require('fs/promises');                         // Promise-based file system operations
const { deleteCloudinaryAsset } = require('../utils/cloudinaryAsset');  // Utility for deleting from Cloudinary

// ==================== HELPER FUNCTIONS ====================

/**
 * Clean Up Temporary Upload Files
 * 
 * Deletes temporary files from server disk after uploading to Cloudinary.
 * Files are no longer needed once safely stored in the cloud.
 * 
 * @async
 * @param {string} filePath - Path to temporary file to delete
 * @returns {Promise<void>}
 * 
 * Note: Silently ignores "file not found" errors (ENOENT)
 * Only logs other error types for debugging
 */
const cleanupTempUpload = async (filePath) => {
  if (!filePath) return;  // Skip if no path provided
  try {
    await fs.unlink(filePath);  // Delete the file
  } catch (error) {
    // ENOENT = "Error No ENTity" (file doesn't exist) - this is expected in some cases
    if (error.code !== 'ENOENT') {
      console.error('Temp upload cleanup error:', error.message);
    }
  }
};

/**
 * Convert String to URL-Friendly Slug
 * 
 * Transforms text into a slug suitable for URLs and routing.
 * Examples:
 * - "Hello World!" → "hello-world"
 * - "Important News!!!" → "important-news"
 * - "COVID-19 Updates" → "covid-19-updates"
 * 
 * @param {string} value - String to convert to slug
 * @returns {string} - URL-friendly slug
 */
const slugify = (value = '') =>
  String(value)
    .toLowerCase()                           // Convert to lowercase
    .trim()                                  // Remove leading/trailing spaces
    .replace(/[^a-z0-9]+/g, '-')            // Replace non-alphanumeric with hyphens
    .replace(/^-+|-+$/g, '');               // Remove leading/trailing hyphens

/**
 * Generate Unique Slug for News Article
 * 
 * Creates a URL-friendly slug from title.
 * Ensures uniqueness by appending suffix if slug already exists.
 * 
 * Examples:
 * - First "Breaking News" → "breaking-news"
 * - Second "Breaking News" → "breaking-news-2"
 * - Third "Breaking News" → "breaking-news-3"
 * 
 * @async
 * @param {string} title - News title to convert to slug
 * @param {string} requestedSlug - Optional custom slug from user
 * @param {string} currentId - Optional ID to skip (for updates)
 * @returns {Promise<string>} - Unique slug ready for database storage
 */
const generateUniqueSlug = async (title, requestedSlug, currentId = null) => {
  // Use requested slug if provided, otherwise generate from title
  const baseSlug = slugify(requestedSlug || title);
  if (!baseSlug) return '';  // Return empty if can't generate slug

  let candidate = baseSlug;
  let suffix = 1;

  // Keep incrementing suffix until we find an unused slug
  while (true) {
    const existing = await News.findOne({ slug: candidate });
    
    // Found unused slug, or existing slug belongs to current document (update case)
    if (!existing || String(existing._id) === String(currentId)) {
      return candidate;
    }
    
    // Slug is taken, try next suffix
    suffix += 1;
    candidate = `${baseSlug}-${suffix}`;
  }
};

/**
 * Extract Only Allowed News Fields
 * 
 * Filters request body to only include allowed fields.
 * Prevents injection of unauthorized fields.
 * 
 * Allowed fields:
 * - title, slug, content, date, image
 * 
 * @param {Object} body - Request body object
 * @returns {Object} - Filtered object with only allowed fields
 */
const pickNewsFields = (body = {}) => ({
  title: body.title,
  slug: body.slug,
  content: body.content,
  date: body.date,
  image: body.image
});

/**
 * Delete Image from Cloudinary
 * 
 * Removes image file from Cloudinary CDN.
 * Useful when updating/deleting news articles with old images.
 * 
 * @async
 * @param {string} imageUrl - Cloudinary image URL to delete
 * @returns {Promise<void>}
 */
const deleteCloudinaryImage = async (imageUrl) => {
  try {
    await deleteCloudinaryAsset({
      assetUrl: imageUrl,
      resourceType: 'image',
      fallbackResourceTypes: ['image'],
      invalidate: true  // Invalidate CDN cache
    });
  } catch (error) {
    console.error('Cloudinary delete error:', error.message);
  }
};

/**
 * Strip HTML and Markdown Markup from Text
 * 
 * Removes all formatting from content for plain text display.
 * Useful for generating clean text excerpts.
 * 
 * Removes:
 * - HTML tags: <div>, <p>, <b>, etc.
 * - Markdown links: [text](url)
 * - Markdown formatting: *, _, >, #, ~, `
 * 
 * @param {string} value - Text with markup to clean
 * @returns {string} - Plain text without formatting
 */
const stripNewsMarkup = (value = '') =>
  String(value)
    .replace(/<[^>]*>/g, ' ')                      // Remove HTML tags
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')      // Convert markdown links to plain text
    .replace(/[`*_>#~]/g, ' ')                    // Remove markdown formatting characters
    .replace(/\s+/g, ' ')                         // Normalize multiple spaces to single space
    .trim();                                       // Remove leading/trailing spaces

/**
 * Build Text Excerpt from Content
 * 
 * Generates a short preview/summary of the article.
 * Strips markup and truncates to specified length.
 * 
 * @param {string} value - Full article content
 * @param {number} maxLength - Maximum excerpt length in characters (default: 170)
 * @returns {string} - Cleaned excerpt with ellipsis if truncated
 * 
 * Example:
 *   buildNewsExcerpt("This is a long article...", 20)
 *   // Returns: "This is a long..."
 */
const buildNewsExcerpt = (value = '', maxLength = 170) => {
  const cleaned = stripNewsMarkup(value);  // Clean markup first
  if (!cleaned) return '';
  
  // Truncate if longer than max length and add ellipsis
  return cleaned.length > maxLength
    ? `${cleaned.slice(0, maxLength).trimEnd()}...`
    : cleaned;
};

// ==================== CONTROLLER FUNCTIONS ====================

/**
 * GET /api/news
 * Retrieve All News Articles
 * 
 * Fetches all news articles from database.
 * No pagination applied - returns all news items.
 * 
 * @async
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * 
 * @returns {JSON} Array of news articles with all fields
 * @throws {500} Internal Server Error if database query fails
 * 
 * Example Response:
 *   [
 *     {
 *       "_id": "123abc",
 *       "title": "Important Announcement",
 *       "slug": "important-announcement",
 *       "content": "...",
 *       "date": "2024-01-15T10:30:00Z",
 *       "image": "https://cloudinary.com/..."
 *     }
 *   ]
 */
const getAllNews = async (req, res) => {
  try {
    const news = await News.find();  // Fetch all news from database
    res.json(news);
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

/**
 * GET /api/news/summary
 * Retrieve News Summary with Excerpts
 * 
 * Fetches news with excerpts instead of full content.
 * Optimized for listing pages (smaller payload).
 * Sorts by date (newest first).
 * 
 * @async
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * 
 * @returns {JSON} Array of news summaries with excerpts
 * @throws {500} Internal Server Error if database query fails
 * 
 * Example Response:
 *   [
 *     {
 *       "_id": "123abc",
 *       "slug": "important-announcement",
 *       "title": "Important Announcement",
 *       "date": "2024-01-15T10:30:00Z",
 *       "image": "https://cloudinary.com/...",
 *       "excerpt": "This is the first 170 characters of the article..."
 *     }
 *   ]
 */
const getNewsSummary = async (req, res) => {
  try {
    // Fetch limited fields and sort by date (newest first)
    const news = await News.find()
      .select('_id slug title date image content')  // Only these fields
      .sort({ date: -1, _id: -1 })                 // Newest first
      .lean();                                      // Convert to plain JS objects (faster)

    // Transform each news item: extract content and generate excerpt
    const summary = news.map(({ content, ...item }) => ({
      ...item,
      excerpt: buildNewsExcerpt(content)  // Generate excerpt from content
    }));

    res.json(summary);
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

/**
 * GET /api/news/:id
 * Retrieve Single News Article by ID
 * 
 * Fetches a specific news article by MongoDB ID.
 * Returns full article with all content.
 * 
 * @async
 * @param {Object} req - Express request object
 * @param {string} req.params.id - MongoDB ObjectID of news article
 * @param {Object} res - Express response object
 * 
 * @returns {JSON} Full news article object
 * @throws {404} News not found
 * @throws {500} Internal Server Error
 */
const getNewsById = async (req, res) => {
  try {
    const news = await News.findById(req.params.id);  // Find by MongoDB ID
    if (!news) return res.status(404).json({ message: 'News not found' });
    res.json(news);
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

/**
 * GET /api/news/slug/:slug
 * Retrieve Single News Article by Slug
 * 
 * Fetches a specific news article by URL slug.
 * Used for public website (user-friendly URLs).
 * 
 * @async
 * @param {Object} req - Express request object
 * @param {string} req.params.slug - URL slug of news article
 * @param {Object} res - Express response object
 * 
 * @returns {JSON} Full news article object
 * @throws {404} News not found with that slug
 * @throws {500} Internal Server Error
 * 
 * Example URL: GET /api/news/slug/breaking-news-announcement
 */
const getNewsBySlug = async (req, res) => {
  try {
    const news = await News.findOne({ slug: req.params.slug });  // Find by slug
    if (!news) return res.status(404).json({ message: 'News not found' });
    res.json(news);
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

/**
 * POST /api/news
 * Create New News Article
 * 
 * Creates a new news article with optional featured image upload.
 * Auto-generates unique slug from title.
 * Uploads image to Cloudinary if provided.
 * 
 * @async
 * @param {Object} req - Express request object
 * @param {Object} req.body - Request body
 * @param {string} req.body.title - News title (required)
 * @param {string} req.body.slug - Custom slug (optional, auto-generated if not provided)
 * @param {string} req.body.content - Article content (required)
 * @param {string} req.body.date - Publication date (optional)
 * @param {File} req.file - Featured image file (optional, multer)
 * @param {Object} res - Express response object
 * 
 * @returns {JSON} Created news article object (201 Created)
 * @throws {400} Invalid request data or missing required fields
 * @throws {500} Image upload failed
 * 
 * Process:
 * 1. Extract and validate news fields
 * 2. Upload image to Cloudinary if provided
 * 3. Generate unique slug
 * 4. Save to database
 * 5. Return created news article
 */
const createNews = async (req, res) => {
  try {
    const payload = pickNewsFields(req.body);  // Extract only allowed fields
    
    // Handle image upload to Cloudinary if file provided
    if (req.file) {
      try {
        const result = await cloudinary.uploader.upload(req.file.path, {
          folder: 'manav-seva/news',      // Organize images in Cloudinary folder
          resource_type: 'image'
        });
        payload.image = result.secure_url;  // Use HTTPS URL from Cloudinary
        await cleanupTempUpload(req.file.path);  // Delete temporary file
      } catch (uploadError) {
        await cleanupTempUpload(req.file.path);  // Clean up on error
        console.error('Cloudinary upload error:', uploadError);
        return res.status(500).json({ message: 'Failed to upload image' });
      }
    }

    // Generate unique slug (handles duplicates automatically)
    payload.slug = await generateUniqueSlug(payload.title, payload.slug);
    
    // Create and save new news article
    const news = new News(payload);
    const newNews = await news.save();
    
    // Return created article with 201 status
    res.status(201).json(newNews);
  } catch (error) {
    res.status(400).json({ message: 'Invalid request data' });
  }
};

/**
 * POST /api/news/upload-image
 * Upload News Image for Rich Text Editor
 * 
 * Uploads an image to Cloudinary without creating news article.
 * Used when editors insert images within article content editor.
 * Returns image URL for embedding in content.
 * 
 * @async
 * @param {Object} req - Express request object
 * @param {File} req.file - Image file from form upload (multer)
 * @param {Object} res - Express response object
 * 
 * @returns {JSON} { imageUrl: "https://cloudinary.com/..." } (200 OK)
 * @throws {400} No image file provided
 * @throws {500} Image upload failed
 * 
 * Usage in Rich Text Editor:
 * 1. Editor detects image upload event
 * 2. Sends POST request to this endpoint
 * 3. Gets back imageUrl
 * 4. Embeds URL in content: ![alt](imageUrl)
 */
const uploadNewsImage = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'Image file is required' });
  }

  try {
    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: 'manav-seva/news',      // Store in news folder
      resource_type: 'image'
    });

    // Clean up temporary file from server
    await cleanupTempUpload(req.file.path);
    
    // Return secure HTTPS URL
    return res.status(200).json({ imageUrl: result.secure_url });
  } catch (error) {
    await cleanupTempUpload(req.file.path);  // Clean up on error
    console.error('News inline image upload error:', error.message);
    return res.status(500).json({ message: 'Failed to upload image' });
  }
};

/**
 * PUT /api/news/:id
 * Update Existing News Article
 * 
 * Updates a news article by ID.
 * Can update content and/or image.
 * Regenerates slug if title changes.
 * Deletes old image from Cloudinary if new image provided.
 * 
 * @async
 * @param {Object} req - Express request object
 * @param {string} req.params.id - MongoDB ID of news to update
 * @param {Object} req.body - Fields to update (title, slug, content, date, image)
 * @param {File} req.file - New featured image (optional)
 * @param {Object} res - Express response object
 * 
 * @returns {JSON} Updated news article object (200 OK)
 * @throws {404} News article not found
 * @throws {400} Invalid request data
 * @throws {500} Image upload failed
 * 
 * Process:
 * 1. Find existing article
 * 2. Update fields
 * 3. Upload new image to Cloudinary if provided
 * 4. Delete old image from Cloudinary if changed
 * 5. Save updated article
 * 6. Return updated article
 */
const updateNews = async (req, res) => {
  try {
    // Find existing news article
    const existingNews = await News.findById(req.params.id);
    if (!existingNews) return res.status(404).json({ message: 'News not found' });

    const payload = pickNewsFields(req.body);  // Extract allowed fields
    
    // Handle image upload if new image provided
    if (req.file) {
      try {
        const result = await cloudinary.uploader.upload(req.file.path, {
          folder: 'manav-seva/news',
          resource_type: 'image'
        });
        payload.image = result.secure_url;  // Update with new image URL
        await cleanupTempUpload(req.file.path);
      } catch (uploadError) {
        await cleanupTempUpload(req.file.path);
        console.error('Cloudinary upload error:', uploadError);
        return res.status(500).json({ message: 'Failed to upload image' });
      }
    }

    // Regenerate slug if title changed (prevents duplicate slugs)
    payload.slug = await generateUniqueSlug(
      payload.title || existingNews.title,
      payload.slug || existingNews.slug,
      req.params.id  // Current ID to skip in uniqueness check
    );

    // Update article in database
    const updatedNews = await News.findByIdAndUpdate(
      req.params.id,
      payload,
      { new: true }  // Return updated document, not original
    );
    if (!updatedNews) return res.status(404).json({ message: 'News not found' });

    // Delete old image from Cloudinary if changed
    if (updatedNews.image && existingNews.image && updatedNews.image !== existingNews.image) {
      await deleteCloudinaryImage(existingNews.image);
    }

    res.json(updatedNews);
  } catch (error) {
    res.status(400).json({ message: 'Invalid request data' });
  }
};

/**
 * DELETE /api/news/:id
 * Delete News Article
 * 
 * Permanently deletes a news article by ID.
 * Also deletes featured image from Cloudinary.
 * 
 * @async
 * @param {Object} req - Express request object
 * @param {string} req.params.id - MongoDB ID of news to delete
 * @param {Object} res - Express response object
 * 
 * @returns {JSON} { message: "News deleted" } (200 OK)
 * @throws {404} News article not found
 * @throws {500} Internal Server Error
 * 
 * Process:
 * 1. Find and delete article from database
 * 2. Delete featured image from Cloudinary
 * 3. Return success message
 */
const deleteNews = async (req, res) => {
  try {
    // Find and delete article
    const deletedNews = await News.findByIdAndDelete(req.params.id);
    if (!deletedNews) return res.status(404).json({ message: 'News not found' });

    // Delete featured image from Cloudinary
    await deleteCloudinaryImage(deletedNews.image);

    res.json({ message: 'News deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

// ==================== EXPORTS ====================
module.exports = {
  getAllNews,
  getNewsSummary,
  getNewsById,
  getNewsBySlug,
  createNews,
  uploadNewsImage,
  updateNews,
  deleteNews,
};

