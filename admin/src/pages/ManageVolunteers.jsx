import React, { useEffect, useState } from 'react';
import DataTable from '../components/DataTable';
import { getAllVolunteers, createVolunteer, updateVolunteer, deleteVolunteer } from '../utils/api';

const ManageVolunteers = () => {
  const [volunteers, setVolunteers] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    requirements: '',
    location: '',
    type: 'short-term',
    commitment: '',
    applicationDeadline: ''
  });
  const [editing, setEditing] = useState(null);

  const fetchVolunteers = async () => {
    try {
      const res = await getAllVolunteers();
      setVolunteers(res.data);
    } catch (error) {
      console.error('Error fetching volunteers:', error);
    }
  };

  useEffect(() => {
    fetchVolunteers();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        await updateVolunteer(editing._id, formData);
      } else {
        await createVolunteer(formData);
      }
      setFormData({
        title: '',
        description: '',
        requirements: '',
        location: '',
        type: 'short-term',
        commitment: '',
        applicationDeadline: ''
      });
      setEditing(null);
      fetchVolunteers();
    } catch (error) {
      console.error('Error saving volunteer:', error);
    }
  };

  const handleEdit = (item) => {
    setFormData({
      title: item.title,
      description: item.description,
      requirements: item.requirements,
      location: item.location,
      type: item.type,
      commitment: item.commitment || '',
      applicationDeadline: item.applicationDeadline ? item.applicationDeadline.split('T')[0] : ''
    });
    setEditing(item);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this volunteer opportunity?')) {
      try {
        await deleteVolunteer(id);
        fetchVolunteers();
      } catch (error) {
        console.error('Error deleting volunteer:', error);
      }
    }
  };

  const columns = [
    { header: 'Title', key: 'title' },
    { header: 'Location', key: 'location' },
    { header: 'Type', key: 'type' },
    { header: 'Status', key: 'isActive' },
  ];

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Manage Volunteers</h1>
      <form onSubmit={handleSubmit} className="mb-6 bg-white p-6 rounded-lg shadow-md">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Volunteer Title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full p-2 border rounded"
            required
          />
          <input
            type="text"
            placeholder="Location"
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            className="w-full p-2 border rounded"
            required
          />
          <select
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
            className="w-full p-2 border rounded"
            required
          >
            <option value="short-term">Short-term</option>
            <option value="long-term">Long-term</option>
            <option value="event-based">Event-based</option>
          </select>
          <input
            type="text"
            placeholder="Commitment (e.g., 2 hours/week)"
            value={formData.commitment}
            onChange={(e) => setFormData({ ...formData, commitment: e.target.value })}
            className="w-full p-2 border rounded"
          />
          <input
            type="date"
            placeholder="Application Deadline (optional)"
            value={formData.applicationDeadline}
            onChange={(e) => setFormData({ ...formData, applicationDeadline: e.target.value })}
            className="w-full p-2 border rounded"
          />
        </div>
        <textarea
          placeholder="Volunteer Description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="w-full p-2 mt-4 border rounded"
          rows="3"
          required
        />
        <textarea
          placeholder="Requirements"
          value={formData.requirements}
          onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
          className="w-full p-2 mt-4 border rounded"
          rows="3"
          required
        />
        <button type="submit" className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
          {editing ? 'Update' : 'Add'} Volunteer Opportunity
        </button>
        {editing && (
          <button
            type="button"
            onClick={() => {
              setEditing(null);
              setFormData({
                title: '',
                description: '',
                requirements: '',
                location: '',
                type: 'short-term',
                commitment: '',
                applicationDeadline: ''
              });
            }}
            className="mt-4 ml-2 bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
          >
            Cancel
          </button>
        )}
      </form>
      <DataTable data={volunteers} columns={columns} onEdit={handleEdit} onDelete={handleDelete} />
    </div>
  );
};

export default ManageVolunteers;
