import React, { useEffect, useRef, useState } from 'react';
import {
  createOrUpdateDonationSettings,
  getDonationSettingsAdmin
} from '../utils/api';
import { useToast } from '../context/ToastContext';

const initialForm = {
  ngoName: '',
  ngoAddress: '',
  ngoPan: '',
  eightyGRegistrationNumber: '',
  ngoNotificationEmail: '',
  authorizedSignatoryName: '',
  authorizedSignatureImageUrl: '',
  upiId: '',
  bankName: '',
  accountName: '',
  accountNumber: '',
  ifsc: '',
  branch: '',
  qrImageUrl: '',
  paymentUrl: '',
  taxNote: ''
};

const ManageDonationSettings = () => {
  const toast = useToast();
  const [formData, setFormData] = useState(initialForm);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedFileName, setSelectedFileName] = useState('');
  const [selectedFilePreview, setSelectedFilePreview] = useState('');
  const [signatureFile, setSignatureFile] = useState(null);
  const [signatureFileName, setSignatureFileName] = useState('');
  const [signaturePreview, setSignaturePreview] = useState('');
  const fileInputRef = useRef(null);
  const signatureInputRef = useRef(null);

  const fetchSettings = async () => {
    try {
      const response = await getDonationSettingsAdmin();
      setFormData((prev) => ({
        ...prev,
        ...response.data
      }));
    } catch (error) {
      console.error('Failed to load donation settings:', error);
      toast.error('Failed to load donation settings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, [toast]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);

    try {
      const payload = new FormData();
      payload.append('ngoName', formData.ngoName || '');
      payload.append('ngoAddress', formData.ngoAddress || '');
      payload.append('ngoPan', formData.ngoPan || '');
      payload.append('eightyGRegistrationNumber', formData.eightyGRegistrationNumber || '');
      payload.append('ngoNotificationEmail', formData.ngoNotificationEmail || '');
      payload.append('authorizedSignatoryName', formData.authorizedSignatoryName || '');
      payload.append('authorizedSignatureImageUrl', formData.authorizedSignatureImageUrl || '');
      payload.append('upiId', formData.upiId || '');
      payload.append('bankName', formData.bankName || '');
      payload.append('accountName', formData.accountName || '');
      payload.append('accountNumber', formData.accountNumber || '');
      payload.append('ifsc', formData.ifsc || '');
      payload.append('branch', formData.branch || '');
      payload.append('qrImageUrl', formData.qrImageUrl || '');
      payload.append('paymentUrl', formData.paymentUrl || '');
      payload.append('taxNote', formData.taxNote || '');

      if (selectedFile) {
        payload.append('qrImageFile', selectedFile);
      }
      if (signatureFile) {
        payload.append('signatureImageFile', signatureFile);
      }

      const response = await createOrUpdateDonationSettings(payload);
      setFormData((prev) => ({
        ...prev,
        ...response.data
      }));
      setSelectedFile(null);
      setSelectedFileName('');
      setSelectedFilePreview('');
      setSignatureFile(null);
      setSignatureFileName('');
      setSignaturePreview('');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      if (signatureInputRef.current) {
        signatureInputRef.current.value = '';
      }
      toast.success('Donation settings saved successfully');
    } catch (error) {
      console.error('Failed to save donation settings:', error);
      toast.error(error?.response?.data?.message || 'Failed to save donation settings');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="p-6">Loading donation settings...</div>;

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Manage Donation Settings</h2>
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-3">NGO Compliance Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium mb-1">NGO Name</label>
            <input
              type="text"
              value={formData.ngoName || ''}
              onChange={(e) => setFormData((prev) => ({ ...prev, ngoName: e.target.value }))}
              className="w-full p-2 border rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">NGO PAN</label>
            <input
              type="text"
              value={formData.ngoPan || ''}
              onChange={(e) => setFormData((prev) => ({ ...prev, ngoPan: e.target.value.toUpperCase() }))}
              className="w-full p-2 border rounded"
              placeholder="ABCDE1234F"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">80G Registration Number</label>
            <input
              type="text"
              value={formData.eightyGRegistrationNumber || ''}
              onChange={(e) => setFormData((prev) => ({ ...prev, eightyGRegistrationNumber: e.target.value }))}
              className="w-full p-2 border rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">NGO Notification Email</label>
            <input
              type="email"
              value={formData.ngoNotificationEmail || ''}
              onChange={(e) => setFormData((prev) => ({ ...prev, ngoNotificationEmail: e.target.value }))}
              className="w-full p-2 border rounded"
            />
          </div>
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">NGO Address</label>
          <textarea
            rows={2}
            value={formData.ngoAddress || ''}
            onChange={(e) => setFormData((prev) => ({ ...prev, ngoAddress: e.target.value }))}
            className="w-full p-2 border rounded"
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium mb-1">Authorized Signatory Name</label>
            <input
              type="text"
              value={formData.authorizedSignatoryName || ''}
              onChange={(e) => setFormData((prev) => ({ ...prev, authorizedSignatoryName: e.target.value }))}
              className="w-full p-2 border rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Signature Image URL</label>
            <input
              type="text"
              value={formData.authorizedSignatureImageUrl || ''}
              onChange={(e) => setFormData((prev) => ({ ...prev, authorizedSignatureImageUrl: e.target.value }))}
              className="w-full p-2 border rounded"
            />
          </div>
        </div>

        <div className="mb-6 text-left">
          <input
            ref={signatureInputRef}
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              setSignatureFile(file);
              setSignatureFileName(file.name);
              const reader = new FileReader();
              reader.onloadend = () => {
                setSignaturePreview(String(reader.result || ''));
              };
              reader.readAsDataURL(file);
            }}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => signatureInputRef.current?.click()}
            disabled={submitting}
            className="inline-block bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
          >
            Choose Signature File
          </button>
          {signatureFileName && (
            <p className="mt-2 text-sm text-gray-600">Selected: {signatureFileName}</p>
          )}
          {!signatureFileName && formData.authorizedSignatureImageUrl && (
            <p className="mt-2 text-sm text-gray-600">Using current signature image URL</p>
          )}
        </div>

        {(signaturePreview || formData.authorizedSignatureImageUrl) && (
          <div className="mb-6">
            <p className="text-sm text-gray-600 mb-2">Signature Preview</p>
            <img
              src={signaturePreview || formData.authorizedSignatureImageUrl}
              alt="Authorized signature preview"
              className="h-20 w-48 object-contain border rounded p-2 bg-white"
            />
          </div>
        )}

        <h3 className="text-lg font-semibold mb-3">Donation Account Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium mb-1">UPI ID</label>
            <input
              type="text"
              value={formData.upiId || ''}
              onChange={(e) => setFormData((prev) => ({ ...prev, upiId: e.target.value }))}
              className="w-full p-2 border rounded"
              placeholder="e.g. manavseva@upi"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Payment URL</label>
            <input
              type="url"
              value={formData.paymentUrl || ''}
              onChange={(e) => setFormData((prev) => ({ ...prev, paymentUrl: e.target.value }))}
              className="w-full p-2 border rounded"
              placeholder="Gateway link"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium mb-1">Bank Name</label>
            <input
              type="text"
              value={formData.bankName || ''}
              onChange={(e) => setFormData((prev) => ({ ...prev, bankName: e.target.value }))}
              className="w-full p-2 border rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Account Name</label>
            <input
              type="text"
              value={formData.accountName || ''}
              onChange={(e) => setFormData((prev) => ({ ...prev, accountName: e.target.value }))}
              className="w-full p-2 border rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Account Number</label>
            <input
              type="text"
              value={formData.accountNumber || ''}
              onChange={(e) => setFormData((prev) => ({ ...prev, accountNumber: e.target.value }))}
              className="w-full p-2 border rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">IFSC</label>
            <input
              type="text"
              value={formData.ifsc || ''}
              onChange={(e) => setFormData((prev) => ({ ...prev, ifsc: e.target.value }))}
              className="w-full p-2 border rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Branch</label>
            <input
              type="text"
              value={formData.branch || ''}
              onChange={(e) => setFormData((prev) => ({ ...prev, branch: e.target.value }))}
              className="w-full p-2 border rounded"
            />
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">
            QR Image URL (optional if file is selected)
          </label>
          <input
            type="text"
            value={formData.qrImageUrl || ''}
            onChange={(e) => setFormData((prev) => ({ ...prev, qrImageUrl: e.target.value }))}
            className="w-full p-2 border rounded"
          />
        </div>

        <div className="mb-4 text-left">
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
            Choose QR File
          </button>
          {selectedFileName && (
            <p className="mt-2 text-sm text-gray-600">Selected: {selectedFileName}</p>
          )}
          {!selectedFileName && formData.qrImageUrl && (
            <p className="mt-2 text-sm text-gray-600">Using current QR image URL</p>
          )}
        </div>

        {(selectedFilePreview || formData.qrImageUrl) && (
          <div className="mb-4">
            <p className="text-sm text-gray-600 mb-2">QR Preview</p>
            <img
              src={selectedFilePreview || formData.qrImageUrl}
              alt="QR preview"
              className="h-40 w-40 object-contain border rounded p-2 bg-white"
            />
          </div>
        )}

        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Tax/Receipt Note</label>
          <textarea
            rows={3}
            value={formData.taxNote || ''}
            onChange={(e) => setFormData((prev) => ({ ...prev, taxNote: e.target.value }))}
            className="w-full p-2 border rounded"
            placeholder="e.g. Donation receipts and 80G details available on request."
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="bg-blue-500 text-white px-4 py-2 rounded disabled:bg-gray-400"
        >
          {submitting ? 'Saving...' : 'Save Donation Settings'}
        </button>
      </form>
    </div>
  );
};

export default ManageDonationSettings;
