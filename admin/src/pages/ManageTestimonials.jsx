import React, { useEffect, useState } from 'react';
import DataTable from '../components/DataTable';
import {
  getTestimonialsAdmin,
  updateTestimonialAdmin,
  deleteTestimonialAdmin
} from '../utils/api';

const ManageTestimonials = () => {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    designation: '',
    location: '',
    quote: '',
    status: 'pending',
    isPublic: false,
    isActive: true,
    order: 0
  });

  const fetchTestimonials = async () => {
    try {
      const response = await getTestimonialsAdmin();
      setTestimonials(response.data || []);
    } catch (error) {
      console.error('Failed to load testimonials:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const handleEdit = (item) => {
    setEditing(item);
    setFormData({
      name: item.name || '',
      email: item.email || '',
      designation: item.designation || '',
      location: item.location || '',
      quote: item.quote || '',
      status: item.status || 'pending',
      isPublic: !!item.isPublic,
      isActive: !!item.isActive,
      order: Number.isFinite(Number(item.order)) ? Number(item.order) : 0
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!editing || submitting) return;

    setSubmitting(true);
    try {
      await updateTestimonialAdmin(editing._id, formData);
      await fetchTestimonials();
      setEditing(null);
    } catch (error) {
      console.error('Failed to update testimonial:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this testimonial?')) return;
    try {
      await deleteTestimonialAdmin(id);
      await fetchTestimonials();
      if (editing && editing._id === id) {
        setEditing(null);
      }
    } catch (error) {
      console.error('Failed to delete testimonial:', error);
    }
  };

  const tableData = testimonials.map((item) => ({
    ...item,
    displayStatus: item.status || 'pending',
    displayVisibility: item.isPublic ? 'Shown' : 'Hidden',
    displayDate: item.createdAt ? new Date(item.createdAt).toLocaleDateString() : '-'
  }));

  const columns = [
    { header: 'Name', key: 'name' },
    { header: 'Feedback', key: 'quote' },
    { header: 'Status', key: 'displayStatus' },
    { header: 'Visibility', key: 'displayVisibility' },
    { header: 'Date', key: 'displayDate' }
  ];

  if (loading) return <div className="p-6">Loading testimonials...</div>;

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Manage Testimonials</h2>

      {editing && (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow mb-6">
          <h3 className="text-xl font-semibold mb-4">Moderate Feedback</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <input type="text" className="w-full p-2 border rounded" value={formData.name} onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))} required />
            <input type="email" className="w-full p-2 border rounded" value={formData.email} onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))} required />
            <input type="text" placeholder="Designation" className="w-full p-2 border rounded" value={formData.designation} onChange={(e) => setFormData((prev) => ({ ...prev, designation: e.target.value }))} />
            <input type="text" placeholder="Location" className="w-full p-2 border rounded" value={formData.location} onChange={(e) => setFormData((prev) => ({ ...prev, location: e.target.value }))} />
          </div>
          <textarea className="w-full p-2 border rounded mb-4" rows="4" value={formData.quote} onChange={(e) => setFormData((prev) => ({ ...prev, quote: e.target.value }))} required />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <select className="w-full p-2 border rounded" value={formData.status} onChange={(e) => setFormData((prev) => ({ ...prev, status: e.target.value }))}>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
            <input type="number" min="0" className="w-full p-2 border rounded" value={formData.order} onChange={(e) => setFormData((prev) => ({ ...prev, order: parseInt(e.target.value) || 0 }))} />
            <div className="flex gap-4 items-center">
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={formData.isPublic} onChange={(e) => setFormData((prev) => ({ ...prev, isPublic: e.target.checked }))} />
                Show on Home
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={formData.isActive} onChange={(e) => setFormData((prev) => ({ ...prev, isActive: e.target.checked }))} />
                Active
              </label>
            </div>
          </div>
          <div className="flex gap-2">
            <button type="submit" disabled={submitting} className="bg-blue-500 text-white px-4 py-2 rounded disabled:bg-gray-400">
              {submitting ? 'Saving...' : 'Update'}
            </button>
            <button type="button" onClick={() => setEditing(null)} className="bg-gray-500 text-white px-4 py-2 rounded">Cancel</button>
          </div>
        </form>
      )}

      <DataTable data={tableData} columns={columns} onEdit={handleEdit} onDelete={handleDelete} />
    </div>
  );
};

export default ManageTestimonials;
