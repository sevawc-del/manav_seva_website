import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import AutoCarousel from '../components/AutoCarousel';
import HeroSection from '../components/HeroSection';
import {
  getAdminActivities,
  getEvents,
  getGallery,
  getJourneys,
  getNews,
  getSponsors,
  getTestimonials
} from '../utils/api';

const Home = () => {
  const HOME_ACTIVITIES_LIMIT = 6;
  const [activities, setActivities] = useState([]);
  const [activitiesLoading, setActivitiesLoading] = useState(true);
  const [journeys, setJourneys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [galleryItems, setGalleryItems] = useState([]);
  const [galleryLoading, setGalleryLoading] = useState(true);
  const [eventItems, setEventItems] = useState([]);
  const [eventsLoading, setEventsLoading] = useState(true);
  const [newsItems, setNewsItems] = useState([]);
  const [newsLoading, setNewsLoading] = useState(true);
  const [testimonials, setTestimonials] = useState([]);
  const [testimonialsLoading, setTestimonialsLoading] = useState(true);
  const [sponsors, setSponsors] = useState([]);
  const [sponsorsLoading, setSponsorsLoading] = useState(true);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const response = await getAdminActivities();
        setActivities(response.data || []);
      } catch (error) {
        console.error('Error fetching activities:', error);
      } finally {
        setActivitiesLoading(false);
      }
    };

    const fetchJourneys = async () => {
      try {
        const response = await getJourneys();
        setJourneys(response.data);
      } catch (error) {
        console.error('Error fetching journeys:', error);
      } finally {
        setLoading(false);
      }
    };

    const fetchGallery = async () => {
      try {
        const response = await getGallery();
        setGalleryItems(response.data || []);
      } catch (error) {
        console.error('Error fetching gallery:', error);
      } finally {
        setGalleryLoading(false);
      }
    };

    const fetchEvents = async () => {
      try {
        const response = await getEvents();
        setEventItems(response.data || []);
      } catch (error) {
        console.error('Error fetching events:', error);
      } finally {
        setEventsLoading(false);
      }
    };

    const fetchNewsItems = async () => {
      try {
        const response = await getNews();
        setNewsItems(response.data || []);
      } catch (error) {
        console.error('Error fetching news:', error);
      } finally {
        setNewsLoading(false);
      }
    };

    const fetchTestimonials = async () => {
      try {
        const response = await getTestimonials();
        setTestimonials(response.data || []);
      } catch (error) {
        console.error('Error fetching testimonials:', error);
      } finally {
        setTestimonialsLoading(false);
      }
    };

    const fetchSponsors = async () => {
      try {
        const response = await getSponsors();
        setSponsors(response.data || []);
      } catch (error) {
        console.error('Error fetching sponsors:', error);
      } finally {
        setSponsorsLoading(false);
      }
    };

    fetchActivities();
    fetchJourneys();
    fetchGallery();
    fetchEvents();
    fetchNewsItems();
    fetchTestimonials();
    fetchSponsors();
  }, []);

  const featuredActivities = useMemo(() => {
    return [...activities]
      .sort((a, b) => {
        const orderA = Number.isFinite(Number(a?.order)) ? Number(a.order) : 0;
        const orderB = Number.isFinite(Number(b?.order)) ? Number(b.order) : 0;
        if (orderA !== orderB) return orderA - orderB;
        const timeA = a?.createdAt ? new Date(a.createdAt).getTime() : 0;
        const timeB = b?.createdAt ? new Date(b.createdAt).getTime() : 0;
        return timeB - timeA;
      })
      .slice(0, HOME_ACTIVITIES_LIMIT);
  }, [activities]);

  const upcomingEvents = useMemo(() => {
    const now = Date.now();
    return [...eventItems]
      .filter((item) => item.startDateTime && new Date(item.startDateTime).getTime() >= now)
      .sort((a, b) => new Date(a.startDateTime) - new Date(b.startDateTime))
      .slice(0, 3);
  }, [eventItems]);

  const latestNews = useMemo(() => {
    return [...newsItems]
      .sort((a, b) => new Date(b.date || b.createdAt || 0) - new Date(a.date || a.createdAt || 0))
      .slice(0, 3);
  }, [newsItems]);

  return (
    <div>
      <HeroSection />
      <div className="container mx-auto px-4 py-8">
        <div className="bg-gradient-to-br from-blue-50 via-white to-indigo-50 rounded-2xl p-6 md:p-8 border border-blue-100 shadow-sm">
          <div className="mb-6">
            <h2 className="text-3xl font-bold text-center">Welcome to Manav Seva Sansthan Seva</h2>
            <div className="mt-3 flex justify-end">
              <Link to="/activities" className="app-btn app-btn-outline">
                See More
              </Link>
            </div>
          </div>

          {activitiesLoading ? (
            <div className="text-center">Loading activities...</div>
          ) : featuredActivities.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredActivities.map((activity) => (
                <Link
                  key={activity._id || activity.slug}
                  to={`/activities/${activity.slug}`}
                  state={{ from: 'home' }}
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
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">{activity.name}</h3>
                    <p className="text-sm text-gray-600">
                      {activity.description
                        ? `${activity.description.slice(0, 90)}${activity.description.length > 90 ? '...' : ''}`
                        : ''}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-500">No activities available yet.</div>
          )}
        </div>

        {/* Journey Section */}
        <div className="mt-16">
          <h2 className="text-3xl font-bold text-center mb-10">Our Journey</h2>
          {loading ? (
            <div className="text-center">Loading journey...</div>
          ) : journeys.length > 0 ? (
            <div className="relative max-w-6xl mx-auto">
              <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-blue-200 md:left-1/2 md:-translate-x-1/2" />

              <div className="space-y-10">
                {journeys.map((journey, index) => {
                  const isLeft = index % 2 === 0;
                  return (
                    <div key={journey._id || `${journey.year}-${index}`} className="relative md:grid md:grid-cols-2 md:gap-8">
                      <div className={`pl-12 md:pl-0 ${isLeft ? 'md:pr-10' : 'md:col-start-2 md:pl-10'}`}>
                        <div className="bg-white p-5 rounded-xl shadow-md border border-blue-100">
                          <h3 className="text-xl font-bold text-blue-700 mb-3">{journey.year}</h3>
                          <ul className="list-disc list-inside space-y-2">
                            {(journey.milestones || []).map((milestone, mIndex) => (
                              <li key={mIndex} className="text-gray-700">{milestone}</li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      <div className="absolute left-4 top-6 w-4 h-4 rounded-full bg-blue-600 border-4 border-white shadow md:left-1/2 md:-translate-x-1/2" />
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="text-center text-gray-500">No journey data available yet.</div>
          )}
        </div>

        {/* Gallery Section */}
        <div className="mt-16">
          <div className="mb-6">
            <h2 className="text-3xl font-bold text-center">Gallery</h2>
            <div className="mt-3 flex justify-end">
              <Link to="/gallery" className="app-btn app-btn-outline">
                See More
              </Link>
            </div>
          </div>

          {galleryLoading ? (
            <div className="text-center">Loading gallery...</div>
          ) : galleryItems.length > 0 ? (
            <AutoCarousel
              items={galleryItems}
              loading={galleryLoading}
              emptyMessage="No gallery images available yet."
              renderItem={(item) => (
                <Link
                  to={`/gallery/${item._id}`}
                  state={{ from: 'home' }}
                  className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow block"
                >
                  <img
                    src={item.image || 'https://via.placeholder.com/400x260?text=Image+Not+Available'}
                    alt={item.title || 'Gallery image'}
                    className="w-full h-52 object-cover"
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/400x260?text=Image+Not+Available';
                    }}
                  />
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 mb-1">{item.title || 'Gallery Image'}</h3>
                    <p className="text-sm text-gray-600">
                      {item.description ? `${item.description.slice(0, 15)}${item.description.length > 15 ? '...' : ''}` : ''}
                    </p>
                  </div>
                </Link>
              )}
            />
          ) : (
            <div className="text-center text-gray-500">No gallery images available yet.</div>
          )}
        </div>

        {/* Upcoming Events Section */}
        <div className="mt-16">
          <div className="mb-6">
            <h2 className="text-3xl font-bold text-center">Upcoming Events</h2>
            <div className="mt-3 flex justify-end">
              <Link to="/news-events?tab=events" className="app-btn app-btn-outline">
                See More
              </Link>
            </div>
          </div>
          {eventsLoading ? (
            <div className="text-center">Loading events...</div>
          ) : upcomingEvents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {upcomingEvents.map((item) => (
                <Link
                  key={item._id}
                  to={`/events/${item.slug}`}
                  className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow block"
                >
                  <img
                    src={item.image || 'https://via.placeholder.com/400x260?text=Event+Image'}
                    alt={item.title}
                    className="w-full h-52 object-cover"
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/400x260?text=Event+Image';
                    }}
                  />
                  <div className="p-4">
                    <p className="text-sm text-gray-500 mb-1">{item.startDateTime ? new Date(item.startDateTime).toLocaleString() : 'Date not available'}</p>
                    <h3 className="font-semibold text-gray-900 mb-1">{item.title}</h3>
                    <p className="text-sm text-gray-600">{item.description ? `${item.description.slice(0, 80)}${item.description.length > 80 ? '...' : ''}` : ''}</p>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-500">No upcoming events available.</div>
          )}
        </div>

        {/* Latest News Section */}
        <div className="mt-16">
          <div className="mb-6">
            <h2 className="text-3xl font-bold text-center">Latest News</h2>
            <div className="mt-3 flex justify-end">
              <Link to="/news-events?tab=news" className="app-btn app-btn-outline">
                See More
              </Link>
            </div>
          </div>
          {newsLoading ? (
            <div className="text-center">Loading news...</div>
          ) : latestNews.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {latestNews.map((item) => (
                <Link
                  key={item._id}
                  to={`/news-events/${item.slug || item._id}`}
                  className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow block"
                >
                  <img
                    src={item.image || 'https://via.placeholder.com/400x260?text=News+Image'}
                    alt={item.title}
                    className="w-full h-52 object-cover"
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/400x260?text=News+Image';
                    }}
                  />
                  <div className="p-4">
                    <p className="text-sm text-gray-500 mb-1">{(item.date || item.createdAt) ? new Date(item.date || item.createdAt).toLocaleDateString() : 'Date not available'}</p>
                    <h3 className="font-semibold text-gray-900 mb-1">{item.title}</h3>
                    <p className="text-sm text-gray-600">{item.content ? `${item.content.slice(0, 80)}${item.content.length > 80 ? '...' : ''}` : ''}</p>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-500">No news available.</div>
          )}
        </div>

        {/* Testimonials Section */}
        <div className="mt-16">
          <h2 className="text-3xl font-bold text-center mb-6">What People Say</h2>
          {testimonialsLoading ? (
            <div className="text-center">Loading testimonials...</div>
          ) : testimonials.length > 0 ? (
            <AutoCarousel
              items={testimonials}
              loading={testimonialsLoading}
              emptyMessage="No testimonials available yet."
              intervalMs={4500}
              renderItem={(item) => (
                <div className="bg-white rounded-xl shadow-md border border-gray-100 p-5 h-full">
                  <p className="text-gray-700 mb-4 italic">"{item.quote}"</p>
                  <h3 className="font-semibold text-gray-900">{item.name}</h3>
                  <p className="text-sm text-gray-600">
                    {[item.designation, item.location].filter(Boolean).join(', ')}
                  </p>
                </div>
              )}
            />
          ) : (
            <div className="text-center text-gray-500">No testimonials available yet.</div>
          )}
        </div>

        {/* Sponsors Section */}
        <div className="mt-16">
          <h2 className="text-3xl font-bold text-center mb-6">Our Sponsors</h2>
          {sponsorsLoading ? (
            <div className="text-center">Loading sponsors...</div>
          ) : sponsors.length > 0 ? (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {sponsors.map((item) => (
                  item.website ? (
                    <a
                      key={item._id}
                      href={item.website}
                      target="_blank"
                      rel="noreferrer"
                      className="h-24 bg-white border border-gray-200 rounded-xl shadow-sm p-4 flex items-center justify-center transition hover:shadow-md"
                    >
                      <img
                        src={item.logo}
                        alt={item.name}
                        className="max-h-12 w-full object-contain grayscale hover:grayscale-0 transition"
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/220x80?text=Sponsor';
                        }}
                      />
                    </a>
                  ) : (
                    <div
                      key={item._id}
                      className="h-24 bg-white border border-gray-200 rounded-xl shadow-sm p-4 flex items-center justify-center"
                    >
                      <img
                        src={item.logo}
                        alt={item.name}
                        className="max-h-12 w-full object-contain grayscale"
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/220x80?text=Sponsor';
                        }}
                      />
                    </div>
                  )
                ))}
              </div>

              {sponsors.length > 6 && (
                <div className="mt-8">
                  <AutoCarousel
                    items={sponsors}
                    intervalMs={3200}
                    renderItem={(item) => (
                      item.website ? (
                        <a
                          href={item.website}
                          target="_blank"
                          rel="noreferrer"
                          className="h-24 bg-white border border-gray-200 rounded-xl shadow-sm p-4 flex items-center justify-center"
                        >
                          <img
                            src={item.logo}
                            alt={item.name}
                            className="max-h-12 w-full object-contain grayscale hover:grayscale-0 transition"
                            onError={(e) => {
                              e.target.src = 'https://via.placeholder.com/220x80?text=Sponsor';
                            }}
                          />
                        </a>
                      ) : (
                        <div className="h-24 bg-white border border-gray-200 rounded-xl shadow-sm p-4 flex items-center justify-center">
                          <img
                            src={item.logo}
                            alt={item.name}
                            className="max-h-12 w-full object-contain grayscale"
                            onError={(e) => {
                              e.target.src = 'https://via.placeholder.com/220x80?text=Sponsor';
                            }}
                          />
                        </div>
                      )
                    )}
                  />
                </div>
              )}
            </>
          ) : (
            <div className="text-center text-gray-500">No sponsors available yet.</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;
