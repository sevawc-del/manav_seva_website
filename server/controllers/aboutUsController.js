/**
 * ABOUT US CONTROLLER
 *
 * Controller for managing About Us page content and operations.
 * Handles CRUD operations for organizational information including
 * mission, vision, and content management with image uploads.
 *
 * Features:
 * - Get About Us content (with fallback defaults)
 * - Create or update About Us information
 * - Delete About Us content
 * - Upload About Us images to Cloudinary
 * - HTML sanitization for security
 * - Input validation and error handling
 */

// ==================== IMPORTS ====================
const fs = require('fs/promises');
const sanitizeHtml = require('sanitize-html');
const cloudinary = require('../config/cloudinary');
const AboutUs = require('../models/AboutUs');

// ==================== UTILITY FUNCTIONS ====================

/**
 * Cleanup temporary uploaded files
 * Removes temporary files from server after processing
 * @param {string} filePath - Path to the temporary file
 */
const cleanupTempUpload = async (filePath) => {
  if (!filePath) return;
  try {
    await fs.unlink(filePath);
  } catch (error) {
    if (error.code !== 'ENOENT') {
      console.error('Temp upload cleanup error:', error.message);
    }
  }
};

/**
 * Sanitize About Us content HTML
 * Removes dangerous HTML tags and attributes for security
 * @param {string} value - Raw HTML content
 * @returns {string} Sanitized HTML content
 */
const sanitizeAboutContent = (value = '') =>
  sanitizeHtml(String(value || ''), {
    allowedTags: [
      'p', 'br', 'strong', 'em', 'b', 'i', 'u',           // Text formatting
      'ul', 'ol', 'li',                                   // Lists
      'blockquote',                                       // Blockquotes
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6',                // Headings
      'a', 'img',                                         // Links and images
      'table', 'thead', 'tbody', 'tr', 'th', 'td',        // Tables
      'hr', 'code', 'pre'                                 // Miscellaneous
    ],
    allowedAttributes: {
      a: ['href', 'title', 'target', 'rel'],              // Link attributes
      img: ['src', 'alt', 'title', 'width', 'height', 'loading'] // Image attributes
    },
    allowedSchemes: ['http', 'https', 'mailto', 'tel'],  // Allowed URL schemes
    disallowedTagsMode: 'discard'                         // Remove disallowed tags
  });

/**
 * Sanitize and validate image URLs
 * Ensures image URLs are valid and secure
 * @param {string} value - Raw image URL
 * @returns {string} Validated image URL or empty string
 */
const sanitizeImageUrl = (value = '') => {
  const candidate = String(value || '').trim();
  if (!candidate) return '';
  if (candidate.startsWith('/')) return candidate;  // Relative URLs allowed

  try {
    const parsed = new URL(candidate);
    if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
      return parsed.toString();
    }
  } catch (error) {
    return '';  // Invalid URL
  }

  return '';
};

// ==================== CONTROLLER FUNCTIONS ====================

/**
 * Get About Us content
 * Retrieves the About Us information for display on the website
 * Returns default content if no document exists in database
 *
 * @route GET /api/about-us
 * @access Public
 * @returns {Object} About Us data with title, content, image, mission, vision
 */
const getAboutUs = async (req, res) => {
  try {
    let aboutUs = await AboutUs.findOne();
    if (!aboutUs) {
      // Return default data if no AboutUs document exists
      aboutUs = {
        title: 'About Us',
        content: 'Welcome to Manav Seva, a dedicated organization committed to serving humanity through various charitable activities. Our mission is to provide support and assistance to those in need, focusing on health, education, and empowerment initiatives. Through our programs, we strive to make a positive impact on communities and individuals, fostering a better future for all.',
        image: '',
        mission:
          'To provide comprehensive healthcare and education services to underserved communities, empowering individuals and families to lead healthier, more productive lives.',
        vision:
          'A world where every individual has access to quality healthcare and education, regardless of their socioeconomic status.'
      };
    }
    res.json(aboutUs);
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

/**
 * Create or Update About Us content
 * Creates new About Us document or updates existing one
 * Handles input sanitization and validation
 *
 * @route POST /api/about-us
 * @access Private (Admin only)
 * @param {string} title - Page title (required)
 * @param {string} content - Main content (required)
 * @param {string} image - Image URL (optional)
 * @param {string} mission - Mission statement (optional)
 * @param {string} vision - Vision statement (optional)
 * @returns {Object} Updated About Us document
 */
const createOrUpdateAboutUs = async (req, res) => {
  try {
    const { title, content, image, mission, vision } = req.body;

    // Sanitize all inputs for security
    const sanitizedTitle = String(title || '').trim();
    const sanitizedContent = sanitizeAboutContent(content);
    const sanitizedImage = sanitizeImageUrl(image);
    const sanitizedMission = sanitizeAboutContent(mission);
    const sanitizedVision = sanitizeAboutContent(vision);

    // Validate required fields
    if (!sanitizedTitle || !sanitizedContent.trim()) {
      return res.status(400).json({ message: 'Title and content are required' });
    }

    let aboutUs = await AboutUs.findOne();
    if (aboutUs) {
      // Update existing document
      aboutUs.title = sanitizedTitle;
      aboutUs.content = sanitizedContent;
      aboutUs.image = sanitizedImage;
      aboutUs.mission = sanitizedMission;
      aboutUs.vision = sanitizedVision;
      await aboutUs.save();
    } else {
      // Create new document
      aboutUs = new AboutUs({
        title: sanitizedTitle,
        content: sanitizedContent,
        image: sanitizedImage,
        mission: sanitizedMission,
        vision: sanitizedVision
      });
      await aboutUs.save();
    }
    res.json(aboutUs);
  } catch (error) {
    console.error('Error in createOrUpdateAboutUs:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

/**
 * Delete About Us content
 * Removes the About Us document from database
 *
 * @route DELETE /api/about-us
 * @access Private (Admin only)
 * @returns {Object} Success message
 */
const deleteAboutUs = async (req, res) => {
  try {
    const aboutUs = await AboutUs.findOne();
    if (!aboutUs) {
      return res.status(404).json({ message: 'AboutUs not found' });
    }
    await AboutUs.deleteOne();
    res.json({ message: 'AboutUs deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

/**
 * Upload About Us image
 * Handles image upload to Cloudinary for About Us page
 * Cleans up temporary files after upload
 *
 * @route POST /api/about-us/upload-image
 * @access Private (Admin only)
 * @param {File} file - Image file to upload
 * @returns {Object} Object with imageUrl property
 */
const uploadAboutImage = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'Image file is required' });
  }

  try {
    // Upload to Cloudinary with specific folder
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: 'manav-seva/about',
      resource_type: 'image'
    });

    // Clean up temporary file
    await cleanupTempUpload(req.file.path);

    // Return the secure URL
    return res.status(200).json({ imageUrl: result.secure_url });
  } catch (error) {
    // Clean up temporary file on error
    await cleanupTempUpload(req.file.path);
    console.error('About image upload error:', error.message);
    return res.status(500).json({ message: 'Failed to upload image' });
  }
};

// ==================== EXPORTS ====================
module.exports = {
  getAboutUs,
  createOrUpdateAboutUs,
  deleteAboutUs,
  uploadAboutImage
};

