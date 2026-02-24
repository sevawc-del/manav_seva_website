// News Controller
const News = require('../models/News');
const cloudinary = require('../config/cloudinary');
const fs = require('fs/promises');

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
    const existing = await News.findOne({ slug: candidate });
    if (!existing || String(existing._id) === String(currentId)) {
      return candidate;
    }
    suffix += 1;
    candidate = `${baseSlug}-${suffix}`;
  }
};

const pickNewsFields = (body = {}) => ({
  title: body.title,
  slug: body.slug,
  content: body.content,
  date: body.date,
  image: body.image
});

const getAllNews = async (req, res) => {
  try {
    const news = await News.find();
    res.json(news);
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

const getNewsById = async (req, res) => {
  try {
    const news = await News.findById(req.params.id);
    if (!news) return res.status(404).json({ message: 'News not found' });
    res.json(news);
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

const getNewsBySlug = async (req, res) => {
  try {
    const news = await News.findOne({ slug: req.params.slug });
    if (!news) return res.status(404).json({ message: 'News not found' });
    res.json(news);
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

const createNews = async (req, res) => {
  try {
    const payload = pickNewsFields(req.body);
    if (req.file) {
      try {
        const result = await cloudinary.uploader.upload(req.file.path, {
          folder: 'manav-seva/news',
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
    const news = new News(payload);
    const newNews = await news.save();
    res.status(201).json(newNews);
  } catch (error) {
    res.status(400).json({ message: 'Invalid request data' });
  }
};

const updateNews = async (req, res) => {
  try {
    const existingNews = await News.findById(req.params.id);
    if (!existingNews) return res.status(404).json({ message: 'News not found' });

    const payload = pickNewsFields(req.body);
    if (req.file) {
      try {
        const result = await cloudinary.uploader.upload(req.file.path, {
          folder: 'manav-seva/news',
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

    payload.slug = await generateUniqueSlug(
      payload.title || existingNews.title,
      payload.slug || existingNews.slug,
      req.params.id
    );

    const updatedNews = await News.findByIdAndUpdate(
      req.params.id,
      payload,
      { new: true }
    );
    if (!updatedNews) return res.status(404).json({ message: 'News not found' });
    res.json(updatedNews);
  } catch (error) {
    res.status(400).json({ message: 'Invalid request data' });
  }
};

const deleteNews = async (req, res) => {
  try {
    const deletedNews = await News.findByIdAndDelete(req.params.id);
    if (!deletedNews) return res.status(404).json({ message: 'News not found' });
    res.json({ message: 'News deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

module.exports = {
  getAllNews,
  getNewsById,
  getNewsBySlug,
  createNews,
  updateNews,
  deleteNews,
};

