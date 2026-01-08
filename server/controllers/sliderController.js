const Slider = require('../models/Slider');
const cloudinary = require('../config/cloudinary');

// Get all active sliders (for client)
const getSliders = async (req, res) => {
  try {
    const sliders = await Slider.find({ isActive: true }).sort({ order: 1 });
    res.json(sliders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all sliders (for admin - includes inactive)
const getAllSliders = async (req, res) => {
  try {
    const sliders = await Slider.find().sort({ order: 1 });
    res.json(sliders);
  } catch (error) {
    res.status(500).json({ message: error.message });
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
    res.status(500).json({ message: error.message });
  }
};

// Create slider (admin)
const createSlider = async (req, res) => {
  try {
    console.log('Create slider request body:', req.body);
    console.log('Create slider request file:', req.file);
    
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
      } catch (uploadError) {
        console.error('Cloudinary upload error:', uploadError);
        return res.status(500).json({ message: 'Failed to upload image' });
      }
    }

    if (!imageUrl) {
      return res.status(400).json({ message: 'Image is required' });
    }

    console.log('Creating slider with data:', { title, subtitle, imageUrl, order, isActive });

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
    console.log('Slider saved successfully:', savedSlider);
    res.status(201).json(savedSlider);
  } catch (error) {
    console.error('Slider creation error:', error.message, error.stack);
    res.status(500).json({ message: error.message });
  }
};

// Update slider (admin)
const updateSlider = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, subtitle, order, isActive, buttonText, buttonLink } = req.body;

    let imageUrl = req.body.image;
    if (req.file) {
      // Upload to Cloudinary for production
      try {
        const result = await cloudinary.uploader.upload(req.file.path, {
          folder: 'manav-seva/sliders',
          resource_type: 'image'
        });
        imageUrl = result.secure_url;
      } catch (uploadError) {
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

    if (!slider) {
      return res.status(404).json({ message: 'Slider not found' });
    }

    res.json(slider);
  } catch (error) {
    console.error('Slider update error:', error);
    res.status(400).json({ message: error.message });
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
    res.status(500).json({ message: error.message });
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
