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
import { Checkbox, CheckboxProps, Progress, Select, Spin } from 'antd';
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
import { standbyTruck, delayTruck, downTruck, activeTruck, standbyExcavator, delayExcavator, downExcavator, activeExcavator } from 'assets/images/map';
import { getRandomInt } from "utils/random";
import SyncIcon from "assets/icons/Vector.png";
import { CloseOutlined } from "@ant-design/icons";
import {
    dumpingPaths,
    EquipmentLocation,
    equipments,
    travellingPaths,
} from "./sample";

declare global {
    interface Window {
        map: any;
        mapPicker: any;
        controls: any;
        camera: any
    }
}
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
interface Geofence {
    id: number,
    name: string;
    layer: Leaflet.Layer | null;  // Make layer nullable
}
export const RealTimePositioning = ({ socket }) => {
    const dispatch: any = useDispatch();

    const layerOptions = ['Active Benches', 'Current Haul Routes', 'Future Road Designs', 'Speed Restrictions', 'Pit Bottom', 'Pit Climb', 'Stop Signs',        'Restricted', 'Dump Locations'];
    const defaultLayers = ['Current Haul Routes', 'Active Benches'];

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

    const mapContainer = useRef<HTMLDivElement | null>(null);
    const mapBoxContainer = useRef<HTMLDivElement | null>(null);
    const mapRef = useRef<any>(null);
    mapboxgl.accessToken = process.env.MAPBOX_API_KEY || 'pk.eyJ1IjoibXlreXRhcyIsImEiOiJjbTA1MGhtb3YwY3Y0Mm5uY3FzYWExdm93In0.cSDrE0Lq4_PitPdGnEV_6w';
    const [lng, setLng] = useState(120.44871814239025);
    const [lat, setLat] = useState(-29.1506602184213);
    const geojsonData = useRef<any>();

    // state for Map loading status
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [progress, setProgress] = useState(0); // Progress state
    let animationFrameId: number;
    let map: any;

    const updateAnnotations = useCallback(() => {
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
            
            const x = (screenPosition.x * 0.5 + 0.5) * (mapContainer.current.clientWidth);
            const y = -(screenPosition.y * 0.5 - 0.5) * (mapContainer.current.clientHeight);
            
            const annotationDiv = document.getElementById(`annotation-${annotation.userData.data.id}`);

            if (annotationDiv) {
                annotationDiv.style.left = `${x}px`;
                annotationDiv.style.top = `${y}px`;
                const isInViewport = (
                    x >= 50 && x <= (mapContainer.current.clientWidth - 50) &&
                    y >= 50 && y <= (mapContainer.current.clientHeight - 25)
                );
                
                annotationDiv.style.display = isInViewport && !isLoading ? 'block' : 'none';
            }
        });
    }, [isLoading])

    useEffect(() => {
        dispatch(getAllVehicleRoutes())
        dispatch(getGeoFences()); // Dispatch action to fetch data on component mount
    }, [dispatch]);

    const travellingLine = useRef<any>([])
    const dumpinglingLine = useRef<any>([])
    const animatedDashes = (() => {
        const dashArraySequence = [
            [10, 10],   // Initial dash and gap size
            [12, 8],    // Larger dash, smaller gap
            [8, 12],    // Smaller dash, larger gap
            [10, 10],   // Back to original size
            [14, 6],    // Larger dash, even smaller gap
            [6, 14],    // Smaller dash, larger gap
        ];
        if (window.map) {
            function flattenPositions(positions) {
                
                // Case 1: positions is an array of THREE.Vector3
                if (Array.isArray(positions) && positions[0] instanceof THREE.Vector3) {
                    return positions.reduce((acc, vector) => {
                        acc.push(vector.x, vector.y, vector.z);
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
            function createLine(positions, color) {
                const geometry = new THREE.BufferGeometry();
                const vertices = new Float32Array(flattenPositions(positions));
                geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
              
                const material = new THREE.LineDashedMaterial({
                  color: color,
                  linewidth: 4, // Only works in WebGL1
                  scale: 10, // Scale of the dashes
                  dashSize: 10, // Length of the dashes
                  gapSize: 10, // Length of the gaps
                  depthTest: false,
                  depthWrite: false,
                  transparent: true
                });
              
                // Use THREE.Line for continuous lines, not LineSegments
                const line = new THREE.Line(geometry, material);
                line.computeLineDistances(); // Required for dashed lines
                window.map.scene.add(line);
              
                return line;
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
                travellingLine.current.push(createLine(points, 0xffff00)); // Yellow
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
                dumpinglingLine.current.push(createLine(points, 0xffff00)); // Yellow
            });

            let dashStep = 0;

            let dashInterval; // Store the interval ID for future reference
            const dashDelay = 200; // Delay between each update (in milliseconds)

            function animateDashes() {
                _.map(travellingLine.current, _travellingLine => {
                    // Safeguard: Ensure the step does not accidentally reset the line dashes
                    if (_travellingLine.material.dashSize !== dashArraySequence[dashStep][0] || 
                        _travellingLine.material.gapSize !== dashArraySequence[dashStep][1]) {
                        
                        _travellingLine.material.dashSize = dashArraySequence[dashStep][0];
                        _travellingLine.material.gapSize = dashArraySequence[dashStep][1];
                        _travellingLine.material.needsUpdate = true; // Force material update
                    }
                });

                dashStep = (dashStep + 1) % dashArraySequence.length; // Loop through the dash sequence
            }

            // Start the animation loop with setInterval
            function startDashAnimation() {
                dashInterval = setInterval(animateDashes, dashDelay);
            }

            // Stop the animation if needed
            function stopDashAnimation() {
                clearInterval(dashInterval);
            }

            // Start the dash animation
            startDashAnimation();
        }
    })

    useEffect(() => {
        setIsLoading(true);
        fetchGeofences()
        fetchZipFile()
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
    

    const fetchZipFile = async () => {
        const zipBuffer = await fetch('./240817_Pits_3D_WGS84.zip').then(response => response.arrayBuffer())
        JSZip.loadAsync(zipBuffer).then(data => {
            return data.file('240817_Pits_3D_WGS84.geojson')?.async("string");
        }).then((text) => {
            var geojsonData = JSON.parse(text as string)
            processZipFile(geojsonData)
        })
    }
    const processZipFile = async (geojsonData) => {
        // Fetch the ZIP file and get its ArrayBuffer
        const zipBuffer = await fetch('./images.zip').then(response => response.arrayBuffer());
        
        // Initialize an object to hold image data
        const image_data = {};
        
        // Load the ZIP file using JSZip
        const zip = await JSZip.loadAsync(zipBuffer);
    
        // Create an array to hold promises
        const promises: any = [];
    
        // Iterate through each file in the ZIP
        zip.forEach((relativePath, file) => {
            // Check if the file is a WebP image
            if (file.name.endsWith('.webp')) {
                // Create a promise for each image processing
                const promise = file.async('arraybuffer').then(data => {
                    // Extract the filename without extension
                    const fileNameWithoutExtension = file.name.replace(/\.[^/.]+$/, "");
                    // Store the image data in the object
                    image_data[fileNameWithoutExtension] = data;
                });
                promises.push(promise);
            }
        });
    
        // Wait for all promises to resolve
        await Promise.all(promises);
    
        loadMapView(geojsonData, image_data);
    };
    const fetchGeofences = async () => {
        const fences = await fetch('./SWK_S01_422.geojson')
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
        }
    }

    const loadMapView = (_geojsonData: JSON, image_data) => {
        geojsonData.current = _geojsonData;
    
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1e6);

        camera.up = new THREE.Vector3(0, 0, 1);
        camera.position.set(0, -1000, 700);
        camera.updateMatrixWorld();
        camera.updateProjectionMatrix();
        window.camera = camera
        const renderer = new THREE.WebGLRenderer({
            antialias: false,
            alpha: true,
            logarithmicDepthBuffer: false,
        });

        if (mapContainer.current) {
            renderer.domElement.className = "threejs-view";
            mapContainer.current.appendChild(renderer.domElement);
            mapRef.current = renderer.domElement
            mapRef.current.addEventListener('mousemove', onDocumentMouseMove , false);
        }

        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        renderer.setSize(window.innerWidth, window.innerHeight);

        const controls = new MapControls(camera, renderer.domElement);
        controls.autoRotate = false;
        controls.maxPolarAngle = Math.PI * 0.3;
        window.controls = controls;
        
        // Load the background image using THREE.TextureLoader
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

        // scene.background = new THREE.Color(0x91abb5);
        scene.fog = new THREE.FogExp2(0x91abb5, 0.000001);

        const ambientLight = new THREE.AmbientLight(0x404040, 2);
        const dirLight = new THREE.DirectionalLight(0xffffff, 1.5);
        dirLight.castShadow = true;
        dirLight.position.set(10000, 10000, 10000);
        scene.add(ambientLight);
        scene.add(dirLight);

        const position = [lat, lng];
        const source = new Source('mapbox', mapboxgl.accessToken);
        let nTiles = 24;
        let zoom = 18
        const map = new Map(scene, camera, source, position, nTiles, zoom, {}, _geojsonData, image_data);
        window.map = map;
        console.log(map)
        const mapPicker = new MapPicker(camera, map, mapContainer.current, controls);
        window.mapPicker = mapPicker;


        const grid: any = new InfiniteGridHelper(128, 256);
        scene.add(grid);

        // set routes to the map variable
        map.setRoutes(vehicleRoutes)
        // set default categories
        const selectedCategories = _layerOptions
        .filter(option => checkedList.includes(option.label)) // Get matching label from _layerOptions
        .map(option => option.value); // Extract corresponding values (categories)
        map.setFilteredCategories(selectedCategories)
        // draw the routes only one time
        let drawed = false
        // Main render loop
        const mainLoop = (timestamp: number) => {
            animationFrameId = requestAnimationFrame(mainLoop);
            if (map.progress >= nTiles * nTiles) {
                setIsLoading(false);
                if (!drawed){
                    map.drawRoutes()
                    drawGeofences()
                    drawMarkers()

                    animatedDashes()
                    drawed = true
                }
            } else {
                setProgress((prev) => (Math.min(Math.floor(map.progress / (nTiles * nTiles) * 100), 100)));
            }
            updateAnnotations()
            renderer.render(scene, camera);
            controls.update();
        };
        mainLoop(0);
        WindowResize(renderer, camera);

        return () => {
            mapRef.current.removeEventListener('mousemove', onDocumentMouseMove , false);
            mapRef.current.remove()
        };
    }

    const eqMarkers: any = []
    const getEquipmentStatusIcon = (eq: EquipmentLocation) => {
        if (eq.vehicleType == 'EXCAVATOR') {
            switch (eq.status) {
                case 'ACTIVE':
                    return activeExcavator;
                case 'STANDBY':
                    return standbyExcavator;
                case 'DOWN':
                    return downExcavator;
                case 'DELAY':
                    return delayExcavator;
            }
    
        } else if (eq.vehicleType == 'DUMP_TRUCK') {
            switch (eq.status) {
                case 'ACTIVE':
                    return activeTruck;
                case 'STANDBY':
                    return standbyTruck;
                case 'DOWN':
                    return downTruck;
                case 'DELAY':
                    return delayTruck;
            }
        }
    }

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

    // Array to hold all clickable sprites
    const clickableSprites = useRef<any>([]);
    const [selectedEq, setSelectedEq] = useState<any>(null)
    const RippleIcon = ({ annotation }) => {    
        const textStyle: any = {
            position: 'absolute',
            top: '-65px',
            left: '-50px',
            background: annotation.color,
            borderRadius: '20px',
            fontSize: '1rem',
            color: 'white',
            fontWeight: 600,
            padding: '6px 16px',
            width: '120px',
            textAlign: 'center',
        };
    
        return (
            <div id={`annotation-${annotation.id}`} className="marker-tooltip" style={{ position: 'absolute' }} onClick={() => setSelectedEq(annotation)}>
                <div style={textStyle}>
                    <img width="28px" style={{ objectFit: 'contain' }} src={getEquipmentStatusIcon(annotation)} alt="equipment-image" />
                    {annotation.name}
                </div>
                <div style={{ position: 'absolute', bottom: 0, transform: 'translateX(-40%)' }}>
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

    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    const [showToolTip, setShowToolTip] = useState<boolean>(false)
    const [properties, setProperties] = useState<Propertytype | null>(null)
    const onDocumentMouseMove = useCallback((event) => {
        if (!mapContainer.current) return
        // Normalize mouse position to -1 to 1 range
        const rect = mapContainer.current.getBoundingClientRect();
        mouse.x = ((event.clientX - rect.left) / mapContainer.current.clientWidth) * 2 - 1;
        mouse.y = -((event.clientY - rect.top) / mapContainer.current.clientHeight) * 2 + 1;
        // Update raycaster with the mouse position and the camera
        window.map.camera.updateProjectionMatrix();
        window.map.camera.updateMatrixWorld();
        raycaster.setFromCamera(mouse, window.map.camera);
        
        const x = (mouse.x * 0.5 + 0.5) * mapContainer.current.clientWidth;
        const y = -(mouse.y * 0.5 - 0.5) * mapContainer.current.clientHeight;
        // Check for intersections with clickable sprites
        const intersects = raycaster.intersectObjects(window.map.scene.children, true);
        // Change cursor style based on intersection
        if (intersects.length > 0) {
            const intersectedObject = intersects[0].object;
            if (intersectedObject.userData && intersectedObject.userData.isGeoFence) {
                document.body.style.cursor = 'pointer'; // Change to desired cursor style
                setShowToolTip(true)
                setProperties(intersectedObject.userData.properties)

                const tooltipRef = document.getElementById(`tooltipRef`);
                if (tooltipRef) {
                    tooltipRef.style.left = `${x - 120}px`;
                    tooltipRef.style.top = `${y - 270}px`;
                }
            }
            else{
                document.body.style.cursor = 'auto'; // Default cursor style
                setShowToolTip(false)
            }
        } else {
            document.body.style.cursor = 'auto'; // Default cursor style
            setShowToolTip(false)
        }
    }, [showToolTip])

    useEffect(() => {
        const selectedCategories = _layerOptions
            .filter(option => checkedList.includes(option.label)) // Get matching label from _layerOptions
            .map(option => option.value); // Extract corresponding values (categories)
        window.map && window.map.setFilteredCategories(selectedCategories)
    }, [vehicleRoutes, checkedList])


    const drawGeofences = useCallback(() => {
        if (geoFences.current.length === 0 || !window.map) return

        const center = {
            tileX: window.map.center.x,
            tileY: window.map.center.y
        }
        _.map(geoFences.current, _fence => {
            if (_fence.geometry.coordinates[0].length === 0) return

            const properties = _fence.properties
            const shape = new THREE.Shape();

            _.map(_fence.geometry.coordinates[0], (coord: [number, number, number], index: number) => {
                const tileData = window.map.convertGeoToPixel(coord[1], coord[0])
                const tileX = tileData.tileX;          // tile X coordinate of the point
                const tileY = tileData.tileY;          // tile Y coordinate of the point
                const tilePixelX = tileData.tilePixelX; // pixel X position inside the tile
                const tilePixelY = tileData.tilePixelY; // pixel Y position inside the tile
                
                const worldPos = window.map.calculateWorldPosition(center, tileX, tileY, tilePixelX, tilePixelY, 512);
                const point = new THREE.Vector3(worldPos.x, worldPos.y, (coord[2] - 400) * 2);
                if (index === 0) {
                    shape.moveTo(point.x, point.y);
                } else {
                    shape.lineTo(point.x, point.y);
                }
            })
            // Extrude geometry based on the shape and elevation
            const extrudeSettings = {
                steps: 1,                    // Number of points along the path
                depth:  (_fence.properties.altitude - 400) * 2,                   // Extrude along the Z axis (depth)
                bevelEnabled: true,          // No bevel for the shape
            };
            shape.autoClose = true;
            // Create the geometry and material
            const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
            const material = new THREE.MeshBasicMaterial({ 
                color: properties.fillColor, 
                opacity: 1 // Adjust opacity if needed
            });
            
            // Create the mesh and add it to the scene
            const mesh = new THREE.Mesh(geometry, material);
            mesh.renderOrder = 0
            mesh.userData = { isGeoFence: true, properties: properties }
            window.map.scene.add(mesh);
        })
    }, [geoFences])

    const checkAll = layerOptions.length === checkedList.length;
    const indeterminate = checkedList.length > 0 && checkedList.length < layerOptions.length;
    const CheckboxGroup = Checkbox.Group;

    return (
        <>
            <React.Fragment>
                <div className="page-content" style={{paddingBottom: '0px'}}>
                    <Container fluid>
                    <Breadcrumb title="Home" breadcrumbItem="Realtime Positioning" />
                    <Row>
                        <Col lg="12">
                        <div className="d-flex" style={{marginBottom: '20px' }}>
                            <div style={{ alignContent: 'center'}}>
                                <Checkbox indeterminate={indeterminate} onChange={onCheckAllChange} checked={checkAll}>
                                All
                                </Checkbox>
                                <CheckboxGroup options={layerOptions} value={checkedList} onChange={onChange} />
                            </div>
                            <div style={{ alignContent: "center", justifyContent: "end" }}>
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
                            </div>
                        </div>
                        <Card className='threejs-view-card-header'>
                            <CardBody className='threejs-view-body' style={{height: 'calc(100vh - 240px)'}}>
                                {isLoading ? (
                                    <>
                                        <div className="loading-overlay" style={{top: "calc(50vh - 151px)", position: 'absolute', width: 'calc(100% - 20px)', height: '50%', left: '10px'}}>
                                            <Spin className='map-loading-bar' style={{color: 'gold'}} tip="Loading...">
                                                <Progress className='map-loading-progress-bar' percent={progress} status="active" />
                                            </Spin>
                                        </div>
                                    </>
                                    ) : (
                                        <></>
                                    )}
                                <div ref={mapContainer} style={{ width: '100%', height: "calc(100%)", opacity: isLoading ? '0.05' : '1'}} >
                                    {equipments.map((annotation, index) => (
                                        isLoading ? <></> : <RippleIcon key={index} annotation={annotation} />
                                    ))}
                                    {selectedEq && (
                                        <Card
                                            className="p-3 card-status"
                                            style={{
                                            position: "absolute",
                                            width: "20%",
                                            top: "10px",
                                            right: "10px",
                                            }}
                                        >
                                            <button
                                                onClick={() => setSelectedEq(null)} // Handle click event
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
                                </div>
                                <div id='tooltipRef' style={{display: showToolTip ? 'block' : 'none'}} className='geofence-tooltip'>
                                    <table
                                        style={{
                                        fontFamily: "arial, sans-serif",
                                        borderCollapse: "collapse",
                                        width: "100%",
                                        }}
                                    >
                                        <tbody>
                                        {properties && Object.entries(properties).map(([key, value], index) => {
                                            if (key != "id" && key != "locationId") {
                                                return (
                                                    <tr key={key}>
                                                        <td style={{ padding: "4px" }} className='geofence-property-key'>{key}</td>
                                                        <td style={{ padding: "4px" }} className='geofence-property-value'>{key == 'fillColor' ? <><div style={{width: '50px', height: '20px', background: value}}></div></> : value}</td>
                                                    </tr>
                                                );
                                            }
                                            return "";
                                        })}
                                        </tbody>
                                    </table>
                                    </div>
                            </CardBody>
                        </Card>
                        </Col>
                    </Row>
                    </Container>
                </div>
            </React.Fragment >
        </>
    )
}