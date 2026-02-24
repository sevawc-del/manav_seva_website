
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import ErrorBoundary from '../components/ErrorBoundary';
import Home from '../pages/Home';
import About from '../pages/About';
import AboutUs from '../pages/About/AboutUs';
import Messages from '../pages/About/Messages';
import Governance from '../pages/About/Governance';
import GeographicFocus from '../pages/About/GeographicFocus';
import Activities from '../pages/Activities';
import ActivityDetail from '../pages/Activities/ActivityDetail';
import HealthCampaigns from '../pages/Activities/HealthCampaigns';
import EducationInitiatives from '../pages/Activities/EducationInitiatives';
import WomenEmpowerment from '../pages/Activities/WomenEmpowerment';
import GetInvolved from '../pages/GetInvolved';
import Career from '../pages/GetInvolved/Career';
import Tenders from '../pages/GetInvolved/Tenders';
import Volunteer from '../pages/GetInvolved/Volunteer';
import Gallery from '../pages/Gallery';
import GalleryDetail from '../pages/GalleryDetail';
import NewsEvents from '../pages/NewsEvents';
import NewsDetail from '../pages/NewsDetail';
import EventDetail from '../pages/EventDetail';
import Contact from '../pages/Contact';
import Reports from '../pages/Reports';
import Donate from '../pages/Donate';

function AppRoutes() {
  return (
    <ErrorBoundary>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/about/about-us" element={<AboutUs />} />
        <Route path="/about/messages" element={<Messages />} />
        <Route path="/about/governance" element={<Governance />} />
        <Route path="/about/geographic-focus" element={<GeographicFocus />} />
        <Route path="/activities" element={<Activities />} />
        <Route path="/activities/:slug" element={<ActivityDetail />} />
        <Route path="/activities/health-campaigns" element={<HealthCampaigns />} />
        <Route path="/activities/education-initiatives" element={<EducationInitiatives />} />
        <Route path="/activities/women-empowerment" element={<WomenEmpowerment />} />
        <Route path="/get-involved" element={<GetInvolved />} />
        <Route path="/get-involved/career" element={<Career />} />
        <Route path="/get-involved/tenders" element={<Tenders />} />
        <Route path="/get-involved/volunteer" element={<Volunteer />} />
        <Route path="/gallery" element={<Gallery />} />
        <Route path="/gallery/:id" element={<GalleryDetail />} />
        <Route path="/news-events" element={<NewsEvents />} />
        <Route path="/news-events/:slug" element={<NewsDetail />} />
        <Route path="/events/:slug" element={<EventDetail />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/donate" element={<Donate />} />
        <Route path="/reports" element={<Reports />} />
      </Routes>
    </ErrorBoundary>
  );
}

export default AppRoutes;
