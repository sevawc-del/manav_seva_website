const crypto = require('crypto');
const Razorpay = require('razorpay');

const assertRazorpayConfig = () => {
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    throw new Error('RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET are required');
  }
};

const getRazorpayClient = () => {
  assertRazorpayConfig();
  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
  });
};

const createOrder = async ({ amountInPaise, receipt, notes }) => {
  const razorpay = getRazorpayClient();
  return razorpay.orders.create({
    amount: amountInPaise,
    currency: 'INR',
    receipt,
    payment_capture: 1,
    notes
  });
};

const verifyWebhookSignature = ({ rawBody, signature }) => {
  if (!process.env.RAZORPAY_WEBHOOK_SECRET) {
    throw new Error('RAZORPAY_WEBHOOK_SECRET is required');
  }
  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET)
    .update(rawBody)
    .digest('hex');

  const expected = Buffer.from(expectedSignature, 'utf8');
  const received = Buffer.from(signature || '', 'utf8');
  if (expected.length !== received.length) return false;

  return crypto.timingSafeEqual(expected, received);
};

module.exports = {
  createOrder,
  verifyWebhookSignature
};
