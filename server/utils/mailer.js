const nodemailer = require('nodemailer');

let cachedTransporter = null;
let cachedResolvedConfig = null;

const normalize = (value) => String(value || '').trim();

const isTruthy = (value, defaultValue = false) => {
  if (value === undefined || value === null || value === '') return defaultValue;
  return ['1', 'true', 'yes', 'on'].includes(String(value).toLowerCase());
};

const isPlaceholderValue = (value) => {
  const normalized = normalize(value).toLowerCase();
  return (
    !normalized ||
    normalized === 'your_email@gmail.com' ||
    normalized === 'your_email_password' ||
    normalized === 'changeme'
  );
};

const resolveSmtpConfig = () => {
  const host = normalize(process.env.SMTP_HOST);
  const user = normalize(process.env.SMTP_USER);
  const pass = normalize(process.env.SMTP_PASS);
  const rawPort = normalize(process.env.SMTP_PORT);

  if (!host || isPlaceholderValue(user) || isPlaceholderValue(pass)) {
    return null;
  }

  const secureByPort = rawPort === '465';
  const secure = isTruthy(process.env.SMTP_SECURE, secureByPort);
  const port = Number(rawPort || (secure ? 465 : 587));

  if (!Number.isFinite(port) || port <= 0) {
    throw new Error('SMTP_PORT must be a valid positive number');
  }

  return {
    config: {
      host,
      port,
      secure,
      auth: {
        user,
        pass
      }
    },
    user
  };
};

const resolveGmailConfig = () => {
  const user = normalize(process.env.EMAIL_USER);
  const pass = normalize(process.env.EMAIL_PASS);
  if (isPlaceholderValue(user) || isPlaceholderValue(pass)) {
    return null;
  }

  return {
    config: {
      service: 'gmail',
      auth: {
        user,
        pass
      }
    },
    user
  };
};

const resolveTransportConfig = () => {
  if (cachedResolvedConfig) return cachedResolvedConfig;

  const resolved = resolveSmtpConfig() || resolveGmailConfig();
  cachedResolvedConfig = resolved;
  return resolved;
};

const getTransporter = () => {
  if (cachedTransporter) return cachedTransporter;

  const resolved = resolveTransportConfig();
  if (!resolved) {
    throw new Error(
      'Email transport is not configured. Set SMTP_HOST/SMTP_USER/SMTP_PASS (recommended) or EMAIL_USER/EMAIL_PASS.'
    );
  }

  cachedTransporter = nodemailer.createTransport(resolved.config);
  return cachedTransporter;
};

const getFromAddress = () => {
  const explicitFrom = normalize(process.env.SMTP_FROM || process.env.EMAIL_FROM || process.env.MAIL_FROM);
  if (!isPlaceholderValue(explicitFrom)) return explicitFrom;

  const resolved = resolveTransportConfig();
  return resolved?.user || '';
};

const getContactReceiverAddress = () => {
  const receiver = normalize(process.env.CONTACT_RECEIVER_EMAIL || process.env.ADMIN_EMAIL);
  return isPlaceholderValue(receiver) ? '' : receiver;
};

module.exports = {
  getTransporter,
  getFromAddress,
  getContactReceiverAddress
};

