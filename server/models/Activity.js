/**
 * ACTIVITY MODEL
 * 
 * Defines the Activity schema for managing organizational activities and initiatives.
 * Activities are core programs/projects that Manav Seva implements.
 * 
 * Schema:
 * - name: Activity name/title
 * - slug: URL-friendly identifier for routing
 * - description: Short summary of the activity
 * - content: Detailed rich-text content
 * - image: Featured image URL from Cloudinary
 * - isActive: Toggle visibility on website
 * - order: Sort order for display
 * - timestamps: Created and updated dates
 */

// ==================== IMPORTS ====================
const mongoose = require('mongoose');

// ==================== SCHEMA DEFINITION ====================

/**
 * Activity Schema
 * 
 * Fields:
 * - name (String, required): Activity name/title (e.g., "Health Campaigns")
 * - slug (String, required, unique): URL-friendly identifier
 *   Example: "health-campaigns" (used in URL: /activities/health-campaigns)
 * - description (String, required): Brief summary of the activity
 * - content (String, required): Detailed rich-text content (can be HTML/Markdown)
 * - image (String): Featured/header image URL from Cloudinary CDN
 * - isActive (Boolean, default=true): Controls visibility on public website
 * - order (Number, default=0): Display order when listing activities (lower number = higher position)
 * - createdAt (Date, default=now): When activity was created
 * - updatedAt (Date, default=now): When activity was last modified
 */
const activitySchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true              // Activity must have a name
  },
  slug: { 
    type: String, 
    required: true,             // URL slug is required
    unique: true                // Each activity has a unique slug
  },
  description: { 
    type: String, 
    required: true              // Brief description is required
  },
  content: { 
    type: String, 
    required: true              // Detailed content is required (Rich text content)
  },
  image: { 
    type: String                // Featured image URL (optional)
  },
  isActive: { 
    type: Boolean, 
    default: true               // Activities are visible by default
  },
  order: { 
    type: Number, 
    default: 0                  // Used for sorting; lower numbers appear first
  },
  createdAt: { 
    type: Date, 
    default: Date.now           // Auto-set when created
  },
  updatedAt: { 
    type: Date, 
    default: Date.now           // Should be updated each time activity is modified
  }
});

// ==================== EXPORTS ====================
// Create and export the Activity model
module.exports = mongoose.model('Activity', activitySchema);
