import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

// Sample India districts data (you'll need to replace this with actual data)
const indiaDistricts = [
  // Andhra Pradesh
  { stateCode: 'AP', stateName: 'Andhra Pradesh', districts: [
    { code: 'AP001', name: 'Visakhapatnam' },
    { code: 'AP002', name: 'Vijayawada' },
    { code: 'AP003', name: 'Guntur' },
    { code: 'AP004', name: 'Tirupati' }
  ]},
  // Karnataka
  { stateCode: 'KA', stateName: 'Karnataka', districts: [
    { code: 'KA001', name: 'Bangalore' },
    { code: 'KA002', name: 'Mysore' },
    { code: 'KA003', name: 'Mangalore' },
    { code: 'KA004', name: 'Hubli' }
  ]},
  // Maharashtra
  { stateCode: 'MH', stateName: 'Maharashtra', districts: [
    { code: 'MH001', name: 'Mumbai' },
    { code: 'MH002', name: 'Pune' },
    { code: 'MH003', name: 'Nagpur' },
    { code: 'MH004', name: 'Nashik' }
  ]},
  // Tamil Nadu
  { stateCode: 'TN', stateName: 'Tamil Nadu', districts: [
    { code: 'TN001', name: 'Chennai' },
    { code: 'TN002', name: 'Coimbatore' },
    { code: 'TN003', name: 'Madurai' },
    { code: 'TN004', name: 'Tiruchirappalli' }
  ]}
];

const AddActivity = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    districts: []
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDistrictToggle = (district) => {
    setFormData(prev => ({
      ...prev,
      districts: prev.districts.some(d => d.districtCode === district.code)
        ? prev.districts.filter(d => d.districtCode !== district.code)
        : [...prev.districts, {
            stateCode: district.stateCode,
            districtCode: district.code
          }]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      await axios.post('/api/admin/activity', formData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      navigate('/admin/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create activity');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Add New Activity</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Activity Name
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter activity name"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            required
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter activity description"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-4">
            Select Districts
          </label>

          <div className="space-y-4">
            {indiaDistricts.map((state) => (
              <div key={state.stateCode} className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-3">{state.stateName}</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {state.districts.map((district) => {
                    const isSelected = formData.districts.some(d => d.districtCode === district.code);
                    return (
                      <label key={district.code} className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleDistrictToggle({
                            ...district,
                            stateCode: state.stateCode
                          })}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">{district.name}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 text-sm text-gray-600">
            Selected districts: {formData.districts.length}
          </div>
        </div>

        <div className="flex space-x-4">
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {loading ? 'Creating...' : 'Create Activity'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/admin/dashboard')}
            className="bg-gray-500 text-white px-6 py-2 rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddActivity;
