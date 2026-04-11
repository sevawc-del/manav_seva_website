import React from 'react';
import AutoCarousel from '../AutoCarousel';

const Testimonials = ({ loading = false, testimonials = [] }) => {
  return (
    <div className="mt-16">
      <div className="mb-6 rounded-2xl bg-gradient-to-r from-[var(--ngo-primary)] to-[var(--ngo-primary-strong)] px-5 py-4">
        <h2 className="text-3xl font-bold text-center text-white md:text-left">What People Say</h2>
        <p className="mt-2 text-sm text-center text-white/90 md:text-left">
          Voices from people and communities we have served.
        </p>
      </div>
      {loading ? (
        <div className="text-center">Loading testimonials...</div>
      ) : testimonials.length > 0 ? (
        <AutoCarousel
          items={testimonials}
          loading={loading}
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
  );
};

export default Testimonials;
