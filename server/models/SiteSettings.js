const mongoose = require('mongoose');

const siteSettingsSchema = new mongoose.Schema(
  {
    organizationName: { type: String, default: 'Manav Seva Sansthan SEVA', trim: true },
    organizationSubline: { type: String, default: 'Society for Eco-development Voluntary Action', trim: true },
    logoUrl: { type: String, default: '/images/logo.png', trim: true },
    supportMessage: { type: String, default: 'Support our mission to transform lives.', trim: true },
    footerAboutTitle: { type: String, default: 'Manav Seva India', trim: true },
    footerAboutText: {
      type: String,
      default:
        'Manav Seva Sansthan SEVA, is a not for profit organization established in 1988, working in North India with a mission to ensure socio-economic development of the poor and disadvantaged resembling vulnerable women and children devoid of basic rights through community based area development',
      trim: true
    },
    footerPhone: { type: String, default: '+91 99999 88888', trim: true },
    footerEmail: { type: String, default: 'info@manavsevaindia.org', trim: true },
    footerSecondaryEmail: { type: String, default: 'executive.director@manavsevaindia.org', trim: true },
    footerWebsite: { type: String, default: 'www.manavsevaindia.org', trim: true },
    footerAddress: {
      type: String,
      default: 'LIG 198, Vikas Nagar, P.O. Fertilizer, Bargadwa, Gorakhpur',
      trim: true
    },
    footerCopyrightText: { type: String, default: 'Manav Seva India. All rights reserved.', trim: true },
    chairpersonName: { type: String, default: 'Chairperson', trim: true },
    chairpersonImageUrl: { type: String, default: '', trim: true },
    homeWhoTitle: { type: String, default: 'Who are we?', trim: true },
    homeWhoLeftText: {
      type: String,
      default:
        'Manav Seva Sansthan SEVA is a not-for-profit organization working for inclusive socio-economic development across vulnerable communities.',
      trim: true
    },
    homeWhoRightTitle: { type: String, default: 'In Focus', trim: true },
    homeWhoRightText: {
      type: String,
      default:
        'Our programs and collaborations are designed to create long-term impact through community-led action.',
      trim: true
    },
    homeWhoRightImageUrl: { type: String, default: '', trim: true },
    homeOfficeLocations: {
      type: [
        {
          id: { type: String, trim: true },
          name: { type: String, trim: true },
          city: { type: String, trim: true },
          address: { type: String, trim: true },
          lat: { type: Number },
          lng: { type: Number },
          googleMapsUrl: { type: String, trim: true }
        }
      ],
      default: [
        {
          id: 'gorakhpur-head-office',
          name: 'Head Office',
          city: 'Gorakhpur',
          address: 'Vikas Nagar Colony, Bargadwa, P.O. Fertilizer, Gorakhpur-273007 (U.P.), India',
          lat: 26.8050913,
          lng: 83.3548241,
          googleMapsUrl:
            'https://www.google.com/maps/place/Manav+Seva+Sansthan+SEVA/@26.8047121,83.3523656,18z/data=!4m6!3m5!1s0x39914a4000000007:0x7650ce5dac4123f2!8m2!3d26.8050913!4d83.3548241!16s%2Fg%2F11c1xczdgj?entry=ttu&g_ep=EgoyMDI2MDMzMC4wIKXMDSoASAFQAw'
        },
        {
          id: 'new-delhi-branch-office',
          name: 'Branch Office',
          city: 'New Delhi',
          address: 'K68 BK dutt Colony, Jor Bagh, New Delhi, 110003',
          lat: 28.5839672,
          lng: 77.2168207,
          googleMapsUrl:
            'https://www.google.com/maps/place/K-82+B.K.+Dutt+Colony,+Jor+Bagh/@28.5839791,77.2140859,17z/data=!3m1!4b1!4m6!3m5!1s0x390ce3ae76a5fe45:0x6ac91b5de8746a68!8m2!3d28.5839791!4d77.2166608!16s%2Fg%2F11kpvr3p49?entry=ttu&g_ep=EgoyMDI2MDMzMC4wIKXMDSoASAFQAw%3D%3D'
        }
      ]
    },
    homeGeographicFocusStates: {
      type: [
        {
          state: { type: String, trim: true },
          status: {
            type: String,
            enum: ['currently_working', 'previously_worked'],
            default: 'currently_working'
          }
        }
      ],
      default: []
    },
    homeGeographicFocusDescription: {
      type: String,
      default:
        'States are color-coded to reflect current and past program presence. Use the toggles to filter.',
      trim: true
    },
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
