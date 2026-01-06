import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth
export const login = (data) => api.post('/auth/login', data);

// Sliders
export const getSliders = () => api.get('/sliders');
export const getAllSliders = () => api.get('/sliders/admin');
export const getSliderById = (id) => api.get(`/sliders/${id}`);
export const createSlider = (data) => api.post('/sliders/admin', data);
export const updateSlider = (id, data) => api.put(`/sliders/admin/${id}`, data);
export const deleteSlider = (id) => api.delete(`/sliders/admin/${id}`);

// News
export const getNews = () => api.get('/news');
export const getNewsById = (id) => api.get(`/news/${id}`);
export const createNews = (data) => api.post('/news', data);
export const updateNews = (id, data) => api.put(`/news/${id}`, data);
export const deleteNews = (id) => api.delete(`/news/${id}`);

// Tenders
export const getTenders = () => api.get('/tenders');
export const getTenderById = (id) => api.get(`/tenders/${id}`);
export const createTender = (data) => api.post('/tenders', data);
export const updateTender = (id, data) => api.put(`/tenders/${id}`, data);
export const deleteTender = (id) => api.delete(`/tenders/${id}`);

// Gallery
export const getGallery = () => api.get('/gallery');
export const getGalleryItemById = (id) => api.get(`/gallery/${id}`);
export const createGalleryItem = (data) => api.post('/gallery', data);
export const updateGalleryItem = (id, data) => api.put(`/gallery/${id}`, data);
export const deleteGalleryItem = (id) => api.delete(`/gallery/${id}`);

// Reports
export const getReports = () => api.get('/reports');
export const getReportById = (id) => api.get(`/reports/${id}`);
export const createReport = (data) => api.post('/reports', data);
export const updateReport = (id, data) => api.put(`/reports/${id}`, data);
export const deleteReport = (id) => api.delete(`/reports/${id}`);

// Users
export const getUsers = () => api.get('/auth/users');
export const createUser = (data) => api.post('/auth/register', data);
export const updateUser = (id, data) => api.put(`/auth/users/${id}`, data);
export const deleteUser = (id) => api.delete(`/auth/users/${id}`);

// Contact
export const sendContactMessage = (data) => api.post('/contact', data);

// About
export const getAboutUs = () => api.get('/about/about-us');
export const createOrUpdateAboutUs = (data) => api.post('/about/about-us', data);
export const deleteAboutUs = () => api.delete('/about/about-us');

export const getGovernance = () => api.get('/about/governance');
export const createOrUpdateGovernance = (data) => api.post('/about/governance', data);
export const deleteGovernance = () => api.delete('/about/governance');

export const getGeographicFocus = () => api.get('/about/geographic-focus');
export const createOrUpdateGeographicFocus = (data) => api.post('/about/geographic-focus', data);
export const deleteGeographicFocus = () => api.delete('/about/geographic-focus');

export const getOrganizationStructure = () => api.get('/about/organization-structure');
export const createOrUpdateOrganizationStructure = (data) => api.post('/about/organization-structure', data);
export const deleteOrganizationStructure = () => api.delete('/about/organization-structure');

export const getMessages = () => api.get('/about/messages');
export const createOrUpdateMessage = (data) => api.post('/about/messages', data);
export const deleteMessage = (id) => api.delete(`/about/messages/${id}`);

// Activities
export const getActivities = () => api.get('/activities');
export const createActivity = (data) => api.post('/admin/activity', data);

// Admin Activities (for admin-managed activities)
export const getAdminActivities = () => api.get('/admin-activities');
export const getAdminActivityBySlug = (slug) => api.get(`/admin-activities/${slug}`);
export const createAdminActivity = (data) => api.post('/admin/admin-activities', data);
export const updateAdminActivity = (id, data) => api.put(`/admin/admin-activities/${id}`, data);
export const deleteAdminActivity = (id) => api.delete(`/admin/admin-activities/${id}`);

// Geographic Activities
export const createGeographicActivity = (data) => api.post('/admin/geographic-activity', data);
export const updateGeographicActivity = (id, data) => api.put(`/admin/geographic-activity/${id}`, data);
export const deleteGeographicActivity = (id) => api.delete(`/admin/geographic-activity/${id}`);
export const getGeographicActivities = () => api.get('/geographic-activities');

// Journeys
export const getJourneys = () => api.get('/journeys');
export const getJourneyById = (id) => api.get(`/journeys/${id}`);
export const createJourney = (data) => api.post('/journeys/admin', data);
export const updateJourney = (id, data) => api.put(`/journeys/admin/${id}`, data);
export const deleteJourney = (id) => api.delete(`/journeys/admin/${id}`);
