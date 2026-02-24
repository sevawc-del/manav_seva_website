const fs = require('fs/promises');
const Sponsor = require('../models/Sponsor');
const cloudinary = require('../config/cloudinary');

const cleanupTempUpload = async (filePath) => {
  if (!filePath) return;
  try {
    await fs.unlink(filePath);
  } catch (error) {
    if (error.code !== 'ENOENT') {
      console.error('Temp upload cleanup error:', error.message);
    }
  }
};

const extractCloudinaryPublicId = (imageUrl) => {
  if (!imageUrl || typeof imageUrl !== 'string') return null;

  try {
    const parsedUrl = new URL(imageUrl);
    if (!parsedUrl.hostname.includes('res.cloudinary.com')) return null;

    const uploadIndex = parsedUrl.pathname.indexOf('/upload/');
    if (uploadIndex === -1) return null;

    const pathAfterUpload = parsedUrl.pathname.slice(uploadIndex + '/upload/'.length);
    const segments = pathAfterUpload.split('/').filter(Boolean);
    const versionIndex = segments.findIndex((segment) => /^v\d+$/.test(segment));
    if (versionIndex === -1 || versionIndex >= segments.length - 1) return null;

    const publicIdWithExtension = segments.slice(versionIndex + 1).join('/');
    return publicIdWithExtension.replace(/\.[^/.]+$/, '');
  } catch (error) {
    return null;
  }
};

const deleteCloudinaryImage = async (imageUrl) => {
  const publicId = extractCloudinaryPublicId(imageUrl);
  if (!publicId) return;

  try {
    await cloudinary.uploader.destroy(publicId, {
      resource_type: 'image',
      invalidate: true
    });
  } catch (error) {
    console.error('Cloudinary delete error:', error.message);
  }
};

const getPublicSponsors = async (req, res) => {
  try {
    const sponsors = await Sponsor.find({ isActive: true }).sort({ order: 1, createdAt: -1 });
    res.json(sponsors);
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

const getAllSponsorsAdmin = async (req, res) => {
  try {
    const sponsors = await Sponsor.find().sort({ order: 1, createdAt: -1 });
    res.json(sponsors);
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

const createSponsor = async (req, res) => {
  try {
    const { name, website, tier, order, isActive } = req.body;

    let logoUrl = req.body.logo;
    if (req.file) {
      try {
        const result = await cloudinary.uploader.upload(req.file.path, {
          folder: 'manav-seva/sponsors',
          resource_type: 'image'
        });
        logoUrl = result.secure_url;
        await cleanupTempUpload(req.file.path);
      } catch (uploadError) {
        await cleanupTempUpload(req.file.path);
        console.error('Cloudinary upload error:', uploadError.message);
        return res.status(500).json({ message: 'Failed to upload logo' });
      }
    }

    if (!name || !logoUrl) {
      return res.status(400).json({ message: 'Name and logo are required' });
    }

    const sponsor = new Sponsor({
      name,
      logo: logoUrl,
      website: website || '',
      tier: tier || 'community',
      order: Number.isFinite(Number(order)) ? Number(order) : 0,
      isActive: isActive === true || isActive === 'true'
    });

    const created = await sponsor.save();
    res.status(201).json(created);
  } catch (error) {
    res.status(400).json({ message: 'Invalid request data' });
  }
};

const updateSponsor = async (req, res) => {
  try {
    const existingSponsor = await Sponsor.findById(req.params.id);
    if (!existingSponsor) {
      return res.status(404).json({ message: 'Sponsor not found' });
    }

    let logoUrl = req.body.logo || existingSponsor.logo;
    if (req.file) {
      try {
        const result = await cloudinary.uploader.upload(req.file.path, {
          folder: 'manav-seva/sponsors',
          resource_type: 'image'
        });
        logoUrl = result.secure_url;
        await cleanupTempUpload(req.file.path);
      } catch (uploadError) {
        await cleanupTempUpload(req.file.path);
        console.error('Cloudinary upload error:', uploadError.message);
        return res.status(500).json({ message: 'Failed to upload logo' });
      }
    }

    const updated = await Sponsor.findByIdAndUpdate(
      req.params.id,
      {
        name: req.body.name ?? existingSponsor.name,
        logo: logoUrl,
        website: req.body.website ?? existingSponsor.website,
        tier: req.body.tier ?? existingSponsor.tier,
        order: Number.isFinite(Number(req.body.order))
          ? Number(req.body.order)
          : existingSponsor.order,
        isActive: req.body.isActive === undefined
          ? existingSponsor.isActive
          : (req.body.isActive === true || req.body.isActive === 'true'),
        updatedAt: Date.now()
      },
      { new: true }
    );

    if (updated.logo !== existingSponsor.logo) {
      await deleteCloudinaryImage(existingSponsor.logo);
    }

    res.json(updated);
  } catch (error) {
    res.status(400).json({ message: 'Invalid request data' });
  }
};

const deleteSponsor = async (req, res) => {
  try {
    const deleted = await Sponsor.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: 'Sponsor not found' });
    }

    await deleteCloudinaryImage(deleted.logo);
    res.json({ message: 'Sponsor deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

module.exports = {
  getPublicSponsors,
  getAllSponsorsAdmin,
  createSponsor,
  updateSponsor,
  deleteSponsor
};
