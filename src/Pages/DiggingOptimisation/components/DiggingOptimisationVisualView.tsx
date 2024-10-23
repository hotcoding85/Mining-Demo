import React, { useCallback, useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import eqImgae from "../../../assets/images/equipment/digger-top-view.png";
import { dotData } from "../data/sampleData";
import { Slider } from "antd";
import geofences from '../../Geofences/output.json'
import * as turf from '@turf/turf' 
interface Dot {
  type: "Feature";
  geometry: {
    type: "Point";
    coordinates: [number, number];
  };
  properties: Record<string, unknown>;
}

interface DigPoint {
  TruckName: string;
  TonnesLoaded: number;
  Destination: string;
}
const totalMarkers = 520;
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
  const [selectedPoint, setSelectedPoint] = useState<DigPoint | null>(null)

  const mapContainer = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<any>(null);
  const coordinates = useRef<any>()
  const markers = useRef<any>([])
  const [lng] = useState(120.44477292688124);
  const [lat] = useState(-29.147190282051838);
  const marks = {
    1: '1m',
    2: '2m',
    3: '3m',
    4: '4m',
    5: '5m'
  };
  const [selectedInterval, setSelectedInterval] = useState<number>(1);
  const rippleIcon = () => {
    const standardIconTemplate = `<div id="imageContainer" style="position:relative; ">
                  <img id="rippleImage" style="height:300px; object-fit:contain;" src=${eqImgae} alt="Description of the image">
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

    const getScaleForZoom = (zoomLevel) => {
      const minZoom = 5;  // Define minimum zoom level
      const maxZoom = 20; // Define maximum zoom level
      const minScale = 0.5; // Scale factor at minimum zoom
      const maxScale = 2;   // Scale factor at maximum zoom
      
      // Calculate scale based on zoom level, clamped between minScale and maxScale
      return Math.max(minScale, Math.min(maxScale, (zoomLevel - minZoom) / (maxZoom - minZoom) * (maxScale - minScale) + minScale));
    };

    // Add the scale bar
    const addScaleBar = () => {
      // Create a white div for the scale bar
      const scaleBar = document.createElement("div");
      scaleBar.id = "scaleBar";
      scaleBar.style.position = "absolute";
      scaleBar.style.bottom = "10px";
      scaleBar.style.left = "10px";
      scaleBar.style.width = "270px";  // Initial width, will be updated
      scaleBar.style.height = "12px";
      scaleBar.style.color = "red";
      scaleBar.style.fontWeight = "600";
      scaleBar.style.backgroundColor = "white";
      scaleBar.style.border = "1px solid grey";
      scaleBar.style.textAlign = "center";
      scaleBar.style.fontSize = "12px";
      scaleBar.style.lineHeight = "10px";  // Vertically center the text
      scaleBar.innerHTML = "100m";  // Initial scale value
      
      mapContainer.current && mapContainer.current.appendChild(scaleBar);  // Append scale bar to the body
    };

    // Function to update the scale bar based on zoom level
    const updateScaleBar = () => {
      const zoomLevel = mapRef.current?.getZoom() || 10;
      const centerLat = mapRef.current?.getCenter().lat || 0;
      
      // Calculate meters per pixel at current zoom and latitude
      const metersPerPixel = getMetersPerPixelAtLat(zoomLevel, centerLat);
      // Set a fixed width for the scale bar (e.g., 100 pixels) and calculate the corresponding distance in meters
      const scaleBarWidth = 122.71; // 100 pixels wide
      const distanceInMeters = metersPerPixel * scaleBarWidth; // Calculate the real-world distance represented by 100px
  
      // Update the scale bar's width and text to reflect the current scale
      const scaleBar = document.getElementById('scaleBar');
      if (scaleBar) {
        scaleBar.style.width = `${scaleBarWidth}px`;
        scaleBar.innerHTML = `${Math.round(distanceInMeters) / 2} m`;
      }
    };

    // Utility function to get the meters per pixel at a specific latitude
    const getMetersPerPixelAtLat = (zoom, lat) => {
      const earthCircumference = 40075017;  // Earth's circumference in meters
      const scale = Math.cos(lat * Math.PI / 180) * earthCircumference / Math.pow(2, zoom + 8);
      return scale;  // Meters per pixel
    };

    const getScaleForWidth = (desiredWidthInMeters, zoomLevel, latitude) => {
      const metersPerPixel = getMetersPerPixelAtLat(zoomLevel, latitude);
      const currentWidthInPixels = desiredWidthInMeters / metersPerPixel; // Convert desired width to pixels
      return currentWidthInPixels / 300; // Scale based on the current marker image width (300px)
    };

    const updateMarkerAndScaleBar = (el) => {
      const zoomLevel = mapRef.current.getZoom();
      const center = mapRef.current.getCenter(); // Get the current center of the map
      const markerLngLat: any = { lng, lat }; // Use the marker's original coordinates
      console.log(center, markerLngLat)
      // Calculate the distance in meters between the center of the map and the marker
      const distance = turf.distance([center.lng, center.lat], [markerLngLat.lng, markerLngLat.lat], { units: 'meters' }); // Distance in kilometers
      const maxDistance = 1000; // Maximum distance where scaling is applied (e.g., 1000 meters)
      const scaleFactor = Math.max(0.1, 1 - (distance / maxDistance)); // Shrink marker as distance increases


      // Calculate the new height for the ripple image based on scale factor
      const rippleImage = el.querySelector('#rippleImage');
      if (rippleImage) {
        const desiredWidthInMeters = 35; // Desired width in meters
        const metersPerPixel = getMetersPerPixelAtLat(zoomLevel, center.lat);
        const newHeight = Math.floor((desiredWidthInMeters) / metersPerPixel) + 'px';
        rippleImage.style.height = newHeight;


        // Optionally adjust the translation based on new height
        const heightAdjustment = parseInt(newHeight, 10) / 2; // Center the image vertically
        // el.style.transform = `translate(-40px, -${heightAdjustment}px)`;
      }
      updateScaleBar()
    }
    
    mapRef.current.on("load", () => {
      const el = rippleIcon();
      mapRef.current.on('zoom', () => {
        updateMarkerAndScaleBar(el)
      });
      mapRef.current.on('move', (e) => {
        console.log(e)
        updateMarkerAndScaleBar(el)
      });

      // Add the scale bar to the map view
      addScaleBar();
      updateScaleBar();
      updateMarkerAndScaleBar(el)
      const marker = new mapboxgl.Marker(el, {
          rotationAlignment: 'map',  // Ensures the icon stays flat on the map
          pitchAlignment: 'map'      // Prevents the icon from tilting with the map
        })
        .setLngLat([lng, lat])
        .addTo(mapRef.current);

      const createDashedCircleLayer = (sourceId, layerId, radius) => {
        coordinates.current = generateCircleCoordinates([lng, lat], radius)
        if (radius === 10) {
          for (let i = 0 ; i < 20 ; i ++) {
            let sourceId = "buffered-geofence-" + i
            let layerId = 'buffered-layer-' + i
            if (mapRef.current?.getSource(sourceId)) {
              if (mapRef.current?.getLayer(layerId)) {
                mapRef.current?.removeLayer(layerId);
              }
              mapRef.current?.removeSource(sourceId);
            }
          }
          drawBufferedPolygon(coordinates.current)
        }
        const geoJson = {
          type: "Feature",
          geometry: {
            type: "Polygon",
            coordinates: [coordinates.current],
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
    });
  }, [lat, lng, selectedInterval]);

  const drawBufferedPolygon = useCallback((coordinates) => {
    if (!coordinates || coordinates.length === 0) return;
    // remove existing markers
    markers.current.map(_marker => {
      _marker.remove()
    })
    // Find geofences that include the circle coordinates
    const geofencesWithCircle = geofences.features.filter((geofence) => {
      const polygon: any = geofence.geometry;
      if (geofence.properties.grade < 1) return false
      // Check if any point in the circle is within this geofence polygon
      return coordinates.some((coordinate) => {
        const point = turf.point(coordinate);
        return turf.booleanPointInPolygon(point, polygon);
      });
    });
    geofencesWithCircle.forEach((geofence: any, index) => {
      // Buffer the polygon by 5 meters
      const bufferedPolygon: any = turf.buffer(geofence, selectedInterval, { units: 'meters' });
    
      // Create a new GeoJSON source for the buffered polygon
      const bufferSourceId = `buffered-geofence-${index}`;
      mapRef.current?.addSource(bufferSourceId, {
        type: 'geojson',
        data: bufferedPolygon,
      });

    
      // Add a new layer to draw the buffered polygon with a specific style
      mapRef.current?.addLayer({
        id: `buffered-layer-${index}`,
        type: 'fill',
        source: bufferSourceId,
        paint: {
          'fill-color': geofence.properties.fillColor, // Change to your preferred color
          'fill-opacity': 0.6,
        },
      });


      // draw random markers
      const markersInPolygon: any = [];

      // Generate random points within the buffered polygon
      while (markersInPolygon.length < totalMarkers / geofencesWithCircle.length) {
        // Create a random point
        const randomPoint: any = turf.randomPoint(1, {
          bbox: turf.bbox(bufferedPolygon),
        }).features[0];
        
        // Check if the random point is inside the buffered polygon
        if (turf.booleanPointInPolygon(randomPoint, bufferedPolygon)) {
          markersInPolygon.push(randomPoint);
        }
      }
      // Add the markers to the map
      markersInPolygon.forEach((markerPoint, markerIndex) => {
        const lngLat = {
          lng: markerPoint.geometry.coordinates[0], // longitude
          lat: markerPoint.geometry.coordinates[1]  // latitude
        };
        const marker = new mapboxgl.Marker({color: 'green', scale: 0.5})
            .setLngLat(lngLat) // Set the longitude and latitude
            .addTo(mapRef.current); // Add the marker to the map

        const _digpoint: DigPoint = {
          TruckName: Math.random() > 0.5 ? 'DT101' : 'DT202',
          TonnesLoaded: Math.ceil(Math.random() * 100),
          Destination: Math.random() > 0.5 ? 'Haul Truck' : 'Dozer'
        }
        marker.getElement().addEventListener('click', (e) => {setSelectedPoint(_digpoint)});
        // If you want to store the index in the marker, you can do it like this
        marker.getElement().dataset.index = (markerIndex + 1).toString(); // Store index in a data attribute

        markers.current.push(marker)
      });
    });
  }, [selectedInterval])

  useEffect(() => {
    if (!mapRef.current) return
    for (let i = 0 ; i < 20 ; i ++) {
      let sourceId = "buffered-geofence-" + i
      let layerId = 'buffered-layer-' + i
      if (mapRef.current?.getLayer(layerId)) {
        mapRef.current?.removeLayer(layerId);
      }
      if (mapRef.current?.getSource(sourceId)) {
        mapRef.current?.removeSource(sourceId);
      }
    }
    drawBufferedPolygon(coordinates.current)
  }, [selectedInterval, coordinates.current])
  return (
    <div>
      <div className="visual-legend-container">
        <div style={{ width: '250px' }}>
          <Slider
            marks={marks}
            step={1}  // Allow only the marks (1, 2, 3, 4, 5)
            defaultValue={1}
            value={selectedInterval}
            onChange={setSelectedInterval}
            min={1}
            max={5}
            tooltipVisible
          />
        </div>
      </div>
      <div
        id="map"
        ref={mapContainer}
        className="digging-optimisation-map"
      ></div>
      {
        selectedPoint && <>
          <table className="table-responsive w-full table-bordered" style={{width: '100%', marginTop: '1rem'}}>
            <thead>
              <tr>
                <th>Truck Name</th>
                <th>Tonnes Loaded</th>
                <th>Destination it dumped</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>{selectedPoint.TruckName}</td>
                <td>{selectedPoint.TonnesLoaded}t</td>
                <td>{selectedPoint.Destination}</td>
              </tr>
            </tbody>
          </table>
        </>
      }
    </div>
  );
};

export default DiggingOptimisationVisualView;
