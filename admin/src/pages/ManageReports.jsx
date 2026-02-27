import React, { useEffect, useRef, useState } from 'react';
import DataTable from '../components/DataTable';
import {
  getReports,
  createReport,
  updateReport,
  deleteReport,
  uploadReportFile
} from '../utils/api';

const ManageReports = () => {
  const [reports, setReports] = useState([]);
  const [formData, setFormData] = useState({ title: '', content: '', year: '', file: '' });
  const [editing, setEditing] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedFileName, setSelectedFileName] = useState('');
  const [uploadingFile, setUploadingFile] = useState(false);
  const fileInputRef = useRef(null);

  const fetchReports = async () => {
    try {
      const res = await getReports();
      setReports(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    const loadReports = async () => {
      await fetchReports();
    };
    loadReports();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let payload = { ...formData };
      if (selectedFile) {
        setUploadingFile(true);
        const response = await uploadReportFile(selectedFile);
        const fileUrl = response?.data?.fileUrl || '';
        if (!fileUrl) {
          throw new Error('Upload succeeded but no file URL returned');
        }
        payload = { ...payload, file: fileUrl };
      }

      if (editing) {
        await updateReport(editing._id, payload);
      } else {
        await createReport(payload);
      }
      setFormData({ title: '', content: '', year: '', file: '' });
      setEditing(null);
      setSelectedFile(null);
      setSelectedFileName('');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      fetchReports();
    } catch (error) {
      console.error(error);
      alert(error?.response?.data?.message || 'Failed to save report');
    } finally {
      setUploadingFile(false);
    }
  };

  const handleEdit = (item) => {
    setFormData({ title: item.title, content: item.content, year: item.year, file: item.file });
    setEditing(item);
    setSelectedFile(null);
    setSelectedFileName('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteReport(id);
      fetchReports();
    } catch (error) {
      console.error(error);
    }
  };

  const columns = [
    { header: 'Title', key: 'title' },
    { header: 'Year', key: 'year' },
    { header: 'Content', key: 'content' },
  ];

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Manage Reports</h1>
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
          placeholder="Content"
          value={formData.content}
          onChange={(e) => setFormData({ ...formData, content: e.target.value })}
          className="w-full p-2 mb-4 border rounded"
          required
        />
        <input
          type="number"
          placeholder="Year"
          value={formData.year}
          onChange={(e) => setFormData({ ...formData, year: e.target.value })}
          className="w-full p-2 mb-4 border rounded"
          required
        />
        <input
          type="text"
          placeholder="File URL"
          value={formData.file}
          onChange={(e) => setFormData({ ...formData, file: e.target.value })}
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
        {!selectedFileName && editing && formData.file && (
          <p className="mb-4 text-sm text-gray-600">Using current file URL</p>
        )}
        <button
          type="submit"
          disabled={uploadingFile}
          className="bg-blue-500 text-white px-4 py-2 rounded disabled:bg-gray-400"
        >
          {uploadingFile ? 'Uploading...' : `${editing ? 'Update' : 'Add'} Report`}
        </button>
      </form>
      <DataTable data={reports} columns={columns} onEdit={handleEdit} onDelete={handleDelete} />
    </div>
  );
};

export default ManageReports;
