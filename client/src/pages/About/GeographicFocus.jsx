import React, { Suspense, lazy, useEffect, useMemo, useState } from 'react';
import { getGeographicActivities, getGeographicActivityPresence } from '../../utils/api';
import Loader from '../../components/Loader';
import { optimizeCloudinaryImage } from '../../utils/imageUrl';

const IndiaMap = lazy(() => import('../../components/IndiaMap'));

const GeographicFocus = () => {
  const [activities, setActivities] = useState([]);
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [selectedDistricts, setSelectedDistricts] = useState([]);
  const [selectedPresence, setSelectedPresence] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const handleActivitySelect = async (activityId) => {
    if (!activityId) {
      setSelectedActivity(null);
      setSelectedDistricts([]);
      setSelectedPresence([]);
      return;
    }

    try {
      const response = await getGeographicActivityPresence(activityId);
      const data = response.data || {};
      const presence = Array.isArray(data.presence) ? data.presence : [];

      setSelectedActivity(data.activity || null);
      setSelectedDistricts(
        presence.map((item) => `${item.stateCode}-${item.districtCode}`)
      );
      setSelectedPresence(presence);
      setError('');
    } catch {
      setSelectedActivity(null);
      setSelectedDistricts([]);
      setSelectedPresence([]);
      setError('Failed to load selected activity coverage.');
    }
  };

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const response = await getGeographicActivities();
        const fetchedActivities = Array.isArray(response?.data) ? response.data : [];
        setActivities(fetchedActivities);

        const defaultActivityId = fetchedActivities[0]?._id;
        if (defaultActivityId) {
          await handleActivitySelect(defaultActivityId);
        }
      } catch {
        setError('Failed to load geographic focus activities.');
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
  }, []);

  const groupedPresence = useMemo(() => {
    const grouped = selectedPresence.reduce((acc, item) => {
      const stateCode = String(item?.stateCode || '').trim();
      const districtCode = String(item?.districtCode || '').trim();
      if (!stateCode || !districtCode) return acc;
      if (!acc[stateCode]) acc[stateCode] = [];
      acc[stateCode].push(districtCode);
      return acc;
    }, {});

    return Object.entries(grouped).sort(([a], [b]) => a.localeCompare(b));
  }, [selectedPresence]);

  if (loading) return <Loader />;

  const selectedStatesCount = groupedPresence.length;
  const selectedDistrictsCount = selectedPresence.length;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 rounded-3xl bg-gradient-to-r from-sky-600 via-blue-600 to-cyan-500 px-6 py-7 text-white shadow-lg">
        <h1 className="text-3xl text-center font-bold md:text-left md:text-4xl">
          Geographic Focus
        </h1>
        <p className="mt-2 text-sm text-center text-sky-100 md:text-left md:text-base">
          Explore district-wise implementation by activity to see where programs are currently active.
        </p>
      </div>

      <div className="space-y-6">
        {error ? (
          <div className="rounded-xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-700">
            {error}
          </div>
        ) : null}

        <section className="overflow-hidden rounded-2xl border border-blue-200 bg-white shadow-md">
          <div className="bg-gradient-to-r from-blue-600 to-sky-500 px-5 py-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-xl font-semibold text-white">Activity Coverage</h2>
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex rounded-full bg-white/25 px-2.5 py-1 text-xs font-semibold text-white">
                  {activities.length} {activities.length === 1 ? 'Activity' : 'Activities'}
                </span>
                <span className="inline-flex rounded-full bg-white/25 px-2.5 py-1 text-xs font-semibold text-white">
                  {selectedStatesCount} {selectedStatesCount === 1 ? 'State' : 'States'}
                </span>
                <span className="inline-flex rounded-full bg-white/25 px-2.5 py-1 text-xs font-semibold text-white">
                  {selectedDistrictsCount} {selectedDistrictsCount === 1 ? 'District' : 'Districts'}
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-4 p-4 md:p-5">
            <div>
              <label
                htmlFor="geographic-activity-select"
                className="mb-2 block text-sm font-semibold text-slate-800"
              >
                Select Activity
              </label>
              <select
                id="geographic-activity-select"
                value={selectedActivity?._id || ''}
                onChange={(event) => handleActivitySelect(event.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-3 text-sm text-slate-800 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                aria-label="Select activity to view geographic presence"
              >
                <option value="">Choose an activity...</option>
                {activities.map((activity) => (
                  <option key={activity._id} value={activity._id}>
                    {activity.name}
                  </option>
                ))}
              </select>
            </div>

          </div>
        </section>

        <section className="grid grid-cols-1 gap-6 xl:grid-cols-[0.95fr_1.05fr]">
          <article className="overflow-hidden rounded-2xl border border-emerald-200 bg-white shadow-md">
            <div className="bg-gradient-to-r from-emerald-600 to-teal-500 px-5 py-4">
              <h2 className="text-xl font-semibold text-white">Activity Snapshot</h2>
            </div>
            <div className="p-4 md:p-5">
              {selectedActivity ? (
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold text-slate-900">{selectedActivity.name}</h3>
                  <img
                    src={
                      optimizeCloudinaryImage(selectedActivity.image, { width: 960, height: 540, crop: 'fill' }) ||
                      'https://via.placeholder.com/960x540?text=Activity+Image'
                    }
                    alt={selectedActivity.name}
                    className="h-52 w-full rounded-lg border border-slate-200 object-cover"
                    loading="lazy"
                    decoding="async"
                    onError={(event) => {
                      event.target.src = 'https://via.placeholder.com/960x540?text=Activity+Image';
                    }}
                  />
                  <p className="text-sm leading-7 text-slate-700 whitespace-pre-line">
                    {selectedActivity.description || 'Description not available.'}
                  </p>
                </div>
              ) : (
                <p className="text-sm text-slate-600">
                  Select an activity to view details.
                </p>
              )}
            </div>
          </article>

          <article className="overflow-hidden rounded-2xl border border-cyan-200 bg-white shadow-md">
            <div className="bg-gradient-to-r from-cyan-500 to-sky-500 px-5 py-4">
              <h2 className="text-xl font-semibold text-white">District Coverage Map</h2>
              <p className="mt-1 text-sm text-white/90">
                Highlighted districts indicate active presence for the selected activity.
              </p>
            </div>
            <div className="p-4 md:p-5">
              <Suspense
                fallback={
                  <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                    Loading map...
                  </div>
                }
              >
                <IndiaMap selectedDistricts={selectedDistricts} />
              </Suspense>
            </div>
          </article>
        </section>

        {selectedPresence.length > 0 ? (
          <section className="overflow-hidden rounded-2xl border border-amber-200 bg-white shadow-md">
            <div className="bg-gradient-to-r from-amber-500 to-yellow-500 px-5 py-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-xl font-semibold text-white">Covered States and Districts</h2>
                <span className="rounded-full bg-white/30 px-2.5 py-1 text-xs font-semibold text-white">
                  Live coverage by selected activity
                </span>
              </div>
            </div>

            <div className="p-4 md:p-5">
              <div className="overflow-hidden rounded-xl border border-slate-200">
                <div className="max-h-[30rem] overflow-auto">
                  <table className="min-w-full table-auto">
                    <thead className="sticky top-0 z-10">
                      <tr className="bg-slate-100">
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">
                          State
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">
                          Districts
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 bg-white">
                      {groupedPresence.map(([state, districts]) => (
                        <tr key={state} className="hover:bg-slate-50">
                          <td className="whitespace-nowrap px-4 py-3 text-sm font-semibold text-slate-900">
                            {state}
                          </td>
                          <td className="px-4 py-3 text-sm text-slate-700">
                            {districts.join(', ')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </section>
        ) : null}
      </div>
    </div>
  );
};

export default GeographicFocus;
