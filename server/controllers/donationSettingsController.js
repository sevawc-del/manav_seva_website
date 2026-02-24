const fs = require('fs/promises');
const cloudinary = require('../config/cloudinary');
const DonationSettings = require('../models/DonationSettings');
const { getResolvedDonationSettings } = require('../services/donationSettingsService');

const cleanupTempUpload = async (filePath) => {
  if (!filePath) return;
  try {
    await fs.unlink(filePath);
  } catch (error) {
    if (error.code !== 'ENOENT') {
      console.error('Temp upload cleanup error:', error.message);
    }
  }
};

const extractCloudinaryPublicId = (imageUrl) => {
  if (!imageUrl || typeof imageUrl !== 'string') return null;

  try {
    const parsedUrl = new URL(imageUrl);
    if (!parsedUrl.hostname.includes('res.cloudinary.com')) return null;

    const uploadIndex = parsedUrl.pathname.indexOf('/upload/');
    if (uploadIndex === -1) return null;

    const pathAfterUpload = parsedUrl.pathname.slice(uploadIndex + '/upload/'.length);
    const segments = pathAfterUpload.split('/').filter(Boolean);
    const versionIndex = segments.findIndex((segment) => /^v\d+$/.test(segment));
    if (versionIndex === -1 || versionIndex >= segments.length - 1) return null;

    const publicIdWithExtension = segments.slice(versionIndex + 1).join('/');
    return publicIdWithExtension.replace(/\.[^/.]+$/, '');
  } catch (error) {
    return null;
  }
};

const deleteCloudinaryImage = async (imageUrl) => {
  const publicId = extractCloudinaryPublicId(imageUrl);
  if (!publicId) return;

  try {
    await cloudinary.uploader.destroy(publicId, {
      resource_type: 'image',
      invalidate: true
    });
  } catch (error) {
    console.error('Cloudinary delete error:', error.message);
  }
};

const getDonationSettings = async (req, res) => {
  try {
    const settings = await getResolvedDonationSettings();
    return res.json(settings);
  } catch (error) {
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

const createOrUpdateDonationSettings = async (req, res) => {
  try {
    let settings = await DonationSettings.findOne();
    const existingQrImageUrl = settings?.qrImageUrl || '';
    const existingSignatureImageUrl = settings?.authorizedSignatureImageUrl || '';
    let qrImageUrl = req.body.qrImageUrl ?? existingQrImageUrl;
    let authorizedSignatureImageUrl = req.body.authorizedSignatureImageUrl ?? existingSignatureImageUrl;

    const qrImageFile = req.files?.qrImageFile?.[0] || null;
    const signatureImageFile = req.files?.signatureImageFile?.[0] || null;

    if (qrImageFile) {
      try {
        const result = await cloudinary.uploader.upload(qrImageFile.path, {
          folder: 'manav-seva/donation',
          resource_type: 'image'
        });
        qrImageUrl = result.secure_url;
        await cleanupTempUpload(qrImageFile.path);
      } catch (uploadError) {
        await cleanupTempUpload(qrImageFile.path);
        console.error('Cloudinary upload error:', uploadError.message);
        return res.status(500).json({ message: 'Failed to upload QR image' });
      }
    }

    if (signatureImageFile) {
      try {
        const result = await cloudinary.uploader.upload(signatureImageFile.path, {
          folder: 'manav-seva/donation',
          resource_type: 'image'
        });
        authorizedSignatureImageUrl = result.secure_url;
        await cleanupTempUpload(signatureImageFile.path);
      } catch (uploadError) {
        await cleanupTempUpload(signatureImageFile.path);
        console.error('Cloudinary upload error:', uploadError.message);
        return res.status(500).json({ message: 'Failed to upload authorized signature image' });
      }
    }

    const payload = {
      ngoName: req.body.ngoName || '',
      ngoAddress: req.body.ngoAddress || '',
      ngoPan: String(req.body.ngoPan || '').toUpperCase(),
      eightyGRegistrationNumber: req.body.eightyGRegistrationNumber || '',
      ngoNotificationEmail: req.body.ngoNotificationEmail || '',
      authorizedSignatoryName: req.body.authorizedSignatoryName || '',
      authorizedSignatureImageUrl: authorizedSignatureImageUrl || '',
      upiId: req.body.upiId || '',
      bankName: req.body.bankName || '',
      accountName: req.body.accountName || '',
      accountNumber: req.body.accountNumber || '',
      ifsc: req.body.ifsc || '',
      branch: req.body.branch || '',
      qrImageUrl: qrImageUrl || '',
      paymentUrl: req.body.paymentUrl || '',
      taxNote: req.body.taxNote || ''
    };

    if (settings) {
      settings = await DonationSettings.findByIdAndUpdate(settings._id, payload, { new: true });
    } else {
      settings = await DonationSettings.create(payload);
    }

    if (
      settings.qrImageUrl &&
      existingQrImageUrl &&
      settings.qrImageUrl !== existingQrImageUrl
    ) {
      await deleteCloudinaryImage(existingQrImageUrl);
    }

    if (
      settings.authorizedSignatureImageUrl &&
      existingSignatureImageUrl &&
      settings.authorizedSignatureImageUrl !== existingSignatureImageUrl
    ) {
      await deleteCloudinaryImage(existingSignatureImageUrl);
    }

    return res.json(await getResolvedDonationSettings());
  } catch (error) {
    return res.status(400).json({ message: 'Invalid request data' });
  }
};

module.exports = {
  getDonationSettings,
  createOrUpdateDonationSettings
};
