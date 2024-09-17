import { Source, Map, MapPicker } from './modules/Source'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Button, Card, CardBody, Col, Container, Form, FormFeedback, Input, Label, Modal, ModalBody, ModalHeader, Row } from 'reactstrap';
import Breadcrumb from 'Components/Common/Breadcrumb';
import { useDispatch, useSelector } from 'react-redux';
import './index.css'
import mapboxgl from 'mapbox-gl';
import { WindowResize } from './modules/WindowResize'
import * as turf from '@turf/turf';
import { InfiniteGridHelper } from './modules/InfiniteGridHelper'
import * as THREE from "three";
import { MapControls } from 'three/examples/jsm/controls/OrbitControls';
import _ from 'lodash';
import { Checkbox, CheckboxProps, Progress, Spin } from 'antd';
import 'antd/dist/reset.css';
import JSZip from '@turbowarp/jszip'
import { createSelector } from 'reselect';
import * as Leaflet from 'leaflet';
import { getGeoFences, getAllFleet, getAllEvents, getAllVehicleRoutes } from 'slices/thunk';
import { DropdownType } from 'Components/Common/Dropdown';
import BACKGROUND from '../../assets/images/3DPit/galaxy.jpg'
declare global {
    interface Window {
        map: any;
        mapPicker: any;
        controls: any
    }
}
interface Geofence {
    id: number,
    name: string;
    layer: Leaflet.Layer | null;  // Make layer nullable
}
export const ThreeJS = () => {
    const dispatch: any = useDispatch();

    const vehicleRoutesState = (state) => state.VehicleRoutes;
    
    const stateProperties = createSelector(
        [vehicleRoutesState],
        (vehicleRoutesState) => ({
          routes: vehicleRoutesState.data
        })
    );

    const layerOptions = ['Active Benches', 'Current Haul Routes', 'Future Road Designs', 'Speed Restrictions', 'Pit Bottom', 'Pit Climb', 'Stop Signs',        'Restricted', 'Dump Locations'];
    const defaultLayers = ['Current Haul Routes', 'Active Benches'];

    const [checkedList, setCheckedList] = useState<string[]>(defaultLayers);


    const onChange = (list: string[]) => {
        setCheckedList(list);
    };

    const onCheckAllChange: CheckboxProps['onChange'] = (e) => {
        setCheckedList(e.target.checked ? layerOptions : []);
    };
    const _layerOptions: DropdownType[] = [
        { label: 'Current Haul Routes', value: 'CURRENT_HAUL_ROUTES' },
        { label: 'Future Road Designs', value: 'FUTURE_ROAD_DESIGNS' },
        { label: 'Speed Restrictions', value: 'SPEED_RESTRICTIONS' },
        { label: 'Pit Bottom', value: 'PIT_BOTTOM' },
        { label: 'Pit Climb', value: 'PIT_CLIMB' },
        { label: 'Stop Signs', value: 'STOP_SIGNS' },
        { label: 'Restricted', value: 'RESTRICTED' },
    ];

    const { routes } = useSelector(stateProperties);

    document.title = "3D Pit View";

    const mapContainer = useRef<HTMLDivElement | null>(null);
    const mapBoxContainer = useRef<HTMLDivElement | null>(null);
    const mapRef = useRef<mapboxgl.Map | null>(null);
    mapboxgl.accessToken = process.env.MAPBOX_API_KEY || 'pk.eyJ1IjoibXlreXRhcyIsImEiOiJjbTA1MGhtb3YwY3Y0Mm5uY3FzYWExdm93In0.cSDrE0Lq4_PitPdGnEV_6w';
    const [lng, setLng] = useState(120.44871814239025);
    const [lat, setLat] = useState(-29.1506602184213);
    const geojsonData = useRef<any>();

    // state for Map loading status
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [progress, setProgress] = useState(0); // Progress state
    let animationFrameId: number;
    let map: any;

    useEffect(() => {
        dispatch(getAllVehicleRoutes())
    }, [dispatch]);

    useEffect(() => {
        let initializedMap = false;
        setIsLoading(true);
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
            loadMapView(geojsonData)
        })
    }

    const loadMapView = (_geojsonData: JSON) => {
        geojsonData.current = _geojsonData;
    
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1e6);

        camera.up = new THREE.Vector3(0, 0, 1);
        camera.position.set(0, -1000, 700);
        camera.updateMatrixWorld();
        camera.updateProjectionMatrix();

        const renderer = new THREE.WebGLRenderer({
            antialias: false,
            alpha: true,
            logarithmicDepthBuffer: false,
        });

        if (mapContainer.current) {
            renderer.domElement.className = "threejs-view";
            mapContainer.current.appendChild(renderer.domElement);
        }

        renderer.outputEncoding = THREE.LinearEncoding;
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        renderer.setSize(window.innerWidth, window.innerHeight);

        const controls = new MapControls(camera, renderer.domElement);
        controls.autoRotate = false;
        controls.maxPolarAngle = Math.PI * 0.3;
        window.controls = controls;
        
        // Load the background image using THREE.TextureLoader
        const loader = new THREE.TextureLoader();
        loader.load(BACKGROUND, (texture) => {
            scene.background = texture;  // Set the loaded texture as the background
        });

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
        let nTiles = 28;
        let zoom = 18
        const map = new Map(scene, camera, source, position, nTiles, zoom, {}, _geojsonData);
        window.map = map;
        console.log(map)
        const mapPicker = new MapPicker(camera, map, mapContainer.current, controls);
        window.mapPicker = mapPicker;


        // Cube control for syncing camera (cube camera view)
        const cubeScene = new THREE.Scene();
        const cubeCamera = new THREE.PerspectiveCamera(50, 1, 0.1, 1000);
        const cubeRenderer = new THREE.WebGLRenderer({ alpha: true });
        cubeRenderer.setSize(150, 150);
        cubeRenderer.domElement.className = 'cube-camera'
        // mapContainer.current && mapContainer.current.appendChild(cubeRenderer.domElement);

        // Cube for controlling camera
        const cubeControlGeometry = new THREE.BoxGeometry();
        const cubeControlMaterial = new THREE.MeshStandardMaterial({ color: 0xffd700, metalness: 1, roughness: 0.5 , wireframe: true });
        const cubeControl = new THREE.Mesh(cubeControlGeometry, cubeControlMaterial);
        cubeScene.add(cubeControl);

        cubeCamera.position.z = 2;
        cubeCamera.lookAt(cubeControl.position);

        // Sync camera rotation with the cube control
        function syncCameraWithCube() {
        const euler = new THREE.Euler().setFromQuaternion(cubeControl.quaternion);
            camera.rotation.set(euler.x, euler.y, euler.z);
        }

        function syncCubeWithCamera() {
        const euler = new THREE.Euler().setFromQuaternion(camera.quaternion);
            cubeControl.rotation.set(euler.x, euler.y, euler.z);
        }

        // Add event listener to detect clicks on cube faces
        cubeRenderer.domElement.addEventListener('click', (event) => {
        // Raycast to determine which face was clicked
        const mouse = new THREE.Vector2(
            (event.clientX / cubeRenderer.domElement.clientWidth) * 2 - 1,
            -(event.clientY / cubeRenderer.domElement.clientHeight) * 2 + 1
        );
        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(mouse, cubeCamera);

        const intersects = raycaster.intersectObject(cubeControl);
        if (intersects.length > 0) {
            // Rotate main camera based on the clicked face
            const clickedFaceNormal = intersects[0]?.face?.normal;
            if (!clickedFaceNormal) return;
            const rotation = new THREE.Euler(
            clickedFaceNormal.x * Math.PI / 2,
            clickedFaceNormal.y * Math.PI / 2,
            clickedFaceNormal.z * Math.PI / 2
            );
            camera.rotation.set(rotation.x, rotation.y, rotation.z);
        }
        });

        const grid: any = new InfiniteGridHelper(16, 256);
        scene.add(grid);

        // set routes to the map variable
        map.setRoutes(routes)
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
                    drawed = true
                }
            } else {
                setProgress((prev) => (Math.min(Math.floor(map.progress / (nTiles * nTiles) * 100), 100)));
            }

            renderer.render(scene, camera);
            controls.update();
        };
        mainLoop(0);
        syncCubeWithCamera();
        cubeRenderer.render(cubeScene, cubeCamera);
        WindowResize(renderer, camera);

    }

    useEffect(() => {
        const selectedCategories = _layerOptions
            .filter(option => checkedList.includes(option.label)) // Get matching label from _layerOptions
            .map(option => option.value); // Extract corresponding values (categories)
        window.map && window.map.setFilteredCategories(selectedCategories)
    }, [routes, checkedList])

    const checkAll = layerOptions.length === checkedList.length;
    const indeterminate = checkedList.length > 0 && checkedList.length < layerOptions.length;
    const CheckboxGroup = Checkbox.Group;

    return (
        <>
            <React.Fragment>
                <div className="page-content">
                    <Container fluid>
                    <Breadcrumb title="Home" breadcrumbItem="3D Pit View" />
                    <Row>
                        <Col lg="12">
                        <div style={{ alignContent: 'center', marginBottom: '20px' }}>
                            <Checkbox indeterminate={indeterminate} onChange={onCheckAllChange} checked={checkAll}>
                            All
                            </Checkbox>
                            <CheckboxGroup options={layerOptions} value={checkedList} onChange={onChange} />
                        </div>
                        <Card className='threejs-view-card-header'>
                            <CardBody className='threejs-view-body'>
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
                                <div ref={mapContainer} style={{ width: '100%', height: "calc(100%)", opacity: isLoading ? '0.05' : '1'}} />
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