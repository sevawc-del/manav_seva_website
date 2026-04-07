import React, { useEffect, useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { getEvents, getNews } from '../utils/api';
import Loader from '../components/Loader';
import { stripRichText } from '../utils/richContent';
import { optimizeCloudinaryImage } from '../utils/imageUrl';

const truncateText = (value = '', maxLength = 140) => {
  if (!value) return '';
  return value.length > maxLength ? `${value.slice(0, maxLength)}...` : value;
};

const parseSafeDate = (value) => {
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const formatDate = (value) => {
  const parsed = parseSafeDate(value);
  return parsed
    ? parsed.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
    : 'Date not available';
};

const formatDateTime = (value) => {
  const parsed = parseSafeDate(value);
  return parsed
    ? parsed.toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })
    : 'Date not available';
};

const TAB_THEMES = {
  news: {
    containerBorder: 'border-blue-200',
    headerGradient: 'from-blue-600 to-sky-500',
    countBadge: 'bg-white/25 text-white',
    itemBorder: 'border-blue-100',
    itemHover: 'hover:border-blue-200 hover:bg-blue-50/50',
    typeBadge: 'bg-blue-100 text-blue-700',
    dateBadge: 'bg-blue-50 text-blue-700',
    readMoreText: 'text-blue-700 group-hover:text-blue-800'
  },
  events: {
    containerBorder: 'border-emerald-200',
    headerGradient: 'from-emerald-600 to-teal-500',
    countBadge: 'bg-white/25 text-white',
    itemBorder: 'border-emerald-100',
    itemHover: 'hover:border-emerald-200 hover:bg-emerald-50/50',
    typeBadge: 'bg-emerald-100 text-emerald-700',
    dateBadge: 'bg-emerald-50 text-emerald-700',
    readMoreText: 'text-emerald-700 group-hover:text-emerald-800'
  }
};

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

  const upcomingEvents = useMemo(() => {
    const now = Date.now();
    return eventItems
      .filter((item) => {
        const parsed = parseSafeDate(item.startDateTime);
        return parsed ? parsed.getTime() >= now : false;
      })
      .sort((a, b) => new Date(a.startDateTime) - new Date(b.startDateTime));
  }, [eventItems]);

  if (loading) return <Loader />;
  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-5 py-4 text-center text-rose-700">
          {error}
        </div>
      </div>
    );
  }

  const activeTheme = TAB_THEMES[activeTab];
  const sectionTitle = activeTab === 'news' ? 'Latest News' : 'Upcoming Events';
  const sectionDescription =
    activeTab === 'news'
      ? 'Read recent updates and impact highlights from our programs.'
      : 'Explore upcoming activities and plan your participation.';

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 rounded-3xl bg-gradient-to-r from-sky-600 via-blue-600 to-cyan-500 px-6 py-7 text-white shadow-lg">
        <h1 className="text-3xl text-center font-bold md:text-left md:text-4xl">News & Events</h1>
        <p className="mt-2 text-sm text-center text-sky-100 md:text-left md:text-base">
          Follow the latest field updates and upcoming programs from across our initiatives.
        </p>
      </div>

      <section className={`overflow-hidden rounded-2xl border bg-white shadow-md ${activeTheme.containerBorder}`}>
        <div className={`bg-gradient-to-r px-5 py-5 ${activeTheme.headerGradient}`}>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold text-white">{sectionTitle}</h2>
              <p className="mt-1 text-sm text-white/90">{sectionDescription}</p>
            </div>
            <div className="inline-flex rounded-full border border-white/35 bg-white/10 p-1">
              <button
                type="button"
                onClick={() => setActiveTab('news')}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                  activeTab === 'news' ? 'bg-white text-blue-700 shadow-sm' : 'text-white hover:bg-white/20'
                }`}
              >
                News
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('events')}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                  activeTab === 'events'
                    ? 'bg-white text-emerald-700 shadow-sm'
                    : 'text-white hover:bg-white/20'
                }`}
              >
                Events
              </button>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${activeTheme.countBadge}`}>
              {activeTab === 'news'
                ? `${newsItems.length} ${newsItems.length === 1 ? 'News Item' : 'News Items'}`
                : `${upcomingEvents.length} ${upcomingEvents.length === 1 ? 'Upcoming Event' : 'Upcoming Events'}`}
            </span>
            <span className="inline-flex items-center rounded-full bg-white/20 px-2.5 py-1 text-xs font-semibold text-white">
              {activeTab === 'news'
                ? `${upcomingEvents.length} Upcoming`
                : `${newsItems.length} News Updates`}
            </span>
          </div>
        </div>

        <div className="p-4 md:p-5">
          {activeTab === 'news' &&
            (newsItems.length === 0 ? (
              <div className={`rounded-xl border bg-slate-50 px-4 py-8 text-center text-slate-600 ${activeTheme.itemBorder}`}>
                No news available right now.
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
                {newsItems.map((item) => (
                  <Link
                    key={item._id}
                    to={`/news-events/${item.slug || item._id}`}
                    className={`group overflow-hidden rounded-xl border bg-white transition-all ${activeTheme.itemBorder} ${activeTheme.itemHover}`}
                  >
                    <div className="relative overflow-hidden">
                      <img
                        className="h-52 w-full object-cover transition duration-500 group-hover:scale-105"
                        src={optimizeCloudinaryImage(item.image, { width: 960, height: 540, crop: 'fill' }) || 'https://via.placeholder.com/400x300?text=News+Image'}
                        alt={item.title}
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/400x300?text=News+Image';
                        }}
                      />
                      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/55 via-black/15 to-transparent" />
                    </div>

                    <div className="space-y-3 p-4">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ${activeTheme.typeBadge}`}>
                          News
                        </span>
                        <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ${activeTheme.dateBadge}`}>
                          {formatDate(item.date || item.createdAt)}
                        </span>
                      </div>
                      <h3 className="text-base font-semibold text-gray-900 sm:text-lg">{item.title}</h3>
                      <p className="text-sm leading-6 text-gray-600">
                        {truncateText(stripRichText(item.content || ''), 160)}
                      </p>
                      <span className={`inline-flex text-sm font-semibold ${activeTheme.readMoreText}`}>
                        Read more
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            ))}

          {activeTab === 'events' &&
            (upcomingEvents.length === 0 ? (
              <div className={`rounded-xl border bg-slate-50 px-4 py-8 text-center text-slate-600 ${activeTheme.itemBorder}`}>
                No upcoming events right now.
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
                {upcomingEvents.map((item) => {
                  const parsedDate = parseSafeDate(item.startDateTime);
                  const day = parsedDate
                    ? parsedDate.toLocaleDateString('en-IN', { day: '2-digit' })
                    : '--';
                  const month = parsedDate
                    ? parsedDate.toLocaleDateString('en-IN', { month: 'short' }).toUpperCase()
                    : 'TBA';

                  return (
                    <Link
                      key={item._id}
                      to={`/events/${item.slug || item._id}`}
                      className={`group overflow-hidden rounded-xl border bg-white transition-all ${activeTheme.itemBorder} ${activeTheme.itemHover}`}
                    >
                      <div className="relative overflow-hidden">
                        <img
                          className="h-52 w-full object-cover transition duration-500 group-hover:scale-105"
                          src={optimizeCloudinaryImage(item.image, { width: 960, height: 540, crop: 'fill' }) || 'https://via.placeholder.com/400x300?text=Event+Image'}
                          alt={item.title}
                          onError={(e) => {
                            e.target.src = 'https://via.placeholder.com/400x300?text=Event+Image';
                          }}
                        />
                        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/55 via-black/15 to-transparent" />
                        <div className="absolute left-3 top-3 inline-flex items-center gap-2 rounded-lg border border-white/50 bg-white/90 px-2.5 py-1.5">
                          <div className="text-center leading-none">
                            <p className="text-base font-bold text-emerald-900">{day}</p>
                            <p className="mt-0.5 text-[10px] font-semibold tracking-wide text-emerald-700">{month}</p>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-3 p-4">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ${activeTheme.typeBadge}`}>
                            Event
                          </span>
                          <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ${activeTheme.dateBadge}`}>
                            {formatDateTime(item.startDateTime)}
                          </span>
                        </div>
                        <h3 className="text-base font-semibold text-gray-900 sm:text-lg">{item.title}</h3>
                        <p className="text-sm leading-6 text-gray-600">
                          {truncateText(stripRichText(item.description || ''), 150)}
                        </p>
                        <span className={`inline-flex text-sm font-semibold ${activeTheme.readMoreText}`}>
                          View details
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            ))}
        </div>
      </section>
    </div>
  );
};

export default NewsEvents;
