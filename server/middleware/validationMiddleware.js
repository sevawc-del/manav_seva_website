const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const objectIdPattern = /^[a-fA-F0-9]{24}$/;

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

const validateVolunteerApplication = (req, res, next) => {
  const { volunteerId, name, email, phone } = req.body;
  if (!isNonEmptyString(volunteerId, 24, 24) || !objectIdPattern.test(volunteerId)) {
    return res.status(400).json({ message: 'A valid volunteerId is required' });
  }
  if (!isNonEmptyString(name, 2, 100)) {
    return res.status(400).json({ message: 'Name must be between 2 and 100 characters' });
  }
  if (!isNonEmptyString(email, 5, 254) || !emailPattern.test(email)) {
    return res.status(400).json({ message: 'A valid email is required' });
  }
  if (!isNonEmptyString(phone, 7, 20)) {
    return res.status(400).json({ message: 'Phone must be between 7 and 20 characters' });
  }
  next();
};

module.exports = {
  validateRegister,
  validateLogin,
  validateContact,
  validateVolunteerApplication
};
