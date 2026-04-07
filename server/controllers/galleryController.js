// Gallery Controller
const Gallery = require('../models/Gallery');
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

const deleteCloudinaryImage = async (imageUrl) => {
  try {
    await deleteCloudinaryAsset({
      assetUrl: imageUrl,
      resourceType: 'image',
      fallbackResourceTypes: ['image'],
      invalidate: true
    });
  } catch (error) {
    console.error('Cloudinary delete error:', error);
  }
};

const parseShowOnHome = (value, fallback = true) => {
  if (value === undefined) return fallback;
  return value === true || value === 'true';
};

const getAllGalleryItems = async (req, res) => {
  try {
    const galleryItems = await Gallery.find();
    res.json(galleryItems);
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

const getGalleryItemById = async (req, res) => {
  try {
    const galleryItem = await Gallery.findById(req.params.id);
    if (!galleryItem) return res.status(404).json({ message: 'Gallery item not found' });
    res.json(galleryItem);
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

const createGalleryItem = async (req, res) => {
  try {
    const { title, description, date } = req.body;
    let imageUrl = req.body.image;
    const showOnHome = parseShowOnHome(req.body.showOnHome, true);

    if (req.file) {
      try {
        const result = await cloudinary.uploader.upload(req.file.path, {
          folder: 'manav-seva/gallery',
          resource_type: 'image'
        });
        imageUrl = result.secure_url;
        await cleanupTempUpload(req.file.path);
      } catch (uploadError) {
        await cleanupTempUpload(req.file.path);
        console.error('Cloudinary upload error:', uploadError);
        return res.status(500).json({ message: 'Failed to upload image' });
      }
    }

    if (!imageUrl) {
      return res.status(400).json({ message: 'Image is required' });
    }

    const galleryItem = new Gallery({
      title,
      image: imageUrl,
      description,
      date,
      showOnHome
    });

    const newGalleryItem = await galleryItem.save();
    res.status(201).json(newGalleryItem);
  } catch (error) {
    res.status(400).json({ message: 'Invalid request data' });
  }
};

const updateGalleryItem = async (req, res) => {
  try {
    const existingItem = await Gallery.findById(req.params.id);
    if (!existingItem) return res.status(404).json({ message: 'Gallery item not found' });

    const { title, description, date } = req.body;
    let imageUrl = req.body.image || existingItem.image;
    const showOnHome = parseShowOnHome(req.body.showOnHome, existingItem.showOnHome !== false);

    if (req.file) {
      try {
        const result = await cloudinary.uploader.upload(req.file.path, {
          folder: 'manav-seva/gallery',
          resource_type: 'image'
        });
        imageUrl = result.secure_url;
        await cleanupTempUpload(req.file.path);
      } catch (uploadError) {
        await cleanupTempUpload(req.file.path);
        console.error('Cloudinary upload error:', uploadError);
        return res.status(500).json({ message: 'Failed to upload image' });
      }
    }

    const updatedGalleryItem = await Gallery.findByIdAndUpdate(
      req.params.id,
      {
        title: title ?? existingItem.title,
        image: imageUrl,
        description: description ?? existingItem.description,
        date: date ?? existingItem.date,
        showOnHome
      },
      { new: true }
    );

    if (updatedGalleryItem.image !== existingItem.image) {
      await deleteCloudinaryImage(existingItem.image);
    }

    res.json(updatedGalleryItem);
  } catch (error) {
    res.status(400).json({ message: 'Invalid request data' });
  }
};

const deleteGalleryItem = async (req, res) => {
  try {
    const deletedGalleryItem = await Gallery.findByIdAndDelete(req.params.id);
    if (!deletedGalleryItem) return res.status(404).json({ message: 'Gallery item not found' });

    await deleteCloudinaryImage(deletedGalleryItem.image);

    res.json({ message: 'Gallery item deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

module.exports = {
  getAllGalleryItems,
  getGalleryItemById,
  createGalleryItem,
  updateGalleryItem,
  deleteGalleryItem,
};

