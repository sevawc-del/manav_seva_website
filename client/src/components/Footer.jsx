import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  FaFacebookF,
  FaInstagram,
  FaYoutube,
  FaLinkedinIn,
  FaPhoneAlt,
  FaGlobe,
} from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import { HiOutlineMail } from "react-icons/hi";
import { getSiteSettingsCached } from "../utils/api";

const DEFAULT_SITE_SETTINGS = {
  organizationName: "Manav Seva Sansthan SEVA",
  organizationSubline: "Society for Eco-development Voluntary Action",
  logoUrl: "/images/logo.png",
  footerAboutTitle: "Manav Seva India",
  footerAboutText:
    "Manav Seva Sansthan SEVA, is a not for profit organization established in 1988, working in North India with a mission to ensure socio-economic development of the poor and disadvantaged resembling vulnerable women and children devoid of basic rights through community based area development",
  footerPhone: "+91 - 8840221539",
  footerEmail: "info@manavsevaindia.org",
  footerSecondaryEmail: "executive.director@manavsevaindia.org",
  footerWebsite: "www.manavsevaindia.org",
  footerAddress: "LIG 198, Vikas Nagar, P.O. Fertilizer, Bargadwa, Gorakhpur",
  footerCopyrightText: "Manav Seva India. All rights reserved.",
  chairpersonName: "Chairperson",
  chairpersonImageUrl: "",
  facebookUrl: "https://www.facebook.com",
  instagramUrl: "https://www.instagram.com",
  linkedinUrl: "https://www.linkedin.com",
  twitterUrl: "https://x.com",
  youtubeUrl: "https://www.youtube.com",
};

const Footer = () => {
  const [siteSettings, setSiteSettings] = useState(DEFAULT_SITE_SETTINGS);

  useEffect(() => {
    let isMounted = true;

    const fetchSiteSettings = async () => {
      try {
        const response = await getSiteSettingsCached();
        if (!isMounted || !response?.data) return;
        setSiteSettings((prev) => ({
          ...prev,
          ...response.data,
        }));
      } catch (error) {
        console.error("Failed to load site settings:", error);
      }
    };

    fetchSiteSettings();
    return () => {
      isMounted = false;
    };
  }, []);

  const socialLinks = useMemo(
    () =>
      [
        { href: siteSettings.facebookUrl, Icon: FaFacebookF, label: "Facebook" },
        { href: siteSettings.instagramUrl, Icon: FaInstagram, label: "Instagram" },
        { href: siteSettings.twitterUrl, Icon: FaXTwitter, label: "Twitter" },
        { href: siteSettings.youtubeUrl, Icon: FaYoutube, label: "YouTube" },
        { href: siteSettings.linkedinUrl, Icon: FaLinkedinIn, label: "LinkedIn" },
      ].filter((item) => String(item.href || "").trim()),
    [
      siteSettings.facebookUrl,
      siteSettings.instagramUrl,
      siteSettings.twitterUrl,
      siteSettings.youtubeUrl,
      siteSettings.linkedinUrl,
    ]
  );

  const organizationLabel = (siteSettings.organizationName || DEFAULT_SITE_SETTINGS.organizationName).trim();
  const configuredSubline = (siteSettings.organizationSubline || "").trim();
  const nameParts = organizationLabel.split(/\s+/).filter(Boolean);
  const derivedSubline =
    configuredSubline ||
    (nameParts.length > 2 ? nameParts.slice(-2).join(" ") : nameParts.length === 2 ? nameParts[1] : "");
  const primaryName =
    configuredSubline || nameParts.length <= 2
      ? organizationLabel
      : nameParts.slice(0, -2).join(" ") || organizationLabel;

  const footerAddress = siteSettings.footerAddress || DEFAULT_SITE_SETTINGS.footerAddress;
  const addressLines = footerAddress.split("\n").filter((line) => line.trim());
  const footerSecondaryEmail = siteSettings.footerSecondaryEmail || DEFAULT_SITE_SETTINGS.footerSecondaryEmail;
  const footerWebsite = siteSettings.footerWebsite || DEFAULT_SITE_SETTINGS.footerWebsite;
  const footerWebsiteHref = /^https?:\/\//i.test(footerWebsite) ? footerWebsite : `https://${footerWebsite}`;

  return (
    <footer className="bg-gray-900 text-gray-300 pt-12 pb-6 mt-12">
      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-10 flex flex-col gap-10">
        <div className="text-center md:text-left min-w-0 lg:pr-6 xl:pr-8">
          <Link
            to="/"
            className="flex items-center justify-center md:justify-start gap-2.5 min-w-0 w-full mb-4"
          >
            <img
              src={siteSettings.logoUrl || DEFAULT_SITE_SETTINGS.logoUrl}
              alt={organizationLabel || "Logo"}
              className="w-16 h-16 object-contain shrink-0 brightness-0 invert"
            />
            <div className="leading-none min-w-0 text-left">
              <p className="font-bold text-base sm:text-lg text-orange-400 whitespace-normal break-words">
                {primaryName}
              </p>
              {derivedSubline && (
                <p className="font-semibold text-[11px] sm:text-xs text-gray-200 tracking-wide whitespace-normal break-words">
                  {derivedSubline}
                </p>
              )}
            </div>
          </Link>
          <p className="text-sm leading-relaxed">
            {siteSettings.footerAboutText || DEFAULT_SITE_SETTINGS.footerAboutText}
          </p>

          <div className="flex justify-center md:justify-start gap-4 mt-4">
            {socialLinks.map((item) => (
              <a
                key={item.label}
                href={item.href}
                target="_blank"
                rel="noreferrer"
                aria-label={item.label}
                className="hover:text-white text-lg"
              >
                <item.Icon />
              </a>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          <div className="text-center md:text-left">
            <h3 className="text-lg font-semibold mb-4 text-white">
              Quick Links
            </h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/" className="hover:text-white">Home</Link></li>
              <li><Link to="/about/about-us" className="hover:text-white">About Us</Link></li>
              <li><Link to="/activities" className="hover:text-white">Our Activities</Link></li>
              <li><Link to="/donate" className="hover:text-white">Donate Now</Link></li>
              <li><Link to="/get-involved/career" className="hover:text-white">Career</Link></li>
              <li><Link to="/contact" className="hover:text-white">Contact Us</Link></li>
            </ul>
          </div>

          <div className="text-center md:text-left">
            <h3 className="text-lg font-semibold mb-4 text-white">
              Information
            </h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/reports" className="hover:text-white">Reports</Link></li>
              <li><Link to="/news-events" className="hover:text-white">News & Events</Link></li>
              <li><Link to="/gallery" className="hover:text-white">Gallery</Link></li>
              <li><Link to="/get-involved/tenders" className="hover:text-white">Tenders</Link></li>
              <li><Link to="/about/governance" className="hover:text-white">Governance</Link></li>
            </ul>
          </div>

          <div className="text-center md:text-left">
            <h3 className="text-lg font-semibold mb-4 text-white">
              Contact
            </h3>

            <p className="flex items-center md:items-start justify-center md:justify-start gap-3 text-sm">
              <FaPhoneAlt className="mt-1" /> {siteSettings.footerPhone || DEFAULT_SITE_SETTINGS.footerPhone}
            </p>

            <p className="flex items-center md:items-start justify-center md:justify-start gap-3 text-sm mt-2">
              <HiOutlineMail className="mt-1" /> {siteSettings.footerEmail || DEFAULT_SITE_SETTINGS.footerEmail}
            </p>
            {footerSecondaryEmail && (
              <p className="flex items-center md:items-start justify-center md:justify-start gap-3 text-sm mt-2">
                <HiOutlineMail className="mt-1" /> {footerSecondaryEmail}
              </p>
            )}
            {footerWebsite && (
              <p className="flex items-center md:items-start justify-center md:justify-start gap-3 text-sm mt-2">
                <FaGlobe className="mt-1" />
                <a href={footerWebsiteHref} target="_blank" rel="noreferrer" className="hover:text-white">
                  {footerWebsite}
                </a>
              </p>
            )}

            <p className="mt-4 text-sm">
              Contact Address:
              <br />
              {addressLines.map((line, index) => (
                <span key={`${line}-${index}`}>
                  {line}
                  <br />
                </span>
              ))}
            </p>
          </div>

          <div className="text-center md:text-left">
            
            {siteSettings.chairpersonImageUrl ? (
              <img
                src={siteSettings.chairpersonImageUrl}
                alt={siteSettings.chairpersonName || DEFAULT_SITE_SETTINGS.chairpersonName}
                className="w-20 h-20 rounded-full object-cover border border-gray-700 mx-auto md:mx-0"
              />
            ) : (
              <div className="w-20 h-20 rounded-full border border-dashed border-gray-600 mx-auto md:mx-0" />
            )}
            <p className="mt-3 text-sm text-gray-200">
              {siteSettings.chairpersonName || DEFAULT_SITE_SETTINGS.chairpersonName}
            </p>
            <h3 className="text-lg font-semibold mb-4 text-white">
              Chairperson
            </h3>
          </div>
        </div>
      </div>

      <div className="text-center text-gray-500 text-sm mt-10 border-t border-gray-700 pt-4">
        &copy; {new Date().getFullYear()}{" "}
        {siteSettings.footerCopyrightText || DEFAULT_SITE_SETTINGS.footerCopyrightText}
      </div>
    </footer>
  );
};

export default Footer;
