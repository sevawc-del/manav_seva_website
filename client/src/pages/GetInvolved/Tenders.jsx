import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { getTenderDocumentLink, getTenders } from '../../utils/api';
import Loader from '../../components/Loader';

const normalizeDocuments = (documents) => {
  if (Array.isArray(documents)) {
    return documents.map((doc) => String(doc || '').trim()).filter(Boolean);
  }
  if (typeof documents === 'string') {
    const value = documents.trim();
    return value ? [value] : [];
  }
  return [];
};

const parseDateSafe = (value) => {
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const formatDate = (value) => {
  const parsed = parseDateSafe(value);
  if (!parsed) return 'N/A';
  return parsed.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
};

const getTenderStatus = (tender) => {
  if (tender?.status) return tender.status;
  if (!tender?.deadline) return 'Open';
  const deadline = new Date(tender.deadline);
  if (Number.isNaN(deadline.getTime())) return 'Open';
  return deadline >= new Date() ? 'Open' : 'Closed';
};

const truncateText = (value = '', maxLength = 220) => {
  const source = String(value || '').trim();
  if (!source) return 'No description provided.';
  return source.length > maxLength ? `${source.slice(0, maxLength)}...` : source;
};

const TENDER_THEMES = [
  {
    containerBorder: 'border-blue-200',
    headerGradient: 'from-blue-600 to-sky-500',
    actionButton: 'bg-blue-600 hover:bg-blue-700 focus-visible:ring-blue-500',
    outlineButton: 'border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100'
  },
  {
    containerBorder: 'border-emerald-200',
    headerGradient: 'from-emerald-600 to-teal-500',
    actionButton: 'bg-emerald-600 hover:bg-emerald-700 focus-visible:ring-emerald-500',
    outlineButton: 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
  },
  {
    containerBorder: 'border-amber-200',
    headerGradient: 'from-amber-500 to-yellow-500',
    actionButton: 'bg-amber-500 hover:bg-amber-600 focus-visible:ring-amber-500',
    outlineButton: 'border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100'
  },
  {
    containerBorder: 'border-cyan-200',
    headerGradient: 'from-cyan-500 to-sky-500',
    actionButton: 'bg-cyan-600 hover:bg-cyan-700 focus-visible:ring-cyan-500',
    outlineButton: 'border-cyan-200 bg-cyan-50 text-cyan-700 hover:bg-cyan-100'
  },
  {
    containerBorder: 'border-rose-200',
    headerGradient: 'from-rose-600 to-red-500',
    actionButton: 'bg-rose-600 hover:bg-rose-700 focus-visible:ring-rose-500',
    outlineButton: 'border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100'
  }
];

const getThemeByIndex = (index) => TENDER_THEMES[index % TENDER_THEMES.length];

const statusPillClasses = (status) =>
  status === 'Open' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800';

const Tenders = () => {
  const [tenders, setTenders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTender, setActiveTender] = useState(null);
  const [openingDocumentIndex, setOpeningDocumentIndex] = useState(-1);
  const [documentError, setDocumentError] = useState('');

  useEffect(() => {
    const fetchTenders = async () => {
      try {
        const response = await getTenders();
        setTenders(Array.isArray(response?.data) ? response.data : []);
      } catch (err) {
        setError('Failed to load tenders.');
        console.error('Error fetching tenders:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTenders();
  }, []);

  const tenderCounts = useMemo(() => {
    const counts = { total: tenders.length, open: 0, closed: 0 };
    tenders.forEach((tender) => {
      const status = getTenderStatus(tender);
      if (status === 'Open') counts.open += 1;
      else counts.closed += 1;
    });
    return counts;
  }, [tenders]);

  if (loading) return <Loader />;

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-5 py-4 text-center text-rose-700">
          {error}
        </div>
      </div>
    );
  }

  const activeDocuments = normalizeDocuments(activeTender?.documents);

  const handleOpenTenderDocument = async (documentIndex) => {
    if (!activeTender?._id) return;

    try {
      setDocumentError('');
      setOpeningDocumentIndex(documentIndex);
      const response = await getTenderDocumentLink(activeTender._id, documentIndex, 'view');
      const url = String(response?.data?.downloadUrl || '').trim();
      if (!url) {
        throw new Error('Document link missing');
      }
      window.open(url, '_blank', 'noopener,noreferrer');
    } catch (openError) {
      const message = openError?.response?.data?.message || 'Unable to open document right now.';
      setDocumentError(message);
    } finally {
      setOpeningDocumentIndex(-1);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 rounded-3xl bg-gradient-to-r from-sky-600 via-blue-600 to-cyan-500 px-6 py-7 text-white shadow-lg">
        <h1 className="text-3xl text-center font-bold md:text-left md:text-4xl">Tenders</h1>
        <p className="mt-2 text-sm text-center text-sky-100 md:text-left md:text-base">
          Explore procurement opportunities and apply for open tenders.
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-semibold text-white">
            {tenderCounts.total} Total
          </span>
          <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-semibold text-white">
            {tenderCounts.open} Open
          </span>
          <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-semibold text-white">
            {tenderCounts.closed} Closed
          </span>
        </div>
      </div>

      {tenders.length === 0 ? (
        <section className="rounded-2xl border border-slate-200 bg-white px-6 py-10 text-center text-slate-600 shadow-sm">
          No tenders available right now.
        </section>
      ) : (
        <div className="space-y-6">
          {tenders.map((tender, index) => {
            const theme = getThemeByIndex(index);
            const status = getTenderStatus(tender);

            return (
              <article
                key={tender._id}
                className={`overflow-hidden rounded-2xl border bg-white shadow-md ${theme.containerBorder}`}
              >
                <div className={`bg-gradient-to-r px-5 py-4 ${theme.headerGradient}`}>
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <h2 className="text-xl font-semibold text-white md:text-2xl">{tender.title}</h2>
                    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${statusPillClasses(status)}`}>
                      {status}
                    </span>
                  </div>
                </div>

                <div className="space-y-4 p-4 md:p-5">
                  <p className="text-sm leading-7 text-slate-700 md:text-base">
                    {truncateText(tender.description)}
                  </p>

                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                      Deadline: {formatDate(tender.deadline)}
                    </span>
                    <span className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                      {normalizeDocuments(tender.documents).length} Document(s)
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 border-t border-slate-200 pt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setActiveTender(tender);
                        setDocumentError('');
                        setOpeningDocumentIndex(-1);
                      }}
                      className={`inline-flex items-center rounded-md border px-4 py-2 text-sm font-semibold transition ${theme.outlineButton}`}
                    >
                      View Details
                    </button>

                    {status === 'Open' ? (
                      <Link
                        to={`/get-involved/tenders/apply/${tender._id}`}
                        className={`inline-flex items-center rounded-md px-4 py-2 text-sm font-semibold text-white transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${theme.actionButton}`}
                      >
                        Apply
                      </Link>
                    ) : (
                      <button
                        type="button"
                        disabled
                        className="cursor-not-allowed rounded-md bg-slate-200 px-4 py-2 text-sm font-semibold text-slate-600"
                      >
                        Closed
                      </button>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {activeTender ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-3xl overflow-hidden rounded-xl bg-white shadow-xl">
            <div className="bg-gradient-to-r from-sky-600 to-blue-600 px-6 py-4 text-white">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 className="text-xl font-semibold">{activeTender.title}</h3>
                  <p className="mt-1 text-sm text-sky-100">Deadline: {formatDate(activeTender.deadline)}</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${statusPillClasses(getTenderStatus(activeTender))}`}>
                    {getTenderStatus(activeTender)}
                  </span>
                  <button
                    type="button"
                    onClick={() => setActiveTender(null)}
                    className="rounded-md border border-white/50 bg-white/10 px-3 py-1.5 text-sm font-semibold text-white hover:bg-white/20"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>

            <div className="max-h-[75vh] space-y-5 overflow-y-auto p-6">
              <section className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Description</p>
                <p className="mt-2 whitespace-pre-line text-sm leading-7 text-slate-700">
                  {activeTender.description || 'No description provided.'}
                </p>
              </section>

              <section className="rounded-xl border border-slate-200 bg-white p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Documents</p>
                {activeDocuments.length > 0 ? (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {activeDocuments.map((docUrl, index) => (
                      <button
                        type="button"
                        key={`${docUrl}-${index}`}
                        onClick={() => handleOpenTenderDocument(index)}
                        disabled={openingDocumentIndex === index}
                        className="inline-flex items-center rounded-md border border-blue-200 bg-blue-50 px-3 py-1.5 text-sm font-semibold text-blue-700 hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-70"
                      >
                        {openingDocumentIndex === index
                          ? 'Opening...'
                          : `View Document ${activeDocuments.length > 1 ? index + 1 : ''}`}
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="mt-2 text-sm text-slate-500">No document uploaded for this tender.</p>
                )}

                {documentError ? (
                  <p className="mt-2 text-sm text-rose-600">{documentError}</p>
                ) : null}
              </section>

              <div className="flex flex-wrap items-center justify-end gap-3">
                {getTenderStatus(activeTender) === 'Open' ? (
                  <Link
                    to={`/get-involved/tenders/apply/${activeTender._id}`}
                    className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                    onClick={() => setActiveTender(null)}
                  >
                    Apply for Tender
                  </Link>
                ) : (
                  <button
                    type="button"
                    disabled
                    className="cursor-not-allowed rounded-md bg-slate-200 px-4 py-2 text-sm font-semibold text-slate-600"
                  >
                    Tender Closed
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default Tenders;
