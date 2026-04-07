const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const isNonEmptyString = (value, min = 1, max = 2000) =>
  typeof value === 'string' && value.trim().length >= min && value.trim().length <= max;

const validateRegister = (req, res, next) => {
  const { username, email, password } = req.body;
  if (!isNonEmptyString(username, 3, 50)) {
    return res.status(400).json({ message: 'Username must be between 3 and 50 characters' });
  }
  if (!isNonEmptyString(email, 5, 254) || !emailPattern.test(email)) {
    return res.status(400).json({ message: 'A valid email is required' });
  }
  if (!isNonEmptyString(password, 8, 128)) {
    return res.status(400).json({ message: 'Password must be between 8 and 128 characters' });
  }
  next();
};

const validateLogin = (req, res, next) => {
  const { email, password } = req.body;
  if (!isNonEmptyString(email, 5, 254) || !emailPattern.test(email)) {
    return res.status(400).json({ message: 'A valid email is required' });
  }
  if (!isNonEmptyString(password, 1, 128)) {
    return res.status(400).json({ message: 'Password is required' });
  }
  next();
};

const validateContact = (req, res, next) => {
  const { name, email, message } = req.body;
  if (!isNonEmptyString(name, 2, 100)) {
    return res.status(400).json({ message: 'Name must be between 2 and 100 characters' });
  }
  if (!isNonEmptyString(email, 5, 254) || !emailPattern.test(email)) {
    return res.status(400).json({ message: 'A valid email is required' });
  }
  if (!isNonEmptyString(message, 5, 5000)) {
    return res.status(400).json({ message: 'Message must be between 5 and 5000 characters' });
  }
  next();
};

const validateTestimonial = (req, res, next) => {
  const { name, email, quote, designation, location, consentToPublish } = req.body;

  if (!isNonEmptyString(name, 2, 100)) {
    return res.status(400).json({ message: 'Name must be between 2 and 100 characters' });
  }

  if (!isNonEmptyString(email, 5, 254) || !emailPattern.test(email)) {
    return res.status(400).json({ message: 'A valid email is required' });
  }

  if (!isNonEmptyString(quote, 5, 3000)) {
    return res.status(400).json({ message: 'Feedback must be between 5 and 3000 characters' });
  }

  if (designation && !isNonEmptyString(designation, 2, 120)) {
    return res.status(400).json({ message: 'Designation must be between 2 and 120 characters' });
  }

  if (location && !isNonEmptyString(location, 2, 120)) {
    return res.status(400).json({ message: 'Location must be between 2 and 120 characters' });
  }

  if (!(consentToPublish === true || consentToPublish === 'true')) {
    return res.status(400).json({ message: 'Consent to publish is required' });
  }

  next();
};

module.exports = {
  validateRegister,
  validateLogin,
  validateContact,
  validateTestimonial
};
