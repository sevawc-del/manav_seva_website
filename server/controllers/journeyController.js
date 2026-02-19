const Journey = require('../models/Journey');

// Get all journeys
const getJourneys = async (req, res) => {
  try {
    const journeys = await Journey.find({ isActive: true }).sort({ order: 1 });
    res.json(journeys);
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

// Get journey by id
const getJourneyById = async (req, res) => {
  try {
    const { id } = req.params;
    const journey = await Journey.findOne({ _id: id, isActive: true });
    if (!journey) {
      return res.status(404).json({ message: 'Journey not found' });
    }
    res.json(journey);
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

// Create journey (admin)
const createJourney = async (req, res) => {
  try {
    const { year, milestones, order } = req.body;
    const journey = new Journey({
      year,
      milestones,
      order: order || 0
    });
    await journey.save();
    res.json(journey);
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

// Update journey (admin)
const updateJourney = async (req, res) => {
  try {
    const { id } = req.params;
    const { year, milestones, isActive, order } = req.body;
    const journey = await Journey.findByIdAndUpdate(
      id,
      { year, milestones, isActive, order, updatedAt: Date.now() },
      { new: true }
    );
    if (!journey) {
      return res.status(404).json({ message: 'Journey not found' });
    }
    res.json(journey);
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

// Delete journey (admin)
const deleteJourney = async (req, res) => {
  try {
    const { id } = req.params;
    const journey = await Journey.findByIdAndDelete(id);
    if (!journey) {
      return res.status(404).json({ message: 'Journey not found' });
    }
    res.json({ message: 'Journey deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

module.exports = { getJourneys, getJourneyById, createJourney, updateJourney, deleteJourney };

