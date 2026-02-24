import React, { useEffect, useState } from 'react';
import { getDonationsAdmin } from '../utils/api';

const DEFAULT_LIMIT = 20;

const statusBadgeClass = (value) => {
  if (value === 'issued') return 'bg-green-100 text-green-700';
  if (value === 'failed') return 'bg-red-100 text-red-700';
  return 'bg-gray-100 text-gray-700';
};

const formatDateTime = (value) => {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return date.toLocaleString('en-IN');
};

const formatAmount = (amount) => {
  const value = Number(amount || 0);
  return `INR ${value.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

const ManageDonations = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    q: '',
    certificateStatus: '',
    dateFrom: '',
    dateTo: ''
  });
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: DEFAULT_LIMIT,
    total: 0,
    totalPages: 1
  });

  const fetchDonations = async (targetPage = page) => {
    setLoading(true);
    setError('');
    try {
      const params = {
        page: targetPage,
        limit: DEFAULT_LIMIT
      };

      Object.entries(filters).forEach(([key, value]) => {
        if (String(value || '').trim()) {
          params[key] = value;
        }
      });

      const response = await getDonationsAdmin(params);
      setItems(response.data?.items || []);
      setPagination(response.data?.pagination || {
        page: targetPage,
        limit: DEFAULT_LIMIT,
        total: 0,
        totalPages: 1
      });
    } catch (fetchError) {
      console.error('Failed to fetch donations:', fetchError);
      setError(fetchError?.response?.data?.message || 'Failed to fetch donations');
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDonations(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleApplyFilters = async (e) => {
    e.preventDefault();
    setPage(1);
    await fetchDonations(1);
  };

  const handlePageChange = async (nextPage) => {
    if (nextPage < 1 || nextPage > (pagination.totalPages || 1)) return;
    setPage(nextPage);
    await fetchDonations(nextPage);
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Manage Donations</h2>

      <form onSubmit={handleApplyFilters} className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <input
            type="text"
            value={filters.q}
            onChange={(e) => setFilters((prev) => ({ ...prev, q: e.target.value }))}
            className="w-full p-2 border rounded"
            placeholder="Search donor, email, receipt, payment id..."
          />
          <select
            value={filters.certificateStatus}
            onChange={(e) => setFilters((prev) => ({ ...prev, certificateStatus: e.target.value }))}
            className="w-full p-2 border rounded"
          >
            <option value="">All certificate status</option>
            <option value="issued">Issued</option>
            <option value="failed">Failed</option>
          </select>
          <input
            type="date"
            value={filters.dateFrom}
            onChange={(e) => setFilters((prev) => ({ ...prev, dateFrom: e.target.value }))}
            className="w-full p-2 border rounded"
          />
          <input
            type="date"
            value={filters.dateTo}
            onChange={(e) => setFilters((prev) => ({ ...prev, dateTo: e.target.value }))}
            className="w-full p-2 border rounded"
          />
        </div>
        <div className="mt-3 flex gap-2">
          <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
            Apply Filters
          </button>
          <button
            type="button"
            className="bg-gray-200 text-gray-800 px-4 py-2 rounded"
            onClick={async () => {
              const cleared = { q: '', certificateStatus: '', dateFrom: '', dateTo: '' };
              setFilters(cleared);
              setPage(1);
              setLoading(true);
              try {
                const response = await getDonationsAdmin({ page: 1, limit: DEFAULT_LIMIT });
                setItems(response.data?.items || []);
                setPagination(response.data?.pagination || { page: 1, limit: DEFAULT_LIMIT, total: 0, totalPages: 1 });
                setError('');
              } catch (fetchError) {
                setError(fetchError?.response?.data?.message || 'Failed to fetch donations');
                setItems([]);
              } finally {
                setLoading(false);
              }
            }}
          >
            Reset
          </button>
        </div>
      </form>

      {error && <p className="text-red-600 mb-4">{error}</p>}

      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Receipt</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Donor</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mobile</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">PAN</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Payment ID</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Certificate</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan={9} className="px-4 py-8 text-center text-gray-500">Loading donations...</td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-4 py-8 text-center text-gray-500">No donations found.</td>
              </tr>
            ) : (
              items.map((item) => (
                <tr key={item._id}>
                  <td className="px-4 py-3 text-sm text-gray-900">{item.receiptNumber || '-'}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">{item.donorName || '-'}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{item.email || '-'}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{item.mobileNumber || '-'}</td>
                  <td className="px-4 py-3 text-sm text-gray-700 font-mono">{item.panMasked || '-'}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">{formatAmount(item.amount)}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{formatDateTime(item.paymentCapturedAt)}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{item.razorpayPaymentId || '-'}</td>
                  <td className="px-4 py-3 text-sm">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${statusBadgeClass(item.certificateStatus)}`}>
                      {item.certificateStatus || 'unknown'}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <p className="text-sm text-gray-600">
          Total records: {pagination.total || 0}
        </p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={page <= 1 || loading}
            onClick={() => handlePageChange(page - 1)}
            className="px-3 py-1.5 rounded border border-gray-300 text-sm disabled:opacity-50"
          >
            Previous
          </button>
          <span className="text-sm text-gray-700">
            Page {pagination.page || page} of {pagination.totalPages || 1}
          </span>
          <button
            type="button"
            disabled={page >= (pagination.totalPages || 1) || loading}
            onClick={() => handlePageChange(page + 1)}
            className="px-3 py-1.5 rounded border border-gray-300 text-sm disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default ManageDonations;
