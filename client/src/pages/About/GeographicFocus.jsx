import React, { useState, useEffect } from 'react';
import { getGeographicActivities, getGeographicActivityPresence } from '../../utils/api';
import Loader from '../../components/Loader';
import ActivitySelector from '../../components/ActivitySelector';
import ActivityDetails from '../../components/ActivityDetails';
import IndiaMap from '../../components/IndiaMap';

const GeographicFocus = () => {
  const [activities, setActivities] = useState([]);
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [selectedDistricts, setSelectedDistricts] = useState([]);
  const [selectedPresence, setSelectedPresence] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const response = await getGeographicActivities();
        setActivities(response.data);
      } catch (error) {
        console.error('Failed to load activities:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchActivities();
  }, []);

  const handleActivitySelect = async (activityId) => {
    if (!activityId) {
      setSelectedActivity(null);
      setSelectedDistricts([]);
      setSelectedPresence([]);
      return;
    }

    try {
      const response = await getGeographicActivityPresence(activityId);
      const data = response.data;
      setSelectedActivity(data.activity);
      setSelectedDistricts(data.presence.map(p => `${p.stateCode}-${p.districtCode}`));
      setSelectedPresence(data.presence);
    } catch (error) {
      console.error('Failed to load activity presence:', error);
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-8">Geographic Focus</h1>

      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <ActivitySelector
            activities={activities}
            onActivitySelect={handleActivitySelect}
          />
        </div>
        <div className="space-y-6">
          <ActivityDetails activity={selectedActivity} />
        </div>
        <div className="space-y-6">
          <IndiaMap selectedDistricts={selectedDistricts} />
        </div>

        {selectedPresence.length > 0 && (
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Covered States and Districts</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full table-auto">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">State</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Districts</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {Object.entries(
                    selectedPresence.reduce((acc, p) => {
                      if (!acc[p.stateCode]) acc[p.stateCode] = [];
                      acc[p.stateCode].push(p.districtCode);
                      return acc;
                    }, {})
                  ).map(([state, districts]) => (
                    <tr key={state}>
                      <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">{state}</td>
                      <td className="px-4 py-2 text-sm text-gray-500">
                        {districts.join(', ')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

       
      </div>
    </div>
  );
};

export default GeographicFocus;
