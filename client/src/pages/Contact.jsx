import React, { useState } from 'react';
import { sendContactMessage, submitTestimonial } from '../utils/api';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [feedbackData, setFeedbackData] = useState({
    name: '',
    email: '',
    designation: '',
    location: '',
    quote: '',
    consentToPublish: false
  });
  const [feedbackLoading, setFeedbackLoading] = useState(false);
  const [feedbackError, setFeedbackError] = useState('');
  const [feedbackSuccess, setFeedbackSuccess] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      await sendContactMessage(formData);
      setSuccess('Thank you for your message! We will get back to you soon.');
      setFormData({ name: '', email: '', message: '' });
    } catch {
      setError('Failed to send message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleFeedbackChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFeedbackData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    setFeedbackLoading(true);
    setFeedbackError('');
    setFeedbackSuccess('');

    try {
      await submitTestimonial(feedbackData);
      setFeedbackSuccess('Thank you for your feedback. It has been submitted for review.');
      setFeedbackData({
        name: '',
        email: '',
        designation: '',
        location: '',
        quote: '',
        consentToPublish: false
      });
    } catch {
      setFeedbackError('Failed to submit feedback. Please try again.');
    } finally {
      setFeedbackLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-8">Contact Us</h1>

      <div className="max-w-2xl mx-auto mb-12">
        {error && <p className="text-red-500 mb-4">{error}</p>}
        {success && <p className="text-green-500 mb-4">{success}</p>}
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md">
          <div className="mb-4">
            <label htmlFor="name" className="block text-gray-700 font-bold mb-2">Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="email" className="block text-gray-700 font-bold mb-2">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="message" className="block text-gray-700 font-bold mb-2">Message</label>
            <textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleChange}
              rows="5"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {loading ? 'Sending...' : 'Send Message'}
          </button>
        </form>
      </div>

      <div className="max-w-2xl mx-auto">
        <h2 className="text-2xl font-bold text-center mb-4">Share Your Feedback</h2>
        {feedbackError && <p className="text-red-500 mb-4">{feedbackError}</p>}
        {feedbackSuccess && <p className="text-green-500 mb-4">{feedbackSuccess}</p>}

        <form onSubmit={handleFeedbackSubmit} className="bg-white p-6 rounded-lg shadow-md">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label htmlFor="feedbackName" className="block text-gray-700 font-bold mb-2">Name</label>
              <input
                type="text"
                id="feedbackName"
                name="name"
                value={feedbackData.name}
                onChange={handleFeedbackChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                required
              />
            </div>
            <div>
              <label htmlFor="feedbackEmail" className="block text-gray-700 font-bold mb-2">Email</label>
              <input
                type="email"
                id="feedbackEmail"
                name="email"
                value={feedbackData.email}
                onChange={handleFeedbackChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                required
              />
            </div>
            <div>
              <label htmlFor="feedbackDesignation" className="block text-gray-700 font-bold mb-2">Designation</label>
              <input
                type="text"
                id="feedbackDesignation"
                name="designation"
                value={feedbackData.designation}
                onChange={handleFeedbackChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label htmlFor="feedbackLocation" className="block text-gray-700 font-bold mb-2">Location</label>
              <input
                type="text"
                id="feedbackLocation"
                name="location"
                value={feedbackData.location}
                onChange={handleFeedbackChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
          </div>

          <div className="mb-4">
            <label htmlFor="feedbackQuote" className="block text-gray-700 font-bold mb-2">Feedback</label>
            <textarea
              id="feedbackQuote"
              name="quote"
              value={feedbackData.quote}
              onChange={handleFeedbackChange}
              rows="4"
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              required
            />
          </div>

          <div className="mb-4">
            <label className="flex items-start gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                name="consentToPublish"
                checked={feedbackData.consentToPublish}
                onChange={handleFeedbackChange}
                className="mt-1"
                required
              />
              I consent to publish my feedback on the website after admin review.
            </label>
          </div>

          <button
            type="submit"
            disabled={feedbackLoading}
            className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 disabled:opacity-50"
          >
            {feedbackLoading ? 'Submitting...' : 'Submit Feedback'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Contact;
