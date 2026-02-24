// Gallery Controller
const Gallery = require('../models/Gallery');
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

const extractCloudinaryPublicId = (imageUrl) => {
  if (!imageUrl || typeof imageUrl !== 'string') return null;

  try {
    const parsedUrl = new URL(imageUrl);
    if (!parsedUrl.hostname.includes('res.cloudinary.com')) return null;

    const uploadIndex = parsedUrl.pathname.indexOf('/upload/');
    if (uploadIndex === -1) return null;

    const pathAfterUpload = parsedUrl.pathname.slice(uploadIndex + '/upload/'.length);
    const segments = pathAfterUpload.split('/').filter(Boolean);
    const versionIndex = segments.findIndex((segment) => /^v\d+$/.test(segment));
    if (versionIndex === -1 || versionIndex >= segments.length - 1) return null;

    const publicIdWithExtension = segments.slice(versionIndex + 1).join('/');
    return publicIdWithExtension.replace(/\.[^/.]+$/, '');
  } catch (error) {
    return null;
  }
};

const deleteCloudinaryImage = async (imageUrl) => {
  const publicId = extractCloudinaryPublicId(imageUrl);
  if (!publicId) return;

  try {
    await cloudinary.uploader.destroy(publicId, {
      resource_type: 'image',
      invalidate: true
    });
  } catch (error) {
    console.error('Cloudinary delete error:', error);
  }
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
      date
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
        date: date ?? existingItem.date
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

