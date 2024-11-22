import { Source, Map, MapPicker } from './modules/Source'
import React, { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { Card, CardBody } from 'reactstrap';
import { useDispatch, useSelector } from 'react-redux';
import './index.css'
import mapboxgl from 'mapbox-gl';
import { WindowResize } from './modules/WindowResize'
import { InfiniteGridHelper } from './modules/InfiniteGridHelper'
import * as THREE from "three";
import { MapControls } from 'Components/Common/CubeCamera/OrbitControls.js';
import _, { isArray } from 'lodash';
import { Progress, Spin } from 'antd';
import 'antd/dist/reset.css';
import JSZip from '@turbowarp/jszip'
import * as Leaflet from 'leaflet';
import { getAllVehicleRoutes, getGeoFences } from 'slices/thunk';
import { DropdownType } from 'Components/Common/Dropdown';
import { LAYOUT_MODE_TYPES } from "Components/constants/layout";
import { LayoutSelector, VehicleRouteSelector } from 'selectors';
import RBush from 'rbush';
import bbox from '@turf/bbox';
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js'; // ES6 import
import { addOrUpdateData, getDataByKey } from 'interfaces/IDB';
import { OrbitControlsGizmo } from "Components/Common/CubeCamera/OrbitControlsGizmo.js";
import COMPASS from 'assets/images/compass.png'
import COMPASS_VECTOR from 'assets/images/compass-vector.png'
const index = new RBush();

declare global {
    interface Window {
        map: any;
        mapPicker: any;
        controls: any;
        renderer: any;
        TruckObject: any;
        TruckObject2: any;
        TruckWaitingObject: any;
        TruckWaitingObject2: any;
        DiggerObject: any;
        DiggerObject2: any;
        DrillObject: any;
        DrillObject2: any;
        DrillHole: any;
        DozerObject: any;
        DozerObject2: any;
        savedCameraPosition: any;
        savedCameraQuaternion: any;
        isAnimation: any;
        mixer: any;
        mixer2: any;
        animationZoom: any;
        mainGeoJson: any;
        imageData: any;
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

interface MapRef {
    getMapContainer: () => HTMLDivElement | null; // Custom ref type with the method
}
interface THREEJSMapProps {
    defaultLayers: string[];
    drawMarkers?: () => void;
    updateAnnotations?: () => void;
    isLoading: boolean;
    setIsLoading: (isLoading) => void;
    updateMarkerTooltip?: () => void;
    onDocumentMouseClick?: (event: any) => void;
    onDocumentMouseDblClick?: (event: any) => void;
    onDocumentMouseMove?: (event: any) => void;
    height?: string;
    width?: string;
    isAnimation?: boolean;
    isAutoRouting?: boolean;
    diggerImport?: boolean;
    drillImport?: boolean;
    loaderImport?: boolean;
    dozerImport?: boolean;
    isPitView?: boolean;
    diggerInitPoint?: any;
    truckInitPoint?: any;
    equipmentFilter?: any;
    reloadModels?: any;
    children?: React.ReactNode; // Children prop is optional
}
export const THREEJSMap = forwardRef<HTMLDivElement, THREEJSMapProps>(({ children = <></>, defaultLayers, drawMarkers, updateAnnotations, setIsLoading, isLoading, updateMarkerTooltip, height, width, isAnimation = false, onDocumentMouseClick, onDocumentMouseDblClick, onDocumentMouseMove, isPitView = false, isAutoRouting = false, diggerImport = false, diggerInitPoint = null, truckInitPoint = null, drillImport = false, equipmentFilter = [], reloadModels = 0, loaderImport = false, dozerImport = false }, ref: any) => {
    const dispatch: any = useDispatch();
    const geoFences = useRef<any>([])

    const localMapContainerRef = useRef<HTMLDivElement | null>(null);
    const mixer = useRef<any>(null)
    const clock = useRef<any>(null)

    const mixer2 = useRef<any>(null)
    const clock2 = useRef<any>(null)
    // This exposes the localMapContainerRef to the parent component using localMapContainerRef
    useImperativeHandle(ref, () => ({
        getMapContainer: () => localMapContainerRef.current,
    }));

    const { vehicleRoutes } = useSelector(VehicleRouteSelector);
    const intervalId = useRef<any>(null)
    const intervalId2 = useRef<any>(null)
    const { layoutModeType } = useSelector(LayoutSelector);
    const isLight = layoutModeType === LAYOUT_MODE_TYPES.LIGHT;
    const _layerOptions: DropdownType[] = [
        { label: 'Current Haul Routes', value: 'CURRENT_HAUL_ROUTES' },
        { label: 'Future Road Designs', value: 'FUTURE_ROAD_DESIGNS' },
        { label: 'Speed Restrictions', value: 'SPEED_RESTRICTIONS' },
        { label: 'Pit Bottom', value: 'PIT_BOTTOM' },
        { label: 'Pit Climb', value: 'PIT_CLIMB' },
        { label: 'Stop Signs', value: 'STOP_SIGNS' },
        { label: 'Restricted', value: 'RESTRICTED' },
    ];
    const layerOptions = ['Active Benches', 'Current Haul Routes', 'Future Road Designs', 'Speed Restrictions', 'Pit Bottom', 'Pit Climb', 'Stop Signs', 'Restricted', 'Dump Locations'];

    mapboxgl.accessToken = process.env.MAPBOX_API_KEY || 'pk.eyJ1IjoibXlreXRhcyIsImEiOiJjbTA1MGhtb3YwY3Y0Mm5uY3FzYWExdm93In0.cSDrE0Lq4_PitPdGnEV_6w';
    const [lng, setLng] = useState(120.44871814239025);
    const [lat, setLat] = useState(-29.1506602184213);
    const [checkedList, setCheckedList] = useState<string[]>(defaultLayers || [''])
    const geojsonData = useRef<any>();

    // state for Map loading status
    const [progress, setProgress] = useState(0); // Progress state
    const animationFrameId = useRef<number | null>(null);
    let map: any;
    const dirts = useRef<any>([])
    const dirts2 = useRef<any>([])

    const [tooltipContent, setTooltipContent] = useState<any>(null);
    const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

    useEffect(() => {
        dispatch(getAllVehicleRoutes())
        dispatch(getGeoFences()); // Dispatch action to fetch data on component mount
    }, [dispatch]);

    useEffect(() => {
        if (window.map && window.map.scene) {
            if (window.map && window.map.scene && diggerImport && drillImport) {
                !window.TruckObject && fetch3DTruck()
                diggerImport && !window.DiggerObject && !window.DiggerObject.group && fetch3DExcavator()
                drillImport && !window.DrillObject && fetch3DDrill()
                drillImport && !window.DrillObject && fetchDrillHole()
                loaderImport && !window.DozerObject && fetch3DLoader()
                let excavatorAnimation1 = true
                let excavatorAnimation2 = true
                if (window.map.scene.children.includes(window.TruckObject)) {
                    window.map.scene.remove(window.TruckObject);
                }
                window.map.scene.add(window.TruckObject);
                if (window.map.scene.children.includes(window.TruckObject2)) {
                    window.map.scene.remove(window.TruckObject2);
                }
                window.map.scene.add(window.TruckObject2);

                if (!window.TruckObject2) {
                    // Clone and offset the TruckObject for the second pit
                    const clonedTruck = window.TruckObject.clone();
                    clonedTruck.position.copy(new THREE.Vector3(-396, -2045, 40))
                    window.TruckObject2 = clonedTruck
    
                    window.map.scene.add(clonedTruck);
                }

                window.map.scene.add(window.TruckWaitingObject);
                if (window.map.scene.children.includes(window.TruckWaitingObject)) {
                    window.map.scene.remove(window.TruckWaitingObject);
                }
                window.map.scene.add(window.TruckWaitingObject);

                window.map.scene.add(window.TruckWaitingObject2);
                if (window.map.scene.children.includes(window.TruckWaitingObject2)) {
                    window.map.scene.remove(window.TruckWaitingObject2);
                }
                window.map.scene.add(window.TruckWaitingObject2);

                if (!window.map.scene.children.includes(window.DiggerObject.group)) {
                    window.map.scene.add(window.DiggerObject.group);
                    excavatorAnimation1 = false
                }

                if (!window.map.scene.children.includes(window.DiggerObject2.group)) {
                    window.map.scene.add(window.DiggerObject2.group);
                    excavatorAnimation2 = false
                }

                if (window.map.scene.children.includes(window.DrillObject)) {
                    window.map.scene.remove(window.DrillObject);
                }
                window.map.scene.add(window.DrillObject);

                if (window.map.scene.children.includes(window.DrillObject2)) {
                    window.map.scene.remove(window.DrillObject2);
                }
                window.map.scene.add(window.DrillObject2);

                if (window.map.scene.children.includes(window.DozerObject)) {
                    window.map.scene.remove(window.DozerObject);
                }
                window.map.scene.add(window.DozerObject);

                if (window.map.scene.children.includes(window.DozerObject2)) {
                    window.map.scene.remove(window.DozerObject2);
                }
                window.map.scene.add(window.DozerObject2);

                const objectsToRemove: THREE.Object3D[] = [];

                if (drillImport) {
                    // Collect objects to remove
                    window.map.scene.traverse((object) => {
                        if (object.userData.isHole) {
                            objectsToRemove.push(object);
                        }
                    });
    
                    // Remove and dispose of objects
                    objectsToRemove.forEach((object: any) => {
                        if (object.geometry) object.geometry.dispose();
                        if (Array.isArray(object.material)) {
                            object.material.forEach((material) => material.dispose());
                        } else if (object.material) {
                            object.material.dispose();
                        }
                        window.map.scene.remove(object);
                    });
                    drawDrillHoles()
    
                    const offsetX = 1058; // X offset for the second pit
                    const offsetY = -2871; // Y offset for the second pit
    
                    // Iterate over the first set of holes and create a cloned version for the second pit
                    window.map.scene.children.forEach((child) => {
                        if (child.userData.isHole) {
                            const clonedHole = child.clone();
                            clonedHole.position.x += offsetX; // Apply X offset
                            clonedHole.position.y += offsetY; // Apply Y offset
                            window.map.scene.add(clonedHole);
                        }
                    });
                }
                if (dirts.current.length > 0) {
                    dirts.current.map(dirt => {
                        if (window.map.scene.children.includes(dirt)) {
                            window.map.scene.remove(dirt);
                        }
                        window.map.scene.add(dirt)
                    })
                }
                if (dirts2.current.length > 0) {
                    dirts2.current.map(dirt => {
                        if (window.map.scene.children.includes(dirt)) {
                            window.map.scene.remove(dirt);
                        }
                        window.map.scene.add(dirt)
                    })
                }
                if (!excavatorAnimation1) {
                    mixer.current = createExcavatorDiggingAnimation(window.DiggerObject);
                    clock.current = new THREE.Clock();
                }
                if (!excavatorAnimation2) {
                    mixer2.current = createExcavatorDiggingAnimation2(window.DiggerObject2);
                    clock2.current = new THREE.Clock();
                }
            }
            else if (!isLoading && window.map && window.map.scene && diggerImport) {
                if (window.map.scene.children.includes(window.TruckObject)) {
                    window.map.scene.remove(window.TruckObject);
                }
                window.map.scene.add(window.TruckObject);
                console.log(window.DiggerObject)
                if (window.DiggerObject && window.DiggerObject.group && !window.map.scene.children.includes(window.DiggerObject.group)) {
                    window.map.scene.add(window.DiggerObject.group);
                    mixer.current = createExcavatorDiggingAnimation(window.DiggerObject);
                    clock.current = new THREE.Clock();
                }
            }
            else if (!isLoading && window.map && window.map.scene){
                if (window.map.scene.children.includes(window.TruckObject)) {
                    window.map.scene.remove(window.TruckObject);
                }
                window.map.scene.add(window.TruckObject);
            }
        }
    }, [reloadModels])

    useEffect(() => {
        if (map) return
        setIsLoading(true);
        fetch3DTruck()
        diggerImport && fetch3DExcavator()
        drillImport && fetch3DDrill()
        drillImport && fetchDrillHole()
        loaderImport && fetch3DLoader()
        fetchGeofences()
        loadMapView()
        // Clean up on component unmount
        return () => {
            window.map && window.map.clean()
            if (animationFrameId.current) {
                cancelAnimationFrame(animationFrameId.current);
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
            if (window.camera) {
                window.camera = null
            }
            if (window.controls) {
                window.controls.dispose();
                window.controls = null
            }
            // Clean up Three.js objects
            if (localMapContainerRef.current && localMapContainerRef.current.firstChild) {
                const { domElement } = window.renderer;
                if (isPitView && onDocumentMouseMove && !drillImport) {
                    domElement.removeEventListener('mousemove', onDocumentMouseMove, false);
                }
                else {
                    domElement.removeEventListener('mousemove', _onDocumentMouseMove, false);
                }

                domElement.removeEventListener('wheel', onDocumentMouseWheel, false);
                if (onDocumentMouseClick) domElement.removeEventListener('click', onDocumentMouseClick, false);
                if (onDocumentMouseDblClick) domElement.removeEventListener('dblclick', onDocumentMouseDblClick, false);
                localMapContainerRef.current.removeChild(localMapContainerRef.current.firstChild);

                if (domElement.parentElement) {
                    domElement.parentElement.removeChild(domElement);
                }
            }
            if (window.renderer) {
                window.renderer.renderLists && window.renderer.renderLists.dispose();
                window.renderer.renderLists && (window.renderer.renderLists = null)
                window.renderer.dispose();
                window.renderer = null
            }
            if (mixer.current) {
                mixer.current.uncacheRoot(window.DiggerObject.group);
                mixer.current.stopAllAction();
                mixer.current = null
            }
            if (mixer2.current) {
                mixer2.current.uncacheRoot(window.DiggerObject2.group);
                mixer2.current.stopAllAction();
                mixer2.current = null
            }
            if (dirts.current.length > 0) {
                dirts.current = [];
            }
            geoFences.current = null

            intervalId.current && clearInterval(intervalId.current);
            intervalId2.current && clearInterval(intervalId2.current);
        };

    }, []); // Added dependencies to reinitialize map if lat/lng changes


    useEffect(() => {

    }, [equipmentFilter])
    useEffect(() => {
        if (!isLoading && window.map && window.map.scene && diggerImport && drillImport) {
            window.map.scene.add(window.TruckObject);
            if (diggerImport && window.DiggerObject && window.DiggerObject.group) {
                window.map.scene.add(window.DiggerObject.group);
                mixer.current = createExcavatorDiggingAnimation(window.DiggerObject);
                clock.current = new THREE.Clock();
            }

            if (dirts.current.length > 0) {
                dirts.current.map(dirt => {
                    window.map.scene.add(dirt)
                })
            }

            // Second Pit
            const offsetX = 1058; // X offset for the second pit
            const offsetY = -2871; // Y offset for the second pit

            // Iterate over the first set of holes and create a cloned version for the second pit
            window.map.scene.children.forEach((child) => {
                if (child.userData.isHole) {
                    const clonedHole = child.clone();
                    clonedHole.position.x += offsetX; // Apply X offset
                    clonedHole.position.y += offsetY; // Apply Y offset
                    window.map.scene.add(clonedHole);
                }
            });

            if (window.TruckObject && diggerImport && drillImport) {
                // Clone and offset the TruckObject for the second pit
                const clonedTruck = window.TruckObject.clone();
                clonedTruck.position.copy(new THREE.Vector3(-396, -2045, 40))
                window.TruckObject2 = clonedTruck

                window.map.scene.add(clonedTruck);
            }

            // Adding the DiggerObject to the scene
            if (diggerImport && window.DiggerObject2 && window.DiggerObject2.group) {
                // Add the entire excavator object to the group and scene
                window.map.scene.add(window.DiggerObject2.group);
                mixer2.current = createExcavatorDiggingAnimation2(window.DiggerObject2);
                clock2.current = new THREE.Clock();
            }

            if (dirts2.current.length > 0) {
                dirts2.current.map(dirt => {
                    window.map.scene.add(dirt)
                })
            }

            let excavatorAnimation1 = true
            let excavatorAnimation2 = true
            if (window.map.scene.children.includes(window.TruckObject)) {
                window.map.scene.remove(window.TruckObject);
            }
            window.map.scene.add(window.TruckObject);
            if (window.map.scene.children.includes(window.TruckObject2)) {
                window.map.scene.remove(window.TruckObject2);
            }
            window.map.scene.add(window.TruckObject2);

            if (!window.TruckObject2 && window.TruckObject) {
                // Clone and offset the TruckObject for the second pit
                const clonedTruck = window.TruckObject.clone();
                clonedTruck.position.copy(new THREE.Vector3(-396, -2045, 40))
                window.TruckObject2 = clonedTruck

                window.map.scene.add(clonedTruck);
            }

            window.map.scene.add(window.TruckWaitingObject);
            if (window.map.scene.children.includes(window.TruckWaitingObject)) {
                window.map.scene.remove(window.TruckWaitingObject);
            }
            window.map.scene.add(window.TruckWaitingObject);

            window.map.scene.add(window.TruckWaitingObject2);
            if (window.map.scene.children.includes(window.TruckWaitingObject2)) {
                window.map.scene.remove(window.TruckWaitingObject2);
            }
            window.map.scene.add(window.TruckWaitingObject2);

            if (window.DiggerObject && window.DiggerObject.group && !window.map.scene.children.includes(window.DiggerObject.group)) {
                window.map.scene.add(window.DiggerObject.group);
                excavatorAnimation1 = false
            }

            if (window.DiggerObject2 && window.DiggerObject2.group && !window.map.scene.children.includes(window.DiggerObject2.group)) {
                window.map.scene.add(window.DiggerObject2.group);
                excavatorAnimation2 = false
            }

            if (window.map.scene.children.includes(window.DrillObject)) {
                window.map.scene.remove(window.DrillObject);
            }
            window.map.scene.add(window.DrillObject);

            if (window.map.scene.children.includes(window.DrillObject2)) {
                window.map.scene.remove(window.DrillObject2);
            }
            window.map.scene.add(window.DrillObject2);

            if (window.map.scene.children.includes(window.DozerObject)) {
                window.map.scene.remove(window.DozerObject);
            }
            window.map.scene.add(window.DozerObject);

            if (window.map.scene.children.includes(window.DozerObject2)) {
                window.map.scene.remove(window.DozerObject2);
            }
            window.map.scene.add(window.DozerObject2);

            if (!excavatorAnimation1) {
                mixer.current = createExcavatorDiggingAnimation(window.DiggerObject);
                clock.current = new THREE.Clock();
            }
            if (!excavatorAnimation2) {
                mixer2.current = createExcavatorDiggingAnimation2(window.DiggerObject2);
                clock2.current = new THREE.Clock();
            }
        }
        else if (!isLoading && window.map && window.map.scene && diggerImport) {
            if (window.map.scene.children.includes(window.TruckObject)) {
                window.map.scene.remove(window.TruckObject);
            }
            window.map.scene.add(window.TruckObject);
            if (window.DiggerObject && window.DiggerObject.group && !window.map.scene.children.includes(window.DiggerObject.group)) {
                window.map.scene.add(window.DiggerObject.group);
                mixer.current = createExcavatorDiggingAnimation(window.DiggerObject);
                clock.current = new THREE.Clock();
            }
        }
        else if (!isLoading && window.map && window.map.scene){
            if (window.map.scene.children.includes(window.TruckObject)) {
                window.map.scene.remove(window.TruckObject);
            }
            window.map.scene.add(window.TruckObject);
        }
    }, [isLoading])

    const drawDrillHoles = async () => {
        const rows = 10;
        const columns = 5;
        const spacingX = 25; // Adjust spacing between holes along the X-axis
        const spacingY = 30; // Adjust spacing between holes along the Y-axis
        const holeTypes: string[][] = [];
        const drilledHoles: THREE.Vector3[] = [];
        const unDrilledHoles: THREE.Vector3[] = []; // Array to hold positions of unDrilled holes
        const angleHoles: THREE.Vector3[] = []; // Array to hold positions of angleHoles
        // Step 1: Generate holeType array for the grid
        for (let i = 0; i < rows; i++) {
            holeTypes[i] = [];
            for (let j = 0; j < columns; j++) {
                if (i === 0 || i === rows - 1 || j === 0 || j === columns - 1) {
                    holeTypes[i][j] = 'angleHole'; // Edge holes are angle holes
                } else {
                    // Randomly decide between 'drilled' and 'unDrilled' for inside holes
                    holeTypes[i][j] = Math.random() > 0.5 ? 'drilled' : 'unDrilled';
                }
            }
        }

        // Step 2: Loop through the grid and create objects based on holeType
        for (let i = 0; i < rows; i++) {
            for (let j = 0; j < columns; j++) {
                const holeType = holeTypes[i][j];
                const position = new THREE.Vector3(
                    -1620 - j * spacingX, // Adjust X position for each column
                    1500 - i * spacingY,  // Adjust Y position for each row
                    45                    // Z position remains the same
                );

                if (holeType === 'drilled') {
                    // Clone and configure drilled hole
                    const depth = (Math.random() * 10 + 10).toFixed(2); // Depth between 10m and 20m
                    const minutes = Math.floor(Math.random() * 60 + 120); // Drill time between 120 and 180 minutes
                    const drillTime = `${Math.floor(minutes / 60).toString().padStart(2, '0')}:${(minutes % 60).toString().padStart(2, '0')}`;
                    const label = `${String.fromCharCode(65 + j)}${rows + 139 - i}`; // e.g., 'A139', 'B140'
                    if (window.DrillHole) {
                        const object = window.DrillHole.clone();
                        object.visible = true;
                        drilledHoles.push(position); // Store position of drilled hole
                        object.position.copy(position);
                        object.userData = { name: label, drillTime, depth, isHole: true, holeType };
                        object.traverse(child => {
                            child.userData = { ...object.userData };
                        });
                        object.rotation.copy(new THREE.Euler(Math.PI / 2, Math.PI / 2, 0));
                        window.map.scene.add(object);
                    }

                    const markerGeometry = new THREE.CircleGeometry(3, 32);
                    let materialColor = 0xff0000;

                    const material = new THREE.MeshBasicMaterial({ color: materialColor, depthWrite: false, transparent: true });
                    const marker = new THREE.Mesh(markerGeometry, material);

                    marker.position.copy(position);
                    marker.position.z += 0; // Slight offset for visibility
                    // marker.rotation.copy(new THREE.Euler(Math.PI / 2, 0, 0));
                    marker.userData = { name: label, drillTime, depth, isHole: true, holeType };
                    window.map.scene.add(marker);
                } else {
                    // Create a circle marker for 'unDrilled' or 'angleHole'
                    const markerGeometry = new THREE.CircleGeometry(3, 32);
                    let materialColor;

                    if (holeType === 'unDrilled') {
                        materialColor = 0x0000ff; // Blue color for unDrilled
                        unDrilledHoles.push(position); // Store position of unDrilled hole
                    } else if (holeType === 'angleHole') {
                        materialColor = Math.random() > 0.5 ? 0xff0000 : 0x0000ff; // Red color for angleHole
                        angleHoles.push(position); // Store position of angleHole
                    }

                    const material = new THREE.MeshBasicMaterial({ color: materialColor, depthWrite: false, transparent: true });
                    const marker = new THREE.Mesh(markerGeometry, material);

                    marker.position.copy(position);
                    marker.position.z += 0; // Slight offset for visibility
                    // marker.rotation.copy(new THREE.Euler(Math.PI / 2, 0, 0));
                    const label = `${String.fromCharCode(65 + j)}${rows + 139 - i}`; // e.g., 'A139', 'B140'
                    marker.userData = { name: label, drillTime: '---', depth: '---', isHole: true, holeType };
                    // marker.rotation.y += Math.PI / 2
                    // marker.rotation.x += Math.PI / 2
                    // Add arrow for angleHole
                    if (holeType === 'angleHole') {
                        const arrowDir = new THREE.Vector3(1, 1, 0); // Example direction for arrow
                        const arrowHelper = new THREE.ArrowHelper(
                            arrowDir,
                            position,
                            10, // Length of the arrow
                            materialColor // Color of the arrow
                        );
                        arrowHelper.userData = { isHole: true }
                        arrowHelper.rotation.z = -(Math.PI / 4) - Math.PI / 2
                        arrowHelper.position.copy(new THREE.Vector3(position.x - 3, position.y + 2.5, position.z))
                        window.map.scene.add(arrowHelper);
                    }

                    window.map.scene.add(marker);
                }
            }
        }

        const addArrowSequence = (holes: THREE.Vector3[], color: number) => {
            for (let i = 0; i < holes.length - 1; i++) {
                const start = holes[i];
                const end = holes[i + 1];
                const direction = new THREE.Vector3().subVectors(end, start).normalize();
                const arrowLength = start.distanceTo(end);

                const arrowHelper = new THREE.ArrowHelper(
                    direction,
                    start,
                    arrowLength,
                    color // Color for the arrow connecting holes
                );
                arrowHelper.userData = { isHole: true, isDrillPattern: true }
                window.map.scene.add(arrowHelper);
            }
        };

        // Add sequences for drilled, unDrilled, and angleHoles
        addArrowSequence(drilledHoles, 0xff00ff); // Magenta color for drilled holes
        addArrowSequence(unDrilledHoles, 0xff00ff); // Blue color for unDrilled holes
        addArrowSequence(angleHoles, 0xff00ff); // Red color for angle holes
    }
    const fetchGeofences = async () => {
        const _fetchGeofences = async () => {
            const retrievedData = await getDataByKey('geoFences');
            if (retrievedData && retrievedData.length > 0) {
                geoFences.current = retrievedData
            }
            else {
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

    const mixerRef = useRef<THREE.AnimationMixer | null>(null);
    const mixerRef2 = useRef<THREE.AnimationMixer | null>(null);
    const createExcavatorDiggingAnimation = (excavator: any) => {
        mixerRef.current = new THREE.AnimationMixer(excavator.group);
        const initialQuaternion = new THREE.Quaternion(0, -0.00034019315841246704, 0, 0.9999999355799913);
        // Invert the quaternion to get the corrective rotation
        const correctiveQuaternion = initialQuaternion.clone().invert();

        // Apply this corrective rotation to the body
        const rotation = excavator.body.rotation

        // Time offsets for each part of the animation sequence
        const boomStart = 0;
        const armStart = 0; // start arm after boom
        const bucketStart = 0; // bucket moves together with arm
        const boomAfterStart = 5;
        const bodyStart = 8; // start body after arm and bucket
        const dumpingStart = 11;
        const loopDuration = 22; // total time before loop

        // Boom rotation (up and down motion)
        const boomTrack = new THREE.QuaternionKeyframeTrack(
            `${excavator.boom.uuid}.quaternion`,
            [boomStart, boomStart + 5,],
            [
                ...new THREE.Quaternion().setFromEuler(new THREE.Euler(-0.7, 0, 0)).toArray(),
                ...new THREE.Quaternion().setFromEuler(new THREE.Euler(-0.15, 0, 0)).toArray(),
            ]
        );

        // Arm rotation (inward and outward motion)
        const armTrack = new THREE.QuaternionKeyframeTrack(
            `${excavator.arm.uuid}.quaternion`,
            [armStart, armStart + 2, armStart + 5],
            [
                ...new THREE.Quaternion().setFromEuler(new THREE.Euler(-2, 0, 0)).toArray(),
                ...new THREE.Quaternion().setFromEuler(new THREE.Euler(-2.5, 0, 0)).toArray(),
                ...new THREE.Quaternion().setFromEuler(new THREE.Euler(-0, 0, 0)).toArray()
            ]
        );

        // Bucket rotation (scooping motion)
        const bucketTrack = new THREE.QuaternionKeyframeTrack(
            `${excavator.bucket.uuid}.quaternion`,
            [bucketStart, bucketStart + 2.5, bucketStart + 5],
            [
                ...new THREE.Quaternion().setFromEuler(new THREE.Euler(0.5, 0, 0)).toArray(),
                ...new THREE.Quaternion().setFromEuler(new THREE.Euler(-1, 0, 0)).toArray(),
                ...new THREE.Quaternion().setFromEuler(new THREE.Euler(0.3, 0, 0)).toArray()
            ]
        );

        // Boom rotation (up and down motion)
        const boomAfterTrack = new THREE.QuaternionKeyframeTrack(
            `${excavator.boom.uuid}.quaternion`,
            [boomAfterStart, boomAfterStart + 3, boomAfterStart + 6, boomAfterStart + 15, boomAfterStart + 17],
            [
                ...new THREE.Quaternion().setFromEuler(new THREE.Euler(-0.15, 0, 0)).toArray(),
                ...new THREE.Quaternion().setFromEuler(new THREE.Euler(-0.7, 0, 0)).toArray(),
                ...new THREE.Quaternion().setFromEuler(new THREE.Euler(-0.7, 0, 0)).toArray(),
                ...new THREE.Quaternion().setFromEuler(new THREE.Euler(-1, 0, 0)).toArray(),
                ...new THREE.Quaternion().setFromEuler(new THREE.Euler(-0.7, 0, 0)).toArray(),
            ]
        );

        // Body rotation (swinging motion)
        const bodyTrack = new THREE.QuaternionKeyframeTrack(
            `${excavator.body.uuid}.quaternion`,
            [bodyStart, bodyStart + 3, bodyStart + 9, bodyStart + 12],
            [
                ...new THREE.Quaternion().setFromEuler(new THREE.Euler(rotation.x, rotation.y, rotation.z + Math.PI / 2 - 0.5)).toArray(),
                ...new THREE.Quaternion().setFromEuler(new THREE.Euler(rotation.x, rotation.y, rotation.z + Math.PI / 2 + 0.3)).toArray(),
                ...new THREE.Quaternion().setFromEuler(new THREE.Euler(rotation.x, rotation.y, rotation.z + Math.PI / 2 + 0.3)).toArray(),
                ...new THREE.Quaternion().setFromEuler(new THREE.Euler(rotation.x, rotation.y, rotation.z + Math.PI / 2 - 0.5)).toArray(),
            ]
        );

        // Boom rotation (up and down motion)
        const armDumpingTrack = new THREE.QuaternionKeyframeTrack(
            `${excavator.arm.uuid}.quaternion`,
            [dumpingStart, dumpingStart + 2, dumpingStart + 9, dumpingStart + 11],
            [
                ...new THREE.Quaternion().setFromEuler(new THREE.Euler(-0, 0, 0)).toArray(),
                ...new THREE.Quaternion().setFromEuler(new THREE.Euler(-1.5, 0, 0)).toArray(),
                ...new THREE.Quaternion().setFromEuler(new THREE.Euler(-1.5, 0, 0)).toArray(),
                ...new THREE.Quaternion().setFromEuler(new THREE.Euler(-2, 0, 0)).toArray(),
            ]
        );

        const bucketDumpingTrack = new THREE.QuaternionKeyframeTrack(
            `${excavator.bucket.uuid}.quaternion`,
            [dumpingStart, dumpingStart + 2, dumpingStart + 4, dumpingStart + 6],
            [
                ...new THREE.Quaternion().setFromEuler(new THREE.Euler(0.3, 0, 0)).toArray(),
                ...new THREE.Quaternion().setFromEuler(new THREE.Euler(0, 0, 0)).toArray(),
                ...new THREE.Quaternion().setFromEuler(new THREE.Euler(10, 0, 0)).toArray(),
                ...new THREE.Quaternion().setFromEuler(new THREE.Euler(0.5, 0, 0)).toArray(),
            ]
        );

        // Dump Truck rotation (example motion)
        // const dumpTruckTrack = new THREE.QuaternionKeyframeTrack(
        //     `${excavator.dumpTruck.uuid}.quaternion`,  // Adjust path to match your model structure
        //     [dumpTruckStart, dumpTruckStart + 2.5, dumpTruckStart + 5],
        //     [
        //         ...new THREE.Quaternion().setFromEuler(new THREE.Euler(0, 0.3, 0)).toArray(),  // Tilting motion
        //         ...new THREE.Quaternion().setFromEuler(new THREE.Euler(0, -0.3, 0)).toArray(),
        //         ...new THREE.Quaternion().setFromEuler(new THREE.Euler(0, 0.3, 0)).toArray()
        //     ]
        // );

        // Hydraulic movement (keep aligned with boom and arm)
        const hydraulicCylinderTrack = new THREE.VectorKeyframeTrack(
            `${excavator.hydraulicCylinder.uuid}.position`,
            [8, 13, 18],
            [
                ...new THREE.Quaternion().setFromEuler(new THREE.Euler(excavator.hydraulicCylinder.position)).toArray(),
                ...new THREE.Quaternion().setFromEuler(new THREE.Euler(excavator.hydraulicCylinder.position)).toArray(),
                ...new THREE.Quaternion().setFromEuler(new THREE.Euler(excavator.hydraulicCylinder.position)).toArray()
            ]
        );

        const hydraulicPistonTrack = new THREE.VectorKeyframeTrack(
            `${excavator.hydraulicPiston.uuid}.position`,
            [8, 13, 18],
            [
                ...new THREE.Quaternion().setFromEuler(new THREE.Euler(excavator.hydraulicPiston.position)).toArray(),
                ...new THREE.Quaternion().setFromEuler(new THREE.Euler(excavator.hydraulicPiston.position)).toArray(),
                ...new THREE.Quaternion().setFromEuler(new THREE.Euler(excavator.hydraulicPiston.position)).toArray()
            ]
        );

        // Create AnimationClip
        const clip = new THREE.AnimationClip('DiggingAnimation', loopDuration, [boomTrack, armTrack, bucketTrack, boomAfterTrack, bodyTrack, armDumpingTrack, bucketDumpingTrack, hydraulicCylinderTrack]);

        // Play the animation
        const action = mixerRef.current.clipAction(clip);
        action.setLoop(THREE.LoopRepeat, Infinity);
        action.play();


        const clock = new THREE.Clock();
        let loaded = false
        let elapsed = 0
        let count = 0
        const updateAnimation = () => {
            const delta = clock.getDelta(); // Time since last frame
            if (mixerRef.current) {
                mixerRef.current.update(delta); // Update the animation mixer

                // Get the current time within the action's play duration
                if (action.time >= loopDuration && !loaded) {
                    loaded = true
                }
                let currentTime = action.time % loopDuration; // Real-time playback progress
                // Implement your time-based logic
                if (currentTime >= 5 && currentTime <= 15) {
                    window.DiggerObject.dirt.visible = true;
                    // loaded && (window.DiggerObject.truckDirt.visible = false)
                } else {
                    window.DiggerObject.dirt.visible = false;
                    // loaded && (window.DiggerObject.truckDirt.visible = true)
                }
                if (currentTime > 15 && loaded) {
                    count = (count % 5) + 1; // Cycle count between 1 and 5
                    loaded = false; // Reset loaded to ensure this logic only runs once per cycle
                } else if (currentTime <= 15) {
                    loaded = true; // Allow count to increment only when we go past 15
                }


                if (dirts.current.length > 0) {
                    if (count === 5 && (currentTime > 8 && currentTime < 15)) {
                        dirts.current.map((dirt, index) => {
                            dirt.visible = false
                        })
                    }
                    else {
                        dirts.current.map((dirt, index) => {
                            if (count >= index + 1) {
                                dirt.visible = true
                            }
                            else {
                                dirt.visible = false
                            }
                        })
                    }
                }
            }

            intervalId.current = requestAnimationFrame(updateAnimation); // Continue the render loop
        };

        // Start the animation loop
        updateAnimation();
        // Return mixer for use in render loop
        return mixerRef.current;
    };

    const createExcavatorDiggingAnimation2 = (excavator: any) => {
        mixerRef2.current = new THREE.AnimationMixer(excavator.group);
        const initialQuaternion = new THREE.Quaternion(0, -0.00034019315841246704, 0, 0.9999999355799913);
        // Invert the quaternion to get the corrective rotation
        const correctiveQuaternion = initialQuaternion.clone().invert();

        // Apply this corrective rotation to the body
        const rotation = excavator.body.rotation

        // Time offsets for each part of the animation sequence
        const boomStart = 0;
        const armStart = 0; // start arm after boom
        const bucketStart = 0; // bucket moves together with arm
        const boomAfterStart = 5;
        const bodyStart = 8; // start body after arm and bucket
        const dumpingStart = 11;
        const loopDuration = 22; // total time before loop

        // Boom rotation (up and down motion)
        const boomTrack = new THREE.QuaternionKeyframeTrack(
            `${excavator.boom.uuid}.quaternion`,
            [boomStart, boomStart + 5,],
            [
                ...new THREE.Quaternion().setFromEuler(new THREE.Euler(-0.7, 0, 0)).toArray(),
                ...new THREE.Quaternion().setFromEuler(new THREE.Euler(-0.15, 0, 0)).toArray(),
            ]
        );

        // Arm rotation (inward and outward motion)
        const armTrack = new THREE.QuaternionKeyframeTrack(
            `${excavator.arm.uuid}.quaternion`,
            [armStart, armStart + 2, armStart + 5],
            [
                ...new THREE.Quaternion().setFromEuler(new THREE.Euler(-2, 0, 0)).toArray(),
                ...new THREE.Quaternion().setFromEuler(new THREE.Euler(-2.5, 0, 0)).toArray(),
                ...new THREE.Quaternion().setFromEuler(new THREE.Euler(-0, 0, 0)).toArray()
            ]
        );

        // Bucket rotation (scooping motion)
        const bucketTrack = new THREE.QuaternionKeyframeTrack(
            `${excavator.bucket.uuid}.quaternion`,
            [bucketStart, bucketStart + 2.5, bucketStart + 5],
            [
                ...new THREE.Quaternion().setFromEuler(new THREE.Euler(0.5, 0, 0)).toArray(),
                ...new THREE.Quaternion().setFromEuler(new THREE.Euler(-1, 0, 0)).toArray(),
                ...new THREE.Quaternion().setFromEuler(new THREE.Euler(0.3, 0, 0)).toArray()
            ]
        );

        // Boom rotation (up and down motion)
        const boomAfterTrack = new THREE.QuaternionKeyframeTrack(
            `${excavator.boom.uuid}.quaternion`,
            [boomAfterStart, boomAfterStart + 3, boomAfterStart + 6, boomAfterStart + 15, boomAfterStart + 17],
            [
                ...new THREE.Quaternion().setFromEuler(new THREE.Euler(-0.15, 0, 0)).toArray(),
                ...new THREE.Quaternion().setFromEuler(new THREE.Euler(-0.7, 0, 0)).toArray(),
                ...new THREE.Quaternion().setFromEuler(new THREE.Euler(-0.7, 0, 0)).toArray(),
                ...new THREE.Quaternion().setFromEuler(new THREE.Euler(-1, 0, 0)).toArray(),
                ...new THREE.Quaternion().setFromEuler(new THREE.Euler(-0.7, 0, 0)).toArray(),
            ]
        );

        // Body rotation (swinging motion)
        const bodyTrack = new THREE.QuaternionKeyframeTrack(
            `${excavator.body.uuid}.quaternion`,
            [bodyStart, bodyStart + 3, bodyStart + 9, bodyStart + 12],
            [
                ...new THREE.Quaternion().setFromEuler(new THREE.Euler(rotation.x, rotation.y, rotation.z + Math.PI / 2 - 0.5)).toArray(),
                ...new THREE.Quaternion().setFromEuler(new THREE.Euler(rotation.x, rotation.y, rotation.z + Math.PI / 2 + 0.3)).toArray(),
                ...new THREE.Quaternion().setFromEuler(new THREE.Euler(rotation.x, rotation.y, rotation.z + Math.PI / 2 + 0.3)).toArray(),
                ...new THREE.Quaternion().setFromEuler(new THREE.Euler(rotation.x, rotation.y, rotation.z + Math.PI / 2 - 0.5)).toArray(),
            ]
        );

        // Boom rotation (up and down motion)
        const armDumpingTrack = new THREE.QuaternionKeyframeTrack(
            `${excavator.arm.uuid}.quaternion`,
            [dumpingStart, dumpingStart + 2, dumpingStart + 9, dumpingStart + 11],
            [
                ...new THREE.Quaternion().setFromEuler(new THREE.Euler(-0, 0, 0)).toArray(),
                ...new THREE.Quaternion().setFromEuler(new THREE.Euler(-1.5, 0, 0)).toArray(),
                ...new THREE.Quaternion().setFromEuler(new THREE.Euler(-1.5, 0, 0)).toArray(),
                ...new THREE.Quaternion().setFromEuler(new THREE.Euler(-2, 0, 0)).toArray(),
            ]
        );

        const bucketDumpingTrack = new THREE.QuaternionKeyframeTrack(
            `${excavator.bucket.uuid}.quaternion`,
            [dumpingStart, dumpingStart + 2, dumpingStart + 4, dumpingStart + 6],
            [
                ...new THREE.Quaternion().setFromEuler(new THREE.Euler(0.3, 0, 0)).toArray(),
                ...new THREE.Quaternion().setFromEuler(new THREE.Euler(0, 0, 0)).toArray(),
                ...new THREE.Quaternion().setFromEuler(new THREE.Euler(10, 0, 0)).toArray(),
                ...new THREE.Quaternion().setFromEuler(new THREE.Euler(0.5, 0, 0)).toArray(),
            ]
        );

        // Dump Truck rotation (example motion)
        // const dumpTruckTrack = new THREE.QuaternionKeyframeTrack(
        //     `${excavator.dumpTruck.uuid}.quaternion`,  // Adjust path to match your model structure
        //     [dumpTruckStart, dumpTruckStart + 2.5, dumpTruckStart + 5],
        //     [
        //         ...new THREE.Quaternion().setFromEuler(new THREE.Euler(0, 0.3, 0)).toArray(),  // Tilting motion
        //         ...new THREE.Quaternion().setFromEuler(new THREE.Euler(0, -0.3, 0)).toArray(),
        //         ...new THREE.Quaternion().setFromEuler(new THREE.Euler(0, 0.3, 0)).toArray()
        //     ]
        // );

        // Hydraulic movement (keep aligned with boom and arm)
        const hydraulicCylinderTrack = new THREE.VectorKeyframeTrack(
            `${excavator.hydraulicCylinder.uuid}.position`,
            [8, 13, 18],
            [
                ...new THREE.Quaternion().setFromEuler(new THREE.Euler(excavator.hydraulicCylinder.position)).toArray(),
                ...new THREE.Quaternion().setFromEuler(new THREE.Euler(excavator.hydraulicCylinder.position)).toArray(),
                ...new THREE.Quaternion().setFromEuler(new THREE.Euler(excavator.hydraulicCylinder.position)).toArray()
            ]
        );

        const hydraulicPistonTrack = new THREE.VectorKeyframeTrack(
            `${excavator.hydraulicPiston.uuid}.position`,
            [8, 13, 18],
            [
                ...new THREE.Quaternion().setFromEuler(new THREE.Euler(excavator.hydraulicPiston.position)).toArray(),
                ...new THREE.Quaternion().setFromEuler(new THREE.Euler(excavator.hydraulicPiston.position)).toArray(),
                ...new THREE.Quaternion().setFromEuler(new THREE.Euler(excavator.hydraulicPiston.position)).toArray()
            ]
        );

        // Create AnimationClip
        const clip = new THREE.AnimationClip('DiggingAnimation', loopDuration, [boomTrack, armTrack, bucketTrack, boomAfterTrack, bodyTrack, armDumpingTrack, bucketDumpingTrack, hydraulicCylinderTrack]);

        // Play the animation
        const action = mixerRef2.current.clipAction(clip);
        action.setLoop(THREE.LoopRepeat, Infinity);
        action.play();


        const clock = new THREE.Clock();
        let loaded = false
        let elapsed = 0
        let count = 0
        const updateAnimation2 = () => {
            const delta = clock.getDelta(); // Time since last frame
            if (mixerRef2.current) {
                mixerRef2.current.update(delta); // Update the animation mixer

                // Get the current time within the action's play duration
                if (action.time >= loopDuration && !loaded) {
                    loaded = true
                }
                let currentTime = action.time % loopDuration; // Real-time playback progress
                // Implement your time-based logic
                if (currentTime >= 5 && currentTime <= 15) {
                    window.DiggerObject2.dirt.visible = true;
                    // loaded && (window.DiggerObject.truckDirt.visible = false)
                } else {
                    window.DiggerObject2.dirt.visible = false;
                    // loaded && (window.DiggerObject.truckDirt.visible = true)
                }
                if (currentTime > 15 && loaded) {
                    count = (count % 5) + 1; // Cycle count between 1 and 5
                    loaded = false; // Reset loaded to ensure this logic only runs once per cycle
                } else if (currentTime <= 15) {
                    loaded = true; // Allow count to increment only when we go past 15
                }


                if (dirts2.current.length > 0) {
                    if (count === 5 && (currentTime > 8 && currentTime < 15)) {
                        dirts2.current.map((dirt, index) => {
                            dirt.visible = false
                        })
                    }
                    else {
                        dirts2.current.map((dirt, index) => {
                            if (count >= index + 1) {
                                dirt.visible = true
                            }
                            else {
                                dirt.visible = false
                            }
                        })
                    }
                }
            }

            intervalId2.current = requestAnimationFrame(updateAnimation2); // Continue the render loop
        };

        // Start the animation loop
        updateAnimation2();
        // Return mixer for use in render loop
        return mixerRef2.current;
    };

    const fetch3DLoader = () => {
        const mtlLoader = new MTLLoader();
        mtlLoader.load('/Dozer/Dozer.mtl', (materials) => {
            materials.preload();
            let objLoader: any
            objLoader = new OBJLoader();
            objLoader.setMaterials(materials);
            objLoader.load(
                '/Dozer/Dozer.obj',
                (object) => {
                    // Check the type of the loaded object
                    object.traverse((child: any) => {
                        if (child.isMesh) {
                            child.material.depthTest = true
                            child.material.depthWrite = true
                            child.material.transparent = false
                            child.material.metalness = 0.7
                            child.material.roughness = 0.7
                        }
                    });
                    object.visible = true; // Initially set to invisible
                    object.rotation.x = Math.PI / 2; // Adjust rotation
                    object.rotation.y += Math.PI / 4; // Adjust orientation
                    object.position.z += 10;
                    window.DozerObject = object;
                    object.scale.set(30, 30, 30)
                    window.DozerObject.position.copy(new THREE.Vector3(-1580, 960, 40))

                    const clonedDozer = window.DozerObject.clone();
                    clonedDozer.position.x = -508; // Apply X offset
                    clonedDozer.position.y = -1786; // Apply Y offset
                    clonedDozer.rotation.y = Math.PI / 2
                    window.DozerObject2 = clonedDozer
                },
                undefined,
                (error) => {
                    console.error(`An error occurred while loading the OBJ file: ${error}`);
                }
            );
        });
    }

    const fetch3DDrill = () => {
        const loader = new FBXLoader();
        loader.load('/Drill/drill.fbx', (object) => {
            object.traverse((child: any) => {
                if (child.isMesh) {
                    if (isArray(child.material)) {
                        child.material.map((_child) => {
                            _child.depthTest = true
                            _child.depthWrite = true
                            _child.transparent = false
                        })
                        child.renderOrder = 9998
                    }
                    else {
                        child.material.depthTest = true
                        child.material.depthWrite = true
                        child.material.transparent = false
                        child.renderOrder = 10000
                    }
                }
            });

            // Add the entire excavator object to the group and scene
            object.scale.set(0.3, 0.3, 0.3);
            object.position.copy(new THREE.Vector3(-1620, 1360, 40));
            object.rotation.x = Math.PI / 2; // Adjust rotation
            object.rotation.y += 0; // Adjust orientation
            object.position.z += Math.PI;
            object.visible = true;

            window.DrillObject = object

            const clonedDrill = window.DrillObject.clone();
            clonedDrill.position.x = -608; // Apply X offset
            clonedDrill.position.y = -1356; // Apply Y offset
            window.DrillObject2 = clonedDrill

        }, (xhr) => {
            console.log((xhr.loaded / xhr.total * 100) + '% loaded');
        }, (error) => {
            console.error('An error occurred:', error);
        });

        const mtlLoader = new MTLLoader();
        mtlLoader.load('/hole/hole.mtl', (materials) => {
            materials.preload();
            let texture: any = null
            let objLoader: any
            objLoader = new OBJLoader();
            objLoader.setMaterials(materials);
            objLoader.load(
                '/hole/hole.obj',
                (object) => {
                    if (object instanceof THREE.Group) {
                        object.children.forEach(child => {
                            if (child instanceof THREE.LineSegments) {
                                const geometry = (child.geometry as THREE.BufferGeometry).clone();
                                const material = new THREE.MeshStandardMaterial({
                                    color: 0x8B4513, // Gold color
                                    metalness: 0.5,
                                    roughness: 0.5,
                                    depthWrite: false,
                                    transparent: true
                                });
                                const mesh = new THREE.Mesh(geometry, material);
                                object.add(mesh); // Add the new mesh to the group
                            } else if (child instanceof THREE.Mesh) {
                                object.add(child);
                            }
                        });
                    }
                    object.traverse((child: any) => {
                        if (child.isMesh) {
                            child.material = new THREE.MeshStandardMaterial({
                                color: 0x8B4513, // Gold color
                                metalness: 0.5,
                                roughness: 0.5,
                                depthWrite: false,
                                transparent: true
                            });
                        }
                    });
                    object.scale.copy(new THREE.Vector3(0.1, 0.1, 0.1))
                    object.visible = true; // Initially set to invisible
                    window.DrillHole = object
                },
                undefined,
                (error) => {
                    console.error(`An error occurred while loading the OBJ file: ${error}`);
                }
            );
        });
    }

    const fetchDrillHole = async () => {
        const mtlLoader = new MTLLoader();
        await mtlLoader.load('/hole/hole.mtl', (materials) => {
            materials.preload();
            let texture: any = null
            let objLoader: any
            objLoader = new OBJLoader();
            objLoader.setMaterials(materials);
            objLoader.load(
                '/hole/hole.obj',
                (object) => {
                    if (object instanceof THREE.Group) {
                        object.children.forEach(child => {
                            if (child instanceof THREE.LineSegments) {
                                const geometry = (child.geometry as THREE.BufferGeometry).clone();
                                const material = new THREE.MeshStandardMaterial({
                                    color: 0x8B4513, // Gold color
                                    metalness: 0.5,
                                    roughness: 0.5,
                                    depthWrite: false,
                                    transparent: true
                                });
                                const mesh = new THREE.Mesh(geometry, material);
                                object.add(mesh); // Add the new mesh to the group
                            } else if (child instanceof THREE.Mesh) {
                                object.add(child);
                            }
                        });
                    }
                    object.traverse((child: any) => {
                        if (child.isMesh) {
                            child.material = new THREE.MeshStandardMaterial({
                                color: 0x8B4513, // Gold color
                                metalness: 0.5,
                                roughness: 0.5,
                                depthWrite: false,
                                transparent: true
                            });
                        }
                    });
                    object.scale.copy(new THREE.Vector3(0.1, 0.1, 0.1))
                    object.visible = true; // Initially set to invisible
                    window.DrillHole = object
                },
                undefined,
                (error) => {
                    console.error(`An error occurred while loading the OBJ file: ${error}`);
                }
            );
        });
    }
    const fetch3DExcavator = async () => {
        const loader = new FBXLoader();
        let hydraulicCylinder: THREE.Object3D | null = null;
        let hydraulicPiston: THREE.Object3D | null = null;
        let boom: THREE.Object3D | null = null;
        let body: THREE.Object3D | null = null;
        let dirt: THREE.Object3D | null = null;
        let truckDirt: THREE.Object3D | null = null;
        let arm: THREE.Object3D | null = null;
        let bucket: THREE.Object3D | null = null;
        loader.load('/Excavator/excavator.fbx', (object) => {
            // Set up the AnimationMixer
            // Traverse the loaded object to find and play animations
            object.traverse((child: any) => {
                if (!child.material) {
                    child.material = new THREE.MeshStandardMaterial({
                        color: 0xFFB43B, // Default color if no material found
                        roughness: 0.5,
                        metalness: 0.5
                    });
                }

                if (child.isMesh) {
                    // Set depthTest to false
                    if (isArray(child.material)) {
                        child.material.map((_child) => {
                            if (child.material && child.material.color && !(child.material.color.r < 0.1 && child.material.color.g < 0.1 && child.material.color.b < 0.1)) {
                                child.material = new THREE.MeshStandardMaterial({
                                    color: 0xFFB43B, // Default color if no material found
                                    roughness: 0.5,
                                    metalness: 0.5
                                });
                            }
                            if (!child.material.color) {
                                child.material.color = 0xFFB43B
                            }
                            _child.depthTest = true
                            _child.depthWrite = true
                            _child.transparent = false
                        })
                        child.renderOrder = 9998
                    }
                    else {
                        if (child.material && child.material.color && !(child.material.color.r < 0.1 && child.material.color.g < 0.1 && child.material.color.b < 0.1)) {
                            child.material = new THREE.MeshStandardMaterial({
                                color: 0xFFB43B, // Default color if no material found
                                roughness: 0.5,
                                metalness: 0.5
                            });
                        }
                        if (!child.material.color) {
                            child.material.color = 0xFFB43B
                        }
                        child.material.depthTest = true
                        child.material.depthWrite = true
                        child.material.transparent = false
                        child.renderOrder = 10000
                    }
                }
                if (child.name === 'Dirt') {
                    child.material = new THREE.MeshStandardMaterial({
                        color: 0x8B4513, // Default color if no material found
                        roughness: 0.5,
                        metalness: 0.5
                    });
                    dirt = child;
                    if (dirt) {
                        dirt.visible = true
                    }
                    // -1395, 490, 50
                    truckDirt = child.clone()
                    if (truckDirt) {
                        truckDirt.position.copy(new THREE.Vector3(-1386, 473, 47))
                        truckDirt.rotation.copy(new THREE.Euler(Math.PI * 2, Math.PI, Math.PI))
                        truckDirt.scale.copy(new THREE.Vector3(5, 5, 5))
                        // window.map.scene.add(truckDirt)
                    }
                    let truckDirt1 = child.clone()
                    if (truckDirt1) {
                        truckDirt1.visible = true
                        truckDirt1.position.copy(new THREE.Vector3(-1394, 475, 56))
                        truckDirt1.rotation.copy(new THREE.Euler(Math.PI * 2, 3, Math.PI))
                        truckDirt1.scale.copy(new THREE.Vector3(3, 3, 3))
                        // window.map.scene.add(truckDirt1)
                    }
                    let truckDirt2 = child.clone()
                    if (truckDirt2) {
                        truckDirt2.position.copy(new THREE.Vector3(-1380, 492, 54))
                        truckDirt2.rotation.copy(new THREE.Euler(Math.PI * 2, 3, Math.PI / 2))
                        truckDirt2.scale.copy(new THREE.Vector3(4, 4, 4))
                        // window.map.scene.add(truckDirt2)
                    }
                    let truckDirt3 = child.clone()
                    if (truckDirt3) {
                        truckDirt3.position.copy(new THREE.Vector3(-1390, 470, 56))
                        truckDirt3.rotation.copy(new THREE.Euler(Math.PI * 2, 3, Math.PI))
                        truckDirt3.scale.copy(new THREE.Vector3(3, 3, 3))
                        // window.map.scene.add(truckDirt3)
                    }
                    let truckDirt4 = child.clone()
                    if (truckDirt4) {
                        truckDirt4.position.copy(new THREE.Vector3(-1394, 472, 58))
                        truckDirt4.rotation.copy(new THREE.Euler(Math.PI * 2, 3, Math.PI))
                        truckDirt4.scale.copy(new THREE.Vector3(3, 3, 3))
                        // window.map.scene.add(truckDirt3)
                    }
                    dirts.current = [truckDirt, truckDirt1, truckDirt2, truckDirt3, truckDirt4]

                    // -396, -2045, 40
                    const truck1Position = new THREE.Vector3(-1395, 490, 50);

                    // Truck 2 position
                    const truck2Position = new THREE.Vector3(-396, -2045, 40);

                    // Calculate offset
                    const offset = new THREE.Vector3().subVectors(truck2Position, truck1Position);
                    let truck2Dirt = truckDirt?.clone()
                    if (truck2Dirt) {
                        truck2Dirt.position.copy(new THREE.Vector3(-1386, 473, 47).add(offset))
                        truck2Dirt.rotation.copy(new THREE.Euler(Math.PI * 2, Math.PI, Math.PI))
                        truck2Dirt.scale.copy(new THREE.Vector3(5, 5, 5))
                        // window.map.scene.add(truckDirt)
                    }
                    let truck2Dirt1 = truckDirt1?.clone()
                    if (truck2Dirt1) {
                        truck2Dirt1.visible = true
                        truck2Dirt1.position.copy(new THREE.Vector3(-1394, 475, 56).add(offset))
                        truck2Dirt1.rotation.copy(new THREE.Euler(Math.PI * 2, 3, Math.PI))
                        truck2Dirt1.scale.copy(new THREE.Vector3(3, 3, 3))
                        // window.map.scene.add(truckDirt1)
                    }
                    let truck2Dirt2 = truckDirt2?.clone()
                    if (truck2Dirt2) {
                        truck2Dirt2.position.copy(new THREE.Vector3(-1380, 492, 54).add(offset))
                        truck2Dirt2.rotation.copy(new THREE.Euler(Math.PI * 2, 3, Math.PI / 2))
                        truck2Dirt2.scale.copy(new THREE.Vector3(4, 4, 4))
                        // window.map.scene.add(truckDirt2)
                    }
                    let truck2Dirt3 = truckDirt3?.clone()
                    if (truck2Dirt3) {
                        truck2Dirt3.position.copy(new THREE.Vector3(-1394, 472, 58).add(offset))
                        truck2Dirt3.rotation.copy(new THREE.Euler(Math.PI * 2, 3, Math.PI))
                        truck2Dirt3.scale.copy(new THREE.Vector3(3, 3, 3))
                        // window.map.scene.add(truckDirt3)
                    }
                    let truck2Dirt4 = truckDirt3?.clone()
                    if (truck2Dirt4) {
                        truck2Dirt4.position.copy(new THREE.Vector3(-1390, 470, 56).add(offset))
                        truck2Dirt4.rotation.copy(new THREE.Euler(Math.PI * 2, 3, Math.PI))
                        truck2Dirt4.scale.copy(new THREE.Vector3(3, 3, 3))
                        // window.map.scene.add(truckDirt3)
                    }
                    dirts2.current = [truck2Dirt, truck2Dirt1, truck2Dirt2, truck2Dirt3, truck2Dirt4]
                }
                else if (child.name == 'Cylinder020') {
                    body = child
                }
                else if (child.name == 'Cylinder007') {
                    hydraulicCylinder = child;
                }
                else if (child.name == 'Cylinder005') {
                    hydraulicPiston = child;
                }
                else if (child.name == 'Plane018') {
                    boom = child;
                }
                else if (child.name == 'Plane019') {
                    arm = child;
                }
                else if (child.name == "Armature") {
                    bucket = child;
                }
            });
            // Store references to the parts in the DiggerObject
            window.DiggerObject = {
                group: new THREE.Group(),
                body,
                boom,
                arm,
                bucket,
                hydraulicCylinder,
                hydraulicPiston,
                dirt,
                truckDirt
            };

            // Add the entire excavator object to the group and scene
            window.DiggerObject.group.add(object);
            window.DiggerObject.group.scale.set(0.1, 0.1, 0.1);
            window.DiggerObject.group.rotation.x = Math.PI / 2; // Adjust rotation
            window.DiggerObject.group.rotation.y = Math.PI / 2; // Adjust orientation
            window.DiggerObject.group.position.z += 10;
            window.DiggerObject.group.visible = true;
            window.DiggerObject.group.position.copy(diggerInitPoint ? diggerInitPoint : new THREE.Vector3(-1380, 430, 65));

            if (window.TruckObject) {
                window.TruckObject.rotation.z += Math.PI
                window.TruckObject.visible = true
                window.TruckObject.traverse((child: any) => {
                    if (child.isMesh) {
                        if (isArray(child.material)) {
                            child.material.map((_child) => {
                                _child.depthTest = true
                                _child.depthWrite = true
                                _child.transparent = false
                            })
                            child.renderOrder = 9998
                        }
                        else {
                            child.material.depthTest = true
                            child.material.depthWrite = true
                            child.material.transparent = false
                            child.renderOrder = 10000
                        }
                    }
                });
                window.TruckObject.position.copy(truckInitPoint ? truckInitPoint : new THREE.Vector3(-1395, 490, 50));
            }
        }, (xhr) => {
            console.log((xhr.loaded / xhr.total * 100) + '% loaded');
        }, (error) => {
            console.error('An error occurred:', error);
        });

        loader.load('/Excavator/excavator.fbx', (object) => {
            // Set up the AnimationMixer
            window.mixer2 = new THREE.AnimationMixer(object);
            // Traverse the loaded object to find and play animations
            object.traverse((child: any) => {
                if (!child.material) {
                    child.material = new THREE.MeshStandardMaterial({
                        color: 0xFFB43B, // Default color if no material found
                        roughness: 0.5,
                        metalness: 0.5
                    });
                }

                if (child.isMesh) {
                    // Set depthTest to false
                    if (isArray(child.material)) {
                        child.material.map((_child) => {
                            if (child.material && child.material.color && !(child.material.color.r < 0.1 && child.material.color.g < 0.1 && child.material.color.b < 0.1)) {
                                child.material = new THREE.MeshStandardMaterial({
                                    color: 0xFFB43B, // Default color if no material found
                                    roughness: 0.5,
                                    metalness: 0.5
                                });
                            }
                            if (!child.material.color) {
                                child.material.color = 0xFFB43B
                            }
                            _child.depthTest = true
                            _child.depthWrite = true
                            _child.transparent = false
                        })
                        child.renderOrder = 9998
                    }
                    else {
                        if (child.material && child.material.color && !(child.material.color.r < 0.1 && child.material.color.g < 0.1 && child.material.color.b < 0.1)) {
                            child.material = new THREE.MeshStandardMaterial({
                                color: 0xFFB43B, // Default color if no material found
                                roughness: 0.5,
                                metalness: 0.5
                            });
                        }
                        if (!child.material.color) {
                            child.material.color = 0xFFB43B
                        }
                        child.material.depthTest = true
                        child.material.depthWrite = true
                        child.material.transparent = false
                        child.renderOrder = 10000
                    }
                }
                if (child.name == 'Cylinder020') {
                    body = child
                }
                else if (child.name === 'Dirt') {
                    child.material = new THREE.MeshStandardMaterial({
                        color: 0x8B4513, // Default color if no material found
                        roughness: 0.5,
                        metalness: 0.5
                    });
                    dirt = child
                }
                else if (child.name == 'Cylinder007') {
                    hydraulicCylinder = child;
                }
                else if (child.name == 'Cylinder005') {
                    hydraulicPiston = child;
                }
                else if (child.name == 'Plane018') {
                    boom = child;
                }
                else if (child.name == 'Plane019') {
                    arm = child;
                }
                else if (child.name == "Armature") {
                    bucket = child;
                }
            });
            window.DiggerObject2 = {
                group: new THREE.Group(),
                body,
                boom,
                arm,
                bucket,
                hydraulicCylinder,
                hydraulicPiston,
                dirt,
                truckDirt
            };

            // Add the entire excavator object to the group and scene
            window.DiggerObject2.group.add(object);
            window.DiggerObject2.group.scale.set(0.1, 0.1, 0.1);
            window.DiggerObject2.group.rotation.x = Math.PI / 2; // Adjust rotation
            window.DiggerObject2.group.rotation.y = Math.PI / 2; // Adjust orientation
            window.DiggerObject2.group.visible = true;
            window.DiggerObject2.group.position.copy(diggerInitPoint ? diggerInitPoint : new THREE.Vector3(-380, -2111, 55));
        }, (xhr) => {
            console.log((xhr.loaded / xhr.total * 100) + '% loaded');
        }, (error) => {
            console.error('An error occurred:', error);
        });
    }

    const fetch3DTruck = async () => {
        const loader = new FBXLoader();
        loader.load('/Truck/3D_Truck.fbx', (object) => {
            // Set up the AnimationMixer
            window.mixer = new THREE.AnimationMixer(object);
            // Traverse the loaded object to find and play animations
            object.animations.forEach((clip, index) => {
                if (clip.name === '3D_Truck_Back1|3D_Truck_BackAction' || clip.name === '3D_Truck_Back2|3D_Truck_BackAction' || clip.name === '3D_Truck_Front|3D_Truck_FrontAction') {
                    const action = window.mixer.clipAction(clip);
                    action.play();
                }
            });
            object.traverse((child: any) => {
                if (child.isMesh) {
                    // Set depthTest to false
                    if (isArray(child.material)) {
                        child.material.map((_child) => {
                            _child.depthTest = false
                            _child.depthWrite = true
                            _child.transparent = true
                        })
                        child.renderOrder = 9998
                    }
                    else {
                        child.material.depthTest = false
                        child.material.depthWrite = true
                        child.material.transparent = true
                        child.renderOrder = 10000
                    }
                }
            });
            object.scale.set(0.2, 0.2, 0.2);
            object.rotation.x = Math.PI / 2; // Correct if the object is flipped around the X axis
            object.rotation.y = Math.PI / 2;     // Adjust to face the correct direction
            object.position.z += 10

            const group = new THREE.Group();
            group.add(object)
            group.visible = false
            window.TruckObject = group
        }, (xhr) => {
            console.log((xhr.loaded / xhr.total * 100) + '% loaded');
        }, (error) => {
            console.error('An error occurred:', error);
        });
    }

    const isAnimationRef = useRef(isAnimation);
    useEffect(() => {
        isAnimationRef.current = isAnimation;
    }, [isAnimation]);

    const loadMapView = useCallback(async () => {

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1e6);

        camera.up = new THREE.Vector3(0, 0, 1);
        camera.position.set(0, 0, 5000);
        window.animationZoom = 5000

        camera.updateMatrixWorld();
        camera.updateProjectionMatrix();
        window.camera = camera;
        const renderer = new THREE.WebGLRenderer({
            antialias: false,
            alpha: true,
            // logarithmicDepthBuffer: false,
        });

        if (localMapContainerRef.current) {
            renderer.domElement.className = "threejs-view";
            localMapContainerRef.current.appendChild(renderer.domElement);
            if (isPitView && onDocumentMouseMove) {
                renderer.domElement.addEventListener('mousemove', onDocumentMouseMove, false);
            }
            else {
                renderer.domElement.addEventListener('mousemove', _onDocumentMouseMove, false);
            }
            renderer.domElement.addEventListener('wheel', onDocumentMouseWheel, false);
            onDocumentMouseClick && renderer.domElement.addEventListener('click', onDocumentMouseClick, false)
            onDocumentMouseDblClick && renderer.domElement.addEventListener('dblclick', (e) => { onDocumentMouseDblClick(e) }, false)
        }

        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        renderer.setSize(window.innerWidth, window.innerHeight);
        window.renderer = renderer
        const controls = new MapControls(window.camera, renderer.domElement);
        controls.autoRotate = false;
        controls.maxPolarAngle = Math.PI * 0.3;
        window.controls = controls;

        let controlsGizmo = new OrbitControlsGizmo(controls, { size: 100, padding: 8 });
        // Add the Gizmo to the document
        localMapContainerRef.current && localMapContainerRef.current.appendChild(controlsGizmo.domElement);

        var axesHelper = new THREE.AxesHelper(2000)
        // scene.add(axesHelper)

        // scene.background = new THREE.Color(0x91abb5);
        scene.fog = new THREE.FogExp2(0x91abb5, 0.000001);

        const ambientLight = new THREE.AmbientLight(0x404040, 2);
        const dirLight = new THREE.DirectionalLight(0xffffff, 1.5);
        dirLight.castShadow = true;
        dirLight.position.set(-10000, -10000, 10000);
        scene.add(ambientLight);
        scene.add(dirLight);

        const position = [lat, lng];
        const source = new Source('mapbox', mapboxgl.accessToken);
        let nTiles = 24;
        let zoom = 18
        const map = new Map(scene, window.camera, source, position, nTiles, zoom, {});
        window.map = map;
        // const mapPicker = new MapPicker(window.camera, map, localMapContainerRef.current, controls);
        // window.mapPicker = mapPicker;
        window.controls.addEventListener('change', () => {
            if (window.savedCameraPosition && window.savedCameraQuaternion) {
                window.camera.position.copy(window.savedCameraPosition);
                window.camera.quaternion.copy(window.savedCameraQuaternion);
            }

            // If you need to trigger specific logic when zoom happens during animation
            if (window.isAnimation) {
                handleZoomDuringAnimation();
            }
            var dir = new THREE.Vector3();
            var sph = new THREE.Spherical();
            window.camera.getWorldDirection(dir);
            const adjustedDir = new THREE.Vector3(dir.x, dir.z, dir.y);  // Swap Y and Z

            // Set spherical coordinates based on the adjusted direction
            sph.setFromVector3(adjustedDir);
            let normalizedTheta = -sph.theta;

            // Apply this to the compass
            compass && (compass.style.transform = `rotate(${THREE.MathUtils.radToDeg(normalizedTheta) - 180}deg)`);
        });
        const grid: any = new InfiniteGridHelper(.1, .1, new THREE.Color("#8E6F47"));
        scene.add(grid);

        // set routes to the map variable
        map.setRoutes(vehicleRoutes)
        // set default categories
        map.setFilteredCategories([])
        // draw the routes only one time
        let drawed = true

        // Load the background image using THREE.TextureLoader
        // if (isLight) {
        //     if (window.map && window.map.scene) {
        //         const loader = new THREE.TextureLoader();
        //         loader.load(BACKGROUND_LIGHT, (texture) => {
        //             window.map.scene.background = texture;  // Set the loaded texture as the background
        //         });
        //     }
        // }
        // else{
        //     if (window.map && window.map.scene) {
        //         const loader = new THREE.TextureLoader();
        //         loader.load(BACKGROUND, (texture) => {
        //             window.map.scene.background = texture;  // Set the loaded texture as the background
        //         })
        //     }
        // }
        const cubeview: any = document.getElementById('obit-controls-gizmo')
        const compass: any = document.getElementById('compass')
        // Main render loop
        const mainLoop = (timestamp: number) => {
            if (!window.map) {
                if (animationFrameId.current) {
                    cancelAnimationFrame(animationFrameId.current)
                }
                return;
            }
            animationFrameId.current = requestAnimationFrame(mainLoop);
            if (mixer.current) {
                const delta = clock.current.getDelta();
                mixer.current.update(delta);
            }
            if (mixer2.current) {
                const delta = clock2.current.getDelta();
                mixer2.current.update(delta);
            }
            if (map.progress >= nTiles * nTiles) {
                if (drawed) {
                    setIsLoading(false);
                    drawMarkers && drawMarkers()
                    window.map.drawRoutes()
                    drawed = false
                    !isPitView && drawGeofences()
                }
            } else {
                let _progress: number = (Math.min(Math.floor(map.progress / (nTiles * nTiles) * 100), 100))
                setProgress(_progress);
            }
            if (window.isAnimation) {
                cubeview && (cubeview.style.display = 'none')

                // Update camera and controls if in animation mode
                animateWheels();

                // Ensure the camera position is set correctly during animation
                if (window.savedCameraPosition) {
                    window.camera.position.copy(window.savedCameraPosition);
                    window.camera.quaternion.copy(window.savedCameraQuaternion);
                    window.camera.updateProjectionMatrix();
                    window.controls.update();
                    renderer.render(scene, window.camera);
                }
            } else {
                cubeview && (cubeview.style.display = 'block')
                // Lock the camera to the last position during pause
                if (window.savedCameraPosition && window.savedCameraQuaternion) {
                    window.camera.position.copy(window.savedCameraPosition);
                    window.camera.quaternion.copy(window.savedCameraQuaternion);
                    window.savedCameraPosition = null
                    window.savedCameraQuaternion = null
                    window.camera.updateProjectionMatrix();
                }
                else {
                    renderer.render(scene, window.camera);
                }
            }
            updateAnnotations && updateAnnotations();
            updateMarkerTooltip && updateMarkerTooltip();
        };
        mainLoop(0);
        WindowResize(renderer, window.camera);
    }, [setProgress])

    const handleZoomDuringAnimation = () => {
        if (!window.camera) return
        if (window.camera.position.z !== window.animationZoom) {
            window.animationZoom = window.camera.position.z;  // Update the last known Z position
        }
    }

    const animateWheels = () => {
        window.mixer && window.mixer.update(30)
    }

    // useEffect(() => {
    //     if (!window.map) return
    //     if (isLight) {
    //         const loader = new THREE.TextureLoader();
    //         loader.load(BACKGROUND_LIGHT, (texture) => {
    //             window.map.scene.background = texture;  // Set the loaded texture as the background
    //         });
    //     }
    //     else {
    //         const loader = new THREE.TextureLoader();
    //         loader.load(BACKGROUND, (texture) => {
    //             window.map.scene.background = texture;  // Set the loaded texture as the background
    //         });
    //     }
    // }, [isLight])

    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    const [showToolTip, setShowToolTip] = useState<boolean>(false)
    const [properties, setProperties] = useState<Propertytype | null>(null)
    const _onDocumentMouseMove = useCallback((event) => {
        if (!localMapContainerRef.current || !window.map) return
        // Normalize mouse position to -1 to 1 range
        const rect = localMapContainerRef.current.getBoundingClientRect();
        mouse.x = ((event.clientX - rect.left) / localMapContainerRef.current.clientWidth) * 2 - 1;
        mouse.y = -((event.clientY - rect.top) / localMapContainerRef.current.clientHeight) * 2 + 1;
        // Update raycaster with the mouse position and the camera
        window.camera.updateProjectionMatrix();
        window.camera.updateMatrixWorld();
        raycaster.setFromCamera(mouse, window.camera);

        const x = (mouse.x * 0.5 + 0.5) * localMapContainerRef.current.clientWidth;
        const y = -(mouse.y * 0.5 - 0.5) * localMapContainerRef.current.clientHeight;
        // Check for intersections with clickable sprites
        const intersects = raycaster.intersectObjects(window.map.scene.children, true);
        // Change cursor style based on intersection
        if (intersects.length > 0) {
            const intersectedObject = intersects.find(intersect => intersect.object.userData.isHole && intersect.object.userData.name);

            if (intersectedObject) {
                const { name, drillTime, depth, holeType } = intersectedObject.object.userData;
                setTooltipContent(
                    `<strong style="font-size: '18px', color: 'green'">${name}</strong><br>Depth: ${depth}m<br>Drill Time: ${drillTime}<br>Type: ${holeType}`
                );
                setTooltipPosition({ x: x - 20, y: y - 20 });
                return
            } else {
                setTooltipContent(null);
            }
        } else {
            setTooltipContent(null);
        }
        if (intersects.length > 0) {
            // Filter the intersects array for objects with userData.isStopSign, isRoute, or isPointer
            const validIntersects = intersects.filter(intersect => {
                const userData = intersect.object.userData;
                return userData && (userData.isStopSign || userData.isRoute || userData.isPointer);
            });

            // If there is exactly one valid intersect, change the cursor to 'pointer'
            if (validIntersects.length === 1) {
                document.body.style.cursor = 'pointer';
            } else {
                document.body.style.cursor = 'auto'; // Default cursor style
            }
        } else {
            document.body.style.cursor = 'auto'; // Default cursor style
        }
        if (intersects.length > 0) {
            if (isAutoRouting || diggerImport) return;
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
            else {
                document.body.style.cursor = 'auto'; // Default cursor style
                setShowToolTip(false)
            }
        } else {
            document.body.style.cursor = 'auto'; // Default cursor style
            setShowToolTip(false)
        }
    }, [showToolTip])

    const onDocumentMouseWheel = (event) => {
        if (!window.camera || !window.isAnimation) return;

        const minZoom = 0.1;  // Set the minimum zoom level
        const maxZoom = 3.5;  // Set the maximum zoom level

        if (event.deltaY < 0) {
            // Scrolling up (zooming in)
            if (window.camera.zoom < maxZoom) {  // Check if zoom level is below the max limit
                window.camera.zoom += 0.05;
                window.camera.zoom = Math.min(window.camera.zoom, maxZoom);  // Enforce max zoom limit
                window.camera.updateProjectionMatrix();
            }
        } else {
            // Scrolling down (zooming out)
            if (window.camera.zoom > minZoom) {  // Check if zoom level is above the min limit
                window.camera.zoom -= 0.05;
                window.camera.zoom = Math.max(window.camera.zoom, minZoom);  // Enforce min zoom limit
                window.camera.updateProjectionMatrix();
            }
        }
    };


    useEffect(() => {
        if (!defaultLayers || defaultLayers.length === 0) return
        const selectedCategories = _layerOptions
            .filter((option: any) => defaultLayers && defaultLayers.includes(option?.label)) // Get matching label from _layerOptions
            .map(option => option.value); // Extract corresponding values (categories)
        window.map && window.map.setFilteredCategories(selectedCategories)
    }, [vehicleRoutes, defaultLayers])


    const drawGeofences = useCallback(() => {
        if (!geoFences.current || geoFences.current.length === 0 || !window.map) return

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
                depth: (_fence.properties.altitude - 400) * 2 - 7,                   // Extrude along the Z axis (depth)
                bevelEnabled: true,          // No bevel for the shape
            };
            shape.autoClose = true;
            // Create the geometry and material
            const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
            const material = new THREE.MeshBasicMaterial({
                color: properties.fillColor,
                depthTest: true,
                depthWrite: false,
                transparent: false,
                opacity: 1 // Adjust opacity if needed
            });

            // Create the mesh and add it to the scene
            const mesh = new THREE.Mesh(geometry, material);
            mesh.renderOrder = 1
            mesh.userData = { isGeoFence: true, properties: properties }
            window.map.scene.add(mesh);
        })
    }, [geoFences])

    return (
        <>
            <Card className='threejs-view-card-header' style={{ marginBottom: '0px', height: height ? height : "calc(100%)", padding: '0px', width: '100%' }}>
                <CardBody className='threejs-view-body'>
                    {isLoading ? (
                        <>
                            <div className="loading-overlay" style={{ top: "calc(50vh - 151px)", position: 'absolute', width: 'calc(100% - 20px)', height: '50%', left: '10px' }}>
                                <Spin className='map-loading-bar' style={{ color: 'gold', background: 'transparent' }} tip="Loading...">
                                    <Progress className='map-loading-progress-bar' percent={progress} status="active" style={{ background: 'transparent' }} />
                                </Spin>
                            </div>
                        </>
                    ) : (
                        <></>
                    )}
                    <div ref={localMapContainerRef} style={{ height: height ? height : "calc(100%)", width: width ? width : '100%', opacity: isLoading ? '0.05' : '1' }}>
                        {children}
                    </div>
                    <div id="compassContainer" style={{ position: 'absolute', top: '10px', right: isAutoRouting ? '40px' : '10px', opacity: isLoading ? 0.1 : 1, borderRadius: '50%', display: 'flex', 'justifyContent': 'center', width: '160px' }}>
                        <img id={'compass'} width={160} src={COMPASS} style={{ position: 'absolute', filter: 'sepia(1)' }}></img>
                        <img src={COMPASS_VECTOR} height={120} style={{ transformOrigin: 'center center', position: 'absolute', top: '19px', left: '72px' }}>
                        </img>
                    </div>
                    <div id='tooltipRef' style={{ display: showToolTip ? 'block' : 'none' }} className='geofence-tooltip'>
                        <table
                            style={{
                                fontFamily: "arial, sans-serif",
                                borderCollapse: "collapse",
                                width: "100%",
                                // border: "1px solid #000",
                            }}
                        >
                            <tbody>
                                {properties && Object.entries(properties).map(([key, value], index) => {
                                    if (key != "id" && key != "locationId") {
                                        return (
                                            <tr key={key}>
                                                <td style={{ padding: "4px" }} className='geofence-property-key'>{key}</td>
                                                <td style={{ padding: "4px" }} className='geofence-property-value'>{key == 'fillColor' ? <><div style={{ width: '50px', height: '20px', background: value }}></div></> : value}</td>
                                            </tr>
                                        );
                                    }
                                    return "";
                                })}
                            </tbody>
                        </table>
                    </div>
                    {tooltipContent && (
                        <div
                            style={{
                                position: 'absolute',
                                backgroundColor: '#1C263C80',
                                color: 'white',
                                left: tooltipPosition.x,
                                top: tooltipPosition.y,
                                padding: '10px',
                                pointerEvents: 'none',
                                display: 'block',
                            }}
                            dangerouslySetInnerHTML={{ __html: tooltipContent }}
                        />
                    )}
                </CardBody>
            </Card>
        </>
    )
})