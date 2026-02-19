const GeographicFocus = require('../models/GeographicFocus');

// Get GeographicFocus
const getGeographicFocus = async (req, res) => {
  try {
    const geographicFocus = await GeographicFocus.findOne();
    if (!geographicFocus) {
      return res.status(404).json({ message: 'GeographicFocus not found' });
    }
    res.json(geographicFocus);
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

// Create or Update GeographicFocus
const createOrUpdateGeographicFocus = async (req, res) => {
  try {
    const { title, content, image, showMap, mapImage } = req.body;
    let geographicFocus = await GeographicFocus.findOne();
    if (geographicFocus) {
      geographicFocus.title = title;
      geographicFocus.content = content;
      geographicFocus.image = image;
      geographicFocus.showMap = showMap;
      geographicFocus.mapImage = mapImage;
      await geographicFocus.save();
    } else {
      geographicFocus = new GeographicFocus({ title, content, image, showMap, mapImage });
      await geographicFocus.save();
    }
    res.json(geographicFocus);
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

// Delete GeographicFocus
const deleteGeographicFocus = async (req, res) => {
  try {
    const geographicFocus = await GeographicFocus.findOne();
    if (!geographicFocus) {
      return res.status(404).json({ message: 'GeographicFocus not found' });
    }
    await GeographicFocus.deleteOne();
    res.json({ message: 'GeographicFocus deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

module.exports = { getGeographicFocus, createOrUpdateGeographicFocus, deleteGeographicFocus };

