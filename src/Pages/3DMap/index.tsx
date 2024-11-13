import { Source, Map, MapPicker } from './modules/Source'
import React, { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { Card, CardBody, Col, Container, Row } from 'reactstrap';
import Breadcrumb from 'Components/Common/Breadcrumb';
import { useDispatch, useSelector } from 'react-redux';
import './index.css'
import mapboxgl from 'mapbox-gl';
import { WindowResize } from './modules/WindowResize'
import { InfiniteGridHelper } from './modules/InfiniteGridHelper'
import * as THREE from "three";
import { MapControls } from 'Components/Common/CubeCamera/OrbitControls.js';
import _, { isArray } from 'lodash';
import { Checkbox, CheckboxProps, Progress, Spin } from 'antd';
import 'antd/dist/reset.css';
import JSZip from '@turbowarp/jszip'
import * as Leaflet from 'leaflet';
import { getAllVehicleRoutes, getGeoFences } from 'slices/thunk';
import { DropdownType } from 'Components/Common/Dropdown';
import BACKGROUND from '../../assets/images/3DPit/galaxy.jpg'
import BACKGROUND_LIGHT from '../../assets/images/3DPit/daysky.png'
import { LAYOUT_MODE_TYPES } from "Components/constants/layout";
import { FenceSelector, LayoutSelector, VehicleRouteSelector } from 'selectors';
import RBush from 'rbush';
import bbox from '@turf/bbox';
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js'; // ES6 import
import { addOrUpdateData, getDataByKey } from 'interfaces/IDB';
import { OrbitControlsGizmo } from "Components/Common/CubeCamera/OrbitControlsGizmo.js";
import COMPASS from 'assets/images/compass.png'
import COMPASS_VECTOR from 'assets/images/compass-vector.png'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
const index = new RBush();

declare global {
    interface Window {
        map: any;
        mapPicker: any;
        controls: any;
        renderer: any;
        TruckObject: any;
        DiggerObject: any;
        savedCameraPosition: any;
        savedCameraQuaternion: any;
        isAnimation: any;
        mixer: any;
        animationZoom: any;
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
    isPitView?: boolean;
    diggerInitPoint?: any;
    truckInitPoint?: any;
    children?: React.ReactNode; // Children prop is optional
}
export const THREEJSMap = forwardRef<HTMLDivElement, THREEJSMapProps>(({children = <></>, defaultLayers, drawMarkers, updateAnnotations, setIsLoading, isLoading, updateMarkerTooltip, height, width, isAnimation = false, onDocumentMouseClick, onDocumentMouseDblClick, onDocumentMouseMove, isPitView = false, isAutoRouting = false, diggerImport = false, diggerInitPoint = null, truckInitPoint = null}, ref: any) => {
    const dispatch: any = useDispatch();
    const geoFences = useRef<any>([])

    const localMapContainerRef = useRef<HTMLDivElement | null>(null);
    const mixer = useRef<any>(null)
    const clock = useRef<any>(null)
    // This exposes the localMapContainerRef to the parent component using localMapContainerRef
    useImperativeHandle(ref, () => ({
        getMapContainer: () => localMapContainerRef.current,
    }));

    const { vehicleRoutes } = useSelector(VehicleRouteSelector);

    const { layoutModeType } = useSelector(LayoutSelector);
    const isLight = layoutModeType === LAYOUT_MODE_TYPES.LIGHT;
    const views = ["Top", "Front", "Left", "Right", "Back"]
    const [currentView, setCurrentView] = useState<any>('')
    const _layerOptions: DropdownType[] = [
        { label: 'Current Haul Routes', value: 'CURRENT_HAUL_ROUTES' },
        { label: 'Future Road Designs', value: 'FUTURE_ROAD_DESIGNS' },
        { label: 'Speed Restrictions', value: 'SPEED_RESTRICTIONS' },
        { label: 'Pit Bottom', value: 'PIT_BOTTOM' },
        { label: 'Pit Climb', value: 'PIT_CLIMB' },
        { label: 'Stop Signs', value: 'STOP_SIGNS' },
        { label: 'Restricted', value: 'RESTRICTED' },
    ];
    const layerOptions = ['Active Benches', 'Current Haul Routes', 'Future Road Designs', 'Speed Restrictions', 'Pit Bottom', 'Pit Climb', 'Stop Signs',        'Restricted', 'Dump Locations'];

    mapboxgl.accessToken = process.env.MAPBOX_API_KEY || 'pk.eyJ1IjoibXlreXRhcyIsImEiOiJjbTA1MGhtb3YwY3Y0Mm5uY3FzYWExdm93In0.cSDrE0Lq4_PitPdGnEV_6w';
    const [lng, setLng] = useState(120.44871814239025);
    const [lat, setLat] = useState(-29.1506602184213);
    const [checkedList, setCheckedList] = useState<string[]>(defaultLayers || [''])
    const geojsonData = useRef<any>();

    // state for Map loading status
    const [progress, setProgress] = useState(0); // Progress state
    const animationFrameId = useRef<number | null>(null);
    let map: any;
    const wheels = useRef<any>([])
    useEffect(() => {
        dispatch(getAllVehicleRoutes())
        dispatch(getGeoFences()); // Dispatch action to fetch data on component mount
    }, [dispatch]);

    useEffect(() => {
        if (map) return
        setIsLoading(true);
        fetchGeofences()
        fetchZipFile()
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
                if (isPitView && onDocumentMouseMove) {
                    domElement.removeEventListener('mousemove', onDocumentMouseMove, false);
                }
                else{
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
            geoFences.current = null
        };
    }, []); // Added dependencies to reinitialize map if lat/lng changes
    
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

    const fetchZipFile = async () => {
        const _fetchZipFile = async () => {
            const retrievedData = await getDataByKey('mainGeojson');
            if (retrievedData) {
                processZipFile(retrievedData)
            }
            else{
                const zipBuffer = await fetch('/240817_Pits_3D_WGS84.zip').then(response => response.arrayBuffer())
                JSZip.loadAsync(zipBuffer).then(data => {
                    return data.file('240817_Pits_3D_WGS84.geojson')?.async("string");
                }).then(async (text) => {
                    var geojsonData = JSON.parse(text as string)
                    processZipFile(geojsonData)
                    await addOrUpdateData('mainGeojson', geojsonData);
                })
            }
        };
      
        await _fetchZipFile(); 
    }

    const processZipFile = async (geojsonData) => {
        // const _processZipFile = async () => {
        //     // const retrievedData = await getDataByKey('imageData');
        //     // // if (retrievedData) {
        //     // //     loadMapView(geojsonData, retrievedData);
        //     // // }
        //     // // else{
                // Fetch the ZIP file and get its ArrayBuffer
                const zipBuffer = await fetch('/images.zip').then(response => response.arrayBuffer());
                
                // Initialize an object to hold image data
                let image_data = {};
                
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
                geojsonData = null
                image_data = {}
        //         await addOrUpdateData('imageData', image_data);
        //     }
        // }

        // await _processZipFile();
    }
    const mixerRef = useRef<THREE.AnimationMixer | null>(null);
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
            [boomStart, boomStart + 5, ],
            [
                ...new THREE.Quaternion().setFromEuler(new THREE.Euler(-0.7, 0, 0)).toArray(),
                ...new THREE.Quaternion().setFromEuler(new THREE.Euler(-0.15, 0, 0)).toArray(),
            ]
        );

        // Arm rotation (inward and outward motion)
        const armTrack = new THREE.QuaternionKeyframeTrack(
            `${excavator.arm.uuid}.quaternion`,
            [armStart, armStart + 2.5, armStart + 5],
            [
                ...new THREE.Quaternion().setFromEuler(new THREE.Euler(-0, 0, 0)).toArray(),
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
                ...new THREE.Quaternion().setFromEuler(new THREE.Euler(0, 0, 0)).toArray(),
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
      
        // Return mixer for use in render loop
        return mixerRef.current;
    };

    const fetch3DExcavator = async () => {
        if (!window.map || !window.map.scene) return;
        const loader = new FBXLoader();
        let hydraulicCylinder: THREE.Object3D | null = null;
        let hydraulicPiston: THREE.Object3D | null = null;
        let boom: THREE.Object3D | null = null;
        let body: THREE.Object3D | null = null;
        let arm: THREE.Object3D | null = null;
        let bucket: THREE.Object3D | null = null;
        loader.load('/Excavator/excavator.fbx', (object) => {
            // Set up the AnimationMixer
            window.mixer = new THREE.AnimationMixer(object);
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
                    else{
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
                    body = child;
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
                else if (child.name == "Armature"){
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
                hydraulicPiston
            };
        
            // Add the entire excavator object to the group and scene
            window.DiggerObject.group.add(object);
            window.DiggerObject.group.scale.set(0.1, 0.1, 0.1);
            window.DiggerObject.group.rotation.x = Math.PI / 2; // Adjust rotation
            window.DiggerObject.group.rotation.y = Math.PI / 2; // Adjust orientation
            window.DiggerObject.group.position.z += 10;
            window.DiggerObject.group.visible = true;
            if (!window.map || !window.map.scene) return;
            window.map.scene.add(window.DiggerObject.group);
            window.DiggerObject.group.position.copy(diggerInitPoint ? diggerInitPoint : new THREE.Vector3(-1380, 430, 65));
            
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
                    else{
                        child.material.depthTest = true
                        child.material.depthWrite = true
                        child.material.transparent = false
                        child.renderOrder = 10000
                    }
                }
            });
            window.TruckObject.position.copy(truckInitPoint ? truckInitPoint : new THREE.Vector3(-1395, 490, 50));
            clock.current = new THREE.Clock();
            mixer.current = createExcavatorDiggingAnimation(window.DiggerObject);
        }, (xhr) => {
            console.log((xhr.loaded / xhr.total * 100) + '% loaded');
        }, (error) => {
            console.error('An error occurred:', error);
        });
    }

    const fetch3DTruck = async () => {
        if (!window.map || !window.map.scene) return;
        const loader = new FBXLoader();
        loader.load('/Truck/3D_Truck.fbx', (object) => {
            // Set up the AnimationMixer
            window.mixer = new THREE.AnimationMixer(object);
            // Traverse the loaded object to find and play animations
            object.animations.forEach((clip, index) => {
                if (clip.name === '3D_Truck_Back1|3D_Truck_BackAction' || clip.name === '3D_Truck_Back2|3D_Truck_BackAction' || clip.name === '3D_Truck_Front|3D_Truck_FrontAction'){
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
                    else{
                        child.material.depthTest = false
                        child.material.depthWrite = true
                        child.material.transparent = true
                        child.renderOrder = 10000
                    }
                }
            });
            object.scale.set(0.2, 0.2 , 0.2);
            object.rotation.x = Math.PI / 2; // Correct if the object is flipped around the X axis
            object.rotation.y = Math.PI / 2;     // Adjust to face the correct direction
            object.position.z += 10

            const group = new THREE.Group();
            group.add(object)
            group.visible = false
            if (!window.map || !window.map.scene) return;
            window.TruckObject = group
            window.map.scene.add(window.TruckObject);
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

    const loadMapView = useCallback(async (_geojsonData: JSON, image_data) => {
        geojsonData.current = _geojsonData;
    
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
                renderer.domElement.addEventListener('mousemove', onDocumentMouseMove , false);
            }
            else{
                renderer.domElement.addEventListener('mousemove', _onDocumentMouseMove , false);
            }
            renderer.domElement.addEventListener('wheel', onDocumentMouseWheel, false);
            onDocumentMouseClick && renderer.domElement.addEventListener('click', onDocumentMouseClick, false)
            onDocumentMouseDblClick && renderer.domElement.addEventListener('dblclick', (e) => {onDocumentMouseDblClick(e)}, false)
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
        
        // Load the background image using THREE.TextureLoader
        if (isLight) {
            if (window.map) {
                const loader = new THREE.TextureLoader();
                loader.load(BACKGROUND_LIGHT, (texture) => {
                    window.map.scene.background = texture;  // Set the loaded texture as the background
                });
            }
        }
        else{
            const loader = new THREE.TextureLoader();
            loader.load(BACKGROUND, (texture) => {
                window.map.scene.background = texture;  // Set the loaded texture as the background
            });
        }
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
        const map = new Map(scene, window.camera, source, position, nTiles, zoom, {}, _geojsonData, image_data);
        window.map = map;
        const mapPicker = new MapPicker(window.camera, map, localMapContainerRef.current, controls);
        window.mapPicker = mapPicker;
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
        const grid: any = new InfiniteGridHelper(16, 256);
        scene.add(grid);

        // set routes to the map variable
        map.setRoutes(vehicleRoutes)
        // set default categories
        map.setFilteredCategories([])
        // draw the routes only one time
        let drawed = true

        fetch3DTruck()
        diggerImport && fetch3DExcavator()
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
                else{
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
            else{
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
                depth:  (_fence.properties.altitude - 400) * 2 - 7,                   // Extrude along the Z axis (depth)
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
            <Card className='threejs-view-card-header' style={{marginBottom: '0px', height: height ? height : "calc(100%)", padding: '0px', width: '100%'}}>
                <CardBody className='threejs-view-body'>
                    {isLoading ? (
                        <>
                            <div className="loading-overlay" style={{top: "calc(50vh - 151px)", position: 'absolute', width: 'calc(100% - 20px)', height: '50%', left: '10px'}}>
                                <Spin className='map-loading-bar' style={{color: 'gold', background: 'transparent'}} tip="Loading...">
                                    <Progress className='map-loading-progress-bar' percent={progress} status="active" style={{background: 'transparent'}} />
                                </Spin>
                            </div>
                        </>
                        ) : (
                            <></>
                        )}
                    <div ref={localMapContainerRef} style={{ height: height ? height : "calc(100%)", width: width ? width : '100%', opacity: isLoading ? '0.05' : '1'}}>
                        {children}
                    </div>
                    <div id="compassContainer" style={{position: 'absolute', top: '10px', right: isAutoRouting ? '40px' : '10px', opacity: isLoading ? 0.1 : 1, borderRadius: '50%', display: 'flex', 'justifyContent': 'center', width: '160px'}}>
                        <img id={'compass'} width={160} src={COMPASS} style={{position: 'absolute',filter: 'sepia(1)'}}></img>
                        <img src={COMPASS_VECTOR} height={120} style={{transformOrigin: 'center center', position: 'absolute', top: '19px', left: '72px'}}>
                        </img>
                    </div>
                    <div id='tooltipRef' style={{display: showToolTip ? 'block' : 'none'}} className='geofence-tooltip'>
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
        </>
    )
})