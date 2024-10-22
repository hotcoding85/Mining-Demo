import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Col, Row } from "reactstrap";
import { EquipmentLocation, equipments } from "Pages/Map/sample";
import _ from "lodash";
import * as THREE from "three";
import { useSelector } from "react-redux";
import { LayoutSelector } from 'selectors';
import { LAYOUT_MODE_TYPES } from "Components/constants/layout";
import mapLocationImage from "assets/images/map/map-location.png";
import { excavatorImages, truckImages } from "assets/images/equipment";
import { THREEJSMap } from "Pages/3DMap";
import * as turf from '@turf/turf';
import { getRandomInt } from "utils/random";
import { Segmented, Space } from "antd";
import FloatingActionButton from "Pages/Replay/components/FloatingActionButton";
import { Slider, Button, Select } from 'antd';
import { LeftOutlined, PauseCircleFilled, PlayCircleFilled, RightOutlined } from "@ant-design/icons";
import TimeSlider from "Pages/Replay/components/TimeSlider";
import StatusCard from "./StatusCard";
type ActiveObjectType = {
  tube: any
  marker: any
  animationId: any
  arrow: any
}
const HaulRoadOptimisationMapView = (props: any) => {
  const mapContainer = useRef<any>(null);
  const [lng, setLng] = useState(120.44871814239025);
  const [lat, setLat] = useState(-29.1506602184213);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const statusOptions = ["Active", "Standby", "Delayed", "Down"];
  const [filter, setFilter] = useState<string>("All Equipment");
  const [duringAnimation, setDuringAnimation] = useState<boolean>(false)
  const [viewType, setViewType] = useState<string>("TOP")
  const currentViewType = useRef<string>(viewType)
  const [isPlaying, setIsPlaying] = useState(false);
  const currentIsPlaying = useRef<boolean>(false)
  const [speed, setSpeed] = useState(1);
  const currentSpeed = useRef<number>(1);
  const forwardDirection = useRef<any>(null)
  const NextCameraPoistion = useRef<any>(null)
  const currentAnimationMarker = useRef<any>(null)
  const [timeValue, setTimeValue] = useState(0);
  const currentTimeValue = useRef<number>(-1)
  const [totalTime, setTotalTime] = useState(0); // 00h 59m 24s in seconds
  const { Option } = Select;
  const pausedTimeValue = useRef<number>(0)
  const currentTotalTimeValue = useRef<number>(0)
  const pausedTubeIndex = useRef<number>(-1)
  const animationRef = useRef<{startTime: number | null, elapsedTime: number, animationFrameId: number | null, animationCameraId: number | null}>({ startTime: null, elapsedTime: 0, animationFrameId: null, animationCameraId: null });
  const activeObjects = useRef<ActiveObjectType>({tube: null, marker: null, animationId: null, arrow: null});  // Store active objects like tube, marker, animation ID
  const [markerToolTipContent, setMarkerToolTipContent] = useState<string>('')

  const tableData = useMemo(
    () => [
      {
        vehicleName: "DT101",
        operatorName: "James Taylor",
        status: statusOptions[getRandomInt(0, statusOptions.length - 1)],
        dumpLocation: 2650,
        activeHours: "12:30",
        targetHours: "13:00",
        emptyRun: "00:15",
        waitingLoadTime: "00:05",
        loadingTime: "00:10",
        haulingTime: "00:25",
        avgCycleTime: "00:55",
        payload: 65,
        materialType: "Ore",
        currentLoad: 70,
        maximumLoad: 80,
        speed: "22.3 km/h",
        engineRPM: 1500,
        travelTime: "00:45",
        pitch: "5",
        alcometerDegrees: 1,
        distance: 8,
        altitudeChange: 10,
        fuelRate: 20,
      },
      {
        vehicleName: "DT102",
        operatorName: "Maria Thompson",
        status: statusOptions[getRandomInt(0, statusOptions.length - 1)],
        dumpLocation: 2900,
        activeHours: "09:15",
        targetHours: "10:00",
        emptyRun: "00:10",
        waitingLoadTime: "00:20",
        loadingTime: "00:12",
        haulingTime: "00:30",
        avgCycleTime: "01:02",
        payload: 72,
        materialType: "Rock",
        currentLoad: 75,
        maximumLoad: 90,
        speed: "18.6 km/h",
        engineRPM: 1200,
        travelTime: "01:10",
        pitch: "3",
        alcometerDegrees: 0,
        distance: 10,
        altitudeChange: 15,
        fuelRate: 18,
      },
      {
        vehicleName: "DT103",
        operatorName: "William Johnson",
        status: statusOptions[getRandomInt(0, statusOptions.length - 1)],
        dumpLocation: 2750,
        activeHours: "11:00",
        targetHours: "11:30",
        emptyRun: "00:20",
        waitingLoadTime: "00:10",
        loadingTime: "00:08",
        haulingTime: "00:22",
        avgCycleTime: "01:00",
        payload: 68,
        materialType: "Coal",
        currentLoad: 64,
        maximumLoad: 85,
        speed: "21.1 km/h",
        engineRPM: 1300,
        travelTime: "00:52",
        pitch: "7",
        alcometerDegrees: 2,
        distance: 7,
        altitudeChange: 12,
        fuelRate: 22,
      },
      {
        vehicleName: "DT104",
        operatorName: "Sarah Parker",
        status: statusOptions[getRandomInt(0, statusOptions.length - 1)],
        dumpLocation: 2800,
        activeHours: "10:45",
        targetHours: "11:20",
        emptyRun: "00:18",
        waitingLoadTime: "00:08",
        loadingTime: "00:11",
        haulingTime: "00:29",
        avgCycleTime: "00:59",
        payload: 70,
        materialType: "Gravel",
        currentLoad: 76,
        maximumLoad: 92,
        speed: "20.8 km/h",
        engineRPM: 1400,
        travelTime: "01:05",
        pitch: "4",
        alcometerDegrees: 0,
        distance: 9,
        altitudeChange: 8,
        fuelRate: 19,
      },
      {
        vehicleName: "DT105",
        operatorName: "David Lee",
        status: statusOptions[getRandomInt(0, statusOptions.length - 1)],
        dumpLocation: 3000,
        activeHours: "08:50",
        targetHours: "09:15",
        emptyRun: "00:12",
        waitingLoadTime: "00:15",
        loadingTime: "00:14",
        haulingTime: "00:32",
        avgCycleTime: "01:03",
        payload: 74,
        materialType: "Sand",
        currentLoad: 79,
        maximumLoad: 95,
        speed: "19.5 km/h",
        engineRPM: 1600,
        travelTime: "00:58",
        pitch: "6",
        alcometerDegrees: 1,
        distance: 6,
        altitudeChange: 5,
        fuelRate: 17,
      },
    ],
    []
  );

  const currentRoad = useMemo(() => {
    return props.currentRoad;
  }, [props.currentRoad]); 

  const replayRoads = useMemo(() => {
    return props.replayRoads
  }, [props.replayRoads])

  const vehicleRoutes = useMemo(() => {
    return props.vehicleRoutes
  }, [props.vehicleRoutes])

  const replayTubes = useRef<any>([])
  const replayArrowTubes = useRef<any>([])
  const animationCameraId = useRef<number>(0)
  const [isAnimation, setIsAnimation] = useState<boolean>(false)
  const [selectedEq, setSelectedEq] = useState<any>({})
  const updateMarkerTooltip = useCallback((point) => {
    if (!mapContainer.current || !window.map) return
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
                _y = _y - 240
                _x -= 60
                break;
            case 'FRONT':
                _y = _y - 120
                _x += 100
                break;
            case 'LEFT':
                _x = _x - 50
                _y = _y - 300
                break;
            case 'RIGHT':
                _x = _x - 50
                _y = _y - 300
                break;
            case 'BACK':
                _y = _y - 140
                _x += 100 
                break;
            default:
                break;
        }
        annotationDiv.style.left = `${_x}px`;
        annotationDiv.style.top = `${_y}px`;
    }
  }, [isAnimation])

  const handleSpeedChange = (value: number) => {
    setSpeed(value);
    currentSpeed.current = value
  };

  const lastCameraPosition = useRef<any>(null)
  const lastCameraQuaternion = useRef<any>(null)
  const cameraStopAnimationId = useRef<number>(0)
  const animationCameraFrameId = useRef<number>(0);

  const togglePlay = useCallback(() => {
  if (!currentRoad.value) return;
    setIsPlaying(!isPlaying);
    window.isAnimation = false
    currentIsPlaying.current = !isPlaying
    if (isPlaying === false && timeValue === totalTime) {
        setTimeValue(0)
        currentTotalTimeValue.current = 0
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
  }, [currentRoad, isPlaying, forwardDirection, currentAnimationMarker, NextCameraPoistion, currentViewType]);

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
  useEffect(() => {
    if (isPlaying) {
        const intervalTime = 2000 / speed;
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
  }, [isPlaying, speed, timeValue, totalTime]);

  useEffect(() => {
    if (isPlaying && !animationRef.current.animationFrameId && currentRoad) {
        if (totalTime == currentTimeValue.current) {
            animationRef.current.startTime = null
            currentTimeValue.current = -1
            animationRef.current.elapsedTime = 0
        }
        
        drawRoute()
    }
  }, [isPlaying, currentRoad, animationRef, totalTime])

  // Handler for the PrevRoute button
  const onPrevRoute = useCallback(() => {
    if (replayRoads &&  replayRoads.length > 0) {
        if (currentRoad == null) {
            // If no trip is selected, select the first one
        } else {
            // Find the index of the currently selected trip
            const currentIndex = _.findIndex(replayRoads, _route => _route === currentRoad);

            // Determine the next index
            const prevIndex = (currentIndex - 1 + replayRoads.length) % replayRoads.length;

            // Set the next trip in the sequence
            props.setCurrentRoad(replayRoads[prevIndex]);
        }
    }
  }, [currentRoad, replayRoads]);

  // Handler for the NextRoute button
  const onNextRoute = useCallback(() => {
      if (replayRoads && replayRoads.length > 0) {
          if (currentRoad == null) {
              // If no trip is selected, select the first one
              props.setCurrentRoad(replayRoads[0]);
          } else {
              // Find the index of the currently selected trip
              const currentIndex = _.findIndex(replayRoads, _route => _route === currentRoad);
              // Determine the next index
              const nextIndex = (currentIndex + 1) % replayRoads.length;

              // Set the next trip in the sequence
              props.setCurrentRoad(replayRoads[nextIndex]);
          }
      }
  }, [replayRoads, currentRoad]);

  function createTubeWithFootprint(curve, accumulatedPoints, color, tubularSegments) {
    const tubeGeometry = new THREE.TubeGeometry(curve, accumulatedPoints.length * 10, 4, 4, false);

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

  const clearAnimation = () => {
    setIsAnimation(false)
    if (!window.map) return
    window.camera.zoom = 1
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
  }

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
  }, [viewType])

  const getRandomData = () => {
    const randomIndex = Math.floor(Math.random() * tableData.length);
    setSelectedEq(tableData[randomIndex])
  };

  useEffect(() => {
    clearAnimation()
    pausedTimeValue.current = 0
    currentTotalTimeValue.current = 0
    pausedTubeIndex.current = -1
    currentTimeValue.current = -1
    currentIsPlaying.current = true
    animationRef.current.startTime = null;
    animationRef.current.elapsedTime = 0;
    setTimeValue(0)
    getRandomData()
    drawRoute()
  }, [currentRoad])

  const drawRoute = useCallback(() => {
    if (currentRoad && window.map && vehicleRoutes.length > 0) {
      let road = vehicleRoutes.find(_road => _road.id === currentRoad.value)
      if (road) {
        setIsAnimation(true)
        setIsPlaying(true)
        setDuringAnimation(true)
        window.camera.zoom = 1
        window.isAnimation = true
        let passedSegment = 0;
        let tubes: any = []; // Array to store all tubes and their associated data
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
        if (animationCameraId.current != 0) {
          cancelAnimationFrame(animationCameraId.current)
        }
        const coordinates = road.geoJson.geometry.coordinates;
        const center = {
          tileX: window.map.center.x,
          tileY: window.map.center.y
        }
        // Convert geoJson coordinates to Three.js Vector3 points
        const points: any = []
        const _coordinates: any = []

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
          point.z = elevationValue + 400

          points.push(point)
          _coordinates.push([coord[0], coord[1]])
        });  // Set Z-axis to 0 for 2D route

        const calculatePercentageDiff = (startAltitude, endAltitude) => {
          const diff = endAltitude - startAltitude;
          return (diff / startAltitude) * 100;
        };
        
        // Split the points based on altitude changes
        const splitByAltitude = (points, _coordinates) => {
          let segments: any = [];
          let coordSegments: any = []
          let currentSegment = [points[0]];
          let currentCoord = [_coordinates[0]]
          for (let i = 1; i < points.length; i++) {
            const prevPoint = points[i - 1];
            const currentPoint = points[i];
        
            if ((prevPoint.z > currentPoint.z && currentSegment[0].z < prevPoint.z) ||
                (prevPoint.z < currentPoint.z && currentSegment[0].z > prevPoint.z)) {
              // Push current segment if direction changes
              segments.push(currentSegment);
              coordSegments.push(currentCoord)
              currentSegment = [prevPoint];
              currentCoord = [_coordinates[i - 1]]
            }
            currentSegment.push(currentPoint);
            currentCoord.push(_coordinates[i])
          }
        
          // Push the last segment
          if (currentSegment.length > 0) {
            segments.push(currentSegment);
            coordSegments.push(currentCoord)
          }
          return [segments, coordSegments];
        };
        
        // Create tubes for each segment with color logic
        let total_duration = 0;

        const createTubes = (segments, coords) => {
          segments.forEach((segment, idx) => {
            const startZ = segment[0].z;
            const endZ = segment[segment.length - 1].z;
            const diffPercentage = calculatePercentageDiff(startZ, endZ);
        
            const color = Math.abs(diffPercentage) >= 10 ? 0xff0000 : 0x00ff00; // Red if >10%, green otherwise
        
            // Create a tube geometry and material for this segment
            const tubePath = new THREE.CatmullRomCurve3(segment.map(p => new THREE.Vector3(p.x, p.y, (p.z - 400) * 2)));
            const tubeGeometry = new THREE.TubeGeometry(tubePath, 50, 6, 6, false);
            const tubeMaterial = new THREE.MeshBasicMaterial({ color, depthTest: false, depthWrite: false });
        
            const segmentTube = createTubeWithFootprint(tubePath, segment, color, 100);
            const tube = new THREE.Mesh(tubeGeometry, tubeMaterial);
            window.map.scene.add(segmentTube);
            let totalDistance = turf.length(turf.lineString(coords[idx]), { units: 'meters' })
            let _duration = Math.ceil(totalDistance / parseFloat(selectedEq.speed) / 3.6)
            total_duration += _duration
            tubes.push({
                tube: segmentTube,
                curve: tubePath,
                totalDistance: totalDistance, // Calculate the tube's distance
                marker: null, // We'll add this later
                duration: Math.ceil(totalDistance / parseFloat(selectedEq.speed) / 3.6),  // Assuming total time is shared among tubes
                progress: 0,  // Initial progress for the animation
                currentLoad: selectedEq.currentLoad,
                vehicleName: selectedEq.vehicleName,
                operatorName: selectedEq.operatorName,
                speedLimit: parseFloat(selectedEq.speed) // Add the average speed limit for the segment
            });
            // Create arrows along the tube at intervals
            for (let i = 0; i < segment.length - 1; i++) {
              const start = new THREE.Vector3(segment[i].x, segment[i].y, (segment[i].z - 400) * 2);
              const end = new THREE.Vector3(segment[i + 1].x, segment[i + 1].y, (segment[i + 1].z - 400) * 2);

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
          });
        };

        const [segments, coords] = splitByAltitude(points, _coordinates)
        createTubes(segments, coords);
        setTotalTime(total_duration)
        let PassedTime = 0

        activeObjects.current.marker = window.TruckObject;
        let currentSegmentIndex = 0; // To track which segment is being animated
        if (pausedTimeValue.current != 0) {
          currentSegmentIndex = pausedTubeIndex.current
          PassedTime = drawPreviousTubes(tubes, currentSegmentIndex)
        }
        let timeValueChanged = false;
        // if (currentTimeValue.current >= 0) {
        //   timeValueChanged = true;
        //   // Reset segment index and remaining time within segment
        //   let remainingTime = currentTimeValue.current;
          
        //   // Find which segment the current time falls into
        //   for (let i = 0; i < tubes.length; i++) {
        //     const { duration } = tubes[i];
        //     if (remainingTime < duration) {
        //       currentSegmentIndex = i;
        //       break;
        //     }
        //     remainingTime -= duration; // Decrease the remaining time
        //   }

        //   // Set the remaining time in currentTimeValue to the time within the current segment
        //   currentTimeValue.current = remainingTime;
        //   console.log("Start from segment:", currentSegmentIndex, "Remaining time within segment:", remainingTime);
        // }
        // Function to animate a single tube segment
        const animateSegment = (tubeData, onComplete) => {
            const { curve, tube, totalDistance, duration, currentLoad, vehicleName, operatorName, speedLimit } = tubeData;
            const marker = window.TruckObject
            // Animation loop for a single segment
            const animate = (timestamp) => {
                const currentPlaybackSpeed = currentSpeed.current;
                // if (currentTimeValue.current >= 0) { // when the user changed the timeslider
                //   animationRef.current.animationFrameId && cancelAnimationFrame(animationRef.current.animationFrameId);
                //   drawRoute()
                //     // animationRef.current.elapsedTime = currentTimeValue.current * 1000;
                //     // currentTimeValue.current = -1
                // }
                if (!animationRef.current.startTime) {
                    animationRef.current.startTime = timestamp;
                    marker.visible = true;
                }

                let elapsed;
                let deltaTime;
                deltaTime = (timestamp - animationRef.current.startTime!) * currentPlaybackSpeed;
                if (timeValueChanged) {
                  deltaTime = animationRef.current.elapsedTime * 1000
                  timeValueChanged = false
                }
                if (pausedTimeValue.current != 0) {
                    elapsed = pausedTimeValue.current
                }
                else{
                    elapsed = animationRef.current.elapsedTime + deltaTime;
                }

                const _progress = Math.min(elapsed / (duration * 2000), 1);
                const distanceCovered = _progress * totalDistance;
                // Move the marker along the curve
                if (_progress < 1) {
                    setTimeValue(Math.floor(currentTotalTimeValue.current / 1000))
                    const point = curve.getPointAt(_progress);
                    const nextPoint = curve.getPointAt(Math.min(_progress + 0.01, 1));  // Slightly ahead of the current point to calculate the forward direction
                    if (point) {
                        if (!window.map) return
                        window.TruckObject && (window.TruckObject.visible = true)
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

                        setMarkerToolTipContent('<span>Vehicle: </span>' + vehicleName + '<br/><span>Operator: </span>' + operatorName + '<br/><span>Distance: </span>' + Math.ceil(distanceCovered) + 'm<br/><span>Altitude: </span>' + Math.floor(point.z / 2 + 400) + 'm' + "<br/><span>Speed: </span>" + speedLimit + 'km/h' + '<br/><span>Total: </span>' + (100) + 's<br/><span>Tonnes: </span>' + currentLoad + 't')

                        updateMarkerTooltip(point)
                    }

                    // marker.scale.set(pulseScale * 50, pulseScale * 50, 1); // Apply pulsing scale
                    // Request next frame for this segment

                    // animationRef.current.elapsedTime += deltaTime;
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
                    currentTotalTimeValue.current += deltaTime / 2
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
              setIsPlaying(false)
              setTimeValue(totalTime)
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
      }
    }
  }, [currentRoad, selectedEq])

  const drawPreviousTubes = (tubes, index) => {
    let PassedTime = 0;
    for (let i = 0; i < index ; i ++) {
      const tubeData = tubes[i]
      const { curve, tube, totalDistance, duration, currentLoad, vehicleName, operatorName, speedLimit } = tubeData;
      tube.material.uniforms.progress.value = 1
      PassedTime += duration
    }
    return PassedTime
  }
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
  const { layoutModeType } = useSelector(LayoutSelector );
  const isLight = layoutModeType === LAYOUT_MODE_TYPES.LIGHT;
  const eqMarkers: any = []
  // Array to hold all clickable sprites
  const clickableSprites = useRef<any>([]);
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

    return (
        <div id={`annotation-${annotation.id}`} className="marker-tooltip" style={{ position: 'absolute' }} >
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
        screenPosition.project(window.map.camera); // Project to screen space
        
        const x = (screenPosition.x * 0.5 + 0.5) * (mapContainerElement.clientWidth);
        const y = -(screenPosition.y * 0.5 - 0.5) * (mapContainerElement.clientHeight);
        
        const annotationDiv = document.getElementById(`annotation-${annotation.userData.data.id}`);
        if (!window.map) {
          annotationDiv && (annotationDiv.style.display = 'none')
          return;
        }
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
    <React.Fragment>
      <Row>
          <Col md="12" className='mb-4 d-flex flex-row-reverse'>
              <Space>
                  <Segmented className="customSegmentLabel customSegmentBackground" value={filter} onChange={(e) => setFilter(e)} options={['All Equipment', { label: 'Excavators', value: 'EXCAVATOR' }, { label: 'Trucks', value: 'DUMP_TRUCK' }, { label: 'Loaders', value: 'LOADER' }, { label: 'Drillers', value: 'DRILLER' }, { label: 'Dozers', value: 'DOZER' }]} />
              </Space>
          </Col>
      </Row>
      <Row>
        <Col>
          <THREEJSMap 
            ref={mapContainer} 
            defaultLayers={[]} 
            isLoading={isLoading} 
            setIsLoading={setIsLoading} 
            updateAnnotations={updateAnnotations} 
            drawMarkers={drawMarkers} 
          >
            {
                duringAnimation && <FloatingActionButton _viewType={viewType} setViewType={setViewType} />
            }
            {equipments.map((annotation, index) => (
                duringAnimation ? <></> : <RippleIcon key={index} annotation={annotation} isLoading={isLoading} />
            ))}
            <div className="truck-tooltip haul-road-optimization" id="marker-tooltip" style={{display: isAnimation ? 'block' : 'none'}}>
                <div className="tooltiptext" dangerouslySetInnerHTML={{__html: markerToolTipContent}}></div>
            </div>
            <TimeSlider
                isFleetTracking={false}
                style={{display: currentRoad.value ? 'flex' : 'none', bottom: '-13px'}}
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
            {
              currentRoad.value ? 
              <StatusCard selectedEq={selectedEq} />
              :
              <></>
            }
          </THREEJSMap>
        </Col>
      </Row>
    </React.Fragment>
  );
};

export default HaulRoadOptimisationMapView;
