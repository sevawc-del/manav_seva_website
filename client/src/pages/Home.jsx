import React, { Suspense, lazy, useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import HeroSection from '../components/HeroSection';
import Journey from '../components/home/Journey';
import Testimonials from '../components/home/Testimonials';
import Sponsors from '../components/home/Sponsors';
import OfficesMap from '../components/home/OfficesMap';
import {
  getAboutUs,
  getAdminActivities,
  getEvents,
  getGallery,
  getJourneys,
  getNews,
  getSiteSettingsCached,
  getSponsors,
  getTestimonials
} from '../utils/api';
import { stripRichText } from '../utils/richContent';
import { optimizeCloudinaryImage } from '../utils/imageUrl';

const HomeStateMap = lazy(() => import('../components/HomeStateMap'));

const HOME_ACTIVITIES_LIMIT = 6;
const HOME_ACTIVITIES_LIMIT_TABLET = 4;
const HOME_ACTIVITIES_LIMIT_MOBILE = 3;
const HOME_EVENTS_LIMIT = 4;
const HOME_GALLERY_ITEMS_PER_ROW = 10;
const GALLERY_MARQUEE_DUPLICATE_LIMIT = 5;
const NEWS_MARQUEE_DUPLICATE_LIMIT = 5;
const NEWS_MARQUEE_MIN_DURATION = 8;
const NEWS_MARQUEE_PER_ITEM_DURATION = 2;
const HOME_GEO_STATUS_CURRENT = 'currently_working';
const HOME_GEO_STATUS_PREVIOUS = 'previously_worked';
const ACTIVITY_PATHWAY_WORD_LIMIT = 24;

const truncateText = (text = '', maxLength = 90) => {
  if (!text) return '';
  return text.length > maxLength ? `${text.slice(0, maxLength)}...` : text;
};

const truncateWords = (text = '', maxWords = 24) => {
  const cleaned = String(text || '').trim();
  if (!cleaned) return '';
  const words = cleaned.split(/\s+/);
  return words.length > maxWords ? `${words.slice(0, maxWords).join(' ')}...` : cleaned;
};

const parseSafeDate = (value) => {
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const formatDate = (value, options) => {
  const parsed = parseSafeDate(value);
  return parsed ? parsed.toLocaleDateString('en-IN', options) : 'Date not available';
};

const formatDateTime = (value) => {
  const parsed = parseSafeDate(value);
  return parsed ? parsed.toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) : 'Date not available';
};

const getNumericImpact = (impactValue = '') => {
  const normalized = String(impactValue).replace(/,/g, '').replace(/[^\d.]/g, '');
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
};

const getActivityProblem = (activity) => {
  const problem = stripRichText(activity?.problem || activity?.description || '');
  return truncateWords(problem || 'A local challenge was identified by our team.', ACTIVITY_PATHWAY_WORD_LIMIT);
};

const getActivityAction = (activity) => {
  const action = stripRichText(activity?.action || activity?.content || activity?.description || '');
  return truncateWords(action || 'Local volunteers and staff delivered focused interventions.', ACTIVITY_PATHWAY_WORD_LIMIT);
};

const getActivityResult = (activity) => {
  const result = stripRichText(activity?.result || '');
  return truncateWords(result || 'Impact summary is being updated as the program continues.', ACTIVITY_PATHWAY_WORD_LIMIT);
};

const normalizeStateName = (value = '') =>
  String(value).trim().replace(/\s+/g, ' ').toUpperCase();

const DEFAULT_HOME_WHO_SETTINGS = {
  chairpersonName: 'Chairperson',
  chairpersonImageUrl: '',
  homeWhoTitle: 'Who are we?',
  homeWhoLeftText:
    'Manav Seva Sansthan SEVA is a not-for-profit organization working for inclusive socio-economic development across vulnerable communities.',
  homeWhoRightTitle: 'In Focus',
  homeWhoRightText:
    'Our programs and collaborations are designed to create long-term impact through community-led action.',
  homeWhoRightImageUrl: '',
  homeGeographicFocusStates: [],
  homeGeographicFocusDescription:
    'States are color-coded to reflect current and past program presence. Use the toggles to filter.'
};

const DEFAULT_HOME_OFFICES = [
  {
    id: 'gorakhpur-head-office',
    name: 'Head Office',
    city: 'Gorakhpur',
    address: 'Vikas Nagar Colony, Bargadwa, P.O. Fertilizer, Gorakhpur-273007 (U.P.), India',
    lat: 26.8050913,
    lng: 83.3548241,
    googleMapsUrl:
      'https://www.google.com/maps/place/Manav+Seva+Sansthan+SEVA/@26.8047121,83.3523656,18z/data=!4m6!3m5!1s0x39914a4000000007:0x7650ce5dac4123f2!8m2!3d26.8050913!4d83.3548241!16s%2Fg%2F11c1xczdgj?entry=ttu&g_ep=EgoyMDI2MDMzMC4wIKXMDSoASAFQAw'
  },
  {
    id: 'new-delhi-branch-office',
    name: 'Branch Office',
    city: 'New Delhi',
    address: 'K68 BK dutt Colony, Jor Bagh, New Delhi, 110003',
    lat: 28.5839672,
    lng: 77.2168207,
    googleMapsUrl:
      'https://www.google.com/maps/place/K-82+B.K.+Dutt+Colony,+Jor+Bagh/@28.5839791,77.2140859,17z/data=!3m1!4b1!4m6!3m5!1s0x390ce3ae76a5fe45:0x6ac91b5de8746a68!8m2!3d28.5839791!4d77.2166608!16s%2Fg%2F11kpvr3p49?entry=ttu&g_ep=EgoyMDI2MDMzMC4wIKXMDSoASAFQAw%3D%3D'
  }
];

const GalleryAutoRow = ({ items, direction = 'left' }) => {
  const [isPaused, setIsPaused] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const hasLoop = items.length > 1;
  const canDuplicate = items.length <= GALLERY_MARQUEE_DUPLICATE_LIMIT;
  const shouldAnimate = hasLoop && !prefersReducedMotion;
  const shouldDuplicate = shouldAnimate && canDuplicate;
  const durationSeconds = Math.max(6, items.length * 3.8);
  const animationName = direction === 'right'
    ? shouldDuplicate
      ? 'gallery-marquee-right'
      : 'gallery-marquee-right-single'
    : shouldDuplicate
      ? 'gallery-marquee-left'
      : 'gallery-marquee-left-single';

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return undefined;
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const syncPreference = () => setPrefersReducedMotion(mediaQuery.matches);
    syncPreference();

    if (typeof mediaQuery.addEventListener === 'function') {
      mediaQuery.addEventListener('change', syncPreference);
      return () => mediaQuery.removeEventListener('change', syncPreference);
    }

    mediaQuery.addListener(syncPreference);
    return () => mediaQuery.removeListener(syncPreference);
  }, []);

  if (!items.length) return null;

  return (
    <div
      className={`pb-2 ${shouldAnimate ? 'overflow-hidden' : 'overflow-x-auto no-scrollbar'}`}
      onMouseEnter={() => shouldAnimate && setIsPaused(true)}
      onMouseLeave={() => shouldAnimate && setIsPaused(false)}
      onTouchStart={() => shouldAnimate && setIsPaused(true)}
      onTouchEnd={() => shouldAnimate && setIsPaused(false)}
      onTouchCancel={() => shouldAnimate && setIsPaused(false)}
    >
      <div
        className="flex w-max gap-0"
        style={{
          animation: shouldAnimate ? `${animationName} ${durationSeconds}s linear infinite` : 'none',
          animationPlayState: isPaused ? 'paused' : 'running'
        }}
      >
        {(shouldDuplicate ? [0, 1] : [0]).map((copyIndex) => (
          <div key={`gallery-copy-${copyIndex}`} className="flex gap-4 pr-4">
            {items.map((item, index) => (
              <Link
                key={`${item._id || item.image || 'gallery'}-${copyIndex}-${index}`}
                to={`/gallery/${item._id}`}
                state={{ from: 'home' }}
                className="group relative block w-[19rem] sm:w-[21rem] md:w-[24rem] lg:w-[26rem] xl:w-[30rem] 2xl:w-[33rem] aspect-[16/10] shrink-0 overflow-hidden rounded-xl border border-gray-200 shadow-sm transition-transform duration-300 hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ngo-primary)] focus-visible:ring-offset-2"
              >
                <img
                  src={optimizeCloudinaryImage(item.image, { width: 1200, height: 750, crop: 'fill' }) || 'https://via.placeholder.com/640x420?text=Image+Not+Available'}
                  alt={item.title || 'Gallery image'}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                  decoding="async"
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/640x420?text=Image+Not+Available';
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                <div className="absolute bottom-0 p-3 text-white">
                  <h4 className="text-sm font-semibold leading-tight">{item.title || 'Gallery Image'}</h4>
                  <p className="mt-1 text-xs text-gray-200">
                    {truncateText(item.description || formatDate(item.date || item.createdAt), 44)}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

const VerticalNewsTicker = ({ items = [] }) => {
  const [isPaused, setIsPaused] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const hasLoop = items.length > 1;
  const canDuplicate = items.length <= NEWS_MARQUEE_DUPLICATE_LIMIT;
  const shouldAnimate = hasLoop && !prefersReducedMotion;
  const shouldDuplicate = shouldAnimate && canDuplicate;
  const durationSeconds = Math.max(
    NEWS_MARQUEE_MIN_DURATION,
    items.length * NEWS_MARQUEE_PER_ITEM_DURATION
  );

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return undefined;
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const syncPreference = () => setPrefersReducedMotion(mediaQuery.matches);
    syncPreference();

    if (typeof mediaQuery.addEventListener === 'function') {
      mediaQuery.addEventListener('change', syncPreference);
      return () => mediaQuery.removeEventListener('change', syncPreference);
    }

    mediaQuery.addListener(syncPreference);
    return () => mediaQuery.removeListener(syncPreference);
  }, []);

  if (!items.length) return null;

  return (
    <div
      className={`h-64 md:h-72 border-t border-gray-100 ${
        shouldAnimate ? 'overflow-hidden' : 'overflow-y-auto no-scrollbar'
      }`}
      onMouseEnter={() => shouldAnimate && setIsPaused(true)}
      onMouseLeave={() => shouldAnimate && setIsPaused(false)}
      onTouchStart={() => shouldAnimate && setIsPaused(true)}
      onTouchEnd={() => shouldAnimate && setIsPaused(false)}
      onTouchCancel={() => shouldAnimate && setIsPaused(false)}
    >
      <div
        className="flex flex-col"
        style={{
          animation: shouldAnimate
            ? `${shouldDuplicate ? 'news-marquee-vertical' : 'news-marquee-vertical-single'} ${durationSeconds}s linear infinite`
            : 'none',
          animationPlayState: isPaused ? 'paused' : 'running'
        }}
      >
        {(shouldDuplicate ? [0, 1] : [0]).map((copyIndex) => (
          <div key={`news-copy-${copyIndex}`} className="flex flex-col">
            {items.map((item, index) => {
              const rowIndex = copyIndex * items.length + index;
              const rowClass = rowIndex % 2 === 0 ? 'bg-slate-50' : 'bg-white';
              return (
              <Link
                key={`${item._id || item.slug || 'news'}-${copyIndex}-${index}`}
                to={`/news-events/${item.slug || item._id}`}
                className={`${rowClass} flex items-start gap-3 px-5 py-4 border-b border-gray-100`}
              >
                <div className="w-2 h-2 rounded-full bg-[var(--ngo-primary)] mt-2 shrink-0" />
                <div>
                  <p className="text-xs uppercase tracking-wide text-gray-500">
                    {formatDate(item.date || item.createdAt)}
                  </p>
                  <h5 className="text-sm font-semibold text-gray-900">{truncateText(item.title, 120)}</h5>
                </div>
              </Link>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};

const Home = () => {
  const [aboutUs, setAboutUs] = useState(null);
  const [aboutLoading, setAboutLoading] = useState(true);
  const [siteSettings, setSiteSettings] = useState(DEFAULT_HOME_WHO_SETTINGS);
  const [siteSettingsLoading, setSiteSettingsLoading] = useState(true);
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
  const [showCurrentStates, setShowCurrentStates] = useState(true);
  const [showPreviousStates, setShowPreviousStates] = useState(true);
  const [activitySort, setActivitySort] = useState('priority');
  const [activitiesLimit, setActivitiesLimit] = useState(HOME_ACTIVITIES_LIMIT);
  const [expandedActivityId, setExpandedActivityId] = useState(null);
  const [mobileFeedTab, setMobileFeedTab] = useState('news');
  const [selectedOfficeId, setSelectedOfficeId] = useState('all');

  useEffect(() => {
    const fetchSiteSettingsData = async () => {
      try {
        const response = await getSiteSettingsCached();
        setSiteSettings({ ...DEFAULT_HOME_WHO_SETTINGS, ...(response.data || {}) });
      } catch (error) {
        console.error('Error fetching site settings:', error);
      } finally {
        setSiteSettingsLoading(false);
      }
    };

    const fetchAboutSection = async () => {
      try {
        const response = await getAboutUs();
        setAboutUs(response.data || null);
      } catch (error) {
        console.error('Error fetching about section:', error);
      } finally {
        setAboutLoading(false);
      }
    };

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

    fetchSiteSettingsData();
    fetchAboutSection();
    fetchActivities();
    fetchJourneys();
    fetchGallery();
    fetchEvents();
    fetchNewsItems();
    fetchTestimonials();
    fetchSponsors();
  }, []);

  useEffect(() => {
    const updateActivitiesLimit = () => {
      if (window.innerWidth < 640) {
        setActivitiesLimit(HOME_ACTIVITIES_LIMIT_MOBILE);
        return;
      }
      if (window.innerWidth < 1024) {
        setActivitiesLimit(HOME_ACTIVITIES_LIMIT_TABLET);
        return;
      }
      setActivitiesLimit(HOME_ACTIVITIES_LIMIT);
    };

    updateActivitiesLimit();
    window.addEventListener('resize', updateActivitiesLimit);
    return () => window.removeEventListener('resize', updateActivitiesLimit);
  }, []);

  const impactShowcaseActivities = useMemo(() => {
    const sorted = [...activities];

    if (activitySort === 'latest') {
      sorted.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    } else if (activitySort === 'highest-impact') {
      sorted.sort((a, b) => getNumericImpact(b.impactNumber) - getNumericImpact(a.impactNumber));
    } else if (activitySort === 'a-z') {
      sorted.sort((a, b) => (a?.name || '').localeCompare(b?.name || ''));
    } else {
      sorted.sort((a, b) => {
        const orderA = Number.isFinite(Number(a?.order)) ? Number(a.order) : 0;
        const orderB = Number.isFinite(Number(b?.order)) ? Number(b.order) : 0;
        if (orderA !== orderB) return orderA - orderB;
        const timeA = a?.createdAt ? new Date(a.createdAt).getTime() : 0;
        const timeB = b?.createdAt ? new Date(b.createdAt).getTime() : 0;
        return timeB - timeA;
      });
    }

    return sorted.slice(0, activitiesLimit);
  }, [activities, activitySort, activitiesLimit]);

  const activitySortOptions = [
    { id: 'priority', label: 'Priority' },
    { id: 'latest', label: 'Latest' },
    { id: 'highest-impact', label: 'Highest Impact' },
    { id: 'a-z', label: 'A-Z' }
  ];

  const homeGalleryRows = useMemo(() => {
    const selectedItems = [...galleryItems]
      .filter((item) => item?.showOnHome !== false)
      .sort((a, b) => new Date(b.date || b.createdAt || 0) - new Date(a.date || a.createdAt || 0))
      .slice(0, HOME_GALLERY_ITEMS_PER_ROW * 2);

    return [
      selectedItems.slice(0, HOME_GALLERY_ITEMS_PER_ROW),
      selectedItems.slice(HOME_GALLERY_ITEMS_PER_ROW, HOME_GALLERY_ITEMS_PER_ROW * 2)
    ];
  }, [galleryItems]);

  const upcomingEvents = useMemo(() => {
    const now = Date.now();
    return [...eventItems]
      .filter((item) => item.startDateTime && new Date(item.startDateTime).getTime() >= now)
      .sort((a, b) => new Date(a.startDateTime) - new Date(b.startDateTime))
      .slice(0, HOME_EVENTS_LIMIT);
  }, [eventItems]);

  const sortedNews = useMemo(() => {
    return [...newsItems]
      .sort((a, b) => new Date(b.date || b.createdAt || 0) - new Date(a.date || a.createdAt || 0));
  }, [newsItems]);

  const featuredNews = sortedNews[0];
  const sideNews = sortedNews.slice(1);
  const leftSummary = truncateText(
    stripRichText(siteSettings.homeWhoLeftText || aboutUs?.content || ''),
    420
  );
  const rightSummary = truncateText(
    stripRichText(siteSettings.homeWhoRightText || aboutUs?.content || ''),
    160
  );
  const whoSectionTitle = siteSettings.homeWhoTitle || DEFAULT_HOME_WHO_SETTINGS.homeWhoTitle;
  const rightCardTitle = siteSettings.homeWhoRightTitle || DEFAULT_HOME_WHO_SETTINGS.homeWhoRightTitle;
  const chairpersonName = siteSettings.chairpersonName || DEFAULT_HOME_WHO_SETTINGS.chairpersonName;
  const leftImageUrl = siteSettings.chairpersonImageUrl || aboutUs?.image || '';
  const rightImageUrl = siteSettings.homeWhoRightImageUrl || aboutUs?.image || '';
  const isWhoSectionLoading = aboutLoading || siteSettingsLoading;
  const officeLocations = useMemo(() => {
    const source = Array.isArray(siteSettings?.homeOfficeLocations)
      ? siteSettings.homeOfficeLocations
      : DEFAULT_HOME_OFFICES;

    const normalized = source
      .map((office, index) => {
        const rawId = String(office?.id || '').trim();
        const safeId = rawId && rawId.toLowerCase() !== 'all' ? rawId : `office-${index + 1}`;

        return {
          id: safeId,
          name: String(office?.name || '').trim(),
          city: String(office?.city || '').trim(),
          address: String(office?.address || '').trim(),
          lat: Number(office?.lat),
          lng: Number(office?.lng),
          googleMapsUrl: String(office?.googleMapsUrl || '').trim()
        };
      })
      .filter((office) => office.name && office.city && Number.isFinite(office.lat) && Number.isFinite(office.lng));

    return normalized.length > 0 ? normalized : DEFAULT_HOME_OFFICES;
  }, [siteSettings?.homeOfficeLocations]);

  const homeGeographicStates = useMemo(() => {
    const source = Array.isArray(siteSettings?.homeGeographicFocusStates)
      ? siteSettings.homeGeographicFocusStates
      : [];

    const deduped = new Map();
    source.forEach((item) => {
      const state = String(item?.state || '').trim();
      if (!state) return;

      const normalizedState = normalizeStateName(state);
      if (!normalizedState) return;

      const status = item?.status === HOME_GEO_STATUS_PREVIOUS
        ? HOME_GEO_STATUS_PREVIOUS
        : HOME_GEO_STATUS_CURRENT;

      deduped.set(normalizedState, { state, status });
    });

    return Array.from(deduped.values());
  }, [siteSettings?.homeGeographicFocusStates]);

  const filteredHomeGeographicStates = useMemo(() => (
    homeGeographicStates.filter((item) => {
      if (item.status === HOME_GEO_STATUS_CURRENT) return showCurrentStates;
      if (item.status === HOME_GEO_STATUS_PREVIOUS) return showPreviousStates;
      return false;
    })
  ), [homeGeographicStates, showCurrentStates, showPreviousStates]);

  const currentHomeGeographicStates = useMemo(
    () => filteredHomeGeographicStates.filter((item) => item.status === HOME_GEO_STATUS_CURRENT),
    [filteredHomeGeographicStates]
  );

  const previousHomeGeographicStates = useMemo(
    () => filteredHomeGeographicStates.filter((item) => item.status === HOME_GEO_STATUS_PREVIOUS),
    [filteredHomeGeographicStates]
  );

  useEffect(() => {
    if (selectedOfficeId === 'all') return;
    const officeExists = officeLocations.some((office) => office.id === selectedOfficeId);
    if (!officeExists) {
      setSelectedOfficeId('all');
    }
  }, [officeLocations, selectedOfficeId]);

  return (
    <div>
      <HeroSection />
      <div className="container mx-auto px-4 py-8">
        <div>
          <div className="mb-6 rounded-2xl bg-gradient-to-r from-[var(--ngo-primary)] to-[var(--ngo-primary-strong)] px-5 py-5 md:px-6">
            <div>
              <h2 className="text-3xl font-bold text-center text-white md:text-left">Welcome to Manav Seva Sansthan Seva</h2>
              <p className="mt-2 text-sm text-white/90 text-center md:text-left">
                Explore each initiative through problem-action-result snapshots to understand how every program creates measurable change.
              </p>
            </div>
            <div className="mt-4 flex flex-wrap justify-center md:justify-between items-center gap-3">
              <div className="flex flex-wrap items-center gap-2">
                {activitySortOptions.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => setActivitySort(option.id)}
                    className={`px-3 py-1.5 rounded-full border text-sm font-medium transition ${
                      activitySort === option.id
                        ? 'bg-white text-[var(--ngo-primary)] border-white shadow-sm'
                        : 'bg-white/15 text-white border-white/40 hover:bg-white/25'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
              <Link
                to="/activities"
                className="inline-flex items-center rounded-md border border-white bg-white px-4 py-2 text-sm font-semibold text-[var(--ngo-primary)] shadow-sm transition hover:bg-slate-100"
              >
                See More
              </Link>
            </div>
          </div>

          {activitiesLoading ? (
            <div className="text-center">Loading activities...</div>
          ) : impactShowcaseActivities.length > 0 ? (
            <div className="space-y-5">
              {impactShowcaseActivities.map((activity) => {
                const activityKey = activity._id || activity.slug;
                const isExpanded = expandedActivityId === activityKey;

                return (
                  <React.Fragment key={activityKey}>
                    <Link
                      to={`/activities/${activity.slug}`}
                      state={{ from: 'home' }}
                      className="hidden md:block group bg-white rounded-2xl shadow-sm border border-[var(--ngo-border)] overflow-hidden transition-all hover:-translate-y-0.5 hover:shadow-lg"
                    >
                      <div className="lg:grid lg:grid-cols-[15rem_1fr]">
                        <img
                          src={optimizeCloudinaryImage(activity.image, { width: 960, height: 560, crop: 'fill' }) || 'https://via.placeholder.com/600x360?text=Activity+Image'}
                          alt={activity.name}
                          className="w-full h-56 lg:h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          loading="lazy"
                          decoding="async"
                          onError={(e) => {
                            e.target.src = 'https://via.placeholder.com/600x360?text=Activity+Image';
                          }}
                        />
                        <div className="p-5">
                          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                            <div>
                              <h3 className="text-xl font-semibold text-gray-900">{activity.name}</h3>
                              <p className="text-sm text-gray-600 mt-1">Impact Pathway</p>
                            </div>
                            <div className="inline-flex items-center rounded-full bg-slate-50 px-3 py-1 border border-[var(--ngo-border)]">
                              <span className="text-xs uppercase tracking-wide text-[var(--ngo-primary)] font-semibold mr-2">Impact</span>
                              <span className="text-sm font-bold text-[var(--ngo-primary)]">{activity.impactNumber || 'Updating'}</span>
                            </div>
                          </div>

                          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
                            <div className="rounded-xl border p-3 par-card-problem">
                              <p className="text-[11px] uppercase tracking-wide font-semibold par-label-problem">Challenge</p>
                              <p className="mt-1 text-sm text-slate-900">{getActivityProblem(activity)}</p>
                            </div>
                            <div className="rounded-xl border p-3 par-card-action">
                              <p className="text-[11px] uppercase tracking-wide font-semibold par-label-action">Intervention</p>
                              <p className="mt-1 text-sm text-[var(--ngo-primary)]">{getActivityAction(activity)}</p>
                            </div>
                            <div className="rounded-xl border p-3 par-card-result">
                              <p className="text-[11px] uppercase tracking-wide font-semibold par-label-result">Impact</p>
                              <p className="mt-1 text-sm text-[var(--ngo-secondary)]">{getActivityResult(activity)}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>

                    <div className="md:hidden bg-white rounded-2xl shadow-sm border border-[var(--ngo-border)] overflow-hidden">
                      <img
                        src={optimizeCloudinaryImage(activity.image, { width: 900, height: 540, crop: 'fill' }) || 'https://via.placeholder.com/600x360?text=Activity+Image'}
                        alt={activity.name}
                        className="w-full h-44 object-cover"
                        loading="lazy"
                        decoding="async"
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/600x360?text=Activity+Image';
                        }}
                      />
                      <div className="p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">{activity.name}</h3>
                            <p className="text-xs text-gray-600 mt-1">Impact Pathway</p>
                          </div>
                          <div className="inline-flex items-center rounded-full bg-slate-50 px-3 py-1 border border-[var(--ngo-border)]">
                            <span className="text-xs font-semibold text-[var(--ngo-primary)]">{activity.impactNumber || 'Updating'}</span>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => setExpandedActivityId((prev) => (prev === activityKey ? null : activityKey))}
                          className="mt-3 w-full py-2 rounded-lg border border-[var(--ngo-border)] text-[var(--ngo-primary)] text-sm font-medium bg-slate-50"
                        >
                          {isExpanded ? 'Hide details' : 'Show details'}
                        </button>

                        {isExpanded && (
                          <div className="mt-3 space-y-2">
                            <div className="rounded-lg border p-2.5 par-card-problem">
                              <p className="text-[11px] uppercase tracking-wide font-semibold par-label-problem">Challenge</p>
                              <p className="mt-1 text-xs text-slate-900">{getActivityProblem(activity)}</p>
                            </div>
                            <div className="rounded-lg border p-2.5 par-card-action">
                              <p className="text-[11px] uppercase tracking-wide font-semibold par-label-action">Intervention</p>
                              <p className="mt-1 text-xs text-[var(--ngo-primary)]">{getActivityAction(activity)}</p>
                            </div>
                            <div className="rounded-lg border p-2.5 par-card-result">
                              <p className="text-[11px] uppercase tracking-wide font-semibold par-label-result">Impact</p>
                              <p className="mt-1 text-xs text-[var(--ngo-secondary)]">{getActivityResult(activity)}</p>
                            </div>
                          </div>
                        )}

                        <Link
                          to={`/activities/${activity.slug}`}
                          state={{ from: 'home' }}
                          className="mt-3 app-btn app-btn-outline w-full"
                        >
                          View Activity
                        </Link>
                      </div>
                    </div>
                  </React.Fragment>
                );
              })}

              <div className="hidden md:flex justify-end pt-2">
                <Link to="/activities" className="app-btn app-btn-primary">
                  See More Activities
                </Link>
              </div>

              <div className="md:hidden sticky bottom-3 z-20 pt-1">
                <Link to="/activities" className="app-btn app-btn-primary w-full shadow-lg">
                  View All Activities
                </Link>
              </div>
            </div>
          ) : (
            <div className="text-center text-gray-500">No activities available yet.</div>
          )}
        </div>

        {/* Who We Are Section */}
        <div className="mt-12 overflow-hidden rounded-2xl">
          <div className="bg-gradient-to-r from-[var(--ngo-primary)] to-[var(--ngo-primary-strong)] px-5 py-4">
            <h2 className="text-3xl font-bold text-center text-white md:text-left">Our Identity</h2>
            <p className="mt-2 text-sm text-center text-white/90 md:text-left">
              Know our story, leadership vision, and mission.
            </p>
          </div>

          <div className="relative bg-[#f3f3f5] p-5 md:p-8 xl:p-8">
            <div className="absolute -left-24 top-24 h-56 w-56 rounded-full bg-[#eadfcf] opacity-80" />
            <div className="absolute -right-20 -bottom-20 h-64 w-64 rounded-full bg-[#eadfcf] opacity-85" />

            {isWhoSectionLoading ? (
              <div className="text-center text-gray-600">Loading about section...</div>
            ) : (
              <div className="relative grid grid-cols-1 xl:grid-cols-[1.15fr_1.35fr] gap-6 xl:gap-6 items-start">
                <div className="bg-white/65 backdrop-blur-[1px] border border-dashed border-gray-300 rounded-xl p-6 md:p-8 xl:px-8 xl:py-7 flex flex-col items-center text-center md:min-h-[420px] lg:min-h-[430px] xl:min-h-[500px]">
                  <div className="h-28 w-28 xl:h-40 xl:w-40 rounded-full overflow-hidden border-4 border-white shadow-md">
                    <img
                      src={optimizeCloudinaryImage(leftImageUrl, { width: 480, height: 480, crop: 'fill' }) || 'https://via.placeholder.com/280x280?text=Chairperson'}
                      alt={chairpersonName}
                      className="w-full h-full object-cover"
                      loading="lazy"
                      decoding="async"
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/280x280?text=Chairperson';
                      }}
                    />
                  </div>
                  <p className="mt-4 text-sm uppercase tracking-wide text-gray-500">{chairpersonName}</p>
                  <h2 className="mt-3 text-4xl font-bold text-gray-900">{whoSectionTitle}</h2>
                  <p className="mt-4 text-base leading-8 text-gray-700 max-w-md xl:max-w-lg">
                    {leftSummary || 'We are a non-profit organization committed to community-led development and long-term social impact.'}
                  </p>
                  <div className="mt-6">
                    <Link to="/about/about-us" className="app-btn app-btn-outline">
                      Read Full Story
                    </Link>
                  </div>
                </div>

                <div className="rounded-xl overflow-hidden min-h-[280px] md:min-h-[440px] lg:min-h-[450px] xl:min-h-[530px] shadow-md border border-gray-200 bg-black/5 flex flex-col">
                  <div className="h-[70%] md:h-64 lg:h-72 xl:h-[26rem] shrink-0">
                    <img
                      src={optimizeCloudinaryImage(rightImageUrl, { width: 1600, height: 900, crop: 'fill' }) || 'https://via.placeholder.com/1200x700?text=Program+Highlight'}
                      alt={rightCardTitle || 'Program highlight'}
                      className="w-full h-full object-cover"
                      loading="lazy"
                      decoding="async"
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/1200x700?text=Program+Highlight';
                      }}
                    />
                  </div>
                  <div className="h-[30%] md:h-auto flex-1 bg-white px-5 py-4 xl:px-6 xl:py-5 border-t border-gray-100">
                    <h3 className="text-xl font-semibold text-gray-900">{rightCardTitle}</h3>
                    <p className="mt-1 text-sm text-gray-600">{rightSummary}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Journey Section */}
        <Journey loading={loading} journeys={journeys} />

        {/* Gallery Section */}
        <div className="mt-16">
          <div className="mb-6 rounded-2xl bg-gradient-to-r from-[var(--ngo-primary)] to-[var(--ngo-primary-strong)] px-5 py-4">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3">
              <div>
                <h2 className="text-3xl font-bold text-center text-white md:text-left">Gallery Highlights</h2>
                <p className="mt-2 text-sm text-white/90 text-center md:text-left">
                </p>
              </div>
              <div className="flex justify-center md:justify-end">
                <Link
                  to="/gallery"
                  className="inline-flex items-center rounded-md border border-white bg-white px-4 py-2 text-sm font-semibold text-[var(--ngo-primary)] shadow-sm transition hover:bg-slate-100"
                >
                  See More
                </Link>
              </div>
            </div>
          </div>

          {galleryLoading ? (
            <div className="text-center">Loading gallery...</div>
          ) : homeGalleryRows.some((row) => row.length > 0) ? (
            <div className="space-y-4">
              {homeGalleryRows.map((row, rowIndex) => (
                row.length > 0 ? (
                  <GalleryAutoRow
                    key={`home-gallery-row-${rowIndex}`}
                    items={row}
                    direction={rowIndex % 2 === 0 ? 'left' : 'right'}
                  />
                ) : null
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-500">No gallery images available yet.</div>
          )}
        </div>

        {/* Geographic Focus Section */}
        <div className="mt-16">
          <div className="mb-6 rounded-2xl bg-gradient-to-r from-[var(--ngo-primary)] to-[var(--ngo-primary-strong)] px-5 py-4">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3">
              <div>
                <h2 className="text-3xl font-bold text-center text-white md:text-left">Geographic Focus</h2>
                <p className="mt-2 text-sm text-white/90 text-center md:text-left">
                  See the states where MSS currently works or has previously worked.
                </p>
              </div>
              <div className="flex justify-center md:justify-end">
                <Link
                  to="/about/geographic-focus"
                  className="inline-flex items-center rounded-md border border-white bg-white px-4 py-2 text-sm font-semibold text-[var(--ngo-primary)] shadow-sm transition hover:bg-slate-100"
                >
                  View Geographic Focus
                </Link>
              </div>
            </div>
          </div>

          {siteSettingsLoading ? (
            <div className="text-center text-gray-600">Loading geographic focus...</div>
          ) : (
            <div className="space-y-6">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowCurrentStates((prev) => !prev)}
                  className={`px-4 py-2 rounded-full border text-sm font-semibold transition ${
                    showCurrentStates
                      ? 'bg-[var(--ngo-secondary)] text-white border-[var(--ngo-secondary)]'
                      : 'bg-slate-50 text-[var(--ngo-secondary)] border-[var(--ngo-border)]'
                  }`}
                >
                  Currently Working
                </button>
                <button
                  type="button"
                  onClick={() => setShowPreviousStates((prev) => !prev)}
                  className={`px-4 py-2 rounded-full border text-sm font-semibold transition ${
                    showPreviousStates
                      ? 'bg-[var(--ngo-accent)] text-white border-[var(--ngo-accent)]'
                      : 'bg-slate-50 text-[var(--ngo-accent)] border-[var(--ngo-border)]'
                  }`}
                >
                  Previously Worked
                </button>
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-[1.1fr_0.9fr] gap-6 items-start">
                <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                  <Suspense fallback={<div className="rounded-lg bg-white p-4 text-sm text-gray-600">Loading map...</div>}>
                    <HomeStateMap stateStatusEntries={filteredHomeGeographicStates} />
                  </Suspense>
                  <div className="mt-3 flex flex-wrap items-center gap-3 text-xs">
                    <span className="inline-flex items-center gap-2 text-[var(--ngo-secondary)]">
                      <span className="h-2.5 w-2.5 rounded-full bg-[var(--ngo-secondary)]" />
                      Currently Working
                    </span>
                    <span className="inline-flex items-center gap-2 text-[var(--ngo-accent)]">
                      <span className="h-2.5 w-2.5 rounded-full bg-[var(--ngo-accent)]" />
                      Previously Worked
                    </span>
                    <span className="inline-flex items-center gap-2 text-gray-600">
                      <span className="h-2.5 w-2.5 rounded-full bg-gray-300" />
                      Not Selected
                    </span>
                  </div>
                </div>

                <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                  <h3 className="text-lg font-semibold text-gray-900">States In Focus</h3>
                  {showCurrentStates || showPreviousStates ? (
                    filteredHomeGeographicStates.length > 0 ? (
                      <div className="mt-3 max-h-[22rem] overflow-y-auto pr-1">
                        <div className="space-y-4">
                          {showCurrentStates ? (
                            <div>
                              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[var(--ngo-secondary)]">
                                Currently Working
                              </p>
                              {currentHomeGeographicStates.length > 0 ? (
                                <div className="flex flex-wrap gap-2">
                                  {currentHomeGeographicStates.map((item) => (
                                    <span
                                      key={`${item.state}-${item.status}`}
                                      className="inline-flex items-center rounded-full border border-[var(--ngo-border)] bg-slate-50 px-3 py-1 text-xs font-semibold text-[var(--ngo-secondary)]"
                                    >
                                      {item.state}
                                    </span>
                                  ))}
                                </div>
                              ) : (
                                <p className="text-xs text-gray-500">No currently working states in this filter.</p>
                              )}
                            </div>
                          ) : null}

                          {showPreviousStates ? (
                            <div>
                              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[var(--ngo-accent)]">
                                Previously Worked
                              </p>
                              {previousHomeGeographicStates.length > 0 ? (
                                <div className="flex flex-wrap gap-2">
                                  {previousHomeGeographicStates.map((item) => (
                                    <span
                                      key={`${item.state}-${item.status}`}
                                      className="inline-flex items-center rounded-full border border-[var(--ngo-border)] bg-slate-50 px-3 py-1 text-xs font-semibold text-[var(--ngo-accent)]"
                                    >
                                      {item.state}
                                    </span>
                                  ))}
                                </div>
                              ) : (
                                <p className="text-xs text-gray-500">No previously worked states in this filter.</p>
                              )}
                            </div>
                          ) : null}
                        </div>
                      </div>
                    ) : (
                      <p className="mt-3 text-sm text-gray-500">
                        {homeGeographicStates.length > 0
                          ? 'No states match the selected filters.'
                          : 'No states configured yet. Add them from Manage Homepage > Home Geographic Focus.'}
                      </p>
                    )
                  ) : (
                    <p className="mt-3 text-sm text-gray-500">
                      Enable at least one toggle to display states on the map and list.
                    </p>
                  )}
                  <p className="mt-4 text-sm text-gray-700">
                    {siteSettings.homeGeographicFocusDescription || DEFAULT_HOME_WHO_SETTINGS.homeGeographicFocusDescription}
                  </p>
                  <Link
                    to="/about/geographic-focus"
                    className="mt-3 inline-flex items-center rounded-md border border-[var(--ngo-primary)] bg-[var(--ngo-primary)] px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-[var(--ngo-primary-strong)]"
                  >
                    See Full District & Activity Presence
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* News and Events Section */}
        <div className="mt-16">
          <div className="mb-6 rounded-2xl bg-gradient-to-r from-[var(--ngo-primary)] to-[var(--ngo-primary-strong)] px-5 py-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
              <div>
                <h2 className="text-3xl font-bold text-center text-white md:text-left">News & Events</h2>
                <p className="mt-2 text-sm text-white/90 text-center md:text-left">
                  Read the latest updates on the left and track upcoming events on the right.
                </p>
              </div>
            </div>
          </div>

          <div className="md:hidden mb-4 flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => setMobileFeedTab('news')}
              className={`px-4 py-2 rounded-full text-sm font-semibold border transition ${
                mobileFeedTab === 'news'
                  ? 'bg-[var(--ngo-primary)] text-white border-[var(--ngo-primary)]'
                  : 'bg-white text-[var(--ngo-primary)] border-[var(--ngo-border)]'
              }`}
            >
              News
            </button>
            <button
              type="button"
              onClick={() => setMobileFeedTab('events')}
              className={`px-4 py-2 rounded-full text-sm font-semibold border transition ${
                mobileFeedTab === 'events'
                  ? 'bg-[var(--ngo-primary)] text-white border-[var(--ngo-primary)]'
                  : 'bg-white text-[var(--ngo-primary)] border-[var(--ngo-border)]'
              }`}
            >
              Events
            </button>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-[1.2fr_0.8fr] gap-6">
            <div className={`${mobileFeedTab === 'news' ? 'block' : 'hidden'} md:block bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden`}>
              <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between gap-3">
                <h3 className="text-lg font-semibold text-gray-900">Latest News</h3>
                <Link
                  to="/news-events?tab=news"
                  className="inline-flex items-center rounded-lg border border-[var(--ngo-primary)] bg-[var(--ngo-primary)] px-4 py-2 text-sm font-bold text-white shadow-sm transition hover:bg-[var(--ngo-primary-strong)]"
                >
                  All News
                </Link>
              </div>
              {newsLoading ? (
                <div className="p-5 text-gray-600">Loading news...</div>
              ) : sortedNews.length > 0 ? (
                <div>
                  {featuredNews && (
                    <Link
                      to={`/news-events/${featuredNews.slug || featuredNews._id}`}
                      className="block group"
                    >
                      <div className="relative">
                        <img
                          src={optimizeCloudinaryImage(featuredNews.image, { width: 1280, height: 720, crop: 'fill' }) || 'https://via.placeholder.com/720x360?text=News+Image'}
                          alt={featuredNews.title}
                          className="w-full h-56 object-cover transition-transform duration-500 group-hover:scale-105"
                          loading="lazy"
                          decoding="async"
                          onError={(e) => {
                            e.target.src = 'https://via.placeholder.com/720x360?text=News+Image';
                          }}
                        />
                        <div className="absolute top-3 left-3 bg-white/90 text-[var(--ngo-primary)] text-xs font-semibold px-2.5 py-1 rounded-full">
                          Featured
                        </div>
                      </div>
                      <div className="p-5">
                        <p className="text-xs uppercase tracking-wide text-gray-500">
                          {formatDate(featuredNews.date || featuredNews.createdAt)}
                        </p>
                        <h4 className="mt-1 text-xl font-semibold text-gray-900">{featuredNews.title}</h4>
                        <p className="mt-2 text-sm text-gray-600">{truncateText(stripRichText(featuredNews.content || ''), 130)}</p>
                      </div>
                    </Link>
                  )}

                  {sideNews.length > 0 && (
                    <VerticalNewsTicker items={sideNews} />
                  )}
                </div>
              ) : (
                <div className="p-5 text-gray-500">No news available.</div>
              )}
            </div>

            <div className={`${mobileFeedTab === 'events' ? 'block' : 'hidden'} md:block bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden`}>
              <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between gap-3">
                <h3 className="text-lg font-semibold text-gray-900">Upcoming Events</h3>
                <Link
                  to="/news-events?tab=events"
                  className="inline-flex items-center rounded-lg border border-[var(--ngo-primary)] bg-[var(--ngo-primary)] px-4 py-2 text-sm font-bold text-white shadow-sm transition hover:bg-[var(--ngo-primary-strong)]"
                >
                  All Events
                </Link>
              </div>
              {eventsLoading ? (
                <div className="p-5 text-gray-600">Loading events...</div>
              ) : upcomingEvents.length > 0 ? (
                <div className="p-4 space-y-3">
                  {upcomingEvents.map((item) => {
                    const parsedDate = parseSafeDate(item.startDateTime);
                    const day = parsedDate ? parsedDate.toLocaleDateString('en-IN', { day: '2-digit' }) : '--';
                    const month = parsedDate ? parsedDate.toLocaleDateString('en-IN', { month: 'short' }).toUpperCase() : 'TBA';
                    const eventLink = item.slug ? `/events/${item.slug}` : '/news-events?tab=events';

                    return (
                      <Link
                        key={item._id}
                        to={eventLink}
                        className="flex items-start gap-3 rounded-xl border border-gray-200 p-3 hover:border-[var(--ngo-border)] hover:bg-slate-50 transition-colors"
                      >
                        <div className="w-14 shrink-0 rounded-lg bg-slate-50 border border-[var(--ngo-border)] text-center py-2">
                          <p className="text-lg font-bold leading-none text-[var(--ngo-primary)]">{day}</p>
                          <p className="text-[11px] font-semibold tracking-wide text-[var(--ngo-primary)]">{month}</p>
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-sm font-semibold text-gray-900">{item.title}</h4>
                          <p className="text-xs text-gray-500 mt-1">{formatDateTime(item.startDateTime)}</p>
                          <p className="text-xs text-gray-600 mt-1">
                            {truncateText(item.location || item.description || 'Details available on event page.', 70)}
                          </p>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              ) : (
                <div className="p-5 text-gray-500">No upcoming events scheduled.</div>
              )}
            </div>
          </div>
        </div>

        {/* Testimonials Section */}
        <Testimonials loading={testimonialsLoading} testimonials={testimonials} />

        {/* Sponsors Section */}
        <Sponsors loading={sponsorsLoading} sponsors={sponsors} />

        {/* Offices Map Section */}
        <OfficesMap
          officeLocations={officeLocations}
          selectedOfficeId={selectedOfficeId}
          onSelectedOfficeIdChange={setSelectedOfficeId}
        />
      </div>
    </div>
  );
};

export default Home;



