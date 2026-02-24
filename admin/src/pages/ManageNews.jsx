import React, { useEffect, useRef, useState } from 'react';
import MDEditor from '@uiw/react-md-editor';
import '@uiw/react-md-editor/markdown-editor.css';
import '@uiw/react-markdown-preview/markdown.css';
import DataTable from '../components/DataTable';
import {
  getNews,
  createNews,
  updateNews,
  deleteNews,
  getEvents,
  createEvent,
  updateEvent,
  deleteEvent
} from '../utils/api';

const toSlug = (value) =>
  String(value || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

const ManageNews = () => {
  const [activeTab, setActiveTab] = useState('news');

  const [news, setNews] = useState([]);
  const [newsForm, setNewsForm] = useState({ title: '', slug: '', content: '', image: '' });
  const [editingNews, setEditingNews] = useState(null);
  const [newsSubmitting, setNewsSubmitting] = useState(false);
  const [newsSelectedFile, setNewsSelectedFile] = useState(null);
  const [newsSelectedFileName, setNewsSelectedFileName] = useState('');
  const newsFileInputRef = useRef(null);

  const [events, setEvents] = useState([]);
  const [eventForm, setEventForm] = useState({
    title: '',
    slug: '',
    description: '',
    content: '',
    image: '',
    startDateTime: '',
    endDateTime: '',
    location: '',
    isOnline: false,
    registrationLink: '',
    isPublished: true,
    isFeatured: false
  });
  const [editingEvent, setEditingEvent] = useState(null);
  const [eventSubmitting, setEventSubmitting] = useState(false);
  const [eventSelectedFile, setEventSelectedFile] = useState(null);
  const [eventSelectedFileName, setEventSelectedFileName] = useState('');
  const eventFileInputRef = useRef(null);

  const fetchNewsItems = async () => {
    const res = await getNews();
    setNews(res.data || []);
  };

  const fetchEventItems = async () => {
    const res = await getEvents();
    setEvents(res.data || []);
  };

  useEffect(() => {
    const load = async () => {
      try {
        await Promise.all([fetchNewsItems(), fetchEventItems()]);
      } catch (error) {
        console.error(error);
      }
    };
    load();
  }, []);

  const resetNewsForm = () => {
    setNewsForm({ title: '', slug: '', content: '', image: '' });
    setEditingNews(null);
    setNewsSelectedFile(null);
    setNewsSelectedFileName('');
    if (newsFileInputRef.current) newsFileInputRef.current.value = '';
  };

  const resetEventForm = () => {
    setEventForm({
      title: '',
      slug: '',
      description: '',
      content: '',
      image: '',
      startDateTime: '',
      endDateTime: '',
      location: '',
      isOnline: false,
      registrationLink: '',
      isPublished: true,
      isFeatured: false
    });
    setEditingEvent(null);
    setEventSelectedFile(null);
    setEventSelectedFileName('');
    if (eventFileInputRef.current) eventFileInputRef.current.value = '';
  };

  const handleNewsSubmit = async (e) => {
    e.preventDefault();
    if (newsSubmitting) return;
    if (!newsForm.content.trim()) return alert('Body is required');

    setNewsSubmitting(true);
    try {
      const payload = new FormData();
      payload.append('title', newsForm.title);
      payload.append('slug', newsForm.slug);
      payload.append('content', newsForm.content);
      payload.append('image', newsForm.image || '');
      if (newsSelectedFile) payload.append('imageFile', newsSelectedFile);

      if (editingNews) {
        await updateNews(editingNews._id, payload);
      } else {
        await createNews(payload);
      }
      await fetchNewsItems();
      resetNewsForm();
    } catch (error) {
      console.error(error);
    } finally {
      setNewsSubmitting(false);
    }
  };

  const handleEventSubmit = async (e) => {
    e.preventDefault();
    if (eventSubmitting) return;
    if (!eventForm.content.trim()) return alert('Body is required');
    if (!eventForm.startDateTime) return alert('Start date/time is required');

    setEventSubmitting(true);
    try {
      const payload = new FormData();
      Object.entries(eventForm).forEach(([key, value]) => {
        payload.append(key, typeof value === 'boolean' ? String(value) : (value || ''));
      });
      if (eventSelectedFile) payload.append('imageFile', eventSelectedFile);

      if (editingEvent) {
        await updateEvent(editingEvent._id, payload);
      } else {
        await createEvent(payload);
      }
      await fetchEventItems();
      resetEventForm();
    } catch (error) {
      console.error(error);
    } finally {
      setEventSubmitting(false);
    }
  };

  const newsColumns = [
    { header: 'Title', key: 'title' },
    { header: 'Slug', key: 'slug' },
    { header: 'Date', key: 'date' }
  ];

  const eventColumns = [
    { header: 'Title', key: 'title' },
    { header: 'Slug', key: 'slug' },
    { header: 'Start', key: 'displayStartDateTime' },
    { header: 'Published', key: 'displayPublished' }
  ];

  const eventTableData = events.map((item) => ({
    ...item,
    displayStartDateTime: item.startDateTime ? new Date(item.startDateTime).toLocaleString() : '-',
    displayPublished: item.isPublished ? 'Yes' : 'No'
  }));

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Manage News & Events</h1>

      <div className="flex gap-2 border-b pb-3 mb-6">
        <button
          type="button"
          onClick={() => setActiveTab('news')}
          className={`px-4 py-2 rounded ${activeTab === 'news' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'}`}
        >
          News
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('events')}
          className={`px-4 py-2 rounded ${activeTab === 'events' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'}`}
        >
          Events
        </button>
      </div>

      {activeTab === 'news' && (
        <>
          <form onSubmit={handleNewsSubmit} className="mb-6 bg-white p-6 rounded-lg shadow">
            <input
              type="text"
              placeholder="Title"
              value={newsForm.title}
              onChange={(e) => {
                const title = e.target.value;
                setNewsForm({ ...newsForm, title, slug: toSlug(title) });
              }}
              className="w-full p-2 mb-4 border rounded"
              required
            />
            <input
              type="text"
              placeholder="Slug"
              value={newsForm.slug}
              onChange={(e) => setNewsForm({ ...newsForm, slug: toSlug(e.target.value) })}
              className="w-full p-2 mb-4 border rounded"
              required
            />
            <input
              type="text"
              placeholder="Cloudinary Image URL (optional if file is selected)"
              value={newsForm.image}
              onChange={(e) => setNewsForm({ ...newsForm, image: e.target.value })}
              className="w-full p-2 mb-4 border rounded"
            />
            <div className="mb-4">
              <input ref={newsFileInputRef} type="file" accept="image/*" onChange={(e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                setNewsSelectedFile(file);
                setNewsSelectedFileName(file.name);
              }} className="hidden" />
              <button type="button" onClick={() => newsFileInputRef.current?.click()} className="inline-block bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300">Choose File</button>
              {newsSelectedFileName && <p className="mt-2 text-sm text-gray-600">Selected: {newsSelectedFileName}</p>}
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Body *</label>
              <MDEditor value={newsForm.content} onChange={(value) => setNewsForm((prev) => ({ ...prev, content: value || '' }))} preview="edit" height={300} />
            </div>
            <button type="submit" disabled={newsSubmitting} className="bg-blue-500 text-white px-4 py-2 rounded disabled:bg-gray-400">
              {newsSubmitting ? 'Saving...' : editingNews ? 'Update' : 'Add'} News
            </button>
          </form>

          <DataTable
            data={news}
            columns={newsColumns}
            onEdit={(item) => {
              setEditingNews(item);
              setNewsForm({ title: item.title, slug: item.slug || '', content: item.content || '', image: item.image || '' });
              setNewsSelectedFile(null);
              setNewsSelectedFileName('');
              if (newsFileInputRef.current) newsFileInputRef.current.value = '';
            }}
            onDelete={async (id) => {
              await deleteNews(id);
              await fetchNewsItems();
            }}
          />
        </>
      )}

      {activeTab === 'events' && (
        <>
          <form onSubmit={handleEventSubmit} className="mb-6 bg-white p-6 rounded-lg shadow">
            <input
              type="text"
              placeholder="Title"
              value={eventForm.title}
              onChange={(e) => {
                const title = e.target.value;
                setEventForm({ ...eventForm, title, slug: toSlug(title) });
              }}
              className="w-full p-2 mb-4 border rounded"
              required
            />
            <input
              type="text"
              placeholder="Slug"
              value={eventForm.slug}
              onChange={(e) => setEventForm({ ...eventForm, slug: toSlug(e.target.value) })}
              className="w-full p-2 mb-4 border rounded"
              required
            />
            <input
              type="text"
              placeholder="Short Description"
              value={eventForm.description}
              onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
              className="w-full p-2 mb-4 border rounded"
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <input
                type="datetime-local"
                value={eventForm.startDateTime}
                onChange={(e) => setEventForm({ ...eventForm, startDateTime: e.target.value })}
                className="w-full p-2 border rounded"
                required
              />
              <input
                type="datetime-local"
                value={eventForm.endDateTime}
                onChange={(e) => setEventForm({ ...eventForm, endDateTime: e.target.value })}
                className="w-full p-2 border rounded"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <input
                type="text"
                placeholder="Location"
                value={eventForm.location}
                onChange={(e) => setEventForm({ ...eventForm, location: e.target.value })}
                className="w-full p-2 border rounded"
              />
              <input
                type="url"
                placeholder="Registration Link"
                value={eventForm.registrationLink}
                onChange={(e) => setEventForm({ ...eventForm, registrationLink: e.target.value })}
                className="w-full p-2 border rounded"
              />
            </div>
            <input
              type="text"
              placeholder="Cloudinary Image URL (optional if file is selected)"
              value={eventForm.image}
              onChange={(e) => setEventForm({ ...eventForm, image: e.target.value })}
              className="w-full p-2 mb-4 border rounded"
            />
            <div className="mb-4">
              <input ref={eventFileInputRef} type="file" accept="image/*" onChange={(e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                setEventSelectedFile(file);
                setEventSelectedFileName(file.name);
              }} className="hidden" />
              <button type="button" onClick={() => eventFileInputRef.current?.click()} className="inline-block bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300">Choose File</button>
              {eventSelectedFileName && <p className="mt-2 text-sm text-gray-600">Selected: {eventSelectedFileName}</p>}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <label className="flex items-center gap-2"><input type="checkbox" checked={eventForm.isOnline} onChange={(e) => setEventForm({ ...eventForm, isOnline: e.target.checked })} />Online Event</label>
              <label className="flex items-center gap-2"><input type="checkbox" checked={eventForm.isPublished} onChange={(e) => setEventForm({ ...eventForm, isPublished: e.target.checked })} />Published</label>
              <label className="flex items-center gap-2"><input type="checkbox" checked={eventForm.isFeatured} onChange={(e) => setEventForm({ ...eventForm, isFeatured: e.target.checked })} />Featured</label>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Body *</label>
              <MDEditor value={eventForm.content} onChange={(value) => setEventForm((prev) => ({ ...prev, content: value || '' }))} preview="edit" height={300} />
            </div>
            <button type="submit" disabled={eventSubmitting} className="bg-blue-500 text-white px-4 py-2 rounded disabled:bg-gray-400">
              {eventSubmitting ? 'Saving...' : editingEvent ? 'Update' : 'Add'} Event
            </button>
          </form>

          <DataTable
            data={eventTableData}
            columns={eventColumns}
            onEdit={(item) => {
              setEditingEvent(item);
              setEventForm({
                title: item.title || '',
                slug: item.slug || '',
                description: item.description || '',
                content: item.content || '',
                image: item.image || '',
                startDateTime: item.startDateTime ? new Date(item.startDateTime).toISOString().slice(0, 16) : '',
                endDateTime: item.endDateTime ? new Date(item.endDateTime).toISOString().slice(0, 16) : '',
                location: item.location || '',
                isOnline: !!item.isOnline,
                registrationLink: item.registrationLink || '',
                isPublished: !!item.isPublished,
                isFeatured: !!item.isFeatured
              });
              setEventSelectedFile(null);
              setEventSelectedFileName('');
              if (eventFileInputRef.current) eventFileInputRef.current.value = '';
            }}
            onDelete={async (id) => {
              await deleteEvent(id);
              await fetchEventItems();
            }}
          />
        </>
      )}
    </div>
  );
};

export default ManageNews;
