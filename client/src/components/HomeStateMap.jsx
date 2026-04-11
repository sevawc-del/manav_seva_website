import React, { useEffect, useMemo, useRef, useState } from 'react';
import { json } from 'd3-fetch';
import { geoMercator, geoPath } from 'd3-geo';
import { select } from 'd3-selection';
import { feature } from 'topojson-client';

const STATE_TOPO = '/maps/INDIA_STATES.json';
const MAP_WIDTH = 900;
const LANDSCAPE_HEIGHT = 620;
const PORTRAIT_MOBILE_HEIGHT = 540;
const PORTRAIT_TABLET_HEIGHT = 520;

const STATUS_LABELS = {
  currently_working: 'Currently Working',
  previously_worked: 'Previously Worked'
};

const getResponsiveMapHeight = () => {
  if (typeof window === 'undefined') return LANDSCAPE_HEIGHT;

  const isPortrait = window.innerHeight > window.innerWidth;
  if (!isPortrait) return LANDSCAPE_HEIGHT;

  return window.innerWidth < 768 ? PORTRAIT_MOBILE_HEIGHT : PORTRAIT_TABLET_HEIGHT;
};

const shouldUsePortraitSmallCrop = () => {
  if (typeof window === 'undefined') return false;
  const isPortrait = window.innerHeight > window.innerWidth;
  return isPortrait && window.innerWidth < 1024;
};

const getPortraitCropPadding = () => {
  if (typeof window === 'undefined') return 10;
  return window.innerWidth < 768 ? 8 : 12;
};

const normalizeStateName = (value = '') =>
  String(value).trim().replace(/\s+/g, ' ').toUpperCase();

const getStateName = (properties = {}) =>
  String(properties.STNAME_SH || properties.STNAME || properties.st_nm || '').trim();

const HomeStateMap = ({ stateStatusEntries = [] }) => {
  const svgRef = useRef(null);
  const drawSequenceRef = useRef(0);
  const [tooltip, setTooltip] = useState(null);
  const [mapHeight, setMapHeight] = useState(getResponsiveMapHeight);

  const statusMap = useMemo(() => {
    const map = new Map();
    (stateStatusEntries || []).forEach((entry) => {
      const state = normalizeStateName(entry?.state || '');
      if (!state) return;
      const status = entry?.status === 'previously_worked' ? 'previously_worked' : 'currently_working';
      map.set(state, status);
    });
    return map;
  }, [stateStatusEntries]);

  useEffect(() => {
    const handleResize = () => setMapHeight(getResponsiveMapHeight());
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const drawSequence = ++drawSequenceRef.current;
    const svg = select(svgRef.current);
    svg.selectAll('*').remove();

    const width = MAP_WIDTH;
    const height = mapHeight;

    svg
      .attr('viewBox', `0 0 ${width} ${height}`)
      .style('width', '100%')
      .style('height', 'auto');

    json(STATE_TOPO)
      .then((stateTopo) => {
        if (drawSequence !== drawSequenceRef.current || !svgRef.current) return;
        const stateKey = Object.keys(stateTopo.objects)[0];
        const states = feature(stateTopo, stateTopo.objects[stateKey]);
        const projection = geoMercator().fitSize([width, height], states);
        const path = geoPath(projection);

        if (shouldUsePortraitSmallCrop()) {
          const [[x0, y0], [x1, y1]] = path.bounds(states);
          const viewPadding = getPortraitCropPadding();
          svg.attr(
            'viewBox',
            `${x0 - viewPadding} ${y0 - viewPadding} ${x1 - x0 + viewPadding * 2} ${y1 - y0 + viewPadding * 2}`
          );
        }

        svg
          .append('g')
          .selectAll('path')
          .data(states.features)
          .join('path')
          .attr('d', path)
          .attr('fill', (item) => {
            const stateName = normalizeStateName(getStateName(item.properties));
            const status = statusMap.get(stateName);

            if (status === 'currently_working') return '#22c55e';
            if (status === 'previously_worked') return '#f59e0b';
            return '#f3f4f6';
          })
          .attr('stroke', '#111827')
          .attr('stroke-width', 0.6)
          .on('mouseenter', (event, item) => {
            const stateName = getStateName(item.properties);
            const status = statusMap.get(normalizeStateName(stateName));
            setTooltip({
              state: stateName,
              status: status ? STATUS_LABELS[status] : 'No recorded status',
              x: event.clientX,
              y: event.clientY
            });
          })
          .on('mouseleave', () => setTooltip(null));
      })
      .catch((error) => {
        if (drawSequence !== drawSequenceRef.current) return;
        console.error('Failed to render home geographic map:', error);
      });
  }, [statusMap, mapHeight]);

  return (
    <div className="relative overflow-hidden rounded-lg bg-white p-3 sm:p-4 shadow">
      <svg ref={svgRef} />

      {tooltip && (
        <div
          className="absolute rounded bg-black px-3 py-2 text-xs text-white"
          style={{ left: tooltip.x + 15, top: tooltip.y + 15 }}
        >
          <div className="font-bold">{tooltip.state}</div>
          <div className="text-gray-300">{tooltip.status}</div>
        </div>
      )}
    </div>
  );
};

export default HomeStateMap;
