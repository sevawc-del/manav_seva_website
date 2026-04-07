import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { applyForVolunteer, getVolunteerById } from '../../utils/api';

const DEFAULT_FORM = {
  fullName: '',
  email: '',
  phone: '',
  currentLocation: '',
  yearsOfExperience: '',
  currentCompany: '',
  availability: '',
  roleInterested: '',
  linkedInUrl: '',
  portfolioUrl: '',
  coverLetter: ''
};

const VolunteerApplication = () => {
  const { volunteerId } = useParams();
  const [formData, setFormData] = useState(DEFAULT_FORM);
  const [selectedOpportunity, setSelectedOpportunity] = useState(null);
  const [resumeFile, setResumeFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [roleLoading, setRoleLoading] = useState(Boolean(volunteerId));
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [roleError, setRoleError] = useState('');

  useEffect(() => {
    const fetchOpportunity = async () => {
      if (!volunteerId) {
        setRoleLoading(false);
        return;
      }

      try {
        const response = await getVolunteerById(volunteerId);
        const opportunity = response?.data || null;
        setSelectedOpportunity(opportunity);
        setFormData((prev) => ({
          ...prev,
          roleInterested: opportunity?.title || prev.roleInterested
        }));
      } catch {
        setRoleError('Could not load the selected volunteer role details. You can still continue by filling role manually.');
      } finally {
        setRoleLoading(false);
      }
    };

    fetchOpportunity();
  }, [volunteerId]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleResumeChange = (event) => {
    const selected = event.target.files?.[0] || null;
    setResumeFile(selected);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    if (!resumeFile) {
      setLoading(false);
      setError('Please upload your resume before submitting.');
      return;
    }

    try {
      const payload = new FormData();
      if (volunteerId) {
        payload.append('volunteerId', volunteerId);
      }

      Object.entries(formData).forEach(([key, value]) => {
        payload.append(key, value.trim());
      });
      payload.append('resume', resumeFile);

      await applyForVolunteer(payload);

      setSuccess('Application submitted successfully. Our team will review your profile and get in touch.');
      setResumeFile(null);
      setFormData({
        ...DEFAULT_FORM,
        roleInterested: selectedOpportunity?.title || ''
      });
    } catch (submitError) {
      setError(submitError?.response?.data?.message || 'Unable to submit application right now. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mx-auto max-w-3xl">
        <h1 className="mb-2 text-3xl font-bold text-center">Volunteer Application</h1>
        <p className="mb-6 text-center text-gray-600">
          Apply to volunteer with Manav Seva and support meaningful impact initiatives.
        </p>

        {roleLoading ? (
          <p className="mb-4 text-center text-gray-600">Loading role details...</p>
        ) : null}
        {roleError ? (
          <p className="mb-4 rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-amber-800">{roleError}</p>
        ) : null}
        {selectedOpportunity ? (
          <div className="mb-6 rounded-lg border border-emerald-100 bg-emerald-50 px-4 py-3 text-emerald-900">
            Applying for: <span className="font-semibold">{selectedOpportunity.title}</span>
          </div>
        ) : null}

        {error ? <p className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-red-700">{error}</p> : null}
        {success ? (
          <p className="mb-4 rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-emerald-700">{success}</p>
        ) : null}

        <form onSubmit={handleSubmit} className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label htmlFor="fullName" className="mb-2 block text-sm font-semibold text-gray-700">
                Full Name
              </label>
              <input
                id="fullName"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-emerald-500 focus:outline-none"
                required
              />
            </div>
            <div>
              <label htmlFor="email" className="mb-2 block text-sm font-semibold text-gray-700">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-emerald-500 focus:outline-none"
                required
              />
            </div>
            <div>
              <label htmlFor="phone" className="mb-2 block text-sm font-semibold text-gray-700">
                Phone Number
              </label>
              <input
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-emerald-500 focus:outline-none"
                required
              />
            </div>
            <div>
              <label htmlFor="currentLocation" className="mb-2 block text-sm font-semibold text-gray-700">
                Current Location
              </label>
              <input
                id="currentLocation"
                name="currentLocation"
                value={formData.currentLocation}
                onChange={handleChange}
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-emerald-500 focus:outline-none"
              />
            </div>
            <div>
              <label htmlFor="roleInterested" className="mb-2 block text-sm font-semibold text-gray-700">
                Role Interested In
              </label>
              <input
                id="roleInterested"
                name="roleInterested"
                value={formData.roleInterested}
                onChange={handleChange}
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-emerald-500 focus:outline-none"
                required
              />
            </div>
            <div>
              <label htmlFor="yearsOfExperience" className="mb-2 block text-sm font-semibold text-gray-700">
                Relevant Experience
              </label>
              <input
                id="yearsOfExperience"
                name="yearsOfExperience"
                value={formData.yearsOfExperience}
                onChange={handleChange}
                placeholder="e.g. 2 years in community outreach"
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-emerald-500 focus:outline-none"
              />
            </div>
            <div>
              <label htmlFor="currentCompany" className="mb-2 block text-sm font-semibold text-gray-700">
                Current Organization / College
              </label>
              <input
                id="currentCompany"
                name="currentCompany"
                value={formData.currentCompany}
                onChange={handleChange}
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-emerald-500 focus:outline-none"
              />
            </div>
            <div>
              <label htmlFor="availability" className="mb-2 block text-sm font-semibold text-gray-700">
                Availability
              </label>
              <input
                id="availability"
                name="availability"
                value={formData.availability}
                onChange={handleChange}
                placeholder="e.g. Weekends / 10 hours per week"
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-emerald-500 focus:outline-none"
              />
            </div>
            <div>
              <label htmlFor="linkedInUrl" className="mb-2 block text-sm font-semibold text-gray-700">
                LinkedIn URL
              </label>
              <input
                id="linkedInUrl"
                name="linkedInUrl"
                value={formData.linkedInUrl}
                onChange={handleChange}
                placeholder="https://linkedin.com/in/your-profile"
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-emerald-500 focus:outline-none"
              />
            </div>
            <div>
              <label htmlFor="portfolioUrl" className="mb-2 block text-sm font-semibold text-gray-700">
                Portfolio URL
              </label>
              <input
                id="portfolioUrl"
                name="portfolioUrl"
                value={formData.portfolioUrl}
                onChange={handleChange}
                placeholder="https://your-portfolio.com"
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="mt-4">
            <label htmlFor="resume" className="mb-2 block text-sm font-semibold text-gray-700">
              Resume
            </label>
            <input
              id="resume"
              name="resume"
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={handleResumeChange}
              className="w-full rounded-md border border-gray-300 bg-white text-sm text-gray-700 file:mr-4 file:rounded-md file:border-0 file:bg-emerald-600 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-emerald-700 focus:border-emerald-500 focus:outline-none"
              required
            />
            <p className="mt-1 text-xs text-gray-500">Accepted formats: PDF, DOC, DOCX (max 10MB)</p>
          </div>

          <div className="mt-4">
            <label htmlFor="coverLetter" className="mb-2 block text-sm font-semibold text-gray-700">
              Why do you want to volunteer with us?
            </label>
            <textarea
              id="coverLetter"
              name="coverLetter"
              rows="5"
              value={formData.coverLetter}
              onChange={handleChange}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-emerald-500 focus:outline-none"
              placeholder="Share your motivation and how you can contribute."
            />
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
            <Link to="/get-involved/volunteer" className="app-btn app-btn-outline">
              Back to Volunteer Roles
            </Link>
            <button type="submit" disabled={loading} className="app-btn app-btn-primary disabled:opacity-60">
              {loading ? 'Submitting...' : 'Submit Application'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VolunteerApplication;
