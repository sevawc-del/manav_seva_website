import React from 'react';

const ActivitySelector = ({ activities, onActivitySelect }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-lg font-semibold mb-4">Select Activity</h3>
      <select
        onChange={(e) => onActivitySelect(e.target.value)}
        className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        defaultValue=""
      >
        <option value="">Choose an activity...</option>
        {activities.map((activity) => (
          <option key={activity._id} value={activity._id}>
            {activity.name}
          </option>
        ))}
      </select>
    </div>
  );
};

export default ActivitySelector;
