import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { getAdminActivities } from '../../utils/api';
import Loader from '../../components/Loader';

const Activities = () => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fallback hardcoded activities for backwards compatibility
  const defaultActivities = useMemo(() => [
    { name: 'Health Campaigns', slug: 'health-campaigns', description: 'Comprehensive healthcare initiatives for underserved communities.' },
    { name: 'Education Initiatives', slug: 'education-initiatives', description: 'Empowering through quality education programs.' },
    { name: 'Women Empowerment', slug: 'women-empowerment', description: 'Supporting women to achieve their full potential.' },
    { name: 'Career Development', slug: 'career', description: 'Skill development and career guidance programs.' },
  ], []);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const response = await getAdminActivities();
        setActivities(response.data);
      } catch (err) {
        console.error('Failed to fetch activities:', err);
        // Fall back to default activities if API fails
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
      <div className="bg-gradient-to-br from-blue-50 via-white to-indigo-50 rounded-2xl p-6 md:p-8 border border-blue-100 shadow-sm">
        <h1 className="text-3xl font-bold text-center mb-8">Our Activities</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayActivities.map((activity) => (
            <Link
              key={activity._id || activity.slug}
              to={`/activities/${activity.slug}`}
              className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow"
            >
              <img
                src={activity.image || 'https://via.placeholder.com/600x360?text=Activity+Image'}
                alt={activity.name}
                className="w-full h-48 object-cover"
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/600x360?text=Activity+Image';
                }}
              />
              <div className="p-4">
                <p className="text-xs uppercase tracking-wide text-blue-600 font-semibold mb-1">Impact</p>
                <p className="text-2xl font-extrabold text-gray-900 mb-2">{activity.impactNumber || '-'}</p>
                <h2 className="text-lg font-semibold text-gray-900 mb-1">{activity.name}</h2>
                <p className="text-sm text-gray-600">
                  {activity.description
                    ? `${activity.description.slice(0, 90)}${activity.description.length > 90 ? '...' : ''}`
                    : ''}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Activities;
