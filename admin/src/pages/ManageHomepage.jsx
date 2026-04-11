import React, { useState } from 'react';
import ManageSliders from './ManageSliders';
import ManageJourneys from './ManageJourneys';
import ManageTestimonials from './ManageTestimonials';
import ManageSponsors from './ManageSponsors';
import ManageDonationSettings from './ManageDonationSettings';
import ManageDonations from './ManageDonations';
import ManageWhoWeAre from './ManageWhoWeAre';
import ManageOfficeLocations from './ManageOfficeLocations';
import ManageHomeGeographicFocus from './ManageHomeGeographicFocus';

const ManageHomepage = () => {
  const [activeTab, setActiveTab] = useState('sliders');

  return (
    <div>
      <div className="px-6 pt-6">
        <h1 className="text-3xl font-bold mb-4">Manage Homepage</h1>
        <div className="flex gap-2 border-b pb-3">
          <button
            type="button"
            onClick={() => setActiveTab('sliders')}
            className={`px-4 py-2 rounded ${
              activeTab === 'sliders'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
            }`}
          >
            Sliders
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('journeys')}
            className={`px-4 py-2 rounded ${
              activeTab === 'journeys'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
            }`}
          >
            Journey
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('testimonials')}
            className={`px-4 py-2 rounded ${
              activeTab === 'testimonials'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
            }`}
          >
            Testimonials
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('sponsors')}
            className={`px-4 py-2 rounded ${
              activeTab === 'sponsors'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
            }`}
          >
            Sponsors
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('donation')}
            className={`px-4 py-2 rounded ${
              activeTab === 'donation'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
            }`}
          >
            Donation
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('donations')}
            className={`px-4 py-2 rounded ${
              activeTab === 'donations'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
            }`}
          >
            Donations
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('who-we-are')}
            className={`px-4 py-2 rounded ${
              activeTab === 'who-we-are'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
            }`}
          >
            Who We Are
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('office-locations')}
            className={`px-4 py-2 rounded ${
              activeTab === 'office-locations'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
            }`}
          >
            Office Locations
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('home-geographic-focus')}
            className={`px-4 py-2 rounded ${
              activeTab === 'home-geographic-focus'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
            }`}
          >
            Home Geographic Focus
          </button>
        </div>
      </div>

      {activeTab === 'sliders' && <ManageSliders />}
      {activeTab === 'journeys' && <ManageJourneys />}
      {activeTab === 'testimonials' && <ManageTestimonials />}
      {activeTab === 'sponsors' && <ManageSponsors />}
      {activeTab === 'donation' && <ManageDonationSettings />}
      {activeTab === 'donations' && <ManageDonations />}
      {activeTab === 'who-we-are' && <ManageWhoWeAre />}
      {activeTab === 'office-locations' && <ManageOfficeLocations />}
      {activeTab === 'home-geographic-focus' && <ManageHomeGeographicFocus />}
    </div>
  );
};

export default ManageHomepage;
