const Governance = require('../models/Governance');

const createDefaultOrgChart = () => ({
  enabled: false,
  width: 1400,
  height: 900,
  groups: [],
  nodes: [],
  edges: []
});

// Get Governance
const getGovernance = async (req, res) => {
  try {
    const governance = await Governance.findOne().lean();
    if (!governance) {
      return res.json({
        title: '',
        hierarchy: [],
        orgChart: createDefaultOrgChart(),
        needTitle: '',
        needContent: '',
        policyTitle: '',
        policyIntro: '',
        policyTiers: [],
        ethicsTitle: '',
        ethicsContent: '',
        ethicsPoints: []
      });
    }
    if (!governance.orgChart) {
      governance.orgChart = createDefaultOrgChart();
    }
    return res.json(governance);
  } catch (error) {
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

// Create or Update Governance
const createOrUpdateGovernance = async (req, res) => {
  try {
    const governanceData = req.body;
    let governance = await Governance.findOne();
    if (governance) {
      Object.assign(governance, governanceData);
      await governance.save();
    } else {
      governance = new Governance(governanceData);
      await governance.save();
    }
    res.json(governance);
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

// Delete Governance
const deleteGovernance = async (req, res) => {
  try {
    const governance = await Governance.findOne();
    if (!governance) {
      return res.status(404).json({ message: 'Governance not found' });
    }
    await Governance.deleteOne();
    res.json({ message: 'Governance deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

module.exports = { getGovernance, createOrUpdateGovernance, deleteGovernance };

