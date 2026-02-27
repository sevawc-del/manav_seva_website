const fs = require('fs/promises');
const cloudinary = require('../config/cloudinary');
const AboutUs = require('../models/AboutUs');

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

// Get AboutUs
const getAboutUs = async (req, res) => {
  try {
    let aboutUs = await AboutUs.findOne();
    if (!aboutUs) {
      // Return default data if no AboutUs document exists
      aboutUs = {
        title: 'About Us',
        content: 'Welcome to Manav Seva, a dedicated organization committed to serving humanity through various charitable activities. Our mission is to provide support and assistance to those in need, focusing on health, education, and empowerment initiatives. Through our programs, we strive to make a positive impact on communities and individuals, fostering a better future for all.',
        image: ''
      };
    }
    res.json(aboutUs);
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

// Create or Update AboutUs
const createOrUpdateAboutUs = async (req, res) => {
  try {
    const { title, content, image } = req.body;
    let aboutUs = await AboutUs.findOne();
    if (aboutUs) {
      aboutUs.title = title;
      aboutUs.content = content;
      aboutUs.image = image;
      await aboutUs.save();
    } else {
      aboutUs = new AboutUs({ title, content, image });
      await aboutUs.save();
    }
    res.json(aboutUs);
  } catch (error) {
    console.error('Error in createOrUpdateAboutUs:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

// Delete AboutUs
const deleteAboutUs = async (req, res) => {
  try {
    const aboutUs = await AboutUs.findOne();
    if (!aboutUs) {
      return res.status(404).json({ message: 'AboutUs not found' });
    }
    await AboutUs.deleteOne();
    res.json({ message: 'AboutUs deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

const uploadAboutImage = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'Image file is required' });
  }

  try {
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: 'manav-seva/about',
      resource_type: 'image'
    });

    await cleanupTempUpload(req.file.path);
    return res.status(200).json({ imageUrl: result.secure_url });
  } catch (error) {
    await cleanupTempUpload(req.file.path);
    console.error('About image upload error:', error.message);
    return res.status(500).json({ message: 'Failed to upload image' });
  }
};

module.exports = { getAboutUs, createOrUpdateAboutUs, deleteAboutUs, uploadAboutImage };

