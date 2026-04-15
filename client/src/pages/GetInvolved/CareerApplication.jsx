import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { applyForJob, getJobById } from '../../utils/api';
import { useToast } from '../../context/ToastContext';

const DEFAULT_FORM = {
  fullName: '',
  email: '',
  phone: '',
  currentLocation: '',
  yearsOfExperience: '',
  currentCompany: '',
  noticePeriod: '',
  roleInterested: '',
  linkedInUrl: '',
  portfolioUrl: '',
  coverLetter: ''
};

const CareerApplication = () => {
  const { jobId } = useParams();
  const [formData, setFormData] = useState(DEFAULT_FORM);
  const [selectedJob, setSelectedJob] = useState(null);
  const [resumeFile, setResumeFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [jobLoading, setJobLoading] = useState(Boolean(jobId));
  const [jobError, setJobError] = useState('');
  const toast = useToast();

  useEffect(() => {
    const fetchJob = async () => {
      if (!jobId) {
        setJobLoading(false);
        return;
      }

      try {
        const response = await getJobById(jobId);
        const job = response?.data || null;
        setSelectedJob(job);
        setFormData((prev) => ({
          ...prev,
          roleInterested: job?.title || prev.roleInterested
        }));
      } catch {
        const message = 'Could not load the selected role details. You can still continue by filling role manually.';
        setJobError(message);
        toast.warning(message);
      } finally {
        setJobLoading(false);
      }
    };

    fetchJob();
  }, [jobId, toast]);

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

    if (!resumeFile) {
      setLoading(false);
      toast.error('Please upload your resume before submitting.');
      return;
    }

    try {
      const payload = new FormData();
      if (jobId) {
        payload.append('jobId', jobId);
      }

      Object.entries(formData).forEach(([key, value]) => {
        payload.append(key, value.trim());
      });
      payload.append('resume', resumeFile);

      await applyForJob(payload);

      toast.success('Application submitted successfully. Our team will review your profile and get in touch.');
      setResumeFile(null);
      setFormData({
        ...DEFAULT_FORM,
        roleInterested: selectedJob?.title || ''
      });
    } catch (submitError) {
      toast.error(submitError?.response?.data?.message || 'Unable to submit application right now. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mx-auto max-w-3xl">
        <h1 className="mb-2 text-3xl font-bold text-center">Career Application</h1>
        <p className="mb-6 text-center text-gray-600">
          Submit your profile for current and upcoming roles at Manav Seva.
        </p>

        {jobLoading ? (
          <p className="mb-4 text-center text-gray-600">Loading role details...</p>
        ) : null}
        {jobError ? (
          <p className="mb-4 rounded-md border border-[var(--ngo-border)] bg-slate-50 px-4 py-3 text-slate-800">{jobError}</p>
        ) : null}
        {selectedJob ? (
          <div className="mb-6 rounded-lg border border-blue-100 bg-blue-50 px-4 py-3 text-blue-900">
            Applying for: <span className="font-semibold">{selectedJob.title}</span>
          </div>
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
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
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
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
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
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
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
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
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
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
                required
              />
            </div>
            <div>
              <label htmlFor="yearsOfExperience" className="mb-2 block text-sm font-semibold text-gray-700">
                Years of Experience
              </label>
              <input
                id="yearsOfExperience"
                name="yearsOfExperience"
                value={formData.yearsOfExperience}
                onChange={handleChange}
                placeholder="e.g. 3 years"
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label htmlFor="currentCompany" className="mb-2 block text-sm font-semibold text-gray-700">
                Current Company
              </label>
              <input
                id="currentCompany"
                name="currentCompany"
                value={formData.currentCompany}
                onChange={handleChange}
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label htmlFor="noticePeriod" className="mb-2 block text-sm font-semibold text-gray-700">
                Notice Period
              </label>
              <input
                id="noticePeriod"
                name="noticePeriod"
                value={formData.noticePeriod}
                onChange={handleChange}
                placeholder="e.g. Immediate / 30 days"
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
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
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
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
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
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
              className="w-full rounded-md border border-gray-300 bg-white text-sm text-gray-700 file:mr-4 file:rounded-md file:border-0 file:bg-blue-600 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-blue-700 focus:border-blue-500 focus:outline-none"
              required
            />
            <p className="mt-1 text-xs text-gray-500">Accepted formats: PDF, DOC, DOCX (max 10MB)</p>
          </div>

          <div className="mt-4">
            <label htmlFor="coverLetter" className="mb-2 block text-sm font-semibold text-gray-700">
              Cover Letter
            </label>
            <textarea
              id="coverLetter"
              name="coverLetter"
              rows="5"
              value={formData.coverLetter}
              onChange={handleChange}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
              placeholder="Tell us why you are a good fit for this role."
            />
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
            <Link to="/get-involved/career" className="app-btn app-btn-outline">
              Back to Careers
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

export default CareerApplication;

