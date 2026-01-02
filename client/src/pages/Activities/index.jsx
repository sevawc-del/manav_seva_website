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
      <h1 className="text-3xl font-bold text-center mb-8">Our Activities</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {displayActivities.map((activity) => (
          <Link
            key={activity.slug}
            to={`/activities/${activity.slug}`}
            className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow"
          >
            <h2 className="text-xl font-semibold mb-4 text-blue-600">{activity.name}</h2>
            <p className="text-gray-600">{activity.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Activities;
