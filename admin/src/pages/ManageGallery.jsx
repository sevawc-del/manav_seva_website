import React, { useEffect, useRef, useState } from 'react';
import DataTable from '../components/DataTable';
import { getGallery, createGalleryItem, updateGalleryItem, deleteGalleryItem } from '../utils/api';

const ManageGallery = () => {
  const [gallery, setGallery] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({ title: '', image: '', description: '' });
  const [editing, setEditing] = useState(null);
  const [selectedFileName, setSelectedFileName] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);

  const fetchGallery = async () => {
    try {
      const res = await getGallery();
      setGallery(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    const loadGallery = async () => {
      await fetchGallery();
    };
    loadGallery();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);

    try {
      const payload = new FormData();
      payload.append('title', formData.title);
      payload.append('description', formData.description);
      if (formData.image) {
        payload.append('image', formData.image);
      }
      if (selectedFile) {
        payload.append('imageFile', selectedFile);
      }

      if (editing) {
        await updateGalleryItem(editing._id, payload);
      } else {
        if (!selectedFile && !formData.image.trim()) {
          alert('Please choose an image file or provide an image URL.');
          setSubmitting(false);
          return;
        }
        await createGalleryItem(payload);
      }
      setFormData({ title: '', image: '', description: '' });
      setEditing(null);
      setSelectedFile(null);
      setSelectedFileName('');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      fetchGallery();
    } catch (error) {
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (item) => {
    setFormData({ title: item.title, image: item.image, description: item.description });
    setEditing(item);
    setSelectedFile(null);
    setSelectedFileName('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleImageFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    setSelectedFileName(file.name);
  };

  const handleDelete = async (id) => {
    try {
      await deleteGalleryItem(id);
      fetchGallery();
    } catch (error) {
      console.error(error);
    }
  };

  const columns = [
    { header: 'Title', key: 'title' },
    { header: 'Description', key: 'description' },
    { header: 'Date', key: 'date' },
  ];

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Manage Gallery</h1>
      <form onSubmit={handleSubmit} className="mb-6">
        <input
          type="text"
          placeholder="Title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          className="w-full p-2 mb-4 border rounded"
          required
        />
        <input
          type="text"
          placeholder="Cloudinary Image URL (optional if file is selected)"
          value={formData.image}
          onChange={(e) => setFormData({ ...formData, image: e.target.value })}
          className="w-full p-2 mb-4 border rounded"
        />
        <div className="mb-4 text-left">
          <label className="block text-sm font-medium text-gray-700 mb-2">Image</label>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageFileChange}
            className="hidden"
          />
          <button
            type="button"
            disabled={submitting}
            onClick={() => fileInputRef.current?.click()}
            className="inline-block bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
          >
            Choose File
          </button>
          {selectedFileName && (
            <p className="mt-2 text-sm text-gray-600">Selected: {selectedFileName}</p>
          )}
          {!selectedFileName && editing && formData.image && (
            <p className="mt-2 text-sm text-gray-600">Using current Cloudinary image</p>
          )}
        </div>
        <textarea
          placeholder="Description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="w-full p-2 mb-4 border rounded"
        />
        <button
          type="submit"
          disabled={submitting}
          className="bg-blue-500 text-white px-4 py-2 rounded disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {submitting ? 'Saving...' : editing ? 'Update' : 'Add'} Gallery Item
        </button>
      </form>
      <DataTable data={gallery} columns={columns} onEdit={handleEdit} onDelete={handleDelete} />
    </div>
  );
};

export default ManageGallery;
