// Gallery Controller
const Gallery = require('../models/Gallery');

const pickGalleryFields = (body = {}) => ({
  title: body.title,
  image: body.image,
  description: body.description,
  date: body.date
});

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
  const galleryItem = new Gallery(pickGalleryFields(req.body));
  try {
    const newGalleryItem = await galleryItem.save();
    res.status(201).json(newGalleryItem);
  } catch (error) {
    res.status(400).json({ message: 'Invalid request data' });
  }
};

const updateGalleryItem = async (req, res) => {
  try {
    const updatedGalleryItem = await Gallery.findByIdAndUpdate(
      req.params.id,
      pickGalleryFields(req.body),
      { new: true }
    );
    if (!updatedGalleryItem) return res.status(404).json({ message: 'Gallery item not found' });
    res.json(updatedGalleryItem);
  } catch (error) {
    res.status(400).json({ message: 'Invalid request data' });
  }
};

const deleteGalleryItem = async (req, res) => {
  try {
    const deletedGalleryItem = await Gallery.findByIdAndDelete(req.params.id);
    if (!deletedGalleryItem) return res.status(404).json({ message: 'Gallery item not found' });
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

