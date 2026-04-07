// Contact Controller
const sendEmail = require('../utils/sendEmail');
const { getContactReceiverAddress } = require('../utils/mailer');

const sendContactMessage = async (req, res) => {
  const { name, email, message } = req.body;
  try {
    const receiver = getContactReceiverAddress();
    if (!receiver) {
      throw new Error('Contact receiver email is not configured');
    }

    await sendEmail({
      to: receiver,
      subject: 'New Contact Message',
      replyTo: email,
      text: `Name: ${name}\nEmail: ${email}\nMessage: ${message}`,
    });
    res.json({ message: 'Message sent successfully' });
  } catch (error) {
    console.error('Contact email send failed:', error.message);
    res.status(500).json({ message: 'Unable to send message right now. Please try again later.' });
  }
};

module.exports = {
  sendContactMessage,
};

