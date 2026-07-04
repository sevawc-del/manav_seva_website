/**
 * ACTIVITY ROUTES
 * 
 * Defines API endpoints for managing activities/programs.
 * Activities are core organizational initiatives (e.g., health campaigns, education programs).
 * 
 * Base URL: /api
 * 
 * Endpoints:
 * - GET /activities             - Fetch all activities (public)
 * - GET /activities/:id/presence - Fetch activity presence (geographic data)
 * - POST /admin/activity        - Create new activity (admin-only)
 * 
 * Note: This routes module is mounted at /api, so paths are relative to that
 */

// ==================== IMPORTS ====================
const express = require('express');
const router = express.Router();

// Import activity controller functions
const { 
  getActivities, 
  getActivityPresence, 
  createActivity 
} = require('../controllers/activityController');

// Import authentication middleware
const { protect, admin } = require('../middleware/authMiddleware');

// ==================== PUBLIC ROUTES ====================

/**
 * GET /api/activities
 * Fetch All Activities
 * 
 * Returns all active organizational activities/programs.
 * Displayed on the "Our Work" or "Activities" page of the website.
 * Public endpoint (no authentication required).
 * 
 * Response: Array of activity objects
 * Example:
 *   [
 *     {
 *       _id: "...",
 *       name: "Health Campaigns",
 *       slug: "health-campaigns",
 *       description: "...",
 *       content: "...",
 *       image: "https://cloudinary.com/...",
 *       isActive: true,
 *       order: 0
 *     },
 *     ...
 *   ]
 */
router.get('/', getActivities);

/**
 * GET /api/activities/:id/presence
 * Fetch Activity Geographic Presence
 * 
 * Retrieves geographic data for an activity (regions/states where active).
 * Used for displaying activity on interactive map (D3.js + TopoJSON).
 * Shows which areas of India are affected by/have presence in this activity.
 * Public endpoint (no authentication required).
 * 
 * URL Parameter:
 * - id: MongoDB ObjectID of activity
 * 
 * Response: Geographic presence data for the activity
 * Example:
 *   {
 *     _id: "...",
 *     activity: "activity_id",
 *     presence: [
 *       { state: "Maharashtra", beneficiaries: 1000, status: "active" },
 *       { state: "Gujarat", beneficiaries: 500, status: "planned" },
 *       ...
 *     ]
 *   }
 */
router.get('/:id/presence', getActivityPresence);

// ==================== ADMIN ROUTES ====================

/**
 * POST /api/admin/activity
 * Create New Activity
 * 
 * Creates a new organizational activity/program.
 * Only accessible to authenticated admin users.
 * 
 * Authentication: Required (admin only)
 * Middleware: protect (JWT token check), admin (admin role check)
 * 
 * Request Body:
 * - name: Activity name (required)
 * - slug: URL slug (optional, auto-generated from name)
 * - description: Short description (required)
 * - content: Full description/content (required)
 * - image: Featured image URL (optional)
 * - isActive: Show on website (optional, defaults to true)
 * - order: Display order (optional, defaults to 0)
 * 
 * Response: Created activity object (201 Created)
 * Example:
 *   {
 *     _id: "new_id",
 *     name: "Health Campaigns",
 *     slug: "health-campaigns",
 *     description: "...",
 *     content: "...",
 *     image: "...",
 *     isActive: true,
 *     order: 0,
 *     createdAt: "...",
 *     updatedAt: "..."
 *   }
 * 
 * Error Responses:
 * - 400: Invalid request data
 * - 401: Not authenticated (no JWT token)
 * - 403: Not admin (insufficient permissions)
 */
router.post('/admin/activity', protect, admin, createActivity);

// ==================== EXPORTS ====================
module.exports = router;
