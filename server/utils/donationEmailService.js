const nodemailer = require('nodemailer');

let transporter;

const getTransporter = () => {
  if (transporter) return transporter;

  const { SMTP_HOST, SMTP_PORT, SMTP_SECURE, SMTP_USER, SMTP_PASS } = process.env;
  if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS) {
    throw new Error('SMTP_HOST, SMTP_PORT, SMTP_USER and SMTP_PASS are required');
  }

  transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT),
    secure: String(SMTP_SECURE || 'false') === 'true',
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS
    }
  });

  return transporter;
};

const getFromAddress = () => {
  return process.env.SMTP_FROM || process.env.SMTP_USER;
};

const sendDonationNotificationToNgo = async ({ ngoEmail, donation }) => {
  const mailer = getTransporter();
  await mailer.sendMail({
    from: getFromAddress(),
    to: ngoEmail,
    subject: `New Donation Received - ${donation.receiptNumber}`,
    text: [
      'A new donation has been successfully captured.',
      '',
      `Receipt: ${donation.receiptNumber}`,
      `Donor: ${donation.donorName}`,
      `Email: ${donation.email}`,
      `Mobile: ${donation.mobileNumber}`,
      `PAN: ${donation.pan}`,
      `Amount: INR ${donation.amount.toFixed(2)}`,
      `Payment ID: ${donation.razorpayPaymentId}`,
      `Order ID: ${donation.razorpayOrderId}`,
      `Date: ${new Date(donation.paymentCapturedAt).toISOString()}`
    ].join('\n')
  });
};

const sendThankYouEmailToDonor = async ({ donation, ngoName, certificateFileName, certificatePdfBuffer }) => {
  const mailer = getTransporter();
  await mailer.sendMail({
    from: getFromAddress(),
    to: donation.email,
    subject: `Thank you for your donation - Receipt ${donation.receiptNumber}`,
    text: [
      `Dear ${donation.donorName},`,
      '',
      `Thank you for your generous donation of INR ${donation.amount.toFixed(2)} to ${ngoName}.`,
      `Your receipt number is ${donation.receiptNumber}.`,
      '',
      'Please find your 80G certificate attached.',
      '',
      'Warm regards,',
      ngoName
    ].join('\n'),
    attachments: [
      {
        filename: certificateFileName,
        content: certificatePdfBuffer
      }
    ]
  });
};

module.exports = {
  sendDonationNotificationToNgo,
  sendThankYouEmailToDonor
};
