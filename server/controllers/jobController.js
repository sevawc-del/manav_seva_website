const Job = require('../models/Job');

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

module.exports = {
  getJobs,
  getJobById,
  getAllJobs,
  createJob,
  updateJob,
  deleteJob
};

