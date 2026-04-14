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

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await sendContactMessage(formData);
      setSuccess('We will get back to you soon.');
      setFormData({ name: '', email: '', message: '' });
    } catch {
      setError('Failed to send message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleFeedbackChange = (event) => {
    const { name, value, type, checked } = event.target;
    setFeedbackData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleFeedbackSubmit = async (event) => {
    event.preventDefault();
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
      <div className="mb-8 rounded-3xl bg-gradient-to-r from-[var(--ngo-primary)] to-[var(--ngo-primary-strong)] px-6 py-7 text-white shadow-lg">
        <h1 className="text-3xl text-center font-bold md:text-left md:text-4xl">Contact Us</h1>
        <p className="mt-2 text-sm text-center text-sky-100 md:text-left md:text-base">
          Reach out for support, collaboration, or any questions about our programs.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <section className="overflow-hidden rounded-2xl border border-blue-200 bg-white shadow-md">
          <div className="bg-gradient-to-r from-[var(--ngo-primary)] to-[var(--ngo-primary-strong)] px-5 py-4">
            <h2 className="text-xl font-semibold text-white">Send a Message</h2>
            <p className="mt-1 text-sm text-white/90">Tell us how we can help.</p>
          </div>

          <div className="space-y-4 p-4 md:p-5">
            {error ? (
              <div className="rounded-lg border border-[var(--ngo-border)] bg-slate-50 px-3 py-2 text-sm text-slate-700">
                {error}
              </div>
            ) : null}
            {success ? (
              <div className="rounded-lg border border-[var(--ngo-border)] bg-slate-50 px-3 py-2 text-sm text-slate-700">
                {success}
              </div>
            ) : null}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="name" className="mb-1.5 block text-sm font-semibold text-slate-700">
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-800 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                  required
                />
              </div>

              <div>
                <label htmlFor="email" className="mb-1.5 block text-sm font-semibold text-slate-700">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-800 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                  required
                />
              </div>

              <div>
                <label htmlFor="message" className="mb-1.5 block text-sm font-semibold text-slate-700">
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows={6}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-800 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="inline-flex w-full items-center justify-center rounded-md bg-[var(--ngo-primary)] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[var(--ngo-primary-strong)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ngo-primary)] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {loading ? 'Sending...' : 'Send Message'}
              </button>
            </form>
          </div>
        </section>

        <section className="overflow-hidden rounded-2xl border border-[var(--ngo-border)] bg-white shadow-md">
          <div className="bg-gradient-to-r from-[var(--ngo-primary)] to-[var(--ngo-primary-strong)] px-5 py-4">
            <h2 className="text-xl font-semibold text-white">Share Your Feedback</h2>
            <p className="mt-1 text-sm text-white/90">Your feedback helps us improve and inspire others.</p>
          </div>

          <div className="space-y-4 p-4 md:p-5">
            {feedbackError ? (
              <div className="rounded-lg border border-[var(--ngo-border)] bg-slate-50 px-3 py-2 text-sm text-slate-700">
                {feedbackError}
              </div>
            ) : null}
            {feedbackSuccess ? (
              <div className="rounded-lg border border-[var(--ngo-border)] bg-slate-50 px-3 py-2 text-sm text-slate-700">
                {feedbackSuccess}
              </div>
            ) : null}

            <form onSubmit={handleFeedbackSubmit} className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="feedbackName" className="mb-1.5 block text-sm font-semibold text-slate-700">
                    Name
                  </label>
                  <input
                    type="text"
                    id="feedbackName"
                    name="name"
                    value={feedbackData.name}
                    onChange={handleFeedbackChange}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-800 focus:border-[var(--ngo-primary)] focus:outline-none focus:ring-2 focus:ring-blue-100"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="feedbackEmail" className="mb-1.5 block text-sm font-semibold text-slate-700">
                    Email
                  </label>
                  <input
                    type="email"
                    id="feedbackEmail"
                    name="email"
                    value={feedbackData.email}
                    onChange={handleFeedbackChange}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-800 focus:border-[var(--ngo-primary)] focus:outline-none focus:ring-2 focus:ring-blue-100"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="feedbackDesignation" className="mb-1.5 block text-sm font-semibold text-slate-700">
                    Designation
                  </label>
                  <input
                    type="text"
                    id="feedbackDesignation"
                    name="designation"
                    value={feedbackData.designation}
                    onChange={handleFeedbackChange}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-800 focus:border-[var(--ngo-primary)] focus:outline-none focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                <div>
                  <label htmlFor="feedbackLocation" className="mb-1.5 block text-sm font-semibold text-slate-700">
                    Location
                  </label>
                  <input
                    type="text"
                    id="feedbackLocation"
                    name="location"
                    value={feedbackData.location}
                    onChange={handleFeedbackChange}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-800 focus:border-[var(--ngo-primary)] focus:outline-none focus:ring-2 focus:ring-blue-100"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="feedbackQuote" className="mb-1.5 block text-sm font-semibold text-slate-700">
                  Feedback
                </label>
                <textarea
                  id="feedbackQuote"
                  name="quote"
                  value={feedbackData.quote}
                  onChange={handleFeedbackChange}
                  rows={6}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-800 focus:border-[var(--ngo-primary)] focus:outline-none focus:ring-2 focus:ring-blue-100"
                  required
                />
              </div>

              

              <button
                type="submit"
                disabled={feedbackLoading}
                className="inline-flex w-full items-center justify-center rounded-md bg-[var(--ngo-primary)] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[var(--ngo-primary-strong)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ngo-primary)] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {feedbackLoading ? 'Submitting...' : 'Submit Feedback'}
              </button>

              <label className="flex items-start gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
                <input
                  type="checkbox"
                  name="consentToPublish"
                  checked={feedbackData.consentToPublish}
                  onChange={handleFeedbackChange}
                  className="mt-1"
                />
                I consent to publish my feedback on the website (optional).
              </label>

            </form>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Contact;


