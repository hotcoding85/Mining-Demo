// import { Map, Source, MapPicker } from 'map33'
import {Source, Map, MapPicker}  from './modules/Source'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Button, Card, CardBody, Col, Container, Form, FormFeedback, Input, Label, Modal, ModalBody, ModalHeader, Row } from 'reactstrap';
import Breadcrumb from 'Components/Common/Breadcrumb';
import { useDispatch } from 'react-redux';
import './index.css'
import mapboxgl from 'mapbox-gl';
import {WindowResize} from './modules/WindowResize'
import {InfiniteGridHelper} from './modules/InfiniteGridHelper'
import {
    Scene,
    PerspectiveCamera,
    Vector3,
    WebGLRenderer,
    PCFSoftShadowMap,
    ACESFilmicToneMapping,
    Color,
    FogExp2,
    LineSegments,
    BoxGeometry,
    LinearEncoding,
    AmbientLight,
    DirectionalLight,
    AxesHelper,
    Object3D,
    EdgesGeometry,
    LineBasicMaterial
} from "three";
import { MapControls } from 'three/examples/jsm/controls/OrbitControls';

declare global {
    interface Window {
      map: any;
      mapPicker: any;
      controls: any
    }
}
export const ThreeJS = () => {
    const dispatch: any = useDispatch();

    const mapContainer = useRef<HTMLDivElement | null>(null);
    mapboxgl.accessToken = process.env.MAPBOX_API_KEY || 'pk.eyJ1IjoibXlreXRhcyIsImEiOiJjbTA1MGhtb3YwY3Y0Mm5uY3FzYWExdm93In0.cSDrE0Lq4_PitPdGnEV_6w';
    const [lng, setLng] = useState(120.45114);
    const [lat, setLat] = useState(-29.15559);

    
    useEffect(() => {
        const scene = new Scene();
        const camera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1e6);
    
        camera.up = new Vector3(0, 0, 1);
        camera.position.set(0, -1000, 700);
        camera.updateMatrixWorld();
        camera.updateProjectionMatrix();
    
        const renderer = new WebGLRenderer({
          antialias: true,
          alpha: true,
          logarithmicDepthBuffer: false,
        });
    
        if (mapContainer.current) {
            renderer.domElement.className = "threejs-view"
            mapContainer.current.appendChild(renderer.domElement);
        }
    
        // Renderer Settings
        renderer.outputEncoding = LinearEncoding;
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = PCFSoftShadowMap;
        renderer.setSize(window.innerWidth, window.innerHeight);
    
        // Performance Stats
    
        // Controls
        const controls = new MapControls(camera, renderer.domElement);
        controls.autoRotate = false
        controls.maxPolarAngle = Math.PI * 0.3
        window.controls = controls
    
        // Axes Helper
        const axesHelper = new AxesHelper(2000);
        // scene.add(axesHelper);
    
        // Scene Background and Fog
        scene.background = new Color(0x91abb5);
        scene.fog = new FogExp2(0x91abb5, 0.0000001);
    
        // Lighting
        const ambientLight = new AmbientLight(0x404040, 2.5); // Soft white light
        const dirLight = new DirectionalLight(0xffffff, 3.5);
        dirLight.castShadow = true;
        dirLight.position.set(10000, 10000, 10000);
        scene.add(ambientLight);
        scene.add(dirLight);
    
    
        // Source and Map (assuming your map source is defined)
        const position = [lat, lng];
        // const position = [46.5763, 7.9904];
        const source = new Source('mapbox', mapboxgl.accessToken); // Assuming you have a valid token
        let nTiles = 3;
        let zoom = 14
        const map = new Map(scene, camera, source, position, nTiles, zoom);
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
        // Clean up on component unmount
        
        return () => {
            renderer.dispose();
        };

      }, []);


    return (
        <>
            <div ref={mapContainer} style={{ width: '100%', height: '100%' }} />
        </>
    )
}