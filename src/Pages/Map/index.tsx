import React, { useEffect, useRef, useState } from 'react';
import { Container, Row, Col } from 'reactstrap';
import { createSelector } from 'reselect';
import { useDispatch, useSelector } from 'react-redux';
import * as Leaflet from 'leaflet';
import { getGeoFences, getAllFleet, getAllEvents } from 'slices/thunk';
import Breadcrumb from "Components/Common/Breadcrumb";
import { ExtendedMarker } from './leaflet-extensions';
import _ from 'lodash';
import dayjs from "dayjs";
import { standbyTruck, delayTruck, downTruck, activeTruck, standbyExcavator, delayExcavator, downExcavator, activeExcavator } from 'assets/images/map';
import { Radio, Segmented } from 'antd';
import mapboxgl, { LngLatLike, Marker } from 'mapbox-gl'; // eslint-disable-line import/no-webpack-loader-syntax
import { shiftTimings } from 'utils/common';

interface EquipmentLocation {
    id: string;
    name: string;
    color: string;
    status: string;
    position: LngLatLike;
    vehicleType: string;
}

interface MarkerData {
    id: string;
    marker: Marker;
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
        position: [120.44974338024406, -29.160331938574046]
    },
    {
        id: "DT102",
        name: "DT102",
        status: "ACTIVE",
        color: "#009D10",
        vehicleType: "DUMP_TRUCK",
        position: [120.44899479387436, -29.15837078907635]
    },
    {
        id: "DT103",
        name: "DT103",
        status: "ACTIVE",
        color: "#009D10",
        vehicleType: "DUMP_TRUCK",
        position: [120.44783936708842, -29.156594353219155]
    },
    {
        id: "DT104",
        name: "DT104",
        status: "ACTIVE",
        color: "#009D10",
        vehicleType: "DUMP_TRUCK",
        position: [120.44871814239025, -29.1576602184213]
    },
    {
        id: "DT105",
        name: "DT105",
        status: "ACTIVE",
        color: "#009D10",
        vehicleType: "DUMP_TRUCK",
        position: [120.44783936708842, -29.156594353219155]
    },
    {
        id: "DT106",
        name: "DT106",
        status: "STANDBY",
        color: "#F08B00",
        vehicleType: "DUMP_TRUCK",
        position: [120.44678158200134, -29.1540788674843]
    },
    {
        id: "DT121",
        name: "DT121",
        status: "ACTIVE",
        color: "#009D10",
        vehicleType: "DUMP_TRUCK",
        position: [120.44697686540144, -29.15389411186601]
    },
    {
        id: "DT122",
        name: "DT122",
        status: "ACTIVE",
        color: "#009D10",
        vehicleType: "DUMP_TRUCK",
        position: [120.44743252666956, -29.155798499987924]
    },
    {
        id: "DT123",
        name: "DT123",
        status: "DELAY",
        color: "#BC00FF",
        vehicleType: "DUMP_TRUCK",
        position: [120.44743252666956, -29.155798499987924]
    },
    {
        id: "EX201",
        name: "EX201",
        status: "ACTIVE",
        color: "#009D10",
        vehicleType: "EXCAVATOR",
        position: [
            120.44463458272295,
            -29.146790943732764
        ]
    },
    {
        id: "EX202",
        name: "EX202",
        status: "ACTIVE",
        color: "#009D10",
        vehicleType: "EXCAVATOR",
        position: [
            120.44506272943079,
            -29.147310837480894
        ]
    },
    {
        id: "EX205",
        name: "EX205",
        status: "DELAY",
        color: "#BC00FF",
        vehicleType: "EXCAVATOR",
        position: [
            120.44516509787695,
            -29.147993875066938
        ]
    }
]

const Map = ({ socket }) => {

    document.title = "Real-time positioning | FMS Live";

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

    const fleetProperties = createSelector(
        (state: any) => state.Fleet,
        (fleetState) => ({
            fleet: _.groupBy(fleetState.data, 'id')
        })
    );

    const eventsProperties = createSelector(
        (state: any) => state.Events,
        (eventsState) => ({
            events: eventsState.data
        })
    );

    const { events } = useSelector(eventsProperties);


    socket.on("TRACKER_LOCATION", data => {
        console.log(data);
        // updateMarkerPosition(data.id, data.position);
    });

    const { geofenceFromDB } = useSelector(geoFenceProperties);
    const { fleet } = useSelector(fleetProperties);
    const { benches } = useSelector(benchesProperties);
    const [filter, setFilter] = useState<string>('All Equipment');

    const [markers, setMarkers] = useState<MarkerData[]>([]);
    var [geofences, setGeofences] = useState<any[]>([]);

    const mapContainer = useRef(null);
    const mapRef = useRef<any>(null);
    const [lng, setLng] = useState(120.44871814239025);
    const [lat, setLat] = useState(-29.1576602184213);
    const [zoom, setZoom] = useState(18);

    // const mapRef = useRef<Leaflet.Map | null>(null);
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



        const isNotActive: boolean = eq.status.toLowerCase() != 'ACTIVE';
        const standardIconTemplate = `<div style="${textStyle}">${eq.name}</div>
            <div id="imageContainer" style="position: absolute;bottom: 5px;transform: translateX(-40%); z-index:1;">
              <img src="${getEquipmentStatusIcon(eq)}" alt="Description of the image">
            </div>`

        const icon = document.createElement('div');
        icon.innerHTML = standardIconTemplate//isNotActive ? `${standardIconTemplate}<div class="ripple" style="${rippleStyles}"></div>` : standardIconTemplate
        // const icon = Leaflet.divIcon({
        //     className: 'marker',
        //     html: isNotActive ? `${standardIconTemplate}<div class="ripple" style="${rippleStyles}"></div>` : standardIconTemplate,
        // });
        return icon
    }

    const getEquipmentStatusIcon = (eq: EquipmentLocation) => {
        if (eq.vehicleType == 'EXCAVATOR') {
            switch (eq.status) {
                case 'ACTIVE':
                    return activeExcavator;
                case 'STANDBY':
                    return standbyExcavator;
                case 'DOWN':
                    return downExcavator;
                case 'DELAY':
                    return delayExcavator;
            }

        } else if (eq.vehicleType == 'DUMP_TRUCK') {
            switch (eq.status) {
                case 'ACTIVE':
                    return activeTruck;
                case 'STANDBY':
                    return standbyTruck;
                case 'DOWN':
                    return downTruck;
                case 'DELAY':
                    return delayTruck;
            }
        }
    }

    // Function to update marker position
    // const updateMarkerPosition = (markerId: string, newPosition: Leaflet.LatLngExpression, duration: number = 1000) => {
    //     setMarkers(prevMarkers =>
    //         prevMarkers.map(markerData => {
    //             if (markerData.id === markerId) {
    //                 markerData.marker.slideTo(newPosition, { duration });
    //             }
    //             return markerData;
    //         })
    //     );
    // };

    useEffect(() => {

        mapboxgl.accessToken = 'pk.eyJ1IjoiaG1lc3VwcG9ydCIsImEiOiJjbHp1eTRibDAwMG05MmpvczE1ZHdham5qIn0.ZoE3pSipzwdf-0TkY3ezzw';

        if (mapRef.current) return; // initialize map only once

        mapRef.current = new mapboxgl.Map({
            container: mapContainer.current!,
            style: 'mapbox://styles/hmesupport/cm00qombw008z01oe8pcf6j2m',
            center: [lng, lat],
            zoom: zoom,
            pitch: 75,
            minZoom: 15
        });

        addMarkers();

        // if (!mapRef.current) {
        //     mapRef.current = Leaflet.map('map', {
        //         center: origin,
        //         zoom: 18,
        //         attributionControl: true,
        //         zoomControl: false,
        //     });

        //     Leaflet.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(mapRef.current);
        //     mapRef.current.addLayer(drawItems);

        //     Leaflet.control.zoom({
        //         position: 'bottomright'
        //     }).addTo(mapRef.current);

        //     addMarkers();
        // }
    }, []);

    useEffect(() => {
        dispatch(getGeoFences());
        dispatch(getAllFleet());

        const { shift, shiftDate } = shiftTimings();
        dispatch(getAllEvents(shiftDate + ':' + shift));
    }, [dispatch]);

    useEffect(() => {
        geofences = [];
        geofenceFromDB.forEach((json) => {
            drawFeature(json);
        })
    }, [geofenceFromDB]);

    const clearMarkers = () => {
        markers.map(item => {
            // mapRef.current?.removeLayer(item.marker)
            item.marker.remove()
        })
        setMarkers([]);
    }

    useEffect(() => {
        clearMarkers();
        const markersData: MarkerData[] = [];
        let filteredEquipment: EquipmentLocation[] = []
        if (filter == 'All Equipment') {
            filteredEquipment = equipments
        } else {
            filteredEquipment = equipments.filter(item => item.vehicleType == filter)
        }
        filteredEquipment.map(eq => {
            // const marker = new ExtendedMarker(eq.position as Leaflet.LatLngExpression, { icon: rippleIcon(eq) }).addTo(mapRef.current!)
            // const el = document.createElement('div');
            // el.className = 'activemarker';
            const el = rippleIcon(eq)
            const marker = new mapboxgl.Marker(el).setLngLat(eq.position).addTo(mapRef.current);
            markersData.push({ id: eq['name'], marker: marker })
        })
        // markersLayer.
        setMarkers(markersData);
    }, [filter]);

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

    const getFleetData = (truckId) => {
        return fleet[truckId] && fleet[truckId].length > 0 ? fleet[truckId][0] : {};
    }
    const getColorByState = (state) => {

        let color = "#008000";
        switch (state) {
            case "ACTIVE":
                color = "#008000";
                break;
            case "DELAY":
                color = "#FFBF00";
                break;
            case "STANDBY":
                color = "#FFBF00";
                break;
            case "DOWN":
                color = "#FF5733";
                break;
            default:
                break;
        }
        return color;
    }

    const addMarkers = () => {
        const markersData: MarkerData[] = [];

        // const eventsByTruck = _.groupBy(events, 'truckId');

        // var latestEvents = {};
        // Object.keys(eventsByTruck).forEach((key) => {
        //     eventsByTruck[key].forEach(event => {
        //         const truckId = event.truckId; // Extract truckId
        //         const eventStartTime = event.event.startTime; // Extract startTime

        //         // If no event exists for the truck or if this event's startTime is later
        //         if (!latestEvents[truckId] || eventStartTime > latestEvents[truckId].event.startTime) {
        //             latestEvents[truckId] = event; // Update to latest event
        //         }
        //     });
        // })

        // Object.values(latestEvents).forEach((eq: any) => {
        //     console.log(eq);
        //     let equip = getFleetData(eq['truckId']);
        //     let eqData = {
        //         color: getColorByState(eq['event']['state']),
        //         status: eq['event']['state'],
        //         name: eq['truck']['name']
        //     }
        //     const marker = new ExtendedMarker([eq.event.lat, eq.event.lng] as Leaflet.LatLngExpression, { icon: rippleIcon(eqData) }).addTo(mapRef.current!)
        //     markersData.push({ id: equip['name'], marker: marker })
        // })

    }

    return (
        <React.Fragment>
            <div className="page-content">
                <Container fluid>
                    <Breadcrumb title="Dashboards" breadcrumbItem="Real-time Positioning" />
                    <Row>
                        <Col md="12" className='mb-4 d-flex flex-row-reverse'>
                            <Segmented className="customSegmentLabel customSegmentBackground" value={filter} onChange={(e) => setFilter(e)} options={['All Equipment', { label: 'Excavators', value: 'EXCAVATOR' }, { label: 'Trucks', value: 'DUMP_TRUCK' }, { label: 'Loaders', value: 'LOADER', disabled: true }, { label: 'Drillers', value: 'Drillers', disabled: true }, { label: 'Dozers', value: 'Dozers', disabled: true }]} />
                        </Col>
                        <Col md="12">
                            <div id="map" ref={mapContainer} className="map-container" style={{ height: '80vh', width: '100%' }}></div>
                        </Col>
                    </Row>
                </Container>
            </div>
        </React.Fragment>
    );
}

export default Map;