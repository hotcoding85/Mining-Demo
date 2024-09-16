import {Source, Map, MapPicker}  from './modules/Source'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Button, Card, CardBody, Col, Container, Form, FormFeedback, Input, Label, Modal, ModalBody, ModalHeader, Row } from 'reactstrap';
import Breadcrumb from 'Components/Common/Breadcrumb';
import { useDispatch } from 'react-redux';
import './index.css'
import mapboxgl from 'mapbox-gl';
import {WindowResize} from './modules/WindowResize'
import * as turf from '@turf/turf';
import {InfiniteGridHelper} from './modules/InfiniteGridHelper'
import * as THREE from "three";
import { MapControls } from 'three/examples/jsm/controls/OrbitControls';
import _ from 'lodash';
import { Progress, Spin } from 'antd';
import 'antd/dist/reset.css';

declare global {
    interface Window {
      map: any;
      mapPicker: any;
      controls: any
    }
}
export const ThreeJS = () => {
    const dispatch: any = useDispatch();

    document.title = "Trackers | FMS Live";

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

    useEffect(() => {
        let animationFrameId: number;
        let initializedMap = false;
    
        const initializeMap = () => {
            setIsLoading(true);
    
            fetch('./240817_Pits_3D_WGS84.geojson')
                .then(response => response.json())
                .then((_geojsonData: turf.AllGeoJSON) => {
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
    
                    scene.background = new THREE.Color(0x91abb5);
                    scene.fog = new THREE.FogExp2(0x91abb5, 0.0000001);
    
                    const ambientLight = new THREE.AmbientLight(0x404040, 2);
                    const dirLight = new THREE.DirectionalLight(0xffffff, 1.5);
                    dirLight.castShadow = true;
                    dirLight.position.set(10000, 10000, 10000);
                    scene.add(ambientLight);
                    scene.add(dirLight);
    
                    const position = [lat, lng];
                    const source = new Source('mapbox', mapboxgl.accessToken);
                    let nTiles = 4;
                    let zoom = 18;
    
                    const map = new Map(scene, camera, source, position, nTiles, zoom, {}, geojsonData.current);
                    window.map = map;
                    const mapPicker = new MapPicker(camera, map, mapContainer.current, controls);
                    window.mapPicker = mapPicker;

                    // CubeCamera for reflections
                    const cubeRenderTarget = new THREE.WebGLCubeRenderTarget(256, {
                        format: THREE.RGBFormat,
                        generateMipmaps: true,
                        minFilter: THREE.LinearMipmapLinearFilter,
                    });
                    const cubeCamera = new THREE.CubeCamera(1, 10000, cubeRenderTarget);
                    cubeCamera.position.set(500, -1000, 700); // Adjust position as needed
                    scene.add(cubeCamera);

                    // Reflective material using CubeCamera's texture
                    const reflectiveMaterial = new THREE.MeshStandardMaterial({
                        envMap: cubeRenderTarget.texture,
                        metalness: 1.0,
                        roughness: 0,
                    });
            
                    // Add a reflective sphere using the reflective material
                    const reflectiveSphere = new THREE.Mesh(new THREE.SphereGeometry(50, 32, 32), reflectiveMaterial);
                    reflectiveSphere.position.set(100, 100, 100); // Adjust position as needed
                    scene.add(reflectiveSphere);
                    
                    setProgress(50)
    
                    const grid: any = new InfiniteGridHelper(50, 300);
                    scene.add(grid);
    
                    // Main render loop
                    const mainLoop = (timestamp: number) => {
                        animationFrameId = requestAnimationFrame(mainLoop);
                        if (map.progress >= nTiles * nTiles) {
                            setIsLoading(false);
                        } else {
                            setProgress((prev) => (Math.min(Math.floor(map.progress / (nTiles * nTiles) * 50), 50)) + 50);
                        }
    
                        renderer.render(scene, camera);
                        controls.update();
                    };
                    mainLoop(0);
    
                    WindowResize(renderer, camera);
    
                    initializedMap = true;
                })
                .catch(error => console.error('Error loading GeoJSON data:', error));
        };
    
        if (!initializedMap) {
            initializeMap();
        }
    
        // Clean up on component unmount
        return () => {
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
    


    return (
        <>
            <React.Fragment>
                <div className="page-content">
                    <Container fluid>
                    <Breadcrumb title="Home" breadcrumbItem="ThreeJS View" />
                    <Row>
                        <Col lg="12">
                        <Card className='threejs-view-card-header'>
                            <CardBody className='threejs-view-body'>
                                {isLoading ? (
                                    <>
                                        <div className="loading-overlay" style={{top: "calc(50vh - 130px)", position: 'absolute', width: 'calc(100% - 20px)', height: '100%', left: '10px'}}>
                                            <Spin className='map-loading-bar' style={{color: 'gold'}} tip="Loading...">
                                                <Progress className='map-loading-progress-bar' percent={progress} status="active" />
                                            </Spin>
                                        </div>
                                    </>
                                    ) : (
                                        <></>
                                    )}
                                <div ref={mapContainer} style={{ width: '100%', height: '100%', opacity: isLoading ? '0.05' : '1'}} />
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