import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Sliders
export const getSliders = () => api.get('/sliders');

// News
export const getNews = () => api.get('/news');
export const getNewsById = (id) => api.get(`/news/${id}`);
export const getNewsBySlug = (slug) => api.get(`/news/slug/${slug}`);

// Events
export const getEvents = () => api.get('/events');
export const getEventBySlug = (slug) => api.get(`/events/slug/${slug}`);

// Testimonials
export const getTestimonials = () => api.get('/testimonials');
export const submitTestimonial = (data) => api.post('/testimonials', data);

// Sponsors
export const getSponsors = () => api.get('/sponsors');

// Donation Settings
export const getDonationSettings = () => api.get('/donation-settings');
export const getSiteSettings = () => api.get('/site-settings');
export const createDonationOrder = (data) => api.post('/donations/create-order', data);
export const getDonationStatus = (orderId, email) =>
  api.get(`/donations/status/${orderId}`, {
    params: email ? { email } : {}
  });

// Tenders
export const getTenders = () => api.get('/tenders');
export const getTenderById = (id) => api.get(`/tenders/${id}`);

// Gallery
export const getGallery = () => api.get('/gallery');
export const getGalleryItemById = (id) => api.get(`/gallery/${id}`);

// Reports
export const getReports = () => api.get('/reports');
export const getReportById = (id) => api.get(`/reports/${id}`);

// Contact
export const sendContactMessage = (data) => api.post('/contact', data);

// About
export const getAboutUs = () => api.get('/about/about-us');
export const getMessages = () => api.get('/about/messages');
export const getGovernance = () => api.get('/about/governance');
export const getGeographicFocus = () => api.get('/about/geographic-focus');

// Activities
export const getActivities = () => api.get('/activities');
export const getActivityPresence = (id) => api.get(`/activities/${id}/presence`);

// Admin Activities (for client-side display)
export const getAdminActivities = () => api.get('/admin-activities');
export const getAdminActivityBySlug = (slug) => api.get(`/admin-activities/${slug}`);
export const getGeographicActivities = () => api.get('/geographic-activities');
export const getGeographicActivityPresence = (id) => api.get(`/geographic-activities/${id}/presence`);

// Journeys
export const getJourneys = () => api.get('/journeys');
export const getJourneyById = (id) => api.get(`/journeys/${id}`);

// Jobs
export const getJobs = () => api.get('/jobs');
export const getJobById = (id) => api.get(`/jobs/${id}`);

// Volunteers
export const getVolunteers = () => api.get('/volunteers/public');
export const getVolunteerById = (id) => api.get(`/volunteers/public/${id}`);
export const applyForVolunteer = (data) => api.post('/volunteers/apply', data);
