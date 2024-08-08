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

const data = [
    {
        "status": "ACTIVE",
        "truckId": "70992b30-2f86-4a14-9ee3-f7d40abb4fae",
        "position": [
            -24.65675678,
            129.65675678
        ]
    }
]

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
        updateMarkerPosition(data.id, data.position);
    });

    const { geofenceFromDB } = useSelector(geoFenceProperties);
    const { fleet } = useSelector(fleetProperties);
    const { benches } = useSelector(benchesProperties);
    const [markers, setMarkers] = useState<MarkerData[]>([]);
    var [geofences, setGeofences] = useState<any[]>([]);

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

        const isNotActive: boolean = eq.status.toLowerCase() != 'ACTIVE';
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
                attributionControl: true,
                zoomControl: false,
            });

            Leaflet.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(mapRef.current);
            mapRef.current.addLayer(drawItems);

            Leaflet.control.zoom({
                position: 'bottomright'
            }).addTo(mapRef.current);

            addMarkers();
        }
    }, []);

    const shifts: any = [
        { value: 'DS', label: 'Day Shift', startTime: "06:00", endTime: "18:00" },
        { value: 'NS', label: 'Night Shift', startTime: "18:00", endTime: "06:00" }
    ];

    const getShiftTimings = () => {
        let currentTime = dayjs();
        let previousDay = dayjs().subtract(1, 'day');
        let shifTimings;
        for (let i = 0; i < shifts.length; i++) {
            let shift = shifts[i];
            let startTime = shift.startTime.split(":");
            let start = dayjs().set('hour', parseInt(startTime[0])).set('minute', parseInt(startTime[1]));
            let startPrev = previousDay.set('hour', parseInt(startTime[0])).set('minute', parseInt(startTime[1]));

            let endTime = shift.endTime.split(":");
            let end = dayjs().add(shift.startTime > shift.endTime ? 1 : 0, 'day').set('hour', parseInt(endTime[0])).set('minute', parseInt(endTime[1]));
            let endPrev = previousDay.add(shift.startTime > shift.endTime ? 1 : 0, 'day').set('hour', parseInt(endTime[0])).set('minute', parseInt(endTime[1]));

            if ((currentTime.isSame(start) || currentTime.isAfter(start)) && (currentTime.isBefore(end) || currentTime.isSame(end))) {
                shifTimings = { start, end, shift: shift.value, shiftDate: start.format('YYYY-MM-DD') };
                break;
            }
            if ((currentTime.isSame(startPrev) || currentTime.isAfter(startPrev)) && (currentTime.isBefore(endPrev) || currentTime.isSame(endPrev))) {
                shifTimings = { start: startPrev, end: endPrev, shift: shift.value, shiftDate: startPrev.format('YYYY-MM-DD') };
                break;
            }
        }

        return shifTimings;
    }

    useEffect(() => {
        dispatch(getGeoFences());
        dispatch(getAllFleet());

        const { shift, shiftDate } = getShiftTimings();
        dispatch(getAllEvents(shiftDate + ':' + shift));
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

        equipments.map(item => {
            const marker = new ExtendedMarker(item.position as Leaflet.LatLngExpression, { icon: rippleIcon(item) }).addTo(mapRef.current!)
            markersData.push({ id: item['name'], marker: marker })
        })
        setMarkers(markersData);
    }

    return (
        <React.Fragment>
            <div className="page-content">
                <Container fluid>
                    <Breadcrumb title="Dashboards" breadcrumbItem="Real-time Positioning" />
                    <Row>
                        <Col md="12">
                            <div id="map" style={{ height: '80vh', width: '100%' }}></div>
                        </Col>
                    </Row>
                </Container>
            </div>
        </React.Fragment>
    );
}

export default Map;