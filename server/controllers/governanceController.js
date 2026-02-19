const Governance = require('../models/Governance');

// Get Governance
const getGovernance = async (req, res) => {
  try {
    let governance = await Governance.findOne();
    if (!governance) {
      // Return default data if no Governance document exists
      governance = {
        title: 'Governance',
        hierarchy: [
          {
            id: '1',
            name: 'John Doe',
            position: 'Chairman',
            experience: '20 years in NGO management',
            image: '',
            children: [
              {
                id: '2',
                name: 'Jane Smith',
                position: 'Executive Director',
                experience: '15 years in social work',
                image: '',
                children: [
                  {
                    id: '3',
                    name: 'Mike Johnson',
                    position: 'Operations Manager',
                    experience: '10 years in operations',
                    image: '',
                    children: []
                  },
                  {
                    id: '4',
                    name: 'Sarah Wilson',
                    position: 'Finance Manager',
                    experience: '12 years in finance',
                    image: '',
                    children: []
                  }
                ]
              }
            ]
          }
        ],
        ethicsTitle: 'Code of Ethics',
        ethicsContent: 'We adhere to the highest standards of ethical conduct in all our activities.',
        ethicsPoints: [
          'Transparency in all operations',
          'Accountability to stakeholders',
          'Integrity in decision-making'
        ]
      };
    }
    res.json(governance);
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error' });
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

