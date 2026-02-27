// Tender Controller
const fs = require('fs/promises');
const cloudinary = require('../config/cloudinary');
const Tender = require('../models/Tender');

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

const normalizeDocuments = (documents) => {
  if (Array.isArray(documents)) {
    return documents.map((doc) => String(doc || '').trim()).filter(Boolean);
  }
  if (typeof documents === 'string') {
    const value = documents.trim();
    return value ? [value] : [];
  }
  return [];
};

const pickTenderFields = (body = {}) => ({
  title: body.title,
  description: body.description,
  deadline: body.deadline,
  documents: normalizeDocuments(body.documents)
});

const getAllTenders = async (req, res) => {
  try {
    const tenders = await Tender.find();
    res.json(tenders);
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

const getTenderById = async (req, res) => {
  try {
    const tender = await Tender.findById(req.params.id);
    if (!tender) return res.status(404).json({ message: 'Tender not found' });
    res.json(tender);
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

const createTender = async (req, res) => {
  const tender = new Tender(pickTenderFields(req.body));
  try {
    const newTender = await tender.save();
    res.status(201).json(newTender);
  } catch (error) {
    res.status(400).json({ message: 'Invalid request data' });
  }
};

const updateTender = async (req, res) => {
  try {
    const updatedTender = await Tender.findByIdAndUpdate(
      req.params.id,
      pickTenderFields(req.body),
      { new: true }
    );
    if (!updatedTender) return res.status(404).json({ message: 'Tender not found' });
    res.json(updatedTender);
  } catch (error) {
    res.status(400).json({ message: 'Invalid request data' });
  }
};

const deleteTender = async (req, res) => {
  try {
    const deletedTender = await Tender.findByIdAndDelete(req.params.id);
    if (!deletedTender) return res.status(404).json({ message: 'Tender not found' });
    res.json({ message: 'Tender deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

const uploadTenderDocument = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'File is required' });
  }

  try {
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: 'manav-seva/tenders',
      resource_type: 'raw'
    });

    await cleanupTempUpload(req.file.path);
    return res.status(200).json({ fileUrl: result.secure_url });
  } catch (error) {
    await cleanupTempUpload(req.file.path);
    console.error('Tender file upload error:', error.message);
    return res.status(500).json({ message: 'Failed to upload file' });
  }
};

module.exports = {
  getAllTenders,
  getTenderById,
  createTender,
  updateTender,
  deleteTender,
  uploadTenderDocument,
};

