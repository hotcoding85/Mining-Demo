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

      if (markers.current && markers.current.length > 0) {
        markers.current.forEach((marker) => {
          const _el = marker.getElement();
      
          if (_el) {
            // Create a wrapper for marker content if it doesn't already exist
            let contentWrapper = _el.querySelector('svg');
            // Recalculate the scale for each marker based on distance and zoom
            const minScale = 0; // Minimum scale factor
            const maxScale = 1; // Maximum scale factor
            const minZoomLevel = 16;
            const maxZoomLevel = 23;
            const zoomLevel = mapRef.current.getZoom(); // Get current zoom level
      
            const zoomScaleFactor = maxScale - (maxScale - minScale) * ((maxZoomLevel - zoomLevel) / (maxZoomLevel - minZoomLevel));
            if (contentWrapper) {
        
              // Apply scaling only to the wrapper
              contentWrapper.style.scale = `${zoomScaleFactor}`;
            }
            else{
              let div = _el.querySelector('div.cluster-each-marker');
              div && (div.style.scale = `${zoomScaleFactor}`)
            }
          }
        });
      }
      updateScaleBar()
    }
    
    mapRef.current.on("load", () => {
      const el = rippleIcon();
      mapRef.current.on('zoom', () => {
        updateMarkerAndScaleBar(el)
      });
      mapRef.current.on('move', (e) => {
        updateMarkerAndScaleBar(el)
      });

      // Add the scale bar to the map view
      addScaleBar();
      updateScaleBar();
      updateMarkerAndScaleBar(el)
      // const marker = new mapboxgl.Marker(el, {
      //     rotationAlignment: 'map',  // Ensures the icon stays flat on the map
      //     pitchAlignment: 'map'      // Prevents the icon from tilting with the map
      //   })
      //   .setLngLat([lng, lat])
      //   .addTo(mapRef.current);

      const createDashedCircleLayer = (sourceId, layerId, radius) => {
        coordinates.current = generateCircleCoordinates([lng, lat], radius)
        if (radius === 10) {
          for (let i = 0 ; i < 20 ; i ++) {
            let sourceId = "buffered-geofence-" + i
            let layerId = 'buffered-layer-' + i
            let clusterLayerId = 'cluster-count-' + i
            let clusterId = 'clustered-count-' + i
            let clusterMarkerId = 'clustered-markers-' + i
            let clusterMarkerLayerId = 'clusters-' + i
            if (mapRef.current?.getLayer(layerId)) {
              mapRef.current?.removeLayer(layerId);
            }
            if (mapRef.current?.getSource(sourceId)) {
              mapRef.current?.removeSource(sourceId);
            }
            if (mapRef.current?.getLayer(clusterLayerId)) {
              mapRef.current?.removeLayer(clusterLayerId);
            }
            if (mapRef.current?.getSource(clusterId)) {
              mapRef.current?.removeSource(clusterId);
            }
            if (mapRef.current?.getLayer(clusterMarkerLayerId)) {
              mapRef.current?.removeLayer(clusterMarkerLayerId);
            }
            if (mapRef.current?.getSource(clusterMarkerId)) {
              mapRef.current?.removeSource(clusterMarkerId);
            }
          }
          drawBufferedPolygon(coordinates.current)
        }
        // const geoJson = {
        //   type: "Feature",
        //   geometry: {
        //     type: "Polygon",
        //     coordinates: [coordinates.current],
        //   },
        // };
        // mapRef.current?.addSource(sourceId, {
        //   type: "geojson",
        //   data: geoJson,
        // });
        // mapRef.current?.addLayer({
        //   id: layerId,
        //   type: "line",
        //   source: sourceId,
        //   layout: {},
        //   paint: {
        //     "line-color": "#000",
        //     "line-width": 2,
        //     "line-dasharray": [1, 2],
        //   },
        // });
      };
      createDashedCircleLayer("dashed-outer-circle", "dashed-line-layer", 10);
      createDashedCircleLayer(
        "dashed-inner-circle",
        "inner-dashed-line-layer",
        8
      );
    });
  }, [lat, lng, selectedInterval]);

  const popup = useRef<any>(null);

  const drawBufferedPolygon = useCallback((coordinates) => {
    if (!coordinates || coordinates.length === 0) return;
  
    const geofencesWithCircle = geofences.features.filter((geofence) => {
      const polygon: any = geofence.geometry;
      if (geofence.properties.grade < 1) return false;
      return coordinates.some((coordinate) => {
        const point = turf.point(coordinate);
        return turf.booleanPointInPolygon(point, polygon);
      });
    });
  
    const allMarkers: any = [];
  
    geofencesWithCircle.forEach((geofence: any, index) => {
      // Buffer the polygon by the selected interval
      const bufferedPolygon: any = turf.buffer(geofence, selectedInterval, { units: 'meters' });
  
      // Create a new GeoJSON source for the buffered polygon
      const bufferSourceId = `buffered-geofence-${index}`;
      mapRef.current?.addSource(bufferSourceId, {
        type: 'geojson',
        data: bufferedPolygon,
      });
  
      // Add a new layer to draw the buffered polygon
      mapRef.current?.addLayer({
        id: `buffered-layer-${index}`,
        type: 'fill',
        source: bufferSourceId,
        paint: {
          'fill-color': geofence.properties.fillColor,
          'fill-opacity': 0.6,
        },
      });
  
      // Generate random points within the buffered polygon
      const markersInPolygon: any = [];
      while (markersInPolygon.length < totalMarkers / geofencesWithCircle.length) {
        const randomPoint = turf.randomPoint(1, {
          bbox: turf.bbox(bufferedPolygon),
        }).features[0];
  
        if (turf.booleanPointInPolygon(randomPoint, bufferedPolygon)) {
          markersInPolygon.push(randomPoint);
        }
      }
  
      // Store all markers to later process for grouping
      markersInPolygon.forEach(markerPoint => {
        const lngLat = {
          lng: markerPoint.geometry.coordinates[0],
          lat: markerPoint.geometry.coordinates[1]
        };
        allMarkers.push(lngLat);
      });
    });
  
    // Function to group markers by distance
    const groupedMarkers: any = [];
    const markerRadius = 0.0000045; // Approx 0.5 meters in degrees (change based on your map scale)
  
    allMarkers.forEach((marker, index) => {
      const group = { markers: [marker], count: 1 };
  
      allMarkers.forEach((otherMarker, otherIndex) => {
        if (index !== otherIndex) {
          const distance = turf.distance(
            turf.point([marker.lng, marker.lat]), 
            turf.point([otherMarker.lng, otherMarker.lat]), 
            { units: 'meters' }
          );
          if (distance <= 0.5) {
            group.markers.push(otherMarker);
            group.count += 1;
          }
        }
      });
  
      // Only add if it's not already grouped
      if (!groupedMarkers.find((g: any) => g.markers.includes(marker))) {
        groupedMarkers.push(group);
      }
    });
  
    // Draw grouped markers
    groupedMarkers.forEach((group) => {
      if (group.count > 1) {
        // Create a grouped marker for the cluster
        const avgLng = group.markers.reduce((sum, m) => sum + m.lng, 0) / group.count;
        const avgLat = group.markers.reduce((sum, m) => sum + m.lat, 0) / group.count;
        // Create a custom marker element
        const div = document.createElement('div')
        const markerElement = document.createElement('div');
        div.style.width = '30px'; // Adjust width as necessary
        div.style.height = '30px'; // Adjust height as necessary
        markerElement.style.backgroundColor = 'red'; // Background color
        div.style.borderRadius = '50%'; // Make it circular
        markerElement.style.display = 'flex'; // Use flexbox for centering
        markerElement.style.alignItems = 'center'; // Center vertically
        markerElement.style.justifyContent = 'center'; // Center horizontally
        markerElement.style.color = 'white'; // Text color
        markerElement.style.fontSize = '14px'; // Font size
        markerElement.style.position = 'absolute'; // Positioning context for text
        markerElement.style.width = '100%'
        markerElement.style.height = '100%'
        markerElement.style.borderRadius = '50%'
        markerElement.className = 'cluster-each-marker'
        // Scale the marker based on count
        const scale = 0.5 + (group.count * 0.1);
        div.style.transform = `scale(${scale})`; // Apply scaling
        div.append(markerElement)
        // Add the count to the marker
        markerElement.textContent = group.count;
        
        // Create the marker
        const marker = new mapboxgl.Marker(div)
          .setLngLat({ lng: avgLng, lat: avgLat })
          .addTo(mapRef.current);
  

        let html = '<div class="clustered-marker-popup">'
        for (let i = 0 ; i < group.count ; i ++) {
          const _digpoint = {
            TruckName: Math.random() > 0.5 ? 'DT101' : 'DT202',
            TonnesLoaded: Math.floor(Math.random() * (18 - 5 + 1)) + 5,
            Destination: Math.random() > 0.5 ? 'Central Waste' : 'Central Waste',
          };

          const formatTimestamp = (date) => {
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed, so add 1
            const day = String(date.getDate()).padStart(2, '0');
            const hours = Math.floor(Math.random() * 24);
            const minutes = Math.floor(Math.random() * 60);
          
            return `${year}-${month}-${day} ${hours}:${minutes}`;
          };
          
          // Create a new Date object and format it
          const timestamp = formatTimestamp(new Date());

          html += `<strong>Point${i + 1}</strong><br /><strong>${_digpoint.TruckName}</strong> <strong>(${timestamp})</strong><br />
          <strong>Tonnes Loaded:</strong> ${_digpoint.TonnesLoaded}t<br />
          <strong>Dump Location:</strong> ${_digpoint.Destination}<br />
          <strong>GPS Coordinates: [${group.markers[i].lng}, ${group.markers[i].lat}]</strong><br />
          <div class='divider'></div>`
        }
        html += '</div>';
        // Tooltip for grouped markers
        marker.getElement().addEventListener('mouseenter', () => {
          marker.getElement().style.cursor = 'pointer';
          if (popup.current) {
            popup.current.remove();
            popup.current = null
          }
          popup.current = new mapboxgl.Popup()
            .setLngLat({ lng: avgLng, lat: avgLat })
            .setHTML(html)
            .addTo(mapRef.current);
        });
  
        marker.getElement().addEventListener('mouseleave', () => {
          // if (popup) popup.remove(); // Remove the popup on mouse leave
        });
  
        markers.current.push(marker);
      } else {
        let _popup
        const _digpoint = {
          TruckName: Math.random() > 0.5 ? 'DT101' : 'DT202',
          TonnesLoaded: Math.floor(Math.random() * (18 - 5 + 1)) + 5,
          Destination: Math.random() > 0.5 ? 'Central Waste' : 'Central Waste',
        };
        // Count is 1, so draw individual marker
        const marker = new mapboxgl.Marker({ color: 'green', scale: 0.5 })
          .setLngLat(group.markers[0]) // Use the original marker's coordinates
          .addTo(mapRef.current);
  
        marker.getElement().addEventListener('click', () => {
          setSelectedPoint(_digpoint);
        });

        const formatTimestamp = (date) => {
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed, so add 1
          const day = String(date.getDate()).padStart(2, '0');
          const hours = Math.floor(Math.random() * 24);
          const minutes = Math.floor(Math.random() * 60);
        
          return `${year}-${month}-${day} ${hours}:${minutes}`;
        };
        
        // Create a new Date object and format it
        const timestamp = formatTimestamp(new Date());
        // Tooltip for individual markers
        marker.getElement().addEventListener('mouseenter', () => {
          marker.getElement().style.cursor = 'pointer';
          if (popup.current) {
            popup.current.remove();
            popup.current = null
          }
          _popup = new mapboxgl.Popup()
            .setLngLat(group.markers[0])
            .setHTML(`<strong>${_digpoint.TruckName}</strong> <strong>(${timestamp})</strong><br />
                      <strong>Tonnes Loaded:</strong> ${_digpoint.TonnesLoaded}t<br />
                      <strong>Dump Location:</strong> ${_digpoint.Destination}<br />
                      <strong>GPS Coordinates: [${group.markers[0].lng}, ${group.markers[0].lat}]</strong>`) // Replace with actual info if needed
            .addTo(mapRef.current);
        });
  
        marker.getElement().addEventListener('mouseleave', () => {
          if (_popup) _popup.remove(); // Remove the popup on mouse leave
        });
  
        markers.current.push(marker);
      }
    });
  }, [selectedInterval]);
  

  useEffect(() => {
    if (!mapRef.current) return
    for (let i = 0 ; i < 20 ; i ++) {
      let sourceId = "buffered-geofence-" + i
      let layerId = 'buffered-layer-' + i
      let clusterLayerId = 'cluster-count-' + i
      let clusterId = 'clustered-count-' + i
      let clusterMarkerId = 'clustered-markers-' + i
      let clusterMarkerLayerId = 'clusters-' + i
      if (mapRef.current?.getLayer(layerId)) {
        mapRef.current?.removeLayer(layerId);
      }
      if (mapRef.current?.getSource(sourceId)) {
        mapRef.current?.removeSource(sourceId);
      }
      if (mapRef.current?.getLayer(clusterLayerId)) {
        mapRef.current?.removeLayer(clusterLayerId);
      }
      if (mapRef.current?.getSource(clusterId)) {
        mapRef.current?.removeSource(clusterId);
      }
      if (mapRef.current?.getLayer(clusterMarkerLayerId)) {
        mapRef.current?.removeLayer(clusterMarkerLayerId);
      }
      if (mapRef.current?.getSource(clusterMarkerId)) {
        mapRef.current?.removeSource(clusterMarkerId);
      }
      markers.current.forEach(marker => marker.remove());
      markers.current = []; // Clear markers array for new markers
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
