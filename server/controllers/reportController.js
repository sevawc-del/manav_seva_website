// Report Controller
const fs = require('fs/promises');
const cloudinary = require('../config/cloudinary');
const Report = require('../models/Report');

const cleanupTempUpload = async (filePath) => {
  if (!filePath) return;
  try {
    await fs.unlink(filePath);
  } catch (error) {
    if (error.code !== 'ENOENT') {
      console.error('Temp upload cleanup error:', error.message);
    }
  }
};

const getAllReports = async (req, res) => {
  try {
    const reports = await Report.find();
    res.json(reports);
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

const getReportById = async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);
    if (!report) return res.status(404).json({ message: 'Report not found' });
    res.json(report);
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

const createReport = async (req, res) => {
  const report = new Report(req.body);
  try {
    const newReport = await report.save();
    res.status(201).json(newReport);
  } catch (error) {
    res.status(400).json({ message: 'Invalid request data' });
  }
};

const updateReport = async (req, res) => {
  try {
    const updatedReport = await Report.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedReport) return res.status(404).json({ message: 'Report not found' });
    res.json(updatedReport);
  } catch (error) {
    res.status(400).json({ message: 'Invalid request data' });
  }
};

const deleteReport = async (req, res) => {
  try {
    const deletedReport = await Report.findByIdAndDelete(req.params.id);
    if (!deletedReport) return res.status(404).json({ message: 'Report not found' });
    res.json({ message: 'Report deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

const uploadReportFile = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'File is required' });
  }

  try {
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: 'manav-seva/reports',
      resource_type: 'raw'
    });

    await cleanupTempUpload(req.file.path);
    return res.status(200).json({ fileUrl: result.secure_url });
  } catch (error) {
    await cleanupTempUpload(req.file.path);
    console.error('Report file upload error:', error.message);
    return res.status(500).json({ message: 'Failed to upload file' });
  }
};

module.exports = {
  getAllReports,
  getReportById,
  createReport,
  updateReport,
  deleteReport,
  uploadReportFile,
};

