import { Source, Map, MapPicker } from './modules/Source'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Button, Card, CardBody, Col, Container, Form, FormFeedback, Input, Label, Modal, ModalBody, ModalHeader, Row } from 'reactstrap';
import Breadcrumb from 'Components/Common/Breadcrumb';
import { useDispatch } from 'react-redux';
import './index.css'
import mapboxgl from 'mapbox-gl';
import { WindowResize } from './modules/WindowResize'
import * as turf from '@turf/turf';
import { InfiniteGridHelper } from './modules/InfiniteGridHelper'
import * as THREE from "three";
import { MapControls } from 'three/examples/jsm/controls/OrbitControls';
import _ from 'lodash';
import { Unzip } from 'fflate';
import JSZip from '@turbowarp/jszip'

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
    // const geojsonData = useRef<any>();

    const fetchZipFile = async () => {
        const zipBuffer = await fetch('./240817_Pits_3D_WGS84.zip').then(response => response.arrayBuffer())
        JSZip.loadAsync(zipBuffer).then(data => {
            return data.file('240817_Pits_3D_WGS84.geojson')?.async("string");
        }).then((text) => {
            var geojsonData = JSON.parse(text as string)
            loadMapView(geojsonData)
        })
    }

    const loadMapView = (geojsonData: JSON) => {
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1e6);

        camera.up = new THREE.Vector3(0, 0, 1);
        camera.position.set(0, -1000, 700);
        camera.updateMatrixWorld();
        camera.updateProjectionMatrix();

        const renderer = new THREE.WebGLRenderer({
            antialias: true,
            alpha: true,
            logarithmicDepthBuffer: false,
        });

        if (mapContainer.current) {
            renderer.domElement.className = "threejs-view"
            mapContainer.current.appendChild(renderer.domElement);
        }

        // Renderer Settings
        // renderer.outputEncoding = LinearEncoding;
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        renderer.setSize(window.innerWidth, window.innerHeight);

        // Performance Stats

        // Controls
        const controls = new MapControls(camera, renderer.domElement);
        controls.autoRotate = false
        controls.maxPolarAngle = Math.PI * 0.3
        window.controls = controls

        // Axes Helper
        const axesHelper = new THREE.AxesHelper(2000);
        // scene.add(axesHelper);

        // Scene Background and Fog
        scene.background = new THREE.Color(0x91abb5);
        scene.fog = new THREE.FogExp2(0x91abb5, 0.0000001);

        // Lighting
        const ambientLight = new THREE.AmbientLight(0x404040, 2); // Soft white light
        const dirLight = new THREE.DirectionalLight(0xffffff, 1.5);
        dirLight.castShadow = true;
        dirLight.position.set(10000, 10000, 10000);
        scene.add(ambientLight);
        scene.add(dirLight);


        // Source and Map (assuming your map source is defined)
        const position = [lat, lng];
        // const position = [46.5763, 7.9904];
        const source = new Source('mapbox', mapboxgl.accessToken); // Assuming you have a valid token
        let nTiles = 28;
        let zoom = 18
        const map = new Map(scene, camera, source, position, nTiles, zoom, {}, geojsonData);
        window.map = map;
        const mapPicker = new MapPicker(camera, map, mapContainer.current, controls);
        window.mapPicker = mapPicker;

        const grid: any = new InfiniteGridHelper(50, 300);
        scene.add(grid);

        // Main render loop
        let count = 0;
        let animationFrameId = 0
        const mainLoop = (timestamp: number) => {
            animationFrameId = requestAnimationFrame(mainLoop);
            //   const delta = timestamp - lastTimestamp;
            //   lastTimestamp = timestamp;
            // count ++
            // if (count > 1000) cancelAnimationFrame(animationFrameId) 
            renderer.render(scene, camera);
            controls.update();
        };
        mainLoop(0)
        // Handle window resize
        WindowResize(renderer, camera);
    }

    useEffect(() => {
        fetchZipFile()
    }, [])

    return (
        <>
            <React.Fragment>
                <div className="page-content">
                    <Container fluid>
                        <Breadcrumb title="Home" breadcrumbItem="3D Pit View" />
                        <Row>
                            <Col lg="12">
                                <Card className='threejs-view-card-header'>
                                    <CardBody className='threejs-view-body'>
                                        {/* <div  style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }} ref={mapBoxContainer}> */}
                                        <div ref={mapContainer} style={{ width: '100%', height: '100%' }} />
                                        {/* </div> */}
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