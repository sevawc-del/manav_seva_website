const crypto = require('crypto');
const DonationIntent = require('../models/DonationIntent');
const Donation = require('../models/Donation');
const ReceiptCounter = require('../models/ReceiptCounter');
const RazorpayWebhookEvent = require('../models/RazorpayWebhookEvent');
const { createOrder, verifyWebhookSignature } = require('../services/razorpayService');
const { getResolvedDonationSettings } = require('../services/donationSettingsService');
const { generate80GCertificatePdf } = require('../utils/generate80GCertificatePdf');
const {
  sendDonationNotificationToNgo,
  sendThankYouEmailToDonor
} = require('../utils/donationEmailService');

const PAN_REGEX = /^[A-Z]{5}[0-9]{4}[A-Z]$/;
const MOBILE_REGEX = /^[6-9][0-9]{9}$/;
const REQUIRED_DONATION_SETTINGS_FIELDS = [
  'ngoName',
  'ngoAddress',
  'ngoPan',
  'eightyGRegistrationNumber',
  'ngoNotificationEmail',
  'authorizedSignatoryName',
  'authorizedSignatureImageUrl'
];

const buildRazorpayReceipt = () => {
  const value = `dn_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
  return value.slice(0, 40);
};

const getNextReceiptNumber = async () => {
  const now = new Date();
  const year = now.getFullYear();
  const counter = await ReceiptCounter.findOneAndUpdate(
    { key: `donation_receipt_${year}` },
    { $inc: { seq: 1 } },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );

  return `MSI-${year}-${String(counter.seq).padStart(6, '0')}`;
};

const validateDonationPayload = ({ donorName, email, mobileNumber, pan, amount }) => {
  if (!donorName || !email || !mobileNumber || !pan || amount === undefined) {
    return 'Donor name, email, mobile number, PAN and amount are required';
  }

  const normalizedPan = String(pan).trim().toUpperCase();
  if (!PAN_REGEX.test(normalizedPan)) {
    return 'Invalid PAN format';
  }

  const normalizedMobile = String(mobileNumber).trim();
  if (!MOBILE_REGEX.test(normalizedMobile)) {
    return 'Invalid Indian mobile number';
  }

  const parsedAmount = Number(amount);
  if (!Number.isFinite(parsedAmount) || parsedAmount < 1) {
    return 'Donation amount must be at least 1 INR';
  }

  return null;
};

const getMissingDonationSettingsFields = (settings = {}) => {
  return REQUIRED_DONATION_SETTINGS_FIELDS.filter((field) => !String(settings[field] || '').trim());
};

const createDonationOrder = async (req, res) => {
  try {
    const { donorName, email, mobileNumber, pan, amount } = req.body;
    const validationError = validateDonationPayload({ donorName, email, mobileNumber, pan, amount });
    if (validationError) {
      return res.status(400).json({ message: validationError });
    }

    const settings = await getResolvedDonationSettings();
    const missingSettingsFields = getMissingDonationSettingsFields(settings);
    if (missingSettingsFields.length > 0) {
      return res.status(503).json({
        message: 'Donation settings are incomplete. Please contact support.',
        missingFields: missingSettingsFields
      });
    }

    const normalizedAmount = Number(amount);
    const amountInPaise = Math.round(normalizedAmount * 100);
    const normalizedPan = String(pan).trim().toUpperCase();
    const normalizedMobile = String(mobileNumber).trim();
    const normalizedEmail = String(email).trim().toLowerCase();
    const orderReceipt = buildRazorpayReceipt();

    const order = await createOrder({
      amountInPaise,
      receipt: orderReceipt,
      notes: {
        donorName: String(donorName).trim(),
        donorEmail: normalizedEmail
      }
    });

    await DonationIntent.create({
      donorName: String(donorName).trim(),
      email: normalizedEmail,
      mobileNumber: normalizedMobile,
      pan: normalizedPan,
      amount: normalizedAmount,
      amountInPaise,
      currency: order.currency,
      razorpayOrderId: order.id,
      razorpayOrderReceipt: orderReceipt,
      status: 'pending'
    });

    return res.status(201).json({
      keyId: process.env.RAZORPAY_KEY_ID,
      orderId: order.id,
      amountInPaise: order.amount,
      currency: order.currency
    });
  } catch (error) {
    console.error('Create donation order error:', error.message);
    return res.status(500).json({ message: 'Failed to create donation order' });
  }
};

const processSuccessfulPayment = async ({ eventId, eventType, paymentEntity, webhookEvent }) => {
  const razorpayOrderId = paymentEntity.order_id;
  const razorpayPaymentId = paymentEntity.id;
  const currency = paymentEntity.currency;
  const amountInPaise = Number(paymentEntity.amount);
  const method = paymentEntity.method || '';

  webhookEvent.razorpayOrderId = razorpayOrderId || '';
  webhookEvent.razorpayPaymentId = razorpayPaymentId || '';

  const intent = await DonationIntent.findOne({ razorpayOrderId });
  if (!intent) {
    webhookEvent.status = 'ignored';
    webhookEvent.errorMessage = `No donation intent found for order ${razorpayOrderId}`;
    webhookEvent.processedAt = new Date();
    await webhookEvent.save();
    return;
  }

  if (intent.amountInPaise !== amountInPaise || intent.currency !== currency) {
    webhookEvent.status = 'error';
    webhookEvent.errorMessage = 'Captured payment amount or currency mismatch';
    webhookEvent.processedAt = new Date();
    await webhookEvent.save();
    return;
  }

  const existingDonation = await Donation.findOne({
    $or: [{ razorpayPaymentId }, { razorpayOrderId }]
  });
  if (existingDonation) {
    intent.status = 'paid';
    intent.paidAt = existingDonation.paymentCapturedAt;
    intent.lastWebhookEventId = eventId;
    await intent.save();

    webhookEvent.status = 'processed';
    webhookEvent.processedAt = new Date();
    await webhookEvent.save();
    return;
  }

  const settings = await getResolvedDonationSettings();
  const receiptNumber = await getNextReceiptNumber();
  const paymentCapturedAt = paymentEntity.captured_at
    ? new Date(Number(paymentEntity.captured_at) * 1000)
    : new Date();

  let certificateBuffer = null;
  let certificateFileName = '';
  let certificateStatus = 'issued';
  let certificateError = '';

  try {
    const certificate = await generate80GCertificatePdf({
      receiptNumber,
      donationDate: paymentCapturedAt,
      donorName: intent.donorName,
      donorPan: intent.pan,
      amount: intent.amount,
      ngoName: settings.ngoName,
      ngoAddress: settings.ngoAddress,
      ngoPan: settings.ngoPan,
      eightyGRegistrationNumber: settings.eightyGRegistrationNumber,
      authorizedSignatoryName: settings.authorizedSignatoryName,
      authorizedSignatureImageUrl: settings.authorizedSignatureImageUrl
    });
    certificateBuffer = certificate.buffer;
    certificateFileName = certificate.fileName;
  } catch (error) {
    certificateStatus = 'failed';
    certificateError = `PDF generation failed: ${error.message}`;
  }

  const donation = await Donation.create({
    receiptNumber,
    donorName: intent.donorName,
    email: intent.email,
    mobileNumber: intent.mobileNumber,
    pan: intent.pan,
    amount: intent.amount,
    amountInPaise: intent.amountInPaise,
    currency: intent.currency,
    razorpayOrderId,
    razorpayPaymentId,
    paymentMethod: method,
    paymentCapturedAt,
    webhookEventId: eventId,
    certificateStatus,
    certificateIssuedAt: new Date(),
    certificateFileName,
    certificateError,
    ngoSnapshot: {
      ngoName: settings.ngoName,
      ngoAddress: settings.ngoAddress,
      ngoPan: settings.ngoPan,
      eightyGRegistrationNumber: settings.eightyGRegistrationNumber,
      authorizedSignatoryName: settings.authorizedSignatoryName
    }
  });

  intent.status = 'paid';
  intent.paidAt = paymentCapturedAt;
  intent.lastWebhookEventId = eventId;
  await intent.save();

  try {
    if (settings.ngoNotificationEmail) {
      await sendDonationNotificationToNgo({
        ngoEmail: settings.ngoNotificationEmail,
        donation
      });
    }

    if (certificateBuffer) {
      await sendThankYouEmailToDonor({
        donation,
        ngoName: settings.ngoName || 'NGO',
        certificateFileName,
        certificatePdfBuffer: certificateBuffer
      });
    }
  } catch (error) {
    donation.certificateStatus = 'failed';
    donation.certificateError = `Email dispatch failed: ${error.message}`;
    await donation.save();
  }

  webhookEvent.status = 'processed';
  webhookEvent.processedAt = new Date();
  webhookEvent.errorMessage = eventType;
  await webhookEvent.save();
};

const processFailedPayment = async ({ eventId, paymentEntity, webhookEvent }) => {
  const razorpayOrderId = paymentEntity?.order_id || '';
  const failureDescription = paymentEntity?.error_description || 'Payment failed';

  webhookEvent.razorpayOrderId = razorpayOrderId;
  webhookEvent.razorpayPaymentId = paymentEntity?.id || '';
  webhookEvent.status = 'processed';
  webhookEvent.processedAt = new Date();

  if (!razorpayOrderId) {
    webhookEvent.errorMessage = 'Missing order id in payment.failed event';
    await webhookEvent.save();
    return;
  }

  await DonationIntent.findOneAndUpdate(
    { razorpayOrderId },
    {
      status: 'failed',
      failureReason: failureDescription,
      lastWebhookEventId: eventId
    }
  );

  webhookEvent.errorMessage = failureDescription;
  await webhookEvent.save();
};

const handleRazorpayWebhook = async (req, res) => {
  const signature = req.header('x-razorpay-signature');
  if (!signature) {
    return res.status(400).json({ message: 'Missing webhook signature' });
  }

  try {
    const rawBody = req.rawBody || Buffer.from(JSON.stringify(req.body));
    const isVerified = verifyWebhookSignature({ rawBody, signature });
    if (!isVerified) {
      return res.status(401).json({ message: 'Invalid webhook signature' });
    }

    const payload = req.body;
    const eventId = payload?.id;
    const eventType = payload?.event;

    if (!eventId || !eventType) {
      return res.status(400).json({ message: 'Malformed webhook payload' });
    }

    const existingEvent = await RazorpayWebhookEvent.findOne({ eventId });
    if (existingEvent) {
      return res.status(200).json({ message: 'Already processed' });
    }

    const payloadHash = crypto.createHash('sha256').update(rawBody).digest('hex');
    const webhookEvent = await RazorpayWebhookEvent.create({
      eventId,
      eventType,
      signature,
      payloadHash,
      status: 'received',
      rawPayload: payload
    });

    if (eventType === 'payment.captured' || eventType === 'order.paid') {
      const paymentEntity = payload?.payload?.payment?.entity;
      if (!paymentEntity || paymentEntity.status !== 'captured') {
        webhookEvent.status = 'ignored';
        webhookEvent.errorMessage = 'Payment entity missing or not captured';
        webhookEvent.processedAt = new Date();
        await webhookEvent.save();
        return res.status(200).json({ message: 'Ignored' });
      }

      await processSuccessfulPayment({
        eventId,
        eventType,
        paymentEntity,
        webhookEvent
      });
      return res.status(200).json({ message: 'Processed' });
    }

    if (eventType === 'payment.failed') {
      await processFailedPayment({
        eventId,
        paymentEntity: payload?.payload?.payment?.entity,
        webhookEvent
      });
      return res.status(200).json({ message: 'Processed failure event' });
    }

    webhookEvent.status = 'ignored';
    webhookEvent.errorMessage = `Unsupported event ${eventType}`;
    webhookEvent.processedAt = new Date();
    await webhookEvent.save();
    return res.status(200).json({ message: 'Ignored' });
  } catch (error) {
    console.error('Webhook processing error:', error.message);
    return res.status(500).json({ message: 'Webhook processing failed' });
  }
};

const getDonationStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const email = String(req.query.email || '').trim().toLowerCase();
    const intent = await DonationIntent.findOne({ razorpayOrderId: orderId });

    if (!intent) {
      return res.status(404).json({ message: 'Donation not found' });
    }

    if (email && intent.email !== email) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    if (intent.status === 'paid') {
      const donation = await Donation.findOne({ razorpayOrderId: orderId }).lean();
      return res.json({
        status: 'paid',
        receiptNumber: donation?.receiptNumber || null,
        paymentDate: donation?.paymentCapturedAt || intent.paidAt || null
      });
    }

    if (intent.status === 'failed') {
      return res.json({
        status: 'failed',
        reason: intent.failureReason || 'Payment failed'
      });
    }

    return res.json({ status: 'pending' });
  } catch (error) {
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

const maskPan = (pan = '') => {
  const value = String(pan || '').toUpperCase();
  if (value.length !== 10) return value;
  return `${value.slice(0, 3)}XXXX${value.slice(-3)}`;
};

const buildDateRangeFilter = (dateFrom, dateTo) => {
  const hasFrom = !!dateFrom;
  const hasTo = !!dateTo;
  if (!hasFrom && !hasTo) return null;

  const range = {};
  if (hasFrom) {
    const fromDate = new Date(dateFrom);
    if (!Number.isNaN(fromDate.getTime())) {
      range.$gte = fromDate;
    }
  }
  if (hasTo) {
    const toDate = new Date(dateTo);
    if (!Number.isNaN(toDate.getTime())) {
      toDate.setHours(23, 59, 59, 999);
      range.$lte = toDate;
    }
  }
  return Object.keys(range).length ? range : null;
};

const getDonationsAdmin = async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 20, 1), 100);
    const skip = (page - 1) * limit;

    const status = String(req.query.status || '').trim().toLowerCase();
    const certificateStatus = String(req.query.certificateStatus || '').trim().toLowerCase();
    const q = String(req.query.q || '').trim();
    const dateFrom = req.query.dateFrom;
    const dateTo = req.query.dateTo;

    const filter = {};
    if (status === 'issued' || status === 'failed') {
      filter.certificateStatus = status;
    }
    if (certificateStatus === 'issued' || certificateStatus === 'failed') {
      filter.certificateStatus = certificateStatus;
    }

    const dateRange = buildDateRangeFilter(dateFrom, dateTo);
    if (dateRange) {
      filter.paymentCapturedAt = dateRange;
    }

    if (q) {
      const searchRegex = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      filter.$or = [
        { receiptNumber: searchRegex },
        { donorName: searchRegex },
        { email: searchRegex },
        { mobileNumber: searchRegex },
        { pan: searchRegex },
        { razorpayPaymentId: searchRegex },
        { razorpayOrderId: searchRegex }
      ];
    }

    const [items, total] = await Promise.all([
      Donation.find(filter)
        .sort({ paymentCapturedAt: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Donation.countDocuments(filter)
    ]);

    const sanitizedItems = items.map((item) => ({
      ...item,
      panMasked: maskPan(item.pan),
      pan: undefined
    }));

    return res.json({
      items: sanitizedItems,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.max(Math.ceil(total / limit), 1)
      }
    });
  } catch (error) {
    console.error('Admin donations fetch error:', error.message);
    return res.status(500).json({ message: 'Failed to fetch donations' });
  }
};

module.exports = {
  createDonationOrder,
  handleRazorpayWebhook,
  getDonationStatus,
  getDonationsAdmin
};
