import React, { useCallback, useEffect, useRef, useState } from "react";
import { Card, CardBody, Col, Container, Row, TabPane } from "reactstrap";
import Breadcrumb from "Components/Common/Breadcrumb";
import { Button, Collapse, Menu, Progress, Spin, Tabs } from "antd";
import _ from "lodash";
import * as turf from '@turf/turf';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css';
import RBush from 'rbush';
import bbox from '@turf/bbox';
import booleanPointInPolygon from '@turf/boolean-point-in-polygon';
import TimeSlider from "./components/TimeSlider";
import './assets/index.css';
import { CSS2DRenderer, CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer.js';

import { standbyTruck, delayTruck, downTruck, activeTruck, standbyExcavator, delayExcavator, downExcavator, activeExcavator } from 'assets/images/map';
import { getAll } from "Helpers/api_auto_routing";
import { RouteDataType } from "Pages/AutoRouting/type";
import ReactApexChart from "react-apexcharts";
import { LAYOUT_MODE_TYPES } from "Components/constants/layout";
import { useDispatch, useSelector } from "react-redux";
import { createSelector } from "reselect";
import { getAllVehicleRoutes } from "slices/thunk";
import JSZip from "@turbowarp/jszip";
import { WindowResize } from "Pages/ThreeJS/modules/WindowResize";
import * as THREE from "three";
import { MapControls } from "three/examples/jsm/controls/OrbitControls";
import BACKGROUND from '../../assets/images/3DPit/galaxy.jpg'
import { MapPicker, Source, Map } from "Pages/ThreeJS/modules/Source";
import InfiniteGridHelper from "Pages/ThreeJS/modules/InfiniteGridHelper";
import MARKER from 'assets/images/Truck.png'
import { ListView } from "./components/ListView";
import { DropdownType, Dropdown } from "Components/Common/Dropdown";
import { DatePicker, DatePickerProps } from 'antd';
import dayjs from 'dayjs';
import { dumpingPaths, EquipmentLocation, equipments, travellingPaths } from '../Map/sample';
import { getMinutesDifference, getStatusColor, getSyncText } from "./common";
export type TripRoutesDataType = {
    id: string,
    routes: RouteDataType[]
}
declare global {
    interface Window {
        map: any;
        mapPicker: any;
        controls: any;
        camera: any;
    }
}
type ActiveObjectType = {
    tube: any
    marker: any
    animationId: any
    arrow: any
}
const index = new RBush();
const Replay = (props: any) => {
    document.title = "GPS Fleet Tracking | FMS Live";

    const mapContainer = useRef<HTMLDivElement | null>(null);
    const mapRef = useRef<any>(null);
    const [lng, setLng] = useState(120.44871814239025);
    const [lat, setLat] = useState(-29.1506602184213);
    const geojsonData = useRef<any>();
    const [routeData, setRouteData] = useState<TripRoutesDataType[]>([]);
    const stopSignData = useRef<RouteDataType[]>([]);
    const [selectedTrip, setSelectedTrip] = useState<RouteDataType | null>(null);

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

    let animationFrameId: number;
    let map: any;
    mapboxgl.accessToken = process.env.MAPBOX_API_KEY || 'pk.eyJ1IjoibXlreXRhcyIsImEiOiJjbTA1MGhtb3YwY3Y0Mm5uY3FzYWExdm93In0.cSDrE0Lq4_PitPdGnEV_6w';
    // state for Map loading status
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [progress, setProgress] = useState(0); // Progress state

    const dispatch: any = useDispatch();

    const vehicleRoutesState = (state) => state.VehicleRoutes;
    
    const stateProperties = createSelector(
        [vehicleRoutesState],
        (vehicleRoutesState) => ({
          routes: vehicleRoutesState.data
        })
    );

    const { routes } = useSelector(stateProperties);

    const { layoutModeType } = useSelector(
        createSelector(
          (state: any) => state.Layout,
          (layout) => ({
            layoutModeType: layout.layoutModeTypes,
          })
        )
    );
    const isLight = layoutModeType === LAYOUT_MODE_TYPES.LIGHT;
    
    const fetchZipFile = async () => {
        const zipBuffer = await fetch('./240817_Pits_3D_WGS84.zip').then(response => response.arrayBuffer())
        JSZip.loadAsync(zipBuffer).then(data => {
            return data.file('240817_Pits_3D_WGS84.geojson')?.async("string");
        }).then((text) => {
            var geojsonData = JSON.parse(text as string)
            loadMapView(geojsonData)
        })
    }
    let raycaster = new THREE.Raycaster();
    let mouse = new THREE.Vector2();

    const loadMapView = (_geojsonData: JSON) => {
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
        camera.position.set(0, -1000, 700);
        camera.updateMatrixWorld();
        camera.updateProjectionMatrix();
        window.camera = camera;
        const renderer = new THREE.WebGLRenderer({
            antialias: false,
            alpha: true,
            // logarithmicDepthBuffer: false,
        });

        if (mapContainer.current) {
            renderer.domElement.className = "threejs-view";
            mapContainer.current.appendChild(renderer.domElement);
            renderer.domElement.addEventListener('click', onDocumentMouseClick, false);
            renderer.domElement.addEventListener('mousemove', onDocumentMouseMove , false);
            renderer.domElement.addEventListener('keydown', onDocumentKeyDown , false);
        }

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

        const grid: any = new InfiniteGridHelper(16, 256);
        scene.add(grid);

        // set routes to the map variable
        map.setRoutes(routes)
        // set default categories
        map.setFilteredCategories([])
        // draw the routes only one time
        let drawed = true

        const labelRenderer = new CSS2DRenderer();
        labelRenderer.setSize(renderer.domElement.width, renderer.domElement.height);
        labelRenderer.domElement.style.position = 'absolute';
        labelRenderer.domElement.style.top = '0px';
        labelRenderer.domElement.className = "mapboxgl-canvas-container mapboxgl-interactive mapboxgl-touch-drag-pan mapboxgl-touch-zoom-rotate"
        // document.body.appendChild(labelRenderer.domElement);

        // Main render loop
        const mainLoop = (timestamp: number) => {
            animationFrameId = requestAnimationFrame(mainLoop);
            if (map.progress >= nTiles * nTiles) {
                if (drawed) {
                    setIsLoading(false);
                    drawMarkers()
                }
                drawed = false
            } else {
                setProgress((prev) => (Math.min(Math.floor(map.progress / (nTiles * nTiles) * 100), 100)));
            }
            renderer.render(scene, camera);
            controls.update();
            // labelRenderer.render(scene, camera); 
            // update the picking ray with the camera and pointer position
            raycaster.setFromCamera( mouse, camera );

            // calculate objects intersecting the picking ray
            const intersects = raycaster.intersectObjects( scene.children );

            for ( let i = 0; i < intersects.length; i ++ ) {
                // intersects[ i ].object.material?.color.set( 0xff0000 );
                
            }
        };
        mainLoop(0);
        WindowResize(renderer, camera);

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
    // Array to hold all clickable sprites
    const clickableSprites = useRef<any>([]);
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
                background-color: white;
                position: absolute;
                top: -96px;
                left: -46px;
                border: 4px solid ${eq.color};
                border-radius: 20px;
                font-size: 20px;
                color: ${eq.color};
                font-weight: 600;
                padding-left: 12px;
                padding-right: 12px;
                width: 100px;
                text-align: center;`;
    
    
    
        const isNotActive: boolean = eq.status.toLowerCase() != 'ACTIVE';
        const standardIconTemplate = `<div style="${textStyle}">${eq.name}</div>
                <div id="imageContainer" style="position: absolute;bottom: 5px;transform: translateX(-40%); z-index:1;">
                  <img src="${getEquipmentStatusIcon(eq)}" alt="Description of the image">
                </div>`
    
        const icon = document.createElement('div');
        icon.className = "mapboxgl-marker mapboxgl-marker-anchor-center"
        icon.innerHTML = standardIconTemplate//isNotActive ? `${standardIconTemplate}<div class="ripple" style="${rippleStyles}"></div>` : standardIconTemplate
        // const icon = Leaflet.divIcon({
        //     className: 'marker',
        //     html: isNotActive ? `${standardIconTemplate}<div class="ripple" style="${rippleStyles}"></div>` : standardIconTemplate,
        // });
        return icon
    }

    const drawMarkers = useCallback(() => {
        if (!mapContainer.current) return;
    
        _.map(equipments, eq => {
            const iconUrl = getEquipmentStatusIcon(eq);
            if (iconUrl === undefined) return;
    
            const imageTexture = new THREE.TextureLoader().load(iconUrl); // Load the marker icon image
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
    
            // Create a rippleIcon HTML element
            const rippleIconElement = rippleIcon(eq);
            const iconLabel = new CSS2DObject(rippleIconElement);
    
            // Set the marker position
            marker.position.set(worldPos.x, worldPos.y, elevationValue * 2);  // Set Z to 0 or adjust for elevation
            marker.scale.set(80, 80, 0); // Adjust based on zoom level
            // Attach rippleIcon HTML to the marker (syncs the 3D position)
    
            // Add marker and icon label to the scene
            // window.map.scene.add(iconLabel);  // Add the HTML label to the scene
            marker.userData.eq = eq;
            // Add click event to marker (Three.js sprite click)

            window.map.scene.add(marker);
    
            // Add to lists for later interaction
            eqMarkers.push(marker);
            clickableSprites.current.push(marker);
        });
    }, [equipments]);

    const onDocumentKeyDown = (event) => {
        if (event.key === 'Escape') {
            // The 'Esc' key was pressed
            setSelectedEq(null)
        }
    }
    const onDocumentMouseMove  = (event) => {
        // Normalize mouse position to -1 to 1 range
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
        // Update raycaster with the mouse position and the camera
        window.map.camera.updateProjectionMatrix();
        window.map.camera.updateMatrixWorld();
        raycaster.setFromCamera(mouse, window.map.camera);
        
        // Check for intersections with clickable sprites
        const intersects = raycaster.intersectObjects(clickableSprites.current, true);
        
        // Change cursor style based on intersection
        if (intersects.length > 0) {
            document.body.style.cursor = 'pointer'; // Change to desired cursor style
        } else {
            document.body.style.cursor = 'auto'; // Default cursor style
        }
    }
    
    let selectedPoints: any = [];
    const onDocumentMouseClick = (event) => {
        // Convert mouse click position to normalized device coordinates (NDC)
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

        // Update the raycaster with the camera and mouse position
        raycaster.setFromCamera(mouse, window.map.camera);

        // Intersect the objects in the scene (you can also specify specific objects)
        const intersects = raycaster.intersectObjects(window.map.scene.children, true);

        if (intersects.length > 0) {
            // Get the first intersection
            const intersection = intersects[0];
            // Get the intersection point (3D coordinates)
            const intersectedPoint = intersection.point;

            console.log('3D Coordinates:', intersectedPoint);
            selectedPoints.push(intersectedPoint);

            if (selectedPoints.length === 2) {
                // drawLineBetweenPoints(selectedPoints[0], selectedPoints[1]);
                selectedPoints = []; // Reset points
            }
            // Do something with the 3D coordinates, e.g., highlight the object
        }
    
        // event.preventDefault();
        // let vec = new THREE.Vector3(); // create once and reuse
        // // cf. https://stackoverflow.com/a/13091694/343834
        // vec.set(
        //     (event.clientX / window.innerWidth) * 2 - 1,
        //     -(event.clientY / window.innerHeight) * 2 + 1,
        //     0.5);
    
        // window.map.camera.updateMatrixWorld();
        // window.map.camera.updateProjectionMatrix();
        // vec.unproject(window.map.camera);

        // const direction = vec.sub(window.camera.position).normalize();

        // const distance = -window.camera.position.z / direction.z;
    
        // const worldPosition = window.camera.position.clone().add(direction.multiplyScalar(distance));

        // // Normalize mouse position to -1 to 1 range
        // mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        // mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
        
        // const tileData1 = window.map.convertXYToPixel(worldPosition.x, worldPosition.y)
        // worldPosition.z = window.map.getElevationAt([tileData1.tilePixelX, tileData1.tilePixelY], tileData1.tileX, tileData1.tileY) * 2
        
        // // If two points are selected, draw the line
        // if (selectedPoints.length === 2) {
        //     drawLineBetweenPoints(selectedPoints[0], selectedPoints[1]);
        //     selectedPoints = []; // Reset points
        // }
        // // Update raycaster with the mouse position and the camera
        raycaster.setFromCamera(mouse, window.map.camera);
        
        // Check for intersections with clickable sprites
        const _intersects = raycaster.intersectObjects(clickableSprites.current, true);

        if (_intersects.length > 0) {
            const clickedSprite = _intersects[0].object;  // Get the clicked sprite
            const eqData = clickedSprite.userData.eq;  // Retrieve the associated equipment data

            setSelectedEq(eqData);  // Handle click event
        }
    }

    const drawLineBetweenPoints = (point1, point2) => {
        const material = new THREE.LineBasicMaterial({ color: 0xff0000, linewidth: 10, depthTest: false, depthWrite: false });
        // Create the points array directly from the two selected points
        const geometry = new THREE.BufferGeometry().setFromPoints([point1, point2]);
        const line = new THREE.Line(geometry, material);
        window.map.scene.add(line);
    }
    
    useEffect(() => {
        if (selectedEq) {
            setRouteData([{id: selectedEq.name, routes: routes.filter(_route => _route.category !== 'STOP_SIGNS' && _route.status == 'ACTIVE')}]);

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
    }, [routes, selectedEq])
    const togglePlay = useCallback(() => {
        setIsPlaying(!isPlaying);
        currentIsPlaying.current = !isPlaying
        if (isPlaying === false && timeValue === totalTime) {
            setTimeValue(0)
            currentTimeValue.current = 0
            clearAnimation()
        }
    }, [timeValue, totalTime]);

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
                        currentIsPlaying.current = false
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
    }, [isPlaying, speed, timeValue]);

    const { Panel } = Collapse;

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
    };
    const [apexOptions, setApexOptions] = useState<ApexCharts.ApexOptions>(
        defaultApexOptions
    );

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
    }, [])

    useEffect(() => {
        dispatch(getAllVehicleRoutes())
    }, [dispatch]);

    useEffect(() => {
        stopSignData.current.map((item: any, key) => {
            const map = mapRef.current;
            if (!map) return;
        
            // Convert LineString to Point assuming the first coordinate is the desired location
            const pointFeature = {
                type: "Feature",
                geometry: {
                    type: "Point",
                    coordinates: item.geoJson.geometry.coordinates[0]
                },
                properties: item.geoJson.properties
            };
        
            // Check if the source does not exist before adding it
            if (!map.getSource(item.id)) {
                map.addSource(item.id, {
                    type: 'geojson',
                    data: pointFeature
                });
            }
        
            // Remove existing layer if it exists
            if (map.getLayer(item.id)) {
                map.removeLayer(item.id);
            }
        
            // Add a new circle layer for STOP_SIGNS
            map.addLayer({
                id: item.id,
                type: 'circle',
                source: item.id,
                paint: {
                    'circle-radius': 10,  // This sets the radius in pixels
                    'circle-color': item.color,
                    'circle-opacity': 1
                }
            });
    
          })
    }, [stopSignData, mapRef.current])
    
    const animationRef = useRef<{startTime: number | null, elapsedTime: number, animationFrameId: number | null}>({ startTime: null, elapsedTime: 0, animationFrameId: null });
    const marker = useRef<mapboxgl.Marker | null>(null);
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
            let stopSignDuration = getStopSignsDuration(selectedTrip.geoJson.geometry.coordinates)
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
            console.log(yaxis)
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
            // Move to camera
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
            const camera = window.map.camera;
            // camera.zoom = 5;
            camera.position.set(-firstPoint.x, -firstPoint.y, 0); // Offset the camera slightly above the point
            // camera.lookAt(firstPoint); // Make the camera look at the point
        }
    }, [routeData, selectedTrip])

    const getStopSignsDuration = useCallback((coordinates) => {
        let duration = 0;
        _.map(coordinates, coor => {
            _.map(stopSignData.current, _stopsign => {
                if (_stopsign.geoJson.geometry.coordinates && _stopsign.geoJson.geometry.coordinates[0]) {
                    if (_stopsign.geoJson.geometry.coordinates[0][0] == coor[0] && _stopsign.geoJson.geometry.coordinates[0][1] == coor[1]) {
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
        let minDistance = Infinity;
    
        _.map(candidates, (item) => {
            const isInside = booleanPointInPolygon(point, item.feature.geometry);
            if (isInside) {
                nearestFeature = item.feature;
                return false; // Exit loop early if point is inside a polygon
            }
        });
    
        if (nearestFeature) {
            return Math.round(parseFloat(nearestFeature.properties.height) * 100) / 100; // Adjust property name if different
        } else {
            const tileData = window.map.convertGeoToPixel(point[1], point[0])
            return Math.round((window.map.getElevationAt([tileData.tilePixelX, tileData.tilePixelY], tileData.tileX, tileData.tileY) + 500) * 100) / 100
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

    const activeObjects = useRef<ActiveObjectType>({tube: null, marker: null, animationId: null, arrow: null});  // Store active objects like tube, marker, animation ID
    const clearAnimation = () => {
        // Remove previous route
        if (activeObjects.current && activeObjects.current.tube) {
            window.map.scene.remove(activeObjects.current.tube);
            activeObjects.current.tube.geometry.dispose();  // Clean up resources
            activeObjects.current.tube.material.dispose();
            activeObjects.current.tube = null;
        }
        if ( activeObjects.current && activeObjects.current.marker) {
            window.map.scene.remove(activeObjects.current.marker);
            activeObjects.current.marker.geometry.dispose();
            activeObjects.current.marker.material.dispose();
            activeObjects.current.marker = null;
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
    }
    const drawRoute = useCallback((saving_data, totalTime, distance, animation = true, stopSignDuration = 0) => {
        clearAnimation()

        const coordinates = saving_data.geoJson.geometry.coordinates;
        const center = {
            tileX: window.map.center.x,
            tileY: window.map.center.y
        }

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
              elevationValue = Math.round(parseFloat(nearestFeature.properties.height) * 100) / 100 - 500;
            }
  
            if (!nearestFeature || isNaN(elevationValue)) {
              // elevationValue = parseFloat(rgba[0] * 256 + rgba[1] + rgba[2] / 256 - 32768)
              elevationValue = window.map.getElevationAt([tilePixelX, tilePixelY], tileX, tileY);
            }
            point.z = elevationValue * 2

            points.push(point)
        });  // Set Z-axis to 0 for 2D route
        // Create a CatmullRomCurve3 from the points
        const curve = new THREE.CatmullRomCurve3(points);
        // Create a tube geometry along the curve
        const tubeGeometry = new THREE.TubeGeometry(curve, 100, 8, 8, false);  // 100 segments, radius 0.1, 8 radial segments
        const tubeMaterial = new THREE.MeshBasicMaterial({ color: saving_data.color || 0x00ff00, opacity: 0.8, transparent: true, depthTest: false, depthWrite: false  });
        const tube = new THREE.Mesh(tubeGeometry, tubeMaterial);
        tube.renderOrder = 2;
        window.map.scene.add(tube);

        // Store the tube reference
        activeObjects.current.tube = tube;
        
        // Manually calculate the direction vector between the last two points
        const dirVector = new THREE.Vector3().subVectors(points[1], points[0]).normalize();
        
        let arrow = new THREE.ArrowHelper(dirVector, points[0], 50, 0xffffff);
        arrow.renderOrder = 1;
        // Add the arrow to the scene
        window.map.scene.add(arrow);
        activeObjects.current.arrow = arrow;
        // Set up marker (a sphere)
        // const markerGeometry = new THREE.SphereGeometry(10, 32, 32);  // Small sphere for the marker
        // const markerMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000, transparent: true, depthTest: false, depthWrite: false });
        // const marker = new THREE.Mesh(markerGeometry, markerMaterial);
        const imageTexture = new THREE.TextureLoader().load(MARKER); // Load your image
        const spriteMaterial = new THREE.SpriteMaterial({ map: imageTexture, depthWrite: false, transparent: true, depthTest: false });
        const marker = new THREE.Sprite(spriteMaterial);
        marker.scale.set(50, 50, 0);
        marker.renderOrder = 2
        window.map.scene.add(marker);

        // Store the marker reference
        activeObjects.current.marker = marker;
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
            // Pulsing Effect Parameters
            const pulseFrequency = 2; // Pulses per second
            const pulseAmplitude = 1.05; // Scale factor
            const pulseTime = timestamp * 0.001; // Convert to seconds
            const pulseScale = 1 + (Math.sin(pulseTime * pulseFrequency * Math.PI * 2) * (pulseAmplitude - 1)); // Pulsing scale

            // Calculate the point along the curve based on progress
            if (_progress < 1) {
                const point = curve.getPointAt(_progress);  // Get the point along the tube curve
                point && marker.position.set(point.x, point.y, point.z);

                // Apply the pulsing effect to the marker
                marker.scale.set(pulseScale * 50, pulseScale * 50, 1); // Apply scale to the marker
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
                animationRef.current.animationFrameId && cancelAnimationFrame(animationRef.current.animationFrameId);
                animationRef.current.elapsedTime = 0
                animationRef.current.animationFrameId = null
            }
        };

        // Start new animation
        animationRef.current.startTime = null;
        animationRef.current.animationFrameId = requestAnimationFrame(animate);
    
    }, [totalTime, speed, timeValue, isPlaying, apexOptions]);

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
    };
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
    };
    return (
        <React.Fragment>
            <div className="page-content">
                <Container fluid style={{marginBottom: '-60px'}}>
                    <Row>
                        <Tabs defaultActiveKey="1" activeKey={activeTab} onChange={(key) => onChangeTap(key)} >
                            <TabPane tab="Map View" key="1">
                                {/* Map View Placeholder */}
                                <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px'}}>
                                    <h4>GPS Fleet Tracking</h4>
                                    <div style={{display: 'flex', alignItems: 'center'}}>
                                        <DatePicker style={{height: '48px', marginRight: '10px'}} className={'fleet-tracking-datepicker'} allowClear={false} value={dayjs(selectedDate)} onChange={onDateChange} />
                                        <Dropdown
                                            label="Choose Location"
                                            items={locationItems}
                                            value={locations}
                                            onChange={setLocaltions}
                                            />
                                    </div>
                                </div>
                                <Col lg="12" style={{display: 'flex', flexDirection: 'row', justifyContent: 'space-between'}}>
                                {isLoading ? (
                                    <>
                                        <div className="loading-overlay" style={{top: "calc(50vh - 151px)", position: 'absolute', width: selectedEq ? 'calc(80% - 20px)' : 'calc(100% - 20px)', height: '50%', left: '10px'}}>
                                            <Spin className='map-loading-bar' style={{color: 'gold'}} tip="Loading...">
                                                <Progress className='map-loading-progress-bar' percent={progress} status="active" />
                                            </Spin>
                                        </div>
                                    </>
                                    ) : (
                                        <></>
                                )}
                                <div ref={mapContainer} id="3d-map-view" className="map-container" style={{ height: 'calc(100vh - 240px)', width: selectedEq ? '80%' : '100%', opacity: isLoading ? '0.05' : '1', position: 'relative' }} >
                                    <div style={{
                                        position: 'absolute',
                                        bottom: '40px',
                                        left: '0px',
                                        margin : '12px', 
                                        width: 'calc(100% - 24px)',
                                        zIndex: 1,
                                        display: selectedEq ? 'block' : 'none'
                                    }}>
                                        <Card style={{marginBottom: '42px', opacity: '0.9', transition: 'opacity 1s ease, max-height 1s ease;', display: showTimeline ? 'block' : 'none'}}>
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
                                    />
                                </div>
                                <Card style={{ height: 'calc(100vh - 240px)', width: '20%', marginLeft: '16px', padding: '16px', display: selectedEq ? 'block' : 'none' }}>
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
                            </Col>
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