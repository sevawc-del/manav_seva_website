// News Controller
const News = require('../models/News');

const pickNewsFields = (body = {}) => ({
  title: body.title,
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

const createNews = async (req, res) => {
  const news = new News(pickNewsFields(req.body));
  try {
    const newNews = await news.save();
    res.status(201).json(newNews);
  } catch (error) {
    res.status(400).json({ message: 'Invalid request data' });
  }
};

const updateNews = async (req, res) => {
  try {
    const updatedNews = await News.findByIdAndUpdate(
      req.params.id,
      pickNewsFields(req.body),
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
  createNews,
  updateNews,
  deleteNews,
};

