import React, { useEffect, useRef, useState } from 'react';
import { createOrUpdateSiteSettings, getSiteSettingsAdmin } from '../utils/api';

const initialForm = {
  organizationName: '',
  organizationSubline: '',
  logoUrl: '',
  supportMessage: '',
  footerAboutTitle: '',
  footerAboutText: '',
  footerPhone: '',
  footerEmail: '',
  footerSecondaryEmail: '',
  footerWebsite: '',
  footerAddress: '',
  footerCopyrightText: '',
  facebookUrl: '',
  instagramUrl: '',
  linkedinUrl: '',
  twitterUrl: '',
  youtubeUrl: ''
};

const Settings = () => {
  const [formData, setFormData] = useState(initialForm);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedFileName, setSelectedFileName] = useState('');
  const [selectedFilePreview, setSelectedFilePreview] = useState('');
  const fileInputRef = useRef(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await getSiteSettingsAdmin();
        setFormData((prev) => ({
          ...prev,
          ...response.data
        }));
      } catch (error) {
        console.error('Failed to load site settings:', error);
        alert('Failed to load site settings');
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
      payload.append('organizationName', formData.organizationName || '');
      payload.append('organizationSubline', formData.organizationSubline || '');
      payload.append('logoUrl', formData.logoUrl || '');
      payload.append('supportMessage', formData.supportMessage || '');
      payload.append('footerAboutTitle', formData.footerAboutTitle || '');
      payload.append('footerAboutText', formData.footerAboutText || '');
      payload.append('footerPhone', formData.footerPhone || '');
      payload.append('footerEmail', formData.footerEmail || '');
      payload.append('footerSecondaryEmail', formData.footerSecondaryEmail || '');
      payload.append('footerWebsite', formData.footerWebsite || '');
      payload.append('footerAddress', formData.footerAddress || '');
      payload.append('footerCopyrightText', formData.footerCopyrightText || '');
      payload.append('facebookUrl', formData.facebookUrl || '');
      payload.append('instagramUrl', formData.instagramUrl || '');
      payload.append('linkedinUrl', formData.linkedinUrl || '');
      payload.append('twitterUrl', formData.twitterUrl || '');
      payload.append('youtubeUrl', formData.youtubeUrl || '');

      if (selectedFile) {
        payload.append('logoFile', selectedFile);
      }

      const response = await createOrUpdateSiteSettings(payload);
      setFormData((prev) => ({
        ...prev,
        ...response.data
      }));

      setSelectedFile(null);
      setSelectedFileName('');
      setSelectedFilePreview('');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      alert('Site settings saved successfully');
    } catch (error) {
      console.error('Failed to save site settings:', error);
      alert(error?.response?.data?.message || 'Failed to save site settings');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="p-6">Loading site settings...</div>;

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Site Settings</h1>
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 max-w-3xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1">Organization Name</label>
            <input
              type="text"
              name="organizationName"
              value={formData.organizationName || ''}
              onChange={handleChange}
              className="w-full p-2 border rounded"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1">Organization Subline (2nd line)</label>
            <input
              type="text"
              name="organizationSubline"
              value={formData.organizationSubline || ''}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              placeholder="Society for Eco-development Voluntary Action"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1">Top Bar Message</label>
            <input
              type="text"
              name="supportMessage"
              value={formData.supportMessage || ''}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              placeholder="Support our mission to transform lives."
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1">Logo URL</label>
            <input
              type="text"
              name="logoUrl"
              value={formData.logoUrl || ''}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              placeholder="https://..."
            />
          </div>
        </div>

        <div className="mb-6 text-left">
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
            Choose Logo File
          </button>
          {selectedFileName && (
            <p className="mt-2 text-sm text-gray-600">Selected: {selectedFileName}</p>
          )}
          {!selectedFileName && formData.logoUrl && (
            <p className="mt-2 text-sm text-gray-600">Using current logo URL</p>
          )}
        </div>

        {(selectedFilePreview || formData.logoUrl) && (
          <div className="mb-6">
            <p className="text-sm text-gray-600 mb-2">Logo Preview</p>
            <img
              src={selectedFilePreview || formData.logoUrl}
              alt="Logo preview"
              className="h-16 w-16 object-contain border rounded p-2 bg-white"
            />
          </div>
        )}

        <h2 className="text-lg font-semibold mb-3">Footer Settings</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1">Footer About Title</label>
            <input
              type="text"
              name="footerAboutTitle"
              value={formData.footerAboutTitle || ''}
              onChange={handleChange}
              className="w-full p-2 border rounded"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1">Footer About Text</label>
            <textarea
              name="footerAboutText"
              rows={3}
              value={formData.footerAboutText || ''}
              onChange={handleChange}
              className="w-full p-2 border rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Footer Phone</label>
            <input
              type="text"
              name="footerPhone"
              value={formData.footerPhone || ''}
              onChange={handleChange}
              className="w-full p-2 border rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Footer Email</label>
            <input
              type="email"
              name="footerEmail"
              value={formData.footerEmail || ''}
              onChange={handleChange}
              className="w-full p-2 border rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Footer Secondary Email</label>
            <input
              type="email"
              name="footerSecondaryEmail"
              value={formData.footerSecondaryEmail || ''}
              onChange={handleChange}
              className="w-full p-2 border rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Footer Website</label>
            <input
              type="text"
              name="footerWebsite"
              value={formData.footerWebsite || ''}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              placeholder="www.manavsevaindia.org"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1">Footer Address</label>
            <textarea
              name="footerAddress"
              rows={2}
              value={formData.footerAddress || ''}
              onChange={handleChange}
              className="w-full p-2 border rounded"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1">Footer Copyright Text</label>
            <input
              type="text"
              name="footerCopyrightText"
              value={formData.footerCopyrightText || ''}
              onChange={handleChange}
              className="w-full p-2 border rounded"
            />
          </div>
        </div>

        <h2 className="text-lg font-semibold mb-3">Social Links</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium mb-1">Facebook URL</label>
            <input
              type="url"
              name="facebookUrl"
              value={formData.facebookUrl || ''}
              onChange={handleChange}
              className="w-full p-2 border rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Instagram URL</label>
            <input
              type="url"
              name="instagramUrl"
              value={formData.instagramUrl || ''}
              onChange={handleChange}
              className="w-full p-2 border rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">LinkedIn URL</label>
            <input
              type="url"
              name="linkedinUrl"
              value={formData.linkedinUrl || ''}
              onChange={handleChange}
              className="w-full p-2 border rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Twitter/X URL</label>
            <input
              type="url"
              name="twitterUrl"
              value={formData.twitterUrl || ''}
              onChange={handleChange}
              className="w-full p-2 border rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">YouTube URL</label>
            <input
              type="url"
              name="youtubeUrl"
              value={formData.youtubeUrl || ''}
              onChange={handleChange}
              className="w-full p-2 border rounded"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="bg-blue-500 text-white px-4 py-2 rounded disabled:bg-gray-400"
        >
          {submitting ? 'Saving...' : 'Save Settings'}
        </button>
      </form>
    </div>
  );
};

export default Settings;
