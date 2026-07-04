/**
 * INPUT VALIDATION MIDDLEWARE
 * 
 * Validates user input for various API endpoints.
 * Runs BEFORE controllers to ensure data integrity.
 * Returns 400 Bad Request if validation fails.
 * 
 * Checks:
 * - Required fields are present
 * - String values are non-empty and within length limits
 * - Email format is valid using regex pattern
 */

// ==================== VALIDATION PATTERNS ====================

/**
 * Email Validation Regex Pattern
 * 
 * Matches basic email format: something@something.something
 * Format: {non-whitespace}@{non-whitespace}.{non-whitespace}
 * 
 * Note: For production, consider using a library like email-validator
 * This regex is simple but not RFC 5322 compliant
 */
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// ==================== HELPER FUNCTIONS ====================

/**
 * Validates if value is a non-empty string within specified length range
 * 
 * @param {any} value - Value to validate
 * @param {number} min - Minimum string length (default: 1)
 * @param {number} max - Maximum string length (default: 2000)
 * 
 * @returns {boolean} - True if value is valid string within bounds, false otherwise
 * 
 * Example:
 *   isNonEmptyString("hello", 1, 10)  // true
 *   isNonEmptyString("  ", 1, 10)    // false (only whitespace)
 *   isNonEmptyString("toolong", 1, 5)  // false (exceeds max length)
 */
const isNonEmptyString = (value, min = 1, max = 2000) =>
  typeof value === 'string' && value.trim().length >= min && value.trim().length <= max;

// ==================== VALIDATION MIDDLEWARE FUNCTIONS ====================

/**
 * Validate User Registration Input
 * 
 * Checks username, email, and password meet requirements.
 * 
 * Requirements:
 * - username: 3-50 characters
 * - email: 5-254 characters, valid email format
 * - password: 8-128 characters
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * 
 * Returns error if validation fails, calls next() if valid
 */
const validateRegister = (req, res, next) => {
  const { username, email, password } = req.body;
  
  // Validate username length
  if (!isNonEmptyString(username, 3, 50)) {
    return res.status(400).json({ message: 'Username must be between 3 and 50 characters' });
  }
  
  // Validate email format and length
  if (!isNonEmptyString(email, 5, 254) || !emailPattern.test(email)) {
    return res.status(400).json({ message: 'A valid email is required' });
  }
  
  // Validate password strength (must be at least 8 characters)
  if (!isNonEmptyString(password, 8, 128)) {
    return res.status(400).json({ message: 'Password must be between 8 and 128 characters' });
  }
  
  // All validations passed, proceed to controller
  next();
};

/**
 * Validate User Login Input
 * 
 * Checks email and password are provided and valid.
 * 
 * Requirements:
 * - email: 5-254 characters, valid email format
 * - password: at least 1 character (actual auth happens in controller)
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const validateLogin = (req, res, next) => {
  const { email, password } = req.body;
  
  // Validate email format and length
  if (!isNonEmptyString(email, 5, 254) || !emailPattern.test(email)) {
    return res.status(400).json({ message: 'A valid email is required' });
  }
  
  // Validate password is provided (length checked by controller during bcrypt comparison)
  if (!isNonEmptyString(password, 1, 128)) {
    return res.status(400).json({ message: 'Password is required' });
  }
  
  // All validations passed
  next();
};

/**
 * Validate Contact Form Input
 * 
 * Validates fields submitted via contact form on public website.
 * 
 * Requirements:
 * - name: 2-100 characters
 * - email: 5-254 characters, valid format
 * - message: 5-5000 characters
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const validateContact = (req, res, next) => {
  const { name, email, message } = req.body;
  
  // Validate name
  if (!isNonEmptyString(name, 2, 100)) {
    return res.status(400).json({ message: 'Name must be between 2 and 100 characters' });
  }
  
  // Validate email
  if (!isNonEmptyString(email, 5, 254) || !emailPattern.test(email)) {
    return res.status(400).json({ message: 'A valid email is required' });
  }
  
  // Validate message body
  if (!isNonEmptyString(message, 5, 5000)) {
    return res.status(400).json({ message: 'Message must be between 5 and 5000 characters' });
  }
  
  next();
};

/**
 * Validate Testimonial/Feedback Input
 * 
 * Validates user testimonial for display on website.
 * 
 * Requirements:
 * - name: 2-100 characters (required)
 * - email: 5-254 characters, valid format (required)
 * - quote: 5-3000 characters (required feedback text)
 * - designation: 2-120 characters (optional - job title)
 * - location: 2-120 characters (optional - city/region)
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const validateTestimonial = (req, res, next) => {
  const { name, email, quote, designation, location } = req.body;

  // Validate name (required)
  if (!isNonEmptyString(name, 2, 100)) {
    return res.status(400).json({ message: 'Name must be between 2 and 100 characters' });
  }

  // Validate email (required)
  if (!isNonEmptyString(email, 5, 254) || !emailPattern.test(email)) {
    return res.status(400).json({ message: 'A valid email is required' });
  }

  // Validate testimonial quote/feedback (required)
  if (!isNonEmptyString(quote, 5, 3000)) {
    return res.status(400).json({ message: 'Feedback must be between 5 and 3000 characters' });
  }

  // Validate designation if provided (optional field)
  if (designation && !isNonEmptyString(designation, 2, 120)) {
    return res.status(400).json({ message: 'Designation must be between 2 and 120 characters' });
  }

  // Validate location if provided (optional field)
  if (location && !isNonEmptyString(location, 2, 120)) {
    return res.status(400).json({ message: 'Location must be between 2 and 120 characters' });
  }

  next();
};

// ==================== EXPORTS ====================
module.exports = {
  validateRegister,
  validateLogin,
  validateContact,
  validateTestimonial
};
