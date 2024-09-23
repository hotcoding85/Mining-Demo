import React, { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import eqImgae from "../../../assets/images/equipment/digger-top-view.png";
import { dotData } from "../data/sampleData";

interface Dot {
  type: "Feature";
  geometry: {
    type: "Point";
    coordinates: [number, number];
  };
  properties: Record<string, unknown>;
}

function generateCircleCoordinates(
  center: [number, number],
  radiusInMeters: number
): [number, number][] {
  const coordinates: [number, number][] = [];
  const numPoints = 128;
  const angleStep = (2 * Math.PI) / numPoints;

  const earthRadius = 6371000;

  const [centerLon, centerLat] = center;

  const centerLatInRad = (centerLat * Math.PI) / 180;

  for (let i = 0; i <= numPoints; i++) {
    const angle = i * angleStep;

    const dx = radiusInMeters * Math.cos(angle);
    const dy = radiusInMeters * Math.sin(angle);

    const newLatitude = centerLat + (dy / earthRadius) * (180 / Math.PI);

    const newLongitude =
      centerLon +
      ((dx / earthRadius) * (180 / Math.PI)) / Math.cos(centerLatInRad);

    coordinates.push([newLongitude, newLatitude]);
  }

  return coordinates;
}

const DiggingOptimisationVisualView = () => {
  const legendData = [
    {
      label: "Load Sequence Plan",
      color: "#1890FF",
    },
    {
      label: "Actual Loading",
      color: "#CF1322",
    },
  ];

  const mapContainer = useRef(null);
  const mapRef = useRef<any>(null);

  const [lng] = useState(120.44477292688124);
  const [lat] = useState(-29.147190282051838);

  const rippleIcon = () => {
    const standardIconTemplate = `<div id="imageContainer" style="position:relative; transform: translate(-40px, -80px);">
                  <img style="height:400px;" src=${eqImgae} alt="Description of the image">
                </div>`;

    const icon = document.createElement("div");
    icon.innerHTML = standardIconTemplate;
    return icon;
  };

  useEffect(() => {
    mapboxgl.accessToken =
      "pk.eyJ1IjoiaG1lc3VwcG9ydCIsImEiOiJjbHp1eTRibDAwMG05MmpvczE1ZHdham5qIn0.ZoE3pSipzwdf-0TkY3ezzw";

    if (mapRef.current) return;

    mapRef.current = new mapboxgl.Map({
      container: mapContainer.current!,
      style: "mapbox://styles/hmesupport/cm00qombw008z01oe8pcf6j2m",
      center: [lng, lat],
      zoom: 21,
      pitch: 0,
    });

    mapRef.current.on("load", () => {
      const el = rippleIcon();
      const marker = new mapboxgl.Marker(el)
        .setLngLat([lng, lat])
        .addTo(mapRef.current);

      const createDashedCircleLayer = (sourceId, layerId, radius) => {
        const geoJson = {
          type: "Feature",
          geometry: {
            type: "Polygon",
            coordinates: [generateCircleCoordinates([lng, lat], radius)],
          },
        };
        mapRef.current?.addSource(sourceId, {
          type: "geojson",
          data: geoJson,
        });
        mapRef.current?.addLayer({
          id: layerId,
          type: "line",
          source: sourceId,
          layout: {},
          paint: {
            "line-color": "#000",
            "line-width": 2,
            "line-dasharray": [1, 2],
          },
        });
      };
      createDashedCircleLayer("dashed-outer-circle", "dashed-line-layer", 10);
      createDashedCircleLayer(
        "dashed-inner-circle",
        "inner-dashed-line-layer",
        8
      );

      mapRef.current?.addSource("circle", {
        type: "geojson",
        data: dotData,
      });

      mapRef.current?.addLayer({
        id: "circle",
        type: "line",
        source: "circle",
        layout: {},
        paint: {
          "line-color": "#FF0000",
          "line-width": 3,
        },
      });

      mapRef.current?.addLayer({
        id: "circle-number",
        type: "symbol",
        source: "circle",
        layout: {
          "text-field": "{number}",
          "text-size": 15,
          "text-anchor": "center",
          "text-offset": [0, 0],
        },
        paint: {
          "text-color": "#FF0000",
        },
      });
    });
  }, [lat, lng]);

  return (
    <div>
      <div className="visual-legend-container">
        <p className="visual-legend">Legend:</p>
        {legendData &&
          legendData.map((item, index) => (
            <div
              key={index}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "left",
              }}
            >
              <span
                style={{
                  height: "8px",
                  width: "8px",
                  color: "transparent",
                  backgroundColor: item.color,
                  borderRadius: "50%",
                  fontSize: "1px",
                }}
              ></span>
              <span className="text-center px-2 legend-label">
                {item.label}
              </span>
            </div>
          ))}
      </div>
      <div
        id="map"
        ref={mapContainer}
        className="digging-optimisation-map"
      ></div>
    </div>
  );
};

export default DiggingOptimisationVisualView;
