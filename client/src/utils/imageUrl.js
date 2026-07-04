const CLOUDINARY_UPLOAD_MARKER = '/upload/';
const DEFAULT_PLACEHOLDER_WIDTH = 1200;
const DEFAULT_PLACEHOLDER_HEIGHT = 675;

const normalizeImageInput = (url) => {
  const input = String(url || '').trim();
  if (!input) return '';

  const normalized = input.toLowerCase();
  if (normalized === 'null' || normalized === 'undefined') {
    return '';
  }

  return input;
};

const escapeSvgText = (value) =>
  String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

export const createImagePlaceholder = ({
  width = DEFAULT_PLACEHOLDER_WIDTH,
  height = DEFAULT_PLACEHOLDER_HEIGHT,
  text = 'Image Not Available',
  background = '#e2e8f0',
  foreground = '#475569'
} = {}) => {
  const safeWidth = Number.isFinite(Number(width)) && Number(width) > 0
    ? Math.round(Number(width))
    : DEFAULT_PLACEHOLDER_WIDTH;
  const safeHeight = Number.isFinite(Number(height)) && Number(height) > 0
    ? Math.round(Number(height))
    : DEFAULT_PLACEHOLDER_HEIGHT;
  const safeText = escapeSvgText(String(text || 'Image Not Available').slice(0, 80));
  const fontSize = Math.max(24, Math.round(Math.min(safeWidth, safeHeight) * 0.09));
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${safeWidth}" height="${safeHeight}" viewBox="0 0 ${safeWidth} ${safeHeight}">
      <rect width="100%" height="100%" fill="${background}" />
      <text
        x="50%"
        y="50%"
        fill="${foreground}"
        font-family="Segoe UI, Arial, sans-serif"
        font-size="${fontSize}"
        font-weight="600"
        dominant-baseline="middle"
        text-anchor="middle"
      >${safeText}</text>
    </svg>
  `.trim();

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
};

export const applyImageFallback = (event, fallbackSrc) => {
  const image = event?.currentTarget;
  if (!image) return;

  image.onerror = null;
  if (!fallbackSrc || image.src === fallbackSrc) return;
  image.src = fallbackSrc;
};

export const ACTIVITY_IMAGE_PLACEHOLDER = createImagePlaceholder({
  width: 960,
  height: 540,
  text: 'Activity Image'
});

export const optimizeCloudinaryImage = (url, options = {}) => {
  const input = normalizeImageInput(url);
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

  const segments = pathPart.split('/');
  const firstSegment = segments[0] || '';
  const hasExistingTransform = /^[a-z]{1,3}_[^,/]+(?:,[a-z]{1,3}_[^,/]+)*$/.test(firstSegment) && segments.length > 1;
  const publicIdPath = hasExistingTransform ? segments.slice(1).join('/') : pathPart;

  const transformedPath = `${transform}/${publicIdPath}`;

  return `${prefix}${CLOUDINARY_UPLOAD_MARKER}${transformedPath}${queryPart ? `?${queryPart}` : ''}`;
};
