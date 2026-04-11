import React, { useEffect, useState } from 'react';
import { optimizeCloudinaryImage } from '../../utils/imageUrl';

const FALLBACK_SPONSOR_IMAGE = 'https://via.placeholder.com/220x80?text=Sponsor';
const SPONSORS_MARQUEE_DUPLICATE_LIMIT = 12;

const SponsorCard = ({ item, allowHover = false }) => {
  const imageClassName = allowHover
    ? 'h-14 md:h-16 w-auto object-contain transition'
    : 'h-14 md:h-16 w-auto object-contain';

  if (item.website) {
    return (
      <a
        href={item.website}
        target="_blank"
        rel="noreferrer"
        className="h-24 shrink-0 px-5 flex items-center justify-center"
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
    <div className="h-24 shrink-0 px-5 flex items-center justify-center">
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

const SponsorsMarquee = ({ items = [] }) => {
  const [isPaused, setIsPaused] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const hasLoop = items.length > 1;
  const canDuplicate = items.length <= SPONSORS_MARQUEE_DUPLICATE_LIMIT;
  const shouldAnimate = hasLoop && !prefersReducedMotion;
  const shouldDuplicate = shouldAnimate && canDuplicate;
  const durationSeconds = Math.max(4, items.length * 2.8);

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
      className={`${shouldAnimate ? 'overflow-hidden' : 'overflow-x-auto no-scrollbar'}`}
      onMouseEnter={() => shouldAnimate && setIsPaused(true)}
      onMouseLeave={() => shouldAnimate && setIsPaused(false)}
      onTouchStart={() => shouldAnimate && setIsPaused(true)}
      onTouchEnd={() => shouldAnimate && setIsPaused(false)}
      onTouchCancel={() => shouldAnimate && setIsPaused(false)}
    >
      <div
        className="flex w-max gap-0"
        style={{
          animation: shouldAnimate
            ? `${shouldDuplicate ? 'gallery-marquee-left' : 'gallery-marquee-left-single'} ${durationSeconds}s linear infinite`
            : 'none',
          animationPlayState: isPaused ? 'paused' : 'running'
        }}
      >
        {(shouldDuplicate ? [0, 1] : [0]).map((copyIndex) => (
           <div key={`sponsors-copy-${copyIndex}`} className="flex gap-6 pr-6">
            {items.map((item, index) => (
              <SponsorCard
                key={`${item?._id || item?.name || 'sponsor'}-${copyIndex}-${index}`}
                item={item}
                allowHover
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

const Sponsors = ({ loading = false, sponsors = [] }) => {

  return (
    <div className="mt-16">
      <div className="mb-6 rounded-2xl bg-gradient-to-r from-[var(--ngo-primary)] to-[var(--ngo-primary-strong)] px-5 py-4">
        <h2 className="text-3xl font-bold text-center text-white md:text-left">Our Sponsors</h2>
        <p className="mt-2 text-sm text-center text-white/90 md:text-left">
          Partners who strengthen and scale our mission.
        </p>
      </div>
      {loading ? (
        <div className="text-center">Loading sponsors...</div>
      ) : sponsors.length > 0 ? (
        <SponsorsMarquee items={sponsors} />
      ) : (
        <div className="text-center text-gray-500">No sponsors available yet.</div>
      )}
    </div>
  );
};

export default Sponsors;
