import React, { useEffect, useState } from 'react';
import DataTable from '../components/DataTable';
import { getAllSliders, createSlider, updateSlider, deleteSlider } from '../utils/api';

const ManageSliders = () => {
  const [sliders, setSliders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [editingSlider, setEditingSlider] = useState(null);
  const [preview, setPreview] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    image: '',
    order: 0,
    buttonText: 'Learn More',
    buttonLink: '/about',
    isActive: true
  });

  useEffect(() => {
    fetchSliders();
  }, []);

  const fetchSliders = async () => {
    try {
      const response = await getAllSliders();
      setSliders(response.data);
    } catch (error) {
      console.error('Failed to fetch sliders:', error);
      alert('Failed to fetch sliders');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      // Validate required fields
      if (!formData.title || !formData.subtitle) {
        alert('Title and subtitle are required');
        setSubmitting(false);
        return;
      }

      // Validate image
      if (!formData.image) {
        alert('Please provide an image URL or upload an image file');
        setSubmitting(false);
        return;
      }

      // Build FormData for file upload support
      const payload = new FormData();
      payload.append('title', formData.title);
      payload.append('subtitle', formData.subtitle);
      payload.append('order', formData.order ?? 0);
      payload.append('buttonText', formData.buttonText || 'Learn More');
      payload.append('buttonLink', formData.buttonLink || '/about');
      payload.append('isActive', formData.isActive ? 'true' : 'false');
      
      // image can be a File or a URL string
      if (typeof formData.image === 'string') {
        payload.append('image', formData.image);
      } else {
        payload.append('image', formData.image);
      }

      if (editingSlider) {
        await updateSlider(editingSlider._id, payload);
      } else {
        await createSlider(payload);
      }
      await fetchSliders();
      resetForm();
      alert('Slider saved successfully!');
    } catch (error) {
      console.error('Failed to save slider:', error);
      alert('Failed to save slider: ' + (error.response?.data?.message || error.message));
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (slider) => {
    setEditingSlider(slider);
    setFormData({
      title: slider.title,
      subtitle: slider.subtitle,
      image: slider.image || '',
      order: slider.order,
      buttonText: slider.buttonText,
      buttonLink: slider.buttonLink,
      isActive: slider.isActive
    });
    setPreview(slider.image);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this slider?')) return;

    try {
      await deleteSlider(id);
      await fetchSliders();
    } catch (error) {
      console.error('Failed to delete slider:', error);
      alert('Failed to delete slider');
    }
  };

  const resetForm = () => {
    setEditingSlider(null);
    setFormData({
      title: '',
      subtitle: '',
      image: '',
      order: 0,
      buttonText: 'Learn More',
      buttonLink: '/about',
      isActive: true
    });
    setPreview('');
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
      
      // In production, you'd upload to Cloudinary here
      // For now, store the file
      setFormData(prev => ({
        ...prev,
        image: file
      }));
    }
  };

  if (loading) return <div className="p-6">Loading...</div>;

  const columns = [
    { key: 'title', label: 'Title' },
    { key: 'subtitle', label: 'Subtitle' },
    { 
      key: 'image', 
      label: 'Image',
      render: (value) => (
        <img src={value} alt="slider" className="w-20 h-12 object-cover rounded" />
      )
    },
    { key: 'order', label: 'Order' },
    { 
      key: 'isActive', 
      label: 'Status',
      render: (value) => (value ? '✓ Active' : '✗ Inactive')
    }
  ];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Manage Home Slider</h1>

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow mb-6">
        <h2 className="text-xl font-semibold mb-4">
          {editingSlider ? 'Edit Slider' : 'Add New Slider'}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-semibold mb-2">Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className="w-full border rounded px-3 py-2"
              placeholder="Slider title"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Button Text</label>
            <input
              type="text"
              value={formData.buttonText}
              onChange={(e) => setFormData(prev => ({ ...prev, buttonText: e.target.value }))}
              className="w-full border rounded px-3 py-2"
              placeholder="e.g., Learn More"
            />
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-semibold mb-2">Subtitle</label>
          <textarea
            value={formData.subtitle}
            onChange={(e) => setFormData(prev => ({ ...prev, subtitle: e.target.value }))}
            className="w-full border rounded px-3 py-2"
            placeholder="Slider subtitle"
            rows="2"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-semibold mb-2">Button Link</label>
          <input
            type="text"
            value={formData.buttonLink}
            onChange={(e) => setFormData(prev => ({ ...prev, buttonLink: e.target.value }))}
            className="w-full border rounded px-3 py-2"
            placeholder="e.g., /about"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-semibold mb-2">Image URL</label>
            <input
              type="text"
              value={typeof formData.image === 'string' ? formData.image : ''}
              onChange={(e) => {
                setFormData(prev => ({ ...prev, image: e.target.value }));
                setPreview(e.target.value);
              }}
              className="w-full border rounded px-3 py-2"
              placeholder="Image URL from Cloudinary"
            />
            <div className="mt-2">
              <label className="block text-sm font-semibold mb-2">Or upload image</label>
              <input type="file" accept="image/*" onChange={handleImageChange} />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Order</label>
            <input
              type="number"
              value={formData.order}
              onChange={(e) => setFormData(prev => ({ ...prev, order: parseInt(e.target.value) }))}
              className="w-full border rounded px-3 py-2"
              min="0"
            />
          </div>
        </div>

        <div className="mb-4">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={formData.isActive}
              onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
              className="w-4 h-4"
            />
            <span className="text-sm font-semibold">Active</span>
          </label>
        </div>

        {preview && (
          <div className="mb-4">
            <label className="block text-sm font-semibold mb-2">Preview</label>
            <img src={preview} alt="preview" className="w-full h-48 object-cover rounded" />
          </div>
        )}

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
          >
            {submitting ? 'Saving...' : editingSlider ? 'Update Slider' : 'Add Slider'}
          </button>
          {editingSlider && (
            <button
              type="button"
              onClick={resetForm}
              className="px-6 py-2 bg-gray-400 text-white rounded hover:bg-gray-500"
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      {/* Table */}
      <div className="bg-white rounded-lg shadow">
        <DataTable
          columns={columns}
          data={sliders}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>
    </div>
  );
};

export default ManageSliders;
