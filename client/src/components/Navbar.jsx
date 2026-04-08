import { useEffect, useMemo, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { Menu, X, ChevronDown } from "lucide-react";
import { FaFacebookF, FaInstagram, FaLinkedinIn, FaYoutube } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import { getSiteSettingsCached } from "../utils/api";

const DEFAULT_SITE_SETTINGS = {
  organizationName: "Manav Seva Sansthan SEVA",
  organizationSubline: "Society for Eco-development Voluntary Action",
  logoUrl: "/images/logo.png",
  supportMessage: "Support our mission to transform lives.",
  facebookUrl: "https://www.facebook.com",
  instagramUrl: "https://www.instagram.com",
  linkedinUrl: "https://www.linkedin.com",
  twitterUrl: "https://x.com",
  youtubeUrl: "https://www.youtube.com",
};

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [isMediaOpen, setIsMediaOpen] = useState(false);
  const [isGetInvolvedOpen, setIsGetInvolvedOpen] = useState(false);
  const [siteSettings, setSiteSettings] = useState(DEFAULT_SITE_SETTINGS);
  const location = useLocation();

  const navItems = [
    { name: "Home", path: "/" },
    { name: "Activities", path: "/activities" },
    { name: "Contact", path: "/contact" },
  ];

  const aboutItems = [
    { name: "About Us", path: "/about/about-us" },
    { name: "Messages", path: "/about/messages" },
    { name: "Governance", path: "/about/governance" },
    { name: "Geographic Focus", path: "/about/geographic-focus" },
  ];

  const mediaItems = [
    { name: "News & Events", path: "/news-events" },
    { name: "Gallery", path: "/gallery" },
    { name: "Reports", path: "/reports" },
  ];

  const getInvolvedItems = [
    { name: "Career", path: "/get-involved/career" },
    { name: "Tenders", path: "/get-involved/tenders" },
    { name: "Volunteer", path: "/get-involved/volunteer" },
  ];

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

  useEffect(() => {
    const handleEscapeKey = (event) => {
      if (event.key !== "Escape") return;
      setIsOpen(false);
      setIsAboutOpen(false);
      setIsMediaOpen(false);
      setIsGetInvolvedOpen(false);
    };

    window.addEventListener("keydown", handleEscapeKey);
    return () => window.removeEventListener("keydown", handleEscapeKey);
  }, []);

  useEffect(() => {
    setIsOpen(false);
    setIsAboutOpen(false);
    setIsMediaOpen(false);
    setIsGetInvolvedOpen(false);
  }, [location.pathname]);

  const socialLinks = useMemo(
    () =>
      [
        { name: "Facebook", href: siteSettings.facebookUrl, icon: FaFacebookF, iconClass: "text-[#1877F2]" },
        { name: "Instagram", href: siteSettings.instagramUrl, icon: FaInstagram, iconClass: "text-[#E4405F]" },
        { name: "LinkedIn", href: siteSettings.linkedinUrl, icon: FaLinkedinIn, iconClass: "text-[#0A66C2]" },
        { name: "Twitter", href: siteSettings.twitterUrl, icon: FaXTwitter, iconClass: "text-[#111827]" },
        { name: "YouTube", href: siteSettings.youtubeUrl, icon: FaYoutube, iconClass: "text-[#FF0000]" },
      ].filter((link) => String(link.href || "").trim()),
    [
      siteSettings.facebookUrl,
      siteSettings.instagramUrl,
      siteSettings.linkedinUrl,
      siteSettings.twitterUrl,
      siteSettings.youtubeUrl,
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

  return (
    <header className="sticky top-0 w-full z-50 shadow-md">
      <div className="bg-gradient-to-l from-blue-700 via-emerald-100 via-sky-700 to-blue-800 text-white border-b border-white/20">
        <div className="container mx-auto px-4 py-2 flex items-center justify-between gap-3">
          <p className="text-xs sm:text-sm font-medium text-white/95 truncate">
            {siteSettings.supportMessage || DEFAULT_SITE_SETTINGS.supportMessage}
          </p>

          <div className="flex items-center gap-2 sm:gap-3">
            <div className="hidden sm:flex items-center gap-1">
              {socialLinks.map((item) => {
                const IconComponent = item.icon;
                return (
                  <a
                    key={item.name}
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={item.name}
                    className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-white/95 hover:bg-white shadow-sm ring-1 ring-white/50 transition"
                  >
                    <IconComponent size={15} className={item.iconClass} />
                  </a>
                );
              })}
            </div>
            <Link
              to="/donate"
              className="inline-flex items-center justify-center rounded-full px-3 py-1.5 sm:px-4 text-xs sm:text-sm font-extrabold bg-gradient-to-r from-amber-300 via-orange-300 to-amber-400 text-slate-900 border border-amber-100 shadow-[0_4px_12px_rgba(217,119,6,0.35)] hover:from-amber-200 hover:via-orange-200 hover:to-amber-300 transition"
            >
              Donate Now
            </Link>
          </div>
        </div>
      </div>

      <nav className="bg-white w-full" aria-label="Primary">
      <div className="container mx-auto px-4 py-4 md:py-3 flex items-center justify-between">
        
        {/* LOGO */}
        <Link to="/" className="flex items-center gap-2.5 min-w-0">
          <img
            src={siteSettings.logoUrl || DEFAULT_SITE_SETTINGS.logoUrl}
            alt={organizationLabel || "Logo"}
            className="w-16 h-16 md:w-15 md:h-15 object-contain shrink-0"
          />
          <div className="leading-none min-w-0">
            <p className="font-bold text-base sm:text-lg md:text-xl text-orange-600 truncate">
              {primaryName}
            </p>
            {derivedSubline && (
              <p className="font-semibold text-[11px] sm:text-xs md:text-sm text-black-500 tracking-wide truncate">
                {derivedSubline}
              </p>
            )}
          </div>
        </Link>

        {/* Desktop Menu */}
        <ul className="hidden md:flex gap-6">
          {/* Home */}
          <li>
            <NavLink
              to="/"
              className={({ isActive }) =>
                `text-gray-700 hover:text-blue-600 transition ${
                  isActive ? "font-semibold text-blue-600" : ""
                }`
              }
            >
              Home
            </NavLink>
          </li>
          {/* About Dropdown */}
          <li
            className="relative"
            onMouseEnter={() => setIsAboutOpen(true)}
            onMouseLeave={() => setIsAboutOpen(false)}
          >
            <button
              type="button"
              onClick={() => {
                setIsAboutOpen((prev) => !prev);
                setIsMediaOpen(false);
                setIsGetInvolvedOpen(false);
              }}
              aria-haspopup="true"
              aria-expanded={isAboutOpen}
              aria-controls="desktop-about-menu"
              className="text-gray-700 hover:text-blue-600 transition flex items-center gap-1"
            >
              About <ChevronDown size={16} />
            </button>
            {isAboutOpen && (
              <ul
                id="desktop-about-menu"
                className="absolute top-full left-0 bg-white shadow-lg rounded-md py-2 min-w-[200px] z-50"
              >
                {aboutItems.map((item) => (
                  <li key={item.path}>
                    <NavLink
                      to={item.path}
                      className={({ isActive }) =>
                        `block px-4 py-2 text-gray-700 hover:bg-gray-100 transition ${
                          isActive ? "font-semibold text-blue-600" : ""
                        }`
                      }
                    >
                      {item.name}
                    </NavLink>
                  </li>
                ))}
              </ul>
            )}
          </li>
          {/* Media Center Dropdown */}
          <li
            className="relative"
            onMouseEnter={() => setIsMediaOpen(true)}
            onMouseLeave={() => setIsMediaOpen(false)}
          >
            <button
              type="button"
              onClick={() => {
                setIsMediaOpen((prev) => !prev);
                setIsAboutOpen(false);
                setIsGetInvolvedOpen(false);
              }}
              aria-haspopup="true"
              aria-expanded={isMediaOpen}
              aria-controls="desktop-media-menu"
              className="text-gray-700 hover:text-blue-600 transition flex items-center gap-1"
            >
              Media Center <ChevronDown size={16} />
            </button>
            {isMediaOpen && (
              <ul
                id="desktop-media-menu"
                className="absolute top-full left-0 bg-white shadow-lg rounded-md py-2 min-w-[200px] z-50"
              >
                {mediaItems.map((item) => (
                  <li key={item.path}>
                    <NavLink
                      to={item.path}
                      className={({ isActive }) =>
                        `block px-4 py-2 text-gray-700 hover:bg-gray-100 transition ${
                          isActive ? "font-semibold text-blue-600" : ""
                        }`
                      }
                    >
                      {item.name}
                    </NavLink>
                  </li>
                ))}
              </ul>
            )}
          </li>
          {/* Activities */}
          <li>
            <NavLink
              to="/activities"
              className={({ isActive }) =>
                `text-gray-700 hover:text-blue-600 transition ${
                  isActive ? "font-semibold text-blue-600" : ""
                }`
              }
            >
              Activities
            </NavLink>
          </li>
          {/* Get Involved Dropdown */}
          <li
            className="relative"
            onMouseEnter={() => setIsGetInvolvedOpen(true)}
            onMouseLeave={() => setIsGetInvolvedOpen(false)}
          >
            <button
              type="button"
              onClick={() => {
                setIsGetInvolvedOpen((prev) => !prev);
                setIsAboutOpen(false);
                setIsMediaOpen(false);
              }}
              aria-haspopup="true"
              aria-expanded={isGetInvolvedOpen}
              aria-controls="desktop-get-involved-menu"
              className="text-gray-700 hover:text-blue-600 transition flex items-center gap-1"
            >
              Get Involved <ChevronDown size={16} />
            </button>
            {isGetInvolvedOpen && (
              <ul
                id="desktop-get-involved-menu"
                className="absolute top-full left-0 bg-white shadow-lg rounded-md py-2 min-w-[200px] z-50"
              >
                {getInvolvedItems.map((item) => (
                  <li key={item.path}>
                    <NavLink
                      to={item.path}
                      className={({ isActive }) =>
                        `block px-4 py-2 text-gray-700 hover:bg-gray-100 transition ${
                          isActive ? "font-semibold text-blue-600" : ""
                        }`
                      }
                    >
                      {item.name}
                    </NavLink>
                  </li>
                ))}
              </ul>
            )}
          </li>
          {/* Rest of navItems */}
          {navItems.slice(2).map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  `text-gray-700 hover:text-blue-600 transition ${
                    isActive ? "font-semibold text-blue-600" : ""
                  }`
                }
              >
                {item.name}
              </NavLink>
            </li>
          ))}
        </ul>

        {/* Mobile Toggle */}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden text-gray-700"
          aria-expanded={isOpen}
          aria-controls="mobile-main-menu"
          aria-label={isOpen ? "Close main menu" : "Open main menu"}
        >
          {isOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div id="mobile-main-menu" className="md:hidden bg-white shadow-inner px-4 py-4">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
            <div className="flex items-center gap-2">
              {socialLinks.map((item) => {
                const IconComponent = item.icon;
                return (
                  <a
                    key={item.name}
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={item.name}
                    className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-white shadow-sm border border-gray-200 hover:bg-gray-50 transition"
                  >
                    <IconComponent size={15} className={item.iconClass} />
                  </a>
                );
              })}
            </div>
            <Link
              to="/donate"
              className="inline-flex items-center justify-center rounded-full px-3 py-1.5 text-xs font-extrabold bg-gradient-to-r from-amber-300 via-orange-300 to-amber-400 text-slate-900 border border-amber-100 shadow-[0_4px_12px_rgba(217,119,6,0.25)] hover:from-amber-200 hover:via-orange-200 hover:to-amber-300 transition"
              onClick={() => setIsOpen(false)}
            >
              Donate Now
            </Link>
          </div>

          <ul className="flex flex-col gap-4">
            {/* Home */}
            <li>
              <NavLink
                to="/"
                className={({ isActive }) =>
                  `block text-gray-700 hover:text-blue-600 transition ${
                    isActive ? "font-semibold text-blue-600" : ""
                  }`
                }
                onClick={() => setIsOpen(false)}
              >
                Home
              </NavLink>
            </li>
            {/* About Dropdown */}
            <li>
              <button
                type="button"
                onClick={() => setIsAboutOpen(!isAboutOpen)}
                aria-expanded={isAboutOpen}
                aria-controls="mobile-about-menu"
                className="text-gray-700 hover:text-blue-600 transition flex items-center gap-1 w-full text-left"
              >
                About <ChevronDown size={16} className={`transform transition-transform ${isAboutOpen ? 'rotate-180' : ''}`} />
              </button>
              {isAboutOpen && (
                <ul id="mobile-about-menu" className="ml-4 mt-2 space-y-2">
                  {aboutItems.map((item) => (
                    <li key={item.path}>
                      <NavLink
                        to={item.path}
                        className={({ isActive }) =>
                          `block text-gray-700 hover:text-blue-600 transition ${
                            isActive ? "font-semibold text-blue-600" : ""
                          }`
                        }
                        onClick={() => setIsOpen(false)}
                      >
                        {item.name}
                      </NavLink>
                    </li>
                  ))}
                </ul>
              )}
            </li>
            {/* Media Center Dropdown */}
            <li>
              <button
                type="button"
                onClick={() => setIsMediaOpen(!isMediaOpen)}
                aria-expanded={isMediaOpen}
                aria-controls="mobile-media-menu"
                className="text-gray-700 hover:text-blue-600 transition flex items-center gap-1 w-full text-left"
              >
                Media Center <ChevronDown size={16} className={`transform transition-transform ${isMediaOpen ? 'rotate-180' : ''}`} />
              </button>
              {isMediaOpen && (
                <ul id="mobile-media-menu" className="ml-4 mt-2 space-y-2">
                  {mediaItems.map((item) => (
                    <li key={item.path}>
                      <NavLink
                        to={item.path}
                        className={({ isActive }) =>
                          `block text-gray-700 hover:text-blue-600 transition ${
                            isActive ? "font-semibold text-blue-600" : ""
                          }`
                        }
                        onClick={() => setIsOpen(false)}
                      >
                        {item.name}
                      </NavLink>
                    </li>
                  ))}
                </ul>
              )}
            </li>
            {/* Activities */}
            <li>
              <NavLink
                to="/activities"
                className={({ isActive }) =>
                  `block text-gray-700 hover:text-blue-600 transition ${
                    isActive ? "font-semibold text-blue-600" : ""
                  }`
                }
                onClick={() => setIsOpen(false)}
              >
                Activities
              </NavLink>
            </li>
            {/* Get Involved Dropdown */}
            <li>
              <button
                type="button"
                onClick={() => setIsGetInvolvedOpen(!isGetInvolvedOpen)}
                aria-expanded={isGetInvolvedOpen}
                aria-controls="mobile-get-involved-menu"
                className="text-gray-700 hover:text-blue-600 transition flex items-center gap-1 w-full text-left"
              >
                Get Involved <ChevronDown size={16} className={`transform transition-transform ${isGetInvolvedOpen ? 'rotate-180' : ''}`} />
              </button>
              {isGetInvolvedOpen && (
                <ul id="mobile-get-involved-menu" className="ml-4 mt-2 space-y-2">
                  {getInvolvedItems.map((item) => (
                    <li key={item.path}>
                      <NavLink
                        to={item.path}
                        className={({ isActive }) =>
                          `block text-gray-700 hover:text-blue-600 transition ${
                            isActive ? "font-semibold text-blue-600" : ""
                          }`
                        }
                        onClick={() => setIsOpen(false)}
                      >
                        {item.name}
                      </NavLink>
                    </li>
                  ))}
                </ul>
              )}
            </li>
            {/* Contact */}
            <li>
              <NavLink
                to="/contact"
                className={({ isActive }) =>
                  `block text-gray-700 hover:text-blue-600 transition ${
                    isActive ? "font-semibold text-blue-600" : ""
                  }`
                }
                onClick={() => setIsOpen(false)}
              >
                Contact
              </NavLink>
            </li>
          </ul>
        </div>
      )}
      </nav>
    </header>
  );
};

export default Navbar;

