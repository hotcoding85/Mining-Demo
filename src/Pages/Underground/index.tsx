import React, { useEffect, useRef, useState } from 'react';
import './index.css';
import Breadcrumb from "Components/Common/Breadcrumb";
import { Card, CardBody, Col, Container, Row, Spinner } from 'reactstrap';
import * as THREE from 'three';
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';
import { MapControls } from 'three/examples/jsm/controls/OrbitControls';
import JSZip from '@turbowarp/jszip';

declare global {
    interface Window {
        scene: any;
        camera: any;
        controls: any
    }
}

export const Underground = () => {
    const mountRef = useRef<HTMLDivElement>(null);
    const [loading, setLoading] = useState(true);

    const [annotations, setAnnotations] = useState([
        { position: new THREE.Vector3(2, 6, 3), text: "Annotation 1" },
        { position: new THREE.Vector3(-14, 2, 0), text: "Annotation 2" },
    ]);

    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    const [selectedPointInfo, setSelectedPointInfo] = useState<string | null>(null);

    const zoomToPoint = (point: THREE.Vector3, text: string) => {
        const startPosition = window.camera.position.clone();
        const targetPosition = point.clone().add(new THREE.Vector3(0, 2, 5)); // Zoom offset

        // Animate the camera movement
        const zoomDuration = 1000; // 1 second
        let startTime: number | null = null;

        const animateZoom = (time: number) => {
            if (startTime === null) startTime = time;
            const elapsed = time - startTime;
            const progress = Math.min(elapsed / zoomDuration, 1);

            window.camera.position.lerpVectors(startPosition, targetPosition, progress);
            window.controls.target.lerpVectors(startPosition, point, progress);
            window.controls.update();

            if (progress < 1) {
                requestAnimationFrame(animateZoom);
            } else {
                // Camera reached the point, display the info
                setSelectedPointInfo(`<h5>${text}</h5>Information about this point: ${point.x}, ${point.y}, ${point.z}`);
            }
        };

        requestAnimationFrame(animateZoom);
    };

    const onClick = (event: MouseEvent) => {
        if (!mountRef.current) return;

        const rect = mountRef.current.getBoundingClientRect();
        mouse.x = ((event.clientX - rect.left) / mountRef.current.clientWidth) * 2 - 1;
        mouse.y = -((event.clientY - rect.top) / mountRef.current.clientHeight) * 2 + 1;

        raycaster.setFromCamera(mouse, window.camera);

        const intersects = raycaster.intersectObjects(window.scene.children, true);
        if (intersects.length > 0) {
            const intersectedObject = intersects[0].object;
            if (intersectedObject.userData && intersectedObject.userData.isAnnotation) {
                const position = intersectedObject.position.clone();
                zoomToPoint(position, intersectedObject.userData.text);
            }
        }
    };

    const updateAnnotations = () => {
        annotations.forEach((annotation: any, index) => {
            const screenPosition = annotation.position.clone();
            screenPosition.project(window.camera); // Project to screen space
            
            const x = (screenPosition.x * 0.5 + 0.5) * window.innerWidth;
            const y = -(screenPosition.y * 0.5 - 0.5) * window.innerHeight;
            
            const annotationDiv = document.getElementById(`annotation-${index}`);
            if (annotationDiv) {
                annotationDiv.style.left = `${x}px`;
                annotationDiv.style.top = `${y}px`;
                annotationDiv.style.display = 'block'; // Show the annotation
            }
        });
    };

    useEffect(() => {
        if (!mountRef.current) return
        // Initialize the scene
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
        window.scene = scene;
        window.camera = camera
        mountRef.current.appendChild(renderer.domElement);
        
        // Add lights
        const directionalLight = new THREE.DirectionalLight(0xffffff, Math.PI * 2);
        directionalLight.position.set(3.3, 1.0, 4.4);
        directionalLight.castShadow = true;
        scene.add(directionalLight);
        
        const ambientLight = new THREE.AmbientLight(0x404040); // Soft white light
        scene.add(ambientLight);

        const textureLoader = new THREE.TextureLoader();

        // Load zipped model
        const loadModel = async () => {
            try {
                const mtlLoader = new MTLLoader();
                const materials = await new Promise<MTLLoader.MaterialCreator>((resolve, reject) => {
                    mtlLoader.load(
                        './model/model.mtl',
                        (materials) => resolve(materials),
                        undefined,
                        (error) => reject(error)
                    );
                });

                materials.preload();

                const response = await fetch('./model/model.zip');
                const arrayBuffer = await response.arrayBuffer();
                const zip = await JSZip.loadAsync(arrayBuffer);

                const objFile = await zip.file('model.obj')?.async("string");

                if (!objFile) {
                    throw new Error("OBJ file not found in the zip archive");
                }

                const object = new OBJLoader()
                    .setMaterials(materials)
                    .parse(objFile);

                object.traverse((child: any) => {
                    if (child.isMesh) {
                        child.material.needsUpdate = true;  // Ensure material is updated
                    }
                });

                object.position.set(2, 1, 2);
                scene.add(object);

                // Remove loading indicator
                setLoading(false);

                animate();
            } catch (error) {
                console.error('An error happened:', error);
                setLoading(false); // Make sure to remove the loading indicator even on error
            }
        };

        loadModel();
        // Ground Plane
        // const geometry = new THREE.CircleGeometry(10, 32);
        // const material = new THREE.MeshStandardMaterial();
        // const circle = new THREE.Mesh(geometry, material);
        // circle.rotation.x = -Math.PI / 2;
        // circle.receiveShadow = true;
        // scene.add(circle);

        // Axes Helper
        const axesHelper = new THREE.AxesHelper(5);
        scene.add(axesHelper);

        // Camera settings
        camera.position.set(4, 8, 10);

        // Orbit Controls Replacement
        let controls;
        controls = new MapControls(camera, renderer.domElement);
        controls.target.set(0, 1, 0);
        controls.update();
        window.controls = controls
        const sphereGeometry = new THREE.SphereGeometry(0.5, 48, 48);
        const sphereMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
        annotations.forEach(position => {
            const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
            sphere.position.copy(position.position);
            sphere.userData = { isAnnotation: true, text: position.text };
            scene.add(sphere);
        });

        mountRef.current.addEventListener('click', onClick);

        // Detect zoom changes and hide point info
        controls.addEventListener('change', () => {
            if (window.camera.position.distanceTo(new THREE.Vector3(0, 0, 0)) > 15) {
                setSelectedPointInfo(null);
            }
        });
        
        // Animation function
        const animate = () => {
            requestAnimationFrame(animate);
            if (controls) controls.update();
            renderer.render(scene, camera);

            // updateAnnotations(); // Update annotations
        };

        // Cleanup on unmount
        return () => {
            mountRef.current && mountRef.current.removeChild(renderer.domElement);
            mountRef.current && mountRef.current.removeEventListener('click', onClick);
        };
    }, []);

    return (
        <React.Fragment>
            <div className="page-content" style={{ height: '100vh' }}>
                <Container fluid style={{ height: '100%' }}>
                    <Breadcrumb title="Home" breadcrumbItem="Underground Map" />
                    <Row style={{ height: '100%' }}>
                        <Col lg="12" style={{ width: '100%', height: '100%' }}>
                            <Card style={{ height: '100%' }}>
                                <CardBody id="underground-map-body">
                                        <div className="loading-indicator loading-obj-file" style={{display: loading ? 'flex' : 'none', width: '100%', height: '100%', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'}}>
                                            <Spinner color="primary" /> Loading 3D model...
                                        </div>
                                        <div ref={mountRef} style={{ width: '100%', height: '100%' }} />
                                        {annotations.map((annotation: any, index) => (
                                            <div key={index} id={`annotation-${index}`} className="annotation">
                                                {annotation.text}
                                            </div>
                                        ))}

                                        {selectedPointInfo && (
                                            <div className="point-info" dangerouslySetInnerHTML={{ __html: selectedPointInfo }}>
                                            </div>
                                        )}
                                </CardBody>
                            </Card>
                        </Col>
                    </Row>
                </Container>
            </div>
        </React.Fragment>
    );
};

