import React, { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import eqImgae from "../../../assets/images/equipment/truck-top-view.png";

interface Dot {
  type: "Feature";
  geometry: {
    type: "Point";
    coordinates: [number, number];
  };
  properties: Record<string, unknown>;
}

function generateDotsWithinCircle(
  center: [number, number],
  radiusInMeters: number,
  numDots: number
): Dot[] {
  const dots: Dot[] = [];

  for (let i = 0; i < numDots; i++) {
    const angle = Math.random() * 2 * Math.PI;
    const distance = Math.random() * radiusInMeters;

    const dx = distance * Math.cos(angle);
    const dy = distance * Math.sin(angle);

    const newLongitude = center[0] + dx / 111320;
    const newLatitude = center[1] + dy / 110540;

    dots.push({
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [newLongitude, newLatitude],
      },
      properties: {},
    });
  }

  return dots;
}

function generateCircleCoordinates(
  center: [number, number],
  radiusInMeters: number
): [number, number][] {
  const coordinates: [number, number][] = [];
  const numPoints = 64; // Increase for smoother circle
  const angleStep = (2 * Math.PI) / numPoints;

  for (let i = 0; i <= numPoints; i++) {
    const angle = i * angleStep;
    const dx = radiusInMeters * Math.cos(angle);
    const dy = radiusInMeters * Math.sin(angle);

    // Convert distance in meters to degrees
    const newLongitude = center[0] + dx / 111320;
    const newLatitude = center[1] + dy / 110540;
    coordinates.push([newLongitude, newLatitude]);
  }

  return coordinates;
}

const HaulRoadOptimisationVisualView = () => {
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
    const standardIconTemplate = `<div id="imageContainer" style="position: absolute;bottom: 5px;transform: translateX(-40%); z-index:1;">
                  <img style="height:120px;" src=${eqImgae} alt="Description of the image">
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
      zoom: 23,
      pitch: 0,
    });

    mapRef.current.on("load", () => {
      const el = rippleIcon();
      const marker = new mapboxgl.Marker(el)
        .setLngLat([lng, lat])
        .addTo(mapRef.current);
      marker.getElement().addEventListener("click", () =>
        mapRef.current?.flyTo({
          center: [lng, lat],
          zoom: 24,
          speed: 1,
        })
      );

      const dashedCircleGeoJson = {
        type: "Feature",
        geometry: {
          type: "Polygon",
          coordinates: [generateCircleCoordinates([lng, lat], 10)],
        },
      };

      mapRef.current?.addSource("dashed-circle", {
        type: "geojson",
        data: dashedCircleGeoJson,
      });

      mapRef.current?.addLayer({
        id: "dashed-line-layer",
        type: "line",
        source: "dashed-circle",
        layout: {},
        paint: {
          "line-color": "#000",
          "line-width": 2,
          "line-dasharray": [1, 2],
        },
      });

      const dotsData = {
        type: "FeatureCollection",
        features: generateDotsWithinCircle([lng, lat], 10, 5),
      };

      mapRef.current?.addSource("dots", {
        type: "geojson",
        data: dotsData,
      });

      mapRef.current?.addLayer({
        id: "dots-layer",
        type: "circle",
        source: "dots",
        paint: {
          "circle-radius": 5,
          "circle-color": "#CF1322",
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
        className="haul-raod-optimisation-map"
      ></div>
    </div>
  );
};

export default HaulRoadOptimisationVisualView;
