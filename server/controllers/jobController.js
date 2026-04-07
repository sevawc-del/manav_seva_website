const Job = require('../models/Job');
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
      console.error('Failed to remove uploaded resume:', error.message);
    }
  }
};

// Get all active jobs (public)
const getJobs = async (req, res) => {
  try {
    const jobs = await Job.find({ isActive: true }).sort({ _id: -1 }).lean();
    res.json(jobs);
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

// Get job by ID (public)
const getJobById = async (req, res) => {
  try {
    const { id } = req.params;
    const job = await Job.findById(id);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }
    res.json(job);
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

// Get all jobs (admin)
const getAllJobs = async (req, res) => {
  try {
    const jobs = await Job.find().lean();
    res.json(jobs);
  } catch (error) {
    console.error('Error fetching all jobs:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

// Create job (admin)
const createJob = async (req, res) => {
  try {
    const { title, description, requirements, location, type, salary, applicationDeadline } = req.body;
    const job = new Job({
      title,
      description,
      requirements,
      location,
      type,
      salary,
      applicationDeadline
    });
    await job.save();
    res.status(201).json(job);
  } catch (error) {
    res.status(400).json({ message: 'Invalid request data' });
  }
};

// Update job (admin)
const updateJob = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, requirements, location, type, salary, applicationDeadline, isActive } = req.body;
    const job = await Job.findByIdAndUpdate(
      id,
      { title, description, requirements, location, type, salary, applicationDeadline, isActive, updatedAt: Date.now() },
      { new: true }
    );
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }
    res.json(job);
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

// Delete job (admin)
const deleteJob = async (req, res) => {
  try {
    const { id } = req.params;
    const job = await Job.findByIdAndDelete(id);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }
    res.json({ message: 'Job deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

// Submit job application (public)
const submitJobApplication = async (req, res) => {
  const {
    jobId,
    fullName,
    email,
    phone,
    currentLocation,
    yearsOfExperience,
    currentCompany,
    noticePeriod,
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
    const noticeText = toTrimmedString(noticePeriod);
    const linkedInText = toTrimmedString(linkedInUrl);
    const portfolioText = toTrimmedString(portfolioUrl);
    const coverLetterText = toTrimmedString(coverLetter);
    const jobIdText = toTrimmedString(jobId);

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

    if (experienceText.length > 50) {
      return res.status(400).json({ message: 'Years of experience must not exceed 50 characters' });
    }

    if (companyText.length > 120) {
      return res.status(400).json({ message: 'Current company must not exceed 120 characters' });
    }

    if (noticeText.length > 120) {
      return res.status(400).json({ message: 'Notice period must not exceed 120 characters' });
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

    let selectedJob = null;
    if (jobIdText) {
      if (!objectIdPattern.test(jobIdText)) {
        return res.status(400).json({ message: 'Invalid jobId provided' });
      }
      selectedJob = await Job.findById(jobIdText).lean();
      if (!selectedJob) {
        return res.status(404).json({ message: 'Selected job not found' });
      }
    }

    const roleText = toTrimmedString(roleInterested) || toTrimmedString(selectedJob?.title);
    if (roleText.length < 2 || roleText.length > 150) {
      return res.status(400).json({ message: 'Role interested must be between 2 and 150 characters' });
    }

    const receiver = getContactReceiverAddress();
    if (!receiver) {
      throw new Error('Contact receiver email is not configured');
    }

    const lines = [
      'A new career application has been submitted.',
      '',
      `Name: ${nameText}`,
      `Email: ${emailText}`,
      `Phone: ${phoneText}`,
      `Role Interested: ${roleText}`,
      `Selected Job ID: ${jobIdText || 'Not provided'}`,
      `Selected Job Title: ${selectedJob?.title || 'Not provided'}`,
      `Current Location: ${locationText || 'Not provided'}`,
      `Years of Experience: ${experienceText || 'Not provided'}`,
      `Current Company: ${companyText || 'Not provided'}`,
      `Notice Period: ${noticeText || 'Not provided'}`,
      `LinkedIn URL: ${linkedInText || 'Not provided'}`,
      `Portfolio URL: ${portfolioText || 'Not provided'}`,
      '',
      'Cover Letter:',
      coverLetterText || 'Not provided'
    ];

    await sendEmail({
      to: receiver,
      subject: `New Career Application - ${roleText}`,
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
    console.error('Career application submission failed:', error.message);
    return res.status(500).json({ message: 'Unable to submit application right now. Please try again later.' });
  } finally {
    await cleanupUploadedFile(resume?.path);
  }
};

module.exports = {
  getJobs,
  getJobById,
  getAllJobs,
  createJob,
  updateJob,
  deleteJob,
  submitJobApplication
};

