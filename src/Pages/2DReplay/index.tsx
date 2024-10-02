import React, { useCallback, useEffect, useRef, useState } from "react";
import { Card, Col, Container, Row } from "reactstrap";
import Breadcrumb from "Components/Common/Breadcrumb";
import { Collapse, Menu } from "antd";
import _ from "lodash";
import * as turf from "@turf/turf";
import mapboxgl, { Marker } from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import "@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css";
import RBush from "rbush";
import booleanPointInPolygon from "@turf/boolean-point-in-polygon";
import TimeSlider from "./TimeSlider";
import mapLocationImage from "assets/images/map/map-location.png";
import { excavatorImages, truckImages } from "assets/images/equipment";
import {
  dumpingPaths,
  EquipmentLocation,
  equipments,
  travellingPaths,
} from "../Map/sample";
import * as Leaflet from "leaflet";
import "./index.css";

import { RouteDataType } from "Pages/AutoRouting/type";
import ReactApexChart from "react-apexcharts";
import { useDispatch, useSelector } from "react-redux";
import { getAllVehicleRoutes } from "slices/thunk";
import { LineString } from "interfaces/GeoJson";
import { VehicleRouteSelector } from "selectors";

export type TripRoutesDataType = {
  id: string;
  routes: RouteDataType[];
};

interface MarkerData {
  id: string;
  marker: Marker;
}

const index = new RBush();
const Replay2D = (props: any) => {
  document.title = "2D GPS Fleet Tracking | FMS Live";

  const mapContainer = useRef(null);
  const mapRef = useRef<any>(null);
  const [lng, setLng] = useState(120.44463458272295);
  const [lat, setLat] = useState(-29.146790943732764);
  const geojsonData = useRef<any>();
  const [routeData, setRouteData] = useState<TripRoutesDataType[]>([]);
  const stopSignData = useRef<RouteDataType[]>([]);
  const [selectedTrip, setSelectedTrip] = useState<RouteDataType | null>(null);

  // TimeSlider
  const [isPlaying, setIsPlaying] = useState(false);
  const currentIsPlaying = useRef<boolean>(false);
  const [speed, setSpeed] = useState(1);
  const currentSpeed = useRef<number>(1);
  const [timeValue, setTimeValue] = useState(0);
  const currentTimeValue = useRef<number>(-1);
  var [geofences, setGeofences] = useState<any[]>([]);
  const [markers, setMarkers] = useState<MarkerData[]>([]);
  const [mapStylesLoaded, setMapStylesLoaded] = useState(false);


  const drawItems = new Leaflet.FeatureGroup();
  const origin: Leaflet.LatLngExpression = [
    -29.160331938574046, 120.44974338024406,
  ];
  const [filter, setFilter] = useState<string>("All Equipment");

  const [totalTime, setTotalTime] = useState(0); // 00h 59m 24s in seconds

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
    currentIsPlaying.current = !isPlaying;
  };

  const handleSpeedChange = (value: number) => {
    setSpeed(value);
    currentSpeed.current = value;
  };

  const handleTimeChange = (value: number) => {
    setTimeValue(value);
    currentTimeValue.current = value;
  };

  // Helper function to get the current index of the selected trip
  const getCurrentIndex = useCallback(() => {
    return selectedTrip
      ? routeData[0].routes.findIndex((trip) => trip.id === selectedTrip.id)
      : -1;
  }, [routeData, selectedTrip]);

  // Handler for the "Next" button
  const handleNext = useCallback(() => {
    if (!routeData || !selectedTrip) return;
    const currentIndex = getCurrentIndex();
    const nextIndex = (currentIndex + 1) % routeData[0].routes.length; // Loop to the start if at the end
    selectTrip(routeData[0].routes[nextIndex]);
  }, [routeData, selectedTrip]);

  // Handler for the "Prev" button
  const handlePrev = useCallback(() => {
    if (!routeData || !selectedTrip) return;
    const currentIndex = getCurrentIndex();
    const prevIndex =
      (currentIndex - 1 + routeData[0].routes.length) %
      routeData[0].routes.length; // Loop to the end if at the start
    selectTrip(routeData[0].routes[prevIndex]);
  }, [routeData, selectedTrip]);

  // Use useRef to store the interval ID
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Effect to manage the play interval logic
  useEffect(() => {
    if (isPlaying) {
      const intervalTime = 1000 / speed;
      intervalRef.current = setInterval(() => {
        setTimeValue((prev) => {
          const newValue = prev + 1;
          if (newValue >= totalTime) {
            setIsPlaying(false); // Stop when reaching the end
            currentIsPlaying.current = false;
            return totalTime;
          }
          return newValue;
        });
      }, intervalTime);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null; // Clear the reference
    }

    // Cleanup when component unmounts or when isPlaying changes
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null; // Clear the reference
      }
    };
  }, [isPlaying, speed]);

  const { Panel } = Collapse;

  let defaultApexOptions: ApexCharts.ApexOptions = {
    chart: {
      type: "bar", // Ensure this is one of the allowed values
      height: 250,
      width: 650,
      toolbar: {
        show: false,
      },
      zoom: {
        enabled: false,
      },
      animations: {
        enabled: true,
        easing: "easeinout",
        speed: 800,
        animateGradually: {
          enabled: true,
          delay: 150,
        },
        dynamicAnimation: {
          enabled: true,
          speed: 350,
        },
      },
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      curve: "smooth",
    },
    tooltip: {
      enabled: true,
      followCursor: false,
      marker: {
        show: true,
      },
      x: {
        show: false,
      },
      y: {
        formatter: function (value) {
          return `Altitude: ${value} m`;
        },
      },
    },
    grid: {
      show: false,
    },
    xaxis: {
      type: "numeric",
      categories: [], // Your categories here
      labels: {
        formatter: function (value) {
          return `${value}m`; // Adds 'm' to each y-axis label
        },
      },
    },
    yaxis: {
      opposite: false,
      labels: {
        formatter: function (value) {
          return `${value}m`; // Adds 'm' to each y-axis label
        },
      },
    },
    legend: {
      horizontalAlign: "right",
    },
    annotations: {
      xaxis: [
        {
          x: 0, // Initial position of the annotation
          borderColor: "#00E396",
          label: {
            text: "",
            style: {
              color: "#fff",
              background: "#00E396",
              fontSize: "12px",
              fontWeight: 600,
              padding: {
                left: 10,
                right: 10,
                top: 5,
                bottom: 5,
              },
            },
          },
        },
      ],
      yaxis: [
        {
          y: 0, // y value for the annotation
          borderColor: "#FF4560",
          label: {
            text: "",
            style: {
              color: "#fff",
              background: "#FF4560",
              fontSize: "12px",
              fontWeight: 600,
              padding: {
                left: 10,
                right: 10,
                top: 5,
                bottom: 5,
              },
            },
          },
        },
      ],
      points: [
        {
          marker: {
            size: 20, // Size of the marker
            shape: "custom", // Using a custom shape
            offsetX: 0,
            offsetY: -10,
          },
        },
      ],
    },
  };
  const [apexOptions, setApexOptions] =
    useState<ApexCharts.ApexOptions>(defaultApexOptions);

  let defaultSeries = [
    {
      name: "",
      data: [],
    },
  ];
  const [series, setSeries] = useState(defaultSeries);

  const dispatch: any = useDispatch();

  const { vehicleRoutes } = useSelector(VehicleRouteSelector);

  useEffect(() => {
    const _routeData = _.map(
      vehicleRoutes.filter(
        (_route) =>
          _route.category !== "STOP_SIGNS" && _route.status == "ACTIVE"
      ),
      (route) => {
        return {
          id: route.id,
          name: route.name,
          speedLimits: route.speedLimits,
          geoJson: route.geoJson,
          distance: route.distance,
          duration: route.duration,
          color: route.color,
          speeds: [],
        };
      }
    );
    setRouteData([{ id: "DT101", routes: _routeData }]);
    const _stopSignData = _.map(
      vehicleRoutes.filter(
        (_route) =>
          _route.category === "STOP_SIGNS" && _route.status == "ACTIVE"
      ),
      (route) => {
        return {
          id: route.id,
          name: route.name,
          speedLimits: route.speedLimits,
          geoJson: route.geoJson,
          distance: route.distance,
          duration: route.duration,
          color: route.color,
          speeds: [],
        };
      }
    );

    stopSignData.current = _stopSignData;
  }, [vehicleRoutes]);

  useEffect(() => {
    if (mapRef.current) return; // Initialize map only once
    mapboxgl.accessToken =
      process.env.MAPBOX_API_KEY ||
      "pk.eyJ1IjoibXlreXRhcyIsImEiOiJjbTA1MGhtb3YwY3Y0Mm5uY3FzYWExdm93In0.cSDrE0Lq4_PitPdGnEV_6w";

    if (mapRef.current) return; // initialize map only once

    mapRef.current = new mapboxgl.Map({
      container: mapContainer.current!,
      style: "mapbox://styles/mykytas/cm0o2duin00ga01pw7e6s5gj1", //'mapbox://styles/mapbox/standard-satellite',
      center: [lng, lat],
      zoom: 17, // Adjust zoom level
      interactive: true,
      pitch: 45,
      bearing: 50,
      antialias: true, // create the gl context with MSAA antialiasing, so custom layers are antialiased
      minZoom: 0,
    });

    mapRef.current.addControl(new mapboxgl.ScaleControl());
    mapRef.current.addControl(
      new mapboxgl.NavigationControl({ visualizePitch: true })
    );
    mapRef.current.addControl(new mapboxgl.FullscreenControl());

    // mapRef.current.on('style.load', () => {
    //     mapRef.current?.addSource('mapbox-terrain-rgb', {
    //         type: 'raster-dem',
    //         url: 'mapbox://mapbox.terrain-rgb',
    //         tileSize: 512,
    //         maxzoom: 15,
    //     });

    //     mapRef.current?.setTerrain({ source: 'mapbox-terrain-rgb', exaggeration: 1 });
    // });

    // mapRef.current.on('zoom', () => {

    // });

    mapRef.current.on("load", async () => {
      dispatch(getAllVehicleRoutes());
    });

    mapRef.current.on("click", handleMapClick);
    mapRef.current.doubleClickZoom.disable();
  }, []);

  useEffect(() => {
    stopSignData.current.map((item: any, key) => {
      const map = mapRef.current;
      if (!map && !mapRef.current?.isStyleLoaded()) return;

      // Convert LineString to Point assuming the first coordinate is the desired location
      const pointFeature = {
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: item.geoJson.geometry.coordinates[0],
        },
        properties: item.geoJson.properties,
      };

      // Check if the source does not exist before adding it
      if (!map.getSource(item.id) && mapRef.current?.isStyleLoaded()) {
        map.addSource(item.id, {
          type: "geojson",
          data: pointFeature,
        });
      }

      // Remove existing layer if it exists
      if (map.getLayer(item.id)) {
        map.removeLayer(item.id);
      }

      if (mapRef.current?.isStyleLoaded()) {
        // Add a new circle layer for STOP_SIGNS
        map.addLayer({
          id: item.id,
          type: "circle",
          source: item.id,
          paint: {
            "circle-radius": 10, // This sets the radius in pixels
            "circle-color": item.color,
            "circle-opacity": 1,
          },
        });
      }
    });
  }, [stopSignData, mapRef.current]);

  const handleMapClick = useCallback((e: mapboxgl.MapMouseEvent) => {}, []);
  const animationRef = useRef<{
    startTime: number | null;
    elapsedTime: number;
    animationFrameId: number | null;
  }>({ startTime: null, elapsedTime: 0, animationFrameId: null });
  const marker = useRef<mapboxgl.Marker | null>(null);
  const pausedTimeValue = useRef<number>(0);
  const xaxisValues = useRef<number[]>([]);
  const yaxisValues = useRef<number[]>([]);
  const currentTructDistance = useRef<number>(0);

  useEffect(() => {
    if (isPlaying && !animationRef.current.animationFrameId && selectedTrip) {
      if (totalTime == currentTimeValue.current) {
        handleTimeChange(0);
        animationRef.current.startTime = null;
        currentTimeValue.current = -1;
        animationRef.current.elapsedTime = 0;
      }
      let stopSignDuration = getStopSignsDuration(
        (selectedTrip.geoJson.geometry as LineString).coordinates
      );
      drawRoute(
        selectedTrip,
        selectedTrip.duration,
        selectedTrip.distance,
        true,
        stopSignDuration
      );
    }
  }, [isPlaying, selectedTrip, animationRef, totalTime]);

  const selectTrip = useCallback(
    (_route) => {
      if (_route) {
        setSelectedTrip(_route);
        setTimeValue(0);
        setIsPlaying(true);
        currentIsPlaying.current = true;
        // add stopSignDuration if the stop_sign exist in the current route
        let stopSignDuration = getStopSignsDuration(
          _route.geoJson.geometry.coordinates
        );
        setTotalTime(
          _route.duration && _route.duration != 0
            ? _route.duration + stopSignDuration
            : 3600
        );
        const [xaxis, yaxis] = extractDistanceAndElevationArrayWithTurf(
          _route.geoJson
        );
        const distanceData: any = _.map(xaxis, (distance, index) => distance);
        const elevationData: any = _.map(
          yaxis,
          (elevation, index) => elevation
        );
        defaultSeries[0].data = elevationData;
        yaxisValues.current = elevationData;
        xaxisValues.current = distanceData;
        setSeries(defaultSeries);

        if (defaultApexOptions.xaxis) {
          defaultApexOptions.xaxis.categories = distanceData;
          setApexOptions(defaultApexOptions);
        }
        animationRef.current.startTime = null;
        currentTimeValue.current = -1;
        animationRef.current.elapsedTime = 0;
        drawRoute(
          _route,
          _route.duration,
          _route.distance,
          true,
          stopSignDuration
        );
      }
    },
    [routeData, selectedTrip]
  );

  const getStopSignsDuration = useCallback(
    (coordinates) => {
      let duration = 0;
      _.map(coordinates, (coor) => {
        _.map(stopSignData.current, (_stopsign) => {
          if (
            (_stopsign.geoJson.geometry as LineString).coordinates &&
            (_stopsign.geoJson.geometry as LineString).coordinates[0]
          ) {
            if (
              (_stopsign.geoJson.geometry as LineString).coordinates[0][0] == coor[0] &&
              (_stopsign.geoJson.geometry as LineString).coordinates[0][1] == coor[1]
            ) {
              duration += _stopsign.duration;
            }
          }
        });
      });

      return duration;
    },
    [stopSignData]
  );

  const isStopSignPoint = useCallback(
    (coord) => {
      //check the point is STOP_SIGNS, if so return stopSignDuration
      _.map(stopSignData.current, (_stopsign) => {
        if (
          (_stopsign.geoJson.geometry as LineString).coordinates &&
          (_stopsign.geoJson.geometry as LineString).coordinates[0]
        ) {
          if (
            (_stopsign.geoJson.geometry as LineString).coordinates[0][0] == coord[0] &&
            (_stopsign.geoJson.geometry as LineString).coordinates[0][1] == coord[1]
          ) {
            return _stopsign.duration;
          }
        }
      });

      return 0;
    },
    [stopSignData]
  );

  const calculateCustomElevation = (lngLat: { lng: number; lat: number }) => {
    if (!mapRef.current) return;

    const point = [lngLat.lng, lngLat.lat];
    // Get candidate polygons in the vicinity
    const candidates = index.search({
      minX: lngLat.lng,
      minY: lngLat.lat,
      maxX: lngLat.lng,
      maxY: lngLat.lat,
    });
    let nearestFeature: any = null;
    let minDistance = Infinity;

    _.map(candidates, (item) => {
      const isInside = booleanPointInPolygon(point, item.feature.geometry);
      if (isInside) {
        nearestFeature = item.feature;
        return false; // Exit loop early if point is inside a polygon
      }
    });

    if (nearestFeature) {
      return (
        Math.round(parseFloat(nearestFeature.geometry.elevation) * 100) / 100
      ); // Adjust property name if different
    } else {
      return Math.round(
        (parseFloat(mapRef.current.queryTerrainElevation(point)) * 100) / 100
      );
    }
  };

  // Function to calculate cumulative distances using Turf.js
  const extractDistanceAndElevationArrayWithTurf = (geoJson: any) => {
    const coordinates = geoJson.geometry.coordinates;
    const distanceArray: number[] = [];
    const elevationArray: number[] = [];
    let totalDistance = 0;

    // Calculate the total length of the entire route
    const line = turf.lineString(coordinates);
    const totalLength = turf.length(line, { units: "meters" });
    let inverval: number = 1;
    if (totalLength < 200) inverval = 5;
    else if (totalLength < 300) inverval = 10;
    else if (totalLength < 500) inverval = 20;
    else if (totalLength < 1000) inverval = 30;
    else if (totalLength < 2000) inverval = 50;
    else inverval = 100;
    // Interpolate points every meter along the route
    for (let i = 0; i <= totalLength; i += inverval) {
      // Get a point at each meter along the route
      const pointAlongRoute = turf.along(line, i, { units: "meters" });
      const [lng, lat] = pointAlongRoute.geometry.coordinates;

      // Calculate and push distance (in meters)
      distanceArray.push(i);

      // Calculate elevation and push to elevationArray
      const elevation = calculateCustomElevation({ lng, lat });
      elevationArray.push(elevation ? elevation : 0);
    }

    // Ensure the last point (totalLength) is included
    if (distanceArray[distanceArray.length - 1] !== totalLength) {
      const lastPoint = turf.along(line, totalLength, { units: "meters" });
      const [lng, lat] = lastPoint.geometry.coordinates;

      distanceArray.push(Math.floor(totalLength));
      const lastElevation = calculateCustomElevation({ lng, lat });
      elevationArray.push(lastElevation ? lastElevation : 0);
    }

    return [distanceArray, elevationArray];
  };

  const drawRoute = useCallback(
    (
      saving_data: RouteDataType,
      totalTime,
      distance,
      animation: boolean = true,
      stopSignDuration: number = 0
    ) => {
      if (!mapRef.current) return saving_data;
      if (marker.current) marker.current.remove();

      const segments: any = [];
      const _coordinates = (saving_data.geoJson.geometry as LineString).coordinates;
      const pinRoute = _coordinates;

      if (!distance || distance == 0) {
        distance = Math.floor(
          turf.length(turf.lineString(pinRoute), { units: "meters" })
        );
      }
      if (!totalTime || totalTime == 0) {
        totalTime = Math.floor(distance / (saving_data.speedLimits / 3.6));
      }
      // Create segments for the route
      for (let i = 1; i < _coordinates.length; i++) {
        segments.push({
          coordinates: [_coordinates[i - 1], _coordinates[i]],
          color: saving_data.colors ? saving_data.colors[i] : "#00ff00", // Use segment-specific color or default
        });
      }

      const sourceId = "replay-source";
      const layerId = "replay-layer";
      const arrowLayerId = "replay-route-arrows";
      // Clean up previous sources and layers
      if (mapRef.current.getLayer(arrowLayerId)) {
        mapRef.current.removeLayer(arrowLayerId);
      }
      if (mapRef.current.getLayer(layerId)) {
        mapRef.current.removeLayer(layerId);
      }
      if (mapRef.current.getSource(sourceId)) {
        mapRef.current.removeSource(sourceId);
      }
      if (animationRef.current.animationFrameId) {
        cancelAnimationFrame(animationRef.current.animationFrameId);
        animationRef.current.animationFrameId = null;
      }

      // Add the new source and layer to the map
      if (mapRef.current.getSource(sourceId)) {
        const data: any = {
          type: "FeatureCollection",
          features: segments.map((segment: any) => ({
            type: "Feature",
            geometry: {
              type: "LineString",
              coordinates: segment.coordinates,
            },
            properties: {
              color: segment.color,
              "line-width": 4,
            },
          })),
        };
        (mapRef.current.getSource(sourceId) as mapboxgl.GeoJSONSource).setData(
          data
        );
      } else {
        mapRef.current.addSource(sourceId, {
          type: "geojson",
          data: {
            type: "FeatureCollection",
            features: segments.map((segment: any) => ({
              type: "Feature",
              geometry: {
                type: "LineString",
                coordinates: [],
              },
              properties: {
                color: segment.color,
                "line-width": 4,
              },
            })),
          },
        });

        mapRef.current.addLayer({
          id: layerId,
          type: "line",
          source: sourceId,
          layout: {
            "line-join": "round",
            "line-cap": "round",
          },
          paint: {
            "line-color": ["get", "color"],
            "line-width": 4,
          },
        });
      }

      if (!mapRef.current.getLayer(arrowLayerId)) {
        mapRef.current.addLayer({
          id: arrowLayerId,
          type: "symbol",
          source: sourceId,
          layout: {
            "symbol-placement": "line",
            "text-field": "▶▶",
            "text-size": 32,
            "symbol-spacing": 100,
            "text-keep-upright": false,
          },
          paint: {
            "text-color": "#ffffff",
          },
        });
      }

      // Mouse events for interaction
      mapRef.current.on("mouseenter", layerId, () => {
        mapRef.current.getCanvas().style.cursor = "pointer";
      });

      mapRef.current.on("mouseleave", layerId, () => {
        mapRef.current.getCanvas().style.cursor = "";
      });

      let popup;

      const bounds = new mapboxgl.LngLatBounds();
      (saving_data.geoJson.geometry as LineString).coordinates?.forEach((coord: any) =>
        bounds.extend(coord)
      );
      mapRef.current.fitBounds(bounds, { padding: 50 });
      popup = new mapboxgl.Popup({ closeButton: false });
      // const el = document.createElement('div');
      // el.className = 'animationmarker';

      const el = document.createElement("img");
      el.src = mapLocationImage;
      // el.style.width = '30px'
      // el.style.height = '30px'
      // el.style.borderRadius = '50%'

      marker.current = new mapboxgl.Marker({
        element: el,
        scale: 0.8,
        draggable: false,
        pitchAlignment: "auto",
        rotationAlignment: "auto",
      })
        .setLngLat(pinRoute[0])
        .setPopup(popup)
        .addTo(mapRef.current)
        .togglePopup();

      const total_distance = distance;
      const duration = totalTime * 1000;
      let prevXvalue: null | number = null,
        prevYvalue: null | number = null;
      const animateMarker = (timestamp: any) => {
        const currentPlaybackSpeed = currentSpeed.current;
        if (!animationRef.current.startTime) {
          animationRef.current.startTime = timestamp;
        }
        let elapsed;
        let deltaTime;

        deltaTime =
          (timestamp - animationRef.current.startTime!) * currentPlaybackSpeed;
        if (pausedTimeValue.current != 0) {
          elapsed = pausedTimeValue.current;
        } else {
          elapsed = animationRef.current.elapsedTime + deltaTime;
        }
        if (currentTimeValue.current >= 0) {
          // when the user changed the timeslider
          animationRef.current.elapsedTime = currentTimeValue.current * 1000;
          currentTimeValue.current = -1;
        }

        const progress = Math.min(elapsed / duration, 1);
        const distanceCovered = progress * total_distance;
        currentTructDistance.current = distanceCovered;

        // Calculate current segment and position
        let currentSegmentIndex = 0;
        let segmentDistance = 0;

        for (let i = 0; i < segments.length; i++) {
          const segmentLength = turf.length(
            turf.lineString(segments[i].coordinates),
            { units: "meters" }
          );
          if (segmentDistance + segmentLength >= distanceCovered) {
            currentSegmentIndex = i;
            break;
          }
          segmentDistance += segmentLength;
        }

        const segment = segments[currentSegmentIndex];
        const distanceInSegment = distanceCovered - segmentDistance;
        const pointAlongSegment = turf.along(
          turf.lineString(segment.coordinates),
          distanceInSegment,
          { units: "meters" }
        );
        const {
          coordinates: [lng, lat],
        } = pointAlongSegment.geometry;

        updateRoute(progress, total_distance, segments);
        const annotation = findNearestSmallerValue(
          xaxisValues.current,
          distanceCovered
        );
        if (annotation) {
          const newYValue = yaxisValues.current[annotation]; // Your updated y-axis value
          const newXValue = xaxisValues.current[annotation]; // Your updated x-axis value
          if (prevXvalue != newXValue || prevYvalue != newYValue) {
            setApexOptions((prevOptions) => {
              return {
                ...prevOptions,
                annotations: {
                  ...prevOptions.annotations,
                  yaxis: [
                    {
                      ...(prevOptions.annotations?.yaxis?.[0] || {}), // Preserve previous y-axis annotation properties
                      y: newYValue, // Update the y value
                      label: {
                        text: `Altitude: ${newYValue} m`, // Update the label text
                        // ...(prevOptions.annotations?.yaxis?.[0]?.label || {}), // Preserve previous label properties
                        style: {
                          color: "#fff",
                          background: "#FF4560",
                          fontSize: "12px",
                          fontWeight: 600,
                          padding: {
                            left: 10,
                            right: 10,
                            top: 5,
                            bottom: 5,
                          },
                        },
                      },
                    },
                  ],
                  xaxis: [
                    {
                      ...(prevOptions.annotations?.xaxis?.[0] || {}), // Preserve previous y-axis annotation properties
                      x: newXValue, // Update the x value
                      label: {
                        text: `Distance: ${newXValue} m`, // Update the label text
                        // ...(prevOptions.annotations?.xaxis?.[0]?.label || {}), // Preserve previous label properties
                        style: {
                          color: "#fff",
                          background: "#00E396",
                          fontSize: "12px",
                          fontWeight: 600,
                          padding: {
                            left: 10,
                            right: 10,
                            top: 5,
                            bottom: 5,
                          },
                        },
                      },
                    },
                  ],
                },
              };
            });
            prevXvalue = newXValue;
            prevYvalue = newYValue;
          }
        }
        const temp = calculateCustomElevation({ lng, lat });
        const elevation = Math.floor(temp || 0);
        marker.current?.setLngLat([lng, lat]);
        popup.setHTML(
          "Distance: " +
            Math.ceil(distanceCovered) +
            "m<br/>Altitude: " +
            elevation +
            "m" +
            "<br/>Speed: " +
            saving_data.speedLimits +
            "km/h<br/>Current Time: " +
            Math.ceil(animationRef.current.elapsedTime / 1000) +
            "s" +
            (stopSignDuration != 0
              ? "<br/>Stop Sign Duration: " + stopSignDuration + "s"
              : "")
        );

        if (progress < 1) {
          animationRef.current.elapsedTime += deltaTime;
          animationRef.current.startTime = timestamp;
          if (currentIsPlaying.current) {
            animationRef.current.animationFrameId =
              requestAnimationFrame(animateMarker);
            pausedTimeValue.current = 0;
          } else {
            animationRef.current.animationFrameId = null;
            pausedTimeValue.current = elapsed;
            animationRef.current.elapsedTime = elapsed;
          }

          if (animation) {
            const rotation = 150 - progress * 10.0;
            mapRef.current.setBearing(rotation % 360);
            mapRef.current.flyTo({
              center: [lng, lat],
              speed: 5,
              curve: 1,
              easing: (t) => t,
            });
          }
        } else {
          animationRef.current.animationFrameId &&
            cancelAnimationFrame(animationRef.current.animationFrameId);
          animationRef.current.elapsedTime = 0;
        }
      };

      animationRef.current.startTime = null;
      animationRef.current.animationFrameId =
        requestAnimationFrame(animateMarker);
    },
    [totalTime, speed, timeValue, isPlaying, apexOptions]
  );

  const updateRoute = (
    progress: number,
    totalDistance: number,
    segments: any[]
  ) => {
    const sourceId = "replay-source";
    const currentDistance = progress * totalDistance;
    let accumulatedDistance = 0;
    const updatedSegments: any = [];

    for (const segment of segments) {
      const segmentLength = turf.length(turf.lineString(segment.coordinates), {
        units: "meters",
      });

      if (accumulatedDistance + segmentLength < currentDistance) {
        updatedSegments.push(segment);
        accumulatedDistance += segmentLength;
      } else {
        const remainingDistance = currentDistance - accumulatedDistance;
        const updatedSegment = turf.lineSlice(
          turf.point(segment.coordinates[0]),
          turf.along(turf.lineString(segment.coordinates), remainingDistance, {
            units: "meters",
          }),
          turf.lineString(segment.coordinates)
        );

        updatedSegments.push({
          coordinates: updatedSegment.geometry.coordinates,
          color: segment.color,
        });
        break;
      }
    }

    const mapSource = mapRef.current.getSource(sourceId);
    if (mapSource && "setData" in mapSource) {
      const updatedGeoJSON: any = {
        type: "FeatureCollection",
        features: updatedSegments.map((segment: any) => ({
          type: "Feature",
          geometry: {
            type: "LineString",
            coordinates: segment.coordinates,
          },
          properties: {
            color: segment.color,
          },
        })),
      };

      (mapSource as mapboxgl.GeoJSONSource).setData(updatedGeoJSON);
    }
  };

  const [selectedEquipment, setSelectedEquipment] =
    useState<EquipmentLocation | null>(null);

  const rippleIcon = (eq) => {
    const rippleStyles = `
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            border-radius: 50%;
            width: 20px;
            height: 20px;
            background-color: ${eq.color};
            animation: ripple 1s infinite;`;

    const textStyle = `
            position: absolute;
            top: -65px;
            left: -50px;
            background: ${eq.color};
            border-radius: 20px;
            font-size: 20px;
            color: white;
            font-size: 1rem;
            font-weight: 600;
            padding: 6px 16px;
            width: 108px;
            text-align: center;`;

    const isNotActive: boolean = eq.status.toLowerCase() != "ACTIVE";
    const standardIconTemplate = `<div id="map-location" style="${textStyle}">
            <img width="28px" style="object-fit: contain" src="${getEquipmentStatusIcon(
              eq
            )}" alt="equipment-image" />
            ${eq.name}
            </div>
            <div id="imageContainer" style="position: absolute;bottom: 0px;transform: translateX(-40%); z-index:1;">
              <img src="${mapLocationImage}" alt="Description of the image">
            </div>`;

    const icon = document.createElement("div");
    icon.innerHTML = standardIconTemplate;

    // Add a click event listener to the dynamically created icon to dispaly card
    icon.addEventListener("click", () => {
      setSelectedEquipment(eq);
    });
    return icon;
  };

  const getEquipmentStatusIcon = (eq: EquipmentLocation) => {
    if (eq.vehicleType == "EXCAVATOR") {
      switch (eq.status) {
        case "ACTIVE":
          return excavatorImages.pc1250;
        case "STANDBY":
          return excavatorImages.pc1250;
        case "DOWN":
          return excavatorImages.pc1250;
        case "DELAY":
          return excavatorImages.pc1250;
      }
    } else if (eq.vehicleType == "DUMP_TRUCK") {
      switch (eq.status) {
        case "ACTIVE":
          return truckImages.hd785;
        case "STANDBY":
          return truckImages.hd785;
        case "DOWN":
          return truckImages.hd785;
        case "DELAY":
          return truckImages.hd785;
      }
    }
  };

  const getStateColor = (state) => {
    switch (state) {
      case "ACTIVE":
        return "#009D10";
      case "STANDBY":
        return "#F7B31A";
      case "DELAY":
        return "#9143DE";
      case "DOWN":
        return "#ED3A0F";
      default:
        return "#F7B31A";
    }
  };

  const clearMarkers = () => {
    markers.map((item) => {
      // mapRef.current?.removeLayer(item.marker)
      item.marker.remove();
    });
    setMarkers([]);
  };
  let animationRequestId: number;


  useEffect(() => {
    clearMarkers();
    const markersData: MarkerData[] = [];
    let filteredEquipment: EquipmentLocation[] = [];
    if (filter == "All Equipment") {
      filteredEquipment = equipments;
    } else {
      filteredEquipment = equipments.filter(
        (item) => item.vehicleType == filter
      );
    }

    if (
      mapStylesLoaded &&
      (filter == "DUMP_TRUCK" || filter == "All Equipment")
    ) {
      if (!mapRef.current?.getSource("line")) {
        mapRef.current?.addSource("line", {
          type: "geojson",
          data: travellingPaths,
        });
      }

      if (!mapRef.current?.getSource("loadedline")) {
        mapRef.current?.addSource("loadedline", {
          type: "geojson",
          data: dumpingPaths,
        });
      }

      if (!mapRef.current?.getLayer("line-dashed")) {
        mapRef.current?.addLayer({
          type: "line",
          source: "line",
          id: "line-dashed",
          paint: {
            "line-color": "yellow",
            "line-width": 4,
            "line-dasharray": [0, 4, 3],
          },
        });
      }

      if (!mapRef.current?.getLayer("loadedline")) {
        mapRef.current?.addLayer({
          type: "line",
          source: "loadedline",
          id: "loaded-line-dashed",
          paint: {
            "line-color": "yellow",
            "line-width": 4,
            "line-dasharray": [0, 4, 3],
          },
        });
      }

      const dashArraySequence = [
        [0, 4, 3],
        [0.5, 4, 2.5],
        [1, 4, 2],
        [1.5, 4, 1.5],
        [2, 4, 1],
        [2.5, 4, 0.5],
        [3, 4, 0],
        [0, 0.5, 3, 3.5],
        [0, 1, 3, 3],
        [0, 1.5, 3, 2.5],
        [0, 2, 3, 2],
        [0, 2.5, 3, 1.5],
        [0, 3, 3, 1],
        [0, 3.5, 3, 0.5],
      ];

      let step = 0;

      function animateDashArray(timestamp) {
        const newStep = Math.round((timestamp / 50) % dashArraySequence.length);
        if (newStep !== step && mapRef.current?.getLayer("line-dashed")) {
          mapRef.current?.setPaintProperty(
            "line-dashed",
            "line-dasharray",
            dashArraySequence[step]
          );
          step = newStep;
        } else if (
          newStep !== step &&
          mapRef.current?.getLayer("loaded-line-dashed")
        ) {
          mapRef.current?.setPaintProperty(
            "loaded-line-dashed",
            "line-dasharray",
            dashArraySequence[step]
          );
          step = newStep;
        } else {
        }

        return requestAnimationFrame(animateDashArray);
      }

      animationRequestId = animateDashArray(0);
    }

    filteredEquipment.map((eq) => {
      // const marker = new ExtendedMarker(eq.position as Leaflet.LatLngExpression, { icon: rippleIcon(eq) }).addTo(mapRef.current!)
      // const el = document.createElement('div');
      // el.className = 'activemarker';
      const el = rippleIcon(eq);
      const marker = new mapboxgl.Marker(el)
        .setLngLat(eq.position)
        .addTo(mapRef.current);
      markersData.push({ id: eq["name"], marker: marker });
      marker.getElement().addEventListener("click", () =>
        mapRef.current?.flyTo({
          center: eq.position,
          zoom: 20,
          speed: 1,
        })
      );
    });
    // markersLayer.
    setMarkers(markersData);
  }, [mapStylesLoaded, filter]);

  const drawFeature = (geoFenceData: any) => {
    if (!mapRef.current) return;

    let layer;
    const map = mapRef.current;
    const sourceId = `line-${geoFenceData.id}`;

    if (
      geoFenceData &&
      geoFenceData.geoJson &&
      geoFenceData.geoJson.properties &&
      geoFenceData.geoJson.properties.radius
    ) {
      layer = Leaflet.geoJson(geoFenceData.geoJson, {
        pointToLayer: function (feature, latlng) {
          return Leaflet.circle(latlng, {
            radius: geoFenceData.geoJson.properties.radius,
          });
        },
      }).addTo(map);
      layer.id = geoFenceData.id;
      drawItems.addLayer(layer);
    } else {
      layer = Leaflet.geoJson(geoFenceData.geoJson).addTo(map);
      if (layer) {
        // Set an ID for the layer associated with the geoFenceData
        layer.id = geoFenceData.id;
      }

      if (map.isStyleLoaded()) {
        // Dynamically generate a unique source ID
        if (map.getSource(sourceId)) {
          map.removeSource(sourceId);
        }

        map.addSource(sourceId, {
          type: "geojson",
          data: geoFenceData.geoJson,
        });

        const layerId = `fence-${geoFenceData.id}`;

        map.addLayer({
          id: layerId,
          type: "line",
          source: sourceId,
          paint: {
            "line-color": "yellow",
            "line-width": 4,
            "line-opacity": 0.4,
          },
        });
      }
      //layer.bindPopup("Name of the GeoFence");
      // drawItems.addLayer(layer);
    }
    geofences.push({
      id: layer.id,
      layer: layer,
      name: geoFenceData.name,
      bench: {
        value: geoFenceData.locationId,
        label:
          geoFenceData && geoFenceData.location
            ? geoFenceData.location.name
            : "",
      },
    });
    setGeofences([...geofences]);
  };

  function findNearestSmallerValue(array, target) {
    let nearest = null;
    let index = 0;
    for (let i = 0; i < array.length; i++) {
      if (
        array[i] <= target &&
        (nearest === null || target - array[i] < target - nearest)
      ) {
        nearest = array[i];
        index = i;
      }
    }

    return index;
  }

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid>
          <Breadcrumb title="Replay" breadcrumbItem="GPS Fleet Tracking" />
          <Row>
            <Col
              lg="12"
              style={{
                display: "flex",
                flexDirection: "row",
                justifyContent: "space-between",
                height: "calc(100vh - 200px);",
              }}
            >
              <div
                ref={mapContainer}
                className="map-container d-flex flex-column justify-content-between"
                style={{ height: "calc(100vh - 200px)", width: "80%" }}
              >
                <div
                  style={{
                    position: "absolute",
                    bottom: "60px",
                    left: "0px",
                    width: "97.5%",
                    opacity: ".9",
                    zIndex: 1,
                    marginLeft: "10px",
                  }}
                >
                  <Card>
                    {/* <Line data={data} options={options} /> */}
                    <ReactApexChart
                      options={apexOptions}
                      series={series}
                      type="area"
                      height={100}
                      width={"100%"}
                    />
                  </Card>
                </div>
                <TimeSlider
                  isPlaying={isPlaying}
                  speed={speed}
                  timeValue={timeValue}
                  totalTime={totalTime}
                  onTimeChange={handleTimeChange}
                  onSpeedChange={handleSpeedChange}
                  onPlayPauseToggle={togglePlay}
                  onNext={handleNext}
                  onPrev={handlePrev}
                />
              </div>
              <Card
                style={{
                  height: "calc(100vh - 200px)",
                  width: "20%",
                  marginLeft: "16px",
                  padding: "16px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    justifyContent: "space-between",
                    fontSize: "20px",
                  }}
                >
                  Routes
                </div>
                <div style={{ overflow: "auto" }}>
                  <Collapse
                    accordion
                    style={{ border: "none", borderRadius: "none" }}
                  >
                    {_.map(routeData, (dt, index) => (
                      <Panel header={dt.id} key={dt.id}>
                        <Menu
                          mode="inline"
                          selectable
                          style={{ color: "white" }}
                        >
                          {_.map(dt.routes, (route, index) => (
                            <Menu.Item
                              onClick={() => selectTrip(route)}
                              key={`${dt.id}-${index}`}
                              className={
                                "replay-menu-item " +
                                (selectedTrip?.id === route.id
                                  ? "selected"
                                  : "")
                              }
                            >
                              {route ? route.name : "Test"}
                            </Menu.Item>
                          ))}
                        </Menu>
                      </Panel>
                    ))}
                  </Collapse>
                </div>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>
    </React.Fragment>
  );
};

export default Replay2D;
