import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    const message = error?.response?.data?.message;

    const isAuthError =
      status === 401 ||
      (status === 400 && message === 'Invalid token') ||
      status === 403;

    if (isAuthError) {
      localStorage.removeItem('token');
      if (typeof window !== 'undefined' && window.location.hash !== '#/') {
        window.location.hash = '#/';
      }
    }

    return Promise.reject(error);
  }
);


// Auth
export const login = (data) => api.post('/auth/login', data);

// News
export const getNews = () => api.get('/news');
export const createNews = (data) => api.post('/news', data);
export const updateNews = (id, data) => api.put(`/news/${id}`, data);
export const deleteNews = (id) => api.delete(`/news/${id}`);

// Events
export const getEvents = () => api.get('/events/admin');
export const createEvent = (data) => api.post('/events/admin', data);
export const updateEvent = (id, data) => api.put(`/events/admin/${id}`, data);
export const deleteEvent = (id) => api.delete(`/events/admin/${id}`);

// Testimonials
export const getTestimonialsAdmin = () => api.get('/testimonials/admin');
export const updateTestimonialAdmin = (id, data) => api.put(`/testimonials/admin/${id}`, data);
export const deleteTestimonialAdmin = (id) => api.delete(`/testimonials/admin/${id}`);

// Sponsors
export const getSponsorsAdmin = () => api.get('/sponsors/admin');
export const createSponsor = (data) => api.post('/sponsors/admin', data);
export const updateSponsor = (id, data) => api.put(`/sponsors/admin/${id}`, data);
export const deleteSponsor = (id) => api.delete(`/sponsors/admin/${id}`);

// Donation Settings
export const getDonationSettingsAdmin = () => api.get('/donation-settings/admin');
export const createOrUpdateDonationSettings = (data) => api.post('/donation-settings/admin', data);
export const getDonationsAdmin = (params) => api.get('/donations/admin', { params });

// Tenders
export const getTenders = () => api.get('/tenders');
export const createTender = (data) => api.post('/tenders', data);
export const updateTender = (id, data) => api.put(`/tenders/${id}`, data);
export const deleteTender = (id) => api.delete(`/tenders/${id}`);

// Gallery
export const getGallery = () => api.get('/gallery');
export const createGalleryItem = (data) => api.post('/gallery', data);
export const updateGalleryItem = (id, data) => api.put(`/gallery/${id}`, data);
export const deleteGalleryItem = (id) => api.delete(`/gallery/${id}`);

// Reports
export const getReports = () => api.get('/reports');
export const createReport = (data) => api.post('/reports', data);
export const updateReport = (id, data) => api.put(`/reports/${id}`, data);
export const deleteReport = (id) => api.delete(`/reports/${id}`);

// Volunteers
export const getAllVolunteers = () => api.get('/volunteers');
export const getVolunteers = () => api.get('/volunteers/public');
export const getVolunteerById = (id) => api.get(`/volunteers/public/${id}`);
export const createVolunteer = (data) => api.post('/volunteers', data);
export const updateVolunteer = (id, data) => api.put(`/volunteers/${id}`, data);
export const deleteVolunteer = (id) => api.delete(`/volunteers/${id}`);

// Volunteer Applications
export const getAllVolunteerApplications = () => api.get('/volunteers/applications');
export const updateVolunteerApplicationStatus = (id, status) => api.put(`/volunteers/applications/${id}`, { status });

// About
export const getAboutUs = () => api.get('/about/about-us');
export const createOrUpdateAboutUs = (data) => api.post('/about/about-us', data);

// Governance
export const getGovernance = () => api.get('/about/governance');
export const createOrUpdateGovernance = (data) => api.post('/about/governance', data);

// Messages
export const getMessages = () => api.get('/about/messages');
export const createOrUpdateMessage = (data) => api.post('/about/messages', data);
export const deleteMessage = (id) => api.delete(`/about/messages/${id}`);

// Geographic Activities
export const getGeographicActivities = () => api.get('/geographic-activities');
export const createGeographicActivity = (data) => api.post('/admin/geographic-activity', data);
export const updateGeographicActivity = (id, data) => api.put(`/admin/geographic-activity/${id}`, data);
export const deleteGeographicActivity = (id) => api.delete(`/admin/geographic-activity/${id}`);

// Geographic Focus
export const getGeographicFocus = () => api.get('/about/geographic-focus');
export const createOrUpdateGeographicFocus = (data) => api.post('/about/geographic-focus', data);
export const deleteGeographicFocus = () => api.delete('/about/geographic-focus');

// Organization Structure
export const getOrganizationStructure = () => api.get('/about/organization-structure');
export const createOrUpdateOrganizationStructure = (data) => api.post('/about/organization-structure', data);
export const deleteOrganizationStructure = () => api.delete('/about/organization-structure');

// Admin Activities
export const getAdminActivities = () => api.get('/admin-activities');
export const createAdminActivity = (data) => api.post('/admin/admin-activities', data);
export const updateAdminActivity = (id, data) => api.put(`/admin/admin-activities/${id}`, data);
export const deleteAdminActivity = (id) => api.delete(`/admin/admin-activities/${id}`);

// Sliders
export const getSliders = () => api.get('/sliders');
export const getAllSliders = () => api.get('/sliders/admin');
export const createSlider = (data) => api.post('/sliders/admin', data);
export const updateSlider = (id, data) => api.put(`/sliders/admin/${id}`, data);
export const deleteSlider = (id) => api.delete(`/sliders/admin/${id}`);

// Journeys
export const getJourneys = () => api.get('/journeys');
export const createJourney = (data) => api.post('/journeys', data);
export const updateJourney = (id, data) => api.put(`/journeys/${id}`, data);
export const deleteJourney = (id) => api.delete(`/journeys/${id}`);

// Jobs
export const getJobs = () => api.get('/jobs');
export const getAllJobs = () => api.get('/jobs');
export const createJob = (data) => api.post('/jobs/admin', data);
export const updateJob = (id, data) => api.put(`/jobs/admin/${id}`, data);
export const deleteJob = (id) => api.delete(`/jobs/admin/${id}`);

// Users
export const getUsers = () => api.get('/users');
export const createUser = (data) => api.post('/users', data);
export const updateUser = (id, data) => api.put(`/users/${id}`, data);
export const deleteUser = (id) => api.delete(`/users/${id}`);
