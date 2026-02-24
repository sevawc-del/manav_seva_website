import React, { useState, useEffect } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { getAdminActivityBySlug } from '../../utils/api';
import Loader from '../../components/Loader';

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

        <div
          className="prose prose-lg max-w-none"
          dangerouslySetInnerHTML={{ __html: activity.content }}
        />
      </article>
    </div>
  );
};

export default ActivityDetail;
