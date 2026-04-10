import React from 'react';

const ActivityDetails = ({ activity }) => {
  if (!activity) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold mb-4">Activity Details</h3>
        <p className="text-gray-500">Select an activity to view details</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-lg font-semibold mb-4">{activity.name}</h3>
      <div className="prose max-w-none">
        <div className="max-h-36 overflow-y-auto pr-1 sm:max-h-40 md:max-h-48 lg:max-h-none lg:overflow-visible">
          <p className="text-gray-700 whitespace-pre-line">
            {activity.description || 'Description not available.'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ActivityDetails;
