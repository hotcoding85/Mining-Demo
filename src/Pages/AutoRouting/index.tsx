import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Container, Row, Col, Modal, ModalHeader, ModalBody, ModalFooter, Card, Button } from 'reactstrap';
import _ from 'lodash'
import * as turf from '@turf/turf';
import 'mapbox-gl/dist/mapbox-gl.css';
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css';
import { Input, Spin, Tooltip, Progress } from 'antd';
import { getRoutes } from './RoutingService';
import BoundingBoxModal from './BoundingBoxModal';
import { RouteCoordinatesType, RouteDataType, WayPointType } from './type';
import Breadcrumb from "Components/Common/Breadcrumb";
import Notification from "Components/Common/Notification";
import { addRoute, updateRoute, removeRoute, getAllVehicleRoutes } from 'slices/thunk';
import RBush from 'rbush';
import booleanPointInPolygon from '@turf/boolean-point-in-polygon';
import { useDispatch, useSelector } from "react-redux";
import { Dropdown, DropdownType } from 'Components/Common/Dropdown';
import './index.css';
import { LAYOUT_MODE_TYPES } from 'Components/constants/layout';
import * as THREE from 'three'
import BACKGROUND from '../../assets/images/3DPit/galaxy.jpg'
import BACKGROUND_LIGHT from '../../assets/images/3DPit/daysky.png'
import STOP_SIGN_PNG from 'assets/images/stop_sign.png'
import POINTER from 'assets/images/pointer.svg'
import { LineString, Point } from 'interfaces/GeoJson';
import { LayoutSelector, VehicleRouteSelector } from 'selectors';
import { THREEJSMap } from 'Pages/3DMap';
import FloatingActionButton from 'Pages/Replay/components/FloatingActionButton';
import { addOrUpdateData, getDataByKey } from 'interfaces/IDB';
import { CSS2DRenderer, CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer.js';
import FONT from 'three/examples/fonts/gentilis_bold.typeface.json'
// default route's speed limit 40km/h
const defaultSpeedLimit = 40;
// default route's line color - 'green'
const defaultColor = '#00ff00';
// fastest indexing with the large geojson file
const index = new RBush();
type ActiveObjectType = {
    tube: any
    marker: any
    animationId: any
    arrow: any;
    bufferTube: any;
    curve: any;
    points: any;
}

const AutoRouting = () => {
    // Set Page Title as a 'Auto Routing'
    document.title = "Auto Routing | FMS Live";

    const mapContainer = useRef<any>(null);
    const mapRef = useRef<any>(null);
    const [lng, setLng] = useState(120.44871814239025);
    const [lat, setLat] = useState(-29.1506602184213);
    const [drawing, setDrawing] = useState<boolean>(false);
    const [coordinates, setCoordinates] = useState<number[][]>([]);
    const [allCoordinates, setAllCoordinates] = useState<number[][][]>([]);
    const [startPoint, setStartPoint] = useState<any>(null);
    const [endPoint, setEndPoint] = useState<any>(null);
    const [wayPoints, setWayPoints] = useState<WayPointType[]>([]);
    const [pointType, setPointType] = useState<'start_point' | 'end_point' | 'way_point'>('way_point')
    const startMarker = useRef<any>(null);
    const endMarker = useRef<any>(null);
    const stopMarkers = useRef<mapboxgl.Marker[]>([]);
    const [color, setColor] = useState(defaultColor);
    const [routePoints, setRoutePoints] = useState<[number, number, number][]>([]);
    const routeMarkers = useRef<any[]>([]);
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
    const [duringAnimation, setDuringAnimation] = useState<boolean>(false)
    const pausedTimeValue = useRef<number>(0)
    const pausedTubeIndex = useRef<number>(-1)
    // state for Map loading status
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [progress, setProgress] = useState(0); // Progress state
    const [isPlaying, setIsPlaying] = useState(false);
    const currentIsPlaying = useRef<boolean>(false)
    const geojsonData = useRef<any>();

    const isDragging = useRef<boolean>(false)
    const tubeMeshes = useRef<any>([])
    const tubePoints = useRef<any>([])
    const curves = useRef<any>([])
    const tubeBufferMeshes = useRef<any>([])
    const tubeCurves = useRef<any>([])
    const stopSignSprites = useRef<any>([])
    const tempStopSign = useRef<any>(null)
    const tempTube = useRef<any>([])
    const tempMarkers = useRef<any>([])
    const newTube = useRef<any>(null)

    const segmentTubes = useRef<any>([])
    const segmentMarkers = useRef<any>([])

    const currentSpeed = useRef<number>(1)
    const [isAnimation, setIsAnimation] = useState<boolean>(false)
    const [markerToolTipContent, setMarkerToolTipContent] = useState<string>('')
    const activeObjects = useRef<ActiveObjectType>({tube: null, bufferTube: null, marker: null, animationId: null, arrow: null, curve: null, points: null});  // Store active objects like tube, marker, animation ID
    const animationRef = useRef<{startTime: number | null, elapsedTime: number, animationFrameId: number | null, animationCameraId: number | null}>({ startTime: null, elapsedTime: 0, animationFrameId: null, animationCameraId: null });
    
    const { layoutModeType } = useSelector(LayoutSelector );
    const isLight = layoutModeType === LAYOUT_MODE_TYPES.LIGHT;
    const eqMarkers = useRef<any>([])

    const dispatch: any = useDispatch()

    const layerOptions: DropdownType[] = [ 
        {label: "None", value: 'Empty'},
        {label: 'Current Haul Routes', value: 'CURRENT_HAUL_ROUTES'}, 
        {label: 'Future Road Designs', value: 'FUTURE_ROAD_DESIGNS'}, 
        {label: 'Speed Restrictions', value: 'SPEED_RESTRICTIONS'}, 
        {label: 'Pit Bottom', value: 'PIT_BOTTOM'}, 
        {label: 'Pit Climb', value: 'PIT_CLIMB'}, 
        {label: 'Stop Signs', value: 'STOP_SIGNS'}, 
        {label: 'Restricted', value: 'RESTRICTED'}, 
    ]
    
    const [currentCategory, setCurrentCategory] = useState<DropdownType>(layerOptions[0]);
    const geoFences = useRef<any>([])
    const fetchGeofences = async () => {
        const _fetchGeofences = async () => {
            const retrievedData = await getDataByKey('geoFences');
            if (retrievedData && retrievedData.length > 0) {
                geoFences.current = retrievedData
            }
            else{
                const fences = await fetch('/SWK_S01_422.geojson')
                    .then(response => response.json())  // Parse it as JSON
                    .then(data => {
                        return data;  // Return the parsed GeoJSON data
                    })
                    .catch(error => {
                        console.error('Error fetching GeoJSON:', error);
                    });
        
                if (fences) {
                    const features = fences.features;
                    
                    // Iterate over the features to access polygons or other geometry types
                    const _fences: any = []
                    _.map(features, feature => {
                        _fences.push(feature)
                    });
                    geoFences.current = _fences
                    await addOrUpdateData('geoFences', _fences);
                }
            }
        }
        await _fetchGeofences()
    }
    
    const { vehicleRoutes } = useSelector(VehicleRouteSelector);
    useEffect(() => {
        if (vehicleRoutes && window.map){
            while(stopMarkers.current.length > 0) {
                stopMarkers.current.pop()?.remove()
            }
            const _routes = vehicleRoutes.filter(_route => _route.geoJson && _route.geoJson.geometry)
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

            drawInitalRoutes()
        }
    }, [vehicleRoutes])

    useEffect(() => {
        if (!mapContainer) return
        dispatch(getAllVehicleRoutes())
    }, [dispatch])

    useEffect(() => {   
        font.current = new THREE.Font(FONT);
        fetchGeofences()     
        // Clean up on component unmount
        return () => {
            map && map.clean()
            if (animationFrameId) {
                cancelAnimationFrame(animationFrameId);
            }
    
            // Dispose Three.js objects
            if (geojsonData.current) {
                geojsonData.current = null;
            }
    
            // Clean up map and controls
            if (window.mapPicker) {
                window.mapPicker = null;
            }
            if (window.map) {
                window.map = null;
            }
            if (window.controls) {
                window.controls.dispose();
            }
            // Clean up Three.js objects
            if (mapContainer.current && mapContainer.current.firstChild) {
                mapContainer.current.removeChild(mapContainer.current.firstChild);
            }
        };
    }, []);

    let animationFrameId: number;
    let map: any;
    const currentAnimationMarker = useRef<any>(null)
    const NextCameraPoistion = useRef<any>(null)
    const forwardDirection = useRef<any>(null)
    const [viewType, setViewType] = useState<string>("TOP")
    const currentViewType = useRef<string>(viewType)
    const updateMarkerTooltip = useCallback((point) => {
        if (!mapContainer.current || !NextCameraPoistion.current || !window.map) return
        const _point = point
        const mapContainerElement = mapContainer.current.getMapContainer();
        const screenPoint = _point.clone().project(window.camera);
        const x = (screenPoint.x * 0.5 + 0.5) * (mapContainerElement.clientWidth);
        const y = -(screenPoint.y * 0.5 - 0.5) * (mapContainerElement.clientHeight);
        const annotationDiv = document.getElementById(`marker-tooltip`);
        if (annotationDiv) {
            let _x = x, _y = y;
            switch (currentViewType.current) {
                case 'TOP':
                    _y = _y - 200
                    _x -= 60
                    break;
                case 'FRONT':
                    _y = _y - 120
                    _x += 90
                    break;
                case 'LEFT':
                    _x = _x - 30
                    _y = _y - 260
                    break;
                case 'RIGHT':
                    _x = _x - 30
                    _y = _y - 260
                    break;
                case 'BACK':
                    _y = _y - 130
                    _x += 80 
                    break;
                default:
                    break;
            }
            annotationDiv.style.left = `${_x}px`;
            annotationDiv.style.top = `${_y}px`;
        }
    }, [isAnimation]);

    useEffect(() => {
        currentViewType.current = viewType
        if (!window.camera || !NextCameraPoistion.current) return
        window.camera.zoom = 1
        let cameraOffset = new THREE.Vector3();
        forwardDirection.current = new THREE.Vector3().subVectors(NextCameraPoistion.current, currentAnimationMarker.current).normalize();
        const forwardDirectionNormalized = forwardDirection.current.clone().normalize();
        const rightDirection = new THREE.Vector3(0, 0, 1).cross(forwardDirectionNormalized).normalize();
        // Adjust the camera based on viewType
        switch (currentViewType.current) {
            case 'TOP':
                cameraOffset = new THREE.Vector3(0, 0, 120);  // Camera from above (Top view)
                break;
            case 'FRONT':
                cameraOffset = forwardDirection.current.clone().multiplyScalar(100);  // Camera in front of the marker (Truck)
                break;
            case 'LEFT':
                // Move the camera to the left of the truck using the rightDirection vector (negated for the left side)
                cameraOffset = rightDirection.clone().multiplyScalar(80);  // Camera from the left side
                cameraOffset.z += 10;  // Optionally adjust height
                break;
            case 'RIGHT':
                // Move the camera to the right of the truck using the rightDirection vector
                cameraOffset = rightDirection.clone().multiplyScalar(-80);  // Camera from the right side
                cameraOffset.z += 10;  // Optionally adjust height
                break;
            case 'BACK':
                cameraOffset = forwardDirection.current.clone().multiplyScalar(-100);  // Camera from behind the marker
                break;
            default:
                // Default camera behavior if viewType is not defined (use 'Top' view)
                cameraOffset = new THREE.Vector3(0, 0, 120);  // Camera from above (Top view)
        }
        // Set the camera position behind the marker (car)
        const cameraPosition = new THREE.Vector3().copy(currentAnimationMarker.current).add(cameraOffset);
        window.camera.position.set(cameraPosition.x, cameraPosition.y, cameraPosition.z + 30);
        // Interpolate the lookAt position for smooth transition
        window.camera.lookAt(NextCameraPoistion.current);
        window.savedCameraPosition = window.camera.position.clone();
        window.savedCameraQuaternion = window.camera.quaternion.clone();
        currentAnimationMarker.current && updateMarkerTooltip(currentAnimationMarker.current)
    }, [viewType, currentAnimationMarker])

    useEffect(() => {
        if (!window.map) return
        if (isLight) {
            const loader = new THREE.TextureLoader();
            loader.load(BACKGROUND_LIGHT, (texture) => {
                window.map.scene.background = texture;  // Set the loaded texture as the background
            });
        }
        else{
            const loader = new THREE.TextureLoader();
            loader.load(BACKGROUND, (texture) => {
                window.map.scene.background = texture;  // Set the loaded texture as the background
            });
        }
    }, [isLight])

    const font = useRef<any>(null)
    useEffect(() => {
        if (!window.map || isLoading) return;
        const labelRenderer = new CSS2DRenderer();
        document.body.appendChild(labelRenderer.domElement);
        drawInitalRoutes()

        window.controls && window.controls.addEventListener('change', () => {
            const cameraPositionZ = window.map.camera.position.z;
            tubeMeshes.current.map(_tube => {
                const tube = _tube.value
                const index = _tube.index
                // Camera Z value range (400 -> 1000)
                const minZ = 600;
                const maxZ = 2500;
        
                // Tube width range (8 -> 36)
                const minWidth = 4;
                const maxWidth = 27;
                let normalizedWidth;
                // Linearly interpolate camera's Z position to adjust tube width
                if (cameraPositionZ <= minZ) {
                    normalizedWidth = minWidth;
                }
                // If the camera's Z is greater than or equal to 1000, set the width to 36
                else if (cameraPositionZ >= maxZ) {
                    normalizedWidth = maxWidth;
                } 
                // Otherwise, interpolate the width based on the camera's Z position
                else {
                    normalizedWidth = THREE.MathUtils.mapLinear(cameraPositionZ, minZ, maxZ, minWidth, maxWidth);
                }
        
                // Update the tube's geometry with the new width
                tube.geometry = new THREE.TubeGeometry(
                    curves.current.find(curve => curve.index === index).value, 
                    tubePoints.current.find(points => points.index === index).value.length * 10, 
                    normalizedWidth, 
                    4, 
                    false
                );
            })
        });
    }, [isLoading])

    const drawInitalRoutes = useCallback(() => {
        // remove exsiting routes and markers
        if (tubeMeshes.current.length > 0) {
            _.map(tubeMeshes.current, _tube => {
                window.map.scene.remove(_tube.value)
                _tube.value.geometry.dispose()
                _tube.value.material.dispose()
            })
        }
        if (tubeBufferMeshes.current.length > 0) {
            _.map(tubeBufferMeshes.current, _tube => {
                window.map.scene.remove(_tube.value)
                _tube.value.geometry.dispose()
                _tube.value.material.dispose()
            })
        }
        if (tempMarkers.current.length > 0) {
            _.map(tempMarkers.current, _marker => {
                window.map.scene.remove(_marker)
                _marker.geometry.dispose()
                _marker.material.dispose()
            })
        }
        if (stopSignSprites.current.length > 0) {
            _.map(stopSignSprites.current, _stop => {
                window.map.scene.remove(_stop)
                _stop.geometry.dispose()
                _stop.material.dispose()
            })
        }
        if (routeNameTubes.current.length > 0) {
            _.map(routeNameTubes.current, _marker => {
                window.map.scene.remove(_marker.tube)
                _marker.tube.geometry.dispose()
                _marker.tube.material.dispose()
            })
        }
        routeNameTubes.current = []
        tubeMeshes.current = [] 
        tubeBufferMeshes.current = []
        stopSignSprites.current = []
        tempMarkers.current = []
        tubeCurves.current = []
        curves.current = []
        tubePoints.current = []
        // Get the top-left corner's tile coordinates (view's origin)
        const center = {
            tileX: window.map.center.x,
            tileY: window.map.center.y
        }
        const _routes = vehicleRoutes.filter(_route => _route.geoJson && _route.geoJson.geometry)
        _.map(_routes, (_route) => {
            if (_route.category !== 'STOP_SIGNS') {
                const points: any = [];
                const coordinates = (_route.geoJson.geometry as LineString).coordinates;
                // Loop over each coordinate and calculate its pixel position relative to the current view
                for (let i = 0; i < coordinates.length; i++) {
                    const lat = coordinates[i][1]; // Latitude
                    const lng = coordinates[i][0]; // Longitude

                    // Convert lat/lng to tile pixel
                    const tilePixel = window.map.convertGeoToPixel(lat, lng, window.map.zoom);
                    const tileX = tilePixel.tileX;          // tile X coordinate of the point
                    const tileY = tilePixel.tileY;          // tile Y coordinate of the point
                    const tilePixelX = tilePixel.tilePixelX; // pixel X position inside the tile
                    const tilePixelY = tilePixel.tilePixelY; // pixel Y position inside the tile

                    const worldPos = window.map.calculateWorldPosition(center, tileX, tileY, tilePixelX, tilePixelY, 512);
                    // Create a THREE.Vector3 using view-relative pixel coordinates
                    const point = new THREE.Vector3(worldPos.x, worldPos.y, 0);
                    let elevationValue = 0
                    elevationValue = window.map.getElevationAt([tilePixelX, tilePixelY], tileX, tileY);
                    point.z = elevationValue * 2
                    let exist = false
                    _.map(tempMarkers.current, _marker => {
                        if (_marker.userData.coord[0] === lng && _marker.userData.coord[1] === lat) {
                            exist = true
                            return;
                        }
                    })
                    _.map(stopSignData.current, (_stop: any) => {
                        let coord = _stop.geoJson.geometry.coordinates[0]
                        if (coord[0] === lng && coord[1] === lat) {
                            exist = true
                            return;
                        }
                    })
                    if (!exist) {
                        // Create a sprite or mesh for the image
                        const imageTexture = new THREE.TextureLoader().load(POINTER); // Load your image
                        const spriteMaterial = new THREE.SpriteMaterial({ map: imageTexture });
                        const sprite = new THREE.Sprite(spriteMaterial);
                        
                        sprite.position.set(worldPos.x, worldPos.y, (elevationValue * 2 + 10));
                        sprite.scale.set(20, 20, 1);
                        sprite.renderOrder = 999
                        sprite.userData = { isPointer: true, coord: coordinates[i] };
                        // Add the sprite to the scene
                        window.map.scene.add(sprite);
                        tempMarkers.current.push(sprite)
                    }
                    // Get the elevation for this point and set the Z coordinate
                    points.push(point);
                }
                // Create text geometry
                const textGeometry = new THREE.TextGeometry(_route.name || 'Route Name', {
                    font: font.current,
                    size: 8,
                    height: 0.1,
                    curveSegments: 12,
                    bevelEnabled: false,
                });

                for (let i = 0; i < points.length - 1; i++) {
                    const start = new THREE.Vector3(points[i].x, points[i].y, points[i].z);
                    const end = new THREE.Vector3(points[i + 1].x, points[i + 1].y, points[i + 1].z);
                
                    // Calculate the distance between the start and end points
                    const distance = start.distanceTo(end);
                    
                    // Skip this segment if the distance is less than 100
                    if (distance < 100) {
                        continue;
                    }
                    
                    const textMaterial = new THREE.MeshBasicMaterial({ 
                        color: '#212529', 
                        transparent: true, 
                        depthTest: false,
                        depthWrite: false,
                        side: THREE.DoubleSide // Make text visible from both sides
                    })
                    const textMesh = new THREE.Mesh(textGeometry, textMaterial)

                    // Calculate direction vector
                    const direction = new THREE.Vector3().subVectors(end, start).normalize()

                    // Position text at the middle of the segment
                    const midpoint = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5)
                    textMesh.position.copy(midpoint)

                    // Orient text to align with the camera's up vector
                    const cameraUp = new THREE.Vector3(0, 0, 1) // Matches the camera.up setting
                    textMesh.up.copy(cameraUp)

                    // Make text face the camera position
                    // textMesh.lookAt(window.map.camera.position)

                    // Rotate text to align with route direction
                    textMesh.rotateOnAxis(cameraUp, Math.atan2(direction.y, direction.x))

                    // Center the text on the line
                    // textGeometry.computeBoundingBox()
                    // const textWidth = textGeometry.boundingBox!.max.x - textGeometry.boundingBox!.min.x
                    // textMesh.position.add(new THREE.Vector3(0, 0, textWidth / 2))

                    // Add to the scene
                    textMesh.renderOrder = 9999
                    window.map.scene.add(textMesh)
                    routeNameTubes.current.push({tube: textMesh, route_id: _route.id})
                }

                // Create a curve from the points for TubeGeometry
                const curve = new THREE.CatmullRomCurve3(points);
                tubeCurves.current.push({curve: curve, name: _route.name})
                let normalizedWidth;
                const cameraPositionZ = window.map.camera.position.z;
                // Camera Z value range (400 -> 1000)
                const minZ = 600;
                const maxZ = 2500;
        
                // Tube width range (8 -> 36)
                const minWidth = 4;
                const maxWidth = 27;
                // Linearly interpolate camera's Z position to adjust tube width
                if (cameraPositionZ <= minZ) {
                    normalizedWidth = minWidth;
                }
                // If the camera's Z is greater than or equal to 1000, set the width to 36
                else if (cameraPositionZ >= maxZ) {
                    normalizedWidth = maxWidth;
                } 
                // Otherwise, interpolate the width based on the camera's Z position
                else {
                    normalizedWidth = THREE.MathUtils.mapLinear(cameraPositionZ, minZ, maxZ, minWidth, maxWidth);
                }
                // Tube Geometry parameters: path, tubular segments, radius, radial segments, closed
                const tubeGeometry = new THREE.TubeGeometry(curve, 100, normalizedWidth, 4, false);

                // Create the tube material with color from _route.color
                const tubeMaterial = new THREE.MeshBasicMaterial({ color: _route.color, opacity: 0.8, transparent: true, depthTest: false, depthWrite: true });
                // Create the tube mesh
                const tubeMesh = new THREE.Mesh(tubeGeometry, tubeMaterial);
                
                tubeMesh.userData = { isRoute: true, id: _route.id };

                const tubeBufferMesh = createTubeBuffer(points, 'black');
                
                // Add the tube mesh to the scene
                tubeMeshes.current.push({
                    index: _route.id,
                    value: tubeMesh
                })
                tubeBufferMeshes.current.push({
                    index: _route.id,
                    value: tubeBufferMesh
                })
                tubeMesh.renderOrder = 2
                tubeBufferMesh.renderOrder = 1
                window.map.scene.add(tubeMesh);
                window.map.scene.add(tubeBufferMesh);

                curves.current.push({
                    index: _route.id,
                    value: curve
                })
                tubePoints.current.push({
                    index: _route.id,
                    value: points
                })
            } else {
                // Handle the STOP_SIGNS category by showing an image at the point
                const coordinates = (_route.geoJson.geometry as LineString).coordinates
                if (coordinates.length === 1) { // Assuming there's only one point for STOP_SIGNS
                    const lat = coordinates[0][1];
                    const lng = coordinates[0][0];

                    // Convert lat/lng to tile pixel
                    const tilePixel = window.map.convertGeoToPixel(lat, lng, window.map.zoom);
                    const tileX = tilePixel.tileX;          // tile X coordinate of the point
                    const tileY = tilePixel.tileY;          // tile Y coordinate of the point
                    const tilePixelX = tilePixel.tilePixelX; // pixel X position inside the tile
                    const tilePixelY = tilePixel.tilePixelY; // pixel Y position inside the tile

                    const worldPos = window.map.calculateWorldPosition(center, tileX, tileY, tilePixelX, tilePixelY, 512);

                    // Create a sprite or mesh for the image
                    const imageTexture = new THREE.TextureLoader().load(STOP_SIGN_PNG); // Load your image
                    const spriteMaterial = new THREE.SpriteMaterial({ map: imageTexture });
                    const sprite = new THREE.Sprite(spriteMaterial);

                    let elevationValue = 0
                    elevationValue = window.map.getElevationAt([tilePixelX, tilePixelY], tileX, tileY);
                    sprite.position.set(worldPos.x, worldPos.y, (elevationValue * 2 + 10));
                    sprite.scale.set(30, 30, 1);
                    sprite.renderOrder = 999
                    sprite.userData = { isStopSign: true, id: _route.id };
                    // Add the sprite to the scene
                    window.map.scene.add(sprite);

                    // Optionally, you can push this into an array like `this.tubeMeshes` if you want to toggle its visibility later
                    stopSignSprites.current.push(sprite);
                }
            }
        });

        // initally hide all tempmarkers
        _.map(tempMarkers.current, _marker => {
            _marker.visible = false
        })
    }, [vehicleRoutes])

    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const currentDrawingStatus = useRef<boolean>(false)

    useEffect(() => {
        currentDrawingStatus.current = drawing
    }, [drawing])

    const currentStopsignStatus = useRef<boolean>(false)

    useEffect(() => {
        currentStopsignStatus.current = isStopSign
    }, [isStopSign])

    const currentPointtype = useRef<string>('')

    useEffect(() => {
        currentPointtype.current = pointType
    }, [pointType])

    const onDocumentMouseClick = useCallback((event) => {
        if (!mapContainer.current || !window.map) return;
        // Use the getMapContainer method from the child component to access the div
        const mapContainerElement = mapContainer.current.getMapContainer();

        // Make sure mapContainerElement is not null
        if (!mapContainerElement) return;

        const containerBounds = mapContainerElement.getBoundingClientRect(); // Use getBoundingClientRect
        mouse.x = ((event.clientX - containerBounds.left) / containerBounds.width) * 2 - 1;
        mouse.y = -((event.clientY - containerBounds.top) / containerBounds.height) * 2 + 1;

        // Update the raycaster with the camera and mouse position
        raycaster.setFromCamera(mouse, window.map.camera);

        // Intersect objects in the scene
        const intersects = raycaster.intersectObjects(window.map.scene.children, true);

        const center = {
            tileX: window.map.center.x,
            tileY: window.map.center.y
        }

        // Cast a ray from the camera to the clicked position
        if (intersects.length > 0) {
            for (let i = 0; i < intersects.length; i++) {
                const intersectedObject = intersects[i].object;
                // Get the first intersection point
                let realWorldPosition = intersects[i].point;
                if (currentDrawingStatus.current && !isDragging.current) {
                    let {tileX, tileY, tilePixelX, tilePixelY} = window.map.convertXYToPixel(realWorldPosition.x, realWorldPosition.y)
                    let {latitude, longitude} = window.map.convertTileToGeo(tileX, tileY, tilePixelX, tilePixelY)
                    const newCoords = [longitude, latitude]
                    const proximityThreshold1 = 0.0001; // Adjust this value as per your proximity requirement
                    const proximityThreshold2 = 0.00003;
                    const prevPoint = coordinates.length > 0 ? coordinates[coordinates.length - 1] : null;
                    if (isNearPreviousPoint(newCoords as [number, number], prevPoint as [number, number], 0.0001)) {
                        setNotificationType('warning')
                        setErrorMessage('The point is too closer with previous point!')
                        return;
                    }
                    // if it's the first point, choose the existing point near by newCoords
                    let _newCoords = isNearExistingPoint(newCoords as [number, number], !prevPoint ? proximityThreshold1 : proximityThreshold2);
                    if (!!_newCoords) {
                        newCoords[0] = _newCoords[0]
                        newCoords[1] = _newCoords[1]
                        const tileData = window.map.convertGeoToPixel(newCoords[1], newCoords[0])
                        const tileX = tileData.tileX;          // tile X coordinate of the point
                        const tileY = tileData.tileY;          // tile Y coordinate of the point
                        const tilePixelX = tileData.tilePixelX; // pixel X position inside the tile
                        const tilePixelY = tileData.tilePixelY; // pixel Y position inside the tile
                        
                        const worldPos = window.map.calculateWorldPosition(center, tileX, tileY, tilePixelX, tilePixelY, 512);
                        let elevationValue = window.map.getElevationAt([tilePixelX, tilePixelY], tileX, tileY);
                        realWorldPosition = new THREE.Vector3(worldPos.x, worldPos.y, 0);
                        realWorldPosition.z = elevationValue * 2 + 3
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
                        }
                        setRoutePoints([...routePoints, [...(newCoords as [number, number]), defaultSpeedLimit]]);
                        const imageTexture1 = new THREE.TextureLoader().load(POINTER); // Load your image
                        const spriteMaterial1 = new THREE.SpriteMaterial({ map: imageTexture1, color: 'blue' });
                        const _routePointMarker = new THREE.Sprite(spriteMaterial1);
                        let elevation = realWorldPosition.z + 3
                        _routePointMarker.position.set(realWorldPosition.x, realWorldPosition.y, elevation);
                        _routePointMarker.scale.set(10, 10, 1);
                        _routePointMarker.renderOrder = 999
                        _routePointMarker.userData = {isRoutePoint: true, point: realWorldPosition}
                        // Add the sprite to the scene
                        window.map.scene.add(_routePointMarker);
                        routeMarkers.current.push(_routePointMarker)
                        if (routeMarkers.current.length > 1) 
                            drawTempRoute()
                        return updatedCoordinates;
                    });
                    return
                }
                if (currentPointtype.current === 'start_point'){
                    !intersectedObject.userData.isRoutePoint && addMarker(realWorldPosition, 'start')
                    return;
                }
                else if(currentPointtype.current === 'end_point') {
                    !intersectedObject.userData.isRoutePoint && addMarker(realWorldPosition, 'end')
                    return
                }
                else if (currentStopsignStatus.current && intersectedObject.userData && intersectedObject.userData.isPointer) {
                    addMarker(realWorldPosition, 'stop')
                    setNewTitle("New Stop Sign" + Date.now())
                    setNewColor('#ff0000')
                    setEditingRouteId(null)
                    setIsStopSignModalOpen(true)
                    setStopSignPoint(intersectedObject.userData.coord)
                    return;
                }
            }
        }
    }, [isStopSign, drawing, pointType, coordinates, isDragging])

    const onDocumentMouseDblClick = (event) => {
        if (!mapContainer.current || !window.map) return;
        
        // Use the getMapContainer method from the child component to access the div
        const mapContainerElement = mapContainer.current.getMapContainer();

        // Make sure mapContainerElement is not null
        if (!mapContainerElement) return;

        const containerBounds = mapContainerElement.getBoundingClientRect(); // Use getBoundingClientRect
        mouse.x = ((event.clientX - containerBounds.left) / containerBounds.width) * 2 - 1;
        mouse.y = -((event.clientY - containerBounds.top) / containerBounds.height) * 2 + 1;

        // Update the raycaster with the camera and mouse position
        raycaster.setFromCamera(mouse, window.map.camera);

        // Intersect objects in the scene
        const intersects = raycaster.intersectObjects(window.map.scene.children, true);
        if (intersects.length > 0) {
            for (let i = 0; i < intersects.length; i++) {
                const intersectedObject = intersects[i].object;
                if (intersectedObject.userData && (intersectedObject.userData.isStopSign || intersectedObject.userData.isRoute)) {
                    if (intersectedObject.userData.isStopSign) {
                        let realWorldPosition = intersectedObject.position

                        const layerId = intersectedObject.userData.id
                        const realRoutes = vehicleRoutes.filter(_route => _route.category === 'STOP_SIGNS')
                        const _route = _.find(realRoutes, route => route.id === layerId);
                        if (!_route) return;
                        setEditingRouteId(_route.id);
                        setNewTitle(_route.name ? _route.name : '');
                        setNewColor(_route.color)
                        setIsStopSignModalOpen(true);
                        setStopSignDuration(_route.duration)
                        break
                    }
                    if (intersectedObject.userData.isRoute){
                        const layerId = intersectedObject.userData.id
                        const realRoutes = vehicleRoutes.filter(_route => _route.category !== 'STOP_SIGNS')
                        const _route = _.find(realRoutes, route => route.id === layerId);
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
                        break
                    }
                }
            }
        }
    }

    const drawTempRoute = useCallback(() => {
        if (!window.map) return
        if (newTube.current) {
            window.map.scene.remove(newTube.current)
            newTube.current.geometry.dispose();  // Clean up resources
            newTube.current.material.dispose();
            newTube.current = null;
        }
        if (routeMarkers.current.length > 1) {
            const pointsArray: THREE.Vector3[] = routeMarkers.current.map((marker) => {
                return marker.userData.point; // Clone the position to avoid reference issues
            });
            // Create a curve from the points for TubeGeometry
            const curve = new THREE.CatmullRomCurve3(pointsArray);

            // Tube Geometry parameters: path, tubular segments, radius, radial segments, closed
            const tubeGeometry = new THREE.TubeGeometry(curve, 100, 3, 3, false);

            // Create the tube material with color from _route.color
            const tubeMaterial = new THREE.MeshBasicMaterial({ color: color, opacity: 0.6, transparent: true, depthTest: false, depthWrite: false });
            // Create the tube mesh
            const _newTube = new THREE.Mesh(tubeGeometry, tubeMaterial);
            window.map.scene.add(_newTube)
            newTube.current = _newTube
        }
        else if (routeMarkers.current.length === 1) {
            let lastMaker = routeMarkers.current.pop()
            window.map.scene.remove(lastMaker)
            lastMaker.geometry.dispose()
            lastMaker.material.dispose() 
        }
    }, [routeMarkers.current])

    const isNearPreviousPoint = (coords: [number, number], prevCoords: [number, number] | null, threshold: number) => {
        if (!prevCoords) return false;
        const distance = Math.sqrt(Math.pow(prevCoords[0] - coords[0], 2) + Math.pow(prevCoords[1] - coords[1], 2));
        return distance < threshold;
    }

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
    }, [routeAllMarkers, coordinates])

    const addMarker = useCallback((position: THREE.Vector3, type: 'start' | 'end' | 'stop', color?: string) => {
        if (window.map) {
            const _color = color ? color : type == 'start' ? 'green' : 'red'
            switch (type) {
                case 'start':
                    if (startMarker.current) {
                        // remove existing start point
                        window.map.scene.remove(startMarker.current);
                        startMarker.current.geometry.dispose();  // Clean up resources
                        startMarker.current.material.dispose();
                        startMarker.current = null;
                    }
                    // Create a sprite or mesh for the image
                    const imageTexture1 = new THREE.TextureLoader().load(POINTER); // Load your image
                    const spriteMaterial1 = new THREE.SpriteMaterial({ map: imageTexture1, color: _color });
                    const _startPointMarker = new THREE.Sprite(spriteMaterial1);
                    let elevation = position.z + 15
                    _startPointMarker.position.set(position.x, position.y, elevation);
                    _startPointMarker.scale.set(30, 30, 1);
                    _startPointMarker.renderOrder = 999
                    _startPointMarker.userData = {isRoutePoint: true}
                    // Add the sprite to the scene
                    window.map.scene.add(_startPointMarker);
                    startMarker.current = _startPointMarker

                    let {tileX, tileY, tilePixelX, tilePixelY} = window.map.convertXYToPixel(position.x, position.y)
                    let {latitude, longitude} = window.map.convertTileToGeo(tileX, tileY, tilePixelX, tilePixelY)

                    setStartPoint([longitude, latitude])
                    break;
                case 'end':
                    if (endMarker.current) {
                        // remove existing start point
                        window.map.scene.remove(endMarker.current);
                        endMarker.current.geometry.dispose();  // Clean up resources
                        endMarker.current.material.dispose();
                        endMarker.current = null;
                    }
                    // Create a sprite or mesh for the image
                    const imageTexture2 = new THREE.TextureLoader().load(POINTER); // Load your image
                    const spriteMaterial2 = new THREE.SpriteMaterial({ map: imageTexture2, color: _color });
                    const _endPointMarker = new THREE.Sprite(spriteMaterial2);
                    let elevation1 = position.z + 15
                    _endPointMarker.position.set(position.x, position.y, elevation1);
                    _endPointMarker.scale.set(30, 30, 0);
                    _endPointMarker.renderOrder = 999
                    _endPointMarker.userData = {isRoutePoint: true}
                    // Add the sprite to the scene
                    window.map.scene.add(_endPointMarker)
                    endMarker.current = _endPointMarker
                    const tileData = window.map.convertXYToPixel(position.x, position.y)
                    const coord = window.map.convertTileToGeo(tileData.tileX, tileData.tileY, tileData.tilePixelX, tileData.tilePixelY)
                    setEndPoint([coord.longitude, coord.latitude])
                    break;
                case 'stop':
                    // Create a sprite or mesh for the image
                    const imageTexture = new THREE.TextureLoader().load(STOP_SIGN_PNG); // Load your image
                    const spriteMaterial = new THREE.SpriteMaterial({ map: imageTexture });
                    const sprite = new THREE.Sprite(spriteMaterial);
                    let elevation2 = position.z + 10
                    sprite.position.set(position.x, position.y, elevation2);
                    sprite.scale.set(25, 25, 1);
                    sprite.renderOrder = 1
                    // Add the sprite to the scene
                    window.map.scene.add(sprite);
                    tempStopSign.current = sprite
                    break;
                default:
                    break;
            }

        }
    }, [startPoint, endPoint, wayPoints, pointType, drawing])

    const handleUndo = useCallback(() => {
        setCoordinates((prevCoords) => {
            if (prevCoords.length === 0) {
                return prevCoords;
            }

            const updatedCoordinates = prevCoords.slice(0, -1);

            if (mapContainer.current) {
                // Remove the last route marker
                const lastMarker = routeMarkers.current.pop();
                window.map.scene.remove(lastMarker)
                lastMarker.geometry.dispose()
                lastMarker.material.dispose()
                drawTempRoute()
            }

            return updatedCoordinates;
        });

        setRoutePoints((prevPoints) => prevPoints.slice(0, -1));
    }, [coordinates]);

    const clearRoute = useCallback(() => {
        if (!window.map) return
        if (routeMarkers.current.length > 0) {
            _.map(routeMarkers.current, _marker => {
                window.map.scene.remove(_marker)
                _marker.geometry.dispose()
                _marker.material.dispose()
            })
        }
        if (newTube.current) {
            window.map.scene.remove(newTube.current)
            newTube.current.geometry?.dispose()
            newTube.current.material?.dispose()
            newTube.current = null
        }
        
        routeMarkers.current = [];
        setRoutePoints([])
        setCoordinates([])
    }, [])

    const saveRoute = useCallback(async () => {
        if (!mapContainer.current) return;
        if (coordinates.length > 1) {
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
                    name: 'New Route ' + Date.now(),
                    category: "CURRENT_HAUL_ROUTES"
                };

                setCurrentCategory(layerOptions[0])
                setEditingRouteId(null);
                setNewTitle('New Route ' + Date.now());
                setSpeedLimit(defaultSpeedLimit);
                setNewColor(color)
                setIsModalOpen(true);
                
                // setNotificationType('success')
                // setErrorMessage('New Route saved successfully!')
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
            if (route.category !== 'STOP_SIGNS') {
                const tubeMeshData = tubeMeshes.current.find(({ value }) => value.userData.id === route.id);
                if (tubeMeshData) {
                    const tubeMesh = tubeMeshData.value;
                    tubeMesh.material.color.set(newColor);
                    window.map.scene.remove(tubeMesh);
                    tubeMesh.geometry.dispose();  // Clean up resources
                    tubeMesh.material.dispose();
                }
                const updatedtubeMeshes = _.filter(tubeMeshes.current, _tube => _tube.index !== route.id)
                tubeMeshes.current = updatedtubeMeshes
            }
            else{
                _.map(stopSignSprites.current, _stop => {
                    if (_stop.userData.id === route.id) {
                        window.map.scene.remove(_stop)
                        if (_stop.material) _stop.material.dispose();
                        if (_stop.geometry) _stop.geometry.dispose();

                    }
                })
                const updatedtempMarkers = _.filter(stopSignSprites.current, _stop => _stop.id !== route.id)
                stopSignSprites.current = updatedtempMarkers

                if (!route.geoJson || !route.geoJson.geometry || !(route.geoJson.geometry as LineString).coordinates) return
                const imageTexture = new THREE.TextureLoader().load(POINTER); // Load your image
                const spriteMaterial = new THREE.SpriteMaterial({ map: imageTexture });
                const sprite = new THREE.Sprite(spriteMaterial);

                const center = {
                    tileX: window.map.center.x,
                    tileY: window.map.center.y
                }

                const lat = (route.geoJson.geometry as LineString).coordinates[0][1]; // Latitude
                const lng = (route.geoJson.geometry as LineString).coordinates[0][0]; // Longitude

                // Convert lat/lng to tile pixel
                const tilePixel = window.map.convertGeoToPixel(lat, lng, window.map.zoom);
                const tileX = tilePixel.tileX;          // tile X coordinate of the point
                const tileY = tilePixel.tileY;          // tile Y coordinate of the point
                const tilePixelX = tilePixel.tilePixelX; // pixel X position inside the tile
                const tilePixelY = tilePixel.tilePixelY; // pixel Y position inside the tile

                const worldPos = window.map.calculateWorldPosition(center, tileX, tileY, tilePixelX, tilePixelY, 512);
                let elevationValue = 0
                elevationValue = window.map.getElevationAt([tilePixelX, tilePixelY], tileX, tileY);
                sprite.position.set(worldPos.x, worldPos.y, (elevationValue * 2 + 10));
                sprite.scale.set(20, 20, 1);
                sprite.renderOrder = 999;
                sprite.userData = { isPointer: true, coord: (route.geoJson.geometry as LineString).coordinates[0] };
                
                window.map.scene.add(sprite);
                tempMarkers.current.push(sprite);
            }
            setNotificationType('success')
            setErrorMessage(route.name + ' removed successfully!')
        } catch (error) {
            console.log(error)
        }
    }, [routeData, routeAllMarkers, mapRef, dispatch, notificationType])

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

    const replayArrowTubes = useRef<any>([])
    const routeNameTubes = useRef<any>([])
    const replayTubes = useRef<any>([])

    const clearAnimation = () => {
        setIsAnimation(false)
        // Remove previous route
        if (activeObjects.current && activeObjects.current.tube) {
            window.map.scene.remove(activeObjects.current.tube);
            activeObjects.current.tube.geometry.dispose();  // Clean up resources
            activeObjects.current.tube.material.dispose();
            activeObjects.current.tube = null;
        }
        if ( activeObjects.current && activeObjects.current.marker) {
            window.TruckObject.visible = false
        }
        if ( activeObjects.current && activeObjects.current.arrow) {
            window.map.scene.remove(activeObjects.current.arrow);
            activeObjects.current.arrow = null;
        }

        // Reset any previous animation
        if (activeObjects.current && activeObjects.current.animationId) {
            cancelAnimationFrame(activeObjects.current.animationId);
            activeObjects.current.animationId = null;
        }
        if (animationRef.current.animationFrameId) {
            cancelAnimationFrame(animationRef.current.animationFrameId);
            animationRef.current.animationFrameId = null
        }
        if (animationRef.current.animationCameraId) {
            cancelAnimationFrame(animationRef.current.animationCameraId);
            animationRef.current.animationCameraId = null
        }

        if (segmentTubes.current.length > 0) {
            segmentTubes.current.map(tube => {
                if (!tube) return
                window.map.scene.remove(tube)
                tube.geometry.dispose();
                tube.material.dispose();
            })
        }
        segmentTubes.current = []
        segmentMarkers.current = []
    }

    // Function to create a tube with custom shader to control visibility
    function createTubeWithFootprint(curve, accumulatedPoints, color, tubularSegments) {
        const tubeGeometry = new THREE.TubeGeometry(curve, accumulatedPoints.length * 10, 6, 6, false);
    
        // Calculate the length of the tube curve
        const tubeLength = curve.getLength();
    
        // Shader material with progress uniform to control visibility
        const tubeMaterial = new THREE.ShaderMaterial({
            uniforms: {
                progress: { value: 0.0 },  // Controls how much of the tube is revealed
                tubeColor: { value: new THREE.Color(color) },  // Uniform for tube color
            },
            vertexShader: `
                varying float vProgressAlongTube;
                void main() {
                    // Use the UV coordinate along the tube's length to track progress
                    vProgressAlongTube = uv.x;
                    
                    // Standard vertex position transformation
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                varying float vProgressAlongTube;
                uniform float progress;
                uniform vec3 tubeColor;
                
                void main() {
                    // Reveal the tube only up to the current progress point
                    if (vProgressAlongTube <= progress) {
                        gl_FragColor = vec4(tubeColor, 1.0);  // Show tube color if within progress
                    } else {
                        discard;  // Hide the part of the tube ahead of the marker
                    }
                }
            `,
            transparent: true,
            depthWrite: false,
            depthTest: false,
        });
    
        const tube = new THREE.Mesh(tubeGeometry, tubeMaterial);
        return tube;
    }

    function createTubeBuffer(points, color) {
        points.map(point => {
            point.z = point.z + 4
        })
        const curve = new THREE.CatmullRomCurve3(points);
        const extrudeSettings = {
            steps: 100,
            extrudePath: curve,
            color: 'grey',
        };
        const roadWidth = 36 / 100;
        const shape = new THREE.Shape([
            new THREE.Vector2(-roadWidth / 2, -27),
            new THREE.Vector2(roadWidth / 2, -27),
            new THREE.Vector2(roadWidth / 2, 27), // Extend forward
            new THREE.Vector2(-roadWidth / 2, 27),
        ]);
        const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    
        
        const tubeMaterial = new THREE.MeshStandardMaterial({ color: 'grey', depthWrite: false, transparent: true, opacity: 0.7, depthTest: false });
        const ellipticalTubeMesh = new THREE.Mesh(geometry, tubeMaterial);
        return ellipticalTubeMesh;
    }

    const drawRoute = useCallback((_saving_data, totalTime, distance, animation = true, stopSignDuration = 0): RouteDataType => {
        if (!mapContainer.current) return _saving_data;
        setShowRoads(false)
        clearAnimation()
        setIsAnimation(true)
        setDuringAnimation(true)
        window.camera.zoom = 1
        window.isAnimation = true
        let passedSegment = 0;
        const coordinates = _saving_data.geoJson.geometry.coordinates;
        let total_stopSignDuration = 0
        let stopSigns: any[] = []
        _.map(coordinates, _coord => {
            let _stopSignPoint: any = isStopSignPoint(_coord)
            if (_stopSignPoint) {
                total_stopSignDuration += _stopSignPoint.duration
                stopSigns.push(_stopSignPoint)
            }
        })
        const center = {
            tileX: window.map.center.x,
            tileY: window.map.center.y
        }

        // Convert geoJson coordinates to Three.js Vector3 points
        const points: any = []
        const _coordinates: any = []
        const segments: any = [];
        // Loop through the coordinates and create segments
        for (let i = 1; i < coordinates.length; i++) {
            segments.push({
                coordinates: [coordinates[i - 1], coordinates[i]],
                color: _saving_data.colors ? _saving_data.colors[i] : _saving_data.color, // Use segment-specific color or fallback to default color
                speed: _saving_data.speeds && _saving_data.speeds.length > 0 ? _saving_data.speeds[i] : _saving_data.speedLimits
            });
        }
        coordinates.map(coord => {
            const tileData = window.map.convertGeoToPixel(coord[1], coord[0])
            const tileX = tileData.tileX;          // tile X coordinate of the point
            const tileY = tileData.tileY;          // tile Y coordinate of the point
            const tilePixelX = tileData.tilePixelX; // pixel X position inside the tile
            const tilePixelY = tileData.tilePixelY; // pixel Y position inside the tile
            
            const worldPos = window.map.calculateWorldPosition(center, tileX, tileY, tilePixelX, tilePixelY, 512);
            const point = new THREE.Vector3(worldPos.x, worldPos.y, 0);
            // Get the elevation for this point and set the Z coordinate
            let elevationValue = 0
            const candidates = index.search({
                minX: lng,
                minY: lat,
                maxX: lng,
                maxY: lat
            });
  
            let nearestFeature: any = null;
  
            candidates.forEach((item) => {
                const isInside = booleanPointInPolygon([lng, lat], item.feature.geometry);
                if (isInside) {
                    nearestFeature = item.feature;
                    return false; // Exit loop early if point is inside a polygon
                }
            });
            if (nearestFeature) {
              elevationValue = Math.round(parseFloat(nearestFeature.geometry.elevation) * 100) / 100 - 400;
            }
  
            if (!nearestFeature || isNaN(elevationValue)) {
              // elevationValue = parseFloat(rgba[0] * 256 + rgba[1] + rgba[2] / 256 - 32768)
              elevationValue = window.map.getElevationAt([tilePixelX, tilePixelY], tileX, tileY);
            }
            point.z = elevationValue * 2

            points.push(point)
            _coordinates.push(coord)
        });  // Set Z-axis to 0 for 2D route
        // Now create segments for each point pair and assign the corresponding color
        let accumulatedPoints: THREE.Vector3[] = [points[0]]; // Start with the first point
        let accumulatedCoords: any = [_coordinates[0]]
        let currentColor = _saving_data.colors[1] || _saving_data.color; // Initialize the current color

        let tubes: any = []; // Array to store all tubes and their associated data

        // Iterate over your points and create tubes as before
        let accumulatedSpeedLimits: any = []; // Array to store speed limits for accumulated points

        for (let i = 1; i < points.length; i++) {
            const _color = _saving_data.colors[i] || _saving_data.color; // Get the current segment color
            const speedLimit = _saving_data.speeds[i] || _saving_data.speedLimits; // Default to 40 if speed limit is not provided

            // Accumulate speed limits for the same segment
            accumulatedSpeedLimits.push(speedLimit);
            if (_color !== currentColor || i === points.length - 1) {
                // Include the current point in the accumulated points
                if (i === points.length - 1) {
                    accumulatedPoints.push(points[i]);
                    accumulatedCoords.push(_coordinates[i])
                }
                // Create a curve from the accumulated points
                const segmentCurve = new THREE.CatmullRomCurve3(accumulatedPoints);
                const curve = new THREE.CatmullRomCurve3(points);
                // Calculate the average speed limit for this segment
                const averageSpeedLimit = accumulatedSpeedLimits.reduce((a, b) => a + b, 0) / accumulatedSpeedLimits.length;
                
                const segmentTube = createTubeWithFootprint(segmentCurve, accumulatedPoints, currentColor, 100);
                segmentTube.renderOrder = 2;
                window.map.scene.add(segmentTube);

                activeObjects.current.tube = segmentTube;
                // Add this tube's data to the tubes array
                let totalDistance = turf.length(turf.lineString(accumulatedCoords), { units: 'meters' })
                tubes.push({
                    tube: segmentTube,
                    curve: segmentCurve,
                    totalDistance: totalDistance, // Calculate the tube's distance
                    marker: null, // We'll add this later
                    duration: Math.ceil(totalDistance / averageSpeedLimit / 3.6) * 2500,  // Assuming total time is shared among tubes
                    progress: 0,  // Initial progress for the animation
                    speedLimit: averageSpeedLimit // Add the average speed limit for the segment
                });

                // Create arrows along the tube at intervals
                for (let i = 0; i < accumulatedPoints.length - 1; i++) {
                    const start = new THREE.Vector3(accumulatedPoints[i].x, accumulatedPoints[i].y, (accumulatedPoints[i].z) + 2);
                    const end = new THREE.Vector3(accumulatedPoints[i + 1].x, accumulatedPoints[i + 1].y, (accumulatedPoints[i + 1].z ) + 2);
    
                    const direction = new THREE.Vector3().subVectors(end, start).normalize();
                    
                    // Create arrow cone
                    const arrowGeometry = new THREE.ConeGeometry(5, 20, 32); // Adjust size as necessary
                    const arrowMaterial = new THREE.MeshBasicMaterial({color: 0xffffff, depthTest: false, depthWrite: false, transparent: true});
    
                    const arrowMesh = new THREE.Mesh(arrowGeometry, arrowMaterial);
    
                    // Set position at the start point of each segment
                    arrowMesh.position.copy(start);
                    const middlePoint = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);
                    arrowMesh.position.copy(middlePoint);
                    // Align arrow along the direction of the segment
                    arrowMesh.lookAt(end);
                    arrowMesh.rotateOnAxis(new THREE.Vector3(1, 0, 0), Math.PI / 2); // Rotate to align with the tube direction
                    arrowMesh.scale.set(0.5, 0.5, 0.5);
                    window.map.scene.add(arrowMesh);
                    replayArrowTubes.current.push(arrowMesh)
                }
                replayTubes.current.push(segmentTube)
                // Reset for the next segment with a different color
                accumulatedPoints = [points[i-1], points[i]]; // Start a new segment, including the current point
                accumulatedCoords = [_coordinates[i-1], _coordinates[i]]
                accumulatedSpeedLimits = [(_saving_data.speeds[i-1] || _saving_data.speedLimits), speedLimit]; // Start new speed limits for the next segment
                currentColor = _color; // Update the current color
            } else {
                accumulatedPoints.push(points[i]);
                accumulatedCoords.push(_coordinates[i])
            }
        }
        let total_duration = 0;
        total_duration = calculateTotalDuration(coordinates as [number, number][], segments, _saving_data.speedLimits);

        activeObjects.current.marker = window.TruckObject;

        let currentSegmentIndex = 0; // To track which segment is being animated
        if (pausedTimeValue.current != 0) {
            currentSegmentIndex = pausedTubeIndex.current
            drawPreviousTubes(tubes, currentSegmentIndex)
        }
        let PassedTime = 0
        // Function to animate a single tube segment
        const animateSegment = (tubeData, onComplete) => {
            const { curve, tube, totalDistance, speedLimit, duration } = tubeData;
            const marker = window.TruckObject

            // Animation loop for a single segment
            const animate = (timestamp) => {
                const currentPlaybackSpeed = currentSpeed.current;
                if (!animationRef.current.startTime) {
                    animationRef.current.startTime = timestamp;
                    marker.visible = true;
                }
                let elapsed;
                let deltaTime;
                deltaTime = (timestamp - animationRef.current.startTime!) * currentPlaybackSpeed;
                if (pausedTimeValue.current != 0) {
                    elapsed = pausedTimeValue.current
                }
                else{
                    elapsed = animationRef.current.elapsedTime + deltaTime;
                }

                const _progress = Math.min(elapsed / duration, 1);
                const distanceCovered = _progress * totalDistance;
                // Move the marker along the curve
                if (_progress < 1) {
                    const point = curve.getPointAt(_progress);
                    const nextPoint = curve.getPointAt(Math.min(_progress + 0.01, 1));  // Slightly ahead of the current point to calculate the forward direction
                    if (point) {
                        if (!window.map) return
                        updateMarkerTooltip(point)
                        currentAnimationMarker.current = point
                        NextCameraPoistion.current = nextPoint
                        marker.position.set(point.x, point.y, point.z);
                        tube.material.uniforms.progress.value = _progress;
                        // Calculate the forward direction (from point to nextPoint)
                        forwardDirection.current = new THREE.Vector3().subVectors(nextPoint, point).normalize();

                        const angle = Math.atan2(forwardDirection.current.y, forwardDirection.current.x);
                        // // Rotate the object around the Z-axis based on the calculated angle
                        marker.rotation.z = angle + Math.PI / 2;

                        let cameraOffset = new THREE.Vector3();
                        const forwardDirectionNormalized = forwardDirection.current.clone().normalize();
                        const rightDirection = new THREE.Vector3(0, 0, 1).cross(forwardDirectionNormalized).normalize();
                        // Adjust the camera based on viewType
                        switch (currentViewType.current) {
                            case 'TOP':
                                cameraOffset = new THREE.Vector3(0, 0, 120);  // Camera from above (Top view)
                                break;
                            case 'FRONT':
                                cameraOffset = forwardDirection.current.clone().multiplyScalar(100);  // Camera in front of the marker (Truck)
                                // cameraOffset.z += 50;  // Adjust the height for a better view
                                break;
                            case 'LEFT':
                                // Move the camera to the left of the truck using the rightDirection vector (negated for the left side)
                                cameraOffset = rightDirection.clone().multiplyScalar(80);  // Camera from the left side
                                cameraOffset.z += 10;  // Optionally adjust height
                                break;
                            case 'RIGHT':
                                // Move the camera to the right of the truck using the rightDirection vector
                                cameraOffset = rightDirection.clone().multiplyScalar(-80);  // Camera from the right side
                                cameraOffset.z += 10;  // Optionally adjust height
                                break;
                            case 'BACK':
                                cameraOffset = forwardDirection.current.clone().multiplyScalar(-100);  // Camera from behind the marker
                                // cameraOffset.z += 50;  // Adjust the height
                                break;
                            default:
                                // Default camera behavior if viewType is not defined (use 'Top' view)
                                cameraOffset = new THREE.Vector3(0, 0, 120);  // Camera from above (Top view)
                        }

                        // Set the camera position behind the marker (car)
                        const cameraPosition = new THREE.Vector3().copy(point).add(cameraOffset);
                        window.camera.position.set(cameraPosition.x, cameraPosition.y, cameraPosition.z + 30);
                        // Make the camera look ahead (at the next point on the curve)
                        window.camera.lookAt((currentViewType.current === 'TOP' ? nextPoint : point));

                        window.camera.updateProjectionMatrix();
                        window.camera.updateMatrixWorld();
                        window.savedCameraPosition = window.camera.position.clone();
                        window.savedCameraQuaternion = window.camera.quaternion.clone();
                        window.renderer.render(window.map.scene, window.camera); // Render updated frame
                        // set ToolTip content
                        setMarkerToolTipContent('<span>Distance: </span>' + Math.ceil(distanceCovered) + 'm<br/><span>Altitude: </span>' + Math.floor(point.z / 2 + 400) + 'm' + "<br/><span>Speed: </span>" + Math.floor(speedLimit) + "km/h" + '<br/><span>Total: </span>' + (total_duration + total_stopSignDuration) + 's<br/><span>Stop_Sign: </span>' + total_stopSignDuration + 's')
                    }

                    // marker.scale.set(pulseScale * 50, pulseScale * 50, 1); // Apply pulsing scale
                    // Request next frame for this segment
                    animationRef.current.startTime = timestamp;
                    if (currentIsPlaying.current){
                        animationRef.current.animationFrameId = requestAnimationFrame(animate);
                        pausedTimeValue.current = 0
                    }
                    else{
                        pausedTubeIndex.current = currentSegmentIndex
                        animationRef.current.animationFrameId && cancelAnimationFrame(animationRef.current.animationFrameId);
                        animationRef.current.animationFrameId = null
                        pausedTimeValue.current = elapsed
                    }
                    animationRef.current.elapsedTime = elapsed
                } else {
                    tube.material.uniforms.progress.value = 1
                    // Segment animation complete, proceed to next
                    animationRef.current.animationFrameId && cancelAnimationFrame(animationRef.current.animationFrameId);
                    animationRef.current.startTime = null;
                    onComplete();  // Proceed to the next segment
                    animationRef.current.elapsedTime = 0
                    animationRef.current.startTime = null
                    passedSegment ++
                    PassedTime += elapsed
                    if (passedSegment == tubes.length) {
                        setIsAnimation(false)
                    }
                }
            };

            // Start the animation for this segment
            animationRef.current.startTime = null;
            animationRef.current.animationFrameId = requestAnimationFrame(animate);
        };

        // Function to animate all segments sequentially
        const animateTubesSequentially = () => {
            if (currentSegmentIndex < tubes.length) {
                // Get the current tube data
                const currentTubeData = tubes[currentSegmentIndex];

                // Start animation for the current tube
                animateSegment(currentTubeData, () => {
                    // Move to the next segment once the current one is done
                    currentSegmentIndex++;
                    animateTubesSequentially(); // Recursively call the function to animate the next segment
                });
            }
            else{
                window.TruckObject.visible = false
                // Clean up marker
                // window.map.scene.remove(marker);
                clearAnimation()
                setIsAnimation(false)
                setDuringAnimation(false)
                setShowRoads(true)
                // Segment animation complete, proceed to next
                animationRef.current.animationFrameId && cancelAnimationFrame(animationRef.current.animationFrameId);
                animationRef.current.startTime = null;
                window.isAnimation = false
                setTimeout(() => {
                    window.controls.target.copy(currentAnimationMarker.current);
                    window.controls.enabled = true;
                    window.camera.zoom = 1
                    pausedTimeValue.current = 0
                    pausedTubeIndex.current = -1
                    window.camera.updateProjectionMatrix();
                }, 300)
            }
        };

        // Start the sequential animation
        animateTubesSequentially();

        return _saving_data;
    }, [startPoint, endPoint, wayPoints, color, setStartPoint, setEndPoint, setWayPoints, routeData, setIsAnimation]);

    const drawPreviousTubes = (tubes, index) => {
        for (let i = 0; i < index ; i ++) {
          const tubeData = tubes[i]
          const { tube } = tubeData;
          tube.material.uniforms.progress.value = 1
        }
    }

    useEffect(() => {
        if (drawing) {
            setStartPoint(null)
            setEndPoint(null)
            setPointType('way_point')
            if (endMarker.current) {
                endMarker.current.visible = false
            }
            if (startMarker.current) {
                startMarker.current.visible = false
            }
        }
        else{
            if (endMarker.current) {
                endMarker.current.visible = true
            }
            if (startMarker.current) {
                startMarker.current.visible = true
            }
            clearRoute()
        }
    }, [drawing, routeMarkers])

    useEffect(() => {
        if (pointType === 'start_point' || pointType === 'end_point') {
            setIsStopSign(false)
            setDrawing(false)
        }
    }, [pointType])

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
    
    const [editingRouteId, setEditingRouteId] = useState<string | null>(null)
    const [newTitle, setNewTitle] = useState<string>("")
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false)
    const [isStopSignModalOpen, setIsStopSignModalOpen] = useState<boolean>(false)
    const [newColor, setNewColor] = useState<string>("#00ff00")
    const [speedLimit, setSpeedLimit] = useState<number>(defaultSpeedLimit)
    const [unloadedSpeedLimit, setUnloadedSpeedLimit] = useState<number>(defaultSpeedLimit)
    const [showRoads, setShowRoads] = useState<boolean>(true)
    const [stopSignDuration, setStopSignDuration] = useState<number>()

    const content: any = {
        top: '50%',
        left: '50%',
        right: 'auto',
        bottom: 'auto',
        marginRight: '-50%',
        transform: 'translate(-50%, -50%)'
    }

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
    }, [newColor, editingRouteId, speedLimit, newTitle])

    const handleCancel = () => {
        setEditingRouteId(null)
        setIsModalOpen(false)
    }

    const handleCancelStopSign = useCallback(() => {
        if (tempStopSign.current) {
            window.map.scene.remove(tempStopSign.current);
            tempStopSign.current.geometry.dispose();  // Clean up resources
            tempStopSign.current.material.dispose();
            tempStopSign.current = null;
        }
        setEditingRouteId(null);
        setIsStopSignModalOpen(false);
    }, [editingRouteId])

    const handleInputChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        setNewTitle(event.target.value);
    }, [newTitle])

    const handleSpeedLimitChange = useCallback((event: any) => {
        setSpeedLimit(parseFloat(event.target.value))
    }, [speedLimit])
    const handleUnloadedSpeedLimitChange = useCallback((event: any) => {
        setUnloadedSpeedLimit(parseFloat(event.target.value))
    }, [unloadedSpeedLimit])

    const handleSave = useCallback(async () => {
        try {
            if (editingRouteId !== null && routeData) {
                let _saving_data = _?.find(routeData, _route => editingRouteId === _route.id)
                if (!_saving_data) return;
                const coordinates = (_saving_data.geoJson.geometry as LineString).coordinates
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
                changeTubeColor(editingRouteId, _saving_data.color)
            }
            if (currentCategory.value === 'Empty') {
                setNotificationType('warning')
                setErrorMessage("Please input all value correctly!")
                return
            }
            if (!editingRouteId) {
                if (coordinates.length > 1) {
                    let distance = Math.floor(turf.length(turf.lineString(coordinates), { units: 'meters' }))
                    let duration = Math.floor(distance / (speedLimit / 3.6))
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
                            speedLimits: speedLimit,
                            color: newColor,
                            name: newTitle,
                            category: currentCategory.value
                        };
                        dispatch(addRoute(saving_data))
                        clearRoute()
                        setDrawing(false);
                        setIsModalOpen(false);
                        currentRoute.current++
                        setNotificationType('success')
                        setErrorMessage('New Route saved successfully!')
                    } catch (error) {
                        console.error(error);
                    }
        
                }
            }
        } catch (error) {
            console.log(error)
        }
    }, [editingRouteId, routeData, newTitle, speedLimit, newColor, currentCategory, notificationType]);

    const changeTubeColor = (routeId, newColor) => {
        const tubeMeshData = tubeMeshes.current.find(({ value }) => value.userData.id === routeId);
        if (tubeMeshData) {
          const tubeMesh = tubeMeshData.value;
          tubeMesh.material.color.set(newColor);
        }
    }

    const handleColorChange = useCallback((e) => {
        setNewColor(e.target.value);
    }, [newColor])

    const shortestRoutes = useRef<string[]>([])
    const calculateShortestRoute = useCallback(() => {
        if (!routeData || !startPoint || !endPoint) return;
        const response = getRoutes(routeData.filter(_route => _route.category !== 'STOP_SIGNS'), startPoint, endPoint)
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
        pausedTimeValue.current = 0
        pausedTubeIndex.current = -1
        currentIsPlaying.current = true
        animationRef.current.startTime = null;
        animationRef.current.elapsedTime = 0;
        // remove existing tubes
        if (replayTubes.current && replayTubes.current.length > 0) {
            _.map(replayTubes.current, _tube => {
              window.map.scene.remove(_tube)
              _tube.geometry.dispose();  // Clean up resources
              _tube.material.dispose();
            })
        }
        replayTubes.current = []
        if (replayArrowTubes.current && replayArrowTubes.current.length > 0) {
            _.map(replayArrowTubes.current, _tube => {
                window.map.scene.remove(_tube)
                _tube.geometry.dispose();  // Clean up resources
                _tube.material.dispose();
            })
        }
        replayArrowTubes.current = []
        drawRoute(saving_data, 8, '', true);
        if (saving_data.id) {
            // this code is for clearing the map
            shortestRoutes.current.push(saving_data?.id)
        }
    }, [routeData, startPoint, endPoint])

    const removeShortestRoute = useCallback(() => {
        if (!mapContainer.current) return

        if (tempStopSign.current) {
            window.map.scene.remove(tempStopSign.current);
            tempStopSign.current.geometry.dispose();  // Clean up resources
            tempStopSign.current.material.dispose();
            tempStopSign.current = null;
        }
        if (tempTube.current.length > 0) {
            tempTube.current.forEach(tube => {
                if (tube) {
                    window.map.scene.remove(tube);       // Remove the mesh from the scene
                    tube.geometry.dispose();             // Dispose of geometry
                    tube.material.dispose();             // Dispose of material
                }
            });
        }
        segmentMarkers.current = []

        if (startMarker.current) {
            // remove existing start point
            window.map.scene.remove(startMarker.current);
            startMarker.current.geometry.dispose();  // Clean up resources
            startMarker.current.material.dispose();
            startMarker.current = null;
        }

        if (endMarker.current) {
            // remove existing start point
            window.map.scene.remove(endMarker.current);
            endMarker.current.geometry.dispose();  // Clean up resources
            endMarker.current.material.dispose();
            endMarker.current = null;
        }
        tempTube.current = []; // Clear the array after cleanup
        setPointType('way_point')
        setDrawing(false)
        setIsStopSign(false)
    }, [mapContainer])

    const showModal = () => {
        setIsModalVisible(true)
    };

    const handleOk = (_minLng, _minLat, _maxLng, _maxLat) => {
        setIsModalVisible(false);
    }

    const hideBoundingBox = () => {
        setIsModalVisible(false)
    }

    useEffect(() => {
        if (!mapContainer.current || !routeData || routeData.length == 0) return;

        _.map(tubeMeshes.current, _tube => {
            _tube.value.visible = showRoads
        })

    }, [showRoads, routeData, mapContainer])

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

            // remove tempMarker
            _.map(tempMarkers.current, (_marker, index) => {
                if (_marker.userData.coord[0] === stopSignPoint[0] && _marker.userData.coord[1] === stopSignPoint[1]) {
                    window.map.scene.remove(_marker);
                    // Dispose of resources
                    if (_marker.material) _marker.material.dispose();
                    if (_marker.geometry) _marker.geometry.dispose();
                }
            })
            const updatedtempMarkers = _.filter(tempMarkers.current, _marker => _marker.userData.coord[0] !== stopSignPoint[0] && _marker.userData.coord[1] !== stopSignPoint[1])
            tempMarkers.current = updatedtempMarkers

            if (tempStopSign.current) {
                window.map.scene.remove(tempStopSign.current);
                tempStopSign.current.geometry.dispose();  // Clean up resources
                tempStopSign.current.material.dispose();
                tempStopSign.current = null;
            }
        }
        setStopSignPoint(null)
        setEditingRouteId(null);
        setIsStopSignModalOpen(false);
        setIsStopSign(false)
    }, [editingRouteId, stopSignDuration, newTitle, newColor, stopSignPoint, stopSignData, routeData, dispatch])

    useEffect(() => {
        if (!isStopSign) {
            _.map(tempMarkers.current, _marker => {
                _marker.visible = false
            })
        }
        else{
            setDrawing(false)
            _.map(tempMarkers.current, _marker => {
                _marker.visible = true
            })
        }
    }, [isStopSign])

    const isPointInGeofence = (longitude: number, latitude: number): boolean => {
        // Create a turf point for the given coordinate
        const point = turf.point([longitude, latitude]);
        // Loop through each geofence and check if the point is within any of them
        for (const feature of geoFences.current) {
            const polygon = turf.polygon(feature.geometry.coordinates);
            if (turf.booleanPointInPolygon(point, polygon)) {
                    return true; // Point is inside this polygon
            }
        }
        return false; // Point is not inside any polygons
    };

    const isLastPointInGeofence = (longitude: number, latitude: number): boolean => {
        // Create a turf point for the given coordinate
        const point = turf.point([longitude, latitude]);
        // Loop through each geofence and check if the point is within any of them
        for (const feature of geoFences.current) {
            const polygon = turf.polygon(feature.geometry.coordinates);
            if (turf.booleanPointInPolygon(point, polygon)) {
                    return true; // Point is inside this polygon
            }
        }
        return false; // Point is not inside any polygons
    };

    const updateAnnotations = useCallback(() => {
        if (!mapContainer.current || !window.map) return;
    
        const cameraZ = window.map.camera.position.z;
        const scaleFactor = Math.max(0.2, Math.min(cameraZ / 500, 10)); // Recalculate scale based on camera Z

        // Create a map to count occurrences of each route_id
        const routeCount = {};

        // First pass: Count annotations and group them by route_id
        routeNameTubes.current.forEach(item => {
            const routeId = item.route_id; // Assuming each item has a route_id property

            // Initialize the count for this route_id if it doesn't exist
            if (!routeCount[routeId]) {
                routeCount[routeId] = [];
            }
            routeCount[routeId].push(item); // Store item in the count array
        });

        // Determine the maximum visible count based on the camera's Z position
        let maxVisibleCount = Infinity; // Start with an infinite count

        if (cameraZ <= 300) {
            maxVisibleCount = Infinity; // Show all annotations
        } else if (cameraZ < 500) {
            maxVisibleCount = 3; // Show 3 annotations
        } else if (cameraZ < 1500) {
            maxVisibleCount = 2; // Show 2 annotations
        } else if (cameraZ < 2000) {
            maxVisibleCount = 2; // Show 2 annotations
        } else if (cameraZ < 3000) {
            maxVisibleCount = 2; // Show 2 annotations
        } else {
            maxVisibleCount = 1; // Show 1 annotation
        }

        // Second pass: Update visibility based on the calculated maxVisibleCount
        Object.values(routeCount).forEach((routeItems: any) => {
            const totalCount = routeItems.length;

            // Calculate the step size to determine which items to show
            const stepSize = Math.floor(totalCount / Math.max(maxVisibleCount, 1)); // Avoid division by zero
            
            routeItems.forEach((item, index) => {
                // Determine if the current index should be visible
                const shouldBeVisible = cameraZ <= 300 || (index % stepSize === 0 && Math.floor(index / stepSize) < maxVisibleCount);
                item.visible = shouldBeVisible;
                item.tube.visible = shouldBeVisible; // Show or hide the corresponding tube

                // Update scale only for visible items
                if (shouldBeVisible) {
                    item.tube.scale.set(scaleFactor, scaleFactor, scaleFactor); // Update scale
                }
            });
        });
    
    }, []);
    return (
        <React.Fragment>
            <div className="page-content" style={{paddingBottom: '0px'}}>
                <Container fluid>
                    <Breadcrumb title="Mine Dynamics" breadcrumbItem="Auto Routing" />
                    <Row>
                        <Col md="12" style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
                            <THREEJSMap ref={mapContainer} defaultLayers={[]} drawMarkers={() => {}} updateAnnotations={updateAnnotations} isLoading={isLoading} setIsLoading={setIsLoading} height='calc(100vh - 165px)' onDocumentMouseClick={onDocumentMouseClick} onDocumentMouseDblClick={onDocumentMouseDblClick} isAutoRouting={true}>
                            {
                                duringAnimation && <FloatingActionButton _viewType={viewType} setViewType={setViewType} />
                            }
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
                                <div className="truck-tooltip haul-road-optimization" id="marker-tooltip" style={{display: isAnimation ? 'block' : 'none'}}>
                                    <div className="tooltiptext" dangerouslySetInnerHTML={{__html: markerToolTipContent}}></div>
                                </div>
                            </THREEJSMap>
                            <Card style={{ height: 'calc(100vh - 165px)', width: '20%', marginLeft: '15px', padding:'16px' }}>
                                <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', fontSize: '20px', alignItems: 'center'}}>
                                    Routes
                                    <Button onClick={() => {setDrawing(!drawing); setIsStopSign(false);}}>
                                        {drawing ? <i className='fas fa-ellipsis-h'></i> : <i className='fas fa-plus'></i>}
                                    </Button>
                                </div>
                                <div style={{ height: 'calc(100% - 100px)', overflow: 'auto', marginTop:'16px' }}>
                                    {routeData && _.map(routeData, (route: any, key) =>  
                                        <div className={'route-item ' + (isLight ? 'light-mode' : 'dark-mode')} key={key} style={{ display: 'flex', alignItems: 'center', fontSize: '14px', padding: '6px' }}>
                                            <div style={{ flex: '1' }}>
                                                <div style={{ color: route.color, display:'block', cursor: 'none' }}>{route.name}</div>
                                                {
                                                    route.category !== 'STOP_SIGNS' ?
                                                    <>
                                                    <div style={{ fontSize: '12px', display: 'block', color: isLight ? 'black' : 'white' }}>
                                                        Distance: {route.distance}(m)
                                                    </div>
                                                    <div>
                                                        <div style={{ fontSize: '12px', display: 'block', color: isLight ? 'black' : 'white' }}>
                                                            {
                                                            isPointInGeofence(route.geoJson.geometry?.coordinates[0][0], route.geoJson.geometry?.coordinates[0][1]) ? 'Loaded' : isLastPointInGeofence(route.geoJson.geometry?.coordinates[route.geoJson.geometry?.coordinates.length - 1][0], route.geoJson.geometry?.coordinates[route.geoJson.geometry?.coordinates.length - 1][1]) ? 'Unloaded' : 'Loaded'} Speed: {route.speedLimits}(km/h)
                                                        </div>
                                                        <div style={{ fontSize: '12px', display: 'block', color: isLight ? 'black' : 'white' }}>
                                                            {
                                                            isPointInGeofence(route.geoJson.geometry?.coordinates[0][0], route.geoJson.geometry?.coordinates[0][1]) ? 'Loaded' : isLastPointInGeofence(route.geoJson.geometry?.coordinates[route.geoJson.geometry?.coordinates.length - 1][0], route.geoJson.geometry?.coordinates[route.geoJson.geometry?.coordinates.length - 1][1]) ? 'Unloaded' : 'Loaded'}  Duration: {route.duration}(s)
                                                        </div>
                                                    </div>
                                                    {/* <div style={{border: '1px dashed gray', padding: '.3rem', borderTop: '0px'}}>
                                                        <div style={{ fontSize: '12px', display: 'block', color: isLight ? 'black' : 'white' }}>
                                                            Unloaded Speed: {route.speedLimits}(km/h)
                                                        </div>
                                                        <div style={{ fontSize: '12px', display: 'block', color: isLight ? 'black' : 'white' }}>
                                                            Unloaded Duration: {route.duration}(s)
                                                        </div>
                                                    </div> */}
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
                                                <i className='bx bx-edit' onClick={() => handleTitleClick(route)}></i>
                                                <i className="bx bx-trash" onClick={() => fnRemoveRoute(route)}></i>
                                            </div>
                                        </div>
                                    )}
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
                    <Row style={{justifyContent: 'center', alignItems: 'center'}}>
                        <Col md={5}>
                            <label>Route Name</label>
                        </Col>
                        <Col md={7}>
                            <Input
                                type="text"
                                value={newTitle}
                                placeholder="Route Name"
                                onChange={handleInputChange}
                                style={{ width: '100%', padding: '10px', marginBottom: '10px' }}
                            />
                        </Col>
                    </Row>

                    
                    <Row style={{justifyContent: 'center', alignItems: 'center'}}>
                        <Col md={5}>
                            <label>Speed Limit</label>
                        </Col>
                        <Col md={7}>
                            <Input
                                type="number"
                                value={speedLimit}
                                placeholder="Speed Limit"
                                onChange={handleSpeedLimitChange}
                                style={{ width: '100%', padding: '10px', marginBottom: '10px' }}
                            />
                        </Col>
                    </Row>
{/* 
                    <Row style={{justifyContent: 'center'}}>
                        <Col md={5}>
                            <label>Unloaded Speed Limit</label>
                        </Col>
                        <Col md={7}>
                            <Input
                                type="number"
                                value={unloadedSpeedLimit}
                                placeholder="Unloaded Speed Limit"
                                onChange={handleUnloadedSpeedLimitChange}
                                style={{ width: '100%', padding: '10px', marginBottom: '10px' }}
                            />
                        </Col>
                    </Row> */}


                    <Row style={{justifyContent: 'center', alignItems: 'center'}}>
                        <Col md={5}>
                            <label>Route Color</label>
                        </Col>
                        <Col md={7}>
                            <Input
                                type="color"
                                value={newColor}
                                placeholder="Route Color"
                                onChange={handleColorChange}
                                style={{ width: '100%', padding: '10px', marginBottom: '10px' }}
                            />
                        </Col>
                    </Row>


                    <div id="auto-routing-category" style={{ width: '100%', marginTop: '10px' }}>
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