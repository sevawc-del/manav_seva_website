import React, { useEffect, useMemo, useState } from 'react';
import { FiEye, FiLock } from 'react-icons/fi';
import { getReportDownloadLink, getReports, requestReportAccess } from '../utils/api';
import Loader from '../components/Loader';

const normalizeCategory = (value) => {
  const category = String(value || '').trim();
  return category || 'General';
};

const ACCESS_TOKEN_STORAGE_KEY = 'report_access_tokens_v1';

const loadAccessTokens = () => {
  if (typeof window === 'undefined') return {};
  try {
    const raw = window.localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return {};
    return parsed;
  } catch {
    return {};
  }
};

const getPublicReportFileUrl = (report) =>
  String(report?.fileUrl || report?.file || '').trim();

const CATEGORY_THEMES = [
  {
    containerBorder: 'border-[var(--ngo-border)]',
    headerGradient: 'from-[var(--ngo-primary)] to-[var(--ngo-primary-strong)]',
    countBadge: 'bg-white/25 text-white',
    itemBorder: 'border-[var(--ngo-border)]',
    itemHover: 'hover:border-slate-300 hover:bg-slate-50',
    actionButton: 'bg-[var(--ngo-primary)] hover:bg-[var(--ngo-primary-strong)] focus-visible:ring-[var(--ngo-primary)]',
    yearBadge: 'bg-slate-100 text-slate-700'
  },
  {
    containerBorder: 'border-[var(--ngo-border)]',
    headerGradient: 'from-[var(--ngo-primary)] to-[var(--ngo-primary-strong)]',
    countBadge: 'bg-white/20 text-white',
    itemBorder: 'border-[var(--ngo-border)]',
    itemHover: 'hover:border-[var(--ngo-border)] hover:bg-slate-50',
    actionButton: 'bg-[var(--ngo-primary)] hover:bg-[var(--ngo-primary-strong)] focus-visible:ring-[var(--ngo-primary)]',
    yearBadge: 'bg-slate-100 text-slate-700'
  },
  {
    containerBorder: 'border-[var(--ngo-border)]',
    headerGradient: 'from-[var(--ngo-primary)] to-[var(--ngo-primary-strong)]',
    countBadge: 'bg-white/30 text-white',
    itemBorder: 'border-[var(--ngo-border)]',
    itemHover: 'hover:border-[var(--ngo-border)] hover:bg-slate-50',
    actionButton: 'bg-[var(--ngo-primary)] hover:bg-[var(--ngo-primary-strong)] focus-visible:ring-[var(--ngo-primary)]',
    yearBadge: 'bg-slate-100 text-slate-700'
  },
  {
    containerBorder: 'border-[var(--ngo-border)]',
    headerGradient: 'from-[var(--ngo-primary)] to-[var(--ngo-primary-strong)]',
    countBadge: 'bg-white/25 text-white',
    itemBorder: 'border-[var(--ngo-border)]',
    itemHover: 'hover:border-slate-300 hover:bg-slate-50',
    actionButton: 'bg-[var(--ngo-primary)] hover:bg-[var(--ngo-primary-strong)] focus-visible:ring-[var(--ngo-primary)]',
    yearBadge: 'bg-slate-100 text-slate-700'
  },
  {
    containerBorder: 'border-[var(--ngo-border)]',
    headerGradient: 'from-[var(--ngo-primary)] to-[var(--ngo-primary-strong)]',
    countBadge: 'bg-white/25 text-white',
    itemBorder: 'border-[var(--ngo-border)]',
    itemHover: 'hover:border-slate-300 hover:bg-slate-50',
    actionButton: 'bg-[var(--ngo-primary)] hover:bg-[var(--ngo-primary-strong)] focus-visible:ring-[var(--ngo-primary)]',
    yearBadge: 'bg-slate-100 text-slate-700'
  }
];

const getCategoryTheme = (index) => CATEGORY_THEMES[index % CATEGORY_THEMES.length];

const truncateSummary = (value, maxLength = 140) => {
  const source = String(value || '').trim();
  if (!source) return 'Report summary not available.';
  return source.length > maxLength ? `${source.slice(0, maxLength)}...` : source;
};

const getMessageTone = (message) => {
  const normalized = String(message || '').toLowerCase();
  if (!normalized) return 'info';

  if (
    normalized.includes('missing') ||
    normalized.includes('not approved') ||
    normalized.includes('not available') ||
    normalized.includes('unable') ||
    normalized.includes('failed') ||
    normalized.includes('error')
  ) {
    return 'error';
  }

  if (
    normalized.includes('submitted') ||
    normalized.includes('approved') ||
    normalized.includes('granted') ||
    normalized.includes('success')
  ) {
    return 'success';
  }

  return 'info';
};

const getMessageToneClasses = (tone) => {
  if (tone === 'success') {
    return 'border-[var(--ngo-border)] bg-slate-50 text-slate-800';
  }
  if (tone === 'error') {
    return 'border-[var(--ngo-border)] bg-slate-50 text-slate-800';
  }
  return 'border-[var(--ngo-border)] bg-slate-50 text-slate-800';
};

const getFriendlyProtectedAccessMessage = (rawMessage, hasAccessKey) => {
  const normalized = String(rawMessage || '').toLowerCase();

  if (!normalized) {
    return hasAccessKey
      ? 'Your request is under review. Download will be enabled after approval.'
      : 'Please submit an access request to download this report.';
  }

  if (normalized.includes('pending')) {
    return 'Your request is under review. Download will be enabled after approval.';
  }
  if (normalized.includes('rejected')) {
    return 'Your previous request was not approved. Please submit a new request.';
  }
  if (normalized.includes('expired')) {
    return 'Your access has expired. Please submit a new request.';
  }
  if (normalized.includes('invalid access token')) {
    return 'Your previous access link is no longer valid. Please submit a new request.';
  }
  if (normalized.includes('required')) {
    return 'Please submit an access request to download this report.';
  }
  if (normalized.includes('approved')) {
    return 'Access approved. You can download this report now.';
  }

  return rawMessage;
};

const shouldClearAccessKey = (rawMessage) => {
  const normalized = String(rawMessage || '').toLowerCase();
  return (
    normalized.includes('invalid access token') ||
    normalized.includes('expired') ||
    normalized.includes('rejected')
  );
};

const Reports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [viewerReport, setViewerReport] = useState(null);
  const [viewerUrl, setViewerUrl] = useState('');
  const [viewerLoading, setViewerLoading] = useState(false);
  const [viewerError, setViewerError] = useState('');
  const [previewImageError, setPreviewImageError] = useState(false);
  const [isRequestFormOpen, setIsRequestFormOpen] = useState(false);

  const [submittingRequestId, setSubmittingRequestId] = useState('');
  const [actionMessageByReport, setActionMessageByReport] = useState({});
  const [requestForm, setRequestForm] = useState({
    requesterName: '',
    requesterEmail: '',
    requesterPhone: '',
    organization: '',
    purpose: ''
  });
  const [accessTokensByReport, setAccessTokensByReport] = useState(loadAccessTokens);
  const [accessApprovedByReport, setAccessApprovedByReport] = useState({});

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const response = await getReports();
        setReports(response.data || []);
      } catch (err) {
        setError('Failed to load reports');
        console.error('Error fetching reports:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

  const updateReportMessage = (reportId, message) => {
    if (!reportId) return;
    setActionMessageByReport((prev) => ({
      ...prev,
      [reportId]: message
    }));
  };

  const saveAccessToken = (reportId, token) => {
    if (!reportId || !token || typeof window === 'undefined') return;
    setAccessTokensByReport((prev) => {
      const next = { ...prev, [reportId]: token };
      window.localStorage.setItem(ACCESS_TOKEN_STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  };

  const setAccessApproved = (reportId, isApproved) => {
    if (!reportId) return;
    setAccessApprovedByReport((prev) => ({
      ...prev,
      [reportId]: Boolean(isApproved)
    }));
  };

  const clearAccessToken = (reportId) => {
    if (!reportId || typeof window === 'undefined') return;
    setAccessApproved(reportId, false);
    setAccessTokensByReport((prev) => {
      if (!prev[reportId]) return prev;
      const next = { ...prev };
      delete next[reportId];
      window.localStorage.setItem(ACCESS_TOKEN_STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  };

  const handleDownload = async (report) => {
    const reportId = report?._id;
    if (!reportId) return;

    const visibility = report?.visibility === 'protected' ? 'protected' : 'public';
    const accessToken = visibility === 'protected' ? accessTokensByReport[reportId] : undefined;
    const isAccessApproved = visibility !== 'protected' || Boolean(accessApprovedByReport[reportId]);

    if (visibility === 'protected' && !isAccessApproved) {
      const message = accessToken
        ? 'Your request is under review. Download will be enabled after approval.'
        : 'Please submit an access request to download this report.';
      updateReportMessage(reportId, message);
      if (viewerReport?._id === reportId) {
        setViewerError(message);
        setIsRequestFormOpen(true);
      }
      return;
    }

    try {
      const response = await getReportDownloadLink(reportId, accessToken, 'download');
      const downloadUrl = response?.data?.downloadUrl || '';
      if (!downloadUrl) {
        throw new Error('Download URL missing');
      }
      window.open(downloadUrl, '_blank', 'noopener,noreferrer');
      if (visibility === 'protected') {
        setAccessApproved(reportId, true);
      }
      updateReportMessage(reportId, '');
      setViewerError('');
    } catch (downloadError) {
      if (visibility === 'public') {
        const fallbackUrl = getPublicReportFileUrl(report);
        if (fallbackUrl) {
          window.open(fallbackUrl, '_blank', 'noopener,noreferrer');
          updateReportMessage(reportId, '');
          setViewerError('');
          return;
        }
      }

      const serverMessage = String(downloadError?.response?.data?.message || '').trim();
      const message =
        visibility === 'protected'
          ? getFriendlyProtectedAccessMessage(serverMessage, Boolean(accessToken))
          : (serverMessage || 'Download link not available');

      if (visibility === 'protected' && shouldClearAccessKey(serverMessage)) {
        clearAccessToken(reportId);
        if (viewerReport?._id === reportId) {
          setIsRequestFormOpen(true);
        }
      } else if (visibility === 'protected') {
        setAccessApproved(reportId, false);
      }

      if (
        visibility === 'protected' &&
        viewerReport?._id === reportId &&
        (!accessToken || serverMessage.toLowerCase().includes('required'))
      ) {
        setIsRequestFormOpen(true);
      }

      updateReportMessage(reportId, message);
      if (viewerReport?._id === reportId) {
        setViewerError(message);
      }
    }
  };

  const handleOpenViewer = async (report) => {
    if (!report?._id) return;

    setViewerReport(report);
    setViewerUrl('');
    setViewerError('');
    setPreviewImageError(false);
    setIsRequestFormOpen(false);

    const visibility = report.visibility === 'protected' ? 'protected' : 'public';
    if (visibility === 'protected') {
      const existingAccessToken = accessTokensByReport[report._id];
      if (!existingAccessToken) {
        setAccessApproved(report._id, false);
        return;
      }

      try {
        await getReportDownloadLink(report._id, existingAccessToken, 'view');
        setAccessApproved(report._id, true);
        const message = 'Access approved. You can download this report now.';
        updateReportMessage(report._id, message);
        setViewerError('');
      } catch (statusError) {
        const rawMessage = String(statusError?.response?.data?.message || '').trim();
        const friendlyMessage = getFriendlyProtectedAccessMessage(rawMessage, true);
        setAccessApproved(report._id, false);

        if (shouldClearAccessKey(rawMessage)) {
          clearAccessToken(report._id);
        }

        updateReportMessage(report._id, friendlyMessage);
        setViewerError(friendlyMessage);
      }
      return;
    }

    try {
      setViewerLoading(true);
      const response = await getReportDownloadLink(report._id, undefined, 'view');
      const url = response?.data?.downloadUrl || '';
      if (!url) {
        throw new Error('View link not available');
      }
      setViewerUrl(url);
    } catch (viewError) {
      const fallbackUrl = getPublicReportFileUrl(report);
      if (fallbackUrl) {
        setViewerUrl(fallbackUrl);
      } else {
        const message = viewError?.response?.data?.message || 'Unable to open report preview.';
        setViewerError(message);
        updateReportMessage(report._id, message);
      }
    } finally {
      setViewerLoading(false);
    }
  };

  const handleCloseViewer = () => {
    setViewerReport(null);
    setViewerUrl('');
    setViewerError('');
    setPreviewImageError(false);
    setIsRequestFormOpen(false);
  };

  const handleSubmitRequest = async (report) => {
    const reportId = report?._id;
    if (!reportId) return;

    const payload = {
      requesterName: String(requestForm.requesterName || '').trim(),
      requesterEmail: String(requestForm.requesterEmail || '').trim(),
      requesterPhone: String(requestForm.requesterPhone || '').trim(),
      organization: String(requestForm.organization || '').trim(),
      purpose: String(requestForm.purpose || '').trim()
    };

    if (!payload.requesterName || !payload.requesterEmail || !payload.purpose) {
      const message = 'Please fill name, email, and purpose before submitting.';
      updateReportMessage(reportId, message);
      setViewerError(message);
      return;
    }

    try {
      setSubmittingRequestId(reportId);
      const response = await requestReportAccess(reportId, payload);
      const accessToken = response?.data?.accessToken || '';
      if (accessToken) {
        saveAccessToken(reportId, accessToken);
      }

      const requestStatus = String(response?.data?.status || '').trim().toLowerCase();
      setAccessApproved(reportId, requestStatus === 'approved');
      const successMessage =
        requestStatus === 'approved'
          ? 'Access approved. You can download this report now.'
          : response?.status === 200
            ? 'Your request is already under review. Download will be enabled after approval.'
            : 'Your request has been submitted. You can download this report after approval.';

      updateReportMessage(reportId, successMessage);
      setViewerError('');
      setRequestForm({
        requesterName: '',
        requesterEmail: '',
        requesterPhone: '',
        organization: '',
        purpose: ''
      });
    } catch (requestError) {
      const message =
        requestError?.response?.data?.message || 'Failed to submit access request.';
      updateReportMessage(reportId, message);
      setViewerError(message);
    } finally {
      setSubmittingRequestId('');
    }
  };

  const groupedReports = useMemo(() => {
    const sorted = [...reports].sort((a, b) => {
      const yearA = Number(a?.year) || 0;
      const yearB = Number(b?.year) || 0;
      if (yearA !== yearB) return yearB - yearA;
      return String(a?.title || '').localeCompare(String(b?.title || ''));
    });

    const grouped = sorted.reduce((acc, report) => {
      const category = normalizeCategory(report?.category);
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(report);
      return acc;
    }, {});

    return Object.entries(grouped)
      .sort(([a], [b]) => {
        if (a === 'General') return 1;
        if (b === 'General') return -1;
        return a.localeCompare(b);
      })
      .map(([category, items]) => ({ category, items }));
  }, [reports]);

  const viewerVisibility = viewerReport?.visibility === 'protected' ? 'protected' : 'public';
  const activeReportMessage = viewerReport?._id ? actionMessageByReport[viewerReport._id] : '';
  const isActiveReportAccessApproved = viewerReport?._id ? Boolean(accessApprovedByReport[viewerReport._id]) : false;
  const viewerFeedbackMessage = viewerError || activeReportMessage;
  const viewerFeedbackTone = getMessageTone(viewerFeedbackMessage);

  if (loading) return <Loader />;
  if (error) return <div className="container mx-auto px-4 py-8 text-center text-red-600">{error}</div>;

  return (
    <>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 rounded-3xl bg-gradient-to-r from-[var(--ngo-primary)] to-[var(--ngo-primary-strong)] px-6 py-7 text-white shadow-lg">
          <h1 className="text-3xl font-bold text-center md:text-left">Reports & Documents</h1>
          <p className="mt-2 text-sm text-sky-100 text-center md:text-left">
            Browse categorized reports, view details instantly, and request access where needed.
          </p>
        </div>
        {reports.length === 0 ? (
          <div className="text-center text-gray-500">No reports available</div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {groupedReports.map((group, groupIndex) => {
              const theme = getCategoryTheme(groupIndex);

              return (
                <section
                  key={group.category}
                  className={`rounded-2xl overflow-hidden border bg-white shadow-md ${theme.containerBorder}`}
                >
                  <div className={`bg-gradient-to-r ${theme.headerGradient} px-5 py-4`}>
                    <div className="flex items-center justify-between gap-3">
                      <h2 className="text-xl font-semibold text-white">{group.category}</h2>
                      <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${theme.countBadge}`}>
                        {group.items.length} {group.items.length === 1 ? 'Report' : 'Reports'}
                      </span>
                    </div>
                  </div>

                  <div className="p-4 space-y-3">
                    {group.items.map((report) => {
                      const summary = report.content || report.description || 'Report summary not available.';
                      const visibility = report.visibility === 'protected' ? 'protected' : 'public';
                      const hasFile = Boolean(report.hasFile || report.file || report.fileUrl);
                      const cardMessage = actionMessageByReport[report._id];
                      const hasToken = Boolean(accessTokensByReport[report._id]);

                      return (
                        <div
                          key={report._id}
                          className={`rounded-xl border bg-white p-4 transition-all ${theme.itemBorder} ${theme.itemHover}`}
                        >
                          <div className="flex flex-wrap items-start justify-between gap-3">
                            <div className="min-w-0 flex-1">
                              <div className="flex flex-wrap items-center gap-2 mb-1.5">
                                <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ${theme.yearBadge}`}>
                                  {report.year || 'Year not specified'}
                                </span>
                                <span
                                  className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                                    visibility === 'protected'
                                      ? 'bg-slate-100 text-slate-800'
                                      : 'bg-slate-100 text-slate-800'
                                  }`}
                                >
                                  {visibility === 'protected' ? 'Protected' : 'Public'}
                                </span>
                              </div>
                              <h3 className="text-base sm:text-lg font-semibold text-gray-900">{report.title}</h3>
                              <p className="mt-1 text-sm text-gray-600">{truncateSummary(summary)}</p>
                              {visibility === 'protected' && hasToken ? (
                                <p className="mt-2 text-xs font-medium text-slate-700">Access request saved</p>
                              ) : null}
                            </div>

                            <button
                              type="button"
                              onClick={() => handleOpenViewer(report)}
                              disabled={!hasFile}
                              className={`inline-flex items-center gap-2 rounded-md px-3.5 py-2 text-sm font-semibold text-white transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${
                                hasFile
                                  ? theme.actionButton
                                  : 'bg-gray-300 text-gray-600 cursor-not-allowed'
                              }`}
                            >
                              <FiEye className="text-sm" />
                              View
                            </button>
                          </div>

                          {cardMessage ? (
                            <div
                              className={`mt-3 rounded-md border px-3 py-2 text-sm ${getMessageToneClasses(getMessageTone(cardMessage))}`}
                              role="status"
                              aria-live="polite"
                            >
                              {cardMessage}
                            </div>
                          ) : null}
                        </div>
                      );
                    })}
                  </div>
                </section>
              );
            })}
          </div>
        )}
      </div>

      {viewerReport ? (
        <div className="fixed inset-0 z-50 bg-black/60 p-4 flex items-center justify-center">
          <div className="w-full max-w-6xl bg-white rounded-xl shadow-xl overflow-hidden">
            <div className="px-4 md:px-6 py-4 border-b border-gray-200 flex items-start justify-between gap-4">
              <div>
                <h3 className="text-lg md:text-xl font-semibold text-gray-900">{viewerReport.title}</h3>
                <p className="text-sm text-gray-600 mt-0.5">
                  {viewerReport.year || 'Year not specified'} | {viewerVisibility === 'protected' ? 'Protected' : 'Public'}
                </p>
              </div>
              <button
                type="button"
                onClick={handleCloseViewer}
                className="px-3 py-1.5 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Close
              </button>
            </div>

            <div className="p-4 md:p-6 max-h-[76vh] overflow-y-auto">
              {viewerFeedbackMessage ? (
                <div
                  className={`mb-4 rounded-lg border px-4 py-3 text-sm font-medium ${getMessageToneClasses(viewerFeedbackTone)}`}
                  role="status"
                  aria-live="polite"
                >
                  {viewerFeedbackMessage}
                </div>
              ) : null}

              {viewerVisibility === 'public' ? (
                <div className="space-y-4">
                  {viewerLoading ? (
                    <div className="h-[60vh] bg-gray-100 rounded-lg flex items-center justify-center text-gray-600">
                      Loading report preview...
                    </div>
                  ) : viewerUrl ? (
                    <iframe
                      src={`${viewerUrl}#toolbar=1&navpanes=0`}
                      title={`${viewerReport.title} preview`}
                      className="w-full h-[60vh] border border-gray-200 rounded-lg"
                    />
                  ) : (
                    <div className="h-[60vh] bg-gray-100 rounded-lg flex items-center justify-center text-gray-600 text-center px-6">
                      {viewerError || 'Preview not available for this report.'}
                    </div>
                  )}

                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => handleDownload(viewerReport)}
                      className="px-4 py-2 rounded-md bg-[var(--ngo-primary)] text-white hover:bg-[var(--ngo-primary-strong)]"
                    >
                      Download Report
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-5">
                  <div className="rounded-lg border border-[var(--ngo-border)] bg-slate-50 p-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <p className="text-sm text-slate-800 flex items-start gap-2">
                        <FiLock className="mt-0.5" />
                        This report is protected. Download is enabled after your request is approved.
                      </p>
                      <button
                        type="button"
                        onClick={() => setIsRequestFormOpen((prev) => !prev)}
                        aria-expanded={isRequestFormOpen}
                        className="px-3 py-1.5 rounded-md bg-[var(--ngo-primary)] text-sm font-medium text-white hover:bg-[var(--ngo-primary-strong)]"
                      >
                        {isRequestFormOpen ? 'Hide Form' : 'Request Access'}
                      </button>
                    </div>
                  </div>

                  {isRequestFormOpen ? (
                    <div className="rounded-lg border border-gray-200 bg-white p-4 space-y-2">
                        <input
                          type="text"
                          placeholder="Full name"
                          value={requestForm.requesterName}
                          onChange={(e) => setRequestForm((prev) => ({ ...prev, requesterName: e.target.value }))}
                          className="w-full p-2 border rounded"
                          required
                        />
                        <input
                          type="email"
                          placeholder="Email address"
                          value={requestForm.requesterEmail}
                          onChange={(e) => setRequestForm((prev) => ({ ...prev, requesterEmail: e.target.value }))}
                          className="w-full p-2 border rounded"
                          required
                        />
                        <input
                          type="text"
                          placeholder="Phone (optional)"
                          value={requestForm.requesterPhone}
                          onChange={(e) => setRequestForm((prev) => ({ ...prev, requesterPhone: e.target.value }))}
                          className="w-full p-2 border rounded"
                        />
                        <input
                          type="text"
                          placeholder="Organization (optional)"
                          value={requestForm.organization}
                          onChange={(e) => setRequestForm((prev) => ({ ...prev, organization: e.target.value }))}
                          className="w-full p-2 border rounded"
                        />
                        <textarea
                          placeholder="Purpose of access"
                          value={requestForm.purpose}
                          onChange={(e) => setRequestForm((prev) => ({ ...prev, purpose: e.target.value }))}
                          className="w-full p-2 border rounded"
                          rows={3}
                          required
                        />
                        <button
                          type="button"
                          disabled={submittingRequestId === viewerReport._id}
                          onClick={() => handleSubmitRequest(viewerReport)}
                          className="px-4 py-2 rounded-md bg-[var(--ngo-primary)] text-white hover:bg-[var(--ngo-primary-strong)] disabled:bg-gray-400"
                        >
                          {submittingRequestId === viewerReport._id ? 'Submitting...' : 'Submit Request'}
                        </button>
                    </div>
                  ) : null}

                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => handleDownload(viewerReport)}
                      disabled={!isActiveReportAccessApproved}
                      className={`px-4 py-2 rounded-md ${
                        isActiveReportAccessApproved
                          ? 'bg-[var(--ngo-primary)] text-white hover:bg-[var(--ngo-primary-strong)]'
                          : 'bg-gray-300 text-gray-600 cursor-not-allowed'
                      }`}
                    >
                      Download Report
                    </button>
                  </div>

                  <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
                    {viewerReport.previewUrl && !previewImageError ? (
                      <div className="relative rounded-md overflow-hidden border border-gray-200 bg-white">
                        <img
                          src={viewerReport.previewUrl}
                          alt={`${viewerReport.title} first page preview`}
                          className="w-full h-auto"
                          onError={() => setPreviewImageError(true)}
                        />
                        <div className="pointer-events-none absolute inset-x-0 top-[33%] bottom-0 bg-white/97" />
                        <div className="pointer-events-none absolute inset-x-0 top-[33%] border-t border-dashed border-gray-300" />
                        <span className="absolute top-2 right-2 rounded-full bg-black/70 px-2.5 py-1 text-[11px] font-medium text-white">
                          Preview
                        </span>
                      </div>
                    ) : (
                      <div className="h-52 rounded-md border border-dashed border-gray-300 flex items-center justify-center text-gray-500 text-sm text-center px-4">
                        Preview image unavailable. Use request access to get full document.
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
};

export default Reports;


