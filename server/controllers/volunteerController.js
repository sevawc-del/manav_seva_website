const Volunteer = require('../models/Volunteer');
const VolunteerApplication = require('../models/VolunteerApplication');

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
  try {
    const { volunteerId, name, email, phone, message } = req.body;
    const application = new VolunteerApplication({
      volunteerId,
      name,
      email,
      phone,
      message
    });
    await application.save();
    res.status(201).json({ message: 'Application submitted successfully' });
  } catch (error) {
    res.status(400).json({ message: 'Invalid request data' });
  }
};

// Get all volunteer applications (admin)
const getAllVolunteerApplications = async (req, res) => {
  try {
    const applications = await VolunteerApplication.find().populate('volunteerId').sort({ createdAt: -1 });
    res.json(applications);
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

// Update volunteer application status (admin)
const updateVolunteerApplicationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const application = await VolunteerApplication.findByIdAndUpdate(
      id,
      { status, updatedAt: Date.now() },
      { new: true }
    );
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }
    res.json(application);
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

module.exports = {
  getVolunteers,
  getVolunteerById,
  getAllVolunteers,
  createVolunteer,
  updateVolunteer,
  deleteVolunteer,
  createVolunteerApplication,
  getAllVolunteerApplications,
  updateVolunteerApplicationStatus
};

