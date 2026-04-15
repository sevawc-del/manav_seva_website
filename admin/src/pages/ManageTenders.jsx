import React, { useEffect, useRef, useState } from 'react';
import DataTable from '../components/DataTable';
import {
  getTenders,
  createTender,
  updateTender,
  deleteTender,
  uploadTenderDocument
} from '../utils/api';
import { useToast } from '../context/ToastContext';

const ManageTenders = () => {
  const toast = useToast();
  const [tenders, setTenders] = useState([]);
  const [formData, setFormData] = useState({ title: '', description: '', deadline: '', documents: '' });
  const [editing, setEditing] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedFileName, setSelectedFileName] = useState('');
  const [uploadingFile, setUploadingFile] = useState(false);
  const fileInputRef = useRef(null);

  const fetchTenders = async () => {
    try {
      const res = await getTenders();
      setTenders(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    const loadTenders = async () => {
      await fetchTenders();
    };
    loadTenders();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let payload = { ...formData };
      if (selectedFile) {
        setUploadingFile(true);
        const response = await uploadTenderDocument(selectedFile);
        const fileUrl = response?.data?.fileUrl || '';
        if (!fileUrl) {
          throw new Error('Upload succeeded but no file URL returned');
        }
        payload = { ...payload, documents: fileUrl };
      }

      if (editing) {
        await updateTender(editing._id, payload);
      } else {
        await createTender(payload);
      }
      setFormData({ title: '', description: '', deadline: '', documents: '' });
      setEditing(null);
      setSelectedFile(null);
      setSelectedFileName('');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      fetchTenders();
    } catch (error) {
      console.error(error);
      toast.error(error?.response?.data?.message || 'Failed to save tender');
    } finally {
      setUploadingFile(false);
    }
  };

  const handleEdit = (item) => {
    const documentsValue = Array.isArray(item.documents)
      ? (item.documents[0] || '')
      : (item.documents || '');
    setFormData({
      title: item.title,
      description: item.description,
      deadline: item.deadline ? String(item.deadline).split('T')[0] : '',
      documents: documentsValue
    });
    setEditing(item);
    setSelectedFile(null);
    setSelectedFileName('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteTender(id);
      fetchTenders();
    } catch (error) {
      console.error(error);
      toast.error('Failed to delete tender');
    }
  };

  const columns = [
    { header: 'Title', key: 'title' },
    { header: 'Description', key: 'description' },
    { header: 'Deadline', key: 'deadline' },
  ];

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Manage Tenders</h1>
      <form onSubmit={handleSubmit} className="mb-6">
        <input
          type="text"
          placeholder="Title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          className="w-full p-2 mb-4 border rounded"
          required
        />
        <textarea
          placeholder="Description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="w-full p-2 mb-4 border rounded"
          required
        />
        <input
          type="date"
          placeholder="Deadline"
          value={formData.deadline}
          onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
          className="w-full p-2 mb-4 border rounded"
          required
        />
        <input
          type="text"
          placeholder="Documents URL"
          value={formData.documents}
          onChange={(e) => setFormData({ ...formData, documents: e.target.value })}
          className="w-full p-2 mb-4 border rounded"
        />
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,.zip,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            setSelectedFile(file);
            setSelectedFileName(file.name);
          }}
        />
        <button
          type="button"
          disabled={uploadingFile}
          onClick={() => fileInputRef.current?.click()}
          className="bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed mb-4"
        >
          Choose File
        </button>
        {selectedFileName && <p className="mb-4 text-sm text-gray-600">Selected: {selectedFileName}</p>}
        {!selectedFileName && editing && formData.documents && (
          <p className="mb-4 text-sm text-gray-600">Using current document URL</p>
        )}
        <button
          type="submit"
          disabled={uploadingFile}
          className="bg-blue-500 text-white px-4 py-2 rounded disabled:bg-gray-400"
        >
          {uploadingFile ? 'Uploading...' : `${editing ? 'Update' : 'Add'} Tender`}
        </button>
      </form>
      <DataTable data={tenders} columns={columns} onEdit={handleEdit} onDelete={handleDelete} />
    </div>
  );
};

export default ManageTenders;
