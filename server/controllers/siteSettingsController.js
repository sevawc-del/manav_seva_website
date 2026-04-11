const fs = require('fs/promises');
const cloudinary = require('../config/cloudinary');
const SiteSettings = require('../models/SiteSettings');
const { deleteCloudinaryAsset } = require('../utils/cloudinaryAsset');

const DEFAULT_SITE_SETTINGS = {
  organizationName: 'Manav Seva Sansthan SEVA',
  organizationSubline: 'Society for Eco-development Voluntary Action',
  logoUrl: '/images/logo.png',
  supportMessage: 'Support our mission to transform lives.',
  footerAboutTitle: 'Manav Seva India',
  footerAboutText:
    'Manav Seva Sansthan SEVA, is a not for profit organization established in 1988, working in North India with a mission to ensure socio-economic development of the poor and disadvantaged resembling vulnerable women and children devoid of basic rights through community based area development',
  footerPhone: '+91 - 8840221539',
  footerEmail: 'info@manavsevaindia.org',
  footerSecondaryEmail: 'executive.director@manavsevaindia.org',
  footerWebsite: 'www.manavsevaindia.org',
  footerAddress: 'LIG 198, Vikas Nagar, P.O. Fertilizer, Bargadwa, Gorakhpur',
  footerCopyrightText: 'Manav Seva India. All rights reserved.',
  chairpersonName: 'Chairperson',
  chairpersonImageUrl: '',
  homeWhoTitle: 'Who are we?',
  homeWhoLeftText:
    'Manav Seva Sansthan SEVA is a not-for-profit organization working for inclusive socio-economic development across vulnerable communities.',
  homeWhoRightTitle: 'In Focus',
  homeWhoRightText:
    'Our programs and collaborations are designed to create long-term impact through community-led action.',
  homeWhoRightImageUrl: '',
  homeOfficeLocations: [
    {
      id: 'gorakhpur-head-office',
      name: 'Head Office',
      city: 'Gorakhpur',
      address: 'Vikas Nagar Colony, Bargadwa, P.O. Fertilizer, Gorakhpur-273007 (U.P.), India',
      lat: 26.8050913,
      lng: 83.3548241,
      googleMapsUrl:
        'https://www.google.com/maps/place/Manav+Seva+Sansthan+SEVA/@26.8047121,83.3523656,18z/data=!4m6!3m5!1s0x39914a4000000007:0x7650ce5dac4123f2!8m2!3d26.8050913!4d83.3548241!16s%2Fg%2F11c1xczdgj?entry=ttu&g_ep=EgoyMDI2MDMzMC4wIKXMDSoASAFQAw'
    },
    {
      id: 'new-delhi-branch-office',
      name: 'Branch Office',
      city: 'New Delhi',
      address: 'K68 BK dutt Colony, Jor Bagh, New Delhi, 110003',
      lat: 28.5839672,
      lng: 77.2168207,
      googleMapsUrl:
        'https://www.google.com/maps/place/K-82+B.K.+Dutt+Colony,+Jor+Bagh/@28.5839791,77.2140859,17z/data=!3m1!4b1!4m6!3m5!1s0x390ce3ae76a5fe45:0x6ac91b5de8746a68!8m2!3d28.5839791!4d77.2166608!16s%2Fg%2F11kpvr3p49?entry=ttu&g_ep=EgoyMDI2MDMzMC4wIKXMDSoASAFQAw%3D%3D'
    }
  ],
  homeGeographicFocusStates: [],
  homeGeographicFocusDescription:
    'States are color-coded to reflect current and past program presence. Use the toggles to filter.',
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

const deleteCloudinaryImage = async (imageUrl) => {
  try {
    await deleteCloudinaryAsset({
      assetUrl: imageUrl,
      resourceType: 'image',
      fallbackResourceTypes: ['image'],
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

const sanitizeGoogleMapsUrl = (incomingValue) => {
  const normalized = String(incomingValue || '').trim();
  if (!normalized) return '';

  try {
    const parsedUrl = new URL(normalized);
    const hostname = parsedUrl.hostname.toLowerCase();
    const isGoogleMapsHost =
      hostname === 'google.com' ||
      hostname === 'www.google.com' ||
      hostname === 'maps.google.com' ||
      hostname === 'maps.app.goo.gl' ||
      hostname.endsWith('.google.com');

    if (parsedUrl.protocol !== 'https:' || !isGoogleMapsHost) {
      return '';
    }

    return parsedUrl.toString();
  } catch (error) {
    return '';
  }
};

const parseOfficeLocations = (incomingValue, fallbackLocations) => {
  if (incomingValue === undefined || incomingValue === null || incomingValue === '') {
    return fallbackLocations;
  }

  let parsed = incomingValue;
  if (typeof incomingValue === 'string') {
    try {
      parsed = JSON.parse(incomingValue);
    } catch (error) {
      return fallbackLocations;
    }
  }

  if (!Array.isArray(parsed)) {
    return fallbackLocations;
  }

  const normalized = parsed
    .map((office, index) => {
      const lat = Number(office?.lat);
      const lng = Number(office?.lng);
      if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
        return null;
      }

      const rawId = String(office?.id || '').trim();
      const safeId = rawId && rawId.toLowerCase() !== 'all' ? rawId : `office-${index + 1}`;

      return {
        id: safeId,
        name: String(office?.name || '').trim(),
        city: String(office?.city || '').trim(),
        address: String(office?.address || '').trim(),
        lat,
        lng,
        googleMapsUrl: sanitizeGoogleMapsUrl(office?.googleMapsUrl)
      };
    })
    .filter(Boolean)
    .filter((office) => office.name && office.city);

  return normalized.length > 0 ? normalized : fallbackLocations;
};

const normalizeStateName = (value) => String(value || '').trim().replace(/\s+/g, ' ').toUpperCase();

const parseHomeGeographicFocusStates = (incomingValue, fallbackStates = []) => {
  if (incomingValue === undefined || incomingValue === null) {
    return Array.isArray(fallbackStates) ? fallbackStates : [];
  }

  let parsed = incomingValue;
  if (typeof incomingValue === 'string') {
    try {
      parsed = JSON.parse(incomingValue);
    } catch (error) {
      return Array.isArray(fallbackStates) ? fallbackStates : [];
    }
  }

  if (!Array.isArray(parsed)) {
    return Array.isArray(fallbackStates) ? fallbackStates : [];
  }

  const dedupedByState = new Map();
  parsed.forEach((entry) => {
    const state = String(entry?.state || '').trim();
    if (!state) return;

    const normalizedState = normalizeStateName(state);
    if (!normalizedState) return;

    const rawStatus = String(entry?.status || '').trim().toLowerCase();
    const status = rawStatus === 'previously_worked' ? 'previously_worked' : 'currently_working';

    dedupedByState.set(normalizedState, { state, status });
  });

  return Array.from(dedupedByState.values());
};

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
    const existingHomeWhoRightImageUrl =
      settings?.homeWhoRightImageUrl || DEFAULT_SITE_SETTINGS.homeWhoRightImageUrl;
    let logoUrl = req.body.logoUrl ?? existingLogoUrl;
    let chairpersonImageUrl = req.body.chairpersonImageUrl ?? existingChairpersonImageUrl;
    let homeWhoRightImageUrl = req.body.homeWhoRightImageUrl ?? existingHomeWhoRightImageUrl;
    const logoFile = req.files?.logoFile?.[0] || req.file || null;
    const chairpersonImageFile = req.files?.chairpersonImageFile?.[0] || null;
    const homeWhoRightImageFile = req.files?.homeWhoRightImageFile?.[0] || null;

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

    if (homeWhoRightImageFile) {
      try {
        const result = await cloudinary.uploader.upload(homeWhoRightImageFile.path, {
          folder: 'manav-seva/site-settings',
          resource_type: 'image'
        });
        homeWhoRightImageUrl = result.secure_url;
        await cleanupTempUpload(homeWhoRightImageFile.path);
      } catch (uploadError) {
        await cleanupTempUpload(homeWhoRightImageFile.path);
        console.error('Cloudinary upload error:', uploadError.message);
        return res.status(500).json({ message: 'Failed to upload home section image' });
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
      homeWhoTitle:
        req.body.homeWhoTitle ?? settings?.homeWhoTitle ?? DEFAULT_SITE_SETTINGS.homeWhoTitle,
      homeWhoLeftText:
        req.body.homeWhoLeftText ??
        settings?.homeWhoLeftText ??
        DEFAULT_SITE_SETTINGS.homeWhoLeftText,
      homeWhoRightTitle:
        req.body.homeWhoRightTitle ??
        settings?.homeWhoRightTitle ??
        DEFAULT_SITE_SETTINGS.homeWhoRightTitle,
      homeWhoRightText:
        req.body.homeWhoRightText ??
        settings?.homeWhoRightText ??
        DEFAULT_SITE_SETTINGS.homeWhoRightText,
      homeWhoRightImageUrl: homeWhoRightImageUrl ?? DEFAULT_SITE_SETTINGS.homeWhoRightImageUrl,
      homeOfficeLocations: parseOfficeLocations(
        req.body.homeOfficeLocations,
        settings?.homeOfficeLocations ?? DEFAULT_SITE_SETTINGS.homeOfficeLocations
      ),
      homeGeographicFocusStates: parseHomeGeographicFocusStates(
        req.body.homeGeographicFocusStates,
        settings?.homeGeographicFocusStates ?? DEFAULT_SITE_SETTINGS.homeGeographicFocusStates
      ),
      homeGeographicFocusDescription:
        req.body.homeGeographicFocusDescription ??
        settings?.homeGeographicFocusDescription ??
        DEFAULT_SITE_SETTINGS.homeGeographicFocusDescription,
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
      footerSecondaryEmail:
        req.body.footerSecondaryEmail ??
        settings?.footerSecondaryEmail ??
        DEFAULT_SITE_SETTINGS.footerSecondaryEmail,
      footerWebsite:
        req.body.footerWebsite ?? settings?.footerWebsite ?? DEFAULT_SITE_SETTINGS.footerWebsite,
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

    if (
      settings.homeWhoRightImageUrl &&
      existingHomeWhoRightImageUrl &&
      settings.homeWhoRightImageUrl !== existingHomeWhoRightImageUrl
    ) {
      await deleteCloudinaryImage(existingHomeWhoRightImageUrl);
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
