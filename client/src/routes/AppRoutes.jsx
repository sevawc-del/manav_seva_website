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
import Career from '../pages/Activities/Career';
import Gallery from '../pages/Gallery';
import NewsEvents from '../pages/NewsEvents';
import Contact from '../pages/Contact';
import Reports from '../pages/Reports';
import Tenders from '../pages/Tenders';

const AppRoutes = () => {
  return (
    <ErrorBoundary>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />}>
          <Route path="about-us" element={<AboutUs />} />
          <Route path="messages" element={<Messages />} />
          <Route path="governance" element={<Governance />} />
          <Route path="geographic-focus" element={<GeographicFocus />} />
        </Route>
        <Route path="/activities" element={<Activities />} />
        <Route path="/activities/:slug" element={<ActivityDetail />} />
        <Route path="/activities/health-campaigns" element={<HealthCampaigns />} />
        <Route path="/activities/education-initiatives" element={<EducationInitiatives />} />
        <Route path="/activities/women-empowerment" element={<WomenEmpowerment />} />
        <Route path="/activities/career" element={<Career />} />
        <Route path="/gallery" element={<Gallery />} />
        <Route path="/news-events" element={<NewsEvents />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/tenders" element={<Tenders />} />
      </Routes>
    </ErrorBoundary>
  );
};

export default AppRoutes;
