import React, { useCallback, useEffect, useState } from 'react';
import DataTable from '../components/DataTable';
import { getAllJobs, createJob, updateJob, deleteJob } from '../utils/api';

const ManageJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    requirements: '',
    location: '',
    type: 'full-time',
    salary: '',
    applicationDeadline: ''
  });
  const [editing, setEditing] = useState(null);

  const fetchJobs = useCallback(async () => {
    try {
      const res = await getAllJobs();
      setJobs(res.data);
    } catch (error) {
      console.error('Error fetching jobs:', error);
    }
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      fetchJobs();
    }, 0);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [fetchJobs]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        await updateJob(editing._id, formData);
      } else {
        await createJob(formData);
      }
      setFormData({
        title: '',
        description: '',
        requirements: '',
        location: '',
        type: 'full-time',
        salary: '',
        applicationDeadline: ''
      });
      setEditing(null);
      fetchJobs();
    } catch (error) {
      console.error('Error saving job:', error);
    }
  };

  const handleEdit = (item) => {
    setFormData({
      title: item.title,
      description: item.description,
      requirements: item.requirements,
      location: item.location,
      type: item.type,
      salary: item.salary || '',
      applicationDeadline: item.applicationDeadline ? item.applicationDeadline.split('T')[0] : ''
    });
    setEditing(item);
  };

  const handleDelete = async (id) => {
    try {
      await deleteJob(id);
      fetchJobs();
    } catch (error) {
      console.error('Error deleting job:', error);
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
      <h1 className="text-3xl font-bold mb-6">Manage Jobs</h1>
      <form onSubmit={handleSubmit} className="mb-6 bg-white p-6 rounded-lg shadow-md">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Job Title"
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
            <option value="full-time">Full-time</option>
            <option value="part-time">Part-time</option>
            <option value="contract">Contract</option>
          </select>
          <input
            type="text"
            placeholder="Salary (optional)"
            value={formData.salary}
            onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
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
          placeholder="Job Description"
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
          {editing ? 'Update' : 'Add'} Job
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
                type: 'full-time',
                salary: '',
                applicationDeadline: ''
              });
            }}
            className="mt-4 ml-2 bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
          >
            Cancel
          </button>
        )}
      </form>
      <DataTable data={jobs} columns={columns} onEdit={handleEdit} onDelete={handleDelete} />
    </div>
  );
};

export default ManageJobs;
