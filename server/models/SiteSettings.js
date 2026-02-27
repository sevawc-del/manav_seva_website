const mongoose = require('mongoose');

const siteSettingsSchema = new mongoose.Schema(
  {
    organizationName: { type: String, default: 'Manav Seva Sansthan SEVA', trim: true },
    organizationSubline: { type: String, default: 'Sansthan SEVA', trim: true },
    logoUrl: { type: String, default: '/images/logo.png', trim: true },
    supportMessage: { type: String, default: 'Support our mission to transform lives.', trim: true },
    footerAboutTitle: { type: String, default: 'Manav Seva India', trim: true },
    footerAboutText: {
      type: String,
      default:
        'Manav Seva India works towards sustainable community development, focusing on education, healthcare, women empowerment and social protection programs across India.',
      trim: true
    },
    footerPhone: { type: String, default: '+91 99999 88888', trim: true },
    footerEmail: { type: String, default: 'info@manavsevaindia.org', trim: true },
    footerAddress: { type: String, default: 'Manav Seva India, Uttar Pradesh, India.', trim: true },
    footerCopyrightText: { type: String, default: 'Manav Seva India. All rights reserved.', trim: true },
    chairpersonName: { type: String, default: 'Chairperson', trim: true },
    chairpersonImageUrl: { type: String, default: '', trim: true },
    facebookUrl: { type: String, default: 'https://www.facebook.com', trim: true },
    instagramUrl: { type: String, default: 'https://www.instagram.com', trim: true },
    linkedinUrl: { type: String, default: 'https://www.linkedin.com', trim: true },
    twitterUrl: { type: String, default: 'https://x.com', trim: true },
    youtubeUrl: { type: String, default: 'https://www.youtube.com', trim: true }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('SiteSettings', siteSettingsSchema);
