import { Link } from "react-router-dom";
import {
  FaFacebookF,
  FaInstagram,
  FaYoutube,
  FaLinkedinIn,
  FaPhoneAlt,
} from "react-icons/fa";
import { HiOutlineMail } from "react-icons/hi";

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-300 pt-12 pb-6 mt-12">
      <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-10">

        {/* ABOUT */}
        <div>
          <h2 className="text-xl font-semibold mb-4 text-white">
            Manav Seva India
          </h2>
          <p className="text-sm leading-relaxed">
            Manav Seva India works towards sustainable community development,
            focusing on education, healthcare, women empowerment and social
            protection programs across India.
          </p>

          <div className="flex gap-4 mt-4">
            <a href="#" className="hover:text-white text-lg">
              <FaFacebookF />
            </a>
            <a href="#" className="hover:text-white text-lg">
              <FaInstagram />
            </a>
            <a href="#" className="hover:text-white text-lg">
              <FaYoutube />
            </a>
            <a href="#" className="hover:text-white text-lg">
              <FaLinkedinIn />
            </a>
          </div>
        </div>

        {/* QUICK LINKS */}
        <div>
          <h3 className="text-lg font-semibold mb-4 text-white">
            Quick Links
          </h3>
          <ul className="space-y-2 text-sm">
            <li><Link to="/" className="hover:text-white">Home</Link></li>
            <li><Link to="/about" className="hover:text-white">About Us</Link></li>
            <li><Link to="/activities" className="hover:text-white">Our Activities</Link></li>
            <li><Link to="/donate" className="hover:text-white">Donate Now</Link></li>
            <li><Link to="/career" className="hover:text-white">Career</Link></li>
            <li><Link to="/contact" className="hover:text-white">Contact Us</Link></li>
          </ul>
        </div>

        {/* INFORMATION */}
        <div>
          <h3 className="text-lg font-semibold mb-4 text-white">
            Information
          </h3>
          <ul className="space-y-2 text-sm">
            <li><Link to="/reports" className="hover:text-white">Reports</Link></li>
            <li><Link to="/news-events" className="hover:text-white">News & Events</Link></li>
            <li><Link to="/gallery" className="hover:text-white">Gallery</Link></li>
            <li><Link to="/tenders" className="hover:text-white">Tenders</Link></li>
            <li><Link to="/data" className="hover:text-white">Data & Documents</Link></li>
          </ul>
        </div>

        {/* CONTACT */}
        <div>
          <h3 className="text-lg font-semibold mb-4 text-white">
            Contact
          </h3>

          <p className="flex items-start gap-3 text-sm">
            <FaPhoneAlt className="mt-1" /> +91 99999 88888
          </p>

          <p className="flex items-start gap-3 text-sm mt-2">
            <HiOutlineMail className="mt-1" /> info@manavsevaindia.org
          </p>

          <p className="mt-4 text-sm">
            Registered Office:<br />
            Manav Seva India,<br />
            Uttar Pradesh, India.
          </p>
        </div>
      </div>

      {/* COPYRIGHT */}
      <div className="text-center text-gray-500 text-sm mt-10 border-t border-gray-700 pt-4">
        © {new Date().getFullYear()} Manav Seva India. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
