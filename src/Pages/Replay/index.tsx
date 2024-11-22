import React, { useCallback, useEffect, useRef, useState } from "react";
import { Card, Container, Row, TabPane } from "reactstrap";
import { Button, Segmented, Space, Tabs } from "antd";
import _ from "lodash";
import * as turf from '@turf/turf';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css';
import RBush from 'rbush';
import booleanPointInPolygon from '@turf/boolean-point-in-polygon';
import TimeSlider from "./components/TimeSlider";
import './assets/index.css';
import { excavatorImages, truckImages } from "assets/images/equipment";
import { RouteDataType } from "Pages/AutoRouting/type";
import ReactApexChart from "react-apexcharts";
import { useDispatch, useSelector } from "react-redux";
import { getAllVehicleRoutes } from "slices/thunk";
import * as THREE from "three";
import { ListView } from "./components/ListView";
import { DropdownType, Dropdown } from "Components/Common/Dropdown";
import { DatePicker, DatePickerProps } from 'antd';
import dayjs from 'dayjs';
import { EquipmentLocation, equipments} from '../Map/sample';
import { getMinutesDifference, getSyncText } from "./common";
import mapLocationImage from "assets/images/map/map-location.png";
import { LineString } from 'interfaces/GeoJson';
import { VehicleRouteSelector } from 'selectors';
import { THREEJSMap } from "Pages/3DMap";
import TOPTruck from '../../assets/images/Truck/TOP.png'
import LEFTTruck from '../../assets/images/Truck/LEFT.png'
import RIGHTTruck from '../../assets/images/Truck/RIGHT.png'
import FRONTTruck from '../../assets/images/Truck/FRONT.png'
import BACKTruck from '../../assets/images/Truck/BACK.png'
import FloatingActionButton from "./components/FloatingActionButton";
import { Line2 } from 'three/examples/jsm/lines/Line2.js';
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial.js';
import { LineGeometry } from 'three/examples/jsm/lines/LineGeometry.js';
import { ReloadOutlined } from "@ant-design/icons";

export type TripRoutesDataType = {
    id: string,
    routes: RouteDataType[]
}

type ActiveObjectType = {
    tube: any
    marker: any
    animationId: any
    arrow: any;
    bufferTube: any;
    curve: any;
    points: any;
}

const VIEWTYPE = [
    'TOP', 'LEFT', 'RIGHT', 'FRONT', 'BACK'
]
const index = new RBush();
const Replay = () => {
    document.title = "3D GPS Fleet Tracking | FMS Live";

    const mapContainer = useRef<any>(null);
    const geojsonData = useRef<any>();
    const [routeData, setRouteData] = useState<TripRoutesDataType[]>([]);
    const stopSignData = useRef<RouteDataType[]>([]);
    const [selectedTrip, setSelectedTrip] = useState<RouteDataType | null>(null);
    const [filter, setFilter] = useState<string>("All Equipment");
    // TimeSlider
    const [isPlaying, setIsPlaying] = useState(false);
    const currentIsPlaying = useRef<boolean>(false)
    const [speed, setSpeed] = useState(1);
    const currentSpeed = useRef<number>(1);
    const [timeValue, setTimeValue] = useState(0);
    const currentTimeValue = useRef<number>(-1)

    // selected Truck in the Map
    const [selectedEq, setSelectedEq] = useState<any>(null)

    const [totalTime, setTotalTime] = useState(0); // 00h 59m 24s in seconds
    const onDateChange: DatePickerProps['onChange'] = (date, dateString) => {
        if (date) {
          setSelectedDate(date.toDate());
        }
    };
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const forwardDirection = useRef<any>(null)
    const NextCameraPoistion = useRef<any>(null)
    const [showTimeline, setShowTimeline] = useState<boolean>(true)
    const locationItems = [
        {
            label: "Blasthole Rig",
            value: "BLASTHOLE_RIG",
        },
        {
            label: "Haul Truck",
            value: "HAUL_TRUCK",
        },
        {
            label: "Dozer",
            value: "DOZER",
        },
    ]

    const [locations, setLocaltions] = useState<DropdownType>({
        label: "ALL",
    });

    const [viewType, setViewType] = useState<string>("TOP")
    let animationFrameId: number;
    let map: any;
    mapboxgl.accessToken = process.env.MAPBOX_API_KEY || 'pk.eyJ1IjoibXlreXRhcyIsImEiOiJjbTA1MGhtb3YwY3Y0Mm5uY3FzYWExdm93In0.cSDrE0Lq4_PitPdGnEV_6w';
    // state for Map loading status
    const [isLoading, setIsLoading] = useState<boolean>(true);

    const dispatch: any = useDispatch();

    const { vehicleRoutes } = useSelector(VehicleRouteSelector);

    const currentAnimationMarker = useRef<any>(null)
    const [isAnimation, setIsAnimation] = useState<boolean>(false)
    const currentAnimationStatus = useRef<boolean>(false)
    const [markerToolTipContent, setMarkerToolTipContent] = useState<string>('')

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
    }, [isAnimation])

    const updateAnnotations = useCallback(() => {
        if (!mapContainer.current || !window.map) return
        const mapContainerElement = mapContainer.current.getMapContainer();
        const center = {
            tileX: window.map.center.x,
            tileY: window.map.center.y
        }
        eqMarkers.forEach((annotation: any, index) => {
            if (!mapContainer.current || !annotation) return
            const tileData = window.map.convertGeoToPixel(annotation.position[1], annotation.position[0])
            const tileX = tileData.tileX;          // tile X coordinate of the point
            const tileY = tileData.tileY;          // tile Y coordinate of the point
            const tilePixelX = tileData.tilePixelX; // pixel X position inside the tile
            const tilePixelY = tileData.tilePixelY; // pixel Y position inside the tile
            
            const worldPos = window.map.calculateWorldPosition(center, tileX, tileY, tilePixelX, tilePixelY, 512);
            let elevationValue = window.map.getElevationAt([tilePixelX, tilePixelY], tileX, tileY);
            let realWorldPosition = new THREE.Vector3(worldPos.x, worldPos.y, elevationValue * 2);
            const screenPosition = annotation.position.clone();
            screenPosition.project(window.camera); // Project to screen space
            
            const x = (screenPosition.x * 0.5 + 0.5) * (mapContainerElement.clientWidth);
            const y = -(screenPosition.y * 0.5 - 0.5) * (mapContainerElement.clientHeight);
            
            const annotationDiv = document.getElementById(`annotation-${annotation.userData.data.id}`);

            if (annotationDiv) {
                annotationDiv.style.left = `${x}px`;
                annotationDiv.style.top = `${y}px`;
                const isInViewport = (
                    x >= 50 && x <= (mapContainerElement.clientWidth - 50) &&
                    y >= 50 && y <= (mapContainerElement.clientHeight - 25)
                );
                
                annotationDiv.style.display = isInViewport && (!currentAnimationStatus.current || !currentIsPlaying.current) ? 'block' : 'none';
            }
        });
    }, [isAnimation])

    useEffect(() => {
        if (!isLoading && window.renderer) {
            window.renderer.domElement.addEventListener('mouseclick', onDocumentMouseClick , false);
            window.controls && window.controls.addEventListener('change', () => {
                const cameraPositionZ = window.map.camera.position.z;
                if (activeObjects.current.tube) {
                    const tube = activeObjects.current.tube;
                    const distance = window.map.camera.position.distanceTo(tube.position);
            
                    // Camera Z value range (400 -> 1000)
                    const minZ = 350;
                    const maxZ = 1000;
            
                    // Tube width range (8 -> 36)
                    const minWidth = 8;
                    const maxWidth = 36;
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
                        activeObjects.current.curve, 
                        activeObjects.current.points.length * 10, 
                        normalizedWidth, 
                        4, 
                        false
                    );
                }
            });
        }
    }, [isLoading])

    useEffect(() => {
        currentAnimationStatus.current = isAnimation
    }, [isAnimation])

    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const eqMarkers: any = []
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

    // Array to hold all clickable sprites
    const clickableSprites = useRef<any>([]);
    const [duringAnimation, setDuringAnimation] = useState<boolean>(false)
    const RippleIcon = ({ annotation, isLoading, duringAnimation }) => {    
        const textStyle: any = {
            position: 'absolute',
            top: '-57px',
            left: '-50px',
            background: annotation.color,
            borderRadius: '20px',
            fontSize: '1rem',
            color: 'white',
            fontWeight: 600,
            padding: '6px 16px',
            width: '120px',
            textAlign: 'center',
            display: isLoading || duringAnimation ? 'none' : 'block',
            opacity: 0.8
        };
        return (
            <div id={`annotation-${annotation.id}`} className="marker-tooltip" style={{ position: 'absolute' }} onClick={() => {setSelectedEq(annotation)}}>
                <div id={`annotation-image-${annotation.id}`} style={textStyle}>
                    <img width="28px" style={{ objectFit: 'contain' }} src={getEquipmentStatusIcon(annotation)} alt="equipment-image" />
                    {annotation.name}
                </div>
                <div id={`annotation-marker-${annotation.id}`} style={{ position: 'absolute', bottom: 0, transform: 'translateX(-40%)', display: isLoading|| duringAnimation ? 'none' : 'block' }}>
                    <img src={mapLocationImage} alt="Description of the image" />
                </div>
            </div>
        );
    };
    

    const drawMarkers = useCallback(() => {
        if (!mapContainer.current) return;
    
        _.map(equipments, eq => {
            const iconUrl = getEquipmentStatusIcon(eq);
            if (iconUrl === undefined) return;
    
            const imageTexture = new THREE.TextureLoader().load(mapLocationImage); // Load the marker icon image
            const spriteMaterial = new THREE.SpriteMaterial({ map: imageTexture, depthWrite: false, transparent: true, depthTest: false });
            const marker = new THREE.Sprite(spriteMaterial);
    
            // Adjust scale and other properties to match the marker appearance
            marker.renderOrder = 2;  // Render order to ensure it's drawn on top of other elements
    
            // Get the world position for the marker
            const tileData = window.map.convertGeoToPixel(eq.position[1], eq.position[0]);
            const center = {
                tileX: window.map.center.x,
                tileY: window.map.center.y,
            };
            const worldPos = window.map.calculateWorldPosition(center, tileData.tileX, tileData.tileY, tileData.tilePixelX, tileData.tilePixelY, 512);
            const elevationValue = window.map.getElevationAt([tileData.tilePixelX, tileData.tilePixelY], tileData.tileX, tileData.tileY);
    
            // Set the marker position
            marker.position.set(worldPos.x, worldPos.y, elevationValue * 2);  // Set Z to 0 or adjust for elevation
            marker.scale.set(0, 0, 0); // Adjust based on zoom level
            // Attach rippleIcon HTML to the marker (syncs the 3D position)
    
            // Add marker and icon label to the scene
            // Add click event to marker (Three.js sprite click)
            marker.userData = { isAnnotation: true, data: eq };
            window.map.scene.add(marker);
    
            // Add to lists for later interaction
            eqMarkers.push(marker);
            clickableSprites.current.push(marker);
        });
    }, [equipments]);

    let selectedPoints: any = [];
    const onDocumentMouseClick = (event) => {
        if (!mapContainer.current) return;
        // Convert mouse click position to normalized device coordinates (NDC)
        const rect = mapContainer.current.getBoundingClientRect();
        mouse.x = ((event.clientX - rect.left) / mapContainer.current.clientWidth) * 2 - 1;
        mouse.y = -((event.clientY - rect.top) / mapContainer.current.clientHeight) * 2 + 1;

        // Update the raycaster with the camera and mouse position
        raycaster.setFromCamera(mouse, window.camera);

        // Intersect the objects in the scene (you can also specify specific objects)
        const intersects = raycaster.intersectObjects(window.map.scene.children, true);

        if (intersects.length > 0) {
            const intersectedObject = intersects[0].object;
            if (intersectedObject.userData && intersectedObject.userData.isAnnotation) {
                const position = intersectedObject.position.clone();
                document.body.style.cursor = 'pointer'; // Change to desired cursor style
                // selectedPoints.push(position);
                setSelectedEq(intersectedObject.userData.data);  // Handle click event
            }
            // Do something with the 3D coordinates, e.g., highlight the object
        }
        
        if (selectedPoints.length === 2) {
            // drawLineBetweenPoints(selectedPoints[0], selectedPoints[1]);
            selectedPoints = []; // Reset points
        }
    }
    
    useEffect(() => {
        if (selectedEq) {
            setRouteData([{id: selectedEq.name, routes: vehicleRoutes.filter(_route => _route.category !== 'STOP_SIGNS' && _route.status == 'ACTIVE')}]);

            clearAnimation()
            setTimeValue(0)
            setTotalTime(0)
            setSelectedTrip(null)
            setIsPlaying(false)

            defaultSeries[0].data = []
            setSeries(defaultSeries)

            if (defaultApexOptions.xaxis) {
                defaultApexOptions.xaxis.categories = []
                setApexOptions(defaultApexOptions);
            }
        }
    }, [vehicleRoutes, selectedEq])
    const lastCameraPosition = useRef<any>(null)
    const lastCameraQuaternion = useRef<any>(null)
    const cameraStopAnimationId = useRef<number>(0)
    const animationCameraFrameId = useRef<number>(0);
    const currentViewType = useRef<string>(viewType)

    const togglePlay = useCallback(() => {
        setIsPlaying(!isPlaying);
        window.isAnimation = false
        currentIsPlaying.current = !isPlaying
        if (isPlaying === false && timeValue === totalTime) {
            setTimeValue(0)
            currentTimeValue.current = 0
            clearAnimation()
            if (cameraStopAnimationId.current !== 0) {
                cancelAnimationFrame(cameraStopAnimationId.current)
                lastCameraQuaternion.current = false
            }
            if (activeObjects.current && activeObjects.current.animationId) {
                cancelAnimationFrame(activeObjects.current.animationId);
                activeObjects.current.animationId = null;
            }
        }
        
        if (cameraStopAnimationId.current !== 0) {
            cancelAnimationFrame(cameraStopAnimationId.current)
            lastCameraQuaternion.current = false
        }
        if (!currentIsPlaying.current) {
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
            if (window.controls) window.controls.enabled = false;

            const cameraPosition = new THREE.Vector3().copy(currentAnimationMarker.current).add(cameraOffset);
            window.camera.position.set(cameraPosition.x, cameraPosition.y, cameraPosition.z + 30);
            // Interpolate the lookAt position for smooth transition
            window.camera.lookAt((currentViewType.current === 'TOP' ? NextCameraPoistion.current : currentAnimationMarker.current));
            console.log('paused position:' + window.camera.position)
            setTimeout(() => {
                window.controls.target.copy(currentAnimationMarker.current);
                window.controls.enabled = true;
                window.camera.zoom = 1
                window.camera.updateProjectionMatrix();
            }, 300)
            window.renderer.render(window.map.scene, window.camera)
            window.savedCameraPosition = window.camera.position.clone();
            window.savedCameraQuaternion = window.camera.quaternion.clone();
        }
        else {
            // Save the camera's last position and orientation at the moment the animation is paused
            window.savedCameraPosition = window.camera.position.clone();
            window.savedCameraQuaternion = window.camera.quaternion.clone();
            window.controls.update()
        }
    }, [timeValue, totalTime, isPlaying, forwardDirection, currentAnimationMarker, NextCameraPoistion, currentViewType]);

    useEffect(() => {
        currentViewType.current = viewType
        if (!window.camera) return
        window.camera.zoom = 1
        if (duringAnimation && !currentIsPlaying.current) {
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
            const cameraPosition = new THREE.Vector3().copy(currentAnimationMarker.current).add(cameraOffset);
            window.camera.position.set(cameraPosition.x, cameraPosition.y, cameraPosition.z + 30);
            // Interpolate the lookAt position for smooth transition
            window.camera.lookAt(NextCameraPoistion.current);
            window.savedCameraPosition = window.camera.position.clone();
            window.savedCameraQuaternion = window.camera.quaternion.clone();
            currentAnimationMarker.current && updateMarkerTooltip(currentAnimationMarker.current)
        }
    }, [viewType, duringAnimation, currentAnimationMarker])

    const handleSpeedChange = (value: number) => {
        setSpeed(value);
        currentSpeed.current = value
    };

    const handleTimeChange = (value: number) => {
        setTimeValue(value);
        currentTimeValue.current = value
    };
    
    // Handler for the "Next" button
    const handleNext = useCallback(() => {
        if (currentTimeValue.current === undefined || totalTime === undefined) return;
        const newTime = Math.min(timeValue + 10, totalTime); // Add 10 seconds, but don't exceed maxTimeValue
        setTimeValue(newTime); // Update the value
        currentTimeValue.current = newTime; // Update the ref
    }, [setTimeValue, currentTimeValue, totalTime, timeValue]);
    
    // Handler for the "Prev" button
    const handlePrev = useCallback(() => {
        if (currentTimeValue.current === undefined) return;
        const newTime = Math.max(timeValue - 10, 0); // Subtract 10 seconds, but don't go below 0
        setTimeValue(newTime); // Update the value
        currentTimeValue.current = newTime; // Update the ref
    }, [setTimeValue, currentTimeValue, timeValue]);

    // Handler for the PrevRoute button
    const onPrevRoute = useCallback(() => {
        if (routeData && routeData[0] && routeData[0].routes && routeData[0].routes.length > 0) {
            if (selectedTrip == null) {
                // If no trip is selected, select the first one
                selectTrip(routeData[0].routes[0]);
            } else {
                // Find the index of the currently selected trip
                const currentIndex = _.findIndex(routeData[0].routes, _route => _route === selectedTrip);
    
                // Determine the next index
                const prevIndex = (currentIndex - 1 + routeData[0].routes.length) % routeData[0].routes.length;
    
                // Set the next trip in the sequence
                selectTrip(routeData[0].routes[prevIndex]);
            }
        }
    }, [selectedTrip, routeData]);

    // Handler for the NextRoute button
    const onNextRoute = useCallback(() => {
        if (routeData && routeData[0] && routeData[0].routes && routeData[0].routes.length > 0) {
            if (selectedTrip == null) {
                // If no trip is selected, select the first one
                selectTrip(routeData[0].routes[0]);
            } else {
                // Find the index of the currently selected trip
                const currentIndex = _.findIndex(routeData[0].routes, _route => _route === selectedTrip);
    
                // Determine the next index
                const nextIndex = (currentIndex + 1) % routeData[0].routes.length;
    
                // Set the next trip in the sequence
                selectTrip(routeData[0].routes[nextIndex]);
            }
        }
    }, [selectedTrip, routeData]);

    // Use useRef to store the interval ID
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    // Effect to manage the play interval logic
    useEffect(() => {
        if (isPlaying) {
            const intervalTime = 1000 / speed;
            intervalRef.current = setInterval(() => {
                // setTimeValue((prev) => {
                //     const newValue = prev + 1;
                //     if (newValue >= totalTime) {
                //         setIsPlaying(false); // Stop when reaching the end
                //         currentIsPlaying.current = false
                //         return totalTime;
                //     }
                //     return newValue;
                // });
                if (timeValue >= totalTime) {
                    setIsPlaying(false); // Stop when reaching the end
                    currentIsPlaying.current = false
                    return totalTime;
                }
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
    }, [isPlaying, speed, timeValue]);

    let defaultApexOptions: ApexCharts.ApexOptions = {
        chart: {
          type: 'bar', // Ensure this is one of the allowed values
          height: 250,
          width: 650,
          toolbar: {
            show: false
          },
          zoom: {
            enabled: false
          },
          animations: {
              enabled: true,
              easing: 'easeinout',
              speed: 800,
              animateGradually: {
                  enabled: true,
                  delay: 150
              },
              dynamicAnimation: {
                  enabled: true,
                  speed: 350
              }
          },
        },
        dataLabels: {
          enabled: false
        },
        stroke: {
          curve: 'smooth'
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
                }
            }
        },
        grid: {
            show: false
        },
        xaxis: {
            type: 'numeric',
            categories: [], // Your categories here
            labels: {
                formatter: function (value) {
                    return `${value}m`; // Adds 'm' to each y-axis label
                }
            },
        },
        yaxis: {
            opposite: false,
            labels: {
                formatter: function (value) {
                    return `${value}m`; // Adds 'm' to each y-axis label
                }
            }
        },
        legend: {
          horizontalAlign: 'right'
        },
        annotations: {
            xaxis: [{
                x: 0, // Initial position of the annotation
                borderColor: '#00E396',
                label: {
                    text: '',
                    style: {
                        color: '#fff',
                        background: '#00E396',
                        fontSize: '12px',
                        fontWeight: 600,
                        padding: {
                            left: 10,
                            right: 10,
                            top: 5,
                            bottom: 5
                        }
                    }
                },
            }],
            yaxis: [{
                y: 0, // y value for the annotation
                borderColor: '#FF4560',
                label: {
                    text: '',
                    style: {
                        color: '#fff',
                        background: '#FF4560',
                        fontSize: '12px',
                        fontWeight: 600,
                        padding: {
                            left: 10,
                            right: 10,
                            top: 5,
                            bottom: 5
                        }
                    }
                }
            }],
            points: [{
                marker: {
                    size: 20, // Size of the marker
                    shape: 'custom', // Using a custom shape
                    offsetX: 0,
                    offsetY: -10
                }
            }]
        }
    }

    const [apexOptions, setApexOptions] = useState<ApexCharts.ApexOptions>(
        defaultApexOptions
    )

    let defaultSeries = [
        {
            name: "",
            data: []
        }
    ]

    const [series, setSeries] = useState(
        defaultSeries
    );

    useEffect(() => {
        // Clean up on component unmount
        return () => {
            window.map && window.map.clean()
            if (animationFrameId) {
                cancelAnimationFrame(animationFrameId);
            }
    
            if (animationCameraFrameId.current) {
                cancelAnimationFrame(animationCameraFrameId.current)
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
    }, [])

    useEffect(() => {
        dispatch(getAllVehicleRoutes())
    }, [dispatch]);

    
    const animationRef = useRef<{startTime: number | null, elapsedTime: number, animationFrameId: number | null, animationCameraId: number | null}>({ startTime: null, elapsedTime: 0, animationFrameId: null, animationCameraId: null });
    const pausedTimeValue = useRef<number>(0)
    const xaxisValues = useRef<number[]>([])
    const yaxisValues = useRef<number[]>([])
    const currentTructDistance = useRef<number>(0)

    useEffect(() => {
        if (isPlaying && !animationRef.current.animationFrameId && selectedTrip) {
            if (totalTime == currentTimeValue.current) {
                handleTimeChange(0);
                animationRef.current.startTime = null
                currentTimeValue.current = -1
                animationRef.current.elapsedTime = 0
            }
            let stopSignDuration = getStopSignsDuration((selectedTrip.geoJson.geometry as LineString).coordinates)
            drawRoute(selectedTrip, selectedTrip.duration, selectedTrip.distance, true, stopSignDuration)
        }
    }, [isPlaying, selectedTrip, animationRef, totalTime])

    const selectTrip = useCallback((_route) => {
        if (_route) {
            setSelectedTrip(_route)
            setTimeValue(0)
            setIsPlaying(true)
            currentIsPlaying.current = true
            // add stopSignDuration if the stop_sign exist in the current route
            let stopSignDuration = getStopSignsDuration(_route.geoJson.geometry.coordinates)
            setTotalTime(_route.duration && _route.duration != 0 ? _route.duration + stopSignDuration : 3600)
            const [xaxis, yaxis] = extractDistanceAndElevationArrayWithTurf(_route.geoJson)
            const distanceData: any = _.map(xaxis, (distance, index) => distance);
            const elevationData: any = _.map(yaxis, (elevation, index) => elevation);
            defaultSeries[0].data = elevationData
            yaxisValues.current = elevationData
            xaxisValues.current = distanceData
            setSeries(defaultSeries)

            if (defaultApexOptions.xaxis) {
                defaultApexOptions.xaxis.categories = distanceData
                setApexOptions(defaultApexOptions);
            }
            animationRef.current.startTime = null
            currentTimeValue.current = -1
            animationRef.current.elapsedTime = 0
            drawRoute(_route, _route.duration, _route.distance, true, stopSignDuration)
            const coordinates = _route.geoJson.geometry.coordinates;
            // Extract the first point
            const firstCoordinate = coordinates[0];
            
            // Convert to world position if needed
            const tileData = window.map.convertGeoToPixel(firstCoordinate[1], firstCoordinate[0]);
            const center = {
                tileX: window.map.center.x,
                tileY: window.map.center.y
            }
            const worldPos = window.map.calculateWorldPosition(
                center, tileData.tileX, tileData.tileY, tileData.tilePixelX, tileData.tilePixelY, 512
            );
            const firstPoint = new THREE.Vector3(worldPos.x, worldPos.y, 0);
    
            // Get elevation data for the first point
            const elevationValue = window.map.getElevationAt([tileData.tilePixelX, tileData.tilePixelY], tileData.tileX, tileData.tileY);
            firstPoint.z = elevationValue * 2 + 50;
            // Set the camera position to the first point
        }
    }, [routeData, selectedTrip])

    const getStopSignsDuration = useCallback((coordinates) => {
        let duration = 0;
        _.map(coordinates, coor => {
            _.map(stopSignData.current, _stopsign => {
                if ((_stopsign.geoJson.geometry as LineString).coordinates && (_stopsign.geoJson.geometry as LineString).coordinates[0]) {
                    if ((_stopsign.geoJson.geometry as LineString).coordinates[0][0] == coor[0] && (_stopsign.geoJson.geometry as LineString).coordinates[0][1] == coor[1]) {
                        duration += _stopsign.duration
                    }
                }
            })
        })

        return duration
    }, [stopSignData])

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
    
        _.map(candidates, (item) => {
            const isInside = booleanPointInPolygon(point, item.feature.geometry);
            if (isInside) {
                nearestFeature = item.feature;
                return false; // Exit loop early if point is inside a polygon
            }
        });
    
        if (nearestFeature) {
            return Math.round(parseFloat(nearestFeature.geometry.elevation) * 100) / 100; // Adjust property name if different
        } else {
            const tileData = window.map.convertGeoToPixel(point[1], point[0])
            return Math.round((window.map.getElevationAt([tileData.tilePixelX, tileData.tilePixelY], tileData.tileX, tileData.tileY) + 400) * 100) / 100
        }
    };

    // Function to calculate cumulative distances using Turf.js
    const extractDistanceAndElevationArrayWithTurf = (geoJson: any) => {
        const coordinates = geoJson.geometry.coordinates;
        const distanceArray: number[] = [];
        const elevationArray: number[] = [];
    
        // Calculate the total length of the entire route
        const line = turf.lineString(coordinates);
        const totalLength = turf.length(line, { units: 'meters' });
        let inverval: number = 1
        if (totalLength < 200) inverval = 5
        else if (totalLength < 300) inverval = 10
        else if (totalLength < 500) inverval = 20
        else if (totalLength < 1000) inverval = 30
        else if (totalLength < 2000) inverval = 50
        else inverval = 100
        // Interpolate points every meter along the route
        for (let i = 0; i <= totalLength; i += inverval) {
            // Get a point at each meter along the route
            const pointAlongRoute = turf.along(line, i, { units: 'meters' });
            const [lng, lat] = pointAlongRoute.geometry.coordinates;
    
            // Calculate and push distance (in meters)
            distanceArray.push(i);
    
            // Calculate elevation and push to elevationArray
            const elevation = calculateCustomElevation({ lng, lat });
            elevationArray.push(elevation ? elevation : 0);
        }

        // Ensure the last point (totalLength) is included
        if (distanceArray[distanceArray.length - 1] !== totalLength) {
            const lastPoint = turf.along(line, totalLength, { units: 'meters' });
            const [lng, lat] = lastPoint.geometry.coordinates;

            distanceArray.push(Math.floor(totalLength));
            const lastElevation = calculateCustomElevation({ lng, lat });
            elevationArray.push(lastElevation ? lastElevation : 0);
        }

    
        return [distanceArray, elevationArray];
    };

    const activeObjects = useRef<ActiveObjectType>({tube: null, bufferTube: null, marker: null, animationId: null, arrow: null, curve: null, points: null});  // Store active objects like tube, marker, animation ID
    const clearAnimation = () => {
        setIsAnimation(false)
        window.isAnimation = false
        if (!window.map) return
        // Remove previous route
        if (activeObjects.current && activeObjects.current.tube) {
            window.map.scene.remove(activeObjects.current.tube);
            activeObjects.current.tube.geometry.dispose();  // Clean up resources
            activeObjects.current.tube.material.dispose();
            activeObjects.current.tube = null;
        }
        if (activeObjects.current && activeObjects.current.bufferTube) {
            window.map.scene.remove(activeObjects.current.bufferTube);
            activeObjects.current.bufferTube.geometry.dispose();  // Clean up resources
            activeObjects.current.bufferTube.material.dispose();
            activeObjects.current.bufferTube = null;
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

        cameraStopAnimationId.current = 0
        lastCameraQuaternion.current = false
    }

    // Function to create a tube with custom shader to control visibility
    function createTubeWithFootprint(curve, accumulatedPoints, color, type) {
        let width = 8
        if (type === 'buffer') {
            width = 36
        }
        const tubeGeometry = new THREE.TubeGeometry(curve, accumulatedPoints.length * 10, width, 10, false);
    
        // Calculate the length of the tube curve
        const tubeLength = curve.getLength();
    
        // Shader material with progress uniform to control visibility
        const tubeMaterial = new THREE.ShaderMaterial({
            uniforms: {
                progress: { value: 0.0 },  // Controls how much of the tube is revealed
                tubeColor: { value: new THREE.Color(color) },  // Uniform for tube color
                opacity: {value: type === 'buffer' ? 0.6 : 1}
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
            transparent: type === 'buffer' ? false : true,
            depthWrite: false,
        });
    
        const tube = new THREE.Mesh(tubeGeometry, tubeMaterial);
        tube.renderOrder = 1000;
        if (type === 'buffer') {
            tube.scale.set(1, 1, 1);
            tube.position.set(0, 0, 0);
        }
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
            new THREE.Vector2(-roadWidth / 2, -36),
            new THREE.Vector2(roadWidth / 2, -36),
            new THREE.Vector2(roadWidth / 2, 36), // Extend forward
            new THREE.Vector2(-roadWidth / 2, 36),
        ]);
        const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    
        
        const tubeMaterial = new THREE.MeshStandardMaterial({ color: 'black', depthWrite: false, transparent: true, opacity: 0.3 });
        const ellipticalTubeMesh = new THREE.Mesh(geometry, tubeMaterial);
        return ellipticalTubeMesh;
    }
    const isStopSignPoint = useCallback((coord) => { //check the point is STOP_SIGNS, if so return stopSignDuration
        let stopsign: any = null
        _.map(stopSignData.current, _stopsign => {
            if ((_stopsign.geoJson.geometry as LineString).coordinates && (_stopsign.geoJson.geometry as LineString).coordinates[0]) {
                if ((_stopsign.geoJson.geometry as LineString).coordinates[0][0] == coord[0] && (_stopsign.geoJson.geometry as LineString).coordinates[0][1] == coord[1]) {
                    stopsign = _stopsign
                }
            }
        })

        return stopsign
    }, [stopSignData.current])

    const drawRoute = useCallback((saving_data, totalTime, distance, animation = true, stopSignDuration = 0) => {
        clearAnimation()
        setIsAnimation(true)
        window.isAnimation = true
        setDuringAnimation(true)
        const coordinates = saving_data.geoJson.geometry.coordinates;
        const center = {
            tileX: window.map.center.x,
            tileY: window.map.center.y
        }
        let total_stopSignDuration = 0
        let stopSigns: any[] = []
        _.map(coordinates, _coord => {
            let _stopSignPoint: any = isStopSignPoint(_coord)
            if (_stopSignPoint) {
                total_stopSignDuration += _stopSignPoint.duration
                stopSigns.push(_stopSignPoint)
            }
        })
        // Convert geoJson coordinates to Three.js Vector3 points
        const points: any = []
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
            elevationValue = window.map.getElevationAt([tilePixelX, tilePixelY], tileX, tileY);
            point.z = elevationValue * 2

            points.push(point)
        });  // Set Z-axis to 0 for 2D route
        // Create a CatmullRomCurve3 from the points
        const curve = new THREE.CatmullRomCurve3(points);
        // Create a tube geometry along the curve
        const segmentTube = createTubeWithFootprint(curve, points, saving_data.color || 0x00ff00, 'normal');
        const segmentBufferTube = createTubeBuffer(points, 0xe2e2e2);
        segmentTube.renderOrder = 2;
        window.map.scene.add(segmentTube);
        window.map.scene.add(segmentBufferTube);

        // Store the tube reference
        activeObjects.current.tube = segmentTube;
        activeObjects.current.curve = curve;
        activeObjects.current.points = points;
        activeObjects.current.bufferTube = segmentBufferTube;
        
        // Manually calculate the direction vector between the last two points
        const dirVector = new THREE.Vector3().subVectors(points[1], points[0]).normalize();
        
        let arrow = new THREE.ArrowHelper(dirVector, points[0], 50, 0xffffff);
        arrow.renderOrder = 1;
        // Add the arrow to the scene
        window.map.scene.add(arrow);
        activeObjects.current.arrow = arrow;
        // Set up marker (a sphere)

        // Store the marker reference
        window.TruckObject.renderOrder = activeObjects.current.tube.renderOrder + 1
        activeObjects.current.tube.layers.set(0);
        activeObjects.current.bufferTube.layers.set(0);
        window.TruckObject.layers.set(1);
        activeObjects.current.marker = window.TruckObject;
        const marker = window.TruckObject
        // Calculate the total distance and time if not provided
        if (!distance || distance === 0) {
            distance = Math.floor(turf.length(turf.lineString(coordinates), { units: 'meters' }));
        }
        if (!totalTime || totalTime === 0) {
            totalTime = Math.floor(distance / (saving_data.speedLimits / 3.6));  // Assumed speed in m/s
        }
        // Animation loop
        const duration = totalTime * 1000;  // Convert total time to milliseconds
        const totalDistance = distance;
        let prevXvalue: null | number = null, prevYvalue: null | number = null;
        window.camera && (window.camera.zoom = 1)
        const animate = (timestamp) => {
            const currentPlaybackSpeed = currentSpeed.current;
            if (!animationRef.current.startTime) {
                animationRef.current.startTime = timestamp;
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
            if (currentTimeValue.current >= 0) { // when the user changed the timeslider
                animationRef.current.elapsedTime = currentTimeValue.current * 1000;
                currentTimeValue.current = -1
            }
            const _progress = Math.min(elapsed / duration, 1);
            const distanceCovered = _progress * totalDistance;
            currentTructDistance.current = distanceCovered

            const annotation = findNearestSmallerValue(xaxisValues.current, distanceCovered)
            if (annotation){
                const newYValue = yaxisValues.current[annotation]; // Your updated y-axis value
                const newXValue = xaxisValues.current[annotation]; // Your updated x-axis value
                if (prevXvalue != newXValue || prevYvalue != newYValue){
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
                                                color: '#fff',
                                                background: '#FF4560',
                                                fontSize: '12px',
                                                fontWeight: 600,
                                                padding: {
                                                    left: 10,
                                                    right: 10,
                                                    top: 5,
                                                    bottom: 5
                                                }
                                            }
                                        }
                                    }
                                ],
                                xaxis: [
                                    {
                                        ...(prevOptions.annotations?.xaxis?.[0] || {}), // Preserve previous y-axis annotation properties
                                        x: newXValue, // Update the x value
                                        label: {
                                            text: `Distance: ${newXValue} m`, // Update the label text
                                            // ...(prevOptions.annotations?.xaxis?.[0]?.label || {}), // Preserve previous label properties
                                            style: {
                                                color: '#fff',
                                                background: '#00E396',
                                                fontSize: '12px',
                                                fontWeight: 600,
                                                padding: {
                                                    left: 10,
                                                    right: 10,
                                                    top: 5,
                                                    bottom: 5
                                                }
                                            }
                                        }
                                    }
                                ]
                            }
                        };
                    });
                    prevXvalue = newXValue
                    prevYvalue = newYValue
                }
            }

            // Calculate the point along the curve based on progress
            if (_progress < 1) {
                if (!window.map) return
                setTimeValue(Math.floor(_progress / 1 * totalTime))
                const point = curve.getPointAt(_progress);  // Get the point along the tube curve
                const nextPoint = curve.getPointAt(Math.min(_progress + 0.01, 1));  // Slightly ahead of the current point to calculate the forward 
                if (point) {
                    currentAnimationMarker.current = point
                    NextCameraPoistion.current = nextPoint
                    marker.position.set(point.x, point.y, point.z);
                    activeObjects.current.tube.material.uniforms.progress.value = _progress;
                    // activeObjects.current.bufferTube.material.uniforms.progress.value = _progress;
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
                    lastCameraPosition.current = window.camera.position.clone()
                    // set ToolTip content
                    setMarkerToolTipContent('<span>Distance: </span>' + Math.ceil(distanceCovered) + 'm<br/><span>Altitude: </span>' + Math.floor(point.z / 2 + 400) + 'm' + "<br/><span>Speed: </span>" + Math.floor(saving_data.speedLimits) + "km/h" + '<br/><span>Total: </span>' + (totalTime + total_stopSignDuration) + 's<br/><span>Stop_Sign: </span>' + total_stopSignDuration + 's')

                    window.TruckObject && (window.TruckObject.visible = true)
                    // set Marker
                    updateMarkerTooltip(point)
                }
            }
            if (_progress < 1) {
                animationRef.current.elapsedTime += deltaTime;
                animationRef.current.startTime = timestamp;
                if (currentIsPlaying.current){
                    animationRef.current.animationFrameId = requestAnimationFrame(animate);
                    pausedTimeValue.current = 0
                }
                else{
                    animationRef.current.animationFrameId = null
                    pausedTimeValue.current = elapsed
                    animationRef.current.elapsedTime = elapsed
                }

            } else {
                window.TruckObject.visible = false
                // Clean up marker
                // window.map.scene.remove(marker);
                setIsAnimation(false)
                setTimeValue(totalTime)
                setDuringAnimation(false)
                // Segment animation complete, proceed to next
                animationRef.current.animationFrameId && cancelAnimationFrame(animationRef.current.animationFrameId);
                animationRef.current.startTime = null;
                window.isAnimation = false
                setTimeout(() => {
                    window.controls.target.copy(currentAnimationMarker.current);
                    window.controls.enabled = true;
                    window.camera.zoom = 1
                    window.camera.updateProjectionMatrix();
                }, 300)
            }
        };

        // Start new animation
        animationRef.current.startTime = null;
        animationRef.current.animationFrameId = requestAnimationFrame(animate);
    
    }, [totalTime, speed, timeValue, isPlaying, apexOptions, currentSpeed, currentTimeValue, currentViewType]);

    function findNearestSmallerValue(array, target) {
        let nearest = null;
        let index = 0
        for (let i = 0; i < array.length; i++) {
            if (array[i] <= target && (nearest === null || target - array[i] < target - nearest)) {
                nearest = array[i];
                index = i
            }
        }
        
        return index;
    }
    
    const [activeTab, setActiveTab] = useState<string>('1');
    const onChangeTap = useCallback((key) => {
        setActiveTab(key)
    }, [activeTab])

    const [isHoveringSync, setIsHoveringSync] = useState(false);

    const handleSyncHover = () => {
        setIsHoveringSync(!isHoveringSync);
    }

    const getSyncIcon = (sync, lastUpdated) => {
        switch (sync) {
          case "manual":
            return <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M5.99996 5.99996C5.26663 5.99996 4.63885 5.73885 4.11663 5.21663C3.5944 4.6944 3.33329 4.06663 3.33329 3.33329C3.33329 2.59996 3.5944 1.97218 4.11663 1.44996C4.63885 0.927737 5.26663 0.666626 5.99996 0.666626C6.73329 0.666626 7.36107 0.927737 7.88329 1.44996C8.40551 1.97218 8.66663 2.59996 8.66663 3.33329C8.66663 4.06663 8.40551 4.6944 7.88329 5.21663C7.36107 5.73885 6.73329 5.99996 5.99996 5.99996ZM0.666626 11.3333V9.46663C0.666626 9.08885 0.763959 8.74151 0.958626 8.42463C1.15285 8.10818 1.41107 7.86663 1.73329 7.69996C2.42218 7.35551 3.12218 7.09707 3.83329 6.92463C4.5444 6.75263 5.26663 6.66663 5.99996 6.66663C6.73329 6.66663 7.45551 6.75263 8.16663 6.92463C8.87774 7.09707 9.57774 7.35551 10.2666 7.69996C10.5888 7.86663 10.8471 8.10818 11.0413 8.42463C11.236 8.74151 11.3333 9.08885 11.3333 9.46663V11.3333H0.666626Z"
            fill={`${lastUpdated > 120? '#CF1322' : (lastUpdated<= 120 && lastUpdated >= 30)? '#FAAD14' : '#389E0D'}`}/>
            </svg>
            ;
          case "inactive":
            return <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M7.28335 9.36667L11.0667 5.6L10.1167 4.65L7.28335 7.48333L5.86669 6.06667L4.93335 7L7.28335 9.36667ZM0.666687 14V12.6667H15.3334V14H0.666687ZM2.66669 12C2.30002 12 1.98613 11.8694 1.72502 11.6083C1.46391 11.3472 1.33335 11.0333 1.33335 10.6667V3.33333C1.33335 2.96667 1.46391 2.65278 1.72502 2.39167C1.98613 2.13056 2.30002 2 2.66669 2H13.3334C13.7 2 14.0139 2.13056 14.275 2.39167C14.5361 2.65278 14.6667 2.96667 14.6667 3.33333V10.6667C14.6667 11.0333 14.5361 11.3472 14.275 11.6083C14.0139 11.8694 13.7 12 13.3334 12H2.66669ZM2.66669 10.6667H13.3334V3.33333H2.66669V10.6667Z"
              fill={`${lastUpdated > 120? '#CF1322' : (lastUpdated<= 120 && lastUpdated >= 30)? '#FAAD14' : '#389E0D'}`}
            />
          </svg>;
          case "ACTIVE":
            return (
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M7.28335 9.36667L11.0667 5.6L10.1167 4.65L7.28335 7.48333L5.86669 6.06667L4.93335 7L7.28335 9.36667ZM0.666687 14V12.6667H15.3334V14H0.666687ZM2.66669 12C2.30002 12 1.98613 11.8694 1.72502 11.6083C1.46391 11.3472 1.33335 11.0333 1.33335 10.6667V3.33333C1.33335 2.96667 1.46391 2.65278 1.72502 2.39167C1.98613 2.13056 2.30002 2 2.66669 2H13.3334C13.7 2 14.0139 2.13056 14.275 2.39167C14.5361 2.65278 14.6667 2.96667 14.6667 3.33333V10.6667C14.6667 11.0333 14.5361 11.3472 14.275 11.6083C14.0139 11.8694 13.7 12 13.3334 12H2.66669ZM2.66669 10.6667H13.3334V3.33333H2.66669V10.6667Z"
                  fill={`${lastUpdated > 120? '#CF1322' : (lastUpdated<= 120 && lastUpdated >= 30)? '#FAAD14' : '#389E0D'}`}
                />
              </svg>
            );
          default:
            return (
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M7.28335 9.36667L11.0667 5.6L10.1167 4.65L7.28335 7.48333L5.86669 6.06667L4.93335 7L7.28335 9.36667ZM0.666687 14V12.6667H15.3334V14H0.666687ZM2.66669 12C2.30002 12 1.98613 11.8694 1.72502 11.6083C1.46391 11.3472 1.33335 11.0333 1.33335 10.6667V3.33333C1.33335 2.96667 1.46391 2.65278 1.72502 2.39167C1.98613 2.13056 2.30002 2 2.66669 2H13.3334C13.7 2 14.0139 2.13056 14.275 2.39167C14.5361 2.65278 14.6667 2.96667 14.6667 3.33333V10.6667C14.6667 11.0333 14.5361 11.3472 14.275 11.6083C14.0139 11.8694 13.7 12 13.3334 12H2.66669ZM2.66669 10.6667H13.3334V3.33333H2.66669V10.6667Z"
                    fill={`${lastUpdated > 120? '#CF1322' : (lastUpdated<= 120 && lastUpdated >= 30)? '#FAAD14' : '#389E0D'}`}
                  />
                </svg>
              );
        }
    }

    useEffect(() => {
        _.map(clickableSprites.current, marker => {
            const imageDiv = document.getElementById('annotation-image-' + marker.userData.data.id)
            const markerDiv = document.getElementById('annotation-marker-' + marker.userData.data.id)
            imageDiv && (imageDiv.style.display = 'none')
            markerDiv && (markerDiv.style.display = 'none')
        })
        _.map(clickableSprites.current, marker => {
            if (marker.userData.data.vehicleType === filter || filter === 'All Equipment') {
                const imageDiv = document.getElementById('annotation-image-' + marker.userData.data.id)
                const markerDiv = document.getElementById('annotation-marker-' + marker.userData.data.id)
                imageDiv && (imageDiv.style.display = 'block')
                markerDiv && (markerDiv.style.display = 'block')
            }
        })
    }, [filter])

    const [reloadModels, setReloadModels] = useState(0);
    const refershMap = useCallback(() => {
        setReloadModels(reloadModels + 1)
    }, [reloadModels])

    return (
        <React.Fragment>
            <div className="page-content">
                <Container fluid style={{marginBottom: '-35px'}}>
                    <Row>
                        <Tabs defaultActiveKey="1" activeKey={activeTab} onChange={(key) => onChangeTap(key)} >
                            <TabPane tab="Map View" key="1">
                                {/* Map View Placeholder */}
                                <div id="3d-map-view">
                                    <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px'}}>
                                        <h4>GPS Fleet Tracking</h4>
                                        <div style={{display: 'flex', alignItems: 'center'}}>
                                            <Space style={{marginRight: '10px'}}>
                                                <Segmented className="customSegmentLabel customSegmentBackground" value={filter} onChange={(e) => setFilter(e)} options={['All Equipment', { label: 'Excavators', value: 'EXCAVATOR' }, { label: 'Trucks', value: 'DUMP_TRUCK' }, { label: 'Loaders', value: 'LOADER' }, { label: 'Drillers', value: 'DRILLER' }, { label: 'Dozers', value: 'DOZER' }]}  />
                                            </Space>
                                            <Button size='small' style={{width: '100px', marginLeft: '0.5rem', marginRight: '0.5rem', height: '32px'}} icon={<ReloadOutlined />} onClick={refershMap}>Refresh</Button>
                                            <DatePicker style={{height: '48px', marginRight: '10px'}} className={'fleet-tracking-datepicker'} allowClear={false} value={dayjs(selectedDate)} onChange={onDateChange} />
                                            <Dropdown
                                                label="Choose Location"
                                                items={locationItems}
                                                value={locations}
                                                onChange={setLocaltions}
                                                />
                                        </div>
                                    </div>
                                    <div style={{display: 'flex', flexDirection: 'row', justifyContent: 'space-between', marginLeft: '0px', marginRight: '0px', width: '100%'}}>
                                        <THREEJSMap 
                                            reloadModels={reloadModels}
                                            ref={mapContainer}
                                            height={'calc(100vh - 292px)'} 
                                            width={'100%'} 
                                            defaultLayers={[]} 
                                            isLoading={isLoading} 
                                            setIsLoading={setIsLoading} 
                                            drawMarkers={drawMarkers} 
                                            updateAnnotations={updateAnnotations}
                                            isAnimation={!isAnimation}
                                        >
                                            {
                                                duringAnimation && <FloatingActionButton _viewType={viewType} setViewType={setViewType} />
                                            }
                                            <div style={{
                                                position: 'absolute',
                                                bottom: '-25px',
                                                left: '0px',
                                                margin : '12px', 
                                                width: 'calc(100% - 24px)',
                                                zIndex: 1,
                                                display: selectedEq ? 'block' : 'none'
                                            }}>
                                                <Card style={{marginBottom: '42px', opacity: '0.9', transition: 'opacity 1s ease, max-height 1s ease', display: showTimeline ? 'block' : 'none'}}>
                                                    <ReactApexChart options={apexOptions} series={series} type="area" height={200} />
                                                </Card>
                                                <div className="switch-timeline" onClick={() => setShowTimeline(!showTimeline)}>
                                                    {showTimeline ? <i className="fas fa-chevron-down"></i> : <i className="fas fa-chevron-up"></i>}
                                                </div>
                                            </div>
                                            <TimeSlider
                                                style={{display: selectedEq ? 'flex' : 'none'}}
                                                isPlaying={isPlaying}
                                                speed={speed}
                                                timeValue={timeValue}
                                                totalTime={totalTime}
                                                onTimeChange={handleTimeChange}
                                                onSpeedChange={handleSpeedChange}
                                                onPlayPauseToggle={togglePlay}
                                                onNext={handleNext}
                                                onPrev={handlePrev}
                                                onNextRoute={onNextRoute}
                                                onPrevRoute={onPrevRoute}
                                            />
                                            {equipments.map((annotation, index) => (
                                                <RippleIcon key={index} annotation={annotation} isLoading={isLoading} duringAnimation={duringAnimation} />
                                            ))}
                                            <div className="truck-tooltip" id="marker-tooltip" style={{display: isPlaying ? 'block' : 'none'}}>
                                                <div className="tooltiptext" dangerouslySetInnerHTML={{__html: markerToolTipContent}}></div>
                                            </div>
                                        </THREEJSMap>
                                        <Card style={{ height: 'calc(100vh - 240px)', width: '20%', marginLeft: '16px', padding: '16px', display: selectedEq ? 'block' : 'none', marginBottom: '0px' }}>
                                            <div style={{display: 'flex', flexDirection: 'row', justifyContent: 'space-between', fontSize: '20px', }}>
                                                <h3>{selectedEq ? selectedEq.name : 'Routes'}</h3>
                                                <span
                                                    className="truck-badge"
                                                    style={{ backgroundColor: 'green' }}
                                                    >
                                                    {'Healthy'}
                                                </span>
                                            </div>
                                            {selectedEq && 
                                                <div className="truck-sync-text">
                                                    <div
                                                    className="truck-badge-sync-icon"
                                                    onMouseEnter={handleSyncHover}
                                                    onMouseLeave={handleSyncHover}
                                                    >
                                                        <div className="img">{getSyncIcon(selectedEq.status, getMinutesDifference("2024-08-20T22:49:20.030Z"))}</div>
                                                        <div style={{paddingLeft:'6px'}}>
                                                            <em>{getSyncText(selectedEq.status, getMinutesDifference("2024-08-20T22:49:20.030Z"))}</em>
                                                        </div>
                                                    </div>
                                                </div>
                                            }
                                            <div style={{overflowY: 'auto', height: 'calc(100% - 100px)'}}>
                                                {routeData[0] && routeData[0].routes && _.map(routeData[0].routes, (route, index) => (
                                                    <Button
                                                        type="primary"
                                                        style={{margin: '5px'}}
                                                        onClick={() => selectTrip(route)}
                                                        key={`${route.id}-${index}`}
                                                        className={"replay-menu-item " + (selectedTrip?.id === route.id ? 'selected' : '')}
                                                    >
                                                        {route ? route.name : 'Test'}
                                                    </Button>
                                                ))}
                                            </div>
                                        </Card>
                                    </div>
                                </div>
                            </TabPane>
                            <TabPane tab="List View" key="2">
                                <ListView />
                            </TabPane>
                        </Tabs>
                        
                    </Row>
                </Container>
            </div>
        </React.Fragment >
    )
}

export default Replay;