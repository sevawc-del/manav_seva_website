import React, { useEffect, useRef, useState } from 'react';

const AutoCarousel = ({
  items = [],
  loading = false,
  emptyMessage = 'No items available.',
  intervalMs = 3500,
  renderItem
}) => {
  const [isPaused, setIsPaused] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [itemsPerView, setItemsPerView] = useState(1);
  const autoDirectionRef = useRef(1);

  const maxIndex = Math.max(items.length - itemsPerView, 0);

  useEffect(() => {
    const updateItemsPerView = () => {
      if (window.innerWidth >= 1024) {
        setItemsPerView(3);
      } else if (window.innerWidth >= 640) {
        setItemsPerView(2);
      } else {
        setItemsPerView(1);
      }
    };

    updateItemsPerView();
    window.addEventListener('resize', updateItemsPerView);
    return () => window.removeEventListener('resize', updateItemsPerView);
  }, []);

  useEffect(() => {
    setActiveIndex((prev) => Math.min(prev, maxIndex));
  }, [maxIndex]);

  useEffect(() => {
    if (loading || isPaused || items.length <= itemsPerView) return undefined;

    const intervalId = setInterval(() => {
      setActiveIndex((prev) => {
        let next = prev + autoDirectionRef.current;
        if (next > maxIndex) {
          autoDirectionRef.current = -1;
          next = Math.max(maxIndex - 1, 0);
        }
        if (next < 0) {
          autoDirectionRef.current = 1;
          next = Math.min(1, maxIndex);
        }
        return next;
      });
    }, intervalMs);

    return () => clearInterval(intervalId);
  }, [loading, isPaused, items.length, itemsPerView, intervalMs, maxIndex]);

  const handleMove = (direction) => {
    if (items.length === 0) return;
    const delta = direction === 'right' ? 1 : -1;
    autoDirectionRef.current = direction === 'right' ? 1 : -1;
    setActiveIndex((prev) => {
      const next = prev + delta;
      if (next < 0) return 0;
      if (next > maxIndex) return maxIndex;
      return next;
    });
  };

  if (loading) return <div className="text-center">Loading...</div>;
  if (items.length === 0) return <div className="text-center text-gray-500">{emptyMessage}</div>;

  return (
    <div
      className="relative"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={() => setIsPaused(true)}
      onTouchEnd={() => setIsPaused(false)}
      onTouchCancel={() => setIsPaused(false)}
    >
      <button
        type="button"
        onClick={() => handleMove('left')}
        className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white border border-gray-300 rounded-full w-10 h-10 items-center justify-center shadow hover:bg-gray-100"
        aria-label="Previous items"
      >
        {'<'}
      </button>

      <div className="overflow-hidden md:px-12 -mx-2">
        <div
          className="flex transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform"
          style={{
            transform: `translateX(-${activeIndex * (100 / itemsPerView)}%)`
          }}
        >
          {items.map((item, index) => (
            <div
              key={`${item?._id || index}`}
              style={{ width: `${100 / itemsPerView}%` }}
              className="shrink-0 px-2"
            >
              {renderItem(item)}
            </div>
          ))}
        </div>
      </div>

      <button
        type="button"
        onClick={() => handleMove('right')}
        className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white border border-gray-300 rounded-full w-10 h-10 items-center justify-center shadow hover:bg-gray-100"
        aria-label="Next items"
      >
        {'>'}
      </button>
    </div>
  );
};

export default AutoCarousel;
