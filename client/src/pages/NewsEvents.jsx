import React, { useEffect, useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { getEvents, getNews } from '../utils/api';
import Loader from '../components/Loader';

const NewsEvents = () => {
  const location = useLocation();
  const initialTab = new URLSearchParams(location.search).get('tab') === 'events' ? 'events' : 'news';
  const [activeTab, setActiveTab] = useState(initialTab);
  const [newsItems, setNewsItems] = useState([]);
  const [eventItems, setEventItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [newsResponse, eventResponse] = await Promise.all([getNews(), getEvents()]);
        setNewsItems(newsResponse.data || []);
        setEventItems(eventResponse.data || []);
      } catch (err) {
        setError('Failed to load news and events');
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  const now = Date.now();
  const upcomingEvents = useMemo(
    () => eventItems
      .filter((item) => item.startDateTime && new Date(item.startDateTime).getTime() >= now)
      .sort((a, b) => new Date(a.startDateTime) - new Date(b.startDateTime)),
    [eventItems, now]
  );

  if (loading) return <Loader />;
  if (error) return <div className="container mx-auto px-4 py-8 text-center text-red-600">{error}</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-6">News & Events</h1>

      <div className="flex gap-2 border-b pb-3 mb-6 justify-center">
        <button
          type="button"
          onClick={() => setActiveTab('news')}
          className={`px-4 py-2 rounded ${activeTab === 'news' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'}`}
        >
          News
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('events')}
          className={`px-4 py-2 rounded ${activeTab === 'events' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'}`}
        >
          Events
        </button>
      </div>

      {activeTab === 'news' && (
        newsItems.length === 0 ? (
          <div className="text-center text-gray-500">No news available</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {newsItems.map((item) => (
              <Link
                key={item._id}
                to={`/news-events/${item.slug || item._id}`}
                className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow block"
              >
                <img
                  className="h-48 w-full object-cover"
                  src={item.image || 'https://via.placeholder.com/400x300?text=News+Image'}
                  alt={item.title}
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/400x300?text=News+Image';
                  }}
                />
                <div className="p-5">
                  <div className="text-sm text-gray-500 mb-2">
                    {(item.date || item.createdAt)
                      ? new Date(item.date || item.createdAt).toLocaleDateString()
                      : 'Date not available'}
                  </div>
                  <h2 className="text-xl font-semibold mb-2 text-gray-900">{item.title}</h2>
                  <p className="text-gray-700">{item.content ? `${item.content.slice(0, 140)}${item.content.length > 140 ? '...' : ''}` : ''}</p>
                </div>
              </Link>
            ))}
          </div>
        )
      )}

      {activeTab === 'events' && (
        upcomingEvents.length === 0 ? (
          <div className="text-center text-gray-500">No upcoming events</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {upcomingEvents.map((item) => (
              <Link
                key={item._id}
                to={`/events/${item.slug}`}
                className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow block"
              >
                <img
                  className="h-48 w-full object-cover"
                  src={item.image || 'https://via.placeholder.com/400x300?text=Event+Image'}
                  alt={item.title}
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/400x300?text=Event+Image';
                  }}
                />
                <div className="p-5">
                  <div className="text-sm text-gray-500 mb-2">{item.startDateTime ? new Date(item.startDateTime).toLocaleString() : 'Date not available'}</div>
                  <h2 className="text-xl font-semibold mb-2 text-gray-900">{item.title}</h2>
                  <p className="text-gray-700">{item.description ? `${item.description.slice(0, 120)}${item.description.length > 120 ? '...' : ''}` : ''}</p>
                </div>
              </Link>
            ))}
          </div>
        )
      )}
    </div>
  );
};

export default NewsEvents;
