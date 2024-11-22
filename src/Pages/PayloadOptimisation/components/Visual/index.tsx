import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Card, CardBody, Col, Container, Row } from "reactstrap";
import Breadcrumb from "Components/Common/Breadcrumb";
import { Button, TabsProps } from "antd";
import './index.scss'
import ExcavatorItem from "./ExcavatorItem";
import {excavators, generateTruckData} from './sampleData';
import { ThreeJS } from "Pages/ThreeJS";
import { THREEJSMap } from "Pages/3DMap";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader";
import * as THREE from "three";
import { isArray } from "lodash";
import FONT from 'three/examples/fonts/gentilis_bold.typeface.json'
import { ReloadOutlined } from "@ant-design/icons";
import { LAYOUT_MODE_TYPES } from "Components/constants/layout";
import { useSelector } from "react-redux";
import { LayoutSelector } from "selectors";
const Visual
 = (props: any) => {

    const mixer = useRef<any>(null)
    const clock = useRef<any>(null)
    const mixerRef = useRef<THREE.AnimationMixer | null>(null);
    const mapContainer = useRef<any>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true)
    const font = useRef<any>(null)
    const [selectedTrip, setSelectedTrip] = useState<any>(props.trucks[0].index)
    const selectedTripRef = useRef<string>(props.trucks[0].index)

    const { layoutModeType } = useSelector(LayoutSelector);
    const isLight = layoutModeType === LAYOUT_MODE_TYPES.LIGHT;
    
    useEffect(() => {
        selectedTripRef.current = selectedTrip
    }, [selectedTrip])
    function generateCircleCoordinates(
        center: [number, number],
        radiusInMeters: number
      ): THREE.Vector3[] {
        const coordinates: [number, number][] = [];
        const points: THREE.Vector3[] = [];
        const numPoints = 128;
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
    const trucks = useMemo(() => {
        return props.trucks
    }, [props.trucks])

    useEffect(() => {
        setSelectedTrip(props.trucks[0].index)
    }, [props.excavator])

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

    const [centerPos, setCenterPos] = useState<THREE.Vector3>(new THREE.Vector3(-1500, 730, 40))
    const circleLine = useRef<any>(null)
    const textMeshes = useRef<any[]>([])
    const circleMeshs = useRef<any[]>([])
    useEffect(() => {
        const excav = excavators.find(exc => exc.id === props.excavator.value)
        if (!excav) return
        setCenterPos(new THREE.Vector3(excav.position[0], excav.position[1], excav.position[2]))
    }, [props.excavator])

    useEffect(() => {
        if (!isLoading && window.map) {
            cleanPrev()
            let {tileX, tileY, tilePixelX, tilePixelY} = window.map.convertXYToPixel(centerPos.x, centerPos.y)
            let {latitude, longitude} = window.map.convertTileToGeo(tileX, tileY, tilePixelX, tilePixelY)
            const points = generateCircleCoordinates([longitude, latitude], 16)
            const geometry = new THREE.BufferGeometry();
            const vertices = new Float32Array(flattenPositions(points, 0.1));
            geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
            
            const material = new THREE.LineDashedMaterial({
                color: '#000000',
                linewidth: 4, // Only works in WebGL1
                scale: 1, // Scale of the dashes
                dashSize: 2, // Length of the dashes
                gapSize: 1, // Length of the gaps
                depthWrite: false,
                transparent: true
            });
            
            // Use THREE.Line for continuous lines, not LineSegments
            const line = new THREE.Line(geometry, material);
            line.computeLineDistances(); // Required for dashed lines
            window.map.scene.add(line);
            circleLine.current = line
            if (selectedTripRef.current) {
                const truck = trucks.find(truck => truck.index === selectedTripRef.current)
                // draw numbered circles (1, 2, 3, 4, 5)
                truck && drawNumberedCircles(truck, truck.weights.length)
            }
            moveEquipments(centerPos)
            // focusing initial excavator position
            animateZoom()
        }
    }, [isLoading, centerPos])

    useEffect(() => {
        if (!window.map || !window.map.scene) return
        // remove old meshes
        textMeshes.current.map(textmesh => {
            textmesh.geometry.dispose()
            textmesh.material.dispose();
            window.map.scene.remove(textmesh)
        })
        textMeshes.current = []
        circleMeshs.current.map(circlemesh => {
            circlemesh.geometry.dispose()
            circlemesh.material.dispose();
            window.map.scene.remove(circlemesh)
        })
        circleMeshs.current = []

        const truck = trucks.find(truck => truck.index === selectedTrip)
        // draw numbered circles (1, 2, 3, 4, 5)
        truck && drawNumberedCircles(truck, truck.weights.length)
    }, [selectedTrip])

    const moveEquipments = useCallback((pos) => {
        if (!window.map || !window.map.scene) return
        if (window.DiggerObject && window.DiggerObject.group) {
            window.DiggerObject.group.position.copy(new THREE.Vector3(pos.x, pos.y, pos.z - 5))
        }
        if (window.TruckObject) {
            window.TruckObject.position.copy(new THREE.Vector3(pos.x - 50, pos.y + 30, pos.z - 5))
        }
    }, [centerPos])

    const drawNumberedCircles = useCallback((truck: any, count: number) => {
        const center = centerPos
        const angleStep = (2 * Math.PI) / (count * 4); // Angle between each text
        const radius = 54
        for (let i = 1 ; i <= count ; i ++) {
            const textGeometry = new THREE.TextGeometry(i.toString() || 'X', {
                font: font.current,
                size: 5,
                height: 0.1,
                curveSegments: 12,
                bevelEnabled: false,
            });
            const textMaterial = new THREE.MeshBasicMaterial({ 
                color: '#ffffff', 
                transparent: true, 
                depthWrite: false,
                side: THREE.DoubleSide // Make text visible from both sides
            })
            const textMesh = new THREE.Mesh(textGeometry, textMaterial)

            const angle = i * angleStep;

            // Calculate x and y positions using polar coordinates
            const x = center.x + radius * Math.cos(angle);
            const y = center.y + radius * Math.sin(angle);
            // Position the text mesh
            textMesh.position.set(x, y, center.z); // Use center.z to keep the z-coordinate consistent

            // Make text face the camera by orienting it appropriately
            const cameraUp = new THREE.Vector3(0, 0, 1); // Matches the camera.up setting
            textMesh.up.copy(cameraUp);
            textMesh.rotation.z = Math.PI / 2;
            const direction = new THREE.Vector3().subVectors(new THREE.Vector3(0, 0, 35), center).normalize()
            // textMesh.rotateOnAxis(cameraUp, Math.atan2(direction.y, direction.x))
            // Rotate text to align with the outward direction
            // textMesh.lookAt(center); // Make the text face the center point
            // Add to the scene
            window.map.scene.add(textMesh)
            textMeshes.current.push(textMesh)
            const circleGeometry = new THREE.CircleGeometry(5, 18); // Adjust the radius of the circle as needed
            const excav = excavators.find(exc => exc.id === props.excavator.value)
            const circleMaterial = new THREE.MeshBasicMaterial({ color: truck.colors[i - 1], depthWrite: false, transparent: true });
            const circleMesh = new THREE.Mesh(circleGeometry, circleMaterial);
        
            // Position the circle at the same location as the text
            circleMesh.position.set(x - 2, y + 2, center.z - 1); // Set z below text to avoid overlap
            // circleMesh.lookAt(center); // Rotate the circle to face the same direction as the text

            window.map.scene.add(circleMesh)
            circleMeshs.current.push(circleMesh)
        }
    }, [centerPos])

    const cleanPrev = () => {
        if (!window.map || !window.map.scene) return
        // remove old meshes
        textMeshes.current.map(textmesh => {
            textmesh.geometry.dispose()
            textmesh.material.dispose();
            window.map.scene.remove(textmesh)
        })
        textMeshes.current = []
        circleMeshs.current.map(circlemesh => {
            circlemesh.geometry.dispose()
            circlemesh.material.dispose();
            window.map.scene.remove(circlemesh)
        })
        circleMeshs.current = []
        if (circleLine.current) {
            circleLine.current.geometry.dispose()
            circleLine.current.material.dispose();
            window.map.scene.remove(circleLine.current)
        }
    }

    const animateZoom = () => {
        let animationCameraId = 0
        const startPosition = window.map.camera.position.clone();
        const point = centerPos; // Zoom offset
        const sph = new THREE.Spherical();
        sph.radius = 120; // Distance from the point (increase if needed)
        sph.theta = 1.2; // Set theta to 1.21 radians
        sph.phi = -2.5; // Adjust phi as needed, usually between 0 and Math.PI

        // Calculate the offset position from spherical coordinates
        const sphericalOffset = new THREE.Vector3();
        sphericalOffset.setFromSpherical(sph);

        // Define the target position based on the point with spherical offset
        const targetPosition = point.clone().add(sphericalOffset);
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
    }
    const onDocumentMouseClick = (event) => {
        const raycaster = new THREE.Raycaster();
        const mouse = new THREE.Vector2();
        if (!mapContainer.current || !window.map) return;
        const mapContainerElement = mapContainer.current.getMapContainer();
        // Make sure mapContainerElement is not null
        if (!mapContainerElement) return;
        const containerBounds = mapContainerElement.getBoundingClientRect(); // Use getBoundingClientRect
        mouse.x = ((event.clientX - containerBounds.left) / containerBounds.width) * 2 - 1;
        mouse.y = -((event.clientY - containerBounds.top) / containerBounds.height) * 2 + 1;

        // Update the raycaster with the camera and mouse position
        raycaster.setFromCamera(mouse, window.map.camera);

        // Intersect the objects in the scene (you can also specify specific objects)
        const intersects = raycaster.intersectObjects(window.map.scene.children, true);

        if (intersects.length > 0) {
            const intersectedObject = intersects[0].object;
            const position = intersectedObject.position.clone();
            // Do something with the 3D coordinates, e.g., highlight the object
        }
    }

    useEffect(() => {
        font.current = new THREE.Font(FONT);
        return () => {
        };
    }, [])

    const [reloadModels, setReloadModels] = useState(0);
    const refershMap = useCallback(() => {
        setReloadModels(reloadModels + 1)
    }, [reloadModels])

    return (
        <>
            <Row>
                <Button size='small' style={{width: '100px', marginTop: '1rem', marginLeft: '1rem', marginRight: '0.5rem', height: '32px', background: isLight ? 'white' : '#25324c', color: isLight ? "#25324c" : 'white' }} icon={<ReloadOutlined />} onClick={refershMap}>Refresh</Button>
            </Row>
            <Row>
                <Col lg={6} sm={12} style={{marginTop: '1rem'}}>
                    <THREEJSMap reloadModels={reloadModels} ref={mapContainer} isAutoRouting={true} height="583px" defaultLayers={[]} isLoading={isLoading} setIsLoading={setIsLoading} diggerInitPoint={centerPos} truckInitPoint={new THREE.Vector3(-1550, 760, 45)} diggerImport={true} onDocumentMouseClick={onDocumentMouseClick} />
                </Col>
                <Col lg={6} sm={12}  className="scrollable-row row" style={{ marginTop: '1rem', display: 'flex', overflowX: 'auto', flexWrap: 'nowrap', padding: 0 }}>
                    {
                        excavators.filter(exc => exc.id === props.excavator.value).map((excavator, index) => (
                            <Col sm={12} style={{paddingRight: 0}}>
                                <Card key={index} style={{borderRadius: '15px'}}>
                                        <ExcavatorItem
                                            excavatorId={excavator.id}
                                            syncStatus={`Synced ${excavator.synced}m ago`}
                                            avgHangTime={excavator.hangTime}
                                            trucks={props.trucks}
                                            syncTimeColor={excavator.syncTimeColor}
                                            avgHangTimeColor={excavator.avgHangTimeColor}
                                            selectedTrip={selectedTrip}
                                            setSelectedTrip={setSelectedTrip}
                                        />
                                </Card>
                            </Col>
                        ))
                    }
                </Col>
            </Row>
        </>
    )
}

export default Visual;