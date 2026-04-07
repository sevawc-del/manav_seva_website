const CLOUDINARY_UPLOAD_MARKER = '/upload/';

export const optimizeCloudinaryImage = (url, options = {}) => {
  const input = String(url || '').trim();
  if (!input || !input.includes('res.cloudinary.com') || !input.includes(CLOUDINARY_UPLOAD_MARKER)) {
    return input;
  }

  const {
    width,
    height,
    quality = 'auto',
    format = 'auto',
    dpr = 'auto',
    crop = 'fill'
  } = options;

  const directives = [];
  if (format) directives.push(`f_${format}`);
  if (quality) directives.push(`q_${quality}`);
  if (dpr) directives.push(`dpr_${dpr}`);
  if (Number.isFinite(Number(width)) && Number(width) > 0) directives.push(`w_${Math.round(Number(width))}`);
  if (Number.isFinite(Number(height)) && Number(height) > 0) directives.push(`h_${Math.round(Number(height))}`);
  if ((width || height) && crop) directives.push(`c_${crop}`);
  if (!directives.length) return input;

  const [prefix, remainder] = input.split(CLOUDINARY_UPLOAD_MARKER);
  if (!remainder) return input;

  const [pathPart, queryPart] = remainder.split('?');
  const transform = directives.join(',');

  let transformedPath;
  if (/^v\d+\/.*/.test(pathPart)) {
    transformedPath = `${transform}/${pathPart}`;
  } else if (/^[a-z]+_[^/]+/.test(pathPart)) {
    transformedPath = `${transform},${pathPart}`;
  } else {
    transformedPath = `${transform}/${pathPart}`;
  }

  return `${prefix}${CLOUDINARY_UPLOAD_MARKER}${transformedPath}${queryPart ? `?${queryPart}` : ''}`;
};
