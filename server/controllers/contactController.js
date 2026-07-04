/**
 * CONTACT CONTROLLER
 *
 * Handles contact form submissions from the website.
 * Processes user inquiries and sends them via email to the organization.
 * Uses the email utility functions for SMTP integration.
 *
 * Routes handled:
 * - POST /api/contact - Send contact message
 *
 * Features:
 * - Email validation and formatting
 * - Reply-to functionality for easy responses
 * - Error handling for email delivery failures
 * - Configurable receiver email address
 */

// ==================== IMPORTS ====================
const sendEmail = require('../utils/sendEmail');
const { getContactReceiverAddress } = require('../utils/mailer');

// ==================== CONTROLLER FUNCTIONS ====================

/**
 * SEND CONTACT MESSAGE
 *
 * Processes contact form submissions and sends them as emails.
 * Creates a formatted email with the user's name, email, and message.
 * Sets reply-to header so responses go directly to the sender.
 *
 * @route POST /api/contact
 * @access Public
 * @param {Object} req.body
 * @param {string} req.body.name - Sender's full name
 * @param {string} req.body.email - Sender's email address
 * @param {string} req.body.message - Contact message content
 * @returns {Object} Success message
 * @returns {500} If email sending fails or receiver not configured
 *
 * Email Format:
 * Subject: "New Contact Message"
 * Reply-To: sender's email
 * Body: Formatted text with name, email, and message
 */
const sendContactMessage = async (req, res) => {
  const { name, email, message } = req.body;
  try {
    // Get configured receiver email address
    const receiver = getContactReceiverAddress();
    if (!receiver) {
      throw new Error('Contact receiver email is not configured');
    }

    // Send formatted email
    await sendEmail({
      to: receiver,
      subject: 'New Contact Message',
      replyTo: email,  // Allows direct replies to sender
      text: `Name: ${name}\nEmail: ${email}\nMessage: ${message}`,
    });

    res.json({ message: 'Message sent successfully' });
  } catch (error) {
    console.error('Contact email send failed:', error.message);
    res.status(500).json({ message: 'Unable to send message right now. Please try again later.' });
  }
};

// ==================== EXPORTS ====================
module.exports = {
  sendContactMessage,
};

