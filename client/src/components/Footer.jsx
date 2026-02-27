import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  FaFacebookF,
  FaInstagram,
  FaYoutube,
  FaLinkedinIn,
  FaPhoneAlt,
} from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import { HiOutlineMail } from "react-icons/hi";
import { getSiteSettings } from "../utils/api";

const DEFAULT_SITE_SETTINGS = {
  footerAboutTitle: "Manav Seva India",
  footerAboutText:
    "Manav Seva India works towards sustainable community development, focusing on education, healthcare, women empowerment and social protection programs across India.",
  footerPhone: "+91 99999 88888",
  footerEmail: "info@manavsevaindia.org",
  footerAddress: "Manav Seva India,\nUttar Pradesh, India.",
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
        const response = await getSiteSettings();
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

  const footerAddress = siteSettings.footerAddress || DEFAULT_SITE_SETTINGS.footerAddress;
  const addressLines = footerAddress.split("\n").filter((line) => line.trim());

  return (
    <footer className="bg-gray-900 text-gray-300 pt-12 pb-6 mt-12">
      <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-5 gap-10">
        <div>
          <h2 className="text-xl font-semibold mb-4 text-white">
            {siteSettings.footerAboutTitle || DEFAULT_SITE_SETTINGS.footerAboutTitle}
          </h2>
          <p className="text-sm leading-relaxed">
            {siteSettings.footerAboutText || DEFAULT_SITE_SETTINGS.footerAboutText}
          </p>

          <div className="flex gap-4 mt-4">
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

        <div>
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

        <div>
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

        <div>
          <h3 className="text-lg font-semibold mb-4 text-white">
            Contact
          </h3>

          <p className="flex items-start gap-3 text-sm">
            <FaPhoneAlt className="mt-1" /> {siteSettings.footerPhone || DEFAULT_SITE_SETTINGS.footerPhone}
          </p>

          <p className="flex items-start gap-3 text-sm mt-2">
            <HiOutlineMail className="mt-1" /> {siteSettings.footerEmail || DEFAULT_SITE_SETTINGS.footerEmail}
          </p>

          <p className="mt-4 text-sm">
            Registered Office:
            <br />
            {addressLines.map((line, index) => (
              <span key={`${line}-${index}`}>
                {line}
                <br />
              </span>
            ))}
          </p>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-4 text-white">
            Chairperson
          </h3>
          {siteSettings.chairpersonImageUrl ? (
            <img
              src={siteSettings.chairpersonImageUrl}
              alt={siteSettings.chairpersonName || DEFAULT_SITE_SETTINGS.chairpersonName}
              className="w-20 h-20 rounded-full object-cover border border-gray-700"
            />
          ) : (
            <div className="w-20 h-20 rounded-full border border-dashed border-gray-600" />
          )}
          <p className="mt-3 text-sm text-gray-200">
            {siteSettings.chairpersonName || DEFAULT_SITE_SETTINGS.chairpersonName}
          </p>
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
