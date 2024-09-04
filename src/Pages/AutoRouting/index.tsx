import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Container, Row, Col, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import _ from 'lodash';

import * as turf from '@turf/turf';
import mapboxgl, { LngLatLike } from 'mapbox-gl'; // eslint-disable-line import/no-webpack-loader-syntax
import toastr from 'toastr';
import 'mapbox-gl/dist/mapbox-gl.css';
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css';
import { Button, Input, Tooltip } from 'antd';
import { getRoutes } from './RoutingService';
import BoundingBoxModal from './BoundingBoxModal';
import { RouteCoordinatesType, RouteDataType, WayPointType } from './type';

import { useDispatch, useSelector } from "react-redux";
import { createSelector } from "reselect";

const defaultSpeedLimit = 40;
const defaultColor = '#00ff00';
const AutoRouting = () => {

    document.title = "Auto Routing | FMS Live";

    const mapContainer = useRef(null);
    const mapRef = useRef<any>(null);
    const [lng, setLng] = useState(120.44463458272295,);
    const [lat, setLat] = useState(-29.146790943732764);
    const [drawing, setDrawing] = useState<boolean>(false);
    const [coordinates, setCoordinates] = useState<number[][]>([]);
    const [allCoordinates, setAllCoordinates] = useState<number[][][]>([]);
    const [startPoint, setStartPoint] = useState<[number, number] | null>(null);
    const [endPoint, setEndPoint] = useState<WayPointType | null>(null);
    const [wayPoints, setWayPoints] = useState<WayPointType[]>([]);
    const [pointType, setPointType] = useState<'start_point' | 'end_point' | 'way_point'>('way_point')
    const startMarker = useRef<mapboxgl.Marker | null>(null);
    const endMarker = useRef<mapboxgl.Marker | null>(null);
    const wayMarkers = useRef<mapboxgl.Marker[]>([]);
    const [color, setColor] = useState(defaultColor);
    const [routePoints, setRoutePoints] = useState<[number, number, number][]>([]);
    const routeMarkers = useRef<mapboxgl.Marker[]>([]);
    const [routeAllMarkers, setRouteAllMarkers] = useState<RouteCoordinatesType[]>([]);
    const currentRoute = useRef<number>(0);
    const [routeData, setRouteData] = useState<RouteDataType[] | null>(null);
    const [isModalVisible, setIsModalVisible] = useState<boolean>(false);

    const dispatch: any = useDispatch();

    const fetchGeoJSON = useCallback((geojsonData: turf.AllGeoJSON) => {
        if (!geojsonData) return;
        
        mapRef.current?.addSource('geojson-data', {
            type: 'geojson',
            data: geojsonData
        });

        mapRef.current?.addLayer({
            id: 'geojson-layer',
            type: 'fill-extrusion',
            source: 'geojson-data',
            paint: {
                'fill-extrusion-color': ['get', 'color'],
                // 'fill-extrusion-height': ['get', 'height'],
                'fill-extrusion-base': 0, // Optional: Set base height
                'fill-extrusion-opacity': .5
            }
        });
        mapRef.current?.addLayer({
            id: 'geojson-line-layer',
            type: 'line',
            source: 'geojson-data',
            paint: {
                'line-color': ['get', 'color'],
                'line-width': 2,
            }
        });
    }, [])

    useEffect(() => {
        if (mapRef.current) return; // Initialize map only once
        mapboxgl.accessToken = process.env.MAPBOX_API_KEY || 'pk.eyJ1IjoiaG1lc3VwcG9ydCIsImEiOiJjbHp1eTRibDAwMG05MmpvczE1ZHdham5qIn0.ZoE3pSipzwdf-0TkY3ezzw';

        if (mapRef.current) return; // initialize map only once

        mapRef.current = new mapboxgl.Map({
            container: mapContainer.current!,
            style: 'mapbox://styles/mapbox/standard-satellite',
            center: [lng, lat],
            zoom: 15, // Adjust zoom level
            interactive: true,
            pitch: 45,
            bearing:150,
            antialias: true, // create the gl context with MSAA antialiasing, so custom layers are antialiased
            minZoom: 0,

        });

        // parameters to ensure the model is georeferenced correctly on the map
        const modelOrigin: LngLatLike = [lng, lat];
        const modelAltitude = 0;
        const modelRotate = [Math.PI / 2, 0, 0];

        const modelAsMercatorCoordinate = mapboxgl.MercatorCoordinate.fromLngLat(
            modelOrigin,
            modelAltitude
        );


        mapRef.current.addControl(new mapboxgl.ScaleControl());
        mapRef.current.addControl(new mapboxgl.NavigationControl({ visualizePitch: true }));
        mapRef.current.addControl(new mapboxgl.FullscreenControl());

        // const drawControl = new MapboxDraw({ defaultMode: 'draw_polygon' })
        // mapRef.current.addControl(drawControl);
        // mapRef.current.on('draw.create', updateArea);
        // function updateArea(e) {
        //     console.log(e)
        // }

        mapRef.current.on('style.load', () => {
            
        });

        mapRef.current.on('zoom', () => {

        });

        mapRef.current.on('load', () => {
            // fetch('./240817_Pits_3D_WGS84.geojson')
            //     .then(response => response.json())
            //     .then((geojsonData: turf.AllGeoJSON) => {
            //         fetchGeoJSON(geojsonData)
            //     })
            //     .catch(error => console.error('Error loading GeoJSON data:', error));
        });
        
        mapRef.current.on('click', handleMapClick);
        mapRef.current.doubleClickZoom.disable();

        return () => {
            if (mapRef.current) {
                mapRef.current.off('click', handleMapClick);
            }
        };
    }, []);

    const isNearPreviousPoint = (coords: [number, number], prevCoords: [number, number] | null, threshold: number) => {
        if (!prevCoords) return false;
        const distance = Math.sqrt(Math.pow(prevCoords[0] - coords[0], 2) + Math.pow(prevCoords[1] - coords[1], 2));
        return distance < threshold;
    };
    const isNearExistingPoint = useCallback((coords: [number, number], threshold: number) => {
        let new_coord: [number, number] | null = null;
        let flag = false
        routeAllMarkers.map(_route => {
            _route.coordinates.map(_coord => {
                const distance = Math.sqrt(Math.pow(_coord[0] - coords[0], 2) + Math.pow(_coord[1] - coords[1], 2));
                if (distance < threshold) {
                    new_coord = _coord as [number, number];
                    flag = true
                }
            })
        })

        if (!flag) {
            coordinates.map(coordinate => {
                const distance = Math.sqrt(Math.pow(coordinate[0] - coords[0], 2) + Math.pow(coordinate[1] - coords[1], 2));
                if (distance < threshold) {
                    new_coord = coordinate as [number, number];
                }
            })
        }
        return new_coord;
    }, [routeAllMarkers, coordinates]);

    const handleMapClick = useCallback((e: mapboxgl.MapMouseEvent) => {
        const lngLat: [number, number] = [e.lngLat.lng, e.lngLat.lat];

        if (drawing) {
            let newCoords = lngLat;

            const proximityThreshold1 = 0.00008; // Adjust this value as per your proximity requirement
            const proximityThreshold2 = 0.00004;

            const prevPoint = coordinates.length > 0 ? coordinates[coordinates.length - 1] : null;

            if (isNearPreviousPoint(newCoords as [number, number], prevPoint as [number, number], proximityThreshold2)) {
                toastr.warning('Point is too close to the previous point.');
                return;
            }

            // if it's the first point, choose the existing point near by newCoords
            let _newCoords = isNearExistingPoint(newCoords as [number, number], proximityThreshold2);
            if (!!_newCoords) {
                newCoords[0] = _newCoords[0]
                newCoords[1] = _newCoords[1]
            }

            setCoordinates((prevCoords) => {
                const updatedCoordinates = [...prevCoords, newCoords];
                const routeData: any = {
                    type: "Feature",
                    properties: {},
                    geometry: {
                        type: "LineString",
                        coordinates: updatedCoordinates
                    }
                };
                if (mapRef.current) {
                    let _routePointMarker
                    if (routeMarkers.current.length > 0) {
                        const markerElement = document.createElement('div');
                        markerElement.style.backgroundColor = 'yellow';
                        markerElement.style.width = '8px';
                        markerElement.style.height = '8px';
                        markerElement.style.borderRadius = '50%';
                        markerElement.style.cursor = 'pointer';
                        _routePointMarker = new mapboxgl.Marker(markerElement)
                            .setLngLat(newCoords as [number, number])
                            .addTo(mapRef.current);
                    }
                    else{
                        _routePointMarker = new mapboxgl.Marker({color: 'yellow', scale: 0.8})
                            .setLngLat(newCoords as [number, number])
                            .addTo(mapRef.current);
                    }
                    setRoutePoints([...routePoints, [...(newCoords as [number, number]), defaultSpeedLimit]]);
                    routeMarkers.current.push(_routePointMarker)
                    if (routeMarkers.current.length > 2) {
                        // routeMarkers.current[routeMarkers.current.length - 2].remove();
                    }
                }
                if (mapRef.current?.getSource('polygon')) {
                    (mapRef.current.getSource('polygon') as mapboxgl.GeoJSONSource).setData(routeData);
                    if (!mapRef.current?.getLayer('polygon-layer')) {
                        mapRef.current?.addLayer({
                            id: 'polygon-layer',
                            type: 'line',
                            source: 'polygon',
                            layout: {
                                'line-join': 'round',
                                'line-cap': 'round'
                            },
                            paint: {
                                'line-color': defaultColor,
                                'line-width': 4
                            }
                        });

                        mapRef.current.addLayer({
                            id: 'route-arrows',
                            type: 'symbol',
                            source: 'polygon',
                            layout: {
                                'symbol-placement': 'line',
                                'text-field': '▶▶',
                                'text-size': 32,
                                'symbol-spacing': 100, // Adjust spacing as needed
                                'text-keep-upright': false, // Allows arrows to be oriented along the line
                            },
                            paint: {
                                'text-color': '#ffffff',
                            },
                        });
                    }
                } else {
                    mapRef.current?.addSource('polygon', {
                        type: 'geojson',
                        data: routeData
                    });

                    mapRef.current?.addLayer({
                        id: 'polygon-layer',
                        type: 'line',
                        source: 'polygon',
                        layout: {
                            'line-join': 'round',
                            'line-cap': 'round'
                        },
                        paint: {
                            'line-color': defaultColor,
                            'line-width': 4
                        }
                    });

                    mapRef.current.addLayer({
                        id: 'route-arrows',
                        type: 'symbol',
                        source: 'polygon',
                        layout: {
                            'symbol-placement': 'line',
                            'text-field': '▶▶', // ▶
                            'text-size': 32,
                            'symbol-spacing': 100, // Adjust spacing as needed
                            'text-keep-upright': false, // Allows arrows to be oriented along the line
                        },
                        paint: {
                            'text-color': '#ffffff',
                        },
                    });
                }

                return updatedCoordinates;
            });
        }
        else{
            switch(pointType) {
                case 'start_point':
                    addMarker(lngLat, 'start')
                    setStartPoint(lngLat);
                    setPointType('way_point')
                    break;
                case 'end_point':
                    addMarker(lngLat, 'end')
                    setEndPoint({coordinates: lngLat, speedlimit: defaultSpeedLimit, color: color});
                    setPointType('way_point')
                    break;
                default:
                    break;
            }
        }
    }, [drawing, coordinates, routePoints, routeData, pointType, startPoint, endPoint, setPointType]);

    const addMarker = useCallback((lngLat: [number, number], type: 'start' | 'end' | 'way', way?: any) => {
        if (mapRef.current) {
            const _color = type == 'start' ? 'green' : type == 'end' ? 'red' : 'gold'
            const _scale = type == 'way' ? 0.6 : 1

            let _wayPointMarker, _startPointMarker, _endPointMarker
            switch(type) {
                case 'start':
                    startMarker.current?.remove()
                    _startPointMarker = new mapboxgl.Marker({color: _color, scale: _scale})
                        .setLngLat(lngLat)
                        .addTo(mapRef.current);
                    startMarker.current = _startPointMarker
                    break;
                case 'end':
                    endMarker.current?.remove()
                    _endPointMarker = new mapboxgl.Marker({color: _color, scale: _scale})
                        .setLngLat(lngLat)
                        .addTo(mapRef.current);
                    endMarker.current = _endPointMarker
                    break;
                case 'way':
                    if (!startMarker.current || !endMarker.current) break;
                    const markerElement = document.createElement('div');
                    markerElement.style.backgroundColor = _color;
                    markerElement.style.width = '20px';
                    markerElement.style.height = '20px';
                    markerElement.style.borderRadius = '50%';
                    markerElement.style.cursor = 'pointer';

                    _wayPointMarker = new mapboxgl.Marker(markerElement)
                        .setLngLat(lngLat)
                        .addTo(mapRef.current);
                    wayMarkers.current.push(_wayPointMarker);
                    // Add click event listener to the marker
                    // markerElement.addEventListener('click', (e) => {e.preventDefault(); handleMarkerClick(way)});
                    _wayPointMarker = new mapboxgl.Marker({color: _color, scale: _scale})
                        .setLngLat(lngLat)
                        .addTo(mapRef.current);
                    wayMarkers.current.push(_wayPointMarker);
                    break;
                default:
                    break;
            }

        }
    }, [startPoint, endPoint, wayPoints, pointType, drawing]);

    const handleUndo = useCallback(() => {
        setCoordinates((prevCoords) => {
            if (prevCoords.length === 0) {
                const lastMarker = routeMarkers.current.pop();
                lastMarker?.remove();
                return prevCoords;
            }
        
            const updatedCoordinates = prevCoords.slice(0, -1);
        
            const routeData: any = {
                type: 'Feature',
                properties: {},
                geometry: {
                    type: 'LineString',
                    coordinates: updatedCoordinates,
                },
            };
        
            if (mapRef.current) {
                // Remove the last route marker
                const lastMarker = routeMarkers.current.pop();
                lastMarker?.remove();
            }
        
            if (mapRef.current?.getSource('polygon')) {
                (mapRef.current.getSource('polygon') as mapboxgl.GeoJSONSource).setData(routeData);
                if (!mapRef.current?.getLayer('polygon-layer')) {
                    mapRef.current?.addLayer({
                        id: 'polygon-layer',
                        type: 'line',
                        source: 'polygon',
                        layout: {
                            'line-join': 'round',
                            'line-cap': 'round'
                        },
                        paint: {
                            'line-color': defaultColor,
                            'line-width': 5
                        }
                    });
                }
            } 
            else {
                mapRef.current?.addSource('polygon', {
                    type: 'geojson',
                    data: routeData,
                });
        
                mapRef.current?.addLayer({
                    id: 'polygon-layer',
                    type: 'line',
                    source: 'polygon',
                    layout: {
                        'line-join': 'round',
                        'line-cap': 'round',
                    },
                    paint: {
                        'line-color': '#f00',
                        'line-width': 4,
                    },
                });
            }
        
            return updatedCoordinates;
          });
        
          setRoutePoints((prevPoints) => prevPoints.slice(0, -1)); 
    }, [coordinates]);

    const clearRoute = useCallback(() => {
        routeMarkers.current.map(_marker => {
            _marker.remove();
        })
        if (mapRef.current && mapRef.current.getLayer('polygon-layer')) {
            mapRef.current.removeLayer('polygon-layer');
        }
        routeMarkers.current = [];
        setRoutePoints([])
        setCoordinates([])
        currentRoute.current ++
    }, [])

    const saveRoute = useCallback(() => {
        if (!mapRef.current) return;

        if (coordinates.length > 1) {
            const updatedRoutePointMarker = new mapboxgl.Marker({ color: 'red', scale: 0.8 })
                .setLngLat(coordinates[coordinates.length - 1] as [number, number])
                .addTo(mapRef.current);
            routeMarkers.current[routeMarkers.current.length - 1].remove();
            routeMarkers.current[routeMarkers.current.length - 1] = updatedRoutePointMarker;

            let saving_data: RouteDataType = {
                route_id: Date.now().toString(),
                geometry: {
                    type: 'LineString',
                    coordinates: coordinates as [number, number][],
                },
                distance: 0,
                duration: 0,
                created_at: Date.now().toString(),
                speed_limits: defaultSpeedLimit,
                color: color,
                name: 'New Route'
            };
            saving_data = drawRoute(saving_data);

            routeMarkers.current.map(_marker => {
                _marker.remove();
            })
            routeMarkers.current = [];
            const newRouteMarker = {
                coordinates: coordinates as [number, number][],
                speedlimit: saving_data.speed_limits,
                color: saving_data.color,
                markers: routeMarkers.current,
                routeNumber: saving_data.route_id
            }
            setCoordinates([]);
            routeData && saving_data ? setRouteData([...routeData, saving_data]) : setRouteData([saving_data])
            setRouteAllMarkers([...routeAllMarkers, newRouteMarker]);
            setAllCoordinates([...allCoordinates, coordinates]);
            setDrawing(false);
            
            return saving_data;
        }
    }, [coordinates, allCoordinates, routeAllMarkers])

    const removeRoute = useCallback((route: RouteDataType) => {
        if (routeData !== null && route !== null && routeAllMarkers !== null) {
            const updatedRouteData = routeData.filter(_route => route.route_id !== _route.route_id);
            setRouteData(updatedRouteData);

            const updatedRouteAllMarkers = routeAllMarkers.filter(_marker => _marker.routeNumber !== route.route_id)
            setRouteAllMarkers(updatedRouteAllMarkers)
        }
        const sourceId = route.route_id + '-source';
        const layerId = route.route_id + '-layer';
        const arrowLayerId = route.route_id + '-route-arrows';
        const mapSource = mapRef.current?.getSource(sourceId);
        (mapSource as mapboxgl.GeoJSONSource).setData('');
        if (mapRef.current?.getLayer(layerId)){
            mapRef.current?.removeLayer(layerId);
        }
        if (mapRef.current?.getLayer(arrowLayerId)){
            mapRef.current?.removeLayer(arrowLayerId);
        }
        if (mapRef.current?.getSource(sourceId)) {
            mapRef.current?.removeSource(sourceId);
        }
        if (mapRef.current && mapRef.current.getLayer('polygon-layer')) {
            mapRef.current.removeLayer('polygon-layer');
        }
        if (mapRef.current && mapRef.current.getLayer('route-arrows')) {
            mapRef.current.removeLayer('route-arrows');
        }
    }, [routeData, routeAllMarkers, mapRef])

    const drawRoute = useCallback((saving_data: RouteDataType, routeWidth: number = 4, _color: string = color, animation: boolean = false): RouteDataType => {
        if (!mapRef.current) return saving_data;

        if (mapRef.current && mapRef.current.getLayer('polygon-layer')) {
            mapRef.current.removeLayer('polygon-layer');
        }
        if (mapRef.current && mapRef.current.getLayer('route-arrows')) {
            mapRef.current.removeLayer('route-arrows');
        }

        const segments: any = [];

        // Assuming `saving_data.geometry.coordinates` is an array of coordinates along the route
        const _coordinates = saving_data.geometry.coordinates as [number, number][];
        const pinRoute = _coordinates;
        
        // Loop through the coordinates and create segments
        for (let i = 1; i < _coordinates.length; i++) {
            segments.push({
                coordinates: [_coordinates[i - 1], _coordinates[i]],
                color: saving_data.colors ? saving_data.colors[i] : color // Use segment-specific color or fallback to default color
            });
        }
        
        if (mapRef.current?.getLayer('line-layer')){
            mapRef.current?.removeLayer('line-layer');
        }
        if (mapRef.current?.getSource('line-source')) {
            mapRef.current?.removeSource("line-source");
        }

        const sourceId = saving_data.route_id + '-source';
        const layerId = saving_data.route_id + '-layer';
        const arrowLayerId = saving_data.route_id + '-route-arrows';

        if (mapRef.current.getSource(sourceId)) {
            // Update the data for the existing source
            const data: any = {
                type: 'FeatureCollection',
                features: segments.map((segment: any) => ({
                    type: 'Feature',
                    geometry: {
                        type: 'LineString',
                        coordinates: segment.coordinates
                    },
                    properties: {
                        color: segment.color,
                        'line-width': routeWidth,
                    }
                }))
            };

            (mapRef.current.getSource(sourceId) as mapboxgl.GeoJSONSource).setData(data);
        } else {
            // Add a new source and layer if they don't exist
            mapRef.current.addSource(sourceId, {
                type: 'geojson',
                data: {
                    type: 'FeatureCollection',
                    features: segments.map((segment: any) => ({
                        type: 'Feature',
                        geometry: {
                            type: 'LineString',
                            coordinates: []
                        },
                        properties: {
                            color: segment.color,
                            'line-width': routeWidth
                        }
                    }))
                }
            });
            const layerConfig: any = {
                'line-color': ['get', 'color'],
                'line-width': routeWidth,
              };
              mapRef.current.addLayer({
                id: layerId,
                type: 'line',
                source: sourceId,
                'filter': ['==', '$type', 'LineString'],
                'layout': {
                    'line-join': 'round',
                    'line-cap': 'round'
                },
                paint: layerConfig
            });
        }
        mapRef.current.addLayer({
            id: arrowLayerId,
            type: 'symbol',
            source: sourceId,
            layout: {
                'symbol-placement': 'line',
                'text-field': '▶▶',
                'text-size': 32,
                'symbol-spacing': 100, // Adjust spacing as needed
                'text-keep-upright': false, // Allows arrows to be oriented along the line
            },
            paint: {
                'text-color': '#ffffff',
            },
        });
        mapRef.current.on('dblclick', layerId, (e) => {
            e.preventDefault();
            if (e.features.length > 0) {
                const coordinates = e.features[0].geometry.coordinates;
                setEditingRouteId(saving_data.route_id);
                setNewTitle(saving_data.name ? saving_data.name : '');
                setSpeedLimit(saving_data.speed_limits);
                setNewColor(saving_data.color)
                setIsModalOpen(true);
            }
        });
        mapRef.current.on('mouseenter', layerId, () => {
            mapRef.current.getCanvas().style.cursor = 'pointer';
        });

        // Change it back when not over the lines
        mapRef.current.on('mouseleave', layerId, () => {
            mapRef.current.getCanvas().style.cursor = '';
        });
        // Adjust map view to fit the route
        
        let popup;
        let marker;
        if (animation) {
            const bounds = new mapboxgl.LngLatBounds();
            saving_data.geometry.coordinates?.forEach((coord: any) => bounds.extend(coord));
            mapRef.current?.fitBounds(bounds, { padding: 50 });
            popup = new mapboxgl.Popup({ closeButton: false });
            const el = document.createElement('div');
            el.className = 'animationmarker';

            marker = new mapboxgl.Marker({
                    element: el,
                    scale: 0.8,
                    draggable: false,
                    pitchAlignment: 'auto',
                    rotationAlignment: 'auto'
                })
                .setLngLat(pinRoute[0] as [number, number])
                .setPopup(popup)
                .addTo(mapRef.current)
                .togglePopup();
        }

            
        let startTime: any;
        // get total distance of the route
        const total_distance = Math.floor(turf.length(turf.lineString(pinRoute), {units: 'meters'}))
        saving_data.distance = total_distance;

        // get total duration of the travel
        if (wayPoints.length == 0) {
            saving_data.duration = Math.floor(total_distance / (saving_data.speed_limits / 3.6));
        }
        else{
            saving_data.duration = calculateTotalDuration(pinRoute as [number, number][], wayPoints, saving_data.speed_limits);
        }
        const diff = animation ? 50 : total_distance;
        const duration = Math.ceil(total_distance / diff) * 1000; // animation duration in ms with total distance
        const animateMarker = (timestamp: any) => {
            // Remove destination marker
            endMarker.current?.remove();
            
            if (!startTime) startTime = timestamp;
            const elapsed = timestamp - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const distanceCovered = progress * total_distance;
        
            // Determine the current segment and the position along that segment
            let currentSegmentIndex = 0;
            let segmentDistance = 0;
        
            for (let i = 0; i < segments.length; i++) {
                const segmentLength = turf.length(turf.lineString(segments[i].coordinates), { units: 'meters' });
                if (segmentDistance + segmentLength >= distanceCovered) {
                    currentSegmentIndex = i;
                    break;
                }
                segmentDistance += segmentLength;
            }
        
            const segment = segments[currentSegmentIndex];
            const distanceInSegment = distanceCovered - segmentDistance;
            const pointAlongSegment = turf.along(turf.lineString(segment.coordinates), distanceInSegment, { units: 'meters' });
            const { coordinates: [lng, lat] } = pointAlongSegment.geometry;
        
            
            updateRoute(progress, total_distance, segments);
            
            if (animation) {
                marker.setLngLat([lng, lat]);
                popup.setHTML('Distance: ' + Math.ceil(distanceCovered) + 'm<br/>');
            }
        
            if (progress < 1) {
                requestAnimationFrame(animateMarker);
        
                // Rotate the camera at a slightly lower speed to give some parallax effect in the background
                if (animation) {
                    const rotation = 150 - progress * 40.0;
                    mapRef.current?.setBearing(rotation % 360);
                    mapRef.current?.flyTo({
                        center: [lng, lat],
                        speed: 0.25, // Adjust speed for smoothness
                        curve: 1,  // Higher curve value for more easing
                        easing: t => t // Custom easing function if needed
                    });
                }
            } else {
                animation && marker.remove()
                endPoint?.coordinates && addMarker(endPoint?.coordinates, 'end')
            }
        };
        
        const updateRoute = (_progress: number, _totalDistance: number, segments: any[]) => {
            const currentDistance = _progress * _totalDistance;
            let accumulatedDistance = 0;
            const updatedSegments: any = [];
        
            for (const segment of segments) {
                const segmentLength = turf.length(turf.lineString(segment.coordinates), { units: 'meters' });
        
                if (accumulatedDistance + segmentLength < currentDistance) {
                    updatedSegments.push(segment);  // Entire segment is covered
                    accumulatedDistance += segmentLength;
                } else {
                    const remainingDistance = currentDistance - accumulatedDistance;
                    const updatedSegment = turf.lineSlice(
                        turf.point(segment.coordinates[0]),
                        turf.along(turf.lineString(segment.coordinates), remainingDistance, { units: 'meters' }),
                        turf.lineString(segment.coordinates)
                    );
        
                    updatedSegments.push({
                        coordinates: updatedSegment.geometry.coordinates,
                        color: segment.color
                    });
                    break;  // Stop once the current distance is covered
                }
            }
        
            const mapSource = mapRef.current?.getSource(saving_data.route_id + '-source');
            
            if (mapSource && 'setData' in mapSource) {
                const updatedGeoJSON: any = {
                    type: 'FeatureCollection',
                    features: updatedSegments.map((segment: any) => ({
                        type: 'Feature',
                        geometry: {
                            type: 'LineString',
                            coordinates: segment.coordinates
                        },
                        properties: {
                            color: segment.color,
                            'line-width': {
                                'base': 1.5,
                                'stops': [[1, 0.5], [8, 3], [15, 6], [22, 8]]
                            }
                        }
                    }))
                };
        
                (mapSource as mapboxgl.GeoJSONSource).setData(updatedGeoJSON);
            }
        };
        
        requestAnimationFrame(animateMarker);

        return saving_data;
    }, [startPoint, endPoint, wayPoints, color, setStartPoint, setEndPoint, setWayPoints]);

    useEffect(() => {
        if (mapRef.current) {
            mapRef.current.on('click', handleMapClick);
        }
        
        return () => {
            if (mapRef.current) {
                mapRef.current.off('click', handleMapClick);
            }
        };
    }, [mapRef.current, handleMapClick]);

    useEffect(() => {
        if (drawing) {
            setStartPoint(null)
            setEndPoint(null)
            setPointType('way_point')
            startMarker.current?.remove()
            endMarker.current?.remove()
        }
    }, [drawing])

    const calculateTotalDuration = (
        routeCoordinates: [number, number][], 
        wayPoints: WayPointType[],
        finalSegmentSpeedLimit: number // Speed limit for the final segment
        ): number => {
        let totalDuration = 0;
        // Function to find the index of a coordinate in the routeCoordinates array
        const findCoordIndex = (coord: [number, number]) => {
            let closestIndex = 0;
            let closestDistance = Infinity;
    
            routeCoordinates.forEach((routeCoord, index) => {
                const distance = turf.distance(turf.point(coord), turf.point(routeCoord), { units: 'meters' });
                if (distance < closestDistance) {
                    closestDistance = distance;
                    closestIndex = index;
                }
            });
    
            return closestIndex;
        };
        // Calculate duration for each segment up to the last waypoint
        for (let i = 0; i < wayPoints.length; i++) {
            const startCoord = i === 0 ? routeCoordinates[0] : wayPoints[i - 1].coordinates;
            const endCoord = wayPoints[i].coordinates;
            const startIndex = findCoordIndex(startCoord);
            const endIndex = findCoordIndex(endCoord);
    
            // Get the full range of coordinates for the segment
            const segmentCoordinates = routeCoordinates.slice(startIndex, endIndex + 1);
            const segmentDistance = Math.floor(turf.length(turf.lineString(segmentCoordinates), {units: 'meters'}))
            const speedLimit = finalSegmentSpeedLimit;
        
            // Duration in seconds for this segment
            const segmentDuration = segmentDistance / (speedLimit / 3.6); // Convert km/h to m/s
            totalDuration += segmentDuration;
        }
      
        // Calculate duration for the final segment from the last waypoint to the destination
        const lastWayPointCoord = wayPoints[wayPoints.length - 1].coordinates;
        const routeEndCoord = routeCoordinates[routeCoordinates.length - 1];
        const startIndex = findCoordIndex(lastWayPointCoord);
        const endIndex = findCoordIndex(routeEndCoord);
        // const lastSegmentDistance = calculateDistance(lastWayPointCoord, routeEndCoord);
        const segmentCoordinates = routeCoordinates.slice(startIndex, endIndex + 1);
        const lastSegmentDistance = Math.floor(turf.length(turf.lineString(segmentCoordinates), {units: 'meters'}))
        // Use the provided speed limit for the last segment
        const lastSegmentDuration = lastSegmentDistance / (finalSegmentSpeedLimit / 3.6);
        totalDuration += lastSegmentDuration;
      
        return Math.floor(totalDuration); // Total duration in seconds
    }

    const [editingRouteId, setEditingRouteId] = useState<string | null>(null);
    const [newTitle, setNewTitle] = useState<string>("");
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [newColor, setNewColor] = useState<string>("#00ff00");
    const [speedLimit, setSpeedLimit] = useState<number>(defaultSpeedLimit);
    const [showRoads, setShowRoads] = useState<boolean>(true);

    const content: any = {
        top: '50%',
        left: '50%',
        right: 'auto',
        bottom: 'auto',
        marginRight: '-50%',
        transform: 'translate(-50%, -50%)'
    };
    const handleTitleClick = useCallback((route: RouteDataType) => {
        setEditingRouteId(route.route_id);
        setNewTitle(route.name ? route.name : '');
        setSpeedLimit(route.speed_limits);
        setNewColor(route.color)
        setIsModalOpen(true);
    }, [newColor, editingRouteId, speedLimit, newTitle]);
    const handleCancel = () => {
        setEditingRouteId(null);
        setIsModalOpen(false);
    };
    const handleInputChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        setNewTitle(event.target.value);
    }, [newTitle]);

    const handleSpeedLimitChange = useCallback((event: any) => {
        setSpeedLimit(parseFloat(event.target.value))
    }, [speedLimit])

    const handleSave = useCallback(() => {
        if (editingRouteId !== null && routeData) {
            setRouteData(routeData.map(route =>
                route.route_id === editingRouteId ? { ...route, name: newTitle, speed_limits: speedLimit, color: newColor } : route
            ));
            setEditingRouteId(null);
            setIsModalOpen(false);

            const saving_data = routeData?.find(_route => editingRouteId === _route.route_id)
            if (!saving_data) return;
            const sourceId = saving_data.route_id + '-source';
            if (mapRef.current.getSource(sourceId)) {
                // Update the data for the existing source
                const data: any = {
                    type: 'FeatureCollection',
                    features: saving_data.geometry.coordinates?.map((segment: any) => ({
                        type: 'Feature',
                        geometry: {
                            type: 'LineString',
                            coordinates: saving_data.geometry.coordinates
                        },
                        properties: {
                            color: newColor,
                            'line-width': 5
                        }
                    }))
                };

                (mapRef.current.getSource(sourceId) as mapboxgl.GeoJSONSource).setData(data);
            }
        }
    }, [editingRouteId, routeData, newTitle, speedLimit, newColor]);

    const handleColorChange = useCallback((e) => {
        setNewColor(e.target.value);
    }, [newColor]);


    const saveRoads = useCallback(() => {
        if (!routeData || routeData.length === 0) return;
    }, [routeData])

    const calculateShortestRoute = useCallback(() => {
        if (!routeData || !startPoint || !endPoint) return;
        const response = getRoutes(routeData, startPoint, endPoint.coordinates)
        if (!response) return;
        // console.log(routeData)
        if (!response.route || response.route.length == 0) return;
        const points: [number, number][] = [];
        const colors: (string | null)[] = [];
        response.route.map(item => {
            points.push(item.point);
            colors.push(item.color);
        });

        let saving_data: RouteDataType = {
            route_id: Date.now().toString(),
            geometry: {
                type: 'LineString',
                coordinates: points,
            },
            distance: 0,
            duration: 0,
            created_at: Date.now().toString(),
            speed_limits: 0,
            colors: colors,
            color: ''
        };
        drawRoute(saving_data, 8, '', true);

    }, [routeData, startPoint, endPoint]);

    const showModal = () => {
        setIsModalVisible(true);
    };

    const handleOk = (_minLng, _minLat, _maxLng, _maxLat) => {
        // Convert the center coordinates from UTM to WGS84
        if (mapRef.current && _minLng && _minLat && _maxLng && _maxLat) {
            const bounds: [[number, number], [number, number]] = [
                [parseFloat(_minLng), parseFloat(_minLat)],
                [parseFloat(_maxLng), parseFloat(_maxLat)]
            ];
            mapRef.current.setMaxBounds(bounds);

            const centerLng = (parseFloat(_minLng) + parseFloat(_maxLng)) / 2;
            const centerLat = (parseFloat(_minLat) + parseFloat(_maxLat)) / 2;
            mapRef.current.flyTo({ center: [centerLng, centerLat] });
        }
        setIsModalVisible(false);
    };

    const hideBoundingBox = () => {
        setIsModalVisible(false)
    }

    useEffect(() => {
        if (!mapRef.current || !routeData || routeData.length == 0) return;
        const visibility = !showRoads ? 'none' : 'visible';
        routeData.map(_route => {
            const layerId = _route.route_id + '-layer';
            const arrowLayerId = _route.route_id + '-route-arrows';
            mapRef.current.setLayoutProperty(layerId, 'visibility', visibility);
            mapRef.current.setLayoutProperty(arrowLayerId, 'visibility', visibility);
        })
    }, [showRoads, routeData, mapRef])
    return (
        <React.Fragment>
            <div className="page-content">
                <Container fluid>
                    <Row>
                        <Col md="12" style={{display: 'flex', flexDirection: 'row', justifyContent: 'space-between'}}>
                            <div ref={mapContainer} className="map-container" style={{ height: 800, width: '80%' }} >
                            <div className='mapboxgl-ctrl mapboxgl-ctrl-group my-bounding-box-group'>
                                    <Tooltip title="Set Bounding Box">
                                        <button 
                                            className="mapboxgl-ctrl-zoom-in" 
                                            type="button" 
                                            onClick={showModal}>
                                                <i className="fas fa-share-alt-square"></i>
                                        </button>
                                    </Tooltip>
                                </div>
                                <div className='mapboxgl-ctrl mapboxgl-ctrl-group my-custom-ctrl-group' style={{display: (!drawing ? 'none' : 'block')}}>
                                    <Tooltip title="Save Route">
                                        <button 
                                            className="mapboxgl-ctrl-zoom-in" 
                                            type="button" 
                                            onClick={saveRoute}>
                                                <i className='fas fa-save'></i>
                                        </button>
                                    </Tooltip>
                                    <Tooltip title="Undo">
                                        <button 
                                            className="mapboxgl-ctrl-zoom-in" 
                                            type="button" 
                                            onClick={handleUndo}>
                                                <i className='fas fa-undo'></i>
                                        </button>
                                    </Tooltip>
                                    <Tooltip title="Clear">
                                        <button 
                                            title="" 
                                            onClick={clearRoute} 
                                            className="mapbox-gl-draw_ctrl-draw-btn mapbox-gl-draw_trash" 
                                            type="button" 
                                            aria-label="Remove" 
                                            aria-disabled="false">
                                        </button>
                                    </Tooltip>
                                </div>
                                <div className='mapboxgl-ctrl mapboxgl-ctrl-group my-custom-point-group'>
                                    <Tooltip title="From">
                                        <button 
                                            className="mapboxgl-ctrl-zoom-in" 
                                            type="button" 
                                            onClick={() => setPointType('start_point')}>
                                                <i className='fas fa-map-marker' style={{color: 'green'}}></i>
                                        </button>
                                    </Tooltip>
                                    <Tooltip title="Destination">
                                        <button 
                                            className="mapboxgl-ctrl-zoom-in" 
                                            type="button" 
                                            onClick={() => setPointType('end_point')}>
                                                <i className='fas fa-map-marker' style={{color: 'red'}}></i>
                                        </button>
                                    </Tooltip>
                                    <Tooltip title="Find Shortest Route">
                                        <button 
                                            className="mapboxgl-ctrl-zoom-in" 
                                            type="button" 
                                            onClick={() => setPointType('way_point')}>
                                                <i className="fas fa-truck" onClick={calculateShortestRoute}></i>
                                        </button>
                                    </Tooltip>
                                </div>
                            </div>
                            <div style={{ height: 800, width: '20%', marginLeft: '15px', background: '#282e3e' }}>
                                <div style={{display: 'flex', flexDirection: 'row', justifyContent: 'space-between', fontSize: '20px', color: 'gold', margin: '10px'}}>
                                    Routes
                                    <Button onClick={() => setDrawing(!drawing)} type={'primary'}>
                                        {drawing ? <><i className='fas fa-ellipsis-h'></i></> : <i className='fas fa-plus'></i>}
                                    </Button>
                                </div>
                                <div style={{height: 'calc(100% - 100px)', overflow: 'auto'}}>
                                {routeData && routeData.map((route: RouteDataType) => {
                                    return <>
                                        <div className='route-item' key={route.route_id} style={{display: 'flex', justifyContent: 'center', alignItems: 'center', height: '30px', fontSize: '13px'}}>
                                            <span onDoubleClick={() => handleTitleClick(route)} style={{ color: 'white' }}>
                                                <span style={{color: route.color}}>{route.name}</span>,<span style={{color: 'gold'}}> {route.distance}(m)</span>
                                            </span>

                                            <i className="bx bx-trash" onClick={() => removeRoute(route)}></i>
                                        </div>
                                    </>
                                })}
                                </div>
                                <div style={{position: 'relative', height: '50px'}}>
                                    <Button type='primary' danger style={{width: '50%', bottom: '5px', position: 'absolute'}} onClick={saveRoads}>
                                        Save Routes
                                    </Button>
                                    <Button type='primary' style={{width: '50%', bottom: '5px', right: '0px', position: 'absolute'}} onClick={() => setShowRoads(!showRoads)}>
                                        {showRoads ? 'Hide Routes' : 'Show Routes'}
                                    </Button>
                                </div>
                            </div>
                        </Col>
                    </Row>
                </Container>
            </div>
            {/* Modal */}
            <Modal
                isOpen={isModalOpen}
                onRequestClose={handleCancel}
                contentLabel="Edit Route Title"
                style={{
                    content: content
                }}
            >
                <ModalHeader tag="h4">
                    Edit Route
                </ModalHeader>
                <ModalBody>
                    <Input
                        type="text"
                        value={newTitle}
                        placeholder='Route Name'
                        onChange={handleInputChange}
                        style={{ width: '100%', padding: '10px', marginBottom: '10px' }}
                    />

                    <Input
                        type="number"
                        value={speedLimit}
                        placeholder='SpeedLimit'
                        onChange={handleSpeedLimitChange}
                        style={{ width: '100%', padding: '10px', marginBottom: '10px' }}
                    />
                    <Input
                        type="color"
                        value={newColor}
                        placeholder='SpeedLimit'
                        onChange={handleColorChange}
                        style={{ width: '100%', padding: '10px', marginBottom: '10px' }}
                    />
                    {/* <SketchPicker
                        color={newColor}
                        onChangeComplete={handleColorChange}
                    /> */}
                </ModalBody>
                <ModalFooter>
                    <Button type="primary" onClick={handleSave} style={{ marginRight: '10px' }}>Save</Button>
                    <Button type="default" onClick={handleCancel}>Cancel</Button>
                </ModalFooter>
            </Modal>
            <BoundingBoxModal 
                isVisible={isModalVisible}
                handleOk={handleOk}
                handleCancel={hideBoundingBox}
            />
        </React.Fragment>
    );
}

export default AutoRouting;