import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import { feature } from "topojson-client";

const DISTRICT_TOPO = "/maps/india-districts.json";
const STATE_TOPO = "/maps/INDIA_STATES.json";

const IndiaMap = ({ selectedDistricts = [] }) => {
  const svgRef = useRef(null);
  const [tooltip, setTooltip] = useState(null);

  useEffect(() => {
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const width = 900;
    const height = 700;

    svg
      .attr("viewBox", `0 0 ${width} ${height}`)
      .style("width", "100%")
      .style("height", "auto");

    Promise.all([
      d3.json(DISTRICT_TOPO),
      d3.json(STATE_TOPO),
    ]).then(([districtTopo, stateTopo]) => {
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

      const projection = d3
        .geoMercator()
        .fitSize([width, height], states);

      const path = d3.geoPath(projection);

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
    });
  }, [selectedDistricts]);

  return (
    <div className="relative bg-white p-4 rounded-lg shadow">
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

