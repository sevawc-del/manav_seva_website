const Event = require('../models/Event');
const cloudinary = require('../config/cloudinary');
const fs = require('fs/promises');
const { deleteCloudinaryAsset } = require('../utils/cloudinaryAsset');

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

const slugify = (value = '') =>
  String(value)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

const generateUniqueSlug = async (title, requestedSlug, currentId = null) => {
  const baseSlug = slugify(requestedSlug || title);
  if (!baseSlug) return '';

  let candidate = baseSlug;
  let suffix = 1;

  while (true) {
    const existing = await Event.findOne({ slug: candidate });
    if (!existing || String(existing._id) === String(currentId)) {
      return candidate;
    }
    suffix += 1;
    candidate = `${baseSlug}-${suffix}`;
  }
};

const normalizeEventPayload = (body = {}) => ({
  title: body.title,
  slug: body.slug,
  description: body.description || '',
  content: body.content || '',
  image: body.image || '',
  startDateTime: body.startDateTime,
  endDateTime: body.endDateTime || null,
  location: body.location || '',
  isOnline: body.isOnline === true || body.isOnline === 'true',
  registrationLink: body.registrationLink || '',
  isPublished: body.isPublished === undefined ? true : (body.isPublished === true || body.isPublished === 'true'),
  isFeatured: body.isFeatured === true || body.isFeatured === 'true'
});

const deleteCloudinaryImage = async (imageUrl) => {
  try {
    await deleteCloudinaryAsset({
      assetUrl: imageUrl,
      resourceType: 'image',
      fallbackResourceTypes: ['image'],
      invalidate: true
    });
  } catch (error) {
    console.error('Cloudinary delete error:', error.message);
  }
};

const getPublicEvents = async (req, res) => {
  try {
    const events = await Event.find({ isPublished: true }).sort({ startDateTime: 1 });
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

const getAllEventsAdmin = async (req, res) => {
  try {
    const events = await Event.find().sort({ startDateTime: -1 });
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

const getEventBySlug = async (req, res) => {
  try {
    const event = await Event.findOne({ slug: req.params.slug, isPublished: true });
    if (!event) return res.status(404).json({ message: 'Event not found' });
    res.json(event);
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

const createEvent = async (req, res) => {
  try {
    const payload = normalizeEventPayload(req.body);
    if (req.file) {
      try {
        const result = await cloudinary.uploader.upload(req.file.path, {
          folder: 'manav-seva/events',
          resource_type: 'image'
        });
        payload.image = result.secure_url;
        await cleanupTempUpload(req.file.path);
      } catch (uploadError) {
        await cleanupTempUpload(req.file.path);
        console.error('Cloudinary upload error:', uploadError);
        return res.status(500).json({ message: 'Failed to upload image' });
      }
    }

    payload.slug = await generateUniqueSlug(payload.title, payload.slug);
    const event = new Event(payload);
    const savedEvent = await event.save();
    res.status(201).json(savedEvent);
  } catch (error) {
    res.status(400).json({ message: 'Invalid request data' });
  }
};

const uploadEventImage = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'Image file is required' });
  }

  try {
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: 'manav-seva/events',
      resource_type: 'image'
    });

    await cleanupTempUpload(req.file.path);
    return res.status(200).json({ imageUrl: result.secure_url });
  } catch (error) {
    await cleanupTempUpload(req.file.path);
    console.error('Event inline image upload error:', error.message);
    return res.status(500).json({ message: 'Failed to upload image' });
  }
};

const updateEvent = async (req, res) => {
  try {
    const existingEvent = await Event.findById(req.params.id);
    if (!existingEvent) return res.status(404).json({ message: 'Event not found' });

    const payload = normalizeEventPayload({
      ...existingEvent.toObject(),
      ...req.body
    });

    if (req.file) {
      try {
        const result = await cloudinary.uploader.upload(req.file.path, {
          folder: 'manav-seva/events',
          resource_type: 'image'
        });
        payload.image = result.secure_url;
        await cleanupTempUpload(req.file.path);
      } catch (uploadError) {
        await cleanupTempUpload(req.file.path);
        console.error('Cloudinary upload error:', uploadError);
        return res.status(500).json({ message: 'Failed to upload image' });
      }
    }

    payload.slug = await generateUniqueSlug(payload.title, payload.slug, req.params.id);
    payload.updatedAt = Date.now();

    const updatedEvent = await Event.findByIdAndUpdate(req.params.id, payload, { new: true });

    if (updatedEvent?.image && existingEvent.image && updatedEvent.image !== existingEvent.image) {
      await deleteCloudinaryImage(existingEvent.image);
    }

    res.json(updatedEvent);
  } catch (error) {
    res.status(400).json({ message: 'Invalid request data' });
  }
};

const deleteEvent = async (req, res) => {
  try {
    const deletedEvent = await Event.findByIdAndDelete(req.params.id);
    if (!deletedEvent) return res.status(404).json({ message: 'Event not found' });

    await deleteCloudinaryImage(deletedEvent.image);

    res.json({ message: 'Event deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

module.exports = {
  getPublicEvents,
  getAllEventsAdmin,
  getEventBySlug,
  createEvent,
  uploadEventImage,
  updateEvent,
  deleteEvent
};
