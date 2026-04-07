// Send Email Utility
const { getFromAddress, getTransporter } = require('./mailer');

const sendEmail = async (options = {}) => {
  const to = String(options.to || '').trim();
  const subject = String(options.subject || '').trim();
  const text = typeof options.text === 'string' ? options.text : '';
  const html = typeof options.html === 'string' ? options.html : '';

  if (!to) {
    throw new Error('Email recipient is required');
  }
  if (!subject) {
    throw new Error('Email subject is required');
  }
  if (!text && !html) {
    throw new Error('Email text or html content is required');
  }

  const from = String(options.from || getFromAddress() || '').trim();
  if (!from) {
    throw new Error('Email sender address is not configured');
  }

  const transporter = getTransporter();
  const mailOptions = {
    from,
    to,
    subject,
    text: text || undefined,
    html: html || undefined,
    replyTo: options.replyTo || undefined,
    cc: options.cc || undefined,
    bcc: options.bcc || undefined,
    attachments: options.attachments || undefined
  };

  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
