import React, { useState, useEffect } from 'react';
import DataTable from '../components/DataTable';
import { getJourneys, createJourney, updateJourney, deleteJourney } from '../utils/api';

const ManageJourneys = () => {
  const [journeys, setJourneys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingJourney, setEditingJourney] = useState(null);
  const [formData, setFormData] = useState({
    year: '',
    milestones: [''],
    order: 0
  });

  useEffect(() => {
    fetchJourneys();
  }, []);

  const fetchJourneys = async () => {
    try {
      const response = await getJourneys();
      setJourneys(response.data);
    } catch (error) {
      console.error('Error fetching journeys:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = {
        ...formData,
        milestones: formData.milestones.filter(m => m.trim() !== '')
      };

      if (editingJourney) {
        await updateJourney(editingJourney._id, data);
      } else {
        await createJourney(data);
      }

      fetchJourneys();
      resetForm();
    } catch (error) {
      console.error('Error saving journey:', error);
    }
  };

  const handleEdit = (journey) => {
    setEditingJourney(journey);
    setFormData({
      year: journey.year,
      milestones: journey.milestones.length > 0 ? journey.milestones : [''],
      order: journey.order
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this journey?')) {
      try {
        await deleteJourney(id);
        fetchJourneys();
      } catch (error) {
        console.error('Error deleting journey:', error);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      year: '',
      milestones: [''],
      order: 0
    });
    setEditingJourney(null);
    setShowForm(false);
  };

  const addMilestone = () => {
    setFormData({
      ...formData,
      milestones: [...formData.milestones, '']
    });
  };

  const updateMilestone = (index, value) => {
    const newMilestones = [...formData.milestones];
    newMilestones[index] = value;
    setFormData({
      ...formData,
      milestones: newMilestones
    });
  };

  const removeMilestone = (index) => {
    if (formData.milestones.length > 1) {
      const newMilestones = formData.milestones.filter((_, i) => i !== index);
      setFormData({
        ...formData,
        milestones: newMilestones
      });
    }
  };

  const columns = [
    { key: 'year', label: 'Year' },
    { key: 'milestones', label: 'Milestones', render: (value) => value.join(', ') },
    { key: 'order', label: 'Order' }
  ];

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Manage Journeys</h1>
        <button
          onClick={() => setShowForm(true)}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
        >
          Add Journey
        </button>
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded shadow-md mb-6">
          <h2 className="text-xl font-bold mb-4">
            {editingJourney ? 'Edit Journey' : 'Add Journey'}
          </h2>
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Year</label>
              <input
                type="number"
                value={formData.year}
                onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                className="w-full p-2 border rounded"
                required
              />
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Milestones</label>
              {formData.milestones.map((milestone, index) => (
                <div key={index} className="flex mb-2">
                  <input
                    type="text"
                    value={milestone}
                    onChange={(e) => updateMilestone(index, e.target.value)}
                    className="flex-1 p-2 border rounded mr-2"
                    placeholder="Enter milestone"
                  />
                  {formData.milestones.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeMilestone(index)}
                      className="bg-red-500 text-white px-3 py-2 rounded hover:bg-red-600"
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={addMilestone}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                Add Milestone
              </button>
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Order</label>
              <input
                type="number"
                value={formData.order}
                onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) })}
                className="w-full p-2 border rounded"
              />
            </div>

            <div className="flex space-x-2">
              <button
                type="submit"
                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
              >
                {editingJourney ? 'Update' : 'Create'}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <DataTable columns={columns} data={journeys} onEdit={handleEdit} onDelete={handleDelete} />
    </div>
  );
};

export default ManageJourneys;
