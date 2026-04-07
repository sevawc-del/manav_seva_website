import React from 'react';
import AutoCarousel from '../AutoCarousel';
import { optimizeCloudinaryImage } from '../../utils/imageUrl';

const FALLBACK_SPONSOR_IMAGE = 'https://via.placeholder.com/220x80?text=Sponsor';

const Sponsors = ({ loading = false, sponsors = [] }) => {
  const renderSponsorCard = (item, allowHover = false) => {
    const imageClassName = allowHover
      ? 'max-h-12 w-full object-contain grayscale hover:grayscale-0 transition'
      : 'max-h-12 w-full object-contain grayscale';

    if (item.website) {
      return (
        <a
          key={item._id}
          href={item.website}
          target="_blank"
          rel="noreferrer"
          className="h-24 bg-white border border-gray-200 rounded-xl shadow-sm p-4 flex items-center justify-center transition hover:shadow-md"
        >
          <img
            src={optimizeCloudinaryImage(item.logo, { width: 440, height: 160, crop: 'fit' }) || item.logo}
            alt={item.name}
            className={imageClassName}
            loading="lazy"
            decoding="async"
            onError={(e) => {
              e.target.src = FALLBACK_SPONSOR_IMAGE;
            }}
          />
        </a>
      );
    }

    return (
      <div
        key={item._id}
        className="h-24 bg-white border border-gray-200 rounded-xl shadow-sm p-4 flex items-center justify-center"
      >
        <img
          src={optimizeCloudinaryImage(item.logo, { width: 440, height: 160, crop: 'fit' }) || item.logo}
          alt={item.name}
          className={imageClassName}
          loading="lazy"
          decoding="async"
          onError={(e) => {
            e.target.src = FALLBACK_SPONSOR_IMAGE;
          }}
        />
      </div>
    );
  };

  return (
    <div className="mt-16">
      <div className="mb-6 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-500 px-5 py-4">
        <h2 className="text-3xl font-bold text-center text-white md:text-left">Our Sponsors</h2>
        <p className="mt-2 text-sm text-center text-white/90 md:text-left">
          Partners who strengthen and scale our mission.
        </p>
      </div>
      {loading ? (
        <div className="text-center">Loading sponsors...</div>
      ) : sponsors.length > 0 ? (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {sponsors.map((item) => renderSponsorCard(item, true))}
          </div>

          {sponsors.length > 6 && (
            <div className="mt-8">
              <AutoCarousel
                items={sponsors}
                intervalMs={3200}
                renderItem={(item) => {
                  if (item.website) {
                    return (
                      <a
                        href={item.website}
                        target="_blank"
                        rel="noreferrer"
                        className="h-24 bg-white border border-gray-200 rounded-xl shadow-sm p-4 flex items-center justify-center"
                      >
                        <img
                          src={optimizeCloudinaryImage(item.logo, { width: 440, height: 160, crop: 'fit' }) || item.logo}
                          alt={item.name}
                          className="max-h-12 w-full object-contain grayscale hover:grayscale-0 transition"
                          loading="lazy"
                          decoding="async"
                          onError={(e) => {
                            e.target.src = FALLBACK_SPONSOR_IMAGE;
                          }}
                        />
                      </a>
                    );
                  }

                  return (
                    <div className="h-24 bg-white border border-gray-200 rounded-xl shadow-sm p-4 flex items-center justify-center">
                      <img
                        src={optimizeCloudinaryImage(item.logo, { width: 440, height: 160, crop: 'fit' }) || item.logo}
                        alt={item.name}
                        className="max-h-12 w-full object-contain grayscale"
                        loading="lazy"
                        decoding="async"
                        onError={(e) => {
                          e.target.src = FALLBACK_SPONSOR_IMAGE;
                        }}
                      />
                    </div>
                  );
                }}
              />
            </div>
          )}
        </>
      ) : (
        <div className="text-center text-gray-500">No sponsors available yet.</div>
      )}
    </div>
  );
};

export default Sponsors;
