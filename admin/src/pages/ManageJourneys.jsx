import React, { useState, useEffect } from 'react';
import DataTable from '../components/DataTable';
import { getJourneys, createJourney, updateJourney, deleteJourney } from '../utils/api';

const ManageJourneys = () => {
  const [journeys, setJourneys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingJourney, setEditingJourney] = useState(null);
  const [formData, setFormData] = useState({
    year: '',
    summary: '',
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

    if (submitting) return;
    setSubmitting(true);

    try {
      const data = {
        ...formData,
        summary: String(formData.summary || '').trim(),
        milestones: formData.milestones.filter(m => m.trim() !== '')
      };

      if (editingJourney) {
        await updateJourney(editingJourney._id, data);
      } else {
        await createJourney(data);
      }

      await fetchJourneys();
      resetForm();
    } catch (error) {
      console.error('Error saving journey:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (journey) => {
    setEditingJourney(journey);
    setFormData({
      year: journey.year,
      summary: journey.summary || '',
      milestones: journey.milestones.length > 0 ? journey.milestones : [''],
      order: journey.order
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    try {
      await deleteJourney(id);
      fetchJourneys();
    } catch (error) {
      console.error('Error deleting journey:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      year: '',
      summary: '',
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

  const truncateText = (value = '', maxLength = 80) =>
    value.length > maxLength ? `${value.slice(0, maxLength)}...` : value;

  const columns = [
    { key: 'year', label: 'Year' },
    { key: 'summary', label: 'Summary', render: (value) => truncateText(String(value || '')) },
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
              <label className="block text-gray-700 mb-2">Summary</label>
              <textarea
                value={formData.summary}
                onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                className="w-full p-2 border rounded"
                placeholder="Short summary shown by default on the website"
                rows={3}
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
                onChange={(e) => {
                  const parsedOrder = Number.parseInt(e.target.value, 10);
                  setFormData({ ...formData, order: Number.isFinite(parsedOrder) ? parsedOrder : 0 });
                }}
                className="w-full p-2 border rounded"
              />
            </div>

            <div className="flex space-x-2">
              <button
                type="submit"
                disabled={submitting}
                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {submitting ? (editingJourney ? 'Updating...' : 'Creating...') : (editingJourney ? 'Update' : 'Create')}
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
