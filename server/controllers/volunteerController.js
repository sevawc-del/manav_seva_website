const Volunteer = require('../models/Volunteer');
const fs = require('fs/promises');
const sendEmail = require('../utils/sendEmail');
const { getContactReceiverAddress } = require('../utils/mailer');

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const objectIdPattern = /^[a-fA-F0-9]{24}$/;

const toTrimmedString = (value) => String(value || '').trim();

const cleanupUploadedFile = async (filePath) => {
  if (!filePath) return;
  try {
    await fs.unlink(filePath);
  } catch (error) {
    if (error.code !== 'ENOENT') {
      console.error('Failed to remove uploaded volunteer resume:', error.message);
    }
  }
};

// Get all active volunteers (public)
const getVolunteers = async (req, res) => {
  try {
    const volunteers = await Volunteer.find({ isActive: true }).sort({ createdAt: -1 });
    res.json(volunteers);
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

// Get volunteer by ID (public)
const getVolunteerById = async (req, res) => {
  try {
    const { id } = req.params;
    const volunteer = await Volunteer.findById(id);
    if (!volunteer) {
      return res.status(404).json({ message: 'Volunteer opportunity not found' });
    }
    res.json(volunteer);
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

// Get all volunteers (admin)
const getAllVolunteers = async (req, res) => {
  try {
    const volunteers = await Volunteer.find().sort({ createdAt: -1 });
    res.json(volunteers);
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

// Create volunteer (admin)
const createVolunteer = async (req, res) => {
  try {
    const { title, description, requirements, location, type, commitment, applicationDeadline } = req.body;
    const volunteer = new Volunteer({
      title,
      description,
      requirements,
      location,
      type,
      commitment,
      applicationDeadline
    });
    await volunteer.save();
    res.status(201).json(volunteer);
  } catch (error) {
    res.status(400).json({ message: 'Invalid request data' });
  }
};

// Update volunteer (admin)
const updateVolunteer = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, requirements, location, type, commitment, applicationDeadline, isActive } = req.body;
    const volunteer = await Volunteer.findByIdAndUpdate(
      id,
      { title, description, requirements, location, type, commitment, applicationDeadline, isActive, updatedAt: Date.now() },
      { new: true }
    );
    if (!volunteer) {
      return res.status(404).json({ message: 'Volunteer opportunity not found' });
    }
    res.json(volunteer);
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

// Delete volunteer (admin)
const deleteVolunteer = async (req, res) => {
  try {
    const { id } = req.params;
    const volunteer = await Volunteer.findByIdAndDelete(id);
    if (!volunteer) {
      return res.status(404).json({ message: 'Volunteer opportunity not found' });
    }
    res.json({ message: 'Volunteer opportunity deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

// Create volunteer application (public)
const createVolunteerApplication = async (req, res) => {
  const {
    volunteerId,
    fullName,
    email,
    phone,
    currentLocation,
    yearsOfExperience,
    currentCompany,
    availability,
    roleInterested,
    linkedInUrl,
    portfolioUrl,
    coverLetter
  } = req.body;

  const resume = req.file;

  try {
    const nameText = toTrimmedString(fullName);
    const emailText = toTrimmedString(email).toLowerCase();
    const phoneText = toTrimmedString(phone);
    const locationText = toTrimmedString(currentLocation);
    const experienceText = toTrimmedString(yearsOfExperience);
    const companyText = toTrimmedString(currentCompany);
    const availabilityText = toTrimmedString(availability);
    const linkedInText = toTrimmedString(linkedInUrl);
    const portfolioText = toTrimmedString(portfolioUrl);
    const coverLetterText = toTrimmedString(coverLetter);
    const volunteerIdText = toTrimmedString(volunteerId);

    if (nameText.length < 2 || nameText.length > 100) {
      return res.status(400).json({ message: 'Full name must be between 2 and 100 characters' });
    }

    if (!emailPattern.test(emailText)) {
      return res.status(400).json({ message: 'A valid email is required' });
    }

    if (phoneText.length < 7 || phoneText.length > 20) {
      return res.status(400).json({ message: 'Phone must be between 7 and 20 characters' });
    }

    if (locationText.length > 120) {
      return res.status(400).json({ message: 'Current location must not exceed 120 characters' });
    }

    if (experienceText.length > 120) {
      return res.status(400).json({ message: 'Relevant experience must not exceed 120 characters' });
    }

    if (companyText.length > 120) {
      return res.status(400).json({ message: 'Current organization must not exceed 120 characters' });
    }

    if (availabilityText.length > 120) {
      return res.status(400).json({ message: 'Availability must not exceed 120 characters' });
    }

    if (linkedInText.length > 300) {
      return res.status(400).json({ message: 'LinkedIn URL must not exceed 300 characters' });
    }

    if (portfolioText.length > 300) {
      return res.status(400).json({ message: 'Portfolio URL must not exceed 300 characters' });
    }

    if (coverLetterText.length > 5000) {
      return res.status(400).json({ message: 'Cover letter must not exceed 5000 characters' });
    }

    if (!resume) {
      return res.status(400).json({ message: 'Resume upload is required' });
    }

    let selectedVolunteer = null;
    if (volunteerIdText) {
      if (!objectIdPattern.test(volunteerIdText)) {
        return res.status(400).json({ message: 'Invalid volunteerId provided' });
      }
      selectedVolunteer = await Volunteer.findById(volunteerIdText).lean();
      if (!selectedVolunteer) {
        return res.status(404).json({ message: 'Selected volunteer opportunity not found' });
      }
    }

    const roleText = toTrimmedString(roleInterested) || toTrimmedString(selectedVolunteer?.title);
    if (roleText.length < 2 || roleText.length > 150) {
      return res.status(400).json({ message: 'Role interested must be between 2 and 150 characters' });
    }

    const receiver = getContactReceiverAddress();
    if (!receiver) {
      throw new Error('Contact receiver email is not configured');
    }

    const lines = [
      'A new volunteer application has been submitted.',
      '',
      `Name: ${nameText}`,
      `Email: ${emailText}`,
      `Phone: ${phoneText}`,
      `Role Interested: ${roleText}`,
      `Selected Volunteer ID: ${volunteerIdText || 'Not provided'}`,
      `Selected Volunteer Title: ${selectedVolunteer?.title || 'Not provided'}`,
      `Current Location: ${locationText || 'Not provided'}`,
      `Relevant Experience: ${experienceText || 'Not provided'}`,
      `Current Organization / College: ${companyText || 'Not provided'}`,
      `Availability: ${availabilityText || 'Not provided'}`,
      `LinkedIn URL: ${linkedInText || 'Not provided'}`,
      `Portfolio URL: ${portfolioText || 'Not provided'}`,
      '',
      'Motivation / Cover Letter:',
      coverLetterText || 'Not provided'
    ];

    await sendEmail({
      to: receiver,
      subject: `New Volunteer Application - ${roleText}`,
      replyTo: emailText,
      text: lines.join('\n'),
      attachments: [
        {
          filename: resume.originalname,
          path: resume.path,
          contentType: resume.mimetype
        }
      ]
    });

    return res.status(201).json({ message: 'Application submitted successfully' });
  } catch (error) {
    console.error('Volunteer application submission failed:', error.message);
    return res.status(500).json({ message: 'Unable to submit application right now. Please try again later.' });
  } finally {
    await cleanupUploadedFile(resume?.path);
  }
};

module.exports = {
  getVolunteers,
  getVolunteerById,
  getAllVolunteers,
  createVolunteer,
  updateVolunteer,
  deleteVolunteer,
  createVolunteerApplication
};

