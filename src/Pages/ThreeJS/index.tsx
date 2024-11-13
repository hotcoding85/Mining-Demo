import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Col, Container, Row } from 'reactstrap';
import Breadcrumb from 'Components/Common/Breadcrumb';
import { useDispatch } from 'react-redux';
import './index.css'
import mapboxgl from 'mapbox-gl';
import _ from 'lodash';
import { Checkbox, CheckboxProps } from 'antd';
import 'antd/dist/reset.css';
import { getAllVehicleRoutes, getGeoFences } from 'slices/thunk';
import { DropdownType } from 'Components/Common/Dropdown';
import { THREEJSMap } from 'Pages/3DMap';
import * as THREE from 'three';

export const ThreeJS = () => {
    const dispatch: any = useDispatch();

    const layerOptions = ['Active Benches', 'Current Haul Routes', 'Future Road Designs', 'Speed Restrictions', 'Pit Bottom', 'Pit Climb', 'Stop Signs',        'Restricted', 'Dump Locations'];
    const defaultLayers = ['Active Benches'];
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [checkedList, setCheckedList] = useState<string[]>(defaultLayers);

    const onChange = (list: string[]) => {
        setCheckedList(list);
    };

    const onCheckAllChange: CheckboxProps['onChange'] = (e) => {
        setCheckedList(e.target.checked ? layerOptions : []);
    };

    document.title = "3D Pit View | FMS Live";

    const mapContainer = useRef<any>(null);
    mapboxgl.accessToken = process.env.MAPBOX_API_KEY || 'pk.eyJ1IjoibXlreXRhcyIsImEiOiJjbTA1MGhtb3YwY3Y0Mm5uY3FzYWExdm93In0.cSDrE0Lq4_PitPdGnEV_6w';
    const [lng, setLng] = useState(120.44871814239025);
    const [lat, setLat] = useState(-29.1506602184213);
    const geojsonData = useRef<any>();

    const [annotations, setAnnotations] = useState<any>([]);
    const annotationsRef = useRef<any[]>([])
    // state for Map loading status
    let animationFrameId: number;
    let map: any;

    useEffect(() => {
        dispatch(getAllVehicleRoutes())
        dispatch(getGeoFences()); // Dispatch action to fetch data on component mount
    }, [dispatch]);

    useEffect(() => {
        const waitingAnnotation ={
                type: 'truck',
                position: new THREE.Vector3(-1430, 640, 45),
                text: 'DT101',
                status: 'Waiting',
                model: 'HD785',
                time: '01:20',
                tonnes: '0',
                operator: 'Bain Chloe'
        }
        const loadingAnnotation ={
            type: 'truck',
            position: new THREE.Vector3(-1395, 490, 50),
            text: 'DT201',
            status: 'Loading',
            time: '01:20',
            model: 'HD1500',
            tonnes: '45.6',
            operator: 'Arlene McCoy'
        }
        const excavatorAnnotation ={
            type: 'excavator',
            position: new THREE.Vector3(-1380, 430, 65),
            text: 'EX201',
            status: 'Loading',
            time: '01:20',
            tonnes: '45.6',
            operator: 'Cody Fisher',
            passes: '6'
        }
        setAnnotations([waitingAnnotation, loadingAnnotation, excavatorAnnotation])
        annotationsRef.current = [waitingAnnotation, loadingAnnotation, excavatorAnnotation]
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
        if (!isLoading && window.map) {
            let animationCameraId = 0
            const startPosition = window.map.camera.position.clone();
            const point = new THREE.Vector3(-1420, 440, 70); // Zoom offset
            const targetPosition = new THREE.Vector3(point.x, point.y, point.z + 400)
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

            // add waiting truck
            const copyModel = window.TruckObject.clone();
            if (copyModel) {
                copyModel.position.set(-1430, 640, 45)
                copyModel.rotation.z += Math.PI

                window.map.scene.add(copyModel)
            }
        }
    }, [isLoading])

    const updateAnnotations = useCallback(() => {
        annotationsRef.current.forEach((annotation, index) => {
            if (!mapContainer.current || !window.map) return;
            const mapContainerElement = mapContainer.current.getMapContainer();

            // Make sure mapContainerElement is not null
            if (!mapContainerElement) return;

            const cameraPositionZ = window.map.camera.position.z;
            let scale;
            let offsetY, offsetX
            if (cameraPositionZ <= 150) {
                scale = 0.7;
                offsetY = 100
                offsetX = 80
            } else if (cameraPositionZ >= 1000) {
                scale = 0.1;
                offsetY = 0
                offsetX = 0
            } else {
                scale = 0.7 - ((cameraPositionZ - 150) / (1000 - 150)) * (0.7 - 0.1);
                offsetY = 100 - ((cameraPositionZ - 150) / (1000 - 150)) * (100 - 0)
                offsetX = 80 - ((cameraPositionZ - 150) / (1000 - 150)) * (80 - 0)
            }
            
            const containerBounds = mapContainerElement.getBoundingClientRect(); // Use getBoundingClientRect
            const screenPosition = annotation.position.clone();
            screenPosition.project(window.camera); // Project to screen space
            
            const x = (screenPosition.x * 0.5 + 0.5) * containerBounds.width;
            const y = -(screenPosition.y * 0.5 - 0.5) * containerBounds.height;
            
            const annotationDiv = document.getElementById(`eq-annotation-${index}`);
            if (annotationDiv) {
                annotationDiv.style.left = `${x - offsetX}px`;
                annotationDiv.style.top = `${y - offsetY}px`;
    
                // Check if the annotation is inside the viewport
                const isInViewport = (
                    x >= (105 + offsetX) && x <= containerBounds.width &&
                    y >= (offsetY + 40) && y <= containerBounds.height
                );
                annotationDiv.style.transform = `translate(-50%, -50%) scale(${scale})`;
                annotationDiv.style.display = isInViewport ? 'flex' : 'none';
            }
            const lineElement = document.getElementById(`eq-annotation-line-${index}`);
            if (lineElement) {
                const startX = 30
                const endX = 100
                const startY = 0
                const endY = 100
                const deltaX = endX - startX;
                const deltaY = endY - startY;
                const length = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
                lineElement.style.width = `${length}px`;
                lineElement.style.transform = `rotate(${Math.atan2(deltaY, deltaX)}rad)`;
    
                // Position the line
                lineElement.style.left = `${startX}px`;
                lineElement.style.top = `${startY}px`;
            }
        });
    }, []);
    const checkAll = layerOptions.length === checkedList.length;
    const indeterminate = checkedList.length > 0 && checkedList.length < layerOptions.length;
    const CheckboxGroup = Checkbox.Group;
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    const onDocumentMouseClick = useCallback((event) => {
        if (!mapContainer.current || !window.map) return;
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

        const center = {
            tileX: window.map.center.x,
            tileY: window.map.center.y
        }
        // Cast a ray from the camera to the clicked position
        if (intersects.length > 0) {
            const intersectedObject = intersects[0].object;
            // Get the first intersection point
            let realWorldPosition = intersects[0].point;
            if (window.DiggerObject){
                window.DiggerObject.group.visible = true
                // window.DiggerObject.group.position.set(realWorldPosition.x, realWorldPosition.y, realWorldPosition.z + 10);
            }
        }
    }, [])

    return (
        <>
            <React.Fragment>
                <div className="page-content" style={{paddingBottom: '0px'}}>
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
                            <THREEJSMap ref={mapContainer} defaultLayers={checkedList} drawMarkers={() => {}} updateAnnotations={updateAnnotations} isLoading={isLoading} setIsLoading={setIsLoading} diggerImport={true} onDocumentMouseClick={onDocumentMouseClick} height='calc(100vh - 200px)'>
                                {annotations.map((annotation: any, index) => (
                                    <div key={index} id={`eq-annotation-${index}`} className={`eq-annotation ${annotation.status}`}>
                                        <div style={{padding: 5, background: '#080808', textAlign: 'center', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                                            <h2 style={{color: 'gold', fontWeight: 800, marginBottom: 0}}>{annotation.text}</h2>
                                            <div style={{width: '20px', height: '20px', borderRadius: '50%', background: annotation.status === 'Loading' ? 'green' : 'gold', marginLeft: '1rem'}}></div>
                                        </div>
                                        <div className='annotation-content' style={{marginTop: '0.5rem', paddingLeft: '1rem'}}>
                                            {
                                                annotation.type === 'truck' ? 
                                                <>
                                                    <h3 style={{textTransform: 'uppercase'}}>{annotation.status}</h3>
                                                    <h4>{annotation.operator}</h4>
                                                    <h4>{annotation.tonnes !== '0' ? annotation.tonnes + 'T' : '---'} - {annotation.time}</h4>
                                                </> :
                                                <>
                                                    <h4>Unit: {"DT201"}</h4>
                                                    <h4>{annotation.operator}</h4>
                                                    <h4>Payload: {annotation.tonnes}T</h4>
                                                    <h4>Passes: {annotation.passes}</h4>
                                                </>
                                            }
                                        </div>
                                        <div className="annotation-line" id={`eq-annotation-line-${index}`} />
                                    </div>
                                ))}
                            </THREEJSMap>
                        </Col>
                    </Row>
                    </Container>
                </div>
            </React.Fragment >
        </>
    )
}