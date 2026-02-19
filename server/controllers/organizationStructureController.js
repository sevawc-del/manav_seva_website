const OrganizationStructure = require('../models/OrganizationStructure');

// Get OrganizationStructure
const getOrganizationStructure = async (req, res) => {
  try {
    const organizationStructure = await OrganizationStructure.findOne();
    if (!organizationStructure) {
      return res.status(404).json({ message: 'OrganizationStructure not found' });
    }
    res.json(organizationStructure);
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

// Create or Update OrganizationStructure
const createOrUpdateOrganizationStructure = async (req, res) => {
  try {
    const { title, leadershipTitle, leadershipTeam, departmentsTitle, departments, supportTitle, supportFunctions } = req.body;
    let organizationStructure = await OrganizationStructure.findOne();
    if (organizationStructure) {
      organizationStructure.title = title;
      organizationStructure.leadershipTitle = leadershipTitle;
      organizationStructure.leadershipTeam = leadershipTeam;
      organizationStructure.departmentsTitle = departmentsTitle;
      organizationStructure.departments = departments;
      organizationStructure.supportTitle = supportTitle;
      organizationStructure.supportFunctions = supportFunctions;
      await organizationStructure.save();
    } else {
      organizationStructure = new OrganizationStructure({ title, leadershipTitle, leadershipTeam, departmentsTitle, departments, supportTitle, supportFunctions });
      await organizationStructure.save();
    }
    res.json(organizationStructure);
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

// Delete OrganizationStructure
const deleteOrganizationStructure = async (req, res) => {
  try {
    const organizationStructure = await OrganizationStructure.findOne();
    if (!organizationStructure) {
      return res.status(404).json({ message: 'OrganizationStructure not found' });
    }
    await OrganizationStructure.deleteOne();
    res.json({ message: 'OrganizationStructure deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

module.exports = { getOrganizationStructure, createOrUpdateOrganizationStructure, deleteOrganizationStructure };

