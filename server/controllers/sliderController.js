const Slider = require('../models/Slider');
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

// Get all active sliders (for client)
const getSliders = async (req, res) => {
  try {
    const sliders = await Slider.find({ isActive: true }).sort({ order: 1 });
    res.json(sliders);
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

// Get all sliders (for admin - includes inactive)
const getAllSliders = async (req, res) => {
  try {
    const sliders = await Slider.find().sort({ order: 1 });
    res.json(sliders);
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

// Get slider by ID
const getSliderById = async (req, res) => {
  try {
    const slider = await Slider.findById(req.params.id);
    if (!slider) {
      return res.status(404).json({ message: 'Slider not found' });
    }
    res.json(slider);
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

// Create slider (admin)
const createSlider = async (req, res) => {
  try {
    const { title, subtitle, order, buttonText, buttonLink, isActive } = req.body;
    
    if (!title || !subtitle) {
      return res.status(400).json({ message: 'Title and subtitle are required' });
    }

    let imageUrl = req.body.image;
    if (req.file) {
      // Upload to Cloudinary for production
      try {
        const result = await cloudinary.uploader.upload(req.file.path, {
          folder: 'manav-seva/sliders',
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

    const slider = new Slider({
      title,
      subtitle,
      image: imageUrl,
      order: order || 0,
      buttonText: buttonText || 'Learn More',
      buttonLink: buttonLink || '/about',
      isActive: isActive !== 'false' && isActive !== false
    });

    const savedSlider = await slider.save();
    res.status(201).json(savedSlider);
  } catch (error) {
    console.error('Slider creation error:', error.message, error.stack);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

// Update slider (admin)
const updateSlider = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, subtitle, order, isActive, buttonText, buttonLink } = req.body;
    const existingSlider = await Slider.findById(id);
    if (!existingSlider) {
      return res.status(404).json({ message: 'Slider not found' });
    }

    let imageUrl = req.body.image || existingSlider.image;
    if (req.file) {
      // Upload to Cloudinary for production
      try {
        const result = await cloudinary.uploader.upload(req.file.path, {
          folder: 'manav-seva/sliders',
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

    const updateData = {
      title,
      subtitle,
      order,
      isActive: isActive !== 'false' && isActive !== false,
      buttonText,
      buttonLink,
      updatedAt: Date.now()
    };

    // Only update image if provided
    if (imageUrl) {
      updateData.image = imageUrl;
    }

    const slider = await Slider.findByIdAndUpdate(id, updateData, { new: true });

    if (slider && slider.image && existingSlider.image && slider.image !== existingSlider.image) {
      await deleteCloudinaryImage(existingSlider.image);
    }

    res.json(slider);
  } catch (error) {
    console.error('Slider update error:', error);
    res.status(400).json({ message: 'Invalid request data' });
  }
};

// Delete slider (admin)
const deleteSlider = async (req, res) => {
  try {
    const { id } = req.params;
    const slider = await Slider.findByIdAndDelete(id);
    
    if (!slider) {
      return res.status(404).json({ message: 'Slider not found' });
    }
    
    res.json({ message: 'Slider deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

module.exports = {
  getSliders,
  getAllSliders,
  getSliderById,
  createSlider,
  updateSlider,
  deleteSlider
};

