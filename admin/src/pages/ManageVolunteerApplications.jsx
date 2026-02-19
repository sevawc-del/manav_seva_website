import React, { useEffect, useState } from 'react';
import { getAllVolunteerApplications, updateVolunteerApplicationStatus } from '../utils/api';

const ManageVolunteerApplications = () => {
  const [applications, setApplications] = useState([]);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const fetchApplications = async () => {
    try {
      const res = await getAllVolunteerApplications();
      setApplications(res.data);
    } catch (error) {
      console.error('Error fetching applications:', error);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const handleViewDetails = (application) => {
    setSelectedApplication(application);
    setShowModal(true);
  };

  const handleStatusChange = async (id, status) => {
    try {
      await updateVolunteerApplicationStatus(id, status);
      fetchApplications(); // Refresh the list
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedApplication(null);
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Manage Volunteer Applications</h1>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white">
          <thead>
            <tr>
              <th className="py-2 px-4 border-b">Name</th>
              <th className="py-2 px-4 border-b">Email</th>
              <th className="py-2 px-4 border-b">Phone</th>
              <th className="py-2 px-4 border-b">Volunteer Opportunity</th>
              <th className="py-2 px-4 border-b">Status</th>
              <th className="py-2 px-4 border-b">Applied At</th>
              <th className="py-2 px-4 border-b">Actions</th>
            </tr>
          </thead>
          <tbody>
            {applications.map((app) => (
              <tr key={app._id}>
                <td className="py-2 px-4 border-b">{app.name}</td>
                <td className="py-2 px-4 border-b">{app.email}</td>
                <td className="py-2 px-4 border-b">{app.phone}</td>
                <td className="py-2 px-4 border-b">{app.volunteerId?.title || 'N/A'}</td>
                <td className="py-2 px-4 border-b">
                  <span className={`px-2 py-1 rounded ${
                    app.status === 'approved' ? 'bg-green-200 text-green-800' :
                    app.status === 'rejected' ? 'bg-red-200 text-red-800' :
                    'bg-yellow-200 text-yellow-800'
                  }`}>
                    {app.status}
                  </span>
                </td>
                <td className="py-2 px-4 border-b">{new Date(app.createdAt).toLocaleDateString()}</td>
                <td className="py-2 px-4 border-b">
                  <button
                    onClick={() => handleViewDetails(app)}
                    className="bg-blue-500 text-white px-2 py-1 rounded mr-2"
                  >
                    View Details
                  </button>
                  <button
                    onClick={() => handleStatusChange(app._id, 'approved')}
                    className="bg-green-500 text-white px-2 py-1 rounded mr-2"
                    disabled={app.status === 'approved'}
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleStatusChange(app._id, 'rejected')}
                    className="bg-red-500 text-white px-2 py-1 rounded"
                    disabled={app.status === 'rejected'}
                  >
                    Reject
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && selectedApplication && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Application Details</h2>
            <p><strong>Name:</strong> {selectedApplication.name}</p>
            <p><strong>Email:</strong> {selectedApplication.email}</p>
            <p><strong>Phone:</strong> {selectedApplication.phone}</p>
            <p><strong>Volunteer Opportunity:</strong> {selectedApplication.volunteerId?.title || 'N/A'}</p>
            <p><strong>Message:</strong> {selectedApplication.message || 'No message'}</p>
            <p><strong>Status:</strong> {selectedApplication.status}</p>
            <p><strong>Applied At:</strong> {new Date(selectedApplication.createdAt).toLocaleString()}</p>
            <p><strong>Updated At:</strong> {new Date(selectedApplication.updatedAt).toLocaleString()}</p>
            <div className="mt-4">
              <label className="block mb-2">
                <strong>Update Status:</strong>
                <select
                  value={selectedApplication.status}
                  onChange={(e) => setSelectedApplication({ ...selectedApplication, status: e.target.value })}
                  className="w-full p-2 border rounded mt-1"
                >
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </label>
              <button
                onClick={() => {
                  handleStatusChange(selectedApplication._id, selectedApplication.status);
                  closeModal();
                }}
                className="bg-blue-500 text-white px-4 py-2 rounded mr-2"
              >
                Save
              </button>
              <button onClick={closeModal} className="bg-gray-500 text-white px-4 py-2 rounded">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageVolunteerApplications;
