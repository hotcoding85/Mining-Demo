import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Button, Card, CardBody, Col, Container, Row } from 'reactstrap';
import Breadcrumb from 'Components/Common/Breadcrumb';
import { useDispatch, useSelector } from 'react-redux';
import { Input, Layout, List, Modal, Typography } from 'antd';
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
const { Title, Text } = Typography;

const NetworkMonitoring = (props: any) => {
    document.title = "Network Monitoring | FMS Live";

    const mapContainer = useRef<any>(null);
    const dispatch: any = useDispatch();
    const [isLoading, setIsLoading] = useState<boolean>(true)
    const initialTrailers = [
        { name: 'Antenna', id: 'antenna', dataRate: '10 Mbps', avatar:  ANTENNA},
        { name: 'Solar Trailer', id: 'solor-trailer', dataRate: '8 Mbps', avatar: SOLOR_TRAILER },
        { name: 'Solar Unit', id: 'solor-unit', dataRate: '12 Mbps', avatar: SOLOR_UNIT },
        { name: 'Survey Marker', id: 'survey-marker', dataRate: '5 Mbps', avatar: SURVEY_MARKER },
    ];

    const { layoutModeType } = useSelector(LayoutSelector);
    const isLight = layoutModeType === LAYOUT_MODE_TYPES.LIGHT;
    const tooltipRef = useRef<HTMLDivElement | null>(null);

    const [trailers, setTrailers] = useState(initialTrailers);

    const [selectedId, setSelectedId] = useState(null);

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
    const removeBtnsRef = useRef<any[]>([])
    let tooltip = document.createElement('div');

    useEffect(() => {
        // Array of models to load
        const models = [
            {
                mtl: "/network-mornitoring/antenna/antenna.mtl",
                obj: "/network-mornitoring/antenna/antenna.obj",
                position: new THREE.Vector3(0, 0, 280), // Adjust position for this model
                scale: new THREE.Vector3(100, 100, 100),
                rotation: new THREE.Euler(Math.PI / 2, Math.PI / 2, 0), // Adjust rotation for this model
                id: 'antenna'
            },
            // Add other models here
            {
                mtl: "/network-mornitoring/solor-trailer/solor-trailer.mtl",
                obj: "/network-mornitoring/solor-trailer/solor-trailer.obj",
                position: new THREE.Vector3(100, 0, 180), // Adjust position
                scale: new THREE.Vector3(80, 80, 80),
                rotation: new THREE.Euler(Math.PI / 2, Math.PI / 2, 0), // Adjust rotation
                id: 'solor-trailer'
            },
            {
                mtl: "/network-mornitoring/solor-unit/solor-unit.mtl",
                obj: "/network-mornitoring/solor-unit/solor-unit.obj",
                position: new THREE.Vector3(-100, 100, 210), // Adjust position
                scale: new THREE.Vector3(80, 80, 80),
                rotation: new THREE.Euler(Math.PI / 2, Math.PI / 2, 0), // Adjust rotation
                id: 'solor-unit'
            },
            {
                mtl: "/network-mornitoring/survey-marker/survey-marker.mtl",
                obj: "/network-mornitoring/survey-marker/survey-marker.obj",
                position: new THREE.Vector3(-100, 0, 260), // Adjust position
                scale: new THREE.Vector3(70, 70, 70),
                rotation: new THREE.Euler(Math.PI / 2, Math.PI / 2, 0), // Adjust rotation
                id: 'survey-marker'
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

                            const objLoader = new OBJLoader();
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
    }, [])

    useEffect(() => {
        if (isLoading || !window.map) return
        modelsRef.current.forEach((model: any) => {
            if (model) {
                model.object.visible = true; // Set model to visible
                model.object.userData = {isEquipment: true, type: currentEquipmentType.current}
                window.map.scene.add(model.object); // Add to scene
            }
        });
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
                        selectedOffsetRef.current = 100;
                        break
                    case 'solor-trailer':
                        selectedOffsetRef.current = 0;
                        break
                    case 'solor-unit':
                        selectedOffsetRef.current = 30;
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

    const onDocumentMouseClick = useCallback((event) => {
        if (mapContainer.current && window.map && !selectedModelRef.current) {
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
                    setEquipments((prev: any) => [
                        ...prev,
                        {
                            lng: coord.longitude,
                            lat: coord.latitude,
                            object: copyModel,
                            offset: selectedOffsetRef.current,
                            type: currentEquipmentType.current,
                            id: Date.now()
                        }
                    ]);
                },
            });
        }
    }, [])
    useEffect(() => {
        if (!window.map || isLoading) return;
        const center = {
            tileX: window.map.center.x,
            tileY: window.map.center.y
        }
        equipmentsRef.current = equipments
        removeBtnsRef.current.forEach((removeButton: any) => {
            window.map.scene.remove(removeButton);
        });
        removeBtnsRef.current = []
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
            eq.object.position.set(worldPos.x, worldPos.y, elevationValue)
            // eq.object.userData = {isEquipment: true, type: currentEquipmentType.current}
            // Create an "X" remove button using a sprite
            const removeButtonTexture = new THREE.TextureLoader().load(XBUTTON); // Add your "X" icon path here
            const removeButtonMaterial = new THREE.SpriteMaterial({ map: removeButtonTexture, depthTest: false, transparent: true });
            const removeButtonSprite = new THREE.Sprite(removeButtonMaterial);

            // Position the remove button above the model
            removeButtonSprite.position.set(worldPos.x, worldPos.y, elevationValue + 30); // Adjust 10 to position the button
            removeButtonSprite.userData = {isRemove: true, id: eq.id}
            removeButtonSprite.scale.set(10, 10, 5); // Adjust the scale to make the button a suitable size
            removeBtnsRef.current.push(removeButtonSprite)
            // Add both model and button to the scene
            window.map.scene.add(eq.object);
            window.map.scene.add(removeButtonSprite);
        })
    }, [equipments])
    const [hovered, setHovered] = useState(false);
    const onDocumentMouseMove = useCallback(
        ((event) => {
            if (window.map && !selectedModelRef.current) {
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
                        tooltip.innerHTML = `
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
                                </tr>
                                <tr>
                                    <td style="padding: 4px;">[${eq.lng || 'N/A'},</td>
                                    <td style="padding: 4px;">${eq.lat || 'N/A'}]</td>
                                </tr>
                                <!-- Add more rows as needed -->
                            </table>
                        `;
                
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
                    return userData && userData.isRemove;
                });
            
                // If there is exactly one valid intersect, change the cursor to 'pointer'
                if (validIntersects.length >= 1) {
                    document.body.style.cursor = 'pointer';
                } else {
                    document.body.style.cursor = 'auto'; // Default cursor style
                }
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

    return (
        <React.Fragment>
        <div className="page-content" style={{paddingBottom: '1rem'}}>
            <Container fluid>
            <Breadcrumb title="Home" breadcrumbItem="Network Monitoring" />
            <Row>
                <DndProvider backend={HTML5Backend}>
                    <Col md={9} sm={8} xs={12}>
                        <THREEJSMap ref={mapContainer} height='calc(100vh - 170px)' defaultLayers={[]} isLoading={isLoading} setIsLoading={setIsLoading} onDocumentMouseClick={onDocumentMouseClick} onDocumentMouseMove={onDocumentMouseMove} isPitView={true}>
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
                        </THREEJSMap>
                    </Col>
                    <Col md={3} sm={4} xs={12}>
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
                    </Col>
                </DndProvider>
            </Row>
            </Container>
        </div>

        
        </React.Fragment >
    );
}

export default NetworkMonitoring;
