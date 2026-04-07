import React, { Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import ErrorBoundary from '../components/ErrorBoundary';
import Loader from '../components/Loader';

const Home = lazy(() => import('../pages/Home'));
const About = lazy(() => import('../pages/About'));
const AboutUs = lazy(() => import('../pages/About/AboutUs'));
const Messages = lazy(() => import('../pages/About/Messages'));
const Governance = lazy(() => import('../pages/About/Governance'));
const GeographicFocus = lazy(() => import('../pages/About/GeographicFocus'));
const Activities = lazy(() => import('../pages/Activities'));
const ActivityDetail = lazy(() => import('../pages/Activities/ActivityDetail'));
const HealthCampaigns = lazy(() => import('../pages/Activities/HealthCampaigns'));
const EducationInitiatives = lazy(() => import('../pages/Activities/EducationInitiatives'));
const WomenEmpowerment = lazy(() => import('../pages/Activities/WomenEmpowerment'));
const GetInvolved = lazy(() => import('../pages/GetInvolved'));
const Career = lazy(() => import('../pages/GetInvolved/Career'));
const CareerApplication = lazy(() => import('../pages/GetInvolved/CareerApplication'));
const Tenders = lazy(() => import('../pages/GetInvolved/Tenders'));
const TenderApplication = lazy(() => import('../pages/GetInvolved/TenderApplication'));
const Volunteer = lazy(() => import('../pages/GetInvolved/Volunteer'));
const VolunteerApplication = lazy(() => import('../pages/GetInvolved/VolunteerApplication'));
const Gallery = lazy(() => import('../pages/Gallery'));
const GalleryDetail = lazy(() => import('../pages/GalleryDetail'));
const NewsEvents = lazy(() => import('../pages/NewsEvents'));
const NewsDetail = lazy(() => import('../pages/NewsDetail'));
const EventDetail = lazy(() => import('../pages/EventDetail'));
const Contact = lazy(() => import('../pages/Contact'));
const Reports = lazy(() => import('../pages/Reports'));
const Donate = lazy(() => import('../pages/Donate'));

function AppRoutes() {
  return (
    <ErrorBoundary>
      <Suspense fallback={<Loader />}>
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
          <Route path="/get-involved/career/apply" element={<CareerApplication />} />
          <Route path="/get-involved/career/apply/:jobId" element={<CareerApplication />} />
          <Route path="/get-involved/tenders" element={<Tenders />} />
          <Route path="/get-involved/tenders/apply" element={<TenderApplication />} />
          <Route path="/get-involved/tenders/apply/:tenderId" element={<TenderApplication />} />
          <Route path="/get-involved/volunteer" element={<Volunteer />} />
          <Route path="/get-involved/volunteer/apply" element={<VolunteerApplication />} />
          <Route path="/get-involved/volunteer/apply/:volunteerId" element={<VolunteerApplication />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/gallery/:id" element={<GalleryDetail />} />
          <Route path="/news-events" element={<NewsEvents />} />
          <Route path="/news-events/:slug" element={<NewsDetail />} />
          <Route path="/events/:slug" element={<EventDetail />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/donate" element={<Donate />} />
          <Route path="/reports" element={<Reports />} />
        </Routes>
      </Suspense>
    </ErrorBoundary>
  );
}

export default AppRoutes;
