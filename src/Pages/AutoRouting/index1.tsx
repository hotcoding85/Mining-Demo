import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Container, Row, Col, Modal, ModalHeader, ModalBody, ModalFooter, Card, Button } from 'reactstrap';
import _ from 'lodash';
import * as turf from '@turf/turf';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css';
import { Input, Tooltip } from 'antd';
import { getRoutes } from './RoutingService';
import BoundingBoxModal from './BoundingBoxModal';
import { RouteCoordinatesType, RouteDataType, WayPointType } from './type';
import Breadcrumb from "Components/Common/Breadcrumb";
import Notification from "Components/Common/Notification";
import { addRoute, updateRoute, removeRoute, getAllVehicleRoutes } from 'slices/thunk';
import RBush from 'rbush';
import bbox from '@turf/bbox';
import booleanPointInPolygon from '@turf/boolean-point-in-polygon';
import { useDispatch, useSelector } from "react-redux";
import { Dropdown, DropdownType } from 'Components/Common/Dropdown';
import './index.css';
import { LAYOUT_MODE_TYPES } from 'Components/constants/layout';
import JSZip from '@turbowarp/jszip';
import { LayoutSelector, VehicleRouteSelector } from 'selectors';
import { LineString, Point } from 'interfaces/GeoJson';

// default route's speed limit 40km/h
const defaultSpeedLimit = 40;
// default route's line color - 'green'
const defaultColor = '#00ff00';
// fastest indexing with the large geojson file
const index = new RBush();

const AutoRouting = () => {
    // Set Page Title as a 'Auto Routing'
    document.title = "Auto Routing | FMS Live";

    const mapContainer = useRef(null);
    const mapRef = useRef<any>(null);
    const [lng, setLng] = useState(120.44871814239025);
    const [lat, setLat] = useState(-29.1576602184213);
    const [drawing, setDrawing] = useState<boolean>(false);
    const [coordinates, setCoordinates] = useState<number[][]>([]);
    const [allCoordinates, setAllCoordinates] = useState<number[][][]>([]);
    const [startPoint, setStartPoint] = useState<[number, number] | null>(null);
    const [endPoint, setEndPoint] = useState<WayPointType | null>(null);
    const [wayPoints, setWayPoints] = useState<WayPointType[]>([]);
    const [pointType, setPointType] = useState<'start_point' | 'end_point' | 'way_point'>('way_point')
    const startMarker = useRef<mapboxgl.Marker | null>(null);
    const endMarker = useRef<mapboxgl.Marker | null>(null);
    const stopMarkers = useRef<mapboxgl.Marker[]>([]);
    const [color, setColor] = useState(defaultColor);
    const [routePoints, setRoutePoints] = useState<[number, number, number][]>([]);
    const routeMarkers = useRef<mapboxgl.Marker[]>([]);
    const routeAllMarkers = useRef<RouteCoordinatesType[]>([]);
    const currentRoute = useRef<number>(1);
    const currentStopSignCount = useRef<number>(1);
    const [routeData, setRouteData] = useState<RouteDataType[] | null>(null);
    const stopSignData = useRef<RouteDataType[]>([]);
    const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
    const [errorMessage, setErrorMessage] = useState<string>("");
    const [notificationType, setNotificationType] = useState<string>("success")

    const [isStopSign, setIsStopSign] = useState<boolean>(false);
    const [stopSignPoint, setStopSignPoint] = useState<[number, number] | null>(null)

    const [mapStylesLoaded, setMapStylesLoaded] = useState<boolean>(false);

    const { layoutModeType } = useSelector(LayoutSelector );
    const isLight = layoutModeType === LAYOUT_MODE_TYPES.LIGHT;
    
    const dispatch: any = useDispatch();

    const layerOptions: DropdownType[] = [ 
        {label: "None", value: 'Empty'},
        {label: 'Current Haul Routes', value: 'CURRENT_HAUL_ROUTES'}, 
        {label: 'Future Road Designs', value: 'FUTURE_ROAD_DESIGNS'}, 
        {label: 'Speed Restrictions', value: 'SPEED_RESTRICTIONS'}, 
        {label: 'Pit Bottom', value: 'PIT_BOTTOM'}, 
        {label: 'Pit Climb', value: 'PIT_CLIMB'}, 
        {label: 'Stop Signs', value: 'STOP_SIGNS'}, 
        {label: 'Restricted', value: 'RESTRICTED'}, 
    ];
    
    const [currentCategory, setCurrentCategory] = useState<DropdownType>(layerOptions[0]);

    const { vehicleRoutes } = useSelector(VehicleRouteSelector);

    useEffect(() => {
        if (mapStylesLoaded && mapRef.current && vehicleRoutes){
            while(stopMarkers.current.length > 0) {
                stopMarkers.current.pop()?.remove()
            }
            const realRoutes = vehicleRoutes.filter(_route => _route.category != 'STOP_SIGNS' && _route.status == 'ACTIVE')
            const stopSignRoutes = vehicleRoutes.filter(_route => _route.category == 'STOP_SIGNS' && _route.status == 'ACTIVE')
            const _routeData = _.map(vehicleRoutes, route => {
                return {
                    id: route.id,
                    name: route.name,
                    speedLimits: route.speedLimits,
                    geoJson: route.geoJson,
                    distance: route.distance,
                    duration: route.duration,
                    color: route.color,
                    category: route.category,
                    speeds: []
                }
            })
            const sortedRouteData = _.sortBy(_routeData, 'id');
            setRouteData(sortedRouteData);
            stopSignData.current = stopSignRoutes
            let _coordinates: number[][][] = []
            routeAllMarkers.current = []
            _.map(realRoutes, _route => {
                let route = _route
                drawRoute(route, 4, _route.color)
                const _routeAllMarkers = {
                    coordinates: (route.geoJson.geometry as LineString).coordinates,
                    speedlimit: route.speedLimits,
                    color: route.color,
                    markers: [],
                    routeNumber: route.id,
                    category: currentCategory.value
                }
                routeAllMarkers.current.push(_routeAllMarkers)

                _coordinates.push((route.geoJson.geometry as LineString).coordinates)
            })
            setAllCoordinates([..._coordinates])
            currentRoute.current = realRoutes.length + 1
            currentStopSignCount.current = stopSignRoutes.length + 1
            // Draw Stop Signs
            // drawStopSign()
        }
    }, [vehicleRoutes, mapRef, mapStylesLoaded])
    useEffect(() => {
        if (!mapRef) return
        dispatch(getAllVehicleRoutes())
    }, [dispatch])
    useEffect(() => {
        // get routeData
        if (mapRef.current) return; // Initialize map only once
        
        mapboxgl.accessToken = process.env.MAPBOX_API_KEY || 'pk.eyJ1IjoibXlreXRhcyIsImEiOiJjbTA1MGhtb3YwY3Y0Mm5uY3FzYWExdm93In0.cSDrE0Lq4_PitPdGnEV_6w';

        if (mapRef.current) return; // initialize map only once

        mapRef.current = new mapboxgl.Map({
            container: mapContainer.current!,
            style: 'mapbox://styles/mykytas/cm0o2duin00ga01pw7e6s5gj1', //'mapbox://styles/mapbox/standard-satellite',
            center: [lng, lat],
            zoom: 15, // Adjust zoom level
            interactive: true,
            pitch: 45,
            bearing: 50,
            antialias: true, // create the gl context with MSAA antialiasing, so custom layers are antialiased
            minZoom: 0,

        });

        mapRef.current.addControl(new mapboxgl.ScaleControl());
        mapRef.current.addControl(new mapboxgl.NavigationControl({ visualizePitch: true }));
        mapRef.current.addControl(new mapboxgl.FullscreenControl());

        mapRef.current.on('style.load', () => {
            // Get 3D pit geojson data for calculating elevation
            fetchZipFile()
            mapRef.current?.addSource('mapbox-terrain-rgb', {
                type: 'raster-dem',
                url: 'mapbox://mapbox.terrain-rgb',
                tileSize: 512,
                maxzoom: 15,
            });

            mapRef.current?.setTerrain({ source: 'mapbox-terrain-rgb', exaggeration: 1 });
            setMapStylesLoaded(true);
        });

        mapRef.current.on('click', handleMapClick);
        mapRef.current.doubleClickZoom.disable();

        return () => {
            if (mapRef.current) {
                mapRef.current.off('click', handleMapClick);
            }
        };
    }, []);

    const fetchZipFile = async () => {
        const zipBuffer = await fetch('./240817_Pits_3D_WGS84.zip').then(response => response.arrayBuffer())
        JSZip.loadAsync(zipBuffer).then(data => {
            return data.file('240817_Pits_3D_WGS84.geojson')?.async("string");
        }).then((text) => {
            var geojsonData = JSON.parse(text as string)
            geojsonData.current = geojsonData

            _.map(geojsonData.current.features, (feature) => {
                const bounds = bbox(feature);
                const item = {
                    minX: bounds[0],
                    minY: bounds[1],
                    maxX: bounds[2],
                    maxY: bounds[3],
                    feature: feature
                };
                index.insert(item);
            });
        })
    }

    const isNearPreviousPoint = (coords: [number, number], prevCoords: [number, number] | null, threshold: number) => {
        if (!prevCoords) return false;
        const distance = Math.sqrt(Math.pow(prevCoords[0] - coords[0], 2) + Math.pow(prevCoords[1] - coords[1], 2));
        return distance < threshold;
    };
    const isNearExistingPoint = useCallback((coords: [number, number], threshold: number) => {
        let new_coord: [number, number] | null = null;
        let flag = false
        let minDistance = Infinity;

        _.map(routeAllMarkers.current, _route => {
            _.map(_route.coordinates, _coord => {
                const distance = Math.sqrt(Math.pow(_coord[0] - coords[0], 2) + Math.pow(_coord[1] - coords[1], 2));
                if (distance < minDistance && distance < threshold) {
                    new_coord = _coord as [number, number];
                    minDistance = distance;
                    flag = true
                }
            })
        })

        if (!flag) {
            _.map(coordinates, coordinate => {
                const distance = Math.sqrt(Math.pow(coordinate[0] - coords[0], 2) + Math.pow(coordinate[1] - coords[1], 2));
                if (distance < threshold) {
                    new_coord = coordinate as [number, number];
                }
            })
        }

        return new_coord;
    }, [routeAllMarkers, coordinates]);

    const calculateCustomElevation = (lngLat: { lng: number; lat: number }) => {
        const point = [lngLat.lng, lngLat.lat];

        // Get candidate polygons in the vicinity
        const candidates = index.search({
            minX: lngLat.lng,
            minY: lngLat.lat,
            maxX: lngLat.lng,
            maxY: lngLat.lat
        });

        let nearestFeature: any = null;
        let minDistance = Infinity;

        candidates.forEach((item) => {
            const isInside = booleanPointInPolygon(point, item.feature.geometry);
            if (isInside) {
                nearestFeature = item.feature;
                return false; // Exit loop early if point is inside a polygon
            }
        });

        if (nearestFeature) {
            return Math.round(parseFloat(nearestFeature.geometry.elevation) * 100) / 100; // Adjust property name if different
        } else {
            return Math.round((parseFloat(mapRef.current.queryTerrainElevation(point))* 100) / 100);
        }
    };

    const handleMapClick = useCallback((e: mapboxgl.MapMouseEvent) => {
        const lngLat: [number, number] = [e.lngLat.lng, e.lngLat.lat];
        if (isStopSign){
            let newCoords = lngLat;
            const proximityThreshold1 = 0.0002;
            let _newCoords = isNearExistingPoint(newCoords as [number, number], proximityThreshold1);
            if (!!_newCoords) {
                newCoords[0] = _newCoords[0]
                newCoords[1] = _newCoords[1]
            }
            const doesStopSignExist = (point, routes) => {
                return routes.some(route =>
                    route.geoJson.geometry.coordinates.some(coord =>
                        coord[0] === point[0] && coord[1] === point[1]
                    )
                );
            };
            if (doesStopSignExist(newCoords, stopSignData.current)){
                setNotificationType('warning')
                setErrorMessage("The Stop Sign Point is already exist with same coordinate!")
                return;
            }
            addMarker(lngLat, 'stop')
            setNewTitle("New Stop Sign" + currentStopSignCount.current)
            setNewColor('#ff0000')
            setEditingRouteId(null)
            setIsStopSignModalOpen(true)
            setStopSignPoint(_newCoords)
            return;
        }
        if (drawing) {
            let newCoords = lngLat;

            const proximityThreshold1 = 0.0002; // Adjust this value as per your proximity requirement
            const proximityThreshold2 = 0.00005;

            const prevPoint = coordinates.length > 0 ? coordinates[coordinates.length - 1] : null;
            if (isNearPreviousPoint(newCoords as [number, number], prevPoint as [number, number], proximityThreshold2)) {
                return;
            }

            // if it's the first point, choose the existing point near by newCoords
            let _newCoords = isNearExistingPoint(newCoords as [number, number], !prevPoint ? proximityThreshold1 : proximityThreshold2);
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
                    else {
                        _routePointMarker = new mapboxgl.Marker({ color: 'yellow', scale: 0.8 })
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
        else {
            switch (pointType) {
                case 'start_point':
                    addMarker(lngLat, 'start')
                    setStartPoint(lngLat);
                    setPointType('way_point')
                    break;
                case 'end_point':
                    addMarker(lngLat, 'end')
                    setEndPoint({ coordinates: lngLat, speedlimit: defaultSpeedLimit, color: color });
                    setPointType('way_point')
                    break;
                default:
                    break;
            }
        }
    }, [drawing, coordinates, routePoints, routeData, pointType, startPoint, endPoint, setPointType, isStopSign, stopSignData]);

    const addMarker = useCallback((lngLat: [number, number], type: 'start' | 'end' | 'stop', color?: string) => {
        if (mapRef.current) {
            const _color = color ? color : type == 'start' ? 'green' : 'red'
            const _scale = 1

            let _wayPointMarker, _startPointMarker, _endPointMarker
            switch (type) {
                case 'start':
                    startMarker.current?.remove()
                    _startPointMarker = new mapboxgl.Marker({ color: _color, scale: _scale })
                        .setLngLat(lngLat)
                        .addTo(mapRef.current);
                    startMarker.current = _startPointMarker
                    break;
                case 'end':
                    endMarker.current?.remove()
                    _endPointMarker = new mapboxgl.Marker({ color: _color, scale: _scale })
                        .setLngLat(lngLat)
                        .addTo(mapRef.current);
                    endMarker.current = _endPointMarker
                    break;
                case 'stop':
                    const markerElement = document.createElement('div');
                    markerElement.style.backgroundColor = _color;
                    markerElement.style.width = '20px';
                    markerElement.style.height = '20px';
                    markerElement.style.borderRadius = '50%';
                    markerElement.style.cursor = 'pointer';

                    _wayPointMarker = new mapboxgl.Marker(markerElement)
                        .setLngLat(lngLat)
                        .addTo(mapRef.current);
                    stopMarkers.current.push(_wayPointMarker);
                    // _wayPointMarker.getElement().addEventListener('dblclick', handleDoubleClick);
                    // Add click event listener to the marker
                    const _secondWayPointMarker = new mapboxgl.Marker({ color: _color, scale: _scale })
                        .setLngLat(lngLat)
                        .addTo(mapRef.current);
                    stopMarkers.current.push(_secondWayPointMarker);
                    // _secondWayPointMarker.getElement().addEventListener('dblclick', handleDoubleClick);
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
        _.map(routeMarkers.current, _marker => {
            _marker.remove();
        })
        if (mapRef.current && mapRef.current.getLayer('polygon-layer')) {
            mapRef.current.removeLayer('polygon-layer');
        }
        if (mapRef.current && mapRef.current.getLayer('route-arrows')) {
            mapRef.current.removeLayer('route-arrows');
        }
        routeMarkers.current = [];
        setRoutePoints([])
        setCoordinates([])
    }, [])

    const saveRoute = useCallback(async () => {
        if (!mapRef.current) return;

        if (coordinates.length > 1) {
            const updatedRoutePointMarker = new mapboxgl.Marker({ color: 'red', scale: 0.8 })
                .setLngLat(coordinates[coordinates.length - 1] as [number, number])
                .addTo(mapRef.current);
            routeMarkers.current[routeMarkers.current.length - 1].remove();
            routeMarkers.current[routeMarkers.current.length - 1] = updatedRoutePointMarker;

            let distance = Math.floor(turf.length(turf.lineString(coordinates), { units: 'meters' }))
            let duration = Math.floor(distance / (defaultSpeedLimit / 3.6))
            try {
                let saving_data: any = {
                    geoJson: {
                        geometry: {
                            type: 'LineString',
                            coordinates: coordinates as [number, number][],
                        },
                        type: "Feature",
                        properties: {}
                    },
                    distance: distance,
                    duration: duration,
                    speedLimits: defaultSpeedLimit,
                    color: color,
                    name: 'New Route ' + currentRoute.current,
                    category: "CURRENT_HAUL_ROUTES",
                    status: 'ACTIVE'
                };
                dispatch(addRoute(saving_data))
                routeMarkers.current = [];
                setDrawing(false);
                currentRoute.current++
                setNotificationType('success')
                setErrorMessage('New Route saved successfully!')
                
            } catch (error) {
                console.error(error);
            }

        }
    }, [coordinates, allCoordinates, routeAllMarkers, dispatch])

    const fnRemoveRoute = useCallback(async (route: RouteDataType) => {
        if (!route.id) return
        try {
            dispatch(removeRoute(route.id))

            if (routeData !== null && route !== null && routeAllMarkers !== null) {
                const updatedRouteData = _.filter(routeData, _route => route.id !== _route.id);
                setRouteData(updatedRouteData);

                const updatedRouteAllMarkers = _.filter(routeAllMarkers.current, _marker => _marker.routeNumber !== route.id)
                routeAllMarkers.current = updatedRouteAllMarkers
            }
            const sourceId = route.id + '-source';
            const layerId = route.id + '-layer';
            const arrowLayerId = route.id + '-route-arrows';
            const mapSource = mapRef.current?.getSource(sourceId);
            (mapSource as mapboxgl.GeoJSONSource).setData('');
            if (mapRef.current?.getLayer(layerId)) {
                mapRef.current?.removeLayer(layerId);
            }
            if (mapRef.current?.getLayer(arrowLayerId)) {
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
            setNotificationType('success')
            setErrorMessage(route.name + ' removed successfully!')
        } catch (error) {
            console.log(error)
        }
    }, [routeData, routeAllMarkers, mapRef, dispatch, notificationType])

    const [saving_data, setSavingData] = useState<RouteDataType | null>(null);

    useEffect(() => {
        // show edit modal when clicking the line in the map
        const map = mapRef.current;
        if (!map || !vehicleRoutes || vehicleRoutes.length === 0) return;
        const realRoutes = vehicleRoutes.filter(_route => _route.category !== 'STOP_SIGNS')
        const stopSigns = vehicleRoutes.filter(_route => _route.category === 'STOP_SIGNS')
        const layerIds: string[] = [];
        _.map(realRoutes, _route => {
            const layerId = `${_route.id}-layer`;
            layerIds.push(layerId)
        });

        const handleDoubleClick = (e: any) => {
            e.preventDefault();
            const clickedFeatures = e.features;
            const layerId = clickedFeatures[0].layer.id
            if (clickedFeatures && clickedFeatures.length > 0) {
                const _route = _.find(realRoutes, route => route.id === layerId.substr(0, layerId.length - 6));
                if (!_route) return;

                const selectedOption = layerOptions.find((option: DropdownType) => option.value === _route.category);
                if (selectedOption) {
                    setCurrentCategory(selectedOption)
                }
                else{
                    setCurrentCategory(layerOptions[0])
                }
                setEditingRouteId(_route.id);
                setNewTitle(_route.name || '');
                setSpeedLimit(_route.speedLimits);
                setNewColor(_route.color);
                setIsModalOpen(true);
            }
        };

        _.map(layerIds, layerId => {
            map.on('dblclick', layerId, handleDoubleClick);
        });

        return () => {
            _.map(layerIds, layerId => {
                if (map.getLayer(layerId)) {
                    map.off('dblclick', layerId, handleDoubleClick);
                }
            });
        };
    }, [vehicleRoutes, saving_data]);

    const isStopSignPoint = useCallback((coord) => { //check the point is STOP_SIGNS, if so return stopSignDuration
        let stopsign: any = null
        _.map(stopSignData.current, _stopsign => {
            if ((_stopsign.geoJson.geometry as Point).coordinates && (_stopsign.geoJson.geometry as Point).coordinates[0]) {
                if ((_stopsign.geoJson.geometry as Point).coordinates[0][0] == coord[0] && (_stopsign.geoJson.geometry as Point).coordinates[0][1] == coord[1]) {
                    stopsign = _stopsign
                }
            }
        })

        return stopsign
    }, [stopSignData.current])

    const drawRoute = useCallback((_saving_data: RouteDataType, routeWidth: number = 4, _color: string = color, animation: boolean = false): RouteDataType => {
        if (!mapRef.current) return _saving_data;

        if (mapRef.current && mapRef.current.getLayer('polygon-layer')) {
            mapRef.current.removeLayer('polygon-layer');
        }
        if (mapRef.current && mapRef.current.getLayer('route-arrows')) {
            mapRef.current.removeLayer('route-arrows');
        }

        const segments: any = [];

        // Assuming `_saving_data.geometry.coordinates` is an array of coordinates along the route
        const _coordinates = (_saving_data.geoJson.geometry as LineString).coordinates as [number, number][];
        const pinRoute = _coordinates;

        let total_stopSignDuration = 0
        let stopSigns: any[] = []
        _.map(pinRoute, _coord => {
            let _stopSignPoint: any = isStopSignPoint(_coord)
            if (_stopSignPoint) {
                total_stopSignDuration += _stopSignPoint.duration
                stopSigns.push(_stopSignPoint)
            }
        })
        // Loop through the coordinates and create segments
        for (let i = 1; i < _coordinates.length; i++) {
            segments.push({
                coordinates: [_coordinates[i - 1], _coordinates[i]],
                color: _saving_data.colors ? _saving_data.colors[i] : _color, // Use segment-specific color or fallback to default color
                speed: _saving_data.speedLimits
            });
        }

        if (mapRef.current?.getLayer('line-layer')) {
            mapRef.current?.removeLayer('line-layer');
        }
        if (mapRef.current?.getSource('line-source')) {
            mapRef.current?.removeSource("line-source");
        }

        const sourceId = _saving_data.id + '-source';
        const layerId = _saving_data.id + '-layer';
        const arrowLayerId = _saving_data.id + '-route-arrows';

        if (mapRef.current?.getSource(sourceId)) {
            // Update the data for the existing source
            const data: any = {
                type: 'FeatureCollection',
                features: _.map(segments, (segment: any) => ({
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

            (mapRef.current?.getSource(sourceId) as mapboxgl.GeoJSONSource).setData(data);
        } else {
            // Add a new source and layer if they don't exist
            mapRef.current?.addSource(sourceId, {
                type: 'geojson',
                data: {
                    type: 'FeatureCollection',
                    features: _.map(segments, (segment: any) => ({
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
            if (!mapRef.current?.getLayer(arrowLayerId))
                mapRef.current?.addLayer({
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
        if (!mapRef.current?.getLayer(arrowLayerId))
            mapRef.current?.addLayer({
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
        setSavingData(saving_data)

        mapRef.current?.on('mouseenter', layerId, () => {
            mapRef.current.getCanvas().style.cursor = 'pointer';
        });

        // Change it back when not over the lines
        mapRef.current?.on('mouseleave', layerId, () => {
            mapRef.current.getCanvas().style.cursor = '';
        });
        // Adjust map view to fit the route
        let popup;
        let marker;
        let stopStartTime = 0; // Tracks stop sign pause start time
        let isPaused = false;  // Tracks if the animation is paused
        let currentStopIndex = 0; // Tracks the current stop sign index

        if (animation) {
            const bounds = new mapboxgl.LngLatBounds();
            (_saving_data.geoJson.geometry as LineString).coordinates?.forEach((coord: any) => bounds.extend(coord));
            mapRef.current?.fitBounds(bounds, { padding: 50 });
            popup = new mapboxgl.Popup({ closeButton: false });
            const el = document.createElement('div');
            el.className = 'animationmarker';

            marker = new mapboxgl.Marker({
                scale: 1,
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
        const total_distance = Math.floor(turf.length(turf.lineString(pinRoute), { units: 'meters' }))
        // if (_saving_data.distance == 0) {
        //     _saving_data.distance = total_distance;
        // }

        // get total duration of the travel
        let total_duration = 0;
        total_duration = calculateTotalDuration(pinRoute as [number, number][], segments, _saving_data.speedLimits);
        const diff = animation ? 30 : total_distance;
        const duration = animation ? (total_duration) * 1000 : 1000; // animation duration in ms with total distance, 2X speed
        let totalElapsedTime = 0; // To store the total elapsed time including pauses
        let previousTimestamp; // To store the timestamp from the previous frame
        let countedStopSignDuration = 0;
        const animateMarker = (timestamp: any) => {
            // Remove destination marker
            endMarker.current?.remove();

            if (!startTime) startTime = timestamp;
            const elapsed = isPaused ? stopStartTime - startTime : timestamp - startTime;
            const progress = Math.min(elapsed / duration, 1);
            if (isPaused) {
                // If animation is paused, check if the pause time has exceeded the stop sign duration
                const currentStopSign = stopSigns[currentStopIndex];
                if (currentStopSign && timestamp - stopStartTime >= currentStopSign.duration * 1000) {
                    // Resume animation after stop sign duration
                    isPaused = false;
                    startTime += (timestamp - stopStartTime);
                    totalElapsedTime = (timestamp - stopStartTime);
                    countedStopSignDuration += currentStopSign.duration * 1000
                    currentStopIndex++;
                    // startTime = elapsed + currentStopSign.duration * 1000; // Reset start time for the next segment
                } else {
                    // Continue pausing if the stop duration hasn't passed yet
                    if (previousTimestamp !== undefined) {
                        totalElapsedTime += timestamp - previousTimestamp;
                    }
                    previousTimestamp = timestamp;
                    
                    requestAnimationFrame(animateMarker);
                    let currentSegmentIndex = 0;
                    let segmentDistance = 0;
                    const distanceCovered = progress * total_distance;
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
                    const elevation = Math.floor(
                        // Do not use terrain exaggeration to get actual meter values
                        calculateCustomElevation({ lng: lng, lat: lat })
                    );
                    popup.setHTML('Distance: ' + Math.ceil(distanceCovered) + 'm<br/>Altitude: ' + elevation + 'm' + "<br/>Speed: " + segment.speed + "km/h" + "<br/>Current Time: " + Math.ceil(totalElapsedTime / 1000) + 's<br/>Total Duration: ' + (total_duration + total_stopSignDuration) + 's<br/>Total Stop Sign Duration: ' + total_stopSignDuration + 's');
                    return;
                }
            }

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
            totalElapsedTime = elapsed + countedStopSignDuration;
            previousTimestamp = timestamp;

            updateRoute(progress, total_distance, segments);

            if (animation) {
                // prevent showing a lot of digits during the animation
                const elevation = Math.floor(
                    // Do not use terrain exaggeration to get actual meter values
                    calculateCustomElevation({ lng: lng, lat: lat })
                );
                marker.setLngLat([lng, lat]);
                popup.setHTML('Distance: ' + Math.ceil(distanceCovered) + 'm<br/>Altitude: ' + elevation + 'm' + "<br/>Speed: " + segment.speed + "km/h" + "<br/>Current Time: " + Math.ceil(totalElapsedTime / 1000) + 's<br/>Total Duration: ' + (total_duration + total_stopSignDuration) + 's<br/>Total Stop Sign Duration: ' + total_stopSignDuration + 's');

                 // Pause at stop signs
                const currentStopSign = stopSigns[currentStopIndex];
                if (currentStopSign && turf.distance([lng, lat], currentStopSign.geoJson.geometry.coordinates[0], { units: 'meters' }) < 1) {
                     // Pause the animation at the stop sign
                     stopStartTime = timestamp;  // Track when the stop starts
                     isPaused = true;
                }
            }

            if (totalElapsedTime < (duration + total_stopSignDuration * 1000) && !isPaused) {
                requestAnimationFrame(animateMarker);

                if (animation) {
                    const rotation = 150 - progress * 40.0;
                    mapRef.current?.setBearing(rotation % 360);
                    mapRef.current?.flyTo({
                        center: [lng, lat],
                        speed: 1,
                        curve: 1,
                        easing: t => t
                    });
                }
            } else {
                if (progress < 1) {
                    requestAnimationFrame(animateMarker);
                    if (animation) {
                        const rotation = 150 - progress * 40.0;
                        mapRef.current?.setBearing(rotation % 360);
                        mapRef.current?.flyTo({
                            center: [lng, lat],
                            speed: 1,
                            curve: 1,
                            easing: t => t
                        });
                    }
                }
                else  {
                    animation && marker.remove();
                    endPoint?.coordinates && addMarker(endPoint?.coordinates, 'end');
                }
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

            const mapSource = mapRef.current?.getSource(_saving_data.id + '-source');

            if (mapSource && 'setData' in mapSource) {
                const updatedGeoJSON: any = {
                    type: 'FeatureCollection',
                    features: _.map(updatedSegments, (segment: any) => ({
                        type: 'Feature',
                        geometry: {
                            type: 'LineString',
                            coordinates: segment.coordinates
                        },
                        properties: {
                            color: segment.color,
                        }
                    }))
                };

                (mapSource as mapboxgl.GeoJSONSource).setData(updatedGeoJSON);
            }
        };

        requestAnimationFrame(animateMarker);

        return _saving_data;
    }, [startPoint, endPoint, wayPoints, color, setStartPoint, setEndPoint, setWayPoints, routeData]);

    useEffect(() => {
        if (!mapRef.current || !stopSignData.current || stopSignData.current.length === 0) return
        _.map(stopSignData.current, (_stopsign) => {
            (_stopsign.geoJson?.geometry as LineString)?.coordinates && (_stopsign.geoJson?.geometry as LineString)?.coordinates.length > 0 && (_stopsign.geoJson?.geometry as LineString)?.coordinates[0] && addMarker((_stopsign.geoJson?.geometry as LineString)?.coordinates[0], 'stop', _stopsign.color)

        })
        const addMarkerDoubleClickListener = (markers, handler) => {
            markers.forEach(marker => {
                marker.getElement().addEventListener('dblclick', () => handler(marker));
            });
        };
        
        // Define the double-click event handler
        const handleMarkerDoubleClick = marker => {
            let lngLat = marker.getLngLat()
            const route: any = _.find(stopSignData.current, _stopsign => {
                const coordinates = (_stopsign?.geoJson?.geometry as LineString)?.coordinates;
                
                // Check if coordinates exist and have the expected structure
                return coordinates && 
                       coordinates.length > 0 && 
                       coordinates[0].length > 1 &&
                       coordinates[0][0] === lngLat.lng && 
                       coordinates[0][1] === lngLat.lat;
            });
            if (route) {
                setEditingRouteId(route.id);
                setNewTitle(route.name ? route.name : '');
                setNewColor(route.color)
                setIsStopSignModalOpen(true);
                setStopSignDuration(route.duration)
            }
        };
        
        // Attach double-click event listeners to all markers in stopMarkers.current
        addMarkerDoubleClickListener(stopMarkers.current, handleMarkerDoubleClick);
    }, [stopSignData.current, mapRef])
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
        segments: { coordinates: [[number, number], [number, number]], color: string, speed: number }[],
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
    
        // Calculate duration for each segment
        segments.forEach(segment => {
            const startCoord = segment.coordinates[0];
            const endCoord = segment.coordinates[1];
            const speedLimit = segment.speed;
    
            const startIndex = findCoordIndex(startCoord);
            const endIndex = findCoordIndex(endCoord);
    
            // Get the full range of coordinates for the segment
            const segmentCoordinates = routeCoordinates.slice(startIndex, endIndex + 1);
            const segmentDistance = Math.floor(turf.length(turf.lineString(segmentCoordinates), { units: 'meters' }));
    
            // Duration in seconds for this segment
            const segmentDuration = segmentDistance / (speedLimit / 3.6); // Convert km/h to m/s
            totalDuration += segmentDuration;
        });
    
        // Calculate duration for the final segment from the last segment's end to the destination
        const lastSegmentEndCoord = segments[segments.length - 1].coordinates[1];
        const routeEndCoord = routeCoordinates[routeCoordinates.length - 1];
        
        if (!_.isEqual(lastSegmentEndCoord, routeEndCoord)) {
            const startIndex = findCoordIndex(lastSegmentEndCoord);
            const endIndex = findCoordIndex(routeEndCoord);
    
            const finalSegmentCoordinates = routeCoordinates.slice(startIndex, endIndex + 1);
            const finalSegmentDistance = Math.floor(turf.length(turf.lineString(finalSegmentCoordinates), { units: 'meters' }));
    
            // Use the provided speed limit for the last segment
            const finalSegmentDuration = finalSegmentDistance / (finalSegmentSpeedLimit / 3.6);
            totalDuration += finalSegmentDuration;
        }
    
        return Math.floor(totalDuration); // Total duration in seconds
    };
    
    const [editingRouteId, setEditingRouteId] = useState<string | null>(null);
    const [newTitle, setNewTitle] = useState<string>("");
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [isStopSignModalOpen, setIsStopSignModalOpen] = useState<boolean>(false);
    const [newColor, setNewColor] = useState<string>("#00ff00");
    const [speedLimit, setSpeedLimit] = useState<number>(defaultSpeedLimit);
    const [showRoads, setShowRoads] = useState<boolean>(true);
    const [stopSignDuration, setStopSignDuration] = useState<number>();

    const content: any = {
        top: '50%',
        left: '50%',
        right: 'auto',
        bottom: 'auto',
        marginRight: '-50%',
        transform: 'translate(-50%, -50%)'
    };
    const handleTitleClick = useCallback((route: RouteDataType) => {
        if (route.category !== 'STOP_SIGNS') {
            const selectedOption = layerOptions.find((option: DropdownType) => option.value === route.category);
            if (selectedOption) {
                setCurrentCategory(selectedOption)
            }
            else{
                setCurrentCategory(layerOptions[0])
            }
            setEditingRouteId(route.id);
            setNewTitle(route.name ? route.name : '');
            setSpeedLimit(route.speedLimits);
            setNewColor(route.color)
            setIsModalOpen(true);
        }
        else{
            setEditingRouteId(route.id);
            setNewTitle(route.name ? route.name : '');
            setNewColor(route.color)
            setIsStopSignModalOpen(true);
            setStopSignDuration(route.duration)
        }
    }, [newColor, editingRouteId, speedLimit, newTitle]);
    const handleCancel = () => {
        setEditingRouteId(null);
        setIsModalOpen(false);
    };
    const handleCancelStopSign = useCallback(() => {
        if (!editingRouteId) {
            stopMarkers.current?.pop()?.remove()
            stopMarkers.current?.pop()?.remove()
        }
        setEditingRouteId(null);
        setIsStopSignModalOpen(false);
    }, [editingRouteId]);
    const handleInputChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        setNewTitle(event.target.value);
    }, [newTitle]);

    const handleSpeedLimitChange = useCallback((event: any) => {
        setSpeedLimit(parseFloat(event.target.value))
    }, [speedLimit])

    const handleSave = useCallback(async () => {
        try {
            if (editingRouteId !== null && routeData) {
                let _saving_data = _?.find(routeData, _route => editingRouteId === _route.id)
                if (!_saving_data) return;
                const coordinates = (_saving_data.geoJson?.geometry as LineString)?.coordinates;
                if (!coordinates) return;

                let distance = Math.floor(turf.length(turf.lineString(coordinates), { units: 'meters' }))
                let duration = Math.floor(distance / (speedLimit / 3.6))
                _saving_data.distance = distance
                _saving_data.duration = duration
                _saving_data.speedLimits = speedLimit
                _saving_data.color = newColor
                _saving_data.name = newTitle
                _saving_data.category = currentCategory.value
                if (currentCategory.value === 'Empty') {
                    setNotificationType('warning')
                    setErrorMessage("Please input all value correctly!")
                    return
                }
                if (currentCategory.value === 'STOP_SIGNS') {
                    setNotificationType('warning')
                    setErrorMessage("You can't save STOP SIGNS!")
                    return
                }
                const { id, speeds, ...rest } = _saving_data;
                dispatch(updateRoute(editingRouteId, rest))

                setEditingRouteId(null);
                setIsModalOpen(false);

                setNotificationType('success')
                setErrorMessage(newTitle + ' saved successfully!')
            }
        } catch (error) {
            console.log(error)
        }
    }, [editingRouteId, routeData, newTitle, speedLimit, newColor, currentCategory, notificationType]);

    const handleColorChange = useCallback((e) => {
        setNewColor(e.target.value);
    }, [newColor]);

    const shortestRoutes = useRef<string[]>([]);
    const calculateShortestRoute = useCallback(() => {
        if (!routeData || !startPoint || !endPoint) return;
        const response = getRoutes(routeData, startPoint, endPoint.coordinates)
        if (!response) return;

        if (!response.route || response.route.length == 0) return;
        const points: [number, number][] = [];
        const colors: (string | null)[] = [];
        const speeds: (number | 0)[] = [];
        _.map(response.route, item => {
            points.push(item.point);
            colors.push(item.color);
            speeds.push(item.speedLimit);
        });

        let saving_data: RouteDataType = {
            id: Date.now().toString(),
            geoJson: {
                geometry: {
                    type: 'LineString',
                    coordinates: points,
                },
                type: 'Feature',
                properties: {}
            },
            distance: 0,
            duration: 0,
            speedLimits: 0,
            colors: colors,
            color: '',
            speeds: speeds
        };
        drawRoute(saving_data, 8, '', true);
        if (saving_data.id) {
            // this code is for clearing the map
            shortestRoutes.current.push(saving_data?.id)
        }
    }, [routeData, startPoint, endPoint]);

    const removeShortestRoute = useCallback(() => {
        if (!shortestRoutes.current || shortestRoutes.current.length == 0) return

        _.map(shortestRoutes.current, _short => {
            const arrowLayerId = _short + '-route-arrows';
            const sourceId = _short + '-source';
            const layerId = _short + '-layer';
            if (mapRef.current && mapRef.current.getLayer(arrowLayerId)) {
                mapRef.current.removeLayer(arrowLayerId);
            }
            if (mapRef.current && mapRef.current.getLayer(layerId)) {
                mapRef.current.removeLayer(layerId);
            }
            if (mapRef.current && mapRef.current.getSource(sourceId)) {
                mapRef.current.removeSource(sourceId);
            }
        })
    }, [mapRef])
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
        _.map(routeData, _route => {
            const layerId = _route.id + '-layer';
            const arrowLayerId = _route.id + '-route-arrows';
            mapRef.current.getLayer(layerId) && mapRef.current.setLayoutProperty(layerId, 'visibility', visibility);
            mapRef.current.getLayer(arrowLayerId) && mapRef.current.setLayoutProperty(arrowLayerId, 'visibility', visibility);
        })

        if (showRoads) {
            _.map(stopMarkers.current, _marker => {
                _marker.addTo(mapRef.current)
            })
        }
        else{
            _.map(stopMarkers.current, _marker => {
                _marker.remove()
            })
        }

    }, [showRoads, routeData, mapRef])

    const handleStopSingDurationChange = useCallback((e) => {
        setStopSignDuration(e.target.value)
    }, [stopSignDuration])

    const handleSaveStopSign = useCallback(() => {
        
        if (!newTitle) return
        if (!stopSignDuration || stopSignDuration <= 0) {
            setNotificationType('warning')
            setErrorMessage("Please input valid Stop Sign Duration!")
            return;
        }
        if (editingRouteId) {
            let _saving_data: any = _.find(routeData, _route => _route.id === editingRouteId)
            if (_saving_data) {
                _saving_data.name = newTitle
                _saving_data.color = newColor
                _saving_data.duration = stopSignDuration
                const { id, speeds, ...rest } = _saving_data;
                dispatch(updateRoute(editingRouteId, rest))
            }
        }
        else{
            
            if (!stopSignPoint) return
            const doesStopSignExist = (point, routes) => {
                return routes.current.some(route =>
                    route.geoJson.geometry.coordinates.some(coord =>
                        coord[0] === point[0] && coord[1] === point[1]
                    )
                );
            };
            if (doesStopSignExist(stopSignPoint, stopSignData)){
                setNotificationType('warning')
                setErrorMessage("The Stop Sign Point is already exist with same coordinate!")
                return;
            }
            let _saving_data: any = {
                geoJson: {
                    geometry: {
                        type: 'LineString',
                        coordinates: [stopSignPoint],
                    },
                    type: "Feature",
                    properties: {}
                },
                distance: 0,
                duration: stopSignDuration,
                speedLimits: defaultSpeedLimit,
                color: newColor,
                name: newTitle,
                category: "STOP_SIGNS"
            };
            dispatch(addRoute(_saving_data))
        }
        setStopSignPoint(null)
        setEditingRouteId(null);
        setIsStopSignModalOpen(false);
        setIsStopSign(false)
    }, [editingRouteId, stopSignDuration, newTitle, newColor, stopSignPoint, stopSignData, routeData])
    return (
        <React.Fragment>
            <div className="page-content">
                <Container fluid>
                    <Breadcrumb title="Mine Dynamics" breadcrumbItem="Auto Routing" />
                    <Row>
                        <Col md="12" style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
                            <div ref={mapContainer} className="map-container" style={{ height: 'calc(100vh - 230px)', width: '80%' }} >
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
                                <div className='mapboxgl-ctrl mapboxgl-ctrl-group my-custom-ctrl-group' style={{ display: (!drawing ? 'none' : 'block') }}>
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
                                            <i className='fas fa-map-marker' style={{ color: 'green' }}></i>
                                        </button>
                                    </Tooltip>
                                    <Tooltip title="Destination">
                                        <button
                                            className="mapboxgl-ctrl-zoom-in"
                                            type="button"
                                            onClick={() => setPointType('end_point')}>
                                            <i className='fas fa-map-marker' style={{ color: 'red' }}></i>
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
                                    <Tooltip title="Clear Map">
                                        <button
                                            className="mapboxgl-ctrl-zoom-in"
                                            type="button"
                                            onClick={removeShortestRoute}>
                                            <i className="fas fa-broom"></i>
                                        </button>
                                    </Tooltip>
                                </div>
                                <div className='mapboxgl-ctrl mapboxgl-ctrl-group my-stopsign-point-group'>
                                    <Tooltip title="New Stop Sign">
                                        <button
                                            className="mapboxgl-ctrl-zoom-in"
                                            type="button"
                                            onClick={() => setIsStopSign(!isStopSign)}>
                                            <i className='fas fa-stop' style={{ color: isStopSign ? 'red' : 'grey' }}></i>
                                        </button>
                                    </Tooltip>
                                </div>
                            </div>
                            <Card style={{ height: 'calc(100vh - 230px)', width: '20%', marginLeft: '15px', padding:'16px' }}>
                                <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', fontSize: '20px', alignItems: 'center'}}>
                                    Routes
                                    <Button key={'guyu67'} onClick={() => {setDrawing(!drawing); setIsStopSign(false);}}>
                                        {drawing ? <><i className='fas fa-ellipsis-h'></i></> : <i className='fas fa-plus'></i>}
                                    </Button>
                                </div>
                                <div style={{ height: 'calc(100% - 100px)', overflow: 'auto', marginTop:'16px' }}>
                                    {routeData && _.map(routeData, (route: RouteDataType, key) => {
                                        return <>
                                            <div className={'route-item ' + (isLight ? 'light-mode' : 'dark-mode')} key={key} style={{ display: 'flex', alignItems: 'center', fontSize: '14px', padding: '6px' }}>
                                                <div style={{ flex: '1' }} onClick={() => handleTitleClick(route)}>
                                                    <div style={{ color: route.color, display:'block' }}>{route.name}</div>
                                                    {
                                                        route.category !== 'STOP_SIGNS' ?
                                                        <>
                                                        <div style={{ fontSize: '12px', display:'block', color: isLight ? 'black' : 'white' }}>Distance: {route.distance}(m)</div>
                                                        <div style={{ fontSize: '12px', display:'block', color: isLight ? 'black' : 'white' }}>Speed Limit: {route.speedLimits}(km/h)</div>
                                                        </>
                                                        :
                                                        <div style={{ fontSize: '12px', display:'block', color: isLight ? 'black' : 'white' }}>Duration: {route.duration}(s)</div>
                                                    }
                                                    <div style={{ fontSize: '12px', display: 'block', fontWeight: 700, color: isLight ? 'black' : 'white' }}>
                                                        { 
                                                            (layerOptions.find(option => option.value === route.category)?.label) || 'None' 
                                                        }
                                                    </div>
                                                </div>
                                                <div style={{ flex: '0.1' }}>
                                                    <i className="bx bx-trash" onClick={() => fnRemoveRoute(route)}></i>
                                                </div>
                                            </div>
                                        </>
                                    })}
                                </div>
                                <div style={{ position: 'relative', height: '50px' }}>
                                    <Button style={{ width: '100%', bottom: '5px', right: '0px', position: 'absolute' }} onClick={() => setShowRoads(!showRoads)}>
                                        {showRoads ? 'Hide Routes' : 'Show Routes'}
                                    </Button>
                                </div>
                            </Card>
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
                    <div id="auto-routing-category" style={{width: '100%', marginTop: '10px'}}>
                        <Dropdown
                            label="Category"
                            items={layerOptions}
                            value={currentCategory}
                            onChange={setCurrentCategory}
                            />
                    </div>
                </ModalBody>
                <ModalFooter>
                    <Button onClick={handleSave} style={{ marginRight: '10px' }}>Save</Button>
                    <Button onClick={handleCancel}>Cancel</Button>
                </ModalFooter>
            </Modal>
            {/* Stop Signs Modal */}
            <Modal
                isOpen={isStopSignModalOpen}
                onRequestClose={handleCancelStopSign}
                contentLabel="Stop Sign"
                style={{
                    content: content
                }}
            >
                <ModalHeader tag="h4">
                    Stop Sign
                </ModalHeader>
                <ModalBody>
                    <Input
                        type="text"
                        value={newTitle}
                        placeholder='New Stop Sign'
                        onChange={handleInputChange}
                        style={{ width: '100%', padding: '10px', marginBottom: '10px' }}
                    />

                    <Input
                        type="number"
                        value={stopSignDuration}
                        placeholder='Stop Sign Duration'
                        onChange={handleStopSingDurationChange}
                        style={{ width: '100%', padding: '10px', marginBottom: '10px' }}
                    />
                    <Input
                        type="color"
                        value={newColor}
                        placeholder='color'
                        onChange={handleColorChange}
                        style={{ width: '100%', padding: '10px', marginBottom: '10px' }}
                    />
                </ModalBody>
                <ModalFooter>
                    <Button onClick={handleSaveStopSign} style={{ marginRight: '10px' }}>Save</Button>
                    <Button onClick={handleCancelStopSign}>Cancel</Button>
                </ModalFooter>
            </Modal>
            <BoundingBoxModal
                isVisible={isModalVisible}
                handleOk={handleOk}
                handleCancel={hideBoundingBox}
            />
            <Notification
                type={notificationType}
                message={errorMessage}
                onClose={() => setErrorMessage("")}
            />
        </React.Fragment>
    );
}

export default AutoRouting;