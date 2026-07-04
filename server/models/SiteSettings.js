/**
 * SITE SETTINGS MODEL
 *
 * Defines the comprehensive Site Settings schema for global website configuration.
 * This model stores all site-wide settings including organization details,
 * footer information, homepage content, office locations, geographic focus,
 * and social media links. Used to customize the entire website appearance
 * and content without code changes.
 *
 * Schema contains:
 * - Organization branding (name, logo, subline)
 * - Footer configuration (contact info, copyright, about text)
 * - Homepage sections (who we are, geographic focus)
 * - Office locations with coordinates and maps
 * - Social media platform URLs
 * - Geographic focus states with working status
 */

// ==================== IMPORTS ====================
const mongoose = require('mongoose');

// ==================== SCHEMA DEFINITION ====================

/**
 * Site Settings Schema
 *
 * This schema contains all configurable settings for the website.
 * Fields are organized by section for easier management.
 */
const siteSettingsSchema = new mongoose.Schema(
  {
    // ==================== ORGANIZATION BRANDING ====================
    /**
     * organizationName: Full organization name
     * Default: "Manav Seva Sansthan SEVA"
     */
    organizationName: { type: String, default: 'Manav Seva Sansthan SEVA', trim: true },

    /**
     * organizationSubline: Organization tagline/subtitle
     * Default: "Society for Eco-development Voluntary Action"
     */
    organizationSubline: { type: String, default: 'Society for Eco-development Voluntary Action', trim: true },

    /**
     * logoUrl: Path to organization logo image
     * Default: "/images/logo.png"
     */
    logoUrl: { type: String, default: '/images/logo.png', trim: true },

    /**
     * supportMessage: Call-to-action message for donations/support
     * Default: "Support our mission to transform lives."
     */
    supportMessage: { type: String, default: 'Support our mission to transform lives.', trim: true },

    // ==================== FOOTER CONFIGURATION ====================
    /**
     * footerAboutTitle: Title for footer about section
     * Default: "Manav Seva India"
     */
    footerAboutTitle: { type: String, default: 'Manav Seva India', trim: true },

    /**
     * footerAboutText: Detailed about text for footer
     * Contains organization description and mission
     */
    footerAboutText: {
      type: String,
      default:
        'Manav Seva Sansthan SEVA, is a not for profit organization established in 1988, working in North India with a mission to ensure socio-economic development of the poor and disadvantaged resembling vulnerable women and children devoid of basic rights through community based area development',
      trim: true
    },

    /**
     * footerPhone: Primary contact phone number
     * Default: "+91 99999 88888"
     */
    footerPhone: { type: String, default: '+91 99999 88888', trim: true },

    /**
     * footerEmail: Primary contact email
     * Default: "info@manavsevaindia.org"
     */
    footerEmail: { type: String, default: 'info@manavsevaindia.org', trim: true },

    /**
     * footerSecondaryEmail: Secondary contact email (executive director)
     * Default: "executive.director@manavsevaindia.org"
     */
    footerSecondaryEmail: { type: String, default: 'executive.director@manavsevaindia.org', trim: true },

    /**
     * footerWebsite: Organization website URL
     * Default: "www.manavsevaindia.org"
     */
    footerWebsite: { type: String, default: 'www.manavsevaindia.org', trim: true },

    /**
     * footerAddress: Physical address for footer
     * Default: Complete Gorakhpur address
     */
    footerAddress: {
      type: String,
      default: 'LIG 198, Vikas Nagar, P.O. Fertilizer, Bargadwa, Gorakhpur',
      trim: true
    },

    /**
     * footerCopyrightText: Copyright notice for footer
     * Default: "Manav Seva India. All rights reserved."
     */
    footerCopyrightText: { type: String, default: 'Manav Seva India. All rights reserved.', trim: true },

    // ==================== LEADERSHIP ====================
    /**
     * chairpersonName: Name/title of the chairperson
     * Default: "Chairperson"
     */
    chairpersonName: { type: String, default: 'Chairperson', trim: true },

    /**
     * chairpersonImageUrl: Image URL of the chairperson
     * Default: "" (empty)
     */
    chairpersonImageUrl: { type: String, default: '', trim: true },

    // ==================== HOMEPAGE CONTENT ====================
    /**
     * homeWhoTitle: Title for "Who are we?" section
     * Default: "Who are we?"
     */
    homeWhoTitle: { type: String, default: 'Who are we?', trim: true },

    /**
     * homeWhoLeftText: Left column text in "Who are we?" section
     * Contains organization description
     */
    homeWhoLeftText: {
      type: String,
      default:
        'Manav Seva Sansthan SEVA is a not-for-profit organization working for inclusive socio-economic development across vulnerable communities.',
      trim: true
    },

    /**
     * homeWhoRightTitle: Right column title in "Who are we?" section
     * Default: "In Focus"
     */
    homeWhoRightTitle: { type: String, default: 'In Focus', trim: true },

    /**
     * homeWhoRightText: Right column text in "Who are we?" section
     * Describes program focus and impact
     */
    homeWhoRightText: {
      type: String,
      default:
        'Our programs and collaborations are designed to create long-term impact through community-led action.',
      trim: true
    },

    /**
     * homeWhoRightImageUrl: Image for right column in "Who are we?" section
     * Default: "" (empty)
     */
    homeWhoRightImageUrl: { type: String, default: '', trim: true },

    // ==================== OFFICE LOCATIONS ====================
    /**
     * homeOfficeLocations: Array of office locations with coordinates
     * Each location contains:
     * - id: Unique identifier
     * - name: Office name (e.g., "Head Office")
     * - city: City name
     * - address: Full address
     * - lat/lng: Geographic coordinates for maps
     * - googleMapsUrl: Direct link to Google Maps
     *
     * Default: Gorakhpur head office and New Delhi branch office
     */
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

    // ==================== GEOGRAPHIC FOCUS ====================
    /**
     * homeGeographicFocusStates: Array of states where organization works
     * Each state contains:
     * - state: State name (e.g., "Uttar Pradesh")
     * - status: "currently_working" or "previously_worked"
     *
     * Used to color-code the India map on homepage
     */
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

    /**
     * homeGeographicFocusDescription: Description text for geographic focus section
     * Explains the map color-coding and toggle functionality
     */
    homeGeographicFocusDescription: {
      type: String,
      default:
        'States are color-coded to reflect current and past program presence. Use the toggles to filter.',
      trim: true
    },

    // ==================== SOCIAL MEDIA LINKS ====================
    /**
     * Social media platform URLs for footer and contact sections
     * All default to generic platform URLs, should be updated with actual profiles
     */
    facebookUrl: { type: String, default: 'https://www.facebook.com', trim: true },
    instagramUrl: { type: String, default: 'https://www.instagram.com', trim: true },
    linkedinUrl: { type: String, default: 'https://www.linkedin.com', trim: true },
    twitterUrl: { type: String, default: 'https://x.com', trim: true },
    youtubeUrl: { type: String, default: 'https://www.youtube.com', trim: true }
  },
  {
    // ==================== SCHEMA OPTIONS ====================
    /**
     * Enable automatic timestamps (createdAt, updatedAt)
     * These fields are automatically managed by Mongoose
     */
    timestamps: true
  }
);

// ==================== EXPORTS ====================
// Create and export the SiteSettings model
module.exports = mongoose.model('SiteSettings', siteSettingsSchema);
