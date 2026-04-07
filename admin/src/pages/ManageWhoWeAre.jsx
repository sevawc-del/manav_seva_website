import React, { useEffect, useRef, useState } from 'react';
import { createOrUpdateSiteSettings, getSiteSettingsAdmin } from '../utils/api';

const initialForm = {
  chairpersonName: '',
  chairpersonImageUrl: '',
  homeWhoTitle: '',
  homeWhoLeftText: '',
  homeWhoRightTitle: '',
  homeWhoRightText: '',
  homeWhoRightImageUrl: ''
};

const ManageWhoWeAre = () => {
  const [formData, setFormData] = useState(initialForm);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [chairpersonFile, setChairpersonFile] = useState(null);
  const [chairpersonFileName, setChairpersonFileName] = useState('');
  const [chairpersonPreview, setChairpersonPreview] = useState('');

  const [rightFile, setRightFile] = useState(null);
  const [rightFileName, setRightFileName] = useState('');
  const [rightPreview, setRightPreview] = useState('');

  const chairpersonFileInputRef = useRef(null);
  const rightFileInputRef = useRef(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await getSiteSettingsAdmin();
        setFormData((prev) => ({
          ...prev,
          ...response.data
        }));
      } catch (error) {
        console.error('Failed to load Who We Are settings:', error);
        alert('Failed to load Who We Are settings');
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);

    try {
      const payload = new FormData();
      payload.append('chairpersonName', formData.chairpersonName || '');
      payload.append('chairpersonImageUrl', formData.chairpersonImageUrl || '');
      payload.append('homeWhoTitle', formData.homeWhoTitle || '');
      payload.append('homeWhoLeftText', formData.homeWhoLeftText || '');
      payload.append('homeWhoRightTitle', formData.homeWhoRightTitle || '');
      payload.append('homeWhoRightText', formData.homeWhoRightText || '');
      payload.append('homeWhoRightImageUrl', formData.homeWhoRightImageUrl || '');

      if (chairpersonFile) {
        payload.append('chairpersonImageFile', chairpersonFile);
      }
      if (rightFile) {
        payload.append('homeWhoRightImageFile', rightFile);
      }

      const response = await createOrUpdateSiteSettings(payload);
      setFormData((prev) => ({
        ...prev,
        ...response.data
      }));

      setChairpersonFile(null);
      setChairpersonFileName('');
      setChairpersonPreview('');
      setRightFile(null);
      setRightFileName('');
      setRightPreview('');

      if (chairpersonFileInputRef.current) {
        chairpersonFileInputRef.current.value = '';
      }
      if (rightFileInputRef.current) {
        rightFileInputRef.current.value = '';
      }

      alert('Who We Are section saved successfully');
    } catch (error) {
      console.error('Failed to save Who We Are settings:', error);
      alert(error?.response?.data?.message || 'Failed to save Who We Are settings');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="p-6">Loading Who We Are settings...</div>;

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-2">Who We Are Section</h2>
      <p className="text-sm text-gray-600 mb-6">
        Configure the left chairperson block and right highlight block shown on homepage.
      </p>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 max-w-4xl">
        <h3 className="text-lg font-semibold mb-3">Left Block (Chairperson Side)</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium mb-1">Section Title</label>
            <input
              type="text"
              name="homeWhoTitle"
              value={formData.homeWhoTitle || ''}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              placeholder="Who are we?"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Chairperson Name</label>
            <input
              type="text"
              name="chairpersonName"
              value={formData.chairpersonName || ''}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              placeholder="Chairperson"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1">Left Text</label>
            <textarea
              name="homeWhoLeftText"
              rows={4}
              value={formData.homeWhoLeftText || ''}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              placeholder="Text shown below the section title on the left side."
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1">Chairperson Image URL</label>
            <input
              type="text"
              name="chairpersonImageUrl"
              value={formData.chairpersonImageUrl || ''}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              placeholder="https://..."
            />
          </div>
        </div>

        <div className="mb-6 text-left">
          <input
            ref={chairpersonFileInputRef}
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              setChairpersonFile(file);
              setChairpersonFileName(file.name);
              const reader = new FileReader();
              reader.onloadend = () => {
                setChairpersonPreview(String(reader.result || ''));
              };
              reader.readAsDataURL(file);
            }}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => chairpersonFileInputRef.current?.click()}
            disabled={submitting}
            className="inline-block bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
          >
            Choose Chairperson Image
          </button>
          {chairpersonFileName && (
            <p className="mt-2 text-sm text-gray-600">Selected: {chairpersonFileName}</p>
          )}
        </div>

        {(chairpersonPreview || formData.chairpersonImageUrl) && (
          <div className="mb-8">
            <p className="text-sm text-gray-600 mb-2">Chairperson Preview</p>
            <img
              src={chairpersonPreview || formData.chairpersonImageUrl}
              alt="Chairperson preview"
              className="h-20 w-20 object-cover border rounded-full bg-white"
            />
          </div>
        )}

        <h3 className="text-lg font-semibold mb-3">Right Block (Highlight Side)</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium mb-1">Right Block Title</label>
            <input
              type="text"
              name="homeWhoRightTitle"
              value={formData.homeWhoRightTitle || ''}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              placeholder="In Focus"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1">Right Text</label>
            <textarea
              name="homeWhoRightText"
              rows={3}
              value={formData.homeWhoRightText || ''}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              placeholder="Text shown below right image."
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1">Right Image URL</label>
            <input
              type="text"
              name="homeWhoRightImageUrl"
              value={formData.homeWhoRightImageUrl || ''}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              placeholder="https://..."
            />
          </div>
        </div>

        <div className="mb-6 text-left">
          <input
            ref={rightFileInputRef}
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              setRightFile(file);
              setRightFileName(file.name);
              const reader = new FileReader();
              reader.onloadend = () => {
                setRightPreview(String(reader.result || ''));
              };
              reader.readAsDataURL(file);
            }}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => rightFileInputRef.current?.click()}
            disabled={submitting}
            className="inline-block bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
          >
            Choose Right Block Image
          </button>
          {rightFileName && (
            <p className="mt-2 text-sm text-gray-600">Selected: {rightFileName}</p>
          )}
        </div>

        {(rightPreview || formData.homeWhoRightImageUrl) && (
          <div className="mb-8">
            <p className="text-sm text-gray-600 mb-2">Right Block Preview</p>
            <img
              src={rightPreview || formData.homeWhoRightImageUrl}
              alt="Right block preview"
              className="h-28 w-44 object-cover border rounded bg-white"
            />
          </div>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="bg-blue-500 text-white px-4 py-2 rounded disabled:bg-gray-400"
        >
          {submitting ? 'Saving...' : 'Save Who We Are Section'}
        </button>
      </form>
    </div>
  );
};

export default ManageWhoWeAre;
