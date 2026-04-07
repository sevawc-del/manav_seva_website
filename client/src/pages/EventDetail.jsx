import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getEventBySlug } from '../utils/api';
import Loader from '../components/Loader';
import MarkdownContent from '../components/MarkdownContent';

const EventDetail = () => {
  const { slug } = useParams();
  const [eventItem, setEventItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEventDetail = async () => {
      try {
        const response = await getEventBySlug(slug);
        setEventItem(response.data);
      } catch (err) {
        console.error('Error fetching event detail:', err);
        setError('Event not found');
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchEventDetail();
    }
  }, [slug]);

  if (loading) return <Loader />;
  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold text-red-600 mb-4">{error}</h1>
        <Link to="/news-events" className="app-btn app-btn-primary">
          Back to News & Events
        </Link>
      </div>
    );
  }
  if (!eventItem) return null;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link to="/news-events" className="app-btn app-btn-outline">
          Back to News & Events
        </Link>
      </div>

      <article className="max-w-4xl mx-auto bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
        <img
          src={eventItem.image || 'https://via.placeholder.com/1200x600?text=Event+Image'}
          alt={eventItem.title}
          className="w-full h-64 md:h-96 object-cover"
          onError={(e) => {
            e.target.src = 'https://via.placeholder.com/1200x600?text=Event+Image';
          }}
        />
        <div className="p-6 md:p-8">
          <p className="text-sm text-gray-500 mb-2">
            {eventItem.startDateTime ? new Date(eventItem.startDateTime).toLocaleString() : 'Date not available'}
          </p>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">{eventItem.title}</h1>
          {eventItem.location && <p className="text-gray-700 mb-2">Location: {eventItem.location}</p>}
          {eventItem.registrationLink && (
            <p className="mb-4">
              <a className="app-btn app-btn-outline" href={eventItem.registrationLink} target="_blank" rel="noreferrer">
                Register
              </a>
            </p>
          )}
          <MarkdownContent content={eventItem.content || ''} />
        </div>
      </article>
    </div>
  );
};

export default EventDetail;
