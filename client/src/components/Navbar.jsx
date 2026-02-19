import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { Menu, X, ChevronDown } from "lucide-react";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [isMediaOpen, setIsMediaOpen] = useState(false);
  const [isGetInvolvedOpen, setIsGetInvolvedOpen] = useState(false);

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

  return (
    <nav className="bg-white shadow-md fixed top-0 left-0 w-full z-50">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        
        {/* LOGO */}
        <Link to="/" className="flex items-center gap-2">
          <img src="/images/logo.png" alt="Logo" className="w-10 h-10" />
          <span className="font-bold text-xl text-gray-800">Manav Seva India</span>
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
          <li className="relative">
            <button
              onMouseEnter={() => setIsAboutOpen(true)}
              onMouseLeave={() => setIsAboutOpen(false)}
              className="text-gray-700 hover:text-blue-600 transition flex items-center gap-1"
            >
              About <ChevronDown size={16} />
            </button>
            {isAboutOpen && (
              <ul
                className="absolute top-full left-0 bg-white shadow-lg rounded-md py-2 min-w-[200px] z-50"
                onMouseEnter={() => setIsAboutOpen(true)}
                onMouseLeave={() => setIsAboutOpen(false)}
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
          <li className="relative">
            <button
              onMouseEnter={() => setIsMediaOpen(true)}
              onMouseLeave={() => setIsMediaOpen(false)}
              className="text-gray-700 hover:text-blue-600 transition flex items-center gap-1"
            >
              Media Center <ChevronDown size={16} />
            </button>
            {isMediaOpen && (
              <ul
                className="absolute top-full left-0 bg-white shadow-lg rounded-md py-2 min-w-[200px] z-50"
                onMouseEnter={() => setIsMediaOpen(true)}
                onMouseLeave={() => setIsMediaOpen(false)}
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
          <li className="relative">
            <button
              onMouseEnter={() => setIsGetInvolvedOpen(true)}
              onMouseLeave={() => setIsGetInvolvedOpen(false)}
              className="text-gray-700 hover:text-blue-600 transition flex items-center gap-1"
            >
              Get Involved <ChevronDown size={16} />
            </button>
            {isGetInvolvedOpen && (
              <ul
                className="absolute top-full left-0 bg-white shadow-lg rounded-md py-2 min-w-[200px] z-50"
                onMouseEnter={() => setIsGetInvolvedOpen(true)}
                onMouseLeave={() => setIsGetInvolvedOpen(false)}
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
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden text-gray-700"
        >
          {isOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-white shadow-inner px-4 py-4">
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
                onClick={() => setIsAboutOpen(!isAboutOpen)}
                className="text-gray-700 hover:text-blue-600 transition flex items-center gap-1 w-full text-left"
              >
                About <ChevronDown size={16} className={`transform transition-transform ${isAboutOpen ? 'rotate-180' : ''}`} />
              </button>
              {isAboutOpen && (
                <ul className="ml-4 mt-2 space-y-2">
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
                onClick={() => setIsMediaOpen(!isMediaOpen)}
                className="text-gray-700 hover:text-blue-600 transition flex items-center gap-1 w-full text-left"
              >
                Media Center <ChevronDown size={16} className={`transform transition-transform ${isMediaOpen ? 'rotate-180' : ''}`} />
              </button>
              {isMediaOpen && (
                <ul className="ml-4 mt-2 space-y-2">
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
                onClick={() => setIsGetInvolvedOpen(!isGetInvolvedOpen)}
                className="text-gray-700 hover:text-blue-600 transition flex items-center gap-1 w-full text-left"
              >
                Get Involved <ChevronDown size={16} className={`transform transition-transform ${isGetInvolvedOpen ? 'rotate-180' : ''}`} />
              </button>
              {isGetInvolvedOpen && (
                <ul className="ml-4 mt-2 space-y-2">
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
  );
};

export default Navbar;

