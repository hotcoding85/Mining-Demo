import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Col, Row } from "reactstrap";
import mapboxgl, { Marker } from "mapbox-gl";
import { buildGraticule } from "utils/mapUtils";
import { EquipmentLocation, equipments } from "Pages/Map/sample";
import { Progress, Spin } from "antd";
import { excavatorImages, truckImages } from "assets/images/equipment";
import _ from "lodash";
import JSZip from "@turbowarp/jszip";
import { WindowResize } from "Pages/ThreeJS/modules/WindowResize";
import { MTLLoader } from "three/examples/jsm/loaders/MTLLoader";
import * as THREE from "three";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader";
import { bbox } from "@turf/turf";
import RBush from 'rbush';
import { MapControls } from "three/examples/jsm/controls/OrbitControls";
import { useSelector } from "react-redux";
import { LayoutSelector, VehicleRouteSelector } from 'selectors';
import { LAYOUT_MODE_TYPES } from "Components/constants/layout";
import BACKGROUND from 'assets/images/3DPit/galaxy.jpg'
import BACKGROUND_LIGHT from 'assets/images/3DPit/daysky.png'
import mapLocationImage from "assets/images/map/map-location.png";
import { MapPicker, Source, Map } from "Pages/ThreeJS/modules/Source";
import InfiniteGridHelper from "Pages/ThreeJS/modules/InfiniteGridHelper";
import booleanPointInPolygon from '@turf/boolean-point-in-polygon';

const index = new RBush();
interface MarkerData {
  id: string;
  marker: Marker;
}
declare global {
  interface Window {
      map: any;
      mapPicker: any;
      controls: any;
      camera: any;
  }
}
const groupByAltitudeChange = (data) => {
  let result: any = [];
  let currentGroup: any = [];
  let isSeparateSegment = false;

  const calculatePercentageDiff = (startAltitude, endAltitude) => {
    const diff = endAltitude - startAltitude;
    return (diff / startAltitude) * 100;
  };

  const createSegment = (color, coordinates) => {
    return {
      type: "Feature",
      properties: {
        color: color,
      },
      geometry: {
        type: "LineString",
        coordinates: coordinates,
      },
    };
  };

  for (let i = 0; i < data.length; i++) {
    const currentPoint = data[i];
    const currentAltitude = currentPoint.z;

    if (currentGroup.length === 0) {
      currentGroup.push(currentPoint);
      continue;
    }

    const prevAltitude = currentGroup[currentGroup.length - 1].z;
    if (currentAltitude >= prevAltitude) {
      currentGroup.push(currentPoint);
    } else {
      const firstAltitude = currentGroup[0].z;
      const lastAltitude = currentGroup[currentGroup.length - 1].z;
      const percentageDiff = calculatePercentageDiff(
        firstAltitude,
        lastAltitude
      );
      
      if (percentageDiff > 10) {
        result.push(createSegment("red", currentGroup));
        isSeparateSegment = true;
      } else {
        if (isSeparateSegment) {
          result.push(createSegment("green", currentGroup));
          isSeparateSegment = false;
        } else {
          if (result.length > 0) {
            const resultLast = result[result.length - 1];
            const segment = createSegment("green", [
              ...resultLast.geometry.coordinates,
              ...currentGroup,
            ]);
            result[result.length - 1] = segment;
          } else {
            result.push(createSegment("green", currentGroup));
          }
        }
      }

      currentGroup = [currentPoint];
    }
  }

  if (currentGroup.length > 0) {
    if (isSeparateSegment) {
      result.push(createSegment("green", currentGroup));
      isSeparateSegment = false;
    } else {
      if (result.length > 0) {
        const resultLast = result[result.length - 1];

        const segment = createSegment("green", [
          ...resultLast.geometry.coordinates,
          ...currentGroup,
        ]);

        result[result.length - 1] = segment;
      } else {
        result.push(createSegment("green", currentGroup));
      }
    }
  }

  return result;
};

const HaulRoadOptimisationMapView = (props: any) => {
  const mapRef = useRef<any>(null);
  const mapContainer = useRef<any>(null);
  const [lng, setLng] = useState(120.44871814239025);
  const [lat, setLat] = useState(-29.1506602184213);
  const [markers, setMarkers] = useState<MarkerData[]>([]);
  const [filter, setFilter] = useState<string>("All Equipment");
  const TruckObject = useRef<any>(null)
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [progress, setProgress] = useState(0); // Progress state

  const currentRoad = useMemo(() => {
    return props.currentRoad;
  }, [props.currentRoad]); 

  const replayRoads = useMemo(() => {
    return props.replayRoads
  }, [props.replayRoads])

  const geojsonData = useMemo(() => {
    return props.geojsonData
  }, [props.geojsonData])

  const imageData = useMemo(() => {
    return props.imageData
  }, [props.imageData])

  const clearMarkers = () => {
    markers.map((item) => item.marker.remove());
    // setMarkers([]);
  };

  const replayTubes = useRef<any>([])
  const replayArrowTubes = useRef<any>([])
  const animationCameraId = useRef<number>(0)
  useEffect(() => {
    if (geojsonData && geojsonData.length > 0) {
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
    }
  }, [geojsonData])

  const createTubeWithFootprint = (curve, accumulatedPoints, color, tubularSegments) => {
    const tubeGeometry = new THREE.TubeGeometry(curve, accumulatedPoints.length * 10, 6, 6, false);
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

  useEffect(() => {
    if (currentRoad && window.map) {
      let road = replayRoads.find(_road => _road.id === currentRoad.value)
      if (road) {
        // remove existing tubes
        if (replayTubes.current && replayTubes.current.length > 0) {
          _.map(replayTubes.current, _tube => {
            window.map.scene.remove(_tube)
            _tube.geometry.dispose();  // Clean up resources
            _tube.material.dispose();
          })
        }
        if (replayArrowTubes.current && replayArrowTubes.current.length > 0) {
          _.map(replayArrowTubes.current, _tube => {
            window.map.scene.remove(_tube)
            _tube.geometry.dispose();  // Clean up resources
            _tube.material.dispose();
          })
        }
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
          point.z = elevationValue + 400

          points.push(point)
          _coordinates.push([coord[0], coord[1], elevationValue + 400])
        });  // Set Z-axis to 0 for 2D route

        const calculatePercentageDiff = (startAltitude, endAltitude) => {
          const diff = endAltitude - startAltitude;
          return (diff / startAltitude) * 100;
        };
        
        // Split the points based on altitude changes
        const splitByAltitude = (points) => {
          let segments: any = [];
          let currentSegment = [points[0]];
        
          for (let i = 1; i < points.length; i++) {
            const prevPoint = points[i - 1];
            const currentPoint = points[i];
        
            if ((prevPoint.z > currentPoint.z && currentSegment[0].z < prevPoint.z) ||
                (prevPoint.z < currentPoint.z && currentSegment[0].z > prevPoint.z)) {
              // Push current segment if direction changes
              segments.push(currentSegment);
              currentSegment = [prevPoint];
            }
            currentSegment.push(currentPoint);
          }
        
          // Push the last segment
          if (currentSegment.length > 0) {
            segments.push(currentSegment);
          }
          return segments;
        };
        
        // Create tubes for each segment with color logic
        const createTubes = (segments) => {
          segments.forEach((segment) => {
            const startZ = segment[0].z;
            const endZ = segment[segment.length - 1].z;
            const diffPercentage = calculatePercentageDiff(startZ, endZ);
        
            const color = Math.abs(diffPercentage) >= 10 ? 0xff0000 : 0x00ff00; // Red if >10%, green otherwise
        
            // Create a tube geometry and material for this segment
            const tubePath = new THREE.CatmullRomCurve3(segment.map(p => new THREE.Vector3(p.x, p.y, (p.z - 400) * 2)));
            const tubeGeometry = new THREE.TubeGeometry(tubePath, 50, 6, 6, false);
            const tubeMaterial = new THREE.MeshBasicMaterial({ color, depthTest: false, depthWrite: false });
        
            const tube = new THREE.Mesh(tubeGeometry, tubeMaterial);
            window.map.scene.add(tube);

            // Create arrows along the tube at intervals
            for (let i = 0; i < segment.length - 1; i++) {
              const start = new THREE.Vector3(segment[i].x, segment[i].y, (segment[i].z - 400) * 2);
              const end = new THREE.Vector3(segment[i + 1].x, segment[i + 1].y, (segment[i + 1].z - 400) * 2);
              
              const direction = new THREE.Vector3().subVectors(end, start).normalize();
              
              // Create arrow cone
              const arrowGeometry = new THREE.ConeGeometry(5, 20, 32); // Adjust size as necessary
              const arrowMaterial = new THREE.MeshBasicMaterial({color: 0xffffff, depthTest: false, depthWrite: false});

              const arrowMesh = new THREE.Mesh(arrowGeometry, arrowMaterial);

              // Set position at the start point of each segment
              arrowMesh.position.copy(start);

              // Align arrow along the direction of the segment
              arrowMesh.lookAt(end);
              arrowMesh.rotateOnAxis(new THREE.Vector3(1, 0, 0), Math.PI / 2); // Rotate to align with the tube direction

              window.map.scene.add(arrowMesh);
              replayArrowTubes.current.push(arrowMesh)
            }

            replayTubes.current.push(tube)
          });
        };

        const segments = splitByAltitude(points)
        createTubes(segments);

        // Animate the camera movement
        // const zoomDuration = 1000; // 1 second
        // let startTime: number | null = null;
        // const startPosition = segments[0][0];
        // const point = segments[segments.length - 1][segments[segments.length - 1].length - 1]
        // const targetPosition = point.clone().add(point); // Zoom offset
        // const animateZoom = (time: number) => {
        //   if (startTime === null) startTime = time;
        //   const _elapsed = time - startTime;
        //   const _progress = Math.min(_elapsed / zoomDuration, 1);
        //   window.camera.position.lerpVectors(startPosition, targetPosition, _progress);
        //   window.controls.target.lerpVectors(startPosition, point, _progress);
        //   window.controls.update();
        //   if (_progress < 1) {
        //       animationCameraId.current = requestAnimationFrame(animateZoom);
        //   }
        //   else {
        //     cancelAnimationFrame(animationCameraId.current)
        //     animationCameraId.current = 0
        //   } 
        // };
        // // window.controls.enabled = false;
        // animationCameraId.current = requestAnimationFrame(animateZoom);
      }
    }
  }, [currentRoad])

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

  let animationFrameId: number;
  let map: any;
  useEffect(() => {
    if (!geojsonData || !imageData) return
    setIsLoading(true);
    loadMapView(geojsonData, imageData);
    // Clean up on component unmount
    return () => {
        window.map && window.map.clean()
        if (animationFrameId) {
            cancelAnimationFrame(animationFrameId);
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
  }, [geojsonData, imageData])

  // useEffect(() => {
  //   clearMarkers();
  //   const markersData: MarkerData[] = [];
  //   let filteredEquipment: EquipmentLocation[] = [];
  //   if (filter === "All Equipment") {
  //     filteredEquipment = equipments;
  //   } else {
  //     filteredEquipment = equipments.filter(
  //       (item) => item.vehicleType === filter
  //     );
  //   }

  //   filteredEquipment.map((eq) => {
  //     const el = rippleIcon(eq);
  //     const marker = new mapboxgl.Marker(el)
  //       .setLngLat(eq.position)
  //       .addTo(mapRef.current);
  //     markersData.push({ id: eq["name"], marker: marker });
  //     marker.getElement().addEventListener("click", () =>
  //       mapRef.current?.flyTo({
  //         center: eq.position,
  //         zoom: 20,
  //         speed: 1,
  //       })
  //     );
  //   });

  //   setMarkers(markersData);
  // }, [filter]);

  const { layoutModeType } = useSelector(LayoutSelector );
  const isLight = layoutModeType === LAYOUT_MODE_TYPES.LIGHT;
  const eqMarkers: any = []
  // Array to hold all clickable sprites
  const clickableSprites = useRef<any>([]);
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
          width: '112px',
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

  const setSelectedEq = useCallback((annotation) => {

  }, [])

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
        if (!window.map) {
          annotationDiv && (annotationDiv.style.display = 'none')
          return;
        }
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

  

  const fetch3DTruck = async () => {
    if (!window.map) return
    try {
        const mtlLoader = new MTLLoader();
        const materials = await new Promise<MTLLoader.MaterialCreator>((resolve, reject) => {
            mtlLoader.load(
                './Truck/3D_Truck.mtl',
                (materials) => resolve(materials),
                undefined,
                (error) => reject(error)
            );
        });

        materials.preload();

        const response = await fetch('./Truck/3D_Truck.zip');
        const arrayBuffer = await response.arrayBuffer();
        const zip = await JSZip.loadAsync(arrayBuffer);

        const objFile = await zip.file('3D_Truck.obj')?.async("string");

        if (!objFile) {
            throw new Error("OBJ file not found in the zip archive");
        }
        const goldMaterial = new THREE.MeshStandardMaterial({
            color: 0xffff00, // Gold color in hex
            metalness: 1,  // Fully metallic
            roughness: 0.6,  // Adjust roughness for shiny effect
            depthTest: false,
            depthWrite: false
        });
        const object = new OBJLoader()
            .setMaterials(materials)
            .parse(objFile);

        object.traverse((child: any) => {
            if (child.isMesh) {
                child.material = goldMaterial;  // Apply gold material to all mesh parts
                child.material.needsUpdate = true;  // Ensure material is updated
            }
        });
        
        object.scale.set(0.4, 0.3 , 0.4);
        // newObject.position.set(0, 0, -5)
        object.rotation.x = Math.PI / 2; // Correct if the object is flipped around the X axis
        object.rotation.y = Math.PI / 2;     // Adjust to face the correct direction
        object.rotation.z = 0;           // Z-axis correction if needed

        // object.rotation.z += 0.5
        const group = new THREE.Group();
        group.add(object)
        group.visible = false

        TruckObject.current = group
        window.map.scene.add(group);
    } catch (error) {
        console.error('An error happened:', error);
    }
  }

  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();

  const loadMapView = useCallback(async (_geojsonData: any, imageData) => {
    if (!_geojsonData || !imageData) return
    _.map(_geojsonData.features, (feature) => {
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
        // renderer.domElement.addEventListener('click', onDocumentMouseClick, false);
        // renderer.domElement.addEventListener('mousemove', onDocumentMouseMove , false);
        // renderer.domElement.addEventListener('keydown', onDocumentKeyDown , false);
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
    const map = new Map(scene, camera, source, position, nTiles, zoom, {}, _geojsonData, imageData);
    window.map = map;
    const mapPicker = new MapPicker(camera, map, mapContainer.current, controls);
    window.mapPicker = mapPicker;

    const grid: any = new InfiniteGridHelper(16, 256);
    scene.add(grid);

    let drawed = true

    await fetch3DTruck()

    // Main render loop
    const mainLoop = (timestamp: number) => {
        animationFrameId = requestAnimationFrame(mainLoop);
        
        if (map.progress >= nTiles * nTiles) {
            if (drawed) {
                setIsLoading(false);
                drawMarkers()
                drawed = false
            }
        } else {
            let _progress: number = (Math.min(Math.floor(map.progress / (nTiles * nTiles) * 100), 100))
            setProgress(_progress);
        }
        renderer.render(scene, camera);
        controls.update();
        updateAnnotations();
    };
    mainLoop(0);
    WindowResize(renderer, camera);
  }, [setProgress])

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
  return (
    <React.Fragment>
      <Row>
        <Col>
          {isLoading ? (
                  <div className="loading-overlay" style={{top: "calc(50vh - 151px)", position: 'absolute', width: 'calc(100% - 20px)', height: '50%', left: '10px'}}>
                      <Spin className='map-loading-bar' style={{color: 'gold'}} tip="Loading...">
                          <Progress className='map-loading-progress-bar' percent={progress} status="active" />
                      </Spin>
                  </div>
              ) : (
              <></>
          )}
          <div ref={mapContainer} className="map-container" style={{ height: 'calc(100vh - 215px)', width: '100%', opacity: isLoading ? '0.05' : '1', position: 'relative' }} >
            {equipments.map((annotation, index) => (
                isLoading ? <></> : <RippleIcon key={index} annotation={annotation} />
            ))}
          </div>
        </Col>
      </Row>
    </React.Fragment>
  );
};

export default HaulRoadOptimisationMapView;
