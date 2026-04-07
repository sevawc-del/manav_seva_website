import React, { useMemo, useState } from 'react';
import ManageNews from './ManageNews';
import ManageGallery from './ManageGallery';
import ManageReports from './ManageReports';

const ManageMediaCenter = () => {
  const [activeTab, setActiveTab] = useState('news-events');

  const tabs = useMemo(() => [
    { key: 'news-events', label: 'News & Events', component: ManageNews },
    { key: 'gallery', label: 'Gallery', component: ManageGallery },
    { key: 'reports', label: 'Reports', component: ManageReports },
  ], []);

  const ActiveComponent = tabs.find((tab) => tab.key === activeTab)?.component || ManageNews;

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Manage Media Center</h1>
      <div className="mb-6">
        <div className="flex space-x-4 border-b">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`py-2 px-4 ${activeTab === tab.key ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-500'}`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>
      <ActiveComponent />
    </div>
  );
};

export default ManageMediaCenter;
