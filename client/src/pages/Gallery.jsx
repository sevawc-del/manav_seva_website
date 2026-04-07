import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { getGallery } from '../utils/api';
import Loader from '../components/Loader';
import { optimizeCloudinaryImage } from '../utils/imageUrl';

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

const getGalleryYear = (item) => {
  const parsed = parseSafeDate(item?.date || item?.createdAt);
  return parsed ? String(parsed.getFullYear()) : 'Undated';
};

const GALLERY_THEMES = [
  {
    containerBorder: 'border-blue-200',
    headerGradient: 'from-blue-600 to-sky-500',
    countBadge: 'bg-white/25 text-white',
    itemBorder: 'border-blue-100',
    itemHover: 'hover:border-blue-200 hover:bg-blue-50/40',
    dateBadge: 'bg-blue-100 text-blue-700'
  },
  {
    containerBorder: 'border-emerald-200',
    headerGradient: 'from-emerald-600 to-teal-500',
    countBadge: 'bg-white/25 text-white',
    itemBorder: 'border-emerald-100',
    itemHover: 'hover:border-emerald-200 hover:bg-emerald-50/40',
    dateBadge: 'bg-emerald-100 text-emerald-700'
  },
  {
    containerBorder: 'border-amber-200',
    headerGradient: 'from-amber-500 to-yellow-500',
    countBadge: 'bg-white/30 text-white',
    itemBorder: 'border-amber-100',
    itemHover: 'hover:border-amber-200 hover:bg-amber-50/40',
    dateBadge: 'bg-amber-100 text-amber-700'
  },
  {
    containerBorder: 'border-cyan-200',
    headerGradient: 'from-cyan-500 to-sky-500',
    countBadge: 'bg-white/25 text-white',
    itemBorder: 'border-cyan-100',
    itemHover: 'hover:border-cyan-200 hover:bg-cyan-50/40',
    dateBadge: 'bg-cyan-100 text-cyan-700'
  },
  {
    containerBorder: 'border-rose-200',
    headerGradient: 'from-rose-600 to-red-500',
    countBadge: 'bg-white/25 text-white',
    itemBorder: 'border-rose-100',
    itemHover: 'hover:border-rose-200 hover:bg-rose-50/40',
    dateBadge: 'bg-rose-100 text-rose-700'
  }
];

const getThemeByIndex = (index) => GALLERY_THEMES[index % GALLERY_THEMES.length];

const Gallery = () => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchGallery = async () => {
      try {
        const response = await getGallery();
        setImages(response.data || []);
      } catch (err) {
        setError('Failed to load gallery images');
        console.error('Error fetching gallery:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchGallery();
  }, []);

  const sortedImages = useMemo(
    () =>
      [...images].sort(
        (a, b) =>
          new Date(b.date || b.createdAt || 0).getTime() -
          new Date(a.date || a.createdAt || 0).getTime()
      ),
    [images]
  );

  const groupedImages = useMemo(() => {
    const grouped = sortedImages.reduce((acc, image) => {
      const year = getGalleryYear(image);
      if (!acc[year]) {
        acc[year] = [];
      }
      acc[year].push(image);
      return acc;
    }, {});

    return Object.entries(grouped)
      .sort(([a], [b]) => {
        if (a === 'Undated') return 1;
        if (b === 'Undated') return -1;
        return Number(b) - Number(a);
      })
      .map(([year, items]) => ({
        year,
        items
      }));
  }, [sortedImages]);

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

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 rounded-3xl bg-gradient-to-r from-sky-600 via-blue-600 to-cyan-500 px-6 py-7 text-white shadow-lg">
        <h1 className="text-3xl text-center font-bold md:text-left md:text-4xl">Gallery</h1>
        <p className="mt-2 text-sm text-center text-sky-100 md:text-left md:text-base">
          Browse moments from field programs, community events, and impact stories captured on the ground.
        </p>
        <div className="mt-4">
          <span className="inline-flex items-center rounded-full bg-white/20 px-3 py-1 text-xs font-semibold text-white">
            {sortedImages.length} {sortedImages.length === 1 ? 'Photo' : 'Photos'}
          </span>
        </div>
      </div>

      {groupedImages.length === 0 ? (
        <section className="rounded-2xl border border-gray-200 bg-white px-6 py-10 text-center text-gray-600 shadow-sm">
          No images available right now.
        </section>
      ) : (
        <div className="space-y-6">
          {groupedImages.map((group, groupIndex) => {
            const theme = getThemeByIndex(groupIndex);

            return (
              <section
                key={group.year}
                className={`overflow-hidden rounded-2xl border bg-white shadow-md ${theme.containerBorder}`}
              >
                <div className={`bg-gradient-to-r px-5 py-4 ${theme.headerGradient}`}>
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <h2 className="text-xl font-semibold text-white">
                      {group.year === 'Undated' ? 'Undated Highlights' : `${group.year} Highlights`}
                    </h2>
                    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${theme.countBadge}`}>
                      {group.items.length} {group.items.length === 1 ? 'Photo' : 'Photos'}
                    </span>
                  </div>
                </div>

                <div className="p-4 md:p-5">
                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                    {group.items.map((image) => (
                      <Link
                        key={image._id}
                        to={`/gallery/${image._id}`}
                        className={`group overflow-hidden rounded-xl border bg-white transition-all ${theme.itemBorder} ${theme.itemHover}`}
                      >
                        <div className="relative overflow-hidden">
                          <img
                            src={optimizeCloudinaryImage(image.image || image.imageUrl, { width: 960, height: 720, crop: 'fill' }) || 'https://via.placeholder.com/400x300?text=Image+Not+Available'}
                            alt={image.title || image.description || 'Gallery Image'}
                            className="h-56 w-full object-cover transition duration-500 group-hover:scale-105"
                            onError={(e) => {
                              e.target.src = 'https://via.placeholder.com/400x300?text=Image+Not+Available';
                            }}
                          />
                          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-black/25 to-transparent" />
                          <span className={`absolute left-3 top-3 inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ${theme.dateBadge}`}>
                            {formatDate(image.date || image.createdAt)}
                          </span>
                        </div>

                        <div className="p-4">
                          <h3 className="line-clamp-2 text-sm font-semibold text-gray-900 sm:text-base">
                            {image.title || image.description || 'Gallery Image'}
                          </h3>
                          <p className="mt-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
                            Open photo
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Gallery;
