import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { getJobs } from '../../utils/api';
import Loader from '../../components/Loader';

const FILTER_OPTIONS = [
  { key: 'all', label: 'All Positions' },
  { key: 'open', label: 'Open' },
  { key: 'closed', label: 'Closed' }
];

const TYPE_LABELS = {
  'full-time': 'Full-time',
  'part-time': 'Part-time',
  contract: 'Contract'
};

const STATUS_META = {
  open: {
    label: 'Open',
    classes: 'bg-emerald-100 text-emerald-800'
  },
  closed: {
    label: 'Closed',
    classes: 'bg-slate-200 text-slate-700'
  }
};

const CARD_THEMES = [
  {
    containerBorder: 'border-blue-200',
    itemBorder: 'border-blue-100',
    headerGradient: 'from-blue-600 to-sky-500',
    actionButton: 'bg-blue-600 hover:bg-blue-700 focus-visible:ring-blue-500'
  },
  {
    containerBorder: 'border-emerald-200',
    itemBorder: 'border-emerald-100',
    headerGradient: 'from-emerald-600 to-teal-500',
    actionButton: 'bg-emerald-600 hover:bg-emerald-700 focus-visible:ring-emerald-500'
  },
  {
    containerBorder: 'border-amber-200',
    itemBorder: 'border-amber-100',
    headerGradient: 'from-amber-500 to-yellow-500',
    actionButton: 'bg-amber-500 hover:bg-amber-600 focus-visible:ring-amber-500'
  },
  {
    containerBorder: 'border-cyan-200',
    itemBorder: 'border-cyan-100',
    headerGradient: 'from-cyan-500 to-sky-500',
    actionButton: 'bg-cyan-600 hover:bg-cyan-700 focus-visible:ring-cyan-500'
  },
  {
    containerBorder: 'border-rose-200',
    itemBorder: 'border-rose-100',
    headerGradient: 'from-rose-600 to-red-500',
    actionButton: 'bg-rose-600 hover:bg-rose-700 focus-visible:ring-rose-500'
  }
];

const getThemeByIndex = (index) => CARD_THEMES[index % CARD_THEMES.length];

const parseDateSafe = (value) => {
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const formatDate = (value) => {
  const parsed = parseDateSafe(value);
  if (!parsed) return null;
  return parsed.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
};

const getJobStatus = (deadline) => {
  if (!deadline) return 'open';

  const deadlineEndOfDay = new Date(deadline);
  deadlineEndOfDay.setHours(23, 59, 59, 999);
  return deadlineEndOfDay < new Date() ? 'closed' : 'open';
};

const Career = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const response = await getJobs();
        setJobs(Array.isArray(response?.data) ? response.data : []);
      } catch {
        setError('Failed to load job opportunities.');
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);

  const jobsWithStatus = useMemo(
    () =>
      jobs.map((job) => {
        const deadlineDate = parseDateSafe(job.applicationDeadline);
        const status = getJobStatus(deadlineDate);
        return {
          ...job,
          status,
          deadlineText: formatDate(job.applicationDeadline),
          typeLabel: TYPE_LABELS[job.type] || job.type || 'Type not specified',
          locationText: job.location || 'Location not specified'
        };
      }),
    [jobs]
  );

  const filterCounts = useMemo(() => {
    const counts = {
      all: jobsWithStatus.length,
      open: 0,
      closed: 0
    };

    jobsWithStatus.forEach((job) => {
      counts[job.status] += 1;
    });

    return counts;
  }, [jobsWithStatus]);

  const filteredJobs = useMemo(() => {
    if (activeFilter === 'all') return jobsWithStatus;
    return jobsWithStatus.filter((job) => job.status === activeFilter);
  }, [jobsWithStatus, activeFilter]);

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

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 rounded-3xl bg-gradient-to-r from-sky-600 via-blue-600 to-cyan-500 px-6 py-7 text-white shadow-lg">
        <h1 className="text-3xl text-center font-bold md:text-left md:text-4xl">Career Opportunities</h1>
        <p className="mt-2 text-sm text-center text-sky-100 md:text-left md:text-base">
          Join our team and contribute to meaningful social impact.
        </p>
      </div>

      {jobsWithStatus.length > 0 ? (
        <section className="mb-6 overflow-hidden rounded-2xl border border-blue-200 bg-white shadow-md">
          <div className="bg-gradient-to-r from-blue-600 to-sky-500 px-5 py-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-xl font-semibold text-white">Open Positions</h2>
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-white/25 px-2.5 py-1 text-xs font-semibold text-white">
                  {filterCounts.all} Total
                </span>
                <span className="rounded-full bg-white/25 px-2.5 py-1 text-xs font-semibold text-white">
                  {filterCounts.open} Open
                </span>
                <span className="rounded-full bg-white/25 px-2.5 py-1 text-xs font-semibold text-white">
                  {filterCounts.closed} Closed
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 p-4 md:p-5">
            {FILTER_OPTIONS.map((filter) => (
              <button
                key={filter.key}
                type="button"
                onClick={() => setActiveFilter(filter.key)}
                className={`rounded-full border px-4 py-1.5 text-sm font-semibold transition ${
                  activeFilter === filter.key
                    ? 'border-blue-600 bg-blue-600 text-white'
                    : 'border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100'
                }`}
              >
                {filter.label} ({filterCounts[filter.key] || 0})
              </button>
            ))}
          </div>
        </section>
      ) : null}

      {filteredJobs.length === 0 ? (
        <section className="rounded-2xl border border-slate-200 bg-white px-6 py-10 text-center shadow-sm">
          <p className="text-base text-slate-700">
            {activeFilter === 'all'
              ? 'No listed positions right now. Please check back later.'
              : `No ${activeFilter} positions right now.`}
          </p>
          <div className="mt-5">
            <Link to="/contact" className="app-btn app-btn-outline">
              Contact Us
            </Link>
          </div>
        </section>
      ) : (
        <div className="space-y-6">
          {filteredJobs.map((job, index) => {
            const theme = getThemeByIndex(index);
            const statusMeta = STATUS_META[job.status] || STATUS_META.open;

            return (
              <article
                key={job._id}
                className={`overflow-hidden rounded-2xl border bg-white shadow-md ${theme.containerBorder}`}
              >
                <div className={`bg-gradient-to-r px-5 py-4 ${theme.headerGradient}`}>
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h3 className="text-xl font-semibold text-white md:text-2xl">{job.title}</h3>
                      <p className="mt-1 text-sm text-white/90">{job.locationText}</p>
                    </div>
                    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${statusMeta.classes}`}>
                      {statusMeta.label}
                    </span>
                  </div>
                </div>

                <div className="space-y-4 p-4 md:p-5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                      {job.typeLabel}
                    </span>
                    {job.salary ? (
                      <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                        {job.salary}
                      </span>
                    ) : null}
                    <span className="rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                      {job.deadlineText ? `Deadline: ${job.deadlineText}` : 'No deadline specified'}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className={`rounded-xl border p-4 ${theme.itemBorder}`}>
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Description</p>
                      <p className="mt-2 whitespace-pre-line text-sm leading-7 text-slate-700">
                        {job.description || 'No description provided.'}
                      </p>
                    </div>

                    <div className={`rounded-xl border p-4 ${theme.itemBorder}`}>
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Requirements</p>
                      <p className="mt-2 whitespace-pre-line text-sm leading-7 text-slate-700">
                        {job.requirements || 'No specific requirements listed.'}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-end gap-3 border-t border-slate-200 pt-4">
                    {job.status === 'closed' ? (
                      <button
                        type="button"
                        disabled
                        className="cursor-not-allowed rounded-md bg-slate-200 px-4 py-2 text-sm font-semibold text-slate-600"
                      >
                        Position Closed
                      </button>
                    ) : (
                      <Link
                        to={`/get-involved/career/apply/${job._id}`}
                        className={`inline-flex items-center rounded-md px-4 py-2 text-sm font-semibold text-white transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${theme.actionButton}`}
                      >
                        Apply for This Role
                      </Link>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Career;
