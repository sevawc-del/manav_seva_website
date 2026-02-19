const Message = require('../models/Message');

// Get all messages
const getMessages = async (req, res) => {
  try {
    const messages = await Message.find().sort({ displayOrder: 1 });
    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

// Create or update a message
const createOrUpdateMessage = async (req, res) => {
  try {
    const { _id, name, position, displayOrder, message, image } = req.body;
    if (_id) {
      // Update existing message
      const updatedMessage = await Message.findByIdAndUpdate(_id, { name, position, displayOrder, message, image }, { new: true });
      if (!updatedMessage) {
        return res.status(404).json({ message: 'Message not found' });
      }
      res.status(200).json(updatedMessage);
    } else {
      // Create new message
      const newMessage = new Message({ name, position, displayOrder, message, image });
      await newMessage.save();
      res.status(201).json(newMessage);
    }
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

// Delete a message
const deleteMessage = async (req, res) => {
  try {
    const { id } = req.params;
    await Message.findByIdAndDelete(id);
    res.status(200).json({ message: 'Message deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

module.exports = {
  getMessages,
  createOrUpdateMessage,
  deleteMessage,
};

