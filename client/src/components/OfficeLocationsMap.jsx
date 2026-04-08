import React, { useEffect, useMemo, useRef } from 'react';
import L from 'leaflet';
import { feature } from 'topojson-client';
import 'leaflet/dist/leaflet.css';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

const DEFAULT_CENTER = [22.9734, 78.6569];
const DEFAULT_ZOOM = 5;
const INDIA_STATES_TOPO_PATH = '/maps/INDIA_STATES.json';

const defaultMarkerIcon = L.icon({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const selectedMarkerIcon = L.divIcon({
  className: '',
  html: '<div style="width:18px;height:18px;background:#2563eb;border:3px solid #ffffff;border-radius:9999px;box-shadow:0 0 0 4px rgba(37,99,235,0.28);"></div>',
  iconSize: [18, 18],
  iconAnchor: [9, 9],
  popupAnchor: [0, -10]
});

const escapeHtml = (value = '') =>
  String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const OfficeLocationsMap = ({ offices = [], selectedOfficeId = 'all', onSelectOffice, className = '' }) => {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const markersLayerRef = useRef(null);
  const boundaryLayerRef = useRef(null);
  const selectedOffice = useMemo(
    () =>
      selectedOfficeId === 'all'
        ? null
        : offices.find((office) => office.id === selectedOfficeId) || null,
    [offices, selectedOfficeId]
  );

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return undefined;

    const map = L.map(mapContainerRef.current, {
      zoomControl: true,
      attributionControl: true
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    map.setView(DEFAULT_CENTER, DEFAULT_ZOOM);
    mapRef.current = map;
    markersLayerRef.current = L.layerGroup().addTo(map);

    const handleResize = () => {
      if (!mapRef.current) return;
      window.requestAnimationFrame(() => {
        mapRef.current?.invalidateSize({ pan: false, animate: false });
      });
    };

    let resizeObserver = null;
    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(() => {
        handleResize();
      });
      resizeObserver.observe(mapContainerRef.current);
    }

    window.addEventListener('resize', handleResize);

    let isCancelled = false;
    fetch(INDIA_STATES_TOPO_PATH)
      .then((response) => response.json())
      .then((topology) => {
        if (isCancelled || !mapRef.current || !topology?.objects) return;
        const topologyKey = Object.keys(topology.objects)[0];
        if (!topologyKey) return;

        const geoStates = feature(topology, topology.objects[topologyKey]);
        boundaryLayerRef.current = L.geoJSON(geoStates, {
          style: {
            color: '#111827',
            weight: 1.6,
            opacity: 0.95,
            fillOpacity: 0
          },
          interactive: false
        }).addTo(mapRef.current);
      })
      .catch(() => {
        boundaryLayerRef.current = null;
      });

    return () => {
      isCancelled = true;
      window.removeEventListener('resize', handleResize);
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
      map.remove();
      mapRef.current = null;
      markersLayerRef.current = null;
      boundaryLayerRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    const markersLayer = markersLayerRef.current;
    if (!map || !markersLayer) return;

    markersLayer.clearLayers();

    if (!offices.length) {
      map.setView(DEFAULT_CENTER, DEFAULT_ZOOM);
      return;
    }

    const markerBounds = [];

    offices.forEach((office) => {
      const latLng = [office.lat, office.lng];
      const isSelected = selectedOfficeId !== 'all' && selectedOfficeId === office.id;

      const marker = L.marker(latLng, {
        icon: isSelected ? selectedMarkerIcon : defaultMarkerIcon,
        zIndexOffset: isSelected ? 400 : 0
      });

      marker.bindPopup(
        `<div style="min-width:180px">
          <div style="font-weight:600;color:#111827">${escapeHtml(office.name)}</div>
          <div style="font-size:12px;color:#1d4ed8;margin-top:2px">${escapeHtml(office.city)}</div>
          <div style="font-size:12px;color:#4b5563;margin-top:6px">${escapeHtml(office.address)}</div>
        </div>`
      );

      marker.on('click', () => {
        if (typeof onSelectOffice === 'function') {
          onSelectOffice(office.id);
        }
      });

      marker.addTo(markersLayer);
      markerBounds.push(latLng);

      if (isSelected) {
        marker.openPopup();
      }
    });

    if (selectedOffice) {
      map.flyTo([selectedOffice.lat, selectedOffice.lng], 12, { duration: 0.7 });
    } else if (markerBounds.length === 1) {
      map.setView(markerBounds[0], 12);
    } else {
      map.fitBounds(markerBounds, { padding: [40, 40], maxZoom: 11 });
    }

    if (boundaryLayerRef.current) {
      boundaryLayerRef.current.bringToFront();
    }

    window.setTimeout(() => {
      map.invalidateSize();
    }, 0);
  }, [offices, selectedOffice, selectedOfficeId, onSelectOffice]);

  const resolvedClassName = ["relative z-0", className].filter(Boolean).join(" ");
  return <div ref={mapContainerRef} className={resolvedClassName} />;
};

export default OfficeLocationsMap;
