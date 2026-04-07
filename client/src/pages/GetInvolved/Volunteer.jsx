import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { getVolunteers } from '../../utils/api';
import Loader from '../../components/Loader';

const TYPE_LABELS = {
  'short-term': 'Short-term',
  'long-term': 'Long-term',
  'event-based': 'Event-based'
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

const VOLUNTEER_THEMES = [
  {
    containerBorder: 'border-emerald-200',
    headerGradient: 'from-emerald-600 to-teal-500',
    itemBorder: 'border-emerald-100',
    actionButton: 'bg-emerald-600 hover:bg-emerald-700 focus-visible:ring-emerald-500'
  },
  {
    containerBorder: 'border-blue-200',
    headerGradient: 'from-blue-600 to-sky-500',
    itemBorder: 'border-blue-100',
    actionButton: 'bg-blue-600 hover:bg-blue-700 focus-visible:ring-blue-500'
  },
  {
    containerBorder: 'border-amber-200',
    headerGradient: 'from-amber-500 to-yellow-500',
    itemBorder: 'border-amber-100',
    actionButton: 'bg-amber-500 hover:bg-amber-600 focus-visible:ring-amber-500'
  },
  {
    containerBorder: 'border-cyan-200',
    headerGradient: 'from-cyan-500 to-sky-500',
    itemBorder: 'border-cyan-100',
    actionButton: 'bg-cyan-600 hover:bg-cyan-700 focus-visible:ring-cyan-500'
  },
  {
    containerBorder: 'border-rose-200',
    headerGradient: 'from-rose-600 to-red-500',
    itemBorder: 'border-rose-100',
    actionButton: 'bg-rose-600 hover:bg-rose-700 focus-visible:ring-rose-500'
  }
];

const getThemeByIndex = (index) => VOLUNTEER_THEMES[index % VOLUNTEER_THEMES.length];

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

const getVolunteerStatus = (deadline) => {
  if (!deadline) return 'open';

  const deadlineEndOfDay = new Date(deadline);
  deadlineEndOfDay.setHours(23, 59, 59, 999);
  return deadlineEndOfDay < new Date() ? 'closed' : 'open';
};

const Volunteer = () => {
  const [volunteers, setVolunteers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchVolunteers = async () => {
      try {
        const response = await getVolunteers();
        setVolunteers(Array.isArray(response?.data) ? response.data : []);
      } catch {
        setError('Failed to load volunteer opportunities.');
      } finally {
        setLoading(false);
      }
    };

    fetchVolunteers();
  }, []);

  const volunteerCards = useMemo(
    () =>
      volunteers.map((volunteer) => {
        const deadlineDate = parseDateSafe(volunteer.applicationDeadline);
        const status = getVolunteerStatus(deadlineDate);
        const statusMeta = STATUS_META[status] || STATUS_META.open;

        return {
          ...volunteer,
          status,
          statusLabel: statusMeta.label,
          statusClasses: statusMeta.classes,
          deadlineText: formatDate(volunteer.applicationDeadline),
          typeLabel: TYPE_LABELS[volunteer.type] || volunteer.type || 'Type not specified',
          locationText: volunteer.location || 'Location not specified'
        };
      }),
    [volunteers]
  );

  const counts = useMemo(() => {
    const summary = { total: volunteerCards.length, open: 0, closed: 0 };
    volunteerCards.forEach((item) => {
      summary[item.status] += 1;
    });
    return summary;
  }, [volunteerCards]);

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
        <h1 className="text-3xl text-center font-bold md:text-left md:text-4xl">Volunteer Opportunities</h1>
        <p className="mt-2 text-sm text-center text-sky-100 md:text-left md:text-base">
          Support our community initiatives by sharing your time and skills.
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-semibold text-white">
            {counts.total} Total
          </span>
          <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-semibold text-white">
            {counts.open} Open
          </span>
          <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-semibold text-white">
            {counts.closed} Closed
          </span>
        </div>
      </div>

      {volunteerCards.length === 0 ? (
        <section className="rounded-2xl border border-slate-200 bg-white px-6 py-10 text-center text-slate-600 shadow-sm">
          No volunteer opportunities available at the moment.
        </section>
      ) : (
        <div className="space-y-6">
          {volunteerCards.map((volunteer, index) => {
            const theme = getThemeByIndex(index);

            return (
              <article
                key={volunteer._id}
                className={`overflow-hidden rounded-2xl border bg-white shadow-md ${theme.containerBorder}`}
              >
                <div className={`bg-gradient-to-r px-5 py-4 ${theme.headerGradient}`}>
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h2 className="text-xl font-semibold text-white md:text-2xl">{volunteer.title}</h2>
                      <p className="mt-1 text-sm text-white/90">{volunteer.locationText}</p>
                    </div>
                    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${volunteer.statusClasses}`}>
                      {volunteer.statusLabel}
                    </span>
                  </div>
                </div>

                <div className="space-y-4 p-4 md:p-5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                      {volunteer.typeLabel}
                    </span>
                    {volunteer.commitment ? (
                      <span className="rounded-full border border-cyan-200 bg-cyan-50 px-3 py-1 text-xs font-semibold text-cyan-700">
                        {volunteer.commitment}
                      </span>
                    ) : null}
                    <span className="rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                      {volunteer.deadlineText
                        ? `Deadline: ${volunteer.deadlineText}`
                        : 'No deadline specified'}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className={`rounded-xl border p-4 ${theme.itemBorder}`}>
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Description</p>
                      <p className="mt-2 whitespace-pre-line text-sm leading-7 text-slate-700">
                        {volunteer.description || 'No description provided.'}
                      </p>
                    </div>

                    <div className={`rounded-xl border p-4 ${theme.itemBorder}`}>
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Requirements</p>
                      <p className="mt-2 whitespace-pre-line text-sm leading-7 text-slate-700">
                        {volunteer.requirements || 'No requirements listed.'}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-end gap-3 border-t border-slate-200 pt-4">
                    {volunteer.status === 'closed' ? (
                      <button
                        type="button"
                        disabled
                        className="cursor-not-allowed rounded-md bg-slate-200 px-4 py-2 text-sm font-semibold text-slate-600"
                      >
                        Applications Closed
                      </button>
                    ) : (
                      <Link
                        to={`/get-involved/volunteer/apply/${volunteer._id}`}
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

export default Volunteer;
