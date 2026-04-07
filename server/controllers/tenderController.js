// Tender Controller
const fs = require('fs/promises');
const cloudinary = require('../config/cloudinary');
const Tender = require('../models/Tender');
const sendEmail = require('../utils/sendEmail');
const { getContactReceiverAddress } = require('../utils/mailer');
const {
  deleteCloudinaryAsset,
  buildSignedCloudinaryDownloadUrl
} = require('../utils/cloudinaryAsset');

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const objectIdPattern = /^[a-fA-F0-9]{24}$/;

const toTrimmedString = (value) => String(value || '').trim();

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

const isTenderClosed = (tender) => {
  if (!tender?.deadline) return false;
  const deadline = new Date(tender.deadline);
  if (Number.isNaN(deadline.getTime())) return false;
  const deadlineEndOfDay = new Date(deadline);
  deadlineEndOfDay.setHours(23, 59, 59, 999);
  return deadlineEndOfDay < new Date();
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

const deleteTenderCloudinaryDocument = async (documentUrl) => {
  try {
    await deleteCloudinaryAsset({
      assetUrl: documentUrl,
      fallbackResourceTypes: ['raw', 'image'],
      invalidate: true
    });
  } catch (error) {
    console.error('Tender document delete error:', error.message);
  }
};

const resolveTenderDocumentUrl = async (documentUrl, { attachment = false } = {}) => {
  const source = String(documentUrl || '').trim();
  if (!source) return '';
  if (!source.includes('res.cloudinary.com')) return source;

  const signedUrl = await buildSignedCloudinaryDownloadUrl({
    assetUrl: source,
    fallbackResourceTypes: ['raw', 'image'],
    attachment,
    ttlSeconds: 600
  });
  return signedUrl || source;
};

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
    const existingTender = await Tender.findById(req.params.id);
    if (!existingTender) return res.status(404).json({ message: 'Tender not found' });

    const previousDocuments = normalizeDocuments(existingTender.documents);
    const payload = pickTenderFields(req.body);
    if (!Object.prototype.hasOwnProperty.call(req.body, 'documents')) {
      payload.documents = previousDocuments;
    }

    const updatedTender = await Tender.findByIdAndUpdate(
      req.params.id,
      payload,
      { new: true }
    );
    if (!updatedTender) return res.status(404).json({ message: 'Tender not found' });

    const updatedDocuments = normalizeDocuments(updatedTender.documents);
    const removedDocuments = previousDocuments.filter((doc) => !updatedDocuments.includes(doc));
    if (removedDocuments.length > 0) {
      await Promise.all(removedDocuments.map((doc) => deleteTenderCloudinaryDocument(doc)));
    }

    res.json(updatedTender);
  } catch (error) {
    res.status(400).json({ message: 'Invalid request data' });
  }
};

const deleteTender = async (req, res) => {
  try {
    const deletedTender = await Tender.findByIdAndDelete(req.params.id);
    if (!deletedTender) return res.status(404).json({ message: 'Tender not found' });

    const documentsToDelete = normalizeDocuments(deletedTender.documents);
    if (documentsToDelete.length > 0) {
      await Promise.all(documentsToDelete.map((doc) => deleteTenderCloudinaryDocument(doc)));
    }

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

const getTenderDocumentLink = async (req, res) => {
  try {
    const tender = await Tender.findById(req.params.id);
    if (!tender) return res.status(404).json({ message: 'Tender not found' });

    const docs = normalizeDocuments(tender.documents);
    if (!docs.length) {
      return res.status(404).json({ message: 'Tender document is not available' });
    }

    const requestedIndex = Number.parseInt(String(req.query.index || '0'), 10);
    const documentIndex = Number.isNaN(requestedIndex) ? 0 : requestedIndex;
    if (documentIndex < 0 || documentIndex >= docs.length) {
      return res.status(400).json({ message: 'Invalid document index' });
    }

    const requestedMode = String(req.query.mode || '').trim().toLowerCase();
    const shouldForceAttachment = requestedMode === 'download';
    const resolvedUrl = await resolveTenderDocumentUrl(docs[documentIndex], {
      attachment: shouldForceAttachment
    });

    if (!resolvedUrl) {
      return res.status(404).json({ message: 'Document link is not available' });
    }

    return res.json({ downloadUrl: resolvedUrl });
  } catch (error) {
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

const submitTenderApplication = async (req, res) => {
  const {
    tenderId,
    organizationName,
    contactPerson,
    email,
    phone,
    roleInterested,
    companyAddress,
    experience,
    bidAmount,
    websiteUrl,
    proposalSummary
  } = req.body;

  const proposalDocument = req.file;

  try {
    const orgText = toTrimmedString(organizationName);
    const contactText = toTrimmedString(contactPerson);
    const emailText = toTrimmedString(email).toLowerCase();
    const phoneText = toTrimmedString(phone);
    const roleTextInput = toTrimmedString(roleInterested);
    const addressText = toTrimmedString(companyAddress);
    const experienceText = toTrimmedString(experience);
    const bidAmountText = toTrimmedString(bidAmount);
    const websiteText = toTrimmedString(websiteUrl);
    const summaryText = toTrimmedString(proposalSummary);
    const tenderIdText = toTrimmedString(tenderId);

    if (orgText.length < 2 || orgText.length > 150) {
      return res.status(400).json({ message: 'Organization name must be between 2 and 150 characters' });
    }

    if (contactText.length < 2 || contactText.length > 100) {
      return res.status(400).json({ message: 'Contact person must be between 2 and 100 characters' });
    }

    if (!emailPattern.test(emailText)) {
      return res.status(400).json({ message: 'A valid email is required' });
    }

    if (phoneText.length < 7 || phoneText.length > 20) {
      return res.status(400).json({ message: 'Phone must be between 7 and 20 characters' });
    }

    if (addressText.length > 300) {
      return res.status(400).json({ message: 'Company address must not exceed 300 characters' });
    }

    if (experienceText.length > 200) {
      return res.status(400).json({ message: 'Experience details must not exceed 200 characters' });
    }

    if (bidAmountText.length > 100) {
      return res.status(400).json({ message: 'Bid amount must not exceed 100 characters' });
    }

    if (websiteText.length > 300) {
      return res.status(400).json({ message: 'Website URL must not exceed 300 characters' });
    }

    if (summaryText.length > 5000) {
      return res.status(400).json({ message: 'Proposal summary must not exceed 5000 characters' });
    }

    if (!proposalDocument) {
      return res.status(400).json({ message: 'Proposal document upload is required' });
    }

    let selectedTender = null;
    if (tenderIdText) {
      if (!objectIdPattern.test(tenderIdText)) {
        return res.status(400).json({ message: 'Invalid tenderId provided' });
      }
      selectedTender = await Tender.findById(tenderIdText).lean();
      if (!selectedTender) {
        return res.status(404).json({ message: 'Selected tender not found' });
      }
      if (isTenderClosed(selectedTender)) {
        return res.status(400).json({ message: 'This tender is closed for new applications' });
      }
    }

    const roleText = roleTextInput || toTrimmedString(selectedTender?.title);
    if (roleText.length < 2 || roleText.length > 180) {
      return res.status(400).json({ message: 'Role / tender reference must be between 2 and 180 characters' });
    }

    const receiver = getContactReceiverAddress();
    if (!receiver) {
      throw new Error('Contact receiver email is not configured');
    }

    const lines = [
      'A new tender application has been submitted.',
      '',
      `Organization Name: ${orgText}`,
      `Contact Person: ${contactText}`,
      `Email: ${emailText}`,
      `Phone: ${phoneText}`,
      `Tender / Role Interested: ${roleText}`,
      `Selected Tender ID: ${tenderIdText || 'Not provided'}`,
      `Selected Tender Title: ${selectedTender?.title || 'Not provided'}`,
      `Company Address: ${addressText || 'Not provided'}`,
      `Relevant Experience: ${experienceText || 'Not provided'}`,
      `Bid Amount: ${bidAmountText || 'Not provided'}`,
      `Website URL: ${websiteText || 'Not provided'}`,
      '',
      'Proposal Summary:',
      summaryText || 'Not provided'
    ];

    await sendEmail({
      to: receiver,
      subject: `New Tender Application - ${roleText}`,
      replyTo: emailText,
      text: lines.join('\n'),
      attachments: [
        {
          filename: proposalDocument.originalname,
          path: proposalDocument.path,
          contentType: proposalDocument.mimetype
        }
      ]
    });

    return res.status(201).json({ message: 'Tender application submitted successfully' });
  } catch (error) {
    console.error('Tender application submission failed:', error.message);
    return res.status(500).json({ message: 'Unable to submit application right now. Please try again later.' });
  } finally {
    await cleanupTempUpload(proposalDocument?.path);
  }
};

module.exports = {
  getAllTenders,
  getTenderById,
  createTender,
  updateTender,
  deleteTender,
  uploadTenderDocument,
  getTenderDocumentLink,
  submitTenderApplication
};

