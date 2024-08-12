import React, { useEffect, useRef, useState } from 'react';
import { Container, Button, Modal, ModalHeader, ModalBody, ModalFooter, Input, Row, Col, Card, CardBody, ListGroup, ListGroupItem, Label } from 'reactstrap';
import { createSelector } from 'reselect';
import { useDispatch, useSelector } from 'react-redux';
import * as Leaflet from 'leaflet';
import 'leaflet/dist/leaflet.css'; // Ensure Leaflet's CSS is loaded
import 'leaflet-draw/dist/leaflet.draw.css';
import 'leaflet-draw';
import { getGeoFences, addGeoFence, removeGeoFence, updateGeoFence, getAllBenches } from 'slices/thunk';
import { ExtendedMarker } from './leaflet-extensions';
import _ from 'lodash';
import Select from 'react-select';
import { standbyTruck } from 'assets/images/map';

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

// var geojsons: any[] = [
//     {
//         "id": "uyfygvkgub",
//         "name": "Polygon",
//         "geoJson": {
//             "type": "Feature",
//             "properties": {
//             },
//             "geometry": {
//                 "type": "Polygon",
//                 "coordinates": [
//                     [
//                         [
//                             -29.164788,
//                             120.404994
//                         ],
//                         [
//                             -29.143632,
//                             120.404994
//                         ],
//                         [
//                             -29.143632,
//                             120.431421
//                         ],
//                         [
//                             -29.164788,
//                             120.431421
//                         ],
//                         [
//                             -29.164788,
//                             120.404994
//                         ]
//                     ]
//                 ]
//             }
//         }
//     },
//     {
//         "id": "kgubuyfygv",
//         "name": "Circle",
//         "geoJson": {
//             "type": "Feature",
//             "properties": {
//                 "radius": 1803
//             },
//             "geometry": {
//                 "type": "Point",
//                 "coordinates": [
//                     -29.172268,
//                     120.465569
//                 ]
//             }
//         }
//     }
// ];

const MapGeofence = ({ socket }) => {

    document.title = "Geofences | FMS Live";
    const dispatch: any = useDispatch();
    const geoFenceProperties = createSelector(
        (state: any) => state.GeoFence,
        (geofenceState) => ({
            geofenceFromDB: geofenceState.data
        })
    );

    const benchesProperties = createSelector(
        (state: any) => state.Benches,
        (benchesState) => ({
            benches: benchesState.data
        })
    );

    socket.on("TRACKER_LOCATION", data => {
        console.log(data);
        updateMarkerPosition(data.id, data.position);
    });

    const { geofenceFromDB } = useSelector(geoFenceProperties);
    const { benches } = useSelector(benchesProperties);
    const [markers, setMarkers] = useState<MarkerData[]>([]);
    const [selectedFence, setSelectedFence]: any = useState({});
    var [geofences, setGeofences] = useState<any[]>([]);
    const [modal, setModal] = useState(false);
    const [newGeofenceName, setNewGeofenceName] = useState("");
    const [newSelectedBench, setNewSelectedBench] = useState("");

    const mapRef = useRef<Leaflet.Map | null>(null);
    const drawItems = new Leaflet.FeatureGroup();
    const origin: Leaflet.LatLngExpression = [-29.160331938574046, 120.44974338024406];

    var locations: any = {};
    locations = benches.map(option => {
        return { value: option.id, "label": option?.name }
    });

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
              <img src="${standbyTruck}" alt="Description of the image">
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
                attributionControl: true,
                zoomControl: false
            });

            Leaflet.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(mapRef.current);

            Leaflet.control.zoom({
                position: 'bottomright'
            }).addTo(mapRef.current);

            mapRef.current.addLayer(drawItems);
            const drawControl = new Leaflet.Control.Draw({
                edit: {
                    featureGroup: drawItems
                },
                draw: {
                    polyline: false,
                    circlemarker: false,
                    marker: false,
                    circle: false
                },
                position: 'topright'
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
                handleEditGeofence(event, event.propagatedFrom.id);
            });
        }

        addMarkers();
    }, []);

    useEffect(() => {
        dispatch(getGeoFences());
    }, [dispatch]);

    useEffect(() => {
        geofences = [];
        geofenceFromDB.forEach((json) => {
            drawFeature(json);
        })
    }, [geofenceFromDB]);

    const drawFeature = (geoFenceData: any) => {
        let layer;
        if (geoFenceData && geoFenceData.geoJson && geoFenceData.geoJson.properties && geoFenceData.geoJson.properties.radius) {
            layer = Leaflet.geoJson(geoFenceData.geoJson, {
                pointToLayer: function (feature, latlng) {
                    console.log('latlng', latlng);
                    return Leaflet.circle(latlng, { radius: geoFenceData.geoJson.properties.radius });
                }
            }).addTo(mapRef.current!);
            layer.id = geoFenceData.id;
            drawItems.addLayer(layer);
        } else {
            // layer = Leaflet.polygon(geoFenceData.geoJson.geometry.coordinates).addTo(mapRef.current!);
            layer = Leaflet.geoJson(geoFenceData.geoJson).addTo(mapRef.current!);
            layer.id = geoFenceData.id;
            //layer.bindPopup("Name of the GeoFence");
            drawItems.addLayer(layer);
        }
        geofences.push({ id: layer.id, layer: layer, name: geoFenceData.name, bench: { value: geoFenceData.locationId, label: (geoFenceData && geoFenceData.location) ? geoFenceData.location.name : '' } })
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
        // const markersData: MarkerData[] = [];
        // equipments.forEach(eq => {
        //     const marker = new ExtendedMarker(eq.position, { icon: rippleIcon(eq) }).addTo(mapRef.current!)
        //     markersData.push({ id: eq.id, marker: marker })
        // })
        // setMarkers(markersData);
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
        geofences[fenceIndex].bench = newSelectedBench;
        createGeofence(geofences[fenceIndex]);
        setGeofences([...geofences]);
        toggle();
        setNewGeofenceName("");
    };

    const handleCancel = () => {
        toggle();
        setNewGeofenceName("");
    };

    const handleEditGeofence = (event, id) => {
        const editGeofence = geofences.find(geofence => geofence.layer.id == id);
        if (editGeofence && !editGeofence.name) {
            setSelectedFence(editGeofence);
            setNewGeofenceName("");
            setNewSelectedBench("");
        } else {
            setSelectedFence(editGeofence);
            setNewGeofenceName(editGeofence.name);
            setNewSelectedBench(editGeofence.bench);
        }
        toggle();
    }
    const handleDeleteGeofence = (event, id) => {
        event.stopPropagation();
        if (mapRef.current) {
            const deletedGeofence = geofences.find(geofence => geofence.layer.id == id);
            if (deletedGeofence) {
                mapRef.current.removeLayer(deletedGeofence.layer!);
            }
        }
        dispatch(removeGeoFence(id));
        geofences = geofences.filter(geofence => geofence.layer.id !== id);
        setGeofences([...geofences])
    };

    const createGeofence = (geoFence) => {
        var geojson = {};
        if (geoFence.type === 'circle') {
            geojson = (geoFence.layer as Leaflet.Circle<any>).toGeoJSON();
            geojson['properties']['radius'] = (geoFence.layer as Leaflet.Circle<any>).getRadius();
        } else {
            geojson = (geoFence.layer as Leaflet.Circle<any>).toGeoJSON();
        }
        var geoFenceSave = {
            name: geoFence.name,
            geoJson: geojson,
            locationId: geoFence.bench ? geoFence.bench.value : ""
        };
        if (geoFence.id) {
            // geoFenceSave['id'] = geoFence.id;
            dispatch(updateGeoFence(geoFence.id, geoFenceSave));
        } else {
            dispatch(addGeoFence(geoFenceSave));
        }
        // console.log('createGeofence', geoFenceSave);
    }
    const onChange = (op) => {
        setNewSelectedBench(op);
    }

    const getBenchName = () => {
        return newSelectedBench;
    }

    return (
        <React.Fragment>
            <div className="page-content">
                <Container fluid>
                    <Row>
                        <Col md="8">
                            <div id="map" style={{ height: '80vh', width: '100%' }}></div>
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
                                                        <span >
                                                            <Button color="success" size="sm" onClick={(event) => handleEditGeofence(event, geofence.layer.id)}>Edit</Button>
                                                            <Button color="danger" size="sm" onClick={(event) => handleDeleteGeofence(event, geofence.layer.id)}>Delete</Button>
                                                        </span>
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
                    <Row>
                        <Col xs={5}>
                            <Label style={{ fontSize: '15px', verticalAlign: 'center', display: 'flex' }}>{"Fence Name"}</Label>
                        </Col>
                        <Col xs={5}>
                            <Input
                                type="text"
                                value={newGeofenceName}
                                onChange={(e) => setNewGeofenceName(e.target.value)}
                                placeholder="Enter geofence name"
                            />
                        </Col>
                    </Row>
                    <Row>
                        <Col xs={5}>
                            <Label style={{ fontSize: '15px', verticalAlign: 'center', display: 'flex' }}>{"Bench"}</Label>
                        </Col>
                        <Col xs={5}>
                            <Select
                                className="basic-single"
                                classNamePrefix="select"
                                defaultValue={getBenchName()}
                                value={getBenchName()}
                                isDisabled={false}
                                isLoading={false}
                                isClearable={true}
                                isRtl={false}
                                isSearchable={true}
                                name="Benches"
                                options={locations}
                                onChange={(selectedOption) => onChange(selectedOption)}
                            />
                        </Col>
                    </Row>
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