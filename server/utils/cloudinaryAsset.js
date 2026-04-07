const cloudinary = require('../config/cloudinary');

const uniqueNonEmpty = (values = []) => (
  [...new Set(values.map((value) => String(value || '').trim()).filter(Boolean))]
);

const extractFileExtension = (value = '') => {
  const source = String(value || '').trim();
  if (!source) return '';
  const cleanPath = source.split('?')[0];
  const slashIndex = cleanPath.lastIndexOf('/');
  const filename = slashIndex >= 0 ? cleanPath.slice(slashIndex + 1) : cleanPath;
  const dotIndex = filename.lastIndexOf('.');
  if (dotIndex <= 0) return '';
  return filename.slice(dotIndex + 1).toLowerCase();
};

const stripExtensionFromPath = (value = '') => {
  const source = String(value || '').trim();
  if (!source) return '';
  const slashIndex = source.lastIndexOf('/');
  const filename = slashIndex >= 0 ? source.slice(slashIndex + 1) : source;
  const dotIndex = filename.lastIndexOf('.');
  if (dotIndex <= 0) return source;
  const prefix = slashIndex >= 0 ? source.slice(0, slashIndex + 1) : '';
  return `${prefix}${filename.slice(0, dotIndex)}`;
};

const isCloudinaryUrl = (value = '') => {
  const source = String(value || '').trim();
  return source.includes('res.cloudinary.com');
};

const inferResourceTypeFromUrl = (assetUrl = '') => {
  const source = String(assetUrl || '').trim();
  if (source.includes('/image/upload/')) return 'image';
  if (source.includes('/raw/upload/')) return 'raw';
  if (source.includes('/video/upload/')) return 'video';
  return '';
};

const extractCloudinaryAssetPathFromUrl = (assetUrl = '') => {
  const source = String(assetUrl || '').trim();
  if (!source) return '';

  try {
    const parsedUrl = new URL(source);
    if (!parsedUrl.hostname.includes('res.cloudinary.com')) return '';

    const uploadIndex = parsedUrl.pathname.indexOf('/upload/');
    if (uploadIndex === -1) return '';

    const pathAfterUpload = parsedUrl.pathname.slice(uploadIndex + '/upload/'.length);
    const segments = pathAfterUpload.split('/').filter(Boolean);
    const versionIndex = segments.findIndex((segment) => /^v\d+$/.test(segment));
    if (versionIndex === -1 || versionIndex >= segments.length - 1) return '';

    return decodeURIComponent(segments.slice(versionIndex + 1).join('/'));
  } catch (error) {
    return '';
  }
};

const resolveCloudinaryAsset = async ({
  assetUrl = '',
  publicId = '',
  resourceType = '',
  fileFormat = '',
  deliveryType = 'upload',
  fallbackResourceTypes = ['raw', 'image']
} = {}) => {
  const sourceUrl = String(assetUrl || '').trim();
  const directPublicId = String(publicId || '').trim();
  const normalizedResourceType = String(resourceType || '').trim().toLowerCase();
  const normalizedFormat = String(fileFormat || '').trim().toLowerCase();
  const normalizedDeliveryType = String(deliveryType || 'upload').trim() || 'upload';

  if (!sourceUrl && !directPublicId) return null;
  if (sourceUrl && !isCloudinaryUrl(sourceUrl) && !directPublicId) return null;

  const assetPathFromUrl = extractCloudinaryAssetPathFromUrl(sourceUrl);
  const publicIdCandidates = uniqueNonEmpty([
    directPublicId,
    assetPathFromUrl,
    stripExtensionFromPath(directPublicId),
    stripExtensionFromPath(assetPathFromUrl)
  ]);
  const resourceTypeCandidates = uniqueNonEmpty([
    normalizedResourceType,
    inferResourceTypeFromUrl(sourceUrl),
    ...(Array.isArray(fallbackResourceTypes) ? fallbackResourceTypes : [])
  ]);

  for (const publicIdCandidate of publicIdCandidates) {
    for (const resourceTypeCandidate of resourceTypeCandidates) {
      try {
        const resource = await cloudinary.api.resource(publicIdCandidate, {
          resource_type: resourceTypeCandidate,
          type: normalizedDeliveryType
        });
        if (resource) {
          return {
            sourceUrl,
            publicId: String(resource.public_id || publicIdCandidate).trim(),
            resourceType: String(resource.resource_type || resourceTypeCandidate).trim() || 'raw',
            deliveryType: String(resource.type || normalizedDeliveryType).trim() || normalizedDeliveryType,
            format: String(
              resource.format ||
              normalizedFormat ||
              extractFileExtension(resource.public_id) ||
              extractFileExtension(sourceUrl)
            ).trim().toLowerCase()
          };
        }
      } catch (error) {
        // Try next candidate.
      }
    }
  }

  return null;
};

const deleteCloudinaryAsset = async ({
  assetUrl = '',
  publicId = '',
  resourceType = '',
  fileFormat = '',
  deliveryType = 'upload',
  fallbackResourceTypes = ['raw', 'image'],
  invalidate = true
} = {}) => {
  try {
    const resolvedAsset = await resolveCloudinaryAsset({
      assetUrl,
      publicId,
      resourceType,
      fileFormat,
      deliveryType,
      fallbackResourceTypes
    });
    if (!resolvedAsset?.publicId) return false;

    await cloudinary.uploader.destroy(resolvedAsset.publicId, {
      resource_type: resolvedAsset.resourceType,
      type: resolvedAsset.deliveryType,
      invalidate
    });

    return true;
  } catch (error) {
    return false;
  }
};

const buildSignedCloudinaryDownloadUrl = async ({
  assetUrl = '',
  publicId = '',
  resourceType = '',
  fileFormat = '',
  deliveryType = 'upload',
  fallbackResourceTypes = ['raw', 'image'],
  attachment = true,
  ttlSeconds = 600
} = {}) => {
  const sourceUrl = String(assetUrl || '').trim();
  const resolvedAsset = await resolveCloudinaryAsset({
    assetUrl: sourceUrl,
    publicId,
    resourceType,
    fileFormat,
    deliveryType,
    fallbackResourceTypes
  });

  if (!resolvedAsset || !resolvedAsset.publicId || !resolvedAsset.format) {
    return sourceUrl;
  }

  const signedPublicIdCandidates = uniqueNonEmpty([
    resolvedAsset.publicId,
    stripExtensionFromPath(resolvedAsset.publicId)
  ]);

  for (const signedPublicId of signedPublicIdCandidates) {
    try {
      return cloudinary.utils.private_download_url(signedPublicId, resolvedAsset.format, {
        resource_type: resolvedAsset.resourceType,
        type: resolvedAsset.deliveryType,
        expires_at: Math.floor(Date.now() / 1000) + Math.max(30, Number(ttlSeconds) || 600),
        attachment
      });
    } catch (error) {
      // Try next candidate.
    }
  }

  return sourceUrl;
};

module.exports = {
  uniqueNonEmpty,
  extractFileExtension,
  stripExtensionFromPath,
  isCloudinaryUrl,
  inferResourceTypeFromUrl,
  extractCloudinaryAssetPathFromUrl,
  resolveCloudinaryAsset,
  deleteCloudinaryAsset,
  buildSignedCloudinaryDownloadUrl
};
