import React, { useEffect, useState, useMemo } from 'react';
import ManageJobs from './ManageJobs';
import ManageTenders from './ManageTenders';
import ManageVolunteers from './ManageVolunteers';

const ManageGetInvolved = () => {
  const [activeTab, setActiveTab] = useState('jobs');

  const tabs = useMemo(() => [
    { key: 'jobs', label: 'Jobs', component: ManageJobs },
    { key: 'tenders', label: 'Tenders', component: ManageTenders },
    { key: 'volunteers', label: 'Volunteers', component: ManageVolunteers },
  ], []);

  const ActiveComponent = tabs.find(tab => tab.key === activeTab)?.component || ManageJobs;

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Manage Get Involved</h1>
      <div className="mb-6">
        <div className="flex space-x-4 border-b">
          {tabs.map((tab) => (
            <button
              key={tab.key}
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

export default ManageGetInvolved;
