import React, { useMemo } from 'react';
import OfficeLocationsMap from '../OfficeLocationsMap';

const buildGoogleCoordinateUrl = (lat, lng) => {
  const normalizedLat = Number(lat);
  const normalizedLng = Number(lng);

  if (!Number.isFinite(normalizedLat) || !Number.isFinite(normalizedLng)) {
    return 'https://www.google.com/maps/search/?api=1&query=India';
  }

  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${normalizedLat},${normalizedLng}`)}`;
};

const isGoogleMapsUrl = (candidateUrl) => {
  try {
    const parsedUrl = new URL(candidateUrl);
    const hostname = parsedUrl.hostname.toLowerCase();
    const isGoogleMapsHost =
      hostname === 'google.com' ||
      hostname === 'www.google.com' ||
      hostname === 'maps.google.com' ||
      hostname === 'maps.app.goo.gl' ||
      hostname.endsWith('.google.com');

    return parsedUrl.protocol === 'https:' && isGoogleMapsHost;
  } catch {
    return false;
  }
};

const getOfficeMapUrl = (office) => {
  const customGoogleMapsUrl = String(office?.googleMapsUrl || '').trim();
  if (customGoogleMapsUrl && isGoogleMapsUrl(customGoogleMapsUrl)) {
    return customGoogleMapsUrl;
  }

  return buildGoogleCoordinateUrl(office?.lat, office?.lng);
};

const OfficesMap = ({
  officeLocations = [],
  selectedOfficeId = 'all',
  onSelectedOfficeIdChange
}) => {
  const shouldScrollOfficeCards = officeLocations.length > 3;

  const handleSelectOffice = (officeId) => {
    if (typeof onSelectedOfficeIdChange === 'function') {
      onSelectedOfficeIdChange(officeId);
    }
  };

  const selectedOffice = useMemo(
    () =>
      selectedOfficeId === 'all'
        ? null
        : officeLocations.find((office) => office.id === selectedOfficeId) || null,
    [officeLocations, selectedOfficeId]
  );

  const allOfficesExternalMapUrl = useMemo(() => {
    if (officeLocations.length === 0) {
      return 'https://www.google.com/maps/search/?api=1&query=India';
    }
    if (officeLocations.length === 1) {
      const office = officeLocations[0];
      return getOfficeMapUrl(office);
    }

    const origin = `${officeLocations[0].lat},${officeLocations[0].lng}`;
    const destinationOffice = officeLocations[officeLocations.length - 1];
    const destination = `${destinationOffice.lat},${destinationOffice.lng}`;
    const waypoints = officeLocations
      .slice(1, -1)
      .map((office) => `${office.lat},${office.lng}`)
      .join('|');

    const baseUrl = `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}`;
    return waypoints ? `${baseUrl}&waypoints=${encodeURIComponent(waypoints)}` : baseUrl;
  }, [officeLocations]);

  return (
    <div className="mt-16">
      <div className="mb-5 rounded-2xl bg-gradient-to-r from-blue-600 to-sky-500 px-5 py-4">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3">
          <div>
            <h2 className="text-3xl font-bold text-center text-white md:text-left">Our Offices</h2>
            <p className="mt-2 text-sm text-center text-white/90 md:text-left">
              Explore our office presence and outreach locations across regions.
            </p>
          </div>
          <a
            href={
              selectedOffice
                ? getOfficeMapUrl(selectedOffice)
                : allOfficesExternalMapUrl
            }
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center rounded-md border border-slate-900 bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
          >
            Open in Google Maps
          </a>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1.15fr_0.85fr] gap-5">
        <div className="relative z-0 rounded-xl overflow-hidden border border-gray-200 shadow-sm bg-white">
          <OfficeLocationsMap
            offices={officeLocations}
            selectedOfficeId={selectedOfficeId}
            onSelectOffice={handleSelectOffice}
            className="w-full h-[280px] md:h-[320px] xl:h-[360px]"
          />
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
          <div className="mb-3">
            <button
              type="button"
              onClick={() => handleSelectOffice('all')}
              className={`w-full text-left px-3 py-2 rounded-lg border text-sm font-semibold transition ${
                selectedOfficeId === 'all'
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-blue-50 text-blue-800 border-blue-100 hover:bg-blue-100'
              }`}
            >
              Show All Offices (Map Focus)
            </button>
          </div>

          <div
            className={`space-y-2 ${shouldScrollOfficeCards ? 'max-h-[18.5rem] md:max-h-[21rem] xl:max-h-[22rem] overflow-y-auto pr-1' : ''}`}
          >
            {officeLocations.map((office) => {
              const isActive = selectedOfficeId === office.id;
              const officeLink = getOfficeMapUrl(office);

              return (
                <div
                  key={office.id}
                  className={`rounded-lg border p-3 transition ${
                    isActive ? 'border-blue-300 bg-blue-50/70' : 'border-gray-200 bg-white'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => handleSelectOffice(office.id)}
                    className="w-full text-left"
                  >
                    <p className="text-sm font-semibold text-gray-900">{office.name}</p>
                    <p className="text-xs text-blue-700 mt-0.5">{office.city}</p>
                    <p className="text-xs text-gray-600 mt-1">{office.address}</p>
                  </button>
                  <a
                    href={officeLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-block text-xs font-semibold text-blue-700 hover:text-blue-800"
                  >
                    View on map
                  </a>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OfficesMap;
