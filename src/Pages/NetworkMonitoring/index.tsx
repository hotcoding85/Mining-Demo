import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Card, CardBody, Col, Container, FormGroup, Label, Row } from 'reactstrap';
import Breadcrumb from 'Components/Common/Breadcrumb';
import { useDispatch, useSelector } from 'react-redux';
import { Button, Input, Layout, List, Modal, Typography } from 'antd';
import { THREEJSMap } from 'Pages/3DMap';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import TrailerItem from './components/TrailerItem';
import './style.scss'
import { LAYOUT_MODE_TYPES } from 'Components/constants/layout';
import { LayoutSelector } from 'selectors';
import ANTENNA from 'assets/images/network-mornitoring/antenna.jpg'
import SOLOR_UNIT from 'assets/images/network-mornitoring/solor-unit.jpg'
import XBUTTON from 'assets/images/x-button.png'
import SOLOR_TRAILER from 'assets/images/network-mornitoring/solor-trailer.jpg'
import SURVEY_MARKER from 'assets/images/network-mornitoring/survey-marker.jpg'
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';
import * as THREE from 'three';
import _ from 'lodash';
import { Dropdown, DropdownType } from "Components/Common/Dropdown";
import { AppstoreOutlined, CloseOutlined, CloudUploadOutlined, RotateLeftOutlined, RotateRightOutlined, SaveOutlined } from '@ant-design/icons';
import * as turf from '@turf/turf';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader';
import { toast } from "react-toastify";
const { Title, Text } = Typography;

const NetworkMonitoring = (props: any) => {
    document.title = "Network Monitoring | FMS Live";

    const mapContainer = useRef<any>(null);
    const dispatch: any = useDispatch();
    const [isLoading, setIsLoading] = useState<boolean>(true)
    const initialTrailers = [
        { name: 'Tower', id: 'antenna', dataRate: '10 Mbps', avatar:  ANTENNA},
        // { name: 'Trailer', id: 'solor-trailer', dataRate: '8 Mbps', avatar: SOLOR_TRAILER },
        { name: 'Solar Panel', id: 'solor-unit', dataRate: '12 Mbps', avatar: SOLOR_UNIT },
        { name: 'GPS RTK Base Station', id: 'survey-marker', dataRate: '5 Mbps', avatar: SURVEY_MARKER },
    ];

    const [addStatus, setAddStatus] = useState<boolean>(true)
    const [removeStatus, setRemoveStatus] = useState<boolean>(false)
    const addStatusRef = useRef(true)
    const removeStatusRef = useRef(true)

    const [angle, setAngle] = useState(0);

    const handleSliderChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setAngle(Number(event.target.value));
    };

    const [equipment, setEquipment] = useState<DropdownType>({
        label: "",
    });

    const _equipments = useMemo(() => {
        const results: any = []
        initialTrailers.map(exc => {
            const item = {
                label: `${exc.name}`,
                value: `${exc.id}`,
            }
            results.push(item)
        })
        return results
    }, [initialTrailers])

    const { layoutModeType } = useSelector(LayoutSelector);
    const isLight = layoutModeType === LAYOUT_MODE_TYPES.LIGHT;
    const tooltipRef = useRef<HTMLDivElement | null>(null);

    const [trailers, setTrailers] = useState(initialTrailers);

    const [selectedId, setSelectedId] = useState(null);

    useEffect(() => {
        if (equipment.value) {
            handleSelect(equipment.value)
        }
    }, [equipment])
    const handleSelect = useCallback((id) => {
        if (selectedId === id) {
            setSelectedId(null)
        }
        else{
            setSelectedId(id);
        }
    }, [selectedId]);
    const modelsRef = useRef<any[]>([]); // Use ref to keep track of loaded models

    const [equipments, setEquipments] = useState<any[]>([])
    const equipmentsRef = useRef<any[]>([])
    const objectsRef = useRef<any[]>([])
    const removeBtnsRef = useRef<any[]>([])
    let tooltip = document.createElement('div');

    useEffect(() => {
        // Array of models to load
        const models = [
            {
                mtl: "/network-mornitoring/antenna/Tower.mtl",
                obj: "/network-mornitoring/antenna/Tower.obj",
                texture: "/network-mornitoring/antenna/Communications_Array__1115122845.png",
                position: new THREE.Vector3(0, 0, 280), // Adjust position for this model
                scale: new THREE.Vector3(100, 100, 100),
                rotation: new THREE.Euler(Math.PI / 2, Math.PI / 2, 0), // Adjust rotation for this model
                id: 'antenna',
                dataRate: '10 Mbps'
            },
            // Add other models here
            // {
            //     mtl: "/network-mornitoring/solor-trailer/solor-trailer.mtl",
            //     obj: "/network-mornitoring/solor-trailer/solor-trailer.obj",
            //     position: new THREE.Vector3(100, 0, 280), // Adjust position
            //     scale: new THREE.Vector3(70, 70, 70),
            //     rotation: new THREE.Euler(Math.PI / 2, Math.PI / 2, 0), // Adjust rotation
            //     id: 'solor-trailer',
            //     dataRate: '10 Mbps'
            // },
            {
                mtl: "/network-mornitoring/solor-unit/solor-unit.mtl",
                obj: "/network-mornitoring/solor-unit/solor-unit.obj",
                texture: "/network-mornitoring/solor-unit/Solar_Trailer_in_the__1115144448.png",
                position: new THREE.Vector3(-100, 100, 220), // Adjust position
                scale: new THREE.Vector3(80, 80, 80),
                rotation: new THREE.Euler(Math.PI / 2, Math.PI / 2, 0), // Adjust rotation
                id: 'solor-unit',
                dataRate: '10 Mbps'
            },
            {
                mtl: "/network-mornitoring/survey-marker/survey-marker.mtl",
                obj: "/network-mornitoring/survey-marker/survey-marker.obj",
                position: new THREE.Vector3(-100, 0, 260), // Adjust position
                scale: new THREE.Vector3(70, 70, 70),
                rotation: new THREE.Euler(Math.PI / 2, Math.PI / 2, 0), // Adjust rotation
                id: 'survey-marker',
                dataRate: '10 Mbps'
            },
            // Add more models as needed
        ];

        const loadModels = async () => {
            const loadedModels = await Promise.all(
                models.map(model => 
                    new Promise((resolve, reject) => {
                        const mtlLoader = new MTLLoader();
                        mtlLoader.load(model.mtl, (materials) => {
                            materials.preload();
                            let texture: any = null
                            if (model.texture) {
                                const textureLoader = new THREE.TextureLoader();
                                texture = textureLoader.load(model.texture);
                            }
                            let objLoader: any
                            objLoader = new OBJLoader();
                            objLoader.setMaterials(materials);
                            objLoader.load(
                                model.obj,
                                (object) => {
                                    // Check the type of the loaded object
                                    if (object instanceof THREE.Group) {
                                        object.children.forEach(child => {
                                            if (child instanceof THREE.LineSegments) {
                                                const geometry = (child.geometry as THREE.BufferGeometry).clone();
                                                const material = materials.materials[child.name] || new THREE.MeshPhongMaterial();
                                                const mesh = new THREE.Mesh(geometry, material);
                                                mesh.scale.copy(model.scale);
                                                mesh.rotation.copy(model.rotation);
                                                // mesh.position.copy(model.position);
                                                object.add(mesh); // Add the new mesh to the group
                                            } else if (child instanceof THREE.Mesh) {
                                                child.scale.copy(model.scale);
                                                child.rotation.copy(model.rotation);
                                                // child.position.copy(model.position);
                                            }
                                        });
                                    }
                                    object.traverse((child: any) => {
                                        if (child.isMesh) {
                                            child.material.transparent = false;
                                            if (texture) {
                                                (child.material.map = texture) // Apply the texture
                                                const pbrMaterial = new THREE.MeshStandardMaterial({
                                                    map: child.material.map, // Use the same texture map
                                                    metalness: 0.3,          // Adjust for the material's reflectiveness
                                                    roughness: 0.7           // Adjust for surface roughness
                                                });
                                                child.material = pbrMaterial;
                                                child.material.needsUpdate = true; // Ensure material updates
                                            }
                                        }
                                    });
                                    object.visible = false; // Initially set to invisible
                                    resolve({object: object, id: model.id}); // Resolve with the loaded object
                                },
                                undefined,
                                (error) => {
                                    console.error(`An error occurred while loading the OBJ file: ${error}`);
                                    reject(error);
                                }
                            );
                        });
                    })
                )
            );

            modelsRef.current = loadedModels; // Store loaded models in ref
        };

        loadModels().catch(error => {
            console.error('Error loading models:', error);
        });

        tooltip.style.position = 'absolute';
        tooltip.style.padding = '5px';
        tooltip.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
        tooltip.style.color = '#fff';
        tooltip.style.borderRadius = '5px';
        tooltip.style.display = 'none';
        document.body.appendChild(tooltip);


        let currentIndex = 0;

        // Animation logic to cycle through the lines
        const intervalId = setInterval(() => {
            // Hide all lines initially
            dashedCirclesRef.current.forEach((line, index) => {
                line.visible = false;
                (line.userData.index === currentIndex || currentIndex === 0) && (line.visible = true)
            });

            // Show the current line

            // Move to the next index, cycling back to 0 after 4
            currentIndex = (currentIndex + 1) % 6;
        }, 500); // Change every second

        // Cleanup the interval when the component unmounts
        return () => clearInterval(intervalId);
    }, [])

    useEffect(() => {
        if (isLoading || !window.map) return

        const savedEquipments = localStorage.getItem('equipments');
        if (savedEquipments) {
            const data = JSON.parse(savedEquipments)
            const updatedEquipments = data.map((equipment: any) => {
                // Find the model corresponding to this equipment's type
                const matchingModel = modelsRef.current.find(
                  (model) => model.id === equipment.type
                );
                console.log(matchingModel)
                // If a matching model is found, add the model's object to the equipment
                if (matchingModel) {
                    const clonedObject = matchingModel.object.clone();
                    clonedObject.visible = true
                    return { ...equipment, object: clonedObject }; // Add 'object' to the equipment
                }
                
                return equipment; // If no matching model, return the equipment as is
            });
              
            setEquipments(updatedEquipments);
        }

        modelsRef.current.forEach((model: any) => {
            if (model) {
                model.object.visible = true; // Set model to visible
                model.object.userData = {isEquipment: true, type: currentEquipmentType.current}
                window.map.scene.add(model.object); // Add to scene
            }
        });

        let animationCameraId = 0
        const startPosition = window.map.camera.position.clone();
        const point = new THREE.Vector3(-1400, 470, 70); // Zoom offset
        // Animate the camera movement
        const zoomDuration = 400; // 0.1 second
        let startTime: number | null = null;
        window.isAnimation = true
        window.controls && (window.controls.enabled = false)

        const sph = new THREE.Spherical();
        sph.radius = 6000; // Distance from the point (increase if needed)
        sph.theta = 2; // Set theta to 1.21 radians
        sph.phi = -1.5; // Adjust phi as needed, usually between 0 and Math.PI

        // Calculate the offset position from spherical coordinates
        const sphericalOffset = new THREE.Vector3();
        sphericalOffset.setFromSpherical(sph);

        // Define the target position based on the point with spherical offset
        const targetPosition = point.clone().add(sphericalOffset);

        // Set the final position in animateZoom
        window.camera.position.lerpVectors(startPosition, targetPosition, 1);

        // Animate the controls target
        window.controls.target.lerpVectors(startPosition, point, 1);

        // Save the current camera position and orientation for reference
        window.savedCameraPosition = window.camera.position.clone();
        window.savedCameraQuaternion = window.camera.quaternion.clone();

        // Update the camera matrix and projection
        window.camera.updateProjectionMatrix();
        window.camera.updateMatrixWorld();
        // Finalize camera position
        window.camera.position.copy(targetPosition);
        window.controls.target.copy(point);

        
        window.isAnimation = false;
        setTimeout(() => {
            window.controls.update();
            window.renderer.render(window.map.scene, window.camera);
            if (window.controls) window.controls.enabled = true;
        }, 100);
        const animateZoom = (time) => {
            if (startTime === null) startTime = time;
            const _elapsed = time - (startTime ? startTime : time);
            const progress = Math.min(_elapsed / zoomDuration, 1);

            // Interpolate the camera position

            // Continue animation or finalize
            if (progress < 1) {
                animationCameraId = requestAnimationFrame(animateZoom);
            } else {
                animationCameraId && cancelAnimationFrame(animationCameraId)
            }
        };

        // animationCameraId = requestAnimationFrame(animateZoom);
    }, [isLoading])

    const selectedModelRef = useRef<any>(null)
    const selectedOffsetRef = useRef<any>(null)
    const currentEquipmentType = useRef<any>(null)
    useEffect(() => {
        // hide prev object:
        if (selectedModelRef.current) {
            selectedModelRef.current.position.set(0, 0, 0);
        }
        if (selectedId && window.map && modelsRef.current.length !== 0) {
            const object = modelsRef.current.find(obj => obj.id === selectedId)
            if (object) {
                selectedModelRef.current = (object.object)
                switch(selectedId) {
                    case 'antenna':
                        selectedOffsetRef.current = 90;
                        break
                    case 'solor-trailer':
                        selectedOffsetRef.current = 50;
                        break
                    case 'solor-unit':
                        selectedOffsetRef.current = 40;
                        break
                    case 'survey-marker':
                        selectedOffsetRef.current = 70;
                        break
                    default:
                        selectedOffsetRef.current = 100
                }
            }
        }
        if (selectedId === null) {
            selectedModelRef.current = (null)
        }
        currentEquipmentType.current = selectedId
    }, [selectedId])

    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    const [selectedEquipment, setSelectedEquipment] = useState<any>(null)
    const selectedEquipmentRef = useRef<any>(null)
    const [isMoving, setIsMoving] = useState(false)
    const isMovingRef = useRef<boolean>(false)
    const originalPos = useRef<any>(null)
    const originalZ = useRef<any>(null)
    const originalOffset = useRef<any>(null)
    const originalType = useRef<any>(null)
    const originalId = useRef<any>(null)
    const newPos = useRef<any>(null)
    useEffect(() => {
        isMovingRef.current = isMoving
    }, [isMoving])
    const onDocumentMouseClick = useCallback((event) => {
        if (mapContainer.current && window.map && removeStatusRef.current) {
            const intersects = raycaster.intersectObjects(removeBtnsRef.current, true);
            const validIntersects = intersects.filter(intersect => {
                const userData = intersect.object.userData;
                return userData && userData.isRemove;
            });

            // Get the `id` of the first valid intersected object
            if (validIntersects.length > 0) {
                const firstIntersect = validIntersects[0];
                const id = firstIntersect.object.userData.id; // Access the `id` from `userData`
                const equipment = equipmentsRef.current.find(eq => eq.id === id);
                if (equipment) {
                    Modal.confirm({
                        title: "Are you sure you want to remove this equipment?",
                        content: "GPS Coordinates is : [" + equipment.lng + ', ' + equipment.lat + ']',
                        okText: "Remove",
                        okType: "danger",
                        cancelText: "Cancel",
                        onOk() {
                            // Remove the equipment from `equipments` state
                            setEquipments((prevEquipments: any) => 
                                prevEquipments.filter((eq: any) => eq.id !== equipment.id)
                            );

                            // Optionally, remove the equipment and its remove button from the scene
                            window.map.scene.remove(equipment.object);
                        },
                    });
                }
            }
        }

        if (mapContainer.current && window.map) {
            if (isMovingRef.current && selectedEquipmentRef.current) {
                let intersects = raycaster.intersectObjects(window.map.scene.children, true);
            
                if (intersects.length > 0) {
                    const realWorldPosition = intersects[intersects.length - 1].point;
                    selectedEquipmentRef.current.position.set(realWorldPosition.x, realWorldPosition.y, Math.min(realWorldPosition.z, 180) + originalOffset.current);

                    newPos.current = new THREE.Vector3(realWorldPosition.x, realWorldPosition.y, Math.min(realWorldPosition.z, 180) + originalOffset.current)
                    setIsMoving(false)
                }
                return;
            }
            objectsRef.current.forEach(group => {
                group.traverse(child => {
                    child.userData = { ...group.userData };
                });
            });
            const intersects = raycaster.intersectObjects(objectsRef.current, true);
            const validIntersects = intersects.filter(intersect => {
                const userData = intersect.object.userData;
                return userData && userData.equipment;
            });

            // Get the `id` of the first valid intersected object
            if (validIntersects.length > 0) {
                const firstIntersect = validIntersects[0];
                const id = firstIntersect.object.userData.id; // Access the `id` from `userData`
                const equipment = equipmentsRef.current.find(eq => eq.id === id);
                if (equipment) {
                    document.body.style.cursor = 'pointer';
                    const object = objectsRef.current.find(obj => obj.userData.id === id)
                    const radians = object.rotation ? -object.rotation.z : 0; // Example value in radians (e.g., 45 degrees)
                    const degrees = THREE.MathUtils.radToDeg(radians);
                    originalZ.current = 0
                    originalId.current = equipment.id
                    originalPos.current = firstIntersect.object.parent?.position.clone()
                    originalOffset.current = equipment.offset
                    originalType.current = equipment.type
                    setAngle(Math.floor(degrees))
                    setIsMoving(false)
                    setSelectedEquipment(object)
                }
                else{
                    document.body.style.cursor = 'auto'; // Default cursor style
                    setSelectedEquipment(null)
                }
            }
            else{
                setSelectedEquipment(null)
            }
        }
        if (!addStatusRef.current) return

        if (!mapContainer.current || !window.map || !selectedModelRef.current) return;
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

        // Cast a ray from the camera to the clicked position
        if (intersects.length > 0) {
            const intersectedObject = intersects[intersects.length - 1].object;
            // Get the first intersection point
            let realWorldPosition = intersects[intersects.length - 1].point;
            const tileData = window.map.convertXYToPixel(realWorldPosition.x, realWorldPosition.y)
            const coord = window.map.convertTileToGeo(tileData.tileX, tileData.tileY, tileData.tilePixelX, tileData.tilePixelY)
            Modal.confirm({
                title: "Are you sure you want to add this equipment?",
                content: "GPS Coordinates is : [" + coord.longitude + ', ' + coord.latitude + ']',
                okText: "Add",
                okType: "primary",
                cancelText: "Cancel",
                onOk() {
                    const copyModel = selectedModelRef.current.clone();

                    // Optionally, set a new position, rotation, or scale for the copied model
                    copyModel.position.set(0, 0, 0); // Example position
                    copyModel.scale.set(1, 1, 1); // Example scale
                    const id = Date.now()
                    copyModel.userData = {id: id, type: currentEquipmentType.current, equipment: true}
                    setEquipments((prev: any) => [
                        ...prev,
                        {
                            lng: coord.longitude,
                            lat: coord.latitude,
                            object: copyModel,
                            offset: selectedOffsetRef.current,
                            type: currentEquipmentType.current,
                            id: id,
                            orientation: 0
                        }
                    ]);
                },
            });
        }
    }, [])

    useEffect(() => {
        if (selectedEquipment) {
            const angleInRadians = THREE.MathUtils.degToRad(angle);
            selectedEquipment.rotation.z = -angleInRadians
        }
    }, [angle, selectedEquipment])

    useEffect(() => {
        selectedEquipmentRef.current = selectedEquipment
        if (!selectedEquipment) setAngle(0)
    }, [selectedEquipment])

    function generateCircleCoordinates(
        center: [number, number],
        radiusInMeters: number
      ): THREE.Vector3[] {
        const coordinates: [number, number][] = [];
        const points: THREE.Vector3[] = [];
        const numPoints = 256;
        const angleStep = (2 * Math.PI) / numPoints;
        const earthRadius = 6371000;
      
        const _center = {
            tileX: window.map.center.x,
            tileY: window.map.center.y
        }
        const [centerLon, centerLat] = center;
      
        const centerLatInRad = (centerLat * Math.PI) / 180;
      
        for (let i = 0; i <= numPoints; i++) {
          const angle = i * angleStep;
      
          const dx = radiusInMeters * Math.cos(angle);
          const dy = radiusInMeters * Math.sin(angle);
      
          const newLatitude = centerLat + (dy / earthRadius) * (180 / Math.PI);
      
          const newLongitude =
            centerLon +
            ((dx / earthRadius) * (180 / Math.PI)) / Math.cos(centerLatInRad);
      
          coordinates.push([newLongitude, newLatitude]);

          const tileData = window.map.convertGeoToPixel(newLatitude, newLongitude)
          const tileX = tileData.tileX;          // tile X coordinate of the point
          const tileY = tileData.tileY;          // tile Y coordinate of the point
          const tilePixelX = tileData.tilePixelX; // pixel X position inside the tile
          const tilePixelY = tileData.tilePixelY; // pixel Y position inside the tile
          
          const worldPos = window.map.calculateWorldPosition(_center, tileX, tileY, tilePixelX, tilePixelY, 512);
          let elevationValue = window.map.getElevationAt([tilePixelX, tilePixelY], tileX, tileY);
          const realWorldPosition = new THREE.Vector3(worldPos.x, worldPos.y, 0);
          realWorldPosition.z = elevationValue * 2 + 3

          points.push(realWorldPosition);
        }
        return points;
    }

    const dashedCirclesRef = useRef<any[]>([])
    const greenStatusRef = useRef<any[]>([])
    const uplinkPathRef = useRef<any[]>([])

    useEffect(() => {
        if (!window.map || !window.map.scene || isLoading) return;
        const center = {
            tileX: window.map.center.x,
            tileY: window.map.center.y
        }
        equipmentsRef.current = equipments
        removeBtnsRef.current.forEach((removeButton: any) => {
            window.map.scene.remove(removeButton);
            removeButton.material?.dispose()
            removeButton.geometry?.dispose()
        });
        removeBtnsRef.current = []

        dashedCirclesRef.current.map(line => {
            window.map.scene.remove(line);
            line.material.dispose()
            line.geometry.dispose()
        })
        dashedCirclesRef.current = []
        objectsRef.current.forEach((object: any) => {
            window.map.scene.remove(object);
            object.material?.dispose()
            object.geometry?.dispose()
        });

        greenStatusRef.current.forEach((circle: any) => {
            window.map.scene.remove(circle);
            circle.material?.dispose()
            circle.geometry?.dispose()
        });
        greenStatusRef.current = []
        uplinkPathRef.current.forEach((arrow: any) => {
            window.map.scene.remove(arrow);
            arrow.material?.dispose()
            arrow.geometry?.dispose()
        });
        uplinkPathRef.current = []
        objectsRef.current = []
        _.map(equipments, eq => {
            const lat = eq.lat; // Latitude
            const lng = eq.lng; // Longitude
            const tilePixel = window.map.convertGeoToPixel(lat, lng, window.map.zoom);
            const tileX = tilePixel.tileX;          // tile X coordinate of the point
            const tileY = tilePixel.tileY;          // tile Y coordinate of the point
            const tilePixelX = tilePixel.tilePixelX; // pixel X position inside the tile
            const tilePixelY = tilePixel.tilePixelY; // pixel Y position inside the tile

            const worldPos = window.map.calculateWorldPosition(center, tileX, tileY, tilePixelX, tilePixelY, 512);
            let elevationValue = 0
            elevationValue = window.map.getElevationAt([tilePixelX, tilePixelY], tileX, tileY) * 2 + eq.offset;

            // Add the copied model to the scene
            eq.object.userData = {id: eq.id, type: eq.type, equipment: true}
            eq.object.position.set(worldPos.x, worldPos.y, elevationValue)
            // eq.object.userData = {isEquipment: true, type: currentEquipmentType.current}
            // Create an "X" remove button using a sprite
            const removeButtonTexture = new THREE.TextureLoader().load(XBUTTON); // Add your "X" icon path here
            const removeButtonMaterial = new THREE.SpriteMaterial({ map: removeButtonTexture, depthTest: false, transparent: true });
            const removeButtonSprite = new THREE.Sprite(removeButtonMaterial);

            // Position the remove button above the model
            removeButtonSprite.position.set(worldPos.x, worldPos.y, elevationValue + 30); // Adjust 10 to position the button
            removeButtonSprite.userData = {isRemove: true, id: eq.id}
            removeButtonSprite.scale.set(15, 15, 15); // Adjust the scale to make the button a suitable size
            if (removeStatusRef.current) {
                removeButtonSprite.visible = true
            }
            else{
                removeButtonSprite.visible = false
            }
            removeBtnsRef.current.push(removeButtonSprite)

            if (eq.orientation !== 0) {
                eq.object.rotation.z = eq.orientation
            }
            // Add both model and button to the scene
            window.map.scene.add(eq.object);
            objectsRef.current.push(eq.object)
            window.map.scene.add(removeButtonSprite);

            // if type is antenna we need to draw dashed cirles for it
            if (eq.type === 'antenna') {
                let {tileX, tileY, tilePixelX, tilePixelY} = window.map.convertXYToPixel(worldPos.x, worldPos.y);
                let {latitude, longitude} = window.map.convertTileToGeo(tileX, tileY, tilePixelX, tilePixelY);
                
                // Generate points using your existing function
                for (let i = 1 ; i <= 5 ; i ++) {
                    const points = generateCircleCoordinates([longitude, latitude], 36 * i)
                
                    // Create the curve
                    const curve = new THREE.CatmullRomCurve3(points);
                    
                    // Get points along the curve (e.g., 50 segments)
                    const curvePoints = curve.getPoints(50 * i);
                
                    // Create geometry and set vertices
                    const geometry = new THREE.BufferGeometry().setFromPoints(curvePoints);
                
                    const material = new THREE.LineDashedMaterial({
                        color: 'blue',
                        linewidth: 4, // Only works in WebGL1
                        scale: 1, // Scale of the dashes
                        dashSize: 20, // Length of the dashes
                        gapSize: 15, // Length of the gaps
                        depthWrite: false,
                        transparent: true
                    });
                
                    // Create the line and compute line distances for dashed effect
                    const line = new THREE.Line(geometry, material);
                    line.computeLineDistances(); // Required for dashed lines
                    line.userData = {index: i, id: eq.id}
                    window.map.scene.add(line);

                    dashedCirclesRef.current.push(line)
                }
            }    
            if (eq.type === 'survey-marker') {
                let flag = false
                equipments.map(_antenna => {
                    if (_antenna.type === 'antenna') {
                        const coordinates: any = []
                        coordinates.push([_antenna.lng, _antenna.lat])
                        coordinates.push([eq.lng, eq.lat])
                        let distance = Math.floor(turf.length(turf.lineString(coordinates), { units: 'meters' }))

                        if (Math.abs(distance) <= 180) {
                            flag = true
                            return
                        }
                    }
                })

                if (flag) {
                    drawGreenCircle(eq, '#00ab41')
                }
                else{
                    drawGreenCircle(eq, '#ff474c')
                }
            }        
            if (eq.type === 'antenna') {
                equipments.filter(_eq => _eq.id !== eq.id).map(_antenna => {
                    if (_antenna.type === 'antenna') {
                        drawUplinkPaths(eq, _antenna)
                    }
                })
            }        
        })
    }, [equipments])

    const drawUplinkPaths = (startAntenna, endAntenna, color = '#00ab41') => {
        if (window.map && window.map.scene) {
            const center = {
                tileX: window.map.center.x,
                tileY: window.map.center.y
            }
            let lat = startAntenna.lat; // Latitude
            let lng = startAntenna.lng; // Longitude
            let tilePixel = window.map.convertGeoToPixel(lat, lng, window.map.zoom);
            let tileX = tilePixel.tileX;          // tile X coordinate of the point
            let tileY = tilePixel.tileY;          // tile Y coordinate of the point
            let tilePixelX = tilePixel.tilePixelX; // pixel X position inside the tile
            let tilePixelY = tilePixel.tilePixelY; // pixel Y position inside the tile

            const startPoint = window.map.calculateWorldPosition(center, tileX, tileY, tilePixelX, tilePixelY, 512);
            let elevationValue = 0
            elevationValue = window.map.getElevationAt([tilePixelX, tilePixelY], tileX, tileY) * 2 + 3;
            const start = new THREE.Vector3(startPoint.x, startPoint.y, elevationValue)
            lat = endAntenna.lat; // Latitude
            lng = endAntenna.lng; // Longitude
            tilePixel = window.map.convertGeoToPixel(lat, lng, window.map.zoom);
            tileX = tilePixel.tileX;          // tile X coordinate of the point
            tileY = tilePixel.tileY;          // tile Y coordinate of the point
            tilePixelX = tilePixel.tilePixelX; // pixel X position inside the tile
            tilePixelY = tilePixel.tilePixelY; // pixel Y position inside the tile

            const endPoint = window.map.calculateWorldPosition(center, tileX, tileY, tilePixelX, tilePixelY, 512);
            elevationValue = window.map.getElevationAt([tilePixelX, tilePixelY], tileX, tileY) * 2 + 3;
            const end = new THREE.Vector3(endPoint.x, endPoint.y, elevationValue)
    
            const direction = new THREE.Vector3().subVectors(end, start).normalize();
            const distance = start.distanceTo(end);

            // Calculate 1/3 of the distance (shaft length)
            const shaftLength = 300;

            // Calculate the point 1/3 of the way from start to end
            const shaftEnd = new THREE.Vector3().addVectors(start, direction.clone().multiplyScalar(shaftLength));

            // Create the shaft (cylinder) of the arrow
            const shaftGeometry = new THREE.CylinderGeometry(3, 3, shaftLength, 8); // Adjusted to make it thinner
            const shaftMaterial = new THREE.MeshBasicMaterial({ color: color });
            const shaft = new THREE.Mesh(shaftGeometry, shaftMaterial);

            // Position the shaft at the midpoint of start and shaftEnd (necessary for THREE.js CylinderGeometry)
            const shaftPosition = new THREE.Vector3().addVectors(start, shaftEnd).multiplyScalar(0.5);
            shaft.position.set(shaftPosition.x, shaftPosition.y, shaftPosition.z);

            // Make the shaft point towards the shaftEnd
            shaft.lookAt(shaftEnd);
            shaft.rotation.y += Math.PI / 2; // Adjust rotation if necessary
            // Create the arrowhead (cone)
            const headGeometry = new THREE.ConeGeometry(16, 4, 3);
            const headMaterial = new THREE.MeshBasicMaterial({ color: color });
            const arrowhead = new THREE.Mesh(headGeometry, headMaterial);
    
            // Position the arrowhead at the end of the shaft
            arrowhead.position.set(shaftEnd.x, shaftEnd.y, shaftEnd.z);
            arrowhead.lookAt(end); // Orient the arrowhead to face the direction of the arrow
            // arrowhead.rotation.x = Math.PI; // Rotate the cone to align with the shaft
            // Add the shaft and arrowhead to the scene
            // arrowhead.rotation.y = Math.PI / 2;
            arrowhead.rotation.z = Math.PI;
            window.map.scene.add(shaft);
            window.map.scene.add(arrowhead);
            uplinkPathRef.current.push(shaft)
            uplinkPathRef.current.push(arrowhead)
        }
    }

    const drawGreenCircle = (eq, color) => {
        if (window.map && window.map.scene) {
            const center = {
                tileX: window.map.center.x,
                tileY: window.map.center.y
            }
            const lat = eq.lat; // Latitude
            const lng = eq.lng; // Longitude
            const tilePixel = window.map.convertGeoToPixel(lat, lng, window.map.zoom);
            const tileX = tilePixel.tileX;          // tile X coordinate of the point
            const tileY = tilePixel.tileY;          // tile Y coordinate of the point
            const tilePixelX = tilePixel.tilePixelX; // pixel X position inside the tile
            const tilePixelY = tilePixel.tilePixelY; // pixel Y position inside the tile

            const worldPos = window.map.calculateWorldPosition(center, tileX, tileY, tilePixelX, tilePixelY, 512);
            let elevationValue = 0
            elevationValue = window.map.getElevationAt([tilePixelX, tilePixelY], tileX, tileY) * 2 + 3;

            // Create a green circle
            const circleGeometry = new THREE.CircleGeometry(100, 32); // 50px radius, 32 segments
            const circleMaterial = new THREE.MeshBasicMaterial({ color: color, side: THREE.DoubleSide, depthTest: true, transparent: false });
            const circleMesh = new THREE.Mesh(circleGeometry, circleMaterial);

            // Position the circle at worldPos
            circleMesh.position.set(worldPos.x, worldPos.y, elevationValue);

            // Add the circle to the scene
            window.map.scene.add(circleMesh);
            greenStatusRef.current.push(circleMesh)
        }
    }

    useEffect(() => {
        removeStatusRef.current = removeStatus
        removeBtnsRef.current.map(removeButtonSprite => {
            if (removeStatus) {
                removeButtonSprite.visible = true
            }
            else{
                removeButtonSprite.visible = false
            }
        })
    }, [removeStatus])
    useEffect(() => {
        addStatusRef.current = addStatus
    }, [addStatus])

    const [hovered, setHovered] = useState(false);
    const onDocumentMouseMove = useCallback(
        ((event) => {
            if (window.map) {
                let foundEquipment = false;
                const mapContainerElement = mapContainer.current.getMapContainer();
                if (!mapContainerElement) return;
                const containerBounds = mapContainerElement.getBoundingClientRect();
                mouse.x = ((event.clientX - containerBounds.left) / containerBounds.width) * 2 - 1;
                mouse.y = -((event.clientY - containerBounds.top) / containerBounds.height) * 2 + 1;
        
                raycaster.setFromCamera(mouse, window.map.camera);
        
                _.map(equipmentsRef.current, (eq) => {
                    const intersects = raycaster.intersectObject(eq.object, true);
                
                    if (intersects.length > 0) {
                        const intersect = intersects[0];
                
                        // Show tooltip and set its position
                        tooltip.style.display = 'block';
                        tooltip.style.left = `${event.clientX + 10}px`;
                        tooltip.style.top = `${event.clientY + 10}px`;
                        let name = ''
                        switch (eq.type) {
                            case 'antenna':
                                name = "Antenna";
                                break;
                            case 'solor-trailer':
                                name = "Solar Trailer";
                                break    
                            case 'solor-unit':
                                name = "Solar Unit";
                                break
                            case 'survey-marker':
                                name = "Survey Marker";
                                break
                        }
                        let html = `
                            <div style="display: flex; justify-content: center; align-items: center; color: white; margin-bottom: 4px; text-align: center">
                                <span style="font-weight: bold;">${name || 'Model'}</span>
                            </div>
                            <table style="border-collapse: collapse; color: white;">
                                <tr>
                                    <th style="padding: 4px;">Property</th>
                                    <th style="padding: 4px;">Value</th>
                                </tr>
                                <tr>
                                    <td style="padding: 4px;">Name</td>
                                    <td style="padding: 4px;">${name || 'N/A'}</td>
                                </tr>
                                <tr>
                                    <td style="padding: 4px;">Type</td>
                                    <td style="padding: 4px;">${eq.type || 'N/A'}</td>
                                </tr>`
                            html += eq.type === 'antenna' ? `<tr>
                                        <td style="padding: 4px;">Data Rate</td>
                                        <td style="padding: 4px;">${'80MHz'}</td>
                                    </tr>` : '';
                            html += `<tr>
                                    <td style="padding: 4px;">[${eq.lng || 'N/A'},</td>
                                    <td style="padding: 4px;">${eq.lat || 'N/A'}]</td>
                                </tr>
                                <!-- Add more rows as needed -->
                            </table>
                        `;

                        tooltip.innerHTML = html
                
                        // Exit the loop once we find the first intersected model
                        return true;
                    }
                    return false;
                });

                if (!equipmentsRef.current.some((eq) => raycaster.intersectObject(eq.object, true).length > 0)) {
                    tooltip.style.display = 'none';
                }

                let intersects = raycaster.intersectObjects(removeBtnsRef.current, true);
                const validIntersects = intersects.filter(intersect => {
                    const userData = intersect.object.userData;
                    return userData && (userData.isRemove || userData.equipment);
                });
            
                // If there is exactly one valid intersect, change the cursor to 'pointer'
                if (validIntersects.length >= 1) {
                    document.body.style.cursor = 'pointer';
                } else {
                    document.body.style.cursor = 'auto'; // Default cursor style
                }
            }
            if (isMovingRef.current && selectedEquipmentRef.current) {
                let intersects = raycaster.intersectObjects(window.map.scene.children, true);
            
                if (intersects.length > 0) {
                    const realWorldPosition = intersects[intersects.length - 1].point;
                    selectedEquipmentRef.current.position.set(realWorldPosition.x, realWorldPosition.y, Math.min(realWorldPosition.z, 180) + originalOffset.current);
                }

                return;
            }
            if (!addStatusRef.current) {
                selectedModelRef.current && (selectedModelRef.current.visible = false)
                return
            }
            else{
                selectedModelRef.current && (selectedModelRef.current.visible = true)
            }
            if (!mapContainer.current || !window.map || !selectedModelRef.current) return;
            
            const mapContainerElement = mapContainer.current.getMapContainer();
            if (!mapContainerElement) return;
    
            const containerBounds = mapContainerElement.getBoundingClientRect();
            mouse.x = ((event.clientX - containerBounds.left) / containerBounds.width) * 2 - 1;
            mouse.y = -((event.clientY - containerBounds.top) / containerBounds.height) * 2 + 1;
    
            raycaster.setFromCamera(mouse, window.map.camera);
    
            let intersects = raycaster.intersectObjects(window.map.scene.children, true);
            
            if (intersects.length > 0) {
                const realWorldPosition = intersects[intersects.length - 1].point;
                selectedModelRef.current.position.set(realWorldPosition.x, realWorldPosition.y, Math.min(realWorldPosition.z, 180) + selectedOffsetRef.current);
            }
        }),
        []
    );

    const submitNetworkMornitoring = useCallback(() => {
        const dataToSave = equipments.map((equipment) => {
            // Create a new object excluding the 'object' property
            const { object, ...rest } = equipment;
            return rest;
        });
    
        localStorage.setItem('equipments', JSON.stringify(dataToSave));
        toast.success(`Data successfully saved to the DB.`, { autoClose: 2000 });
    }, [equipments])

    const reset = () => {
        if (selectedEquipment && window.map) {
            if (selectedEquipment.rotation) {
                const center = {
                    tileX: window.map.center.x,
                    tileY: window.map.center.y
                }
                selectedEquipment.rotation.z = originalZ.current
                selectedEquipment.position.copy(originalPos.current)
            }
        }
        setIsMoving(false); 
        setSelectedEquipment(null)
        originalZ.current = null
        originalOffset.current = null
        originalPos.current = null
        originalType.current = null
    }

    const save = () => {
        if (selectedEquipment && window.map && newPos.current) {
            let {tileX, tileY, tilePixelX, tilePixelY} = window.map.convertXYToPixel(newPos.current.x, newPos.current.y);
            let {latitude, longitude} = window.map.convertTileToGeo(tileX, tileY, tilePixelX, tilePixelY);
            if (newPos.current) {
                selectedEquipment.position.copy(newPos.current)

                setEquipments((prev: any) => 
                    prev.map((equipment: any) => {
                        if (equipment.id === originalId.current) {
                            return {
                                ...equipment,
                                lng: longitude, // Replace with the new longitude value
                                lat: latitude,  // Replace with the new latitude value
                                orientation: selectedEquipment.rotation ? selectedEquipment.rotation.z : 0
                            };
                        }
                        return equipment; // Keep other equipment unchanged
                    })
                );
            }

            if (originalType.current === 'antenna') {
                dashedCirclesRef.current = dashedCirclesRef.current.filter(line => {
                    if (line.userData.id === originalId.current) {
                        window.map.scene.remove(line);
                        line.material.dispose();
                        line.geometry.dispose();
                        return false; // Exclude this line from the new array
                    }
                    return true; // Keep other lines
                });
                
                // Generate points using your existing function
                for (let i = 1 ; i <= 5 ; i ++) {
                    const points = generateCircleCoordinates([longitude, latitude], 36 * i)
                
                    // Create the curve
                    const curve = new THREE.CatmullRomCurve3(points);
                    
                    // Get points along the curve (e.g., 50 segments)
                    const curvePoints = curve.getPoints(50 * i);
                
                    // Create geometry and set vertices
                    const geometry = new THREE.BufferGeometry().setFromPoints(curvePoints);
                
                    const material = new THREE.LineDashedMaterial({
                        color: '#000ecb',
                        linewidth: 4, // Only works in WebGL1
                        scale: 1, // Scale of the dashes
                        dashSize: 20, // Length of the dashes
                        gapSize: 15, // Length of the gaps
                        depthWrite: false,
                        transparent: true
                    });
                
                    // Create the line and compute line distances for dashed effect
                    const line = new THREE.Line(geometry, material);
                    line.computeLineDistances(); // Required for dashed lines
                    line.userData = {index: i, id: originalId.current}
                    window.map.scene.add(line);

                    dashedCirclesRef.current.push(line)
                }
            }
        }
        if (selectedEquipment.rotation && selectedEquipment.rotation.z != 0) {
            setEquipments((prev: any) => 
                prev.map((equipment: any) => {
                    if (equipment.id === originalId.current) {
                        return {
                            ...equipment,
                            orientation: selectedEquipment.rotation ? selectedEquipment.rotation.z : 0
                        };
                    }
                    return equipment; // Keep other equipment unchanged
                })
            );
        }
        setIsMoving(false); 
        setSelectedEquipment(null)
        originalZ.current = null
        originalOffset.current = null
        originalPos.current = null
        originalType.current = null
    }

    return (
        <React.Fragment>
        <div className="page-content" style={{paddingBottom: '1rem'}}>
            <Container fluid>
            <Breadcrumb title="Home" breadcrumbItem="Network Monitoring" />
            <Row>
                <Col md={12} sm={12} xs={12} className='network-monitoring-topmenu'>
                    <div className="network-monitoring-model-filter"> 
                        <Dropdown
                            label="Choose Model"
                            items={_equipments}
                            value={equipment}
                            onChange={setEquipment}
                        />
                    </div>
                    <FormGroup className='d-flex network-mornitoring-checkbox' style={{ marginLeft: '1rem' }}>
                        <Input
                            id="addEquipment"
                            name="addEquipment"
                            type="checkbox"
                            checked={addStatus} // Bind the state to the checkbox
                            onChange={(e) => {setAddStatus(e.target.checked)}} // Update state on change
                        />
                        <Label
                            style={{ marginLeft: '0.5rem' }}
                            check
                            for="addEquipment"
                        >
                            Add
                        </Label>
                    </FormGroup>
                    <FormGroup className='d-flex network-mornitoring-checkbox' style={{marginLeft: '1rem'}}>
                        <Input
                            id="removeEquipment"
                            name="removeEquipment"
                            type="checkbox"
                            checked={removeStatus} // Bind the state to the checkbox
                            onChange={(e) => setRemoveStatus(e.target.checked)} // Update state on change
                        />
                        <Label
                            check
                            style={{marginLeft: '0.5rem'}}
                            for="removeEquipment"
                        >
                        Remove
                        </Label>
                    </FormGroup>
                    <Button icon={<CloudUploadOutlined />} onClick={submitNetworkMornitoring} style={{marginLeft: '5px'}} >Save</Button>
                </Col>
            </Row>
            <Row style={{paddingTop: '0.5rem'}}>
                <DndProvider backend={HTML5Backend}>
                    <Col md={12} sm={12} xs={12}>
                        <THREEJSMap ref={mapContainer} height='calc(100vh - 200px)' defaultLayers={[]} isLoading={isLoading} setIsLoading={setIsLoading} onDocumentMouseClick={onDocumentMouseClick} onDocumentMouseMove={onDocumentMouseMove} isPitView={true}>
                            {hovered && (
                                <div
                                    ref={tooltipRef}
                                    style={{
                                        position: 'absolute',
                                        pointerEvents: 'none',
                                        backgroundColor: 'rgba(0, 0, 0, 0.7)',
                                        color: '#fff',
                                        padding: '5px 10px',
                                        borderRadius: '4px',
                                        transform: 'translate(-50%, -100%)',
                                    }}
                                >
                                    Model Tooltip
                                </div>
                            )}
                            <FormGroup className='orientation-slider' style={{display: selectedEquipment ? 'block' : 'none'}}>
                                <div>Updating...</div>
                                <Label for="angleSlider" style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span>0°</span>
                                    <span>{angle}°</span>
                                    <span>360°</span>
                                </Label>
                                <Input
                                    type="range"
                                    id="angleSlider"
                                    min="0"
                                    max="360"
                                    value={angle}
                                    onChange={handleSliderChange}
                                />
                                <div className='d-flex' style={{alignItems: 'center', marginTop: '0.5rem'}}>
                                    <FormGroup className='d-flex network-mornitoring-move-checkbox' style={{marginLeft: '1rem'}}>
                                        <Input
                                            id="moveEquipment"
                                            name="moveEquipment"
                                            type="checkbox"
                                            checked={isMoving} // Bind the state to the checkbox
                                            onChange={(e) => setIsMoving(e.target.checked)} // Update state on change
                                        />
                                        <Label
                                            check
                                            style={{marginLeft: '0.5rem'}}
                                            for="moveEquipment"
                                        >
                                        Move
                                        </Label>
                                    </FormGroup>
                                    <Button size='small' style={{width: '60px'}} icon={<SaveOutlined />} onClick={() => save()}>Save</Button>
                                    <Button size='small' style={{width: '70px', marginLeft: '0.5rem'}} icon={<CloseOutlined />} onClick={() => reset()}>Cancel</Button>
                                </div>
                            </FormGroup>
                        </THREEJSMap>
                    </Col>
                    {/* <Col md={3} sm={4} xs={12}>
                        <Card className='p-4' style={{height:'calc(100vh - 170px)', marginBottom: '0px'}}>
                            <Title style={{color: isLight ? 'rgba(0, 0, 0, 0.88)' : 'white'}} level={4}>Trailers and Equipments</Title>
                            <List
                            dataSource={trailers}
                            renderItem={(trailer, index) => (
                                <TrailerItem
                                    key={trailer.id}
                                    trailer={trailer}
                                    index={index}
                                    isLight={isLight}
                                    isSelected={selectedId === trailer.id}
                                    onSelect={() => handleSelect(trailer.id)}
                                    />
                            )}
                            />
                        </Card>
                    </Col> */}
                </DndProvider>
            </Row>
            </Container>
        </div>

        
        </React.Fragment >
    );
}

export default NetworkMonitoring;
