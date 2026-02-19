const AboutUs = require('../models/AboutUs');

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

module.exports = { getAboutUs, createOrUpdateAboutUs, deleteAboutUs };

