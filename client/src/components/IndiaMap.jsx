import React, { useEffect, useRef, useState } from "react";
import { json } from "d3-fetch";
import { geoMercator, geoPath } from "d3-geo";
import { select } from "d3-selection";
import { feature } from "topojson-client";

const DISTRICT_TOPO = "/maps/india-districts.json";
const STATE_TOPO = "/maps/INDIA_STATES.json";
const MAP_WIDTH = 900;
const LANDSCAPE_HEIGHT = 620;
const PORTRAIT_MOBILE_HEIGHT = 540;
const PORTRAIT_TABLET_HEIGHT = 520;

const getResponsiveMapHeight = () => {
  if (typeof window === "undefined") return LANDSCAPE_HEIGHT;

  const isPortrait = window.innerHeight > window.innerWidth;
  if (!isPortrait) return LANDSCAPE_HEIGHT;

  return window.innerWidth < 768 ? PORTRAIT_MOBILE_HEIGHT : PORTRAIT_TABLET_HEIGHT;
};

const shouldUsePortraitSmallCrop = () => {
  if (typeof window === "undefined") return false;
  const isPortrait = window.innerHeight > window.innerWidth;
  return isPortrait && window.innerWidth < 1024;
};

const getPortraitCropPadding = () => {
  if (typeof window === "undefined") return 10;
  return window.innerWidth < 768 ? 8 : 12;
};

const IndiaMap = ({ selectedDistricts = [] }) => {
  const svgRef = useRef(null);
  const drawSequenceRef = useRef(0);
  const [tooltip, setTooltip] = useState(null);
  const [mapHeight, setMapHeight] = useState(getResponsiveMapHeight);

  useEffect(() => {
    const handleResize = () => {
      setMapHeight(getResponsiveMapHeight());
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const drawSequence = ++drawSequenceRef.current;
    const svg = select(svgRef.current);
    svg.selectAll("*").remove();

    const width = MAP_WIDTH;
    const height = mapHeight;

    svg
      .attr("viewBox", `0 0 ${width} ${height}`)
      .style("width", "100%")
      .style("height", "auto");

    Promise.all([
      json(DISTRICT_TOPO),
      json(STATE_TOPO),
    ]).then(([districtTopo, stateTopo]) => {
      if (drawSequence !== drawSequenceRef.current || !svgRef.current) return;
      const districtKey = Object.keys(districtTopo.objects)[0];
      const stateKey = Object.keys(stateTopo.objects)[0];

      const districts = feature(
        districtTopo,
        districtTopo.objects[districtKey]
      );

      const states = feature(
        stateTopo,
        stateTopo.objects[stateKey]
      );

      const projection = geoMercator()
        .fitSize([width, height], states);

      const path = geoPath(projection);

      if (shouldUsePortraitSmallCrop()) {
        const [[x0, y0], [x1, y1]] = path.bounds(states);
        const viewPadding = getPortraitCropPadding();
        svg.attr(
          "viewBox",
          `${x0 - viewPadding} ${y0 - viewPadding} ${x1 - x0 + viewPadding * 2} ${y1 - y0 + viewPadding * 2}`
        );
      }

      const selectedSet = new Set(
        selectedDistricts.map((d) => d.toLowerCase())
      );

      /* DISTRICT FILLS */
      svg
        .append("g")
        .selectAll("path")
        .data(districts.features)
        .join("path")
        .attr("d", path)
        .attr("fill", (d) => {
          const stateDistrictKey = `${d.properties.st_nm}-${d.properties.district}`.toLowerCase();
          return selectedSet.has(stateDistrictKey)
            ? "#ef4444"
            : "#f3f4f6";
        })
        .attr("stroke", "#d1d5db")
        .attr("stroke-width", 0.7)
        .on("mouseenter", (event, d) => {
          setTooltip({
            district: d.properties.district,
            state: d.properties.st_nm,
            x: event.clientX,
            y: event.clientY,
          });
        })
        .on("mouseleave", () => setTooltip(null));

      /* STATE BOUNDARIES (CLEAN) */
      svg
        .append("g")
        .selectAll("path")
        .data(states.features)
        .join("path")
        .attr("d", path)
        .attr("fill", "none")
        .attr("stroke", "#111827")
        .attr("stroke-width", 0.5)
        .attr("pointer-events", "none");
    }).catch((error) => {
      if (drawSequence !== drawSequenceRef.current) return;
      console.error("Failed to render India map:", error);
    });
  }, [selectedDistricts, mapHeight]);

  return (
    <div className="relative overflow-hidden bg-white p-3 sm:p-4 rounded-lg shadow">
      <svg ref={svgRef} />

      {tooltip && (
        <div
          className="absolute bg-black text-white text-xs px-3 py-2 rounded"
          style={{ left: tooltip.x + 15, top: tooltip.y + 15 }}
        >
          <div className="font-bold">{tooltip.district}</div>
          <div className="text-gray-300">{tooltip.state}</div>
        </div>
      )}
    </div>
  );
};

export default IndiaMap;

