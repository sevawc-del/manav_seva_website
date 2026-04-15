import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { applyForTender, getTenderById } from '../../utils/api';
import { useToast } from '../../context/ToastContext';

const DEFAULT_FORM = {
  organizationName: '',
  contactPerson: '',
  email: '',
  phone: '',
  roleInterested: '',
  companyAddress: '',
  experience: '',
  bidAmount: '',
  websiteUrl: '',
  proposalSummary: ''
};

const parseDateSafe = (value) => {
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const isTenderClosed = (tender) => {
  if (!tender?.deadline) return false;
  const deadline = parseDateSafe(tender.deadline);
  if (!deadline) return false;
  const deadlineEndOfDay = new Date(deadline);
  deadlineEndOfDay.setHours(23, 59, 59, 999);
  return deadlineEndOfDay < new Date();
};

const TenderApplication = () => {
  const { tenderId } = useParams();
  const [formData, setFormData] = useState(DEFAULT_FORM);
  const [selectedTender, setSelectedTender] = useState(null);
  const [proposalDocument, setProposalDocument] = useState(null);
  const [loading, setLoading] = useState(false);
  const [tenderLoading, setTenderLoading] = useState(Boolean(tenderId));
  const [tenderError, setTenderError] = useState('');
  const toast = useToast();

  useEffect(() => {
    const fetchTender = async () => {
      if (!tenderId) {
        setTenderLoading(false);
        return;
      }

      try {
        const response = await getTenderById(tenderId);
        const tender = response?.data || null;
        setSelectedTender(tender);
        setFormData((prev) => ({
          ...prev,
          roleInterested: tender?.title || prev.roleInterested
        }));
      } catch {
        const message = 'Could not load the selected tender details. You can still continue by filling tender reference manually.';
        setTenderError(message);
        toast.warning(message);
      } finally {
        setTenderLoading(false);
      }
    };

    fetchTender();
  }, [tenderId, toast]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleProposalChange = (event) => {
    const selected = event.target.files?.[0] || null;
    setProposalDocument(selected);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);

    if (!proposalDocument) {
      setLoading(false);
      toast.error('Please upload your proposal document before submitting.');
      return;
    }

    if (selectedTender && isTenderClosed(selectedTender)) {
      setLoading(false);
      toast.error('This tender is closed for new applications.');
      return;
    }

    try {
      const payload = new FormData();
      if (tenderId) {
        payload.append('tenderId', tenderId);
      }

      Object.entries(formData).forEach(([key, value]) => {
        payload.append(key, value.trim());
      });
      payload.append('proposalDocument', proposalDocument);

      await applyForTender(payload);

      toast.success('Tender application submitted successfully. Our team will review and contact you.');
      setProposalDocument(null);
      setFormData({
        ...DEFAULT_FORM,
        roleInterested: selectedTender?.title || ''
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
        <h1 className="mb-2 text-3xl font-bold text-center">Tender Application</h1>
        <p className="mb-6 text-center text-gray-600">
          Submit your organization details and proposal for this tender.
        </p>

        {tenderLoading ? (
          <p className="mb-4 text-center text-gray-600">Loading tender details...</p>
        ) : null}
        {tenderError ? (
          <p className="mb-4 rounded-md border border-[var(--ngo-border)] bg-slate-50 px-4 py-3 text-slate-800">{tenderError}</p>
        ) : null}
        {selectedTender ? (
          <div className="mb-6 rounded-lg border border-blue-100 bg-blue-50 px-4 py-3 text-blue-900">
            Applying for: <span className="font-semibold">{selectedTender.title}</span>
          </div>
        ) : null}

        <form onSubmit={handleSubmit} className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label htmlFor="organizationName" className="mb-2 block text-sm font-semibold text-gray-700">
                Organization Name
              </label>
              <input
                id="organizationName"
                name="organizationName"
                value={formData.organizationName}
                onChange={handleChange}
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
                required
              />
            </div>
            <div>
              <label htmlFor="contactPerson" className="mb-2 block text-sm font-semibold text-gray-700">
                Contact Person
              </label>
              <input
                id="contactPerson"
                name="contactPerson"
                value={formData.contactPerson}
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
              <label htmlFor="roleInterested" className="mb-2 block text-sm font-semibold text-gray-700">
                Tender / Role Interested In
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
              <label htmlFor="bidAmount" className="mb-2 block text-sm font-semibold text-gray-700">
                Bid Amount
              </label>
              <input
                id="bidAmount"
                name="bidAmount"
                value={formData.bidAmount}
                onChange={handleChange}
                placeholder="e.g. INR 12,50,000"
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div className="md:col-span-2">
              <label htmlFor="companyAddress" className="mb-2 block text-sm font-semibold text-gray-700">
                Company Address
              </label>
              <input
                id="companyAddress"
                name="companyAddress"
                value={formData.companyAddress}
                onChange={handleChange}
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label htmlFor="experience" className="mb-2 block text-sm font-semibold text-gray-700">
                Relevant Experience
              </label>
              <input
                id="experience"
                name="experience"
                value={formData.experience}
                onChange={handleChange}
                placeholder="e.g. 6 years in civil contracts"
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label htmlFor="websiteUrl" className="mb-2 block text-sm font-semibold text-gray-700">
                Website URL
              </label>
              <input
                id="websiteUrl"
                name="websiteUrl"
                value={formData.websiteUrl}
                onChange={handleChange}
                placeholder="https://your-company.com"
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="mt-4">
            <label htmlFor="proposalDocument" className="mb-2 block text-sm font-semibold text-gray-700">
              Proposal Document
            </label>
            <input
              id="proposalDocument"
              name="proposalDocument"
              type="file"
              accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.zip,.txt,.csv"
              onChange={handleProposalChange}
              className="w-full rounded-md border border-gray-300 bg-white text-sm text-gray-700 file:mr-4 file:rounded-md file:border-0 file:bg-blue-600 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-blue-700 focus:border-blue-500 focus:outline-none"
              required
            />
            <p className="mt-1 text-xs text-gray-500">Accepted formats: PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, ZIP, TXT, CSV (max 10MB)</p>
          </div>

          <div className="mt-4">
            <label htmlFor="proposalSummary" className="mb-2 block text-sm font-semibold text-gray-700">
              Proposal Summary
            </label>
            <textarea
              id="proposalSummary"
              name="proposalSummary"
              rows="5"
              value={formData.proposalSummary}
              onChange={handleChange}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
              placeholder="Provide a short summary of your technical and commercial proposal."
            />
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
            <Link to="/get-involved/tenders" className="app-btn app-btn-outline">
              Back to Tenders
            </Link>
            <button type="submit" disabled={loading} className="app-btn app-btn-primary disabled:opacity-60">
              {loading ? 'Submitting...' : 'Submit Tender Application'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TenderApplication;

