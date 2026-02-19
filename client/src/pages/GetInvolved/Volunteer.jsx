import React, { useState, useEffect } from 'react';
import { getVolunteers, applyForVolunteer } from '../../utils/api';

const Volunteer = () => {
  const [volunteers, setVolunteers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState({});
  const [formData, setFormData] = useState({});
  const [submitting, setSubmitting] = useState({});

  useEffect(() => {
    const fetchVolunteers = async () => {
      try {
        const response = await getVolunteers();
        setVolunteers(response.data);
      } catch (err) {
        setError('Failed to load volunteer opportunities');
      } finally {
        setLoading(false);
      }
    };

    fetchVolunteers();
  }, []);

  const handleShowForm = (volunteerId) => {
    setShowForm(prev => ({ ...prev, [volunteerId]: !prev[volunteerId] }));
    setFormData(prev => ({ ...prev, [volunteerId]: { volunteerId, name: '', email: '', phone: '', message: '' } }));
  };

  const handleInputChange = (volunteerId, field, value) => {
    setFormData(prev => ({
      ...prev,
      [volunteerId]: { ...prev[volunteerId], [field]: value }
    }));
  };

  const handleSubmit = async (volunteerId) => {
    setSubmitting(prev => ({ ...prev, [volunteerId]: true }));
    try {
      await applyForVolunteer(formData[volunteerId]);
      alert('Application submitted successfully!');
      setShowForm(prev => ({ ...prev, [volunteerId]: false }));
    } catch (err) {
      alert('Failed to submit application. Please try again.');
    } finally {
      setSubmitting(prev => ({ ...prev, [volunteerId]: false }));
    }
  };

  if (loading) return <div className="container mx-auto px-4 py-8">Loading...</div>;
  if (error) return <div className="container mx-auto px-4 py-8 text-red-500">{error}</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold mb-4">Volunteer Opportunities</h2>
      {volunteers.length === 0 ? (
        <p className="text-gray-700">No volunteer opportunities available at the moment.</p>
      ) : (
        <div className="grid gap-6">
          {volunteers.map((volunteer) => (
            <div key={volunteer._id} className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-2">{volunteer.title}</h3>
              <p className="text-gray-700 mb-4">{volunteer.description}</p>
              <div className="mb-4">
                <h4 className="font-semibold">Requirements:</h4>
                <p className="text-gray-600">{volunteer.requirements}</p>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <p><strong>Location:</strong> {volunteer.location}</p>
                <p><strong>Type:</strong> {volunteer.type}</p>
                {volunteer.commitment && <p><strong>Commitment:</strong> {volunteer.commitment}</p>}
                {volunteer.applicationDeadline && (
                  <p><strong>Deadline:</strong> {new Date(volunteer.applicationDeadline).toLocaleDateString()}</p>
                )}
              </div>
              <button
                onClick={() => handleShowForm(volunteer._id)}
                className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                {showForm[volunteer._id] ? 'Cancel' : 'Express Interest'}
              </button>
              {showForm[volunteer._id] && (
                <form onSubmit={(e) => { e.preventDefault(); handleSubmit(volunteer._id); }} className="mt-4 p-4 bg-gray-50 rounded">
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-1">Name</label>
                    <input
                      type="text"
                      required
                      value={formData[volunteer._id]?.name || ''}
                      onChange={(e) => handleInputChange(volunteer._id, 'name', e.target.value)}
                      className="w-full p-2 border rounded"
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-1">Email</label>
                    <input
                      type="email"
                      required
                      value={formData[volunteer._id]?.email || ''}
                      onChange={(e) => handleInputChange(volunteer._id, 'email', e.target.value)}
                      className="w-full p-2 border rounded"
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-1">Phone</label>
                    <input
                      type="tel"
                      required
                      value={formData[volunteer._id]?.phone || ''}
                      onChange={(e) => handleInputChange(volunteer._id, 'phone', e.target.value)}
                      className="w-full p-2 border rounded"
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-1">Message (Optional)</label>
                    <textarea
                      value={formData[volunteer._id]?.message || ''}
                      onChange={(e) => handleInputChange(volunteer._id, 'message', e.target.value)}
                      className="w-full p-2 border rounded"
                      rows="3"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={submitting[volunteer._id]}
                    className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:opacity-50"
                  >
                    {submitting[volunteer._id] ? 'Submitting...' : 'Submit Application'}
                  </button>
                </form>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Volunteer;
