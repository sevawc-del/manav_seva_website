import React, { useMemo, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createDonationOrder, getDonationSettings, getDonationStatus } from '../utils/api';

const PRESET_AMOUNTS = [500, 1000, 2500, 5000];
const PAN_REGEX = /^[A-Z]{5}[0-9]{4}[A-Z]$/;
const MOBILE_REGEX = /^[6-9][0-9]{9}$/;

const loadRazorpayScript = () => new Promise((resolve, reject) => {
  if (window.Razorpay) {
    resolve(true);
    return;
  }

  const existing = document.getElementById('razorpay-checkout-script');
  if (existing) {
    existing.addEventListener('load', () => resolve(true));
    existing.addEventListener('error', () => reject(new Error('Failed to load Razorpay SDK')));
    return;
  }

  const script = document.createElement('script');
  script.id = 'razorpay-checkout-script';
  script.src = 'https://checkout.razorpay.com/v1/checkout.js';
  script.async = true;
  script.onload = () => resolve(true);
  script.onerror = () => reject(new Error('Failed to load Razorpay SDK'));
  document.body.appendChild(script);
});

const fallbackConfig = {
  ngoName: '',
  ngoAddress: '',
  ngoPan: '',
  eightyGRegistrationNumber: '',
  upiId: '',
  bankName: '',
  accountName: '',
  accountNumber: '',
  ifsc: '',
  branch: '',
  qrImageUrl: '',
  paymentUrl: '',
  taxNote: ''
};

const mergeWithFallback = (apiData = {}) => {
  const merged = { ...fallbackConfig };
  Object.keys(merged).forEach((key) => {
    const value = apiData[key];
    if (typeof value === 'string') {
      merged[key] = value.trim();
    } else if (value !== undefined && value !== null) {
      merged[key] = value;
    }
  });
  return merged;
};

const Donate = () => {
  const [donationConfig, setDonationConfig] = useState(fallbackConfig);
  const [loadingConfig, setLoadingConfig] = useState(true);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [statusType, setStatusType] = useState('info');
  const [formData, setFormData] = useState({
    donorName: '',
    email: '',
    mobileNumber: '',
    pan: '',
    amountType: 'preset',
    presetAmount: PRESET_AMOUNTS[1],
    customAmount: ''
  });

  useEffect(() => {
    const fetchDonationSettings = async () => {
      try {
        const response = await getDonationSettings();
        setDonationConfig(mergeWithFallback(response.data));
      } catch (error) {
        console.error('Failed to load donation settings:', error);
        setDonationConfig(fallbackConfig);
      } finally {
        setLoadingConfig(false);
      }
    };
    fetchDonationSettings();
  }, []);

  const selectedAmount = useMemo(() => {
    if (formData.amountType === 'custom') {
      return Number(formData.customAmount);
    }
    return Number(formData.presetAmount);
  }, [formData.amountType, formData.customAmount, formData.presetAmount]);

  const validateForm = () => {
    if (!formData.donorName.trim()) return 'Donor name is required';
    if (!formData.email.trim()) return 'Email is required';
    if (!MOBILE_REGEX.test(formData.mobileNumber.trim())) return 'Enter a valid Indian mobile number';
    if (!PAN_REGEX.test(formData.pan.trim().toUpperCase())) return 'Enter a valid PAN (e.g. ABCDE1234F)';
    if (!Number.isFinite(selectedAmount) || selectedAmount < 1) return 'Donation amount must be at least INR 1';
    return '';
  };

  const pollPaymentStatus = async (orderId, email) => {
    const maxAttempts = 20;
    for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
      try {
        const response = await getDonationStatus(orderId, email);
        const status = response.data?.status;

        if (status === 'paid') {
          const receipt = response.data?.receiptNumber ? ` Receipt: ${response.data.receiptNumber}.` : '';
          setStatusType('success');
          setStatusMessage(`Payment verified successfully.${receipt} The 80G certificate has been emailed.`);
          return;
        }

        if (status === 'failed') {
          setStatusType('error');
          setStatusMessage(response.data?.reason || 'Payment failed. Please try again.');
          return;
        }
      } catch (error) {
        console.error('Status polling failed:', error);
      }

      await new Promise((resolve) => setTimeout(resolve, 3000));
    }

    setStatusType('info');
    setStatusMessage('Payment is being verified. You will receive the receipt and 80G certificate by email shortly.');
  };

  const handleDonate = async (e) => {
    e.preventDefault();
    if (processingPayment) return;

    const validationError = validateForm();
    if (validationError) {
      setStatusType('error');
      setStatusMessage(validationError);
      return;
    }

    setProcessingPayment(true);
    setStatusMessage('');

    try {
      await loadRazorpayScript();

      const payload = {
        donorName: formData.donorName.trim(),
        email: formData.email.trim(),
        mobileNumber: formData.mobileNumber.trim(),
        pan: formData.pan.trim().toUpperCase(),
        amount: selectedAmount
      };

      const response = await createDonationOrder(payload);
      const { keyId, orderId, amountInPaise, currency } = response.data;

      const razorpay = new window.Razorpay({
        key: keyId,
        order_id: orderId,
        amount: amountInPaise,
        currency,
        name: donationConfig.ngoName || 'Donation',
        description: 'NGO Donation',
        prefill: {
          name: payload.donorName,
          email: payload.email,
          contact: payload.mobileNumber
        },
        notes: {
          pan: payload.pan
        },
        handler: async () => {
          setStatusType('info');
          setStatusMessage('Payment received. Verifying securely, please wait...');
          await pollPaymentStatus(orderId, payload.email);
        },
        modal: {
          ondismiss: () => {
            setStatusType('info');
            setStatusMessage('Payment popup closed. If payment was completed, verification may still be in progress.');
          }
        },
        theme: {
          color: '#1D4ED8'
        }
      });

      razorpay.open();
    } catch (error) {
      console.error('Donation checkout error:', error);
      setStatusType('error');
      setStatusMessage(error?.response?.data?.message || error.message || 'Unable to initiate payment');
    } finally {
      setProcessingPayment(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-10">
      <section className="text-center max-w-3xl mx-auto mb-10">
        <h1 className="text-4xl font-bold text-gray-900 mb-3">Donate Now</h1>
        <p className="text-gray-600">
          Your donation helps us deliver healthcare, education, and social development initiatives.
        </p>
      </section>

      {statusMessage && (
        <div
          className={`max-w-3xl mx-auto mb-6 rounded-lg px-4 py-3 text-sm ${
            statusType === 'success'
              ? 'bg-green-50 text-green-700 border border-green-200'
              : statusType === 'error'
                ? 'bg-red-50 text-red-700 border border-red-200'
                : 'bg-blue-50 text-blue-700 border border-blue-200'
          }`}
        >
          {statusMessage}
        </div>
      )}

      <section className="max-w-3xl mx-auto bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-10">
        <h2 className="text-2xl font-semibold mb-5">Online Donation Form</h2>
        <form onSubmit={handleDonate}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Donor Name</label>
              <input
                type="text"
                value={formData.donorName}
                onChange={(e) => setFormData((prev) => ({ ...prev, donorName: e.target.value }))}
                className="w-full p-2 border rounded"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                className="w-full p-2 border rounded"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mobile Number</label>
              <input
                type="tel"
                value={formData.mobileNumber}
                onChange={(e) => setFormData((prev) => ({ ...prev, mobileNumber: e.target.value.replace(/\D/g, '').slice(0, 10) }))}
                className="w-full p-2 border rounded"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">PAN (Mandatory for 80G)</label>
              <input
                type="text"
                value={formData.pan}
                onChange={(e) => setFormData((prev) => ({ ...prev, pan: e.target.value.toUpperCase().slice(0, 10) }))}
                className="w-full p-2 border rounded uppercase"
                required
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Donation Amount</label>
            <div className="flex flex-wrap gap-2 mb-3">
              {PRESET_AMOUNTS.map((amount) => (
                <button
                  key={amount}
                  type="button"
                  onClick={() => setFormData((prev) => ({ ...prev, amountType: 'preset', presetAmount: amount }))}
                  className={`px-4 py-2 rounded border text-sm ${
                    formData.amountType === 'preset' && Number(formData.presetAmount) === amount
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-gray-700 border-gray-300'
                  }`}
                >
                  INR {amount}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setFormData((prev) => ({ ...prev, amountType: 'custom' }))}
                className={`px-4 py-2 rounded border text-sm ${
                  formData.amountType === 'custom'
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-gray-700 border-gray-300'
                }`}
              >
                Custom
              </button>
            </div>

            {formData.amountType === 'custom' && (
              <input
                type="number"
                min="1"
                step="1"
                value={formData.customAmount}
                onChange={(e) => setFormData((prev) => ({ ...prev, customAmount: e.target.value }))}
                className="w-full p-2 border rounded"
                placeholder="Enter amount in INR"
                required
              />
            )}
          </div>

          <button
            type="submit"
            disabled={processingPayment}
            className="w-full app-btn app-btn-primary disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {processingPayment ? 'Preparing payment...' : 'Proceed to Secure Payment'}
          </button>
        </form>
      </section>

      {loadingConfig && (
        <p className="text-center text-sm text-gray-500 mb-6">Loading donation account details...</p>
      )}

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
        <article className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-3">UPI / QR</h2>
          <p className="text-gray-700 mb-2">
            <span className="font-semibold">UPI ID:</span> {donationConfig.upiId || 'Not configured'}
          </p>
          {donationConfig.qrImageUrl && (
            <img
              src={donationConfig.qrImageUrl}
              alt="Donation QR Code"
              className="w-44 h-44 object-contain border rounded-lg mt-3"
            />
          )}
        </article>

        <article className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-3">Bank Transfer</h2>
          <ul className="space-y-2 text-gray-700 text-sm">
            <li><span className="font-semibold">Bank:</span> {donationConfig.bankName || 'Not configured'}</li>
            <li><span className="font-semibold">Account Name:</span> {donationConfig.accountName || 'Not configured'}</li>
            <li><span className="font-semibold">Account Number:</span> {donationConfig.accountNumber || 'Not configured'}</li>
            <li><span className="font-semibold">IFSC:</span> {donationConfig.ifsc || 'Not configured'}</li>
            <li><span className="font-semibold">Branch:</span> {donationConfig.branch || 'Not configured'}</li>
          </ul>
        </article>

        <article className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-3">Compliance</h2>
          <ul className="space-y-2 text-gray-700 text-sm">
            <li><span className="font-semibold">NGO Name:</span> {donationConfig.ngoName || 'Not configured'}</li>
            <li><span className="font-semibold">NGO PAN:</span> {donationConfig.ngoPan || 'Not configured'}</li>
            <li><span className="font-semibold">80G No:</span> {donationConfig.eightyGRegistrationNumber || 'Not configured'}</li>
          </ul>
          {donationConfig.paymentUrl && (
            <a
              href={donationConfig.paymentUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-block mt-4 app-btn app-btn-outline"
            >
              Alternative Payment Link
            </a>
          )}
        </article>
      </section>

      <section className="max-w-3xl mx-auto text-center">
        <p className="text-sm text-gray-600 mb-4">
          {donationConfig.taxNote || 'For donation receipts, 80G details, or institutional support queries, contact us.'}
        </p>
        <Link to="/contact" className="app-btn app-btn-outline">
          Contact Donation Support
        </Link>
      </section>
    </div>
  );
};

export default Donate;
