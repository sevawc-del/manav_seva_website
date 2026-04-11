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
        { name: "Facebook", href: siteSettings.facebookUrl, icon: FaFacebookF },
        { name: "Instagram", href: siteSettings.instagramUrl, icon: FaInstagram },
        { name: "LinkedIn", href: siteSettings.linkedinUrl, icon: FaLinkedinIn },
        { name: "Twitter", href: siteSettings.twitterUrl, icon: FaXTwitter },
        { name: "YouTube", href: siteSettings.youtubeUrl, icon: FaYoutube },
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
    <header className="sticky top-0 w-full z-50">
      <div className="relative z-30 overflow-hidden bg-[var(--ngo-primary)] text-white border-b border-white/30 shadow-[inset_0_-1px_0_rgba(255,255,255,0.14),0_8px_18px_-14px_rgba(2,23,41,0.95)] before:pointer-events-none before:absolute before:inset-0 before:bg-white/[0.03]">
        <div className="relative z-10 container mx-auto px-4 py-1.5 flex items-center justify-between gap-3">
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
                    className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-white/15 hover:bg-white/25 shadow-sm ring-1 ring-white/20 transition"
                  >
                    <IconComponent size={15} className="text-white" />
                  </a>
                );
              })}
            </div>
            <Link
              to="/donate"
              className="inline-flex items-center justify-center rounded-full px-3 py-1.5 sm:px-4 text-xs sm:text-sm font-extrabold bg-[var(--ngo-accent)] text-white border border-white/15 shadow-sm hover:brightness-95 transition"
            >
              Donate Now
            </Link>
          </div>
        </div>
      </div>

      <nav
        className="relative z-20 bg-[var(--ngo-shell-bg)] w-full border-b border-white/25 shadow-[inset_0_1px_0_rgba(255,255,255,0.12),0_12px_24px_-16px_rgba(2,23,41,0.9)] before:pointer-events-none before:absolute before:inset-0 before:bg-[var(--ngo-shell-overlay)]"
        aria-label="Primary"
      >
      <div className="relative z-10 container mx-auto px-4 py-4 md:py-3 flex items-center justify-between">
        
        {/* LOGO */}
        <Link to="/" className="flex items-center gap-2.5 min-w-0">
          <div className="flex items-center gap-1.5 lg:gap-2.5 min-w-0 rounded-lg bg-white/95 ring-1 ring-white/45 shadow-sm px-2 lg:px-2.5 py-1">
            <span className="inline-flex items-center justify-center shrink-0">
              <img
                src={siteSettings.logoUrl || DEFAULT_SITE_SETTINGS.logoUrl}
                alt={organizationLabel || "Logo"}
                className="w-14 h-14 lg:w-16 lg:h-16 object-contain"
              />
            </span>
            <div className="leading-none min-w-0">
              <p className="nav-logo-title font-bold text-[clamp(0.8rem,2.4vw,1.25rem)] leading-tight text-[var(--ngo-logo-wordmark)] whitespace-normal break-words">
                {primaryName}
              </p>
              {derivedSubline && (
                <p className="nav-logo-subline font-semibold text-[clamp(0.6rem,1.7vw,0.9rem)] leading-tight text-slate-600 tracking-wide whitespace-normal break-words">
                  {derivedSubline}
                </p>
              )}
            </div>
          </div>
        </Link>

        {/* Desktop Menu */}
        <ul className="navbar-desktop-menu hidden md:flex gap-6">
          {/* Home */}
          <li>
            <NavLink
              to="/"
              className={({ isActive }) =>
                `text-white/90 hover:text-white transition ${
                  isActive ? "font-semibold text-white" : ""
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
              className="text-white/90 hover:text-white transition flex items-center gap-1"
            >
              About <ChevronDown size={16} />
            </button>
            {isAboutOpen && (
              <ul
                id="desktop-about-menu"
                className="absolute top-full left-0 bg-white shadow-lg rounded-md py-2 min-w-[200px] z-50 text-sm"
              >
                {aboutItems.map((item, index) => (
                  <li key={item.path}>
                    <NavLink
                      to={item.path}
                      className={({ isActive }) =>
                        `block px-4 py-2 text-slate-700 transition ${
                          index % 2 === 0 ? "bg-white" : "bg-slate-50/70"
                        } hover:bg-[var(--ngo-surface-alt)] ${
                          isActive ? "font-semibold text-[var(--ngo-primary)] bg-[var(--ngo-surface-alt)]" : ""
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
              className="text-white/90 hover:text-white transition flex items-center gap-1"
            >
              Media Center <ChevronDown size={16} />
            </button>
            {isMediaOpen && (
              <ul
                id="desktop-media-menu"
                className="absolute top-full left-0 bg-white shadow-lg rounded-md py-2 min-w-[200px] z-50 text-sm"
              >
                {mediaItems.map((item, index) => (
                  <li key={item.path}>
                    <NavLink
                      to={item.path}
                      className={({ isActive }) =>
                        `block px-4 py-2 text-slate-700 transition ${
                          index % 2 === 0 ? "bg-white" : "bg-slate-50/70"
                        } hover:bg-[var(--ngo-surface-alt)] ${
                          isActive ? "font-semibold text-[var(--ngo-primary)] bg-[var(--ngo-surface-alt)]" : ""
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
                `text-white/90 hover:text-white transition ${
                  isActive ? "font-semibold text-white" : ""
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
              className="text-white/90 hover:text-white transition flex items-center gap-1"
            >
              Get Involved <ChevronDown size={16} />
            </button>
            {isGetInvolvedOpen && (
              <ul
                id="desktop-get-involved-menu"
                className="absolute top-full left-0 bg-white shadow-lg rounded-md py-2 min-w-[200px] z-50 text-sm"
              >
                {getInvolvedItems.map((item, index) => (
                  <li key={item.path}>
                    <NavLink
                      to={item.path}
                      className={({ isActive }) =>
                        `block px-4 py-2 text-slate-700 transition ${
                          index % 2 === 0 ? "bg-white" : "bg-slate-50/70"
                        } hover:bg-[var(--ngo-surface-alt)] ${
                          isActive ? "font-semibold text-[var(--ngo-primary)] bg-[var(--ngo-surface-alt)]" : ""
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
                  `text-white/90 hover:text-white transition ${
                    isActive ? "font-semibold text-white" : ""
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
          className="md:hidden text-white"
          aria-expanded={isOpen}
          aria-controls="mobile-main-menu"
          aria-label={isOpen ? "Close main menu" : "Open main menu"}
        >
          {isOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div id="mobile-main-menu" className="md:hidden bg-[var(--ngo-primary)] shadow-inner px-4 py-4 border-t border-white/20">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/20">
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
                    className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-white/10 shadow-sm border border-white/25 hover:bg-white/20 transition"
                  >
                    <IconComponent size={15} className="text-white" />
                  </a>
                );
              })}
            </div>
            <Link
              to="/donate"
              className="inline-flex items-center justify-center rounded-full px-3 py-1.5 text-xs font-extrabold bg-[var(--ngo-accent)] text-white border border-white/15 shadow-sm hover:brightness-95 transition"
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
                  `block text-white/90 hover:text-white transition ${
                    isActive ? "font-semibold text-white" : ""
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
                className="text-white/90 hover:text-white transition flex items-center gap-1 w-full text-left"
              >
                About <ChevronDown size={16} className={`transform transition-transform ${isAboutOpen ? 'rotate-180' : ''}`} />
              </button>
              {isAboutOpen && (
                <ul id="mobile-about-menu" className="ml-4 mt-2 space-y-2">
                  {aboutItems.map((item, index) => (
                    <li key={item.path}>
                      <NavLink
                        to={item.path}
                        className={({ isActive }) =>
                          `block rounded-md px-3 py-1.5 transition ${
                            index % 2 === 0 ? "bg-white/5 text-white/90" : "bg-white/10 text-white/90"
                          } hover:bg-white/20 hover:text-white ${
                            isActive ? "font-semibold text-white bg-white/20" : ""
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
                className="text-white/90 hover:text-white transition flex items-center gap-1 w-full text-left"
              >
                Media Center <ChevronDown size={16} className={`transform transition-transform ${isMediaOpen ? 'rotate-180' : ''}`} />
              </button>
              {isMediaOpen && (
                <ul id="mobile-media-menu" className="ml-4 mt-2 space-y-2">
                  {mediaItems.map((item, index) => (
                    <li key={item.path}>
                      <NavLink
                        to={item.path}
                        className={({ isActive }) =>
                          `block rounded-md px-3 py-1.5 transition ${
                            index % 2 === 0 ? "bg-white/5 text-white/90" : "bg-white/10 text-white/90"
                          } hover:bg-white/20 hover:text-white ${
                            isActive ? "font-semibold text-white bg-white/20" : ""
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
                  `block text-white/90 hover:text-white transition ${
                    isActive ? "font-semibold text-white" : ""
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
                className="text-white/90 hover:text-white transition flex items-center gap-1 w-full text-left"
              >
                Get Involved <ChevronDown size={16} className={`transform transition-transform ${isGetInvolvedOpen ? 'rotate-180' : ''}`} />
              </button>
              {isGetInvolvedOpen && (
                <ul id="mobile-get-involved-menu" className="ml-4 mt-2 space-y-2">
                  {getInvolvedItems.map((item, index) => (
                    <li key={item.path}>
                      <NavLink
                        to={item.path}
                        className={({ isActive }) =>
                          `block rounded-md px-3 py-1.5 transition ${
                            index % 2 === 0 ? "bg-white/5 text-white/90" : "bg-white/10 text-white/90"
                          } hover:bg-white/20 hover:text-white ${
                            isActive ? "font-semibold text-white bg-white/20" : ""
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
                  `block text-white/90 hover:text-white transition ${
                    isActive ? "font-semibold text-white" : ""
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


