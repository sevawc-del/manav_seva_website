// Contact Controller
const sendEmail = require('../utils/sendEmail');

const sendContactMessage = async (req, res) => {
  const { name, email, message } = req.body;
  try {
    await sendEmail({
      to: process.env.ADMIN_EMAIL,
      subject: 'New Contact Message',
      text: `Name: ${name}\nEmail: ${email}\nMessage: ${message}`,
    });
    res.json({ message: 'Message sent successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

module.exports = {
  sendContactMessage,
};

