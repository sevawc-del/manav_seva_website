import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { getAdminActivities } from '../../utils/api';
import Loader from '../../components/Loader';
import { stripRichText } from '../../utils/richContent';
import { optimizeCloudinaryImage } from '../../utils/imageUrl';

const truncateText = (text = '', maxLength = 110) => {
  if (!text) return '';
  return text.length > maxLength ? `${text.slice(0, maxLength)}...` : text;
};

const getActivityProblem = (activity) => {
  const problem = stripRichText(activity?.problem || activity?.description || '');
  return truncateText(problem || 'A local challenge was identified by our team.', 110);
};

const getActivityAction = (activity) => {
  const action = stripRichText(activity?.action || activity?.content || activity?.description || '');
  return truncateText(action || 'Local volunteers and staff delivered focused interventions.', 110);
};

const getActivityResult = (activity) => {
  const result = stripRichText(activity?.result || '');
  return truncateText(result || 'Impact summary is being updated as the program continues.', 110);
};

const ACTIVITY_THEMES = [
  {
    containerBorder: 'border-blue-200',
    headerGradient: 'from-blue-600 to-sky-500',
    countBadge: 'bg-white/25 text-white',
    itemBorder: 'border-blue-100',
    panelProblem: 'border-rose-100 bg-rose-50/70 text-rose-900',
    panelAction: 'border-blue-100 bg-blue-50/70 text-blue-900',
    panelResult: 'border-emerald-100 bg-emerald-50/70 text-emerald-900',
    actionButton: 'bg-blue-600 hover:bg-blue-700 focus-visible:ring-blue-500'
  },
  {
    containerBorder: 'border-emerald-200',
    headerGradient: 'from-emerald-600 to-teal-500',
    countBadge: 'bg-white/25 text-white',
    itemBorder: 'border-emerald-100',
    panelProblem: 'border-amber-100 bg-amber-50/70 text-amber-900',
    panelAction: 'border-cyan-100 bg-cyan-50/70 text-cyan-900',
    panelResult: 'border-emerald-100 bg-emerald-50/70 text-emerald-900',
    actionButton: 'bg-emerald-600 hover:bg-emerald-700 focus-visible:ring-emerald-500'
  },
  {
    containerBorder: 'border-amber-200',
    headerGradient: 'from-amber-500 to-yellow-500',
    countBadge: 'bg-white/30 text-white',
    itemBorder: 'border-amber-100',
    panelProblem: 'border-rose-100 bg-rose-50/70 text-rose-900',
    panelAction: 'border-blue-100 bg-blue-50/70 text-blue-900',
    panelResult: 'border-emerald-100 bg-emerald-50/70 text-emerald-900',
    actionButton: 'bg-amber-500 hover:bg-amber-600 focus-visible:ring-amber-500'
  },
  {
    containerBorder: 'border-cyan-200',
    headerGradient: 'from-cyan-500 to-sky-500',
    countBadge: 'bg-white/25 text-white',
    itemBorder: 'border-cyan-100',
    panelProblem: 'border-rose-100 bg-rose-50/70 text-rose-900',
    panelAction: 'border-cyan-100 bg-cyan-50/70 text-cyan-900',
    panelResult: 'border-emerald-100 bg-emerald-50/70 text-emerald-900',
    actionButton: 'bg-cyan-600 hover:bg-cyan-700 focus-visible:ring-cyan-500'
  },
  {
    containerBorder: 'border-rose-200',
    headerGradient: 'from-rose-600 to-red-500',
    countBadge: 'bg-white/25 text-white',
    itemBorder: 'border-rose-100',
    panelProblem: 'border-rose-100 bg-rose-50/70 text-rose-900',
    panelAction: 'border-blue-100 bg-blue-50/70 text-blue-900',
    panelResult: 'border-emerald-100 bg-emerald-50/70 text-emerald-900',
    actionButton: 'bg-rose-600 hover:bg-rose-700 focus-visible:ring-rose-500'
  }
];

const getThemeByIndex = (index) => ACTIVITY_THEMES[index % ACTIVITY_THEMES.length];

const getActivityKey = (activity, index) => String(activity?._id || activity?.slug || `activity-${index}`);

const getActivityPath = (activity) => {
  const slugOrId = String(activity?.slug || activity?._id || '').trim();
  return slugOrId ? `/activities/${slugOrId}` : '/activities';
};

const Activities = () => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedActivityId, setExpandedActivityId] = useState('');

  const defaultActivities = useMemo(
    () => [
      {
        name: 'Health Campaigns',
        slug: 'health-campaigns',
        description: 'Comprehensive healthcare initiatives for underserved communities.',
        impactNumber: '',
        problem: '',
        action: '',
        result: '',
        content: ''
      },
      {
        name: 'Education Initiatives',
        slug: 'education-initiatives',
        description: 'Empowering through quality education programs.',
        impactNumber: '',
        problem: '',
        action: '',
        result: '',
        content: ''
      },
      {
        name: 'Women Empowerment',
        slug: 'women-empowerment',
        description: 'Supporting women to achieve their full potential.',
        impactNumber: '',
        problem: '',
        action: '',
        result: '',
        content: ''
      },
      {
        name: 'Career Development',
        slug: 'career',
        description: 'Skill development and career guidance programs.',
        impactNumber: '',
        problem: '',
        action: '',
        result: '',
        content: ''
      }
    ],
    []
  );

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const response = await getAdminActivities();
        const incoming = Array.isArray(response?.data) ? response.data : [];
        setActivities(incoming);
      } catch (err) {
        console.error('Failed to fetch activities:', err);
        setActivities(defaultActivities);
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
  }, [defaultActivities]);

  if (loading) return <Loader />;

  const displayActivities = activities.length > 0 ? activities : defaultActivities;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 rounded-3xl bg-gradient-to-r from-sky-600 via-blue-600 to-cyan-500 px-6 py-7 text-white shadow-lg">
        <h1 className="text-3xl text-center font-bold md:text-left md:text-4xl">Our Activities</h1>
        <p className="mt-2 text-sm text-center text-sky-100 md:text-left md:text-base">
          Explore our key programs through their problem, action, and outcome pathways.
        </p>
        <div className="mt-4">
          <span className="inline-flex items-center rounded-full bg-white/20 px-3 py-1 text-xs font-semibold text-white">
            {displayActivities.length} {displayActivities.length === 1 ? 'Program' : 'Programs'}
          </span>
        </div>
      </div>

      <div className="space-y-6">
        {displayActivities.map((activity, index) => {
          const theme = getThemeByIndex(index);
          const activityKey = getActivityKey(activity, index);
          const isExpanded = expandedActivityId === activityKey;
          const activityPath = getActivityPath(activity);
          const imageUrl =
            optimizeCloudinaryImage(activity?.image, {
              width: 960,
              height: 640,
              crop: 'fill'
            }) || 'https://via.placeholder.com/600x360?text=Activity+Image';

          return (
            <section
              key={activityKey}
              className={`overflow-hidden rounded-2xl border bg-white shadow-md ${theme.containerBorder}`}
            >
              <div className={`bg-gradient-to-r px-5 py-4 ${theme.headerGradient}`}>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h2 className="text-xl font-semibold text-white">{activity?.name || 'Activity'}</h2>
                  <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${theme.countBadge}`}>
                    Impact: {activity?.impactNumber || 'Updating'}
                  </span>
                </div>
              </div>

              <div className="space-y-4 p-4 md:p-5">
                <div className="grid grid-cols-1 gap-5 lg:grid-cols-[16rem_1fr]">
                  <div className={`overflow-hidden rounded-xl border ${theme.itemBorder}`}>
                    <img
                      src={imageUrl}
                      alt={activity?.name || 'Activity'}
                      className="h-52 w-full object-cover"
                      onError={(event) => {
                        event.target.src = 'https://via.placeholder.com/600x360?text=Activity+Image';
                      }}
                    />
                  </div>

                  <div className="space-y-4">
                    <p className="text-sm leading-7 text-slate-700 md:text-base">
                      {truncateText(
                        stripRichText(activity?.description || activity?.content || ''),
                        240
                      ) || 'Program details are being updated.'}
                    </p>

                    <button
                      type="button"
                      onClick={() =>
                        setExpandedActivityId((prev) =>
                          prev === activityKey ? '' : activityKey
                        )
                      }
                      className={`w-full rounded-lg border px-3 py-2 text-sm font-semibold md:hidden ${theme.itemBorder}`}
                    >
                      {isExpanded ? 'Hide pathway' : 'Show pathway'}
                    </button>

                    <div className="hidden grid-cols-1 gap-3 md:grid md:grid-cols-3">
                      <div className={`rounded-xl border p-3 ${theme.panelProblem}`}>
                        <p className="text-[11px] font-semibold uppercase tracking-wide">Problem</p>
                        <p className="mt-1 text-sm">{getActivityProblem(activity)}</p>
                      </div>
                      <div className={`rounded-xl border p-3 ${theme.panelAction}`}>
                        <p className="text-[11px] font-semibold uppercase tracking-wide">Action</p>
                        <p className="mt-1 text-sm">{getActivityAction(activity)}</p>
                      </div>
                      <div className={`rounded-xl border p-3 ${theme.panelResult}`}>
                        <p className="text-[11px] font-semibold uppercase tracking-wide">Result</p>
                        <p className="mt-1 text-sm">{getActivityResult(activity)}</p>
                      </div>
                    </div>

                    {isExpanded ? (
                      <div className="grid grid-cols-1 gap-2 md:hidden">
                        <div className={`rounded-lg border p-2.5 ${theme.panelProblem}`}>
                          <p className="text-[11px] font-semibold uppercase tracking-wide">Problem</p>
                          <p className="mt-1 text-xs">{getActivityProblem(activity)}</p>
                        </div>
                        <div className={`rounded-lg border p-2.5 ${theme.panelAction}`}>
                          <p className="text-[11px] font-semibold uppercase tracking-wide">Action</p>
                          <p className="mt-1 text-xs">{getActivityAction(activity)}</p>
                        </div>
                        <div className={`rounded-lg border p-2.5 ${theme.panelResult}`}>
                          <p className="text-[11px] font-semibold uppercase tracking-wide">Result</p>
                          <p className="mt-1 text-xs">{getActivityResult(activity)}</p>
                        </div>
                      </div>
                    ) : null}

                    <div>
                      <Link
                        to={activityPath}
                        className={`inline-flex items-center rounded-md px-4 py-2 text-sm font-semibold text-white transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${theme.actionButton}`}
                      >
                        View Activity
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
};

export default Activities;
