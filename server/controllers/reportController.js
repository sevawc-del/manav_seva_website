// Report Controller
const crypto = require('crypto');
const fs = require('fs/promises');
const cloudinary = require('../config/cloudinary');
const Report = require('../models/Report');
const ReportAccessRequest = require('../models/ReportAccessRequest');
const {
  extractFileExtension,
  stripExtensionFromPath,
  extractCloudinaryAssetPathFromUrl,
  deleteCloudinaryAsset,
  buildSignedCloudinaryDownloadUrl
} = require('../utils/cloudinaryAsset');

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

const normalizeReportPayload = (payload = {}, fallbackReport = null) => {
  const resolvedCategory = String(
    payload.category ??
      fallbackReport?.category ??
      'General'
  ).trim();
  const resolvedVisibility = String(
    payload.visibility ??
      fallbackReport?.visibility ??
      'public'
  ).trim().toLowerCase();

  return {
    ...payload,
    category: resolvedCategory || 'General',
    visibility: resolvedVisibility === 'protected' ? 'protected' : 'public',
    filePublicId: String(payload.filePublicId ?? fallbackReport?.filePublicId ?? '').trim(),
    fileResourceType: String(
      payload.fileResourceType ??
        fallbackReport?.fileResourceType ??
        ''
    ).trim().toLowerCase(),
    fileFormat: String(
      payload.fileFormat ??
        fallbackReport?.fileFormat ??
        ''
    ).trim().toLowerCase()
  };
};

const inferReportCloudinaryMeta = (source = {}) => {
  const fileUrl = String(source?.file || '').trim();
  const assetPathFromUrl = extractCloudinaryAssetPathFromUrl(fileUrl);
  const filePublicId = String(source?.filePublicId || '').trim() || assetPathFromUrl;
  const fileResourceType = String(source?.fileResourceType || '').trim().toLowerCase() ||
    (fileUrl.includes('/image/upload/') ? 'image' : fileUrl.includes('/raw/upload/') ? 'raw' : '');
  const fileFormat = String(source?.fileFormat || '').trim().toLowerCase() ||
    extractFileExtension(fileUrl) ||
    extractFileExtension(filePublicId);

  return {
    fileUrl,
    filePublicId,
    fileResourceType,
    fileFormat
  };
};

const deleteReportCloudinaryFile = async (source = {}) => {
  try {
    const meta = inferReportCloudinaryMeta(source);
    await deleteCloudinaryAsset({
      assetUrl: meta.fileUrl,
      publicId: meta.filePublicId,
      resourceType: meta.fileResourceType,
      fileFormat: meta.fileFormat,
      fallbackResourceTypes: ['raw', 'image'],
      invalidate: true
    });
  } catch (error) {
    console.error('Report file delete error:', error.message);
  }
};

const buildReportPreviewUrl = (source = {}) => {
  const meta = inferReportCloudinaryMeta(source);
  if (meta.fileFormat !== 'pdf') return '';

  const directPdfUrl = meta.fileUrl;
  if (directPdfUrl.includes('/image/upload/') && /\.pdf(?:$|\?)/i.test(directPdfUrl)) {
    const [base, query = ''] = directPdfUrl.split('?');
    const previewBase = base
      .replace('/image/upload/', '/image/upload/pg_1,f_jpg,q_auto/')
      .replace(/\.pdf$/i, '.jpg');
    return query ? `${previewBase}?${query}` : previewBase;
  }

  // PDF uploaded as raw cannot be transformed to image preview reliably.
  if (!meta.filePublicId || meta.fileResourceType !== 'image') {
    return '';
  }

  const imagePublicId = stripExtensionFromPath(meta.filePublicId);
  return cloudinary.url(imagePublicId, {
    secure: true,
    sign_url: true,
    resource_type: 'image',
    type: 'upload',
    format: 'jpg',
    transformation: [
      { page: 1, quality: 'auto' }
    ]
  });
};

const serializePublicReport = (report) => {
  const source = typeof report?.toObject === 'function' ? report.toObject() : report;
  const visibility = source?.visibility === 'protected' ? 'protected' : 'public';
  const previewUrl = buildReportPreviewUrl(source);
  return {
    ...source,
    category: String(source?.category || '').trim() || 'General',
    visibility,
    hasFile: Boolean(source?.file),
    file: visibility === 'protected' ? '' : (source?.file || ''),
    fileUrl: visibility === 'protected' ? '' : (source?.file || ''),
    previewUrl
  };
};

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const generateAccessToken = async () => {
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const token = crypto.randomBytes(24).toString('hex');
    const exists = await ReportAccessRequest.findOne({ accessToken: token }).select('_id').lean();
    if (!exists) return token;
  }
  throw new Error('Failed to generate unique access token');
};

const resolveReportFileUrl = async (report, { attachment = true } = {}) => {
  const source = typeof report?.toObject === 'function' ? report.toObject() : report;
  const meta = inferReportCloudinaryMeta(source);
  if (!meta.fileUrl) return '';
  if (!meta.fileUrl.includes('res.cloudinary.com')) return meta.fileUrl;

  const signedUrl = await buildSignedCloudinaryDownloadUrl({
    assetUrl: meta.fileUrl,
    publicId: meta.filePublicId,
    resourceType: meta.fileResourceType,
    fileFormat: meta.fileFormat,
    fallbackResourceTypes: ['raw', 'image'],
    attachment,
    ttlSeconds: 600
  });
  return signedUrl || meta.fileUrl;
};

const getAllReports = async (req, res) => {
  try {
    const reports = await Report.find().sort({ year: -1, createdAt: -1 });
    res.json(reports.map(serializePublicReport));
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

const getAllReportsAdmin = async (req, res) => {
  try {
    const reports = await Report.find().sort({ year: -1, createdAt: -1 });
    res.json(reports);
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

const getReportById = async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);
    if (!report) return res.status(404).json({ message: 'Report not found' });
    res.json(serializePublicReport(report));
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

const createReport = async (req, res) => {
  const report = new Report(normalizeReportPayload(req.body));
  try {
    const newReport = await report.save();
    res.status(201).json(newReport);
  } catch (error) {
    res.status(400).json({ message: 'Invalid request data' });
  }
};

const updateReport = async (req, res) => {
  try {
    const existingReport = await Report.findById(req.params.id);
    if (!existingReport) return res.status(404).json({ message: 'Report not found' });

    const payload = normalizeReportPayload(req.body, existingReport);
    const updatedReport = await Report.findByIdAndUpdate(req.params.id, payload, { new: true });
    if (!updatedReport) return res.status(404).json({ message: 'Report not found' });

    const previousFileUrl = String(existingReport.file || '').trim();
    const nextFileUrl = String(updatedReport.file || '').trim();
    if (previousFileUrl && previousFileUrl !== nextFileUrl) {
      await deleteReportCloudinaryFile(existingReport);
    }

    res.json(updatedReport);
  } catch (error) {
    res.status(400).json({ message: 'Invalid request data' });
  }
};

const deleteReport = async (req, res) => {
  try {
    const deletedReport = await Report.findByIdAndDelete(req.params.id);
    if (!deletedReport) return res.status(404).json({ message: 'Report not found' });

    await deleteReportCloudinaryFile(deletedReport);

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
    const mimeType = String(req.file?.mimetype || '').toLowerCase();
    const isPdf = mimeType === 'application/pdf';
    const uploadResourceType = isPdf ? 'image' : 'raw';
    const fileFormat = extractFileExtension(req.file?.originalname || '') || (isPdf ? 'pdf' : '');

    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: 'manav-seva/reports',
      resource_type: uploadResourceType
    });

    await cleanupTempUpload(req.file.path);
    return res.status(200).json({
      fileUrl: result.secure_url,
      filePublicId: result.public_id || '',
      fileResourceType: uploadResourceType,
      fileFormat
    });
  } catch (error) {
    await cleanupTempUpload(req.file.path);
    console.error('Report file upload error:', error.message);
    return res.status(500).json({ message: 'Failed to upload file' });
  }
};

const createReportAccessRequest = async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);
    if (!report) return res.status(404).json({ message: 'Report not found' });
    if ((report.visibility || 'public') !== 'protected') {
      return res.status(400).json({ message: 'This report is public and does not require access approval.' });
    }

    const requesterName = String(req.body.requesterName || '').trim();
    const requesterEmail = String(req.body.requesterEmail || '').trim().toLowerCase();
    const requesterPhone = String(req.body.requesterPhone || '').trim();
    const organization = String(req.body.organization || '').trim();
    const purpose = String(req.body.purpose || '').trim();

    if (!requesterName || !requesterEmail || !purpose) {
      return res.status(400).json({ message: 'Name, email, and purpose are required.' });
    }
    if (!emailRegex.test(requesterEmail)) {
      return res.status(400).json({ message: 'Please provide a valid email address.' });
    }

    const latestExisting = await ReportAccessRequest.findOne({
      reportId: report._id,
      requesterEmail
    }).sort({ createdAt: -1 });

    if (latestExisting && latestExisting.status === 'pending') {
      return res.status(200).json({
        requestId: latestExisting._id,
        status: latestExisting.status,
        accessToken: latestExisting.accessToken,
        message: 'Your request is already pending review.'
      });
    }

    if (
      latestExisting &&
      latestExisting.status === 'approved' &&
      (!latestExisting.tokenExpiresAt || latestExisting.tokenExpiresAt > new Date())
    ) {
      return res.status(200).json({
        requestId: latestExisting._id,
        status: latestExisting.status,
        accessToken: latestExisting.accessToken,
        message: 'Your access is already approved.'
      });
    }

    const accessToken = await generateAccessToken();
    const accessRequest = await ReportAccessRequest.create({
      reportId: report._id,
      requesterName,
      requesterEmail,
      requesterPhone,
      organization,
      purpose,
      status: 'pending',
      accessToken
    });

    return res.status(201).json({
      requestId: accessRequest._id,
      status: accessRequest.status,
      accessToken: accessRequest.accessToken,
      message: 'Access request submitted successfully. Please wait for admin approval.'
    });
  } catch (error) {
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

const getReportAccessRequests = async (req, res) => {
  try {
    const requests = await ReportAccessRequest.find()
      .populate('reportId', 'title year category visibility')
      .sort({ createdAt: -1 });
    return res.json(requests);
  } catch (error) {
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

const updateReportAccessRequestStatus = async (req, res) => {
  try {
    const requestItem = await ReportAccessRequest.findById(req.params.id);
    if (!requestItem) return res.status(404).json({ message: 'Access request not found' });

    const nextStatus = String(req.body.status || '').trim().toLowerCase();
    if (!['pending', 'approved', 'rejected'].includes(nextStatus)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }

    requestItem.status = nextStatus;
    requestItem.reviewerNote = String(req.body.reviewerNote || '').trim();
    requestItem.reviewedAt = new Date();
    requestItem.reviewedBy = req.user?.id || null;

    if (nextStatus === 'approved') {
      // Protected report access is valid for 24 hours from approval.
      requestItem.tokenExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
    } else {
      requestItem.tokenExpiresAt = null;
    }

    await requestItem.save();
    return res.json(requestItem);
  } catch (error) {
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

const getReportDownloadLink = async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);
    if (!report) return res.status(404).json({ message: 'Report not found' });
    if (!report.file) return res.status(404).json({ message: 'Report file is not available' });

    const visibility = report.visibility || 'public';
    if (visibility === 'protected') {
      const accessToken = String(req.query.accessToken || '').trim();
      if (!accessToken) {
        return res.status(403).json({ message: 'Access token is required for protected reports.' });
      }

      const accessRequest = await ReportAccessRequest.findOne({
        reportId: report._id,
        accessToken
      });

      if (!accessRequest) {
        return res.status(403).json({ message: 'Invalid access token for this report.' });
      }

      if (accessRequest.status === 'pending') {
        return res.status(403).json({ message: 'Your request is pending admin approval.' });
      }

      if (accessRequest.status === 'rejected') {
        return res.status(403).json({ message: 'Your access request was rejected.' });
      }

      if (accessRequest.tokenExpiresAt && accessRequest.tokenExpiresAt < new Date()) {
        return res.status(403).json({ message: 'Your access token has expired. Please request access again.' });
      }
    }

    const requestedMode = String(req.query.mode || '').trim().toLowerCase();
    const shouldForceAttachment = requestedMode !== 'view';
    const resolvedDownloadUrl = await resolveReportFileUrl(report, {
      attachment: shouldForceAttachment
    });
    if (!resolvedDownloadUrl) {
      return res.status(404).json({ message: 'Report download URL is not available' });
    }

    return res.json({ downloadUrl: resolvedDownloadUrl });
  } catch (error) {
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

module.exports = {
  getAllReports,
  getAllReportsAdmin,
  getReportById,
  createReport,
  updateReport,
  deleteReport,
  uploadReportFile,
  createReportAccessRequest,
  getReportAccessRequests,
  updateReportAccessRequestStatus,
  getReportDownloadLink
};

