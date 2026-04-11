import React, { useState, useEffect } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { getAdminActivityBySlug } from '../../utils/api';
import Loader from '../../components/Loader';
import MarkdownContent from '../../components/MarkdownContent';
import { stripRichText } from '../../utils/richContent';

const ACTIVITY_PATHWAY_WORD_LIMIT = 24;

const truncateWords = (text = '', maxWords = 24) => {
  const cleaned = String(text || '').trim();
  if (!cleaned) return '';
  const words = cleaned.split(/\s+/);
  return words.length > maxWords ? `${words.slice(0, maxWords).join(' ')}...` : cleaned;
};

const getActivityProblem = (activity) =>
  truncateWords(
    stripRichText(activity?.problem || activity?.description || '').trim() ||
      'A local challenge was identified by our team.',
    ACTIVITY_PATHWAY_WORD_LIMIT
  );

const getActivityAction = (activity) =>
  truncateWords(
    stripRichText(activity?.action || activity?.content || activity?.description || '').trim() ||
      'Local volunteers and staff delivered focused interventions.',
    ACTIVITY_PATHWAY_WORD_LIMIT
  );

const getActivityResult = (activity) =>
  truncateWords(
    stripRichText(activity?.result || '').trim() ||
      'Impact summary is being updated as the program continues.',
    ACTIVITY_PATHWAY_WORD_LIMIT
  );

const ActivityDetail = () => {
  const { slug, id } = useParams();
  const location = useLocation();
  const activitySlug = slug || id;
  const fromHome = location.state?.from === 'home';
  const [activity, setActivity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchActivity = async () => {
      try {
        const response = await getAdminActivityBySlug(activitySlug);
        setActivity(response.data);
      } catch (err) {
        console.error('Failed to fetch activity:', err);
        setError('Activity not found');
      } finally {
        setLoading(false);
      }
    };

    if (activitySlug) {
      fetchActivity();
    }
  }, [activitySlug]);

  if (loading) return <Loader />;

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">{error}</h1>
        </div>
        <div className="flex flex-wrap gap-3 justify-center">
          <Link to="/activities" className="app-btn app-btn-primary">
            Go to Activities Page
          </Link>
          {fromHome && (
            <Link to="/" className="app-btn app-btn-outline">
              Back to Home
            </Link>
          )}
        </div>
      </div>
    );
  }

  if (!activity) return null;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex flex-wrap gap-3">
        <Link to="/activities" className="app-btn app-btn-primary">
          Go to Activities Page
        </Link>
        {fromHome && (
          <Link to="/" className="app-btn app-btn-outline">
            Back to Home
          </Link>
        )}
      </div>

      <article className="max-w-4xl mx-auto">
        <header className="mb-8">
          {activity.image && (
            <img
              src={activity.image}
              alt={activity.name}
              className="w-full h-64 md:h-96 object-cover rounded-lg mb-6"
            />
          )}
          <h1 className="text-4xl font-bold text-gray-900 mb-4">{activity.name}</h1>
          <p className="text-xl text-gray-600">{activity.description}</p>
        </header>

        <section className="mb-8 rounded-2xl border border-[var(--ngo-border)] bg-white p-4 md:p-5">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-xl font-semibold text-gray-900">Impact Pathway</h2>
            <span className="inline-flex items-center rounded-full bg-slate-50 px-3 py-1 text-xs font-semibold text-[var(--ngo-primary)] border border-[var(--ngo-border)]">
              Impact: {activity?.impactNumber || 'Updating'}
            </span>
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            <div className="rounded-xl border p-3 par-card-problem">
              <p className="text-[11px] uppercase tracking-wide font-semibold par-label-problem">Challenge</p>
              <p className="mt-1 text-sm leading-6 text-slate-900">{getActivityProblem(activity)}</p>
            </div>
            <div className="rounded-xl border p-3 par-card-action">
              <p className="text-[11px] uppercase tracking-wide font-semibold par-label-action">Intervention</p>
              <p className="mt-1 text-sm leading-6 text-[var(--ngo-primary)]">{getActivityAction(activity)}</p>
            </div>
            <div className="rounded-xl border p-3 par-card-result">
              <p className="text-[11px] uppercase tracking-wide font-semibold par-label-result">Impact</p>
              <p className="mt-1 text-sm leading-6 text-[var(--ngo-secondary)]">{getActivityResult(activity)}</p>
            </div>
          </div>
        </section>

        <MarkdownContent content={activity.content || ''} className="max-w-none" />
      </article>
    </div>
  );
};

export default ActivityDetail;
