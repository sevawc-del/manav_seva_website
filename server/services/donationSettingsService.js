const DonationSettings = require('../models/DonationSettings');

const getDefaultDonationSettings = () => ({
  ngoName: '',
  ngoAddress: '',
  ngoPan: '',
  eightyGRegistrationNumber: '',
  ngoNotificationEmail: '',
  authorizedSignatoryName: '',
  authorizedSignatureImageUrl: '',
  upiId: '',
  bankName: '',
  accountName: '',
  accountNumber: '',
  ifsc: '',
  branch: '',
  qrImageUrl: '',
  paymentUrl: '',
  taxNote: ''
});

const mergeWithDefaults = (settings = {}) => {
  const defaults = getDefaultDonationSettings();
  const merged = { ...defaults };

  Object.keys(merged).forEach((key) => {
    const value = settings[key];
    if (typeof value === 'string') {
      merged[key] = value.trim();
    } else if (value !== undefined && value !== null) {
      merged[key] = value;
    }
  });

  return merged;
};

const getResolvedDonationSettings = async () => {
  const settings = await DonationSettings.findOne().lean();
  if (!settings) {
    return getDefaultDonationSettings();
  }
  return mergeWithDefaults(settings);
};

module.exports = {
  getDefaultDonationSettings,
  getResolvedDonationSettings
};
