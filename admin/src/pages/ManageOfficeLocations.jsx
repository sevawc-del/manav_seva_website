import React, { useEffect, useState } from 'react';
import { createOrUpdateSiteSettings, getSiteSettingsAdmin } from '../utils/api';
import { useToast } from '../context/ToastContext';

const DEFAULT_OFFICES = [
  {
    id: 'gorakhpur-head-office',
    name: 'Head Office',
    city: 'Gorakhpur',
    address: 'Vikas Nagar Colony, Bargadwa, P.O. Fertilizer, Gorakhpur-273007 (U.P.), India',
    lat: 26.8050913,
    lng: 83.3548241,
    googleMapsUrl:
      'https://www.google.com/maps/place/Manav+Seva+Sansthan+SEVA/@26.8047121,83.3523656,18z/data=!4m6!3m5!1s0x39914a4000000007:0x7650ce5dac4123f2!8m2!3d26.8050913!4d83.3548241!16s%2Fg%2F11c1xczdgj?entry=ttu&g_ep=EgoyMDI2MDMzMC4wIKXMDSoASAFQAw'
  },
  {
    id: 'new-delhi-branch-office',
    name: 'Branch Office',
    city: 'New Delhi',
    address: 'K68 BK dutt Colony, Jor Bagh, New Delhi, 110003',
    lat: 28.5839672,
    lng: 77.2168207,
    googleMapsUrl:
      'https://www.google.com/maps/place/K-82+B.K.+Dutt+Colony,+Jor+Bagh/@28.5839791,77.2140859,17z/data=!3m1!4b1!4m6!3m5!1s0x390ce3ae76a5fe45:0x6ac91b5de8746a68!8m2!3d28.5839791!4d77.2166608!16s%2Fg%2F11kpvr3p49?entry=ttu&g_ep=EgoyMDI2MDMzMC4wIKXMDSoASAFQAw%3D%3D'
  }
];

const createEmptyOffice = () => ({
  id: `office-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
  name: '',
  city: '',
  address: '',
  lat: '',
  lng: '',
  googleMapsUrl: ''
});

const sanitizeOffices = (offices) => {
  const normalized = (offices || [])
    .map((office, index) => {
      const rawId = String(office?.id || '').trim();
      const safeId = rawId && rawId.toLowerCase() !== 'all' ? rawId : `office-${index + 1}`;

      return {
        id: safeId,
        name: String(office?.name || '').trim(),
        city: String(office?.city || '').trim(),
        address: String(office?.address || '').trim(),
        lat: Number(office?.lat),
        lng: Number(office?.lng),
        googleMapsUrl: String(office?.googleMapsUrl || '').trim()
      };
    })
    .filter((office) => office.name && office.city && Number.isFinite(office.lat) && Number.isFinite(office.lng));

  return normalized.length > 0 ? normalized : DEFAULT_OFFICES;
};

const ManageOfficeLocations = () => {
  const toast = useToast();
  const [offices, setOffices] = useState(DEFAULT_OFFICES);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await getSiteSettingsAdmin();
        const mapped = (response?.data?.homeOfficeLocations || []).map((office, index) => ({
          id: office?.id || `office-${index + 1}`,
          name: office?.name || '',
          city: office?.city || '',
          address: office?.address || '',
          lat: office?.lat ?? '',
          lng: office?.lng ?? '',
          googleMapsUrl: office?.googleMapsUrl || ''
        }));
        setOffices(mapped.length > 0 ? mapped : DEFAULT_OFFICES);
      } catch (error) {
        console.error('Failed to load office locations:', error);
        toast.error('Failed to load office locations');
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, [toast]);

  const handleOfficeChange = (id, key, value) => {
    setOffices((prev) => prev.map((office) => (office.id === id ? { ...office, [key]: value } : office)));
  };

  const handleAddOffice = () => {
    setOffices((prev) => [...prev, createEmptyOffice()]);
  };

  const handleRemoveOffice = (id) => {
    setOffices((prev) => prev.filter((office) => office.id !== id));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);

    try {
      const payload = new FormData();
      payload.append('homeOfficeLocations', JSON.stringify(sanitizeOffices(offices)));
      await createOrUpdateSiteSettings(payload);
      toast.success('Office locations saved successfully');
    } catch (error) {
      console.error('Failed to save office locations:', error);
      toast.error(error?.response?.data?.message || 'Failed to save office locations');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="p-6">Loading office locations...</div>;

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-2">Office Locations</h2>
      <p className="text-sm text-gray-600 mb-6">
        Manage multiple office locations shown in the homepage map card.
      </p>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 max-w-5xl">
        <div className="space-y-4">
          {offices.map((office, index) => (
            <div key={office.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-800">Office {index + 1}</h3>
                <button
                  type="button"
                  onClick={() => handleRemoveOffice(office.id)}
                  className="text-sm px-3 py-1 rounded bg-red-50 text-red-700 border border-red-200 hover:bg-red-100"
                >
                  Remove
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Office Name</label>
                  <input
                    type="text"
                    value={office.name}
                    onChange={(e) => handleOfficeChange(office.id, 'name', e.target.value)}
                    className="w-full p-2 border rounded"
                    placeholder="Head Office"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">City</label>
                  <input
                    type="text"
                    value={office.city}
                    onChange={(e) => handleOfficeChange(office.id, 'city', e.target.value)}
                    className="w-full p-2 border rounded"
                    placeholder="New Delhi"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Address</label>
                  <input
                    type="text"
                    value={office.address}
                    onChange={(e) => handleOfficeChange(office.id, 'address', e.target.value)}
                    className="w-full p-2 border rounded"
                    placeholder="Vikas Nagar Colony, Bargadwa, P.O. Fertilizer, Gorakhpur-273007 (U.P.), India"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-gray-600 mb-1">
                    Google Maps URL (Exact Place Link)
                  </label>
                  <input
                    type="url"
                    value={office.googleMapsUrl || ''}
                    onChange={(e) => handleOfficeChange(office.id, 'googleMapsUrl', e.target.value)}
                    className="w-full p-2 border rounded"
                    placeholder="https://www.google.com/maps/place/..."
                  />
                  <p className="mt-1 text-[11px] text-gray-500">
                    Optional but recommended. If provided, this exact URL is used for “Open in Google Maps”.
                  </p>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Latitude</label>
                  <input
                    type="number"
                    step="any"
                    value={office.lat}
                    onChange={(e) => handleOfficeChange(office.id, 'lat', e.target.value)}
                    className="w-full p-2 border rounded"
                    placeholder="26.8050913"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Longitude</label>
                  <input
                    type="number"
                    step="any"
                    value={office.lng}
                    onChange={(e) => handleOfficeChange(office.id, 'lng', e.target.value)}
                    className="w-full p-2 border rounded"
                    placeholder="83.3548241"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={handleAddOffice}
            className="px-4 py-2 rounded bg-gray-100 text-gray-800 border border-gray-200 hover:bg-gray-200"
          >
            Add Office
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-400"
          >
            {submitting ? 'Saving...' : 'Save Office Locations'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ManageOfficeLocations;
