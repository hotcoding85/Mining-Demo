import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Col, Container, Row } from 'reactstrap';
import Breadcrumb from 'Components/Common/Breadcrumb';
import { useDispatch } from 'react-redux';
import './index.css'
import mapboxgl from 'mapbox-gl';
import _ from 'lodash';
import { Checkbox, CheckboxProps, Segmented, Space, Button } from 'antd';
import 'antd/dist/reset.css';
import { getAllVehicleRoutes, getGeoFences } from 'slices/thunk';
import { THREEJSMap } from 'Pages/3DMap';
import * as THREE from 'three';
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';
import { ConsoleSqlOutlined, ReloadOutlined } from '@ant-design/icons';

export const ThreeJS = () => {
    const dispatch: any = useDispatch();

    const layerOptions = ['Auto', "Connecting Lines"];
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
    const cameraAnimationFrameId = useRef<any>(null)
    const currentActiveEq = useRef<any>(1)
    const totalPositions = useRef<any[]>([])
    const [annotations, setAnnotations] = useState<any>([]);
    const annotationsRef = useRef<any[]>([])
    // state for Map loading status
    let animationFrameId: number;
    let map: any;
    const [filter, setFilter] = useState<string>("All Equipment");
    const currentFilterRef = useRef<any>(null)
    useEffect(() => {
        dispatch(getAllVehicleRoutes())
        dispatch(getGeoFences()); // Dispatch action to fetch data on component mount
    }, [dispatch]);

    useEffect(() => {
        const waitingAnnotation = {
            type: 'truck',
            position: new THREE.Vector3(-1430, 640, 45),
            text: 'DT121',
            status: 'Waiting',
            model: 'HD1500',
            time: '00:48',
            tonnes: '0',
            operator: 'C. Bain',
            lastTime: '13:49'
        }
        const loadingAnnotation = {
            type: 'truck',
            position: new THREE.Vector3(-1395, 490, 50),
            text: 'DT101',
            status: 'Loading',
            time: '01:20',
            model: 'HD1500',
            tonnes: '45.6',
            lastTime: '15:34',
            operator: 'M. Arlene'
        }
        const excavatorAnnotation = {
            type: 'excavator',
            position: new THREE.Vector3(-1380, 430, 65),
            text: 'EX201',
            status: 'Loading',
            time: '01:20',
            tonnes: '45.6',
            operator: 'F. Cody',
            passes: '5',
            totalTime: '16:24:45'
        }
        const drillAnnotation = {
            type: 'drill',
            position: new THREE.Vector3(-1630, 1180, 40),
            text: 'DR001',
            status: 'Drilling',
            time: '01:20',
            counts: '6',
            operator: 'R. James',
            totalTime: '16:24:45',
            eta_time: '08:21:00'
        }

        const dozerAnnotation = {
            type: 'dozer',
            position: new THREE.Vector3(-1580, 960, 40),
            text: 'DZ001',
            status: 'Loading',
            time: '01:20',
            counts: '6',
            operator: 'S. Dave',
            totalTime: '00:24:550',
            eta_time: '09:45:00'
        }

        const waitingAnnotation2 = {
            type: 'truck',
            position: new THREE.Vector3(-505, -1940, 50),
            text: 'DT122',
            status: 'Waiting',
            model: 'HD1500',
            time: '00:48',
            tonnes: '0',
            operator: 'S. Adam',
            lastTime: '15:29'
        }
        const loadingAnnotation2 = {
            type: 'truck',
            position: new THREE.Vector3(-396, -2045, 55),
            text: 'DT102',
            status: 'Loading',
            time: '00:49',
            model: 'HD1500',
            tonnes: '32.6',
            lastTime: '12:53',
            operator: 'J. Lincoln'
        }
        const excavatorAnnotation2 = {
            type: 'excavator',
            position: new THREE.Vector3(-380, -2111, 55),
            text: 'EX202',
            status: 'Loading',
            time: '01:20',
            tonnes: '106.4',
            operator: 'S. Ivan',
            passes: '5',
            totalTime: '11:32:21'
        }
        const drillAnnotation2 = {
            type: 'drill',
            position: new THREE.Vector3(-608, -1506, 50),
            text: 'DR002',
            status: 'Drilling',
            time: '02:18',
            counts: '3',
            operator: 'S. Ben',
            totalTime: '16:24:45',
            eta_time: '09:45:00'
        }

        const dozerAnnotation2 = {
            type: 'dozer',
            position: new THREE.Vector3(-508, -1786, 40),
            text: 'DZ002',
            status: 'Loading',
            time: '23:20',
            operator: 'P. Whitney',
            totalTime: '02:23:41',
            eta_time: '08:21:00'
        }

        setAnnotations([waitingAnnotation, loadingAnnotation, excavatorAnnotation, drillAnnotation, waitingAnnotation2, loadingAnnotation2, excavatorAnnotation2, drillAnnotation2, dozerAnnotation, dozerAnnotation2])
        annotationsRef.current = [waitingAnnotation, loadingAnnotation, excavatorAnnotation, drillAnnotation, waitingAnnotation2, loadingAnnotation2, excavatorAnnotation2, drillAnnotation2, dozerAnnotation, dozerAnnotation2]
        // load large dirt
        // loadLargeDirt()
        // Clean up on component unmount
        return () => {
            map && map.clean()

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

            cameraAnimationFrameId.current && clearInterval(cameraAnimationFrameId.current)
        };
    }, []); // Added dependencies to reinitialize map if lat/lng changes

    const largeDirtRef = useRef<any>(null)
    const loadLargeDirt = () => {
        const mtlLoader = new MTLLoader();
        mtlLoader.load('/dirt/dirt-large.mtl', (materials) => {
            materials.preload();
            let objLoader: any
            objLoader = new OBJLoader();
            objLoader.setMaterials(materials);
            objLoader.load(
                '/dirt/dirt-large.obj',
                (object) => {
                    // Check the type of the loaded object
                    if (object instanceof THREE.Group) {
                        object.children.forEach(child => {
                            if (child instanceof THREE.LineSegments) {
                                const geometry = (child.geometry as THREE.BufferGeometry).clone();
                                const material = materials.materials[child.name] || new THREE.MeshStandardMaterial({
                                    color: 0xFFD700, // Gold color
                                    metalness: 1,    // High metalness for a metallic appearance
                                    roughness: 0.4,  // Adjust for reflectivity (lower is shinier)
                                });
                                const mesh = new THREE.Mesh(geometry, material);
                                mesh.scale.copy(new THREE.Vector3(4, 4, 4));
                                object.add(mesh); // Add the new mesh to the group
                            } else if (child instanceof THREE.Mesh) {
                                child.scale.copy(new THREE.Vector3(4, 4, 4));
                                child.rotation.copy(new THREE.Euler(Math.PI / 2, Math.PI / 2, 0));
                                // Update the material of child meshes to have gold properties
                                child.material = new THREE.MeshStandardMaterial({
                                    color: 0xFFD700, // Gold color
                                    metalness: 1,
                                    roughness: 0.4,
                                });
                            }
                        });
                    }
                    object.traverse((child: any) => {
                        if (child.isMesh) {
                            child.material.color.set(0x8B4513); // Set the color to soil brown
                            child.material.metalness = 0.3;
                            child.material.roughness = 0.7;
                            child.material.depthTest = true
                            child.material.depthWrite = true
                            child.material.transparent = false
                        }
                    });
                    object.visible = true; // Initially set to invisible
                    largeDirtRef.current = object;
                },
                undefined,
                (error) => {
                    console.error(`An error occurred while loading the OBJ file: ${error}`);
                }
            );
        });
    }

    useEffect(() => {
        if (!isLoading && window.map && window.camera) {
            let animationCameraId = 0
            const startPosition = window.map.camera.position.clone();
            const point = new THREE.Vector3(-1400, 470, 70); // Zoom offset
            // Animate the camera movement
            const zoomDuration = 1000; // 1 second
            let startTime: number | null = null;
            window.isAnimation = true
            window.controls && (window.controls.enabled = false)

            const sph = new THREE.Spherical();
            sph.radius = 110; // Distance from the point (increase if needed)
            sph.theta = 1.2; // Set theta to 1.21 radians
            sph.phi = -2.06; // Adjust phi as needed, usually between 0 and Math.PI

            // Calculate the offset position from spherical coordinates
            const sphericalOffset = new THREE.Vector3();
            sphericalOffset.setFromSpherical(sph);

            // Define the target position based on the point with spherical offset
            const targetPosition = point.clone().add(sphericalOffset);

            // Set the final position in animateZoom
            const animateZoom = (time) => {
                if (!window.camera) return
                if (startTime === null) startTime = time;
                const _elapsed = time - (startTime ? startTime : time);
                const progress = Math.min(_elapsed / zoomDuration, 1);

                // Interpolate the camera position
                window.camera.position.lerpVectors(startPosition, targetPosition, progress);

                // Animate the controls target
                window.controls.target.lerpVectors(startPosition, point, progress);

                // Save the current camera position and orientation for reference
                window.savedCameraPosition = window.camera.position.clone();
                window.savedCameraQuaternion = window.camera.quaternion.clone();

                // Update the camera matrix and projection
                window.camera.updateProjectionMatrix();
                window.camera.updateMatrixWorld();

                // Continue animation or finalize
                if (progress < 1) {
                    animationCameraId = requestAnimationFrame(animateZoom);
                } else {
                    // Finalize camera position
                    window.camera.position.copy(targetPosition);
                    window.controls.target.copy(point);


                    window.isAnimation = false;
                    if (largeDirtRef.current) {
                        largeDirtRef.current.position.set(-1370, 450, 55)
                        largeDirtRef.current.visible = true
                        window.map.scene.add(largeDirtRef.current)
                    }
                    if (window.DrillObject) {
                        window.map.scene.add(window.DrillObject);
                    }
        
                    if (window.DozerObject) {
                        window.map.scene.add(window.DozerObject);
                        // window.map.scene.add(clonedDozer);
                    }
                    // add waiting truck
                    if (window.TruckObject) {
                        const copyModel = window.TruckObject.clone();
                        if (copyModel) {
                            copyModel.visible = true
                            copyModel.position.set(-1430, 640, 45)
                            copyModel.rotation.z += Math.PI
                            window.TruckWaitingObject = copyModel
                            window.map.scene.add(copyModel)
                        }
        
                        const copyModel2 = window.TruckObject.clone();
                        if (copyModel2) {
                            copyModel2.visible = true
                            copyModel2.position.set(-505, -1940, 45)
                            copyModel2.rotation.z += Math.PI
                            window.TruckWaitingObject2 = copyModel2
                            window.map.scene.add(copyModel2)
                        }
                    }

                    setTimeout(() => {
                        window.controls.update();
                        window.renderer.render(window.map.scene, window.camera);
                        if (window.controls) window.controls.enabled = true;

                        const isAuto = checkedList.find(item => item === 'Auto')
                        if (isAuto) {
                            currentActiveEq.current++
                            cameraAnimationFrameId.current && clearInterval(cameraAnimationFrameId.current)
                            cameraAnimationFrameId.current = setInterval(_animateZoom, 10000)
                        }
                        else {
                            currentActiveEq.current = null
                            cameraAnimationFrameId.current && clearInterval(cameraAnimationFrameId.current)
                        }
                    }, 100);
                }
            };

            animationCameraId = requestAnimationFrame(animateZoom);
        }
    }, [isLoading])

    const updateAnnotations = useCallback(() => {
        annotationsRef.current.forEach((annotation, index) => {
            if (!mapContainer.current || !window.map) return;
            const mapContainerElement = mapContainer.current.getMapContainer();

            // Make sure mapContainerElement is not null
            if (!mapContainerElement) return;

            var dir = new THREE.Vector3();
            var sph = new THREE.Spherical();
            window.camera.getWorldDirection(dir);
            const adjustedDir = new THREE.Vector3(dir.x, dir.z, dir.y);  // Swap Y and Z

            // Set spherical coordinates based on the adjusted direction
            sph.setFromVector3(adjustedDir);
            let normalizedTheta = -sph.theta;

            const cameraPositionZ = window.map.camera.position.z;
            let scale;
            let offsetY, offsetX
            let maxOffsetY = index == 0 ? 150 : 200
            let minOffsetY = index == 0 ? 50 : 50
            let maxOffsetX = index == 1 ? 150 : index == 2 ? -200 : index == 3 ? 120 : 0
            let minOffsetX = index == 1 ? 20 : index == 2 ? -80 : 0

            if (normalizedTheta > 0) {
                maxOffsetX = index == 1 ? -200 : index == 2 ? 250 : index == 3 ? -150 : 0
                minOffsetX = index == 1 ? -20 : index == 2 ? 30 : 0
            }
            if (cameraPositionZ <= 150) {
                scale = 1.3;
                offsetY = maxOffsetY
                offsetX = maxOffsetX
            } else if (cameraPositionZ >= 1000) {
                scale = 0.3;
                offsetY = minOffsetY
                offsetX = minOffsetX
            } else {
                scale = 1.3 - ((cameraPositionZ - 150) / (1000 - 150)) * (1.3 - 0.3);
                offsetY = maxOffsetY - ((cameraPositionZ - 150) / (1000 - 150)) * (maxOffsetY - minOffsetY)
                offsetX = maxOffsetX - ((cameraPositionZ - 150) / (1000 - 150)) * (maxOffsetX - minOffsetX)
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
                    x >= (105 + offsetX) && x <= (containerBounds.width + offsetX) &&
                    y >= (offsetY + 40) && y <= (containerBounds.height + offsetY)
                );
                annotationDiv.style.transform = `translate(-50%, -50%) scale(${scale})`;
                annotationDiv.style.display = isInViewport && cameraPositionZ < 500 ? 'flex' : 'none';
            }
        });
    }, []);
    const checkAll = layerOptions.length === checkedList.length;
    const indeterminate = checkedList.length > 0 && checkedList.length < layerOptions.length;
    const CheckboxGroup = Checkbox.Group;

    useEffect(() => {
        if (!isLoading && window.map && window.map.scene) {
            // checkedList
            const isAuto = checkedList.find(item => item === 'Auto')
            const drillPatterns = checkedList.find(item => item === 'Connecting Lines')
            if (drillPatterns) {
                window.map.scene.children.forEach((child) => {
                    if (child.userData.isDrillPattern) {
                        child.visible = true
                    }
                });
            }
            else{
                window.map.scene.children.forEach((child) => {
                    if (child.userData.isDrillPattern) {
                        child.visible = false
                    }
                });
            }
            if (isAuto) {
                currentActiveEq.current++
                cameraAnimationFrameId.current && clearInterval(cameraAnimationFrameId.current)
                cameraAnimationFrameId.current = setInterval(_animateZoom, 12000)
            }
            else {
                currentActiveEq.current = null
                cameraAnimationFrameId.current && clearInterval(cameraAnimationFrameId.current)
            }
        }
    }, [checkedList, isLoading])

    useEffect(() => {
        currentFilterRef.current = filter
    }, [filter])

    const _animateZoom = () => {
        let targetAnnotation: any = null;

        if (currentFilterRef.current === 'All Equipment') {
            totalPositions.current = annotationsRef.current.filter(eq => eq.type !== 'truck'); // For demonstration, select the first annotation
        } else if (currentFilterRef.current === 'fleet1') {
            totalPositions.current = annotationsRef.current.filter(annotation => annotation.text === 'EX201');
        } else if (currentFilterRef.current === 'fleet2') {
            totalPositions.current = annotationsRef.current.filter(annotation => annotation.text === 'EX202');
        } else if (currentFilterRef.current === 'DRILLER') {
            totalPositions.current = annotationsRef.current.filter(annotation => annotation.type === 'drill');
        } else if (currentFilterRef.current === 'DOZER') {
            totalPositions.current = annotationsRef.current.filter(annotation => annotation.type === 'dozer');
        }

        if(totalPositions.current.length == 0){
            cameraAnimationFrameId.current && clearInterval(cameraAnimationFrameId.current)
        }
        targetAnnotation = totalPositions.current[currentActiveEq.current % (totalPositions.current.length)]
        currentActiveEq.current = currentActiveEq.current % (totalPositions.current.length)
        if (targetAnnotation) {
            const startPosition = window.map.camera.position.clone();
            const point = targetAnnotation.position.clone(); // Position from the selected annotation
            point.z += 100
            point.x -= 100
            point.y += 100
            const zoomDuration = 1000; // 1 second
            let startTime: number | null = null;
            let animationCameraId = 0;
            window.isAnimation = true;
            if (window.controls) window.controls.enabled = false;

            const sph = new THREE.Spherical();
            sph.radius = 110; // Adjust distance if necessary
            sph.theta = 1.2; // Adjust angle as needed
            sph.phi = -2.06; // Adjust angle between 0 and Math.PI

            const sphericalOffset = new THREE.Vector3();
            sphericalOffset.setFromSpherical(sph);

            const targetPosition = point.clone().add(sphericalOffset);

            const animateCamera = (time: any) => {
                if (!startTime) startTime = time;
                const elapsed = time - (startTime ? startTime : time);
                const progress = Math.min(elapsed / zoomDuration, 1);

                // Interpolate the camera position
                window.camera.position.lerpVectors(startPosition, targetPosition, progress);
                // Animate the controls target
                window.controls.target.lerpVectors(startPosition, point, progress);

                // Save the current camera position and orientation for reference
                window.savedCameraPosition = window.camera.position.clone();
                window.savedCameraQuaternion = window.camera.quaternion.clone();

                window.camera.updateProjectionMatrix();
                window.camera.updateMatrixWorld();

                if (progress < 1) {
                    animationCameraId = requestAnimationFrame(animateCamera);
                } else {
                    window.camera.position.copy(targetPosition);
                    window.controls.target.copy(point);
                    window.isAnimation = false;

                    setTimeout(() => {
                        window.controls.update();
                        window.renderer.render(window.map.scene, window.camera);
                        if (window.controls) window.controls.enabled = true;
                        if(totalPositions.current.length === 1){
                            cameraAnimationFrameId.current && clearInterval(cameraAnimationFrameId.current)
                        }
                        currentActiveEq.current++
                    }, 100);
                }
            };

            animationCameraId = requestAnimationFrame(animateCamera);
        }
        else {
            currentActiveEq.current++
        }
    }
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
            // console.log(realWorldPosition)
            if (window.DiggerObject) {
                window.DiggerObject.group.visible = true
                // window.DiggerObject.group.position.set(realWorldPosition.x, realWorldPosition.y, realWorldPosition.z + 10);
            }
        }
    }, [])

    const [reloadModels, setReloadModels] = useState(0);
    const refershMap = useCallback(() => {
        setReloadModels(reloadModels + 1)
    }, [reloadModels])

    return (
        <>
            <React.Fragment>
                <div className="page-content" style={{ paddingBottom: '0px' }}>
                    <Container fluid>
                        <Breadcrumb title="Home" breadcrumbItem="3D Pit View" />
                        <Row>
                            <Col md="12" className='mb-4 d-flex flex-row-reverse'>
                                <Space>
                                    <Segmented className="customSegmentLabel customSegmentBackground" value={filter} onChange={(e) => setFilter(e)} options={['All Equipment', { label: 'Fleet 1', value: 'fleet1' }, { label: 'Fleet 2', value: 'fleet2' }, { label: 'Drillers', value: 'DRILLER' }, { label: 'Dozers', value: 'DOZER' }]} />
                                </Space>
                            </Col>
                        </Row>
                        <Row>
                            <Col lg="12">
                                <div style={{ alignContent: 'center', marginBottom: '20px' }}>
                                    <CheckboxGroup options={layerOptions} value={checkedList} onChange={onChange} />
                                    <Button size='small' style={{width: '100px', marginLeft: '0.5rem'}} icon={<ReloadOutlined />} onClick={refershMap}>Refresh</Button>
                                </div>
                                <THREEJSMap reloadModels={reloadModels} ref={mapContainer} defaultLayers={checkedList} drawMarkers={() => { }} updateAnnotations={updateAnnotations} isLoading={isLoading} setIsLoading={setIsLoading} drillImport={true} loaderImport={true} dozerImport={true} diggerImport={true} onDocumentMouseClick={onDocumentMouseClick} height='calc(100vh - 240px)' isPitView={true} equipmentFilter={filter}>
                                    {annotations.map((annotation: any, index) => (
                                        <div key={index} id={`eq-annotation-${index}`} className={`eq-annotation ${annotation.status}`}>
                                            <div style={{ padding: 0, textAlign: 'center', width: '100%', display: 'flex', alignItems: 'flex-start', justifyContent: 'flex-start', borderBottom: '1px solid white', flexDirection:'column' }}>
                                                <h3 style={{ fontWeight: 800, marginBottom: 0, fontSize: '18px', color: annotation.status === 'Waiting' ? 'purple' : '#00ff00' }}>{annotation.text}</h3>
                                                {annotation.type === 'excavator' && <h6 style={{marginBottom: 0}}>
                                                    <div style={{fontSize: '10px'}}>{annotation.operator}</div>
                                                </h6>}
                                            </div>
                                            <div className='annotation-content' style={{ marginTop: '0.5rem', paddingLeft: '0rem', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', width: '100%' }}>
                                                {
                                                    annotation.type === 'truck' ? (
                                                        <>
                                                            <h4 style={{ textTransform: 'uppercase' }}>{annotation.status}</h4>
                                                            <h6>
                                                                <div>Operator:</div>
                                                                <div>{annotation.operator}</div>
                                                            </h6>
                                                            {annotation.status !== 'Waiting' && (
                                                                <h6>
                                                                    <div>Payload:</div>
                                                                    <div>{annotation.tonnes}T</div>
                                                                </h6>
                                                            )}
                                                            <h6 style={{ color: annotation.status === 'Waiting' ? '#fff' : '#00ff00' }}>
                                                                <div>{annotation.status === 'Waiting' ? 'Waiting Time:' : 'Loading Time:'}</div>
                                                                <div>{annotation.time}</div>
                                                            </h6>
                                                            <h6>
                                                                <div>Last Cycle Time:</div>
                                                                <div>{annotation.lastTime}</div>
                                                            </h6>
                                                        </>
                                                    ) :
                                                        (annotation.type === 'drill' || annotation.type === 'dozer') ? (
                                                            <>
                                                                <h4 style={{ textTransform: 'uppercase' }}>{annotation.status}</h4>
                                                                <h6>
                                                                    <div>Operator:</div>
                                                                    <div>{annotation.operator}</div>
                                                                </h6>
                                                                {/* {annotation.status !== 'Waiting' && (
                                                            <h6>
                                                                <div>Payload:</div>
                                                                <div>{annotation.tonnes}T</div>
                                                            </h6>
                                                        )} */}
                                                                <h6 style={{ color: annotation.status === 'Waiting' ? 'gold' : '#00ff00' }}>
                                                                    <div>{annotation.status === 'Waiting' ? 'Waiting Time:' :
                                                                    annotation.type === 'drill' ? 'Drilling Time:' : 'Loading Time:'}</div>
                                                                    <div>{annotation.time}</div>
                                                                </h6>
                                                                <h6 style={{ color: 'white' }}>
                                                                    <div>ETA for Completion</div>
                                                                    <div>{annotation.eta_time}</div>
                                                                </h6>
                                                                {/* <h6>
                                                            <div>Loading Time:</div>
                                                            <div>{annotation.totalTime}</div>
                                                        </h6> */}
                                                            </>
                                                        ) :
                                                            (
                                                                <>
                                                                    <h6 style={{ fontSize: '14px' }}>Loading</h6>
                                                                    <h6>
                                                                        <div>Payload:</div>
                                                                        <div>{annotation.tonnes}T</div>
                                                                    </h6>
                                                                    <h6>
                                                                        <div>Passes:</div>
                                                                        <div>{annotation.passes}</div>
                                                                    </h6>
                                                                </>
                                                            )
                                                }
                                            </div>
                                            <div className="annotation-line" id={`eq-annotation-line-${index}`} />
                                            {/* <svg width="120" height="6" viewBox="0 0 120 6" fill="none" xmlns="http://www.w3.org/2000/svg" style={{position: 'absolute', top: '-3px'}}>
                                            <path fill-rule="evenodd" clip-rule="evenodd" d="M18.64 0.0267208L20.2514 1.69232L42.0494 1.68044L43.4244 0.0237518H76.2596L77.6407 1.68044L99.4326 1.68935L101.044 0.0237518L117.474 0L119.26 1.89124L116.516 5.79842H89.3746L88.4108 4.61973H31.2731L30.3094 5.79842H3.16776L0.423828 1.89124L2.21015 0L18.64 0.0237518V0.0267208Z" fill="#535E77"/>
                                        </svg>
                                        <svg width="21" height="104" viewBox="0 0 21 104" fill="none" xmlns="http://www.w3.org/2000/svg" style={{position: 'absolute', top: '0px', right: '0px'}}>
                                            <path fill-rule="evenodd" clip-rule="evenodd" d="M17.3124 38.6429L18.4327 37.102L18.4542 19.4247L17.2971 18.6557L17.2848 9.38658L10.3943 2.89045H0.560303L2.23613 0.52417H14.3383L20.4676 6.23649V97.3486L14.3383 103.058H2.23613L0.560303 100.692H10.3943L17.2848 94.1955L17.2971 84.9264L18.4542 84.1574L18.4327 66.4771L17.3124 64.9362C17.3063 56.1718 17.3063 47.4103 17.3124 38.6459V38.6429Z" fill="#535E77"/>
                                        </svg>
                                        <svg width="120" height="7" viewBox="0 0 120 7" fill="none" xmlns="http://www.w3.org/2000/svg" style={{position: 'absolute', bottom: '-3px'}}>
                                            <path fill-rule="evenodd" clip-rule="evenodd" d="M18.6275 6.46335L20.2389 4.79776L42.0369 4.80963L43.412 6.46632H76.2471L77.6283 4.80963L99.4202 4.80072L101.032 6.46632L117.461 6.49007L119.248 4.59883L116.504 0.69165H89.3621L88.3984 1.87034H31.2607L30.2969 0.69165H3.15531L0.411377 4.59883L2.1977 6.49007L18.6275 6.46632V6.46335Z" fill="#535E77"/>
                                        </svg>
                                        <svg width="21" height="104" viewBox="0 0 21 104" fill="none" xmlns="http://www.w3.org/2000/svg" style={{position: 'absolute', top: '0px', left: '0px'}}>
                                            <path d="M2.52427 37.0634L3.62 38.5717L3.64455 38.6043V38.6459C3.64762 43.5596 3.65069 47.9418 3.65069 51.7925C3.65069 55.6433 3.65069 60.0255 3.64762 64.9392V64.9808L3.62307 65.0134L2.52733 66.5217L2.50585 84.0861L3.60772 84.8165L3.66297 84.8551V84.9264L3.67525 94.1391L10.489 100.564H20.2739H20.5164L20.3721 100.769L18.6963 103.138L18.6595 103.192H6.49284L6.44373 103.189L6.40997 103.156L0.280623 97.4436L0.240723 97.405V6.18008L0.280623 6.14148L6.40997 0.435103L6.44373 0.402444H6.49284L18.595 0.399475H18.6595L18.6963 0.452917L20.3721 2.82216L20.5164 3.02702H10.486L3.67218 9.4519L3.6599 18.6646V18.7359L3.60158 18.7745L2.49971 19.5049L2.5212 37.0694L2.52427 37.0634Z" fill="#535E77"/>
                                        </svg> */}




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