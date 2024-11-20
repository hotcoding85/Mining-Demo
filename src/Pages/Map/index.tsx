import { MapPicker, Source, Map } from "Pages/ThreeJS/modules/Source";
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Card, CardBody, Col, Container, Row } from 'reactstrap';
import Breadcrumb from "Components/Common/Breadcrumb";
import { useDispatch, useSelector } from 'react-redux';
import './index.css'
import mapboxgl from 'mapbox-gl';
import { WindowResize } from 'Pages/ThreeJS/modules/WindowResize'
import { InfiniteGridHelper } from 'Pages/ThreeJS/modules/InfiniteGridHelper'
import * as THREE from "three";
import { MapControls } from 'three/examples/jsm/controls/OrbitControls';
import _ from 'lodash';
import { Checkbox, CheckboxProps, Progress, Segmented, Select, Space, Spin } from 'antd';
import 'antd/dist/reset.css';
import JSZip from '@turbowarp/jszip'
import * as Leaflet from 'leaflet';
import { getAllVehicleRoutes, getGeoFences } from 'slices/thunk';
import { DropdownType } from 'Components/Common/Dropdown';
import BACKGROUND from 'assets/images/3DPit/galaxy.jpg'
import BACKGROUND_LIGHT from 'assets/images/3DPit/daysky.png'
import { LAYOUT_MODE_TYPES } from "Components/constants/layout";
import { FenceSelector, LayoutSelector, VehicleRouteSelector } from 'selectors';
import mapLocationImage from "assets/images/map/map-location.png";
import { excavatorImages, truckImages } from "assets/images/equipment";
import { getRandomInt } from "utils/random";
import SyncIcon from "assets/icons/Vector.png";
import { CloseOutlined } from "@ant-design/icons";
import {
    dumpingPaths,
    EquipmentLocation,
    equipments,
    travellingPaths,
} from "./sample";
import { useNavigate, useParams } from "react-router-dom";
import { THREEJSMap } from "Pages/3DMap";

type Propertytype = {
    blockId: string;
    name: string;
    source: string;
    status: string;
    tonnes: number;
    volume: number;
    density: number;
    grade: number;
}

export const RealTimePositioning = ({ socket }) => {
    const dispatch: any = useDispatch();
    const navigate = useNavigate();
    const { equipmentId } = useParams();
    const layerOptions = ['Active Benches', 'Current Haul Routes', 'Future Road Designs', 'Speed Restrictions', 'Pit Bottom', 'Pit Climb', 'Stop Signs',        'Restricted', 'Dump Locations'];
    const defaultLayers = ['Active Benches'];

    const [checkedList, setCheckedList] = useState<string[]>(defaultLayers);
    const geoFences = useRef<any>([])
    const [filter, setFilter] = useState<string>("All Equipment");
    const onChange = (list: string[]) => {
        setCheckedList(list);
    };

    const onCheckAllChange: CheckboxProps['onChange'] = (e) => {
        setCheckedList(e.target.checked ? layerOptions : []);
    };

    socket.on("TRACKER_LOCATION", (data) => {
        console.log(data);
        // updateMarkerPosition(data.id, data.position);
    });

    const _layerOptions: DropdownType[] = [
        { label: 'Current Haul Routes', value: 'CURRENT_HAUL_ROUTES' },
        { label: 'Future Road Designs', value: 'FUTURE_ROAD_DESIGNS' },
        { label: 'Speed Restrictions', value: 'SPEED_RESTRICTIONS' },
        { label: 'Pit Bottom', value: 'PIT_BOTTOM' },
        { label: 'Pit Climb', value: 'PIT_CLIMB' },
        { label: 'Stop Signs', value: 'STOP_SIGNS' },
        { label: 'Restricted', value: 'RESTRICTED' },
    ];

    const { vehicleRoutes } = useSelector(VehicleRouteSelector);

    document.title = "Realtime Positioning | FMS Live";

    const { layoutModeType } = useSelector(LayoutSelector);
    const isLight = layoutModeType === LAYOUT_MODE_TYPES.LIGHT;

    const mapContainer = useRef<any>(null);
    const mapBoxContainer = useRef<HTMLDivElement | null>(null);
    const mapRef = useRef<any>(null);
    mapboxgl.accessToken = process.env.MAPBOX_API_KEY || 'pk.eyJ1IjoibXlreXRhcyIsImEiOiJjbTA1MGhtb3YwY3Y0Mm5uY3FzYWExdm93In0.cSDrE0Lq4_PitPdGnEV_6w';
    const [lng, setLng] = useState(120.44871814239025);
    const [lat, setLat] = useState(-29.1506602184213);
    const geojsonData = useRef<any>();

    // state for Map loading status
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [progress, setProgress] = useState(0); // Progress state
    let animationFrameId: number;
    let map: any;

    useEffect(() => {
        return () => {
            map && map.clean()
            if (dashAnimation.current) {
                clearInterval(dashAnimation.current)
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

    const updateAnnotations = useCallback(() => {
        if (!mapContainer.current || !window.map) return
        const mapContainerElement = mapContainer.current.getMapContainer();
        const center = {
            tileX: window.map.center.x,
            tileY: window.map.center.y
        }
        eqMarkers.forEach((annotation: any, index) => {
            if (!annotation) return
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
                
                annotationDiv.style.display = isInViewport ? 'block' : 'none';
            }
        });
    }, [])

    useEffect(() => {
        dispatch(getAllVehicleRoutes())
        dispatch(getGeoFences()); // Dispatch action to fetch data on component mount
    }, [dispatch]);

    const travellingLine = useRef<any>([])
    const travellingLineCurve = useRef<any>([])
    const dumpinglingLine = useRef<any>([])
    const dashAnimation = useRef<any>(null)
    const animatedDashes = (() => {
        const dashArraySequence = [
            [50, 20],   // Initial dash and gap size
            [45, 25],    // Larger dash, smaller gap
            [40, 30],    // Smaller dash, larger gap
            [35, 35],   // Back to original size
            [30, 40],    // Larger dash, even smaller gap
            [25, 45],
            [20, 50],
            [25, 45],
            [30, 40],
            [35, 35],    // Smaller dash, larger gap
            [40, 30],
            [45, 25],
        ];
        if (window.map) {
            function flattenPositions(positions, offset = 0) {
                
                // Case 1: positions is an array of THREE.Vector3
                if (Array.isArray(positions) && positions[0] instanceof THREE.Vector3) {
                    return positions.reduce((acc, vector) => {
                        acc.push(vector.x + offset, vector.y + offset, vector.z);
                        return acc;
                    }, []);
                }
                
                // Case 2: positions is a THREE.BufferAttribute
                else if (positions instanceof THREE.BufferAttribute) {
                    return Array.from(positions.array); // Already flat, just convert to a regular array if needed
                }
                
                // Case 3: positions is something else (e.g., an empty object or undefined)
                else {
                    throw new Error("Unsupported format for positions");
                }
            }
            function createLine(positions, color, offset = 0) {
                const curve = new THREE.CatmullRomCurve3(positions);
                // window.map.scene.add(curveLine);

                const totalLength = curve.getLength();
                const deltaDistance = 100; // Set a constant distance between arrowheads
                const numArrows = Math.floor(totalLength / deltaDistance);
                const arrows: any = []
                for (let i = 0; i <= numArrows; i++) {
                    const distance = (i * deltaDistance) / totalLength;
                    // Get position and tangent at this normalized distance along the curve
                    const position = curve.getPointAt(distance);
                    const tangent = curve.getTangentAt(distance);
                
                    // Create an arrowhead
                    const headGeometry = new THREE.ConeGeometry(12, 1, 3); // Customize as needed
                    const headMaterial = new THREE.MeshBasicMaterial({ color: color, depthTest: false, transparent: true });
                    const arrowhead = new THREE.Mesh(headGeometry, headMaterial);
                    // Position the arrowhead at the point along the curve
                    arrowhead.position.set(position.x, position.y, position.z);
                
                    // Orient the arrowhead to follow the tangent at this point
                    arrowhead.lookAt(position.clone().add(tangent));
                    arrowhead.rotation.z += Math.PI / 2; // Adjust rotation if necessary
                    arrows.push({ mesh: arrowhead, initialDistance: distance });
                    // Add the arrowhead to the scene
                    window.map.scene.add(arrowhead);
                }
                color === 0xffff00 && travellingLine.current.push({arrow: arrows, curve: curve})
                const mainLinePoints = curve.getPoints(100);
                const delta = 15; // Offset distance in world units (adjust as needed)
                const leftLinePoints: THREE.Vector3[] = [];
                const rightLinePoints: THREE.Vector3[] = [];
        
                for (let i = 0; i < mainLinePoints.length; i++) {
                    const point = mainLinePoints[i];
                    const tangent = curve.getTangent(i / (mainLinePoints.length - 1)).normalize();
        
                    // Calculate perpendicular vector
                    const perpendicular = new THREE.Vector3(-tangent.y, tangent.x, 0).normalize();
        
                    // Create offset points
                    const leftPoint = point.clone().add(perpendicular.clone().multiplyScalar(delta));
                    const rightPoint = point.clone().add(perpendicular.clone().multiplyScalar(-delta));
        
                    leftLinePoints.push(leftPoint);
                    rightLinePoints.push(rightPoint);
                }

                const _createTube = (points: THREE.Vector3[], color: number) => {
                    const tubeRadius = 2; // Adjust the radius as needed
                    const tubeSegments = 100;
                    const radialSegments = 8;
                    const _curve = new THREE.CatmullRomCurve3(points);
                    const TubeGeometry = new THREE.TubeGeometry(_curve, tubeSegments, tubeRadius, radialSegments, false);
                    const tubeMaterial = new THREE.MeshBasicMaterial({ color: color, depthTest: false, transparent: true }); // Blue for left tube
                    return new THREE.Mesh(TubeGeometry, tubeMaterial);
                };
        
                const leftLine = _createTube(leftLinePoints, color); // Blue line
                const rightLine = _createTube(rightLinePoints, color); // Blue line

                if (window.map && window.map.scene) {
                    window.map.scene.add(leftLine)
                    window.map.scene.add(rightLine)
                }
            }

            // Create multiple lines with offsets to simulate thickness
            function createThickLine(points, color, type = 'travellingLine') {
                // Draw the main line
                type === 'travellingLine' ? createLine(points, 0xffff00) : dumpinglingLine.current.push(createLine(points, 0x00ff00))
            }
            
            // Create lines for travellingPaths and dumpingPaths
            const features = travellingPaths.features
            features.forEach((feature) => {
                const coordinates = feature.geometry.coordinates;
                if (coordinates.length === 0) return;
            
                let points = coordinates.map(coord => {
                    const tileData = window.map.convertGeoToPixel(coord[1], coord[0]);
                    const center = {
                        tileX: window.map.center.x,
                        tileY: window.map.center.y
                    };
                    const worldPos = window.map.calculateWorldPosition(
                        center, tileData.tileX, tileData.tileY, tileData.tilePixelX, tileData.tilePixelY, 512
                    );
                    
                    // Get elevation data for the first point
                    const elevationValue = window.map.getElevationAt([tileData.tilePixelX, tileData.tilePixelY], tileData.tileX, tileData.tileY);
                    
                    return new THREE.Vector3(worldPos.x, worldPos.y, elevationValue * 2 + 3); // Multiply elevation for emphasis if needed
                });
            
                // Push the created line to the travellingLine array
                createThickLine(points, 0xffff00);
            });
            const dumpingFeatures = dumpingPaths.features
            // Create dumping line once (outside the loop)
            dumpingFeatures.forEach((feature) => {
                const coordinates = feature.geometry.coordinates;
                if (coordinates.length === 0) return;
            
                let points = coordinates.map(coord => {
                    const tileData = window.map.convertGeoToPixel(coord[1], coord[0]);
                    const center = {
                        tileX: window.map.center.x,
                        tileY: window.map.center.y
                    };
                    const worldPos = window.map.calculateWorldPosition(
                        center, tileData.tileX, tileData.tileY, tileData.tilePixelX, tileData.tilePixelY, 512
                    );
                    
                    // Get elevation data for the first point
                    const elevationValue = window.map.getElevationAt([tileData.tilePixelX, tileData.tilePixelY], tileData.tileX, tileData.tileY);
                    
                    return new THREE.Vector3(worldPos.x, worldPos.y, elevationValue * 2 + 3); // Multiply elevation for emphasis if needed
                });
            
                // Push the created line to the dumpinglingLine array
                createThickLine(points, 0xffff00, 'dumpinglingLine'); // Yellow
            });

            function animateDashes() {
                
                travellingLine.current.forEach((item) => {
                    const arrow = item.arrow;
                    const curve = item.curve;
                    for (let i = 0 ; i < arrow.length ; i ++) {
                        const arr = arrow[i]
                        // Increase the distance along the curve to create forward motion
                        arr.initialDistance += 0.01; // Adjust speed as needed
                        
                        if (arr.initialDistance > 1) arr.initialDistance -= 1;
                        const position = curve.getPointAt(arr.initialDistance); // Normalize the distance
                        const tangent = curve.getTangentAt(arr.initialDistance);
                        arr.mesh.position.copy(position);
                        arr.mesh.lookAt(position.clone().add(tangent));
                        arr.mesh.rotation.z += Math.PI / 2;
                    }
                });
                
                // dashAnimation.current = requestAnimationFrame(animateDashes);
            }

            // Start the animation loop with setInterval
            function startDashAnimation() {
                dashAnimation.current = setInterval(() => {
                    animateDashes()
                }, 300)
            }

            // Start the dash animation
            startDashAnimation();
        }
    })

    useEffect(() => {
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
    }, []); // Added dependencies to reinitialize map if lat/lng changes
    
    useEffect(() => {
        if (!isLoading) {
            if (equipmentId) {
                const equipment = _.find(equipments, _eq => _eq.id === equipmentId)
                equipment && setSelectedEq(equipment)
                let clickedMarker: any = null
                _.map(clickableSprites.current, _marker => {
                    if (_marker.userData.data.id === equipmentId) {
                        clickedMarker = _marker
                    }
                })
                animateCameraToMarker(clickedMarker)
            }
            window.map && animatedDashes()
        }
    }, [isLoading])
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

    const animateCameraToMarker = (marker) => {
        if (!window.map) return;
        let animationCameraId = 0
        const startPosition = window.map.camera.position.clone();
        const point = marker.position.clone(); // Zoom offset
        const targetPosition = new THREE.Vector3(point.x, point.y, point.z + 1000)
        // Animate the camera movement
        const zoomDuration = 1000; // 1 second
        let startTime: number | null = null;
        window.isAnimation = true
        window.controls && (window.controls.enabled = false)
        // Initial rotation of the camera
        const animateZoom = (time: number) => {
            if (startTime === null) startTime = time;
            const _elapsed = time - startTime;
            const progress = Math.min(_elapsed / zoomDuration, 1);

            window.camera.position.lerpVectors(startPosition, targetPosition, progress);
            // THREE.Quaternion.slerp(startQuaternion, targetQuaternion, window.camera.quaternion, progress);
            window.controls.target.lerpVectors(startPosition, point, progress);
            window.savedCameraPosition = window.camera.position.clone();
            window.savedCameraQuaternion = window.camera.quaternion.clone();
            window.camera.updateProjectionMatrix();
            window.camera.updateMatrixWorld();
            if (progress < 1) {
                animationCameraId = requestAnimationFrame(animateZoom);
            } 
            else{
                window.isAnimation = false
                setTimeout(() => {
                    window.controls.update()
                    window.renderer.render(window.map.scene, window.camera)
                    window.controls && (window.controls.enabled = true)
                }, 100);
            }
        };

        animationCameraId = requestAnimationFrame(animateZoom);
    };

    // Array to hold all clickable sprites
    const clickableSprites = useRef<any>([]);
    const [selectedEq, setSelectedEq] = useState<any>(null)
    const RippleIcon = ({ annotation, isLoading }) => {    
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
            display: isLoading ? 'none' : 'block',
            opacity: 0.8
        };
        let clickedMarker: any = null
        _.map(clickableSprites.current, _marker => {
            if (_marker.userData.data.id === annotation.id) {
                clickedMarker = _marker
            }
        })

        const relocation = equipmentId ? './../' + annotation.id : annotation.id
        return (
            <div id={`annotation-${annotation.id}`} className="marker-tooltip" style={{ position: 'absolute' }} onClick={() => {setSelectedEq(annotation); navigate(`${relocation}`); clickedMarker && animateCameraToMarker(clickedMarker);}}>
                <div id={`annotation-image-${annotation.id}`} style={textStyle}>
                    <img width="28px" style={{ objectFit: 'contain' }} src={getEquipmentStatusIcon(annotation)} alt="equipment-image" />
                    {annotation.name}
                </div>
                <div id={`annotation-marker-${annotation.id}`} style={{ position: 'absolute', bottom: 0, transform: 'translateX(-40%)', display: isLoading ? 'none' : 'block' }}>
                    <img src={mapLocationImage} alt="Description of the image" />
                </div>
            </div>
        );
    };

    const drawMarkers = useCallback(() => {
        if (!mapContainer.current || !window.map) return;
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
            marker.scale.set(1, 1, 1);
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

    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    const [showToolTip, setShowToolTip] = useState<boolean>(false)
    const [properties, setProperties] = useState<Propertytype | null>(null)

    useEffect(() => {
        const selectedCategories = _layerOptions
            .filter(option => checkedList.includes(option.label)) // Get matching label from _layerOptions
            .map(option => option.value); // Extract corresponding values (categories)
        window.map && window.map.setFilteredCategories(selectedCategories)
    }, [vehicleRoutes, checkedList])

    const checkAll = layerOptions.length === checkedList.length;
    const indeterminate = checkedList.length > 0 && checkedList.length < layerOptions.length;
    const CheckboxGroup = Checkbox.Group;

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

    return (
        <>
            <React.Fragment>
                <div className="page-content" style={{paddingBottom: '0px'}}>
                    <Container fluid>
                    <Breadcrumb title="Home" breadcrumbItem="Realtime Positioning" />
                    <Row>
                        <Col md="12" className='mb-4 d-flex flex-row-reverse'>
                            <Space>
                                <Segmented className="customSegmentLabel customSegmentBackground" value={filter} onChange={(e) => setFilter(e)} options={['All Equipment', { label: 'Excavators', value: 'EXCAVATOR' }, { label: 'Trucks', value: 'DUMP_TRUCK' }, { label: 'Loaders', value: 'LOADER' }, { label: 'Drillers', value: 'DRILLER' }, { label: 'Dozers', value: 'DOZER' }]} />
                            </Space>
                        </Col>
                    </Row>
                    <Row>
                        <Col lg="12">
                        <div className="d-flex" style={{marginBottom: '20px' }}>
                            <div style={{ alignContent: 'center'}}>
                                <Checkbox indeterminate={indeterminate} onChange={onCheckAllChange} checked={checkAll}>
                                All
                                </Checkbox>
                                <CheckboxGroup options={layerOptions} value={checkedList} onChange={onChange} />
                            </div>
                            {/* <div style={{ alignContent: "center", justifyContent: "end" }}>
                                <Select
                                placeholder="Filter By Category"
                                showSearch
                                options={[
                                    { label: "All Equipment", value: "All Equipment" },
                                    { label: "Excavators", value: "EXCAVATOR" },
                                    { label: "Trucks", value: "DUMP_TRUCK" },
                                    { label: "Loaders", value: "LOADER", disabled: true },
                                    { label: "Drillers", value: "Drillers", disabled: true },
                                    { label: "Dozers", value: "Dozers", disabled: true },
                                ]}
                                style={{ width: "150px" }}
                                />
                            </div> */}
                        </div>
                        <THREEJSMap 
                            ref={mapContainer} 
                            defaultLayers={checkedList} 
                            drawMarkers={drawMarkers} 
                            updateAnnotations={updateAnnotations} 
                            isLoading={isLoading}
                            setIsLoading={setIsLoading}
                        >
                            <>
                            {equipments.map((annotation, index) => (
                                <RippleIcon isLoading={isLoading} key={index} annotation={annotation} />
                            ))}
                            {selectedEq && (
                                <Card
                                    className="p-3 card-status"
                                    style={{
                                    position: "absolute",
                                    width: "20%",
                                    bottom: "10px",
                                    right: "0px",
                                    }}
                                >
                                    <button
                                        onClick={() => {setSelectedEq(null); navigate('./../')}} // Handle click event
                                        style={{ border: 'none', background: 'transparent', padding: 0, position: 'absolute', color: 'white', right: '10px', top: '7px', fontSize: '14px' }} // Optional: Adjust padding if needed
                                    >
                                        <CloseOutlined />
                                    </button>
                                    <div className="d-flex justify-content-between" style={{marginTop: '15px'}}>
                                    <div style={{ display: "flex", alignItems: "baseline" }}>
                                        <span
                                        style={{
                                            fontSize: "1.2em",
                                            fontWeight: "500",
                                            color: "white",
                                        }}
                                        >
                                        {selectedEq.name}
                                        </span>
                                    </div>
                                    <div>
                                        <span
                                        className="card-status"
                                        style={{
                                            backgroundColor: getStateColor(
                                            selectedEq.status
                                            ),
                                        }}
                                        >
                                        {selectedEq.status}
                                        </span>
                                    </div>
                                    </div>

                                    <span
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        fontStyle: "italic",
                                        fontSize: "small",
                                    }}
                                    >
                                    <img
                                        src={SyncIcon}
                                        alt="Sync Icon"
                                        style={{
                                        marginRight: "5px",
                                        }}
                                    />
                                    Synced {getRandomInt(0, 5)}h ago
                                    </span>
                                    <div className="assigned-truck-details mt-2">
                                    <div className="assigned-truck-progress">
                                        <p className="progress-text">
                                        <span className="progress-label">
                                            Total Planned Load
                                        </span>
                                        <span className="progress-value">23/35</span>
                                        </p>
                                        <Progress percent={66} showInfo={false} />
                                    </div>
                                    <div
                                        className="d-flex flex-column"
                                        style={{ width: "100%" }}
                                    >
                                        <p className="truck-props">
                                        <span className="props-label">Avg Load Time</span>
                                        <span className="props-value">04:21</span>
                                        </p>
                                        <p className="truck-props">
                                        <span className="props-label">Tonnes per hour</span>
                                        <span className="props-value">50t</span>
                                        </p>
                                        <p className="truck-props">
                                        <span className="props-label">
                                            Operational Delays
                                        </span>
                                        <span className="props-value">06:13</span>
                                        </p>
                                        <p className="truck-props">
                                        <span className="props-label">
                                            Number of Operational Delay Events
                                        </span>
                                        <span className="props-value">5</span>
                                        </p>
                                        <p className="truck-props cycle-time">
                                        <span className="props-label">
                                            Total Previous Cycle Time
                                        </span>
                                        <div
                                            className="cycle-time-container"
                                            style={{ gap: "6px" }}
                                        >
                                            <span className="time-chips">13:30</span>
                                            <span className="time-chips">14:27</span>
                                            <span className="time-chips">15:37</span>
                                            <span className="time-chips">15:44</span>
                                        </div>
                                        </p>
                                    </div>
                                    </div>
                                </Card>
                                )}
                            </>
                            </THREEJSMap>
                        </Col>
                    </Row>
                    </Container>
                </div>
            </React.Fragment >
        </>
    )
}