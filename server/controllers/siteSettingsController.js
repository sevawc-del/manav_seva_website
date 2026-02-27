const fs = require('fs/promises');
const cloudinary = require('../config/cloudinary');
const SiteSettings = require('../models/SiteSettings');

const DEFAULT_SITE_SETTINGS = {
  organizationName: 'Manav Seva Sansthan SEVA',
  organizationSubline: 'Sansthan SEVA',
  logoUrl: '/images/logo.png',
  supportMessage: 'Support our mission to transform lives.',
  footerAboutTitle: 'Manav Seva India',
  footerAboutText:
    'Manav Seva India works towards sustainable community development, focusing on education, healthcare, women empowerment and social protection programs across India.',
  footerPhone: '+91 99999 88888',
  footerEmail: 'info@manavsevaindia.org',
  footerAddress: 'Manav Seva India, Uttar Pradesh, India.',
  footerCopyrightText: 'Manav Seva India. All rights reserved.',
  chairpersonName: 'Chairperson',
  chairpersonImageUrl: '',
  facebookUrl: 'https://www.facebook.com',
  instagramUrl: 'https://www.instagram.com',
  linkedinUrl: 'https://www.linkedin.com',
  twitterUrl: 'https://x.com',
  youtubeUrl: 'https://www.youtube.com'
};

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

const mergeWithDefaults = (settings = {}) => ({
  ...DEFAULT_SITE_SETTINGS,
  ...settings
});

const getSiteSettings = async (req, res) => {
  try {
    const settings = await SiteSettings.findOne().lean();
    return res.json(mergeWithDefaults(settings || {}));
  } catch (error) {
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

const createOrUpdateSiteSettings = async (req, res) => {
  try {
    let settings = await SiteSettings.findOne();
    const existingLogoUrl = settings?.logoUrl || DEFAULT_SITE_SETTINGS.logoUrl;
    const existingChairpersonImageUrl =
      settings?.chairpersonImageUrl || DEFAULT_SITE_SETTINGS.chairpersonImageUrl;
    let logoUrl = req.body.logoUrl ?? existingLogoUrl;
    let chairpersonImageUrl = req.body.chairpersonImageUrl ?? existingChairpersonImageUrl;
    const logoFile = req.files?.logoFile?.[0] || req.file || null;
    const chairpersonImageFile = req.files?.chairpersonImageFile?.[0] || null;

    if (logoFile) {
      try {
        const result = await cloudinary.uploader.upload(logoFile.path, {
          folder: 'manav-seva/site-settings',
          resource_type: 'image'
        });
        logoUrl = result.secure_url;
        await cleanupTempUpload(logoFile.path);
      } catch (uploadError) {
        await cleanupTempUpload(logoFile.path);
        console.error('Cloudinary upload error:', uploadError.message);
        return res.status(500).json({ message: 'Failed to upload logo image' });
      }
    }

    if (chairpersonImageFile) {
      try {
        const result = await cloudinary.uploader.upload(chairpersonImageFile.path, {
          folder: 'manav-seva/site-settings',
          resource_type: 'image'
        });
        chairpersonImageUrl = result.secure_url;
        await cleanupTempUpload(chairpersonImageFile.path);
      } catch (uploadError) {
        await cleanupTempUpload(chairpersonImageFile.path);
        console.error('Cloudinary upload error:', uploadError.message);
        return res.status(500).json({ message: 'Failed to upload chairperson image' });
      }
    }

    const payload = {
      organizationName:
        req.body.organizationName ??
        settings?.organizationName ??
        DEFAULT_SITE_SETTINGS.organizationName,
      organizationSubline:
        req.body.organizationSubline ??
        settings?.organizationSubline ??
        DEFAULT_SITE_SETTINGS.organizationSubline,
      logoUrl: logoUrl ?? DEFAULT_SITE_SETTINGS.logoUrl,
      chairpersonImageUrl: chairpersonImageUrl ?? DEFAULT_SITE_SETTINGS.chairpersonImageUrl,
      chairpersonName:
        req.body.chairpersonName ?? settings?.chairpersonName ?? DEFAULT_SITE_SETTINGS.chairpersonName,
      supportMessage:
        req.body.supportMessage ??
        settings?.supportMessage ??
        DEFAULT_SITE_SETTINGS.supportMessage,
      footerAboutTitle:
        req.body.footerAboutTitle ??
        settings?.footerAboutTitle ??
        DEFAULT_SITE_SETTINGS.footerAboutTitle,
      footerAboutText:
        req.body.footerAboutText ??
        settings?.footerAboutText ??
        DEFAULT_SITE_SETTINGS.footerAboutText,
      footerPhone:
        req.body.footerPhone ?? settings?.footerPhone ?? DEFAULT_SITE_SETTINGS.footerPhone,
      footerEmail:
        req.body.footerEmail ?? settings?.footerEmail ?? DEFAULT_SITE_SETTINGS.footerEmail,
      footerAddress:
        req.body.footerAddress ?? settings?.footerAddress ?? DEFAULT_SITE_SETTINGS.footerAddress,
      footerCopyrightText:
        req.body.footerCopyrightText ??
        settings?.footerCopyrightText ??
        DEFAULT_SITE_SETTINGS.footerCopyrightText,
      facebookUrl:
        req.body.facebookUrl ?? settings?.facebookUrl ?? DEFAULT_SITE_SETTINGS.facebookUrl,
      instagramUrl:
        req.body.instagramUrl ?? settings?.instagramUrl ?? DEFAULT_SITE_SETTINGS.instagramUrl,
      linkedinUrl:
        req.body.linkedinUrl ?? settings?.linkedinUrl ?? DEFAULT_SITE_SETTINGS.linkedinUrl,
      twitterUrl:
        req.body.twitterUrl ?? settings?.twitterUrl ?? DEFAULT_SITE_SETTINGS.twitterUrl,
      youtubeUrl:
        req.body.youtubeUrl ?? settings?.youtubeUrl ?? DEFAULT_SITE_SETTINGS.youtubeUrl
    };

    if (settings) {
      settings = await SiteSettings.findByIdAndUpdate(settings._id, payload, { new: true });
    } else {
      settings = await SiteSettings.create(payload);
    }

    if (settings.logoUrl && existingLogoUrl && settings.logoUrl !== existingLogoUrl) {
      await deleteCloudinaryImage(existingLogoUrl);
    }

    if (
      settings.chairpersonImageUrl &&
      existingChairpersonImageUrl &&
      settings.chairpersonImageUrl !== existingChairpersonImageUrl
    ) {
      await deleteCloudinaryImage(existingChairpersonImageUrl);
    }

    return res.json(mergeWithDefaults(settings.toObject()));
  } catch (error) {
    return res.status(400).json({ message: 'Invalid request data' });
  }
};

module.exports = {
  getSiteSettings,
  createOrUpdateSiteSettings
};
