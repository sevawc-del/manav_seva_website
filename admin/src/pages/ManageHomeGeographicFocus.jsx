import React, { useEffect, useMemo, useState } from 'react';
import { createOrUpdateSiteSettings, getSiteSettingsAdmin } from '../utils/api';

const STATUS_OPTIONS = [
  { value: 'currently_working', label: 'Currently Working' },
  { value: 'previously_worked', label: 'Previously Worked' }
];

const INDIAN_STATES = [
  'Andaman & Nicobar',
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chandigarh',
  'Chhattisgarh',
  'Dadra & Nagar Haveli',
  'Daman & Diu',
  'Delhi',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jammu & Kashmir',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Ladakh',
  'Lakshadweep',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Puducherry',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal'
];

const normalizeStateName = (value) => String(value || '').trim().replace(/\s+/g, ' ').toUpperCase();

const sanitizeHomeGeographicStates = (items = []) => {
  const deduped = new Map();

  items.forEach((item) => {
    const state = String(item?.state || '').trim();
    if (!state) return;

    const normalizedState = normalizeStateName(state);
    if (!normalizedState) return;

    const status = item?.status === 'previously_worked' ? 'previously_worked' : 'currently_working';
    deduped.set(normalizedState, { state, status });
  });

  return Array.from(deduped.values());
};

const ManageHomeGeographicFocus = () => {
  const [entries, setEntries] = useState([]);
  const [description, setDescription] = useState('');
  const [newState, setNewState] = useState('');
  const [newStatus, setNewStatus] = useState('currently_working');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await getSiteSettingsAdmin();
        const incoming = Array.isArray(response?.data?.homeGeographicFocusStates)
          ? response.data.homeGeographicFocusStates
          : [];
        setEntries(sanitizeHomeGeographicStates(incoming));
        setDescription(String(response?.data?.homeGeographicFocusDescription || '').trim());
      } catch (error) {
        console.error('Failed to load home geographic focus states:', error);
        alert('Failed to load home geographic focus states');
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const availableStates = useMemo(() => {
    const used = new Set(entries.map((entry) => normalizeStateName(entry.state)));
    return INDIAN_STATES.filter((state) => !used.has(normalizeStateName(state)));
  }, [entries]);

  const handleAddState = () => {
    if (!newState) return;

    setEntries((prev) =>
      sanitizeHomeGeographicStates([...prev, { state: newState, status: newStatus }])
    );
    setNewState('');
    setNewStatus('currently_working');
  };

  const handleRemoveState = (state) => {
    const normalizedTarget = normalizeStateName(state);
    setEntries((prev) =>
      prev.filter((entry) => normalizeStateName(entry.state) !== normalizedTarget)
    );
  };

  const handleStatusChange = (state, status) => {
    const normalizedTarget = normalizeStateName(state);
    setEntries((prev) =>
      prev.map((entry) =>
        normalizeStateName(entry.state) === normalizedTarget
          ? { ...entry, status }
          : entry
      )
    );
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (submitting) return;
    setSubmitting(true);

    try {
      const payload = new FormData();
      payload.append('homeGeographicFocusStates', JSON.stringify(sanitizeHomeGeographicStates(entries)));
      payload.append('homeGeographicFocusDescription', description || '');
      await createOrUpdateSiteSettings(payload);
      alert('Home geographic focus states saved successfully');
    } catch (error) {
      console.error('Failed to save home geographic focus states:', error);
      alert(error?.response?.data?.message || 'Failed to save home geographic focus states');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="p-6">Loading home geographic focus settings...</div>;

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-2">Home Geographic Focus</h2>
      <p className="text-sm text-gray-600 mb-6">
        Configure state-level presence for the homepage Geographic Focus section. Use status to mark
        currently working or previously worked states.
      </p>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 max-w-4xl">
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Home Geographic Focus Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full p-2 border rounded"
            placeholder="Add a short description shown below the Geographic Focus heading on the homepage."
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_auto] gap-3 items-end mb-4">
          <div>
            <label className="block text-sm font-medium mb-1">State</label>
            <select
              value={newState}
              onChange={(e) => setNewState(e.target.value)}
              className="w-full p-2 border rounded"
            >
              <option value="">Select state...</option>
              {availableStates.map((state) => (
                <option key={state} value={state}>
                  {state}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Status</label>
            <select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              className="w-full p-2 border rounded"
            >
              {STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            onClick={handleAddState}
            className="px-4 py-2 rounded bg-gray-100 text-gray-800 border border-gray-200 hover:bg-gray-200"
            disabled={!newState}
          >
            Add State
          </button>
        </div>

        <div className="space-y-3">
          {entries.length === 0 ? (
            <div className="rounded-lg border border-dashed border-gray-300 p-4 text-sm text-gray-500">
              No states added yet.
            </div>
          ) : (
            entries.map((entry) => (
              <div
                key={normalizeStateName(entry.state)}
                className="rounded-lg border border-gray-200 p-3 flex flex-col gap-3 md:flex-row md:items-center md:justify-between"
              >
                <p className="text-sm font-semibold text-gray-900">{entry.state}</p>

                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => handleStatusChange(entry.state, 'currently_working')}
                    className={`px-3 py-1.5 rounded border text-sm font-semibold ${
                      entry.status === 'currently_working'
                        ? 'bg-emerald-600 text-white border-emerald-600'
                        : 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                    }`}
                  >
                    Currently Working
                  </button>
                  <button
                    type="button"
                    onClick={() => handleStatusChange(entry.state, 'previously_worked')}
                    className={`px-3 py-1.5 rounded border text-sm font-semibold ${
                      entry.status === 'previously_worked'
                        ? 'bg-amber-500 text-white border-amber-500'
                        : 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
                    }`}
                  >
                    Previously Worked
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRemoveState(entry.state)}
                    className="px-3 py-1.5 rounded border text-sm font-semibold bg-red-50 text-red-700 border-red-200 hover:bg-red-100"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="mt-5 px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-400"
        >
          {submitting ? 'Saving...' : 'Save Home Geographic Focus'}
        </button>
      </form>
    </div>
  );
};

export default ManageHomeGeographicFocus;
