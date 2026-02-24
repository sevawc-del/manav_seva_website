import React, { useEffect, useRef, useState } from 'react';
import {
  getSponsorsAdmin,
  createSponsor,
  updateSponsor,
  deleteSponsor
} from '../utils/api';

const TIER_OPTIONS = [
  { value: 'strategic', label: 'Strategic' },
  { value: 'program', label: 'Program' },
  { value: 'community', label: 'Community' },
  { value: 'other', label: 'Other' }
];

const ManageSponsors = () => {
  const [sponsors, setSponsors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [editingSponsor, setEditingSponsor] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedFileName, setSelectedFileName] = useState('');
  const [selectedFilePreview, setSelectedFilePreview] = useState('');
  const fileInputRef = useRef(null);
  const [formData, setFormData] = useState({
    name: '',
    logo: '',
    website: '',
    tier: 'community',
    order: 0,
    isActive: true
  });

  const fetchSponsors = async () => {
    try {
      const response = await getSponsorsAdmin();
      setSponsors(response.data || []);
    } catch (error) {
      console.error('Failed to fetch sponsors:', error);
      alert('Failed to load sponsors');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSponsors();
  }, []);

  const resetForm = () => {
    setEditingSponsor(null);
    setSelectedFile(null);
    setSelectedFileName('');
    setSelectedFilePreview('');
    setFormData({
      name: '',
      logo: '',
      website: '',
      tier: 'community',
      order: 0,
      isActive: true
    });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;

    if (!formData.name.trim()) {
      alert('Name is required');
      return;
    }

    const hasLogoUrl = formData.logo.trim().length > 0;
    if (!editingSponsor && !hasLogoUrl && !selectedFile) {
      alert('Please add a logo URL or choose a logo file');
      return;
    }

    setSubmitting(true);
    try {
      const payload = new FormData();
      payload.append('name', formData.name.trim());
      payload.append('logo', formData.logo.trim());
      payload.append('website', formData.website.trim());
      payload.append('tier', formData.tier);
      payload.append('order', String(formData.order || 0));
      payload.append('isActive', String(formData.isActive));
      if (selectedFile) {
        payload.append('logoFile', selectedFile);
      }

      if (editingSponsor) {
        await updateSponsor(editingSponsor._id, payload);
      } else {
        await createSponsor(payload);
      }

      await fetchSponsors();
      resetForm();
    } catch (error) {
      console.error('Failed to save sponsor:', error);
      alert(error?.response?.data?.message || 'Failed to save sponsor');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (sponsor) => {
    setEditingSponsor(sponsor);
    setFormData({
      name: sponsor.name || '',
      logo: sponsor.logo || '',
      website: sponsor.website || '',
      tier: sponsor.tier || 'community',
      order: Number.isFinite(Number(sponsor.order)) ? Number(sponsor.order) : 0,
      isActive: !!sponsor.isActive
    });
    setSelectedFile(null);
    setSelectedFileName('');
    setSelectedFilePreview('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this sponsor?')) return;
    try {
      await deleteSponsor(id);
      await fetchSponsors();
      if (editingSponsor?._id === id) {
        resetForm();
      }
    } catch (error) {
      console.error('Failed to delete sponsor:', error);
      alert('Failed to delete sponsor');
    }
  };

  if (loading) {
    return <div className="p-6">Loading sponsors...</div>;
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Manage Sponsors</h2>

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow mb-6">
        <h3 className="text-xl font-semibold mb-4">
          {editingSponsor ? 'Edit Sponsor' : 'Add Sponsor'}
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
            className="w-full p-2 border rounded"
            placeholder="Sponsor name"
            required
          />
          <input
            type="url"
            value={formData.website}
            onChange={(e) => setFormData((prev) => ({ ...prev, website: e.target.value }))}
            className="w-full p-2 border rounded"
            placeholder="Website URL (optional)"
          />
        </div>

        <input
          type="text"
          value={formData.logo}
          onChange={(e) => setFormData((prev) => ({ ...prev, logo: e.target.value }))}
          className="w-full p-2 border rounded mb-4"
          placeholder="Cloudinary logo URL (optional if file is selected)"
        />

        <div className="mb-4 text-left">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              setSelectedFile(file);
              setSelectedFileName(file.name);
              const reader = new FileReader();
              reader.onloadend = () => {
                setSelectedFilePreview(String(reader.result || ''));
              };
              reader.readAsDataURL(file);
            }}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={submitting}
            className="inline-block bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
          >
            Choose File
          </button>
          {selectedFileName && (
            <p className="mt-2 text-sm text-gray-600">Selected: {selectedFileName}</p>
          )}
          {!selectedFileName && editingSponsor && formData.logo && (
            <p className="mt-2 text-sm text-gray-600">Using current logo URL</p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <select
            value={formData.tier}
            onChange={(e) => setFormData((prev) => ({ ...prev, tier: e.target.value }))}
            className="w-full p-2 border rounded"
          >
            {TIER_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <input
            type="number"
            min="0"
            value={formData.order}
            onChange={(e) => setFormData((prev) => ({ ...prev, order: parseInt(e.target.value, 10) || 0 }))}
            className="w-full p-2 border rounded"
            placeholder="Order"
          />
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={formData.isActive}
              onChange={(e) => setFormData((prev) => ({ ...prev, isActive: e.target.checked }))}
            />
            Active
          </label>
        </div>

        {(selectedFileName || formData.logo) && (
          <div className="mb-4">
            <p className="text-sm text-gray-600 mb-2">Preview</p>
            <img
              src={selectedFilePreview || formData.logo}
              alt={formData.name || 'Logo preview'}
              className="h-16 object-contain border rounded p-2 bg-white"
            />
          </div>
        )}

        <div className="flex gap-2">
          <button
            type="submit"
            disabled={submitting}
            className="bg-blue-500 text-white px-4 py-2 rounded disabled:bg-gray-400"
          >
            {submitting ? 'Saving...' : editingSponsor ? 'Update Sponsor' : 'Add Sponsor'}
          </button>
          {editingSponsor && (
            <button
              type="button"
              onClick={resetForm}
              className="bg-gray-500 text-white px-4 py-2 rounded"
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Logo</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tier</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Website</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sponsors.map((item) => (
              <tr key={item._id}>
                <td className="px-4 py-3">
                  <img src={item.logo} alt={item.name} className="h-10 w-24 object-contain" />
                </td>
                <td className="px-4 py-3 text-sm text-gray-900">{item.name}</td>
                <td className="px-4 py-3 text-sm text-gray-700 capitalize">{item.tier}</td>
                <td className="px-4 py-3 text-sm text-gray-700">
                  {item.website ? (
                    <a href={item.website} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">
                      Visit
                    </a>
                  ) : (
                    '-'
                  )}
                </td>
                <td className="px-4 py-3 text-sm text-gray-700">{item.order ?? 0}</td>
                <td className="px-4 py-3 text-sm">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      item.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {item.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm">
                  <button onClick={() => handleEdit(item)} className="text-indigo-600 hover:text-indigo-900 mr-4">
                    Edit
                  </button>
                  <button onClick={() => handleDelete(item._id)} className="text-red-600 hover:text-red-900">
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {sponsors.length === 0 && (
              <tr>
                <td className="px-4 py-6 text-sm text-gray-500 text-center" colSpan={7}>
                  No sponsors added yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ManageSponsors;
