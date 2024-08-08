import React, { useEffect, useRef, useState } from 'react';
import { Container, Button, Modal, ModalHeader, ModalBody, ModalFooter, Input, Row, Col, Card, CardBody, ListGroup, ListGroupItem } from 'reactstrap';
import * as Leaflet from 'leaflet';
import 'leaflet/dist/leaflet.css'; // Ensure Leaflet's CSS is loaded
import 'leaflet-draw/dist/leaflet.draw.css';
import 'leaflet-draw';

import { ExtendedMarker } from './leaflet-extensions';
import { truckStandby } from 'assets/images/map';

interface EquipmentLocation {
    id: string;
    name: string;
    color: string;
    status: string;
    position: Leaflet.LatLngExpression;
    vehicleType: string;
}

interface MarkerData {
    id: string;
    marker: ExtendedMarker;
}

interface Geofence {
    id: number,
    name: string;
    layer: Leaflet.Layer | null;  // Make layer nullable
}

const equipments: EquipmentLocation[] = [
    {
        id: "DT101",
        name: "DT101",
        status: "ACTIVE",
        color: "#009D10",
        vehicleType: "DUMP_TRUCK",
        position: [-29.160331938574046, 120.44974338024406]
    },
    {
        id: "DT102",
        name: "DT102",
        status: "ACTIVE",
        color: "#009D10",
        vehicleType: "DUMP_TRUCK",
        position: [-29.15837078907635, 120.44899479387436]
    },
    {
        id: "DT103",
        name: "DT103",
        status: "ACTIVE",
        color: "#009D10",
        vehicleType: "DUMP_TRUCK",
        position: [-29.156594353219155, 120.44783936708842]
    },
    {
        id: "DT104",
        name: "DT104",
        status: "ACTIVE",
        color: "#009D10",
        vehicleType: "DUMP_TRUCK",
        position: [-29.1576602184213, 120.44871814239025]
    },
    {
        id: "DT105",
        name: "DT105",
        status: "ACTIVE",
        color: "#009D10",
        vehicleType: "DUMP_TRUCK",
        position: [-29.156594353219155, 120.44783936708842]
    },
    {
        id: "DT106",
        name: "DT106",
        status: "STANDBY",
        color: "#F08B00",
        vehicleType: "DUMP_TRUCK",
        position: [-29.1540788674843, 120.44678158200134]
    },
    {
        id: "DT121",
        name: "DT121",
        status: "ACTIVE",
        color: "#009D10",
        vehicleType: "DUMP_TRUCK",
        position: [-29.15389411186601, 120.44697686540144]
    },
    {
        id: "DT122",
        name: "DT122",
        status: "ACTIVE",
        color: "#009D10",
        vehicleType: "DUMP_TRUCK",
        position: [-29.155798499987924, 120.44743252666956]
    },
    {
        id: "DT123",
        name: "DT123",
        status: "DELAY",
        color: "#BC00FF",
        vehicleType: "DUMP_TRUCK",
        position: [-29.155798499987924, 120.44743252666956]
    },
    {
        id: "EX201",
        name: "EX201",
        status: "ACTIVE",
        color: "#009D10",
        vehicleType: "EXCAVATOR",
        position: [
            -29.15837078907635,
            120.44899479387436
        ]
    },
    {
        id: "EX202",
        name: "EX202",
        status: "ACTIVE",
        color: "#009D10",
        vehicleType: "EXCAVATOR",
        position: [
            -29.159081354815896,
            120.44951554960937
        ]
    },
    {
        id: "EX205",
        name: "EX205",
        status: "DELAY",
        color: "#BC00FF",
        vehicleType: "EXCAVATOR",
        position: [
            -29.15456207291446,
            120.44756271560425

        ]
    }
]

const geojsons: any[] = [
    {
        "type": "Feature",
        "properties": {
            "name": "Polygon"
        },
        "geometry": {
            "type": "Polygon",
            "coordinates": [
                [
                    [
                        -29.164788,
                        120.404994
                    ],
                    [
                        -29.143632,
                        120.404994
                    ],
                    [
                        -29.143632,
                        120.431421
                    ],
                    [
                        -29.164788,
                        120.431421
                    ],
                    [
                        -29.164788,
                        120.404994
                    ]
                ]
            ]
        }
    },
    {
        "type": "Feature",
        "properties": {
            "radius": 1803,
            "name": "Circle"
        },
        "geometry": {
            "type": "Point",
            "coordinates": [
                -29.172268,
                120.465569
            ]
        }
    }
]

const MapGeofence = () => {

    document.title = "Map | FMS Live";

    const [markers, setMarkers] = useState<MarkerData[]>([]);
    const [selectedFence, setSelectedFence]: any = useState({});
    const [geofences, setGeofences] = useState<any[]>([]);
    const [modal, setModal] = useState(false);
    const [newGeofenceName, setNewGeofenceName] = useState("");

    const mapRef = useRef<Leaflet.Map | null>(null);
    const drawItems = new Leaflet.FeatureGroup();
    const origin: Leaflet.LatLngExpression = [-29.160331938574046, 120.44974338024406];

    const rippleIcon = (eq) => {
        const rippleStyles = `
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            border-radius: 50%;
            width: 20px;
            height: 20px;
            background-color: ${eq.color};
            animation: ripple 1s infinite;`;

        const textStyle = `
            background-color: white;
            position: absolute;
            top: -96px;
            left: -46px;
            border: 4px solid ${eq.color};
            border-radius: 20px;
            font-size: 20px;
            color: ${eq.color};
            font-weight: 600;
            padding-left: 12px;
            padding-right: 12px;
            width: 100px;
            text-align: center;`;

        const isNotActive: boolean = eq.status.toLowerCase() != 'active';
        const standardIconTemplate = `<div style="${textStyle}">${eq.name}</div>
            <div id="imageContainer" style="position: absolute;bottom: 5px;transform: translateX(-40%); z-index:1;">
              <img src="${truckStandby}" alt="Description of the image">
            </div>`

        const icon = Leaflet.divIcon({
            className: 'marker',
            html: isNotActive ? `${standardIconTemplate}<div class="ripple" style="${rippleStyles}"></div>` : standardIconTemplate,
        });
        return icon
    }

    // Function to update marker position
    const updateMarkerPosition = (markerId: string, newPosition: Leaflet.LatLngExpression, duration: number = 1000) => {
        setMarkers(prevMarkers =>
            prevMarkers.map(markerData => {
                if (markerData.id === markerId) {
                    markerData.marker.slideTo(newPosition, { duration });
                }
                return markerData;
            })
        );
    };

    useEffect(() => {
        if (!mapRef.current) {
            mapRef.current = Leaflet.map('map', {
                center: origin,
                zoom: 13,
                attributionControl: false
            });

            Leaflet.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(mapRef.current);


            mapRef.current.addLayer(drawItems);
            const drawControl = new Leaflet.Control.Draw({
                edit: {
                    featureGroup: drawItems
                },
                draw: {
                    polyline: false,
                    circlemarker: false,
                    marker: false
                }
            });

            mapRef.current.addControl(drawControl);
            mapRef.current.tap?.enable();
            mapRef.current.on('draw:created', function (event: Leaflet.LeafletEvent) {
                let type = (event as Leaflet.DrawEvents.Created).layerType;
                let layer = (event as Leaflet.DrawEvents.Created).layer;
                updateGeoFences(type, layer);
                toggle();
                drawItems.addLayer(layer);
            });

            drawItems.on('click', function (event: Leaflet.LeafletEvent) {
                let layer = event.propagatedFrom;
                let geofence = geofences.find((fence) => fence.layer.id === layer.id);
                if (geofence && !geofence.name) {
                    setSelectedFence(geofence);
                } else {
                    setNewGeofenceName(geofence.name);
                }
                toggle();
            });

            geojsons.forEach((json) => {
                drawFeature(json);
            })
        }

        addMarkers();
    }, []);

    const drawFeature = (geojson: any) => {
        let layer;
        if (geojson.properties.radius) {
            console.log(geojson.geometry.coordinates);
            layer = Leaflet.circle(geojson.geometry.coordinates, { radius: geojson.properties.radius });
            layer.id = new Date();
            drawItems.addLayer(layer);
        } else {
            layer = Leaflet.polygon(geojson.geometry.coordinates).addTo(mapRef.current!);
            layer.id = new Date();
            drawItems.addLayer(layer);
        }
        geofences.push({ layer: layer, name: geojson.properties.name })
        setGeofences([...geofences]);
    }

    const updateGeoFences = (type: string, layer: any) => {
        layer.id = Date.now();
        let geofence = { layer: layer, type: type };
        geofences.push(geofence)
        setGeofences([...geofences]);
        setSelectedFence(geofence);
        console.log(geofence.layer.toGeoJSON());
    }

    const addMarkers = () => {
        const markersData: MarkerData[] = [];
        equipments.forEach(eq => {
            const marker = new ExtendedMarker(eq.position, { icon: rippleIcon(eq) }).addTo(mapRef.current!)
            markersData.push({ id: eq.id, marker: marker })
        })
        setMarkers(markersData);
    }

    const zoomToGeofence = (id) => {
        let geofence = geofences.find((fence) => fence.layer.id === id);
        mapRef.current?.fitBounds(geofence.layer.getBounds());
    }

    const toggle = () => setModal(!modal);

    const handleAddGeofence = () => {
        setNewGeofenceName("");
        toggle();
    };

    const handleSaveGeofence = () => {
        let fenceIndex = geofences.findIndex((fence) => fence.layer.id === selectedFence.layer.id);
        geofences[fenceIndex].name = newGeofenceName;
        setGeofences([...geofences]);
        toggle();
        setNewGeofenceName("");
    };

    const handleCancel = () => {
        toggle();
        setNewGeofenceName("");
    };

    const handleDeleteGeofence = (event, id) => {
        event.stopPropagation();
        if (mapRef.current) {
            const deletedGeofence = geofences.find(geofence => geofence.layer.id == id);
            if (deletedGeofence) {
                mapRef.current.removeLayer(deletedGeofence.layer!);
            }
        }

        setGeofences([...geofences.filter(geofence => geofence.layer.id !== id)]);
    };

    const createGeofence = () => {
        // if (type === 'circle') {
        //     geojson = (layer as Leaflet.Circle<any>).toGeoJSON();
        //     geojson.properties.radius = (layer as Leaflet.Circle<any>).getRadius();
        // } else {
        //     geojson = (layer as Leaflet.Circle<any>).toGeoJSON();
        // }
    }

    return (
        <React.Fragment>
            <div className="page-content">
                <Container fluid>
                    <Row>
                        <Col md="8">
                            <Card>
                                <CardBody>
                                    <div id="map" style={{ height: '80vh', width: '100%' }}></div>
                                </CardBody>
                            </Card>
                        </Col>
                        <Col md="4">
                            <Card>
                                <CardBody>
                                    <Row className="mb-3 d-flex justify-content-between">
                                        <Col xs="6">
                                            <h4>Geofences</h4>
                                        </Col>
                                        {/* <Col xs="6" className="d-flex justify-content-end">
                                            <Button color="primary" onClick={handleAddGeofence}>Add</Button>
                                        </Col> */}
                                    </Row>
                                    <ListGroup>
                                        {geofences.map(geofence => {
                                            if (geofence.name) {
                                                return (
                                                    <ListGroupItem key={geofence.layer.id} onClick={() => zoomToGeofence(geofence.layer.id)} className="d-flex justify-content-between align-items-center" style={{ 'cursor': 'pointer' }}>
                                                        {geofence.name}
                                                        <Button color="danger" size="sm" onClick={(event) => handleDeleteGeofence(event, geofence.layer.id)}>Delete</Button>
                                                    </ListGroupItem>
                                                )
                                            }
                                        })}
                                    </ListGroup>
                                </CardBody>
                            </Card>
                        </Col>
                    </Row>
                </Container>
            </div>

            <Modal isOpen={modal} toggle={toggle}>
                <ModalHeader toggle={toggle}>Add Geofence</ModalHeader>
                <ModalBody>
                    <Input
                        type="text"
                        value={newGeofenceName}
                        onChange={(e) => setNewGeofenceName(e.target.value)}
                        placeholder="Enter geofence name"
                    />
                </ModalBody>
                <ModalFooter>
                    <Button color="secondary" onClick={handleCancel}>Cancel</Button>
                    <Button color="primary" onClick={handleSaveGeofence}>Save</Button>
                </ModalFooter>
            </Modal>
        </React.Fragment>
    );
}

export default MapGeofence;
