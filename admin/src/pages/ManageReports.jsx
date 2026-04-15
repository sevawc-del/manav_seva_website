import React, { useEffect, useRef, useState } from 'react';
import DataTable from '../components/DataTable';
import {
  getReports,
  createReport,
  updateReport,
  deleteReport,
  uploadReportFile,
  getReportAccessRequests,
  updateReportAccessRequestStatus
} from '../utils/api';
import { useToast } from '../context/ToastContext';

const ManageReports = () => {
  const toast = useToast();
  const [reports, setReports] = useState([]);
  const [accessRequests, setAccessRequests] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    category: 'General',
    visibility: 'public',
    content: '',
    year: '',
    file: '',
    filePublicId: '',
    fileResourceType: '',
    fileFormat: ''
  });
  const [editing, setEditing] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedFileName, setSelectedFileName] = useState('');
  const [uploadingFile, setUploadingFile] = useState(false);
  const [updatingRequestId, setUpdatingRequestId] = useState('');
  const fileInputRef = useRef(null);

  const fetchReports = async () => {
    try {
      const res = await getReports();
      const normalized = (res.data || []).map((report) => ({
        ...report,
        category: String(report?.category || '').trim() || 'General',
        visibility: String(report?.visibility || '').trim().toLowerCase() === 'protected' ? 'protected' : 'public'
      }));
      setReports(normalized);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchAccessRequests = async () => {
    try {
      const response = await getReportAccessRequests();
      setAccessRequests(response.data || []);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      await Promise.all([fetchReports(), fetchAccessRequests()]);
    };
    loadData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let payload = {
        ...formData,
        category: String(formData.category || 'General').trim() || 'General',
        visibility: formData.visibility === 'protected' ? 'protected' : 'public'
      };
      if (selectedFile) {
        setUploadingFile(true);
        const response = await uploadReportFile(selectedFile);
        const fileUrl = response?.data?.fileUrl || '';
        const filePublicId = response?.data?.filePublicId || '';
        const fileResourceType = response?.data?.fileResourceType || '';
        const fileFormat = response?.data?.fileFormat || '';
        if (!fileUrl) {
          throw new Error('Upload succeeded but no file URL returned');
        }
        payload = {
          ...payload,
          file: fileUrl,
          filePublicId,
          fileResourceType,
          fileFormat
        };
      }

      if (editing) {
        await updateReport(editing._id, payload);
      } else {
        await createReport(payload);
      }
      setFormData({
        title: '',
        category: 'General',
        visibility: 'public',
        content: '',
        year: '',
        file: '',
        filePublicId: '',
        fileResourceType: '',
        fileFormat: ''
      });
      setEditing(null);
      setSelectedFile(null);
      setSelectedFileName('');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      fetchReports();
    } catch (error) {
      console.error(error);
      toast.error(error?.response?.data?.message || 'Failed to save report');
    } finally {
      setUploadingFile(false);
    }
  };

  const handleEdit = (item) => {
    setFormData({
      title: item.title || '',
      category: item.category || 'General',
      visibility: item.visibility || 'public',
      content: item.content || '',
      year: item.year || '',
      file: item.file || item.fileUrl || '',
      filePublicId: item.filePublicId || '',
      fileResourceType: item.fileResourceType || '',
      fileFormat: item.fileFormat || ''
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
      await deleteReport(id);
      fetchReports();
    } catch (error) {
      console.error(error);
      toast.error('Failed to delete report');
    }
  };

  const columns = [
    { header: 'Title', key: 'title' },
    { header: 'Category', key: 'category' },
    { header: 'Visibility', key: 'visibility' },
    { header: 'Year', key: 'year' },
    { header: 'Content', key: 'content' },
  ];

  const handleUpdateRequestStatus = async (requestId, status) => {
    if (!requestId) return;
    try {
      setUpdatingRequestId(requestId);
      await updateReportAccessRequestStatus(requestId, {
        status,
        expiresInDays: status === 'approved' ? 1 : undefined
      });
      await fetchAccessRequests();
    } catch (error) {
      console.error(error);
      toast.error(error?.response?.data?.message || 'Failed to update access request status');
    } finally {
      setUpdatingRequestId('');
    }
  };

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
        <input
          type="text"
          placeholder="Category (e.g. Annual Report, Financial, Program)"
          value={formData.category}
          onChange={(e) => setFormData({ ...formData, category: e.target.value })}
          className="w-full p-2 mb-4 border rounded"
          required
        />
        <select
          value={formData.visibility}
          onChange={(e) => setFormData({ ...formData, visibility: e.target.value })}
          className="w-full p-2 mb-4 border rounded"
        >
          <option value="public">Public</option>
          <option value="protected">Protected (requires permission)</option>
        </select>
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

      <div className="mt-10">
        <h2 className="text-2xl font-bold mb-4">Protected Report Access Requests</h2>
        {accessRequests.length === 0 ? (
          <p className="text-gray-600">No access requests yet.</p>
        ) : (
          <div className="overflow-x-auto bg-white border border-gray-200 rounded-lg">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-left">
                  <th className="py-3 px-4 border-b">Report</th>
                  <th className="py-3 px-4 border-b">Requester</th>
                  <th className="py-3 px-4 border-b">Purpose</th>
                  <th className="py-3 px-4 border-b">Status</th>
                  <th className="py-3 px-4 border-b">Created</th>
                  <th className="py-3 px-4 border-b">Actions</th>
                </tr>
              </thead>
              <tbody>
                {accessRequests.map((item) => {
                  const isUpdating = updatingRequestId === item._id;
                  const status = item.status || 'pending';
                  const statusClass =
                    status === 'approved'
                      ? 'bg-emerald-100 text-emerald-800'
                      : status === 'rejected'
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-amber-100 text-amber-800';

                  return (
                    <tr key={item._id}>
                      <td className="py-3 px-4 border-b align-top">
                        <p className="font-semibold text-gray-900">{item.reportId?.title || 'Unknown Report'}</p>
                        <p className="text-xs text-gray-500">
                          {[item.reportId?.category || 'General', item.reportId?.year].filter(Boolean).join(' | ')}
                        </p>
                      </td>
                      <td className="py-3 px-4 border-b align-top">
                        <p className="font-medium text-gray-900">{item.requesterName}</p>
                        <p className="text-xs text-gray-600">{item.requesterEmail}</p>
                        {item.requesterPhone ? <p className="text-xs text-gray-500">{item.requesterPhone}</p> : null}
                      </td>
                      <td className="py-3 px-4 border-b align-top text-gray-700">{item.purpose}</td>
                      <td className="py-3 px-4 border-b align-top">
                        <span className={`inline-block rounded-full px-2.5 py-1 text-xs font-semibold ${statusClass}`}>
                          {status}
                        </span>
                      </td>
                      <td className="py-3 px-4 border-b align-top text-gray-600">
                        {item.createdAt ? new Date(item.createdAt).toLocaleString() : '-'}
                      </td>
                      <td className="py-3 px-4 border-b align-top">
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            disabled={isUpdating || status === 'approved'}
                            onClick={() => handleUpdateRequestStatus(item._id, 'approved')}
                            className="px-3 py-1.5 rounded bg-emerald-600 text-white disabled:bg-gray-300"
                          >
                            Approve
                          </button>
                          <button
                            type="button"
                            disabled={isUpdating || status === 'rejected'}
                            onClick={() => handleUpdateRequestStatus(item._id, 'rejected')}
                            className="px-3 py-1.5 rounded bg-rose-600 text-white disabled:bg-gray-300"
                          >
                            Reject
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageReports;
