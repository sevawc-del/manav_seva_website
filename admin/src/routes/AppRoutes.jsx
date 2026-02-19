import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Login from '../pages/Login';
import Dashboard from '../pages/Dashboard';
import ManageNews from '../pages/ManageNews';
import ManageGallery from '../pages/ManageGallery';
import ManageReports from '../pages/ManageReports';
import ManageTenders from '../pages/ManageTenders';
import ManageAbout from '../pages/ManageAbout';
import ManageActivities from '../pages/ManageActivities';
import ManageSliders from '../pages/ManageSliders';
import ManageJourneys from '../pages/ManageJourneys';
import ManageJobs from '../pages/ManageJobs';
import ManageGetInvolved from '../pages/ManageGetInvolved';
import ManageVolunteers from '../pages/ManageVolunteers';
import ManageVolunteerApplications from '../pages/ManageVolunteerApplications';
import Users from '../pages/Users';
import Settings from '../pages/Settings';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import ProtectedRoute from '../components/ProtectedRoute';

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/*" element={
        <ProtectedRoute>
          <div className="flex">
            <Sidebar />
            <div className="flex-1">
              <Navbar />
              <Routes>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/manage-news" element={<ManageNews />} />
                <Route path="/manage-gallery" element={<ManageGallery />} />
                <Route path="/manage-reports" element={<ManageReports />} />
                <Route path="/manage-tenders" element={<ManageTenders />} />
                <Route path="/manage-about" element={<ManageAbout />} />
                <Route path="/manage-activities" element={<ManageActivities />} />
                <Route path="/manage-sliders" element={<ManageSliders />} />
                <Route path="/manage-journeys" element={<ManageJourneys />} />
                <Route path="/manage-jobs" element={<ManageJobs />} />
                <Route path="/manage-get-involved" element={<ManageGetInvolved />} />
                <Route path="/manage-volunteers" element={<ManageVolunteers />} />
                <Route path="/manage-volunteer-applications" element={<ManageVolunteerApplications />} />
                <Route path="/users" element={
                  <ProtectedRoute adminOnly={true}>
                    <Users />
                  </ProtectedRoute>
                } />
                <Route path="/settings" element={<Settings />} />
              </Routes>
            </div>
          </div>
        </ProtectedRoute>
      } />
    </Routes>
  );
};

export default AppRoutes;
