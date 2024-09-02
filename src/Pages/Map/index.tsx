import React, { useEffect, useRef, useState } from "react";
import { Container, Row, Col } from "reactstrap";
import { createSelector } from "reselect";
import { useDispatch, useSelector } from "react-redux";
import * as Leaflet from "leaflet";
import { getGeoFences, getAllFleet, getAllEvents } from "slices/thunk";
import Breadcrumb from "Components/Common/Breadcrumb";
import { ExtendedMarker } from "./leaflet-extensions";
import _ from "lodash";
import dayjs from "dayjs";
import {
  standbyTruck,
  delayTruck,
  downTruck,
  activeTruck,
  standbyExcavator,
  delayExcavator,
  downExcavator,
  activeExcavator,
} from "assets/images/map";
import { Radio, Segmented } from "antd";
import mapboxgl, { LngLatLike, Marker } from "mapbox-gl"; // eslint-disable-line import/no-webpack-loader-syntax

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
  id: number;
  name: string;
  layer: Leaflet.Layer | null; // Make layer nullable
}

const equipments: EquipmentLocation[] = [
  {
    id: "DT101",
    name: "DT101",
    status: "ACTIVE",
    color: "#009D10",
    vehicleType: "DUMP_TRUCK",
    position: [120.46246497162531, -29.160384014441625],
  },
  {
    id: "DT102",
    name: "DT102",
    status: "ACTIVE",
    color: "#009D10",
    vehicleType: "DUMP_TRUCK",
    position: [120.45002414328343, -29.157918736758198],
  },
  {
    id: "DT103",
    name: "DT103",
    status: "ACTIVE",
    color: "#009D10",
    vehicleType: "DUMP_TRUCK",
    position: [120.4383369229248, -29.15641296566485],
  },
  {
    id: "DT104",
    name: "DT104",
    status: "ACTIVE",
    color: "#009D10",
    vehicleType: "DUMP_TRUCK",
    position: [120.4509115631555, -29.16343502685107],
  },
  {
    id: "DT105",
    name: "DT105",
    status: "ACTIVE",
    color: "#009D10",
    vehicleType: "DUMP_TRUCK",
    position: [120.44976212320336, -29.157642097015362],
  },
  {
    id: "DT106",
    name: "DT106",
    status: "STANDBY",
    color: "#F08B00",
    vehicleType: "DUMP_TRUCK",
    position: [120.43758279849703, -29.156386794482586],
  },
  {
    id: "DT121",
    name: "DT121",
    status: "ACTIVE",
    color: "#009D10",
    vehicleType: "DUMP_TRUCK",
    position: [120.44438970741732, -29.146627309426933],
  },
  {
    id: "DT122",
    name: "DT122",
    status: "ACTIVE",
    color: "#009D10",
    vehicleType: "DUMP_TRUCK",
    position: [120.44551473011586, -29.152641269272948],
  },
  {
    id: "DT123",
    name: "DT123",
    status: "DELAY",
    color: "#BC00FF",
    vehicleType: "DUMP_TRUCK",
    position: [120.44526945482403, -29.14803343661103],
  },
  {
    id: "EX201",
    name: "EX201",
    status: "ACTIVE",
    color: "#009D10",
    vehicleType: "EXCAVATOR",
    position: [120.44463458272295, -29.146790943732764],
  },
  {
    id: "EX202",
    name: "EX202",
    status: "ACTIVE",
    color: "#009D10",
    vehicleType: "EXCAVATOR",
    position: [120.44968382497262, -29.15766694159693],
  },
  {
    id: "EX205",
    name: "EX205",
    status: "DELAY",
    color: "#BC00FF",
    vehicleType: "EXCAVATOR",
    position: [120.44516509787695, -29.147993875066938],
  },
];

const Map = ({ socket }) => {
  document.title = "Real-time positioning | FMS Live";

  const dispatch: any = useDispatch();
  const geoFenceProperties = createSelector(
    (state: any) => state.GeoFence,
    (geofenceState) => ({
      geofenceFromDB: geofenceState.data,
    })
  );

  const benchesProperties = createSelector(
    (state: any) => state.Benches,
    (benchesState) => ({
      benches: benchesState.data,
    })
  );

  const fleetProperties = createSelector(
    (state: any) => state.Fleet,
    (fleetState) => ({
      fleet: _.groupBy(fleetState.data, "id"),
    })
  );

  const eventsProperties = createSelector(
    (state: any) => state.Events,
    (eventsState) => ({
      events: eventsState.data,
    })
  );

  const { events } = useSelector(eventsProperties);

  socket.on("TRACKER_LOCATION", (data) => {
    console.log(data);
    // updateMarkerPosition(data.id, data.position);
  });

  const { geofenceFromDB } = useSelector(geoFenceProperties);
  const { fleet } = useSelector(fleetProperties);
  const { benches } = useSelector(benchesProperties);
  const [filter, setFilter] = useState<string>("All Equipment");

  const [markers, setMarkers] = useState<MarkerData[]>([]);
  var [geofences, setGeofences] = useState<any[]>([]);

  const mapContainer = useRef(null);
  const mapRef = useRef<any>(null);
  const [lng, setLng] = useState(120.44871814239025);
  const [lat, setLat] = useState(-29.1576602184213);
  const [zoom, setZoom] = useState(18);

  // const mapRef = useRef<Leaflet.Map | null>(null);
  const drawItems = new Leaflet.FeatureGroup();
  const origin: Leaflet.LatLngExpression = [
    -29.160331938574046, 120.44974338024406,
  ];

  var locations: any = {};
  locations = benches.map((option) => {
    return { value: option.id, label: option?.name };
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

    const isNotActive: boolean = eq.status.toLowerCase() != "ACTIVE";
    const standardIconTemplate = `<div style="${textStyle}">${eq.name}</div>
            <div id="imageContainer" style="position: absolute;bottom: 5px;transform: translateX(-40%); z-index:1;">
              <img src="${getEquipmentStatusIcon(
                eq
              )}" alt="Description of the image">
            </div>`;

    const icon = document.createElement("div");
    icon.innerHTML = standardIconTemplate; //isNotActive ? `${standardIconTemplate}<div class="ripple" style="${rippleStyles}"></div>` : standardIconTemplate
    // const icon = Leaflet.divIcon({
    //     className: 'marker',
    //     html: isNotActive ? `${standardIconTemplate}<div class="ripple" style="${rippleStyles}"></div>` : standardIconTemplate,
    // });
    return icon;
  };

  const getEquipmentStatusIcon = (eq: EquipmentLocation) => {
    if (eq.vehicleType == "EXCAVATOR") {
      switch (eq.status) {
        case "ACTIVE":
          return activeExcavator;
        case "STANDBY":
          return standbyExcavator;
        case "DOWN":
          return downExcavator;
        case "DELAY":
          return delayExcavator;
      }
    } else if (eq.vehicleType == "DUMP_TRUCK") {
      switch (eq.status) {
        case "ACTIVE":
          return activeTruck;
        case "STANDBY":
          return standbyTruck;
        case "DOWN":
          return downTruck;
        case "DELAY":
          return delayTruck;
      }
    }
  };

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

  const geojson = {
    type: "FeatureCollection",
    features: [
      {
        id: "bd75417a4d6220eaa22607c1dcef716b",
        type: "Feature",
        properties: {},
        geometry: {
          coordinates: [
            [120.44438970741732, -29.146627309426933],
            [120.4442274307242, -29.146387322587906],
            [120.44415072955388, -29.146607362040278],
            [120.44413852347515, -29.147044057451183],
            [120.44423384216378, -29.147482281142487],
            [120.44437900559785, -29.148137368465434],
            [120.4444611747428, -29.148423544949097],
            [120.44460218168092, -29.148741815648506],
            [120.44485350113376, -29.149042027368097],
            [120.44511053585188, -29.149331649824745],
            [120.44534639143461, -29.149599764290123],
            [120.44551515198503, -29.14995375407502],
            [120.44553986761662, -29.15025821181986],
            [120.44563869225067, -29.150881342718513],
            [120.44570717429548, -29.1512136277292],
            [120.44576592620894, -29.151722264829786],
            [120.44586439032986, -29.15229354362662],
            [120.44596145016271, -29.152802818241128],
            [120.44594634081665, -29.152997264172697],
            [120.44587683453369, -29.15318980759774],
            [120.4456824923534, -29.153409481548778],
            [120.4448458221936, -29.154183347394373],
            [120.44449947901558, -29.154489497501494],
            [120.44421052519596, -29.154764907366364],
            [120.44383973362892, -29.15496867265273],
            [120.44350366899494, -29.155066680931938],
            [120.44318131863207, -29.15505787387947],
            [120.44259883174277, -29.15495963787427],
            [120.44197695818451, -29.154895798340178],
            [120.44132003023685, -29.155084234283052],
            [120.44023229318157, -29.15533424338021],
            [120.43948670260221, -29.15555156287538],
            [120.43855597237041, -29.155825594520984],
            [120.43829307027693, -29.155956333117402],
            [120.43827931019695, -29.156175767373988],
            [120.4383369229248, -29.15641296566485],
          ],
          type: "LineString",
        },
      },
      {
        id: "d30d00c218e734d5f11947f11e272cf8",
        type: "Feature",
        properties: {},
        geometry: {
          coordinates: [
            [120.45002414328343, -29.157918736758198],
            [120.45017028413355, -29.158264268470887],
            [120.45024294687119, -29.158588845155727],
            [120.45022662696834, -29.158931241329675],
            [120.45012697683234, -29.159211073380348],
            [120.44994056549632, -29.159303807814325],
            [120.44974373559097, -29.15927769860378],
            [120.4494873186726, -29.159006210183477],
            [120.4492665764459, -29.158640689786296],
            [120.44898048533486, -29.158264268470887],
            [120.448690452851, -29.157862570887985],
            [120.44836111496579, -29.157424047377766],
            [120.44808521202043, -29.157079204381752],
            [120.44789835315152, -29.156930557898875],
            [120.44767090416417, -29.15683816184874],
            [120.44742284553479, -29.156930557898875],
            [120.44746342531573, -29.157151134243456],
            [120.44801073043897, -29.158254397415114],
            [120.44846427933606, -29.15917014333791],
            [120.44999590287534, -29.162166578961823],
            [120.45021208808214, -29.162541658307205],
            [120.45044951419698, -29.16289903073509],
            [120.45067581469073, -29.163126909057908],
            [120.45101402783433, -29.163295317906318],
            [120.4514957629994, -29.16340547440769],
            [120.45211386711287, -29.163490385254114],
            [120.45272607463983, -29.163488836040003],
            [120.45385993699205, -29.16333783160721],
            [120.45583476977248, -29.162764604937998],
            [120.45712729897798, -29.162351597303108],
            [120.45800945221953, -29.162063105605164],
            [120.45905613814932, -29.1613594501638],
            [120.46035080487519, -29.16033946713747],
            [120.46077509442762, -29.16002143498551],
            [120.46117298701341, -29.159889344058016],
            [120.46158990849926, -29.159878921631233],
            [120.46204630174753, -29.15992038302778],
            [120.46246187351079, -29.160001515493285],
            [120.46275663053598, -29.160084482222132],
            [120.46287160897748, -29.160196189941054],
            [120.46284022812279, -29.160319570950804],
            [120.46276375673716, -29.16037246924384],
            [120.4626505128033, -29.160366668385258],
            [120.46246497162531, -29.160384014441625],
            [120.46221114476094, -29.160429454928995],
            [120.46201657780148, -29.160446196069515],
            [120.46176373656584, -29.160462777723808],
            [120.46144511165818, -29.160506232864904],
            [120.46122751637074, -29.16060013061515],
            [120.46105711362321, -29.160703365511125],
            [120.4609137887681, -29.160804861486774],
            [120.46098357019855, -29.1610813447436],
            [120.4611559908385, -29.161295504918783],
          ],
          type: "LineString",
        },
      },
      {
        id: "8c93154be7d2e8934bbdbef7a2f15303",
        type: "Feature",
        properties: {},
        geometry: {
          coordinates: [
            [120.4509115631555, -29.16343502685107],
            [120.45056322997993, -29.16322369984951],
            [120.45026409317938, -29.16292309602222],
            [120.4498823833984, -29.162323213869776],
            [120.448414278406, -29.15947869881643],
            [120.44747354113719, -29.157550485319526],
            [120.44733303552692, -29.157194340411095],
            [120.44734395336894, -29.15692310593934],
            [120.44744383422051, -29.15681247017954],
            [120.44755964647157, -29.156760667841453],
            [120.44773953538174, -29.156751988005837],
            [120.44804117909973, -29.15696508468961],
            [120.44829009799253, -29.157202495193175],
            [120.44848776609786, -29.15746830085935],
            [120.44866658524023, -29.15780800552305],
            [120.44904307589525, -29.15828535681804],
            [120.44935449183254, -29.158714588903777],
            [120.44958672099904, -29.15913521272899],
            [120.44978361618399, -29.15926895457644],
            [120.44999304046235, -29.159199908655054],
            [120.45016787748852, -29.159030839622496],
            [120.4501937236252, -29.15883789771088],
            [120.45020412142594, -29.158557314256484],
            [120.450062154065, -29.158173531245716],
            [120.4498886967001, -29.157714214967164],
          ],
          type: "LineString",
        },
      },
      {
        id: "4a6015da092bf62869b7aaf6160bb228",
        type: "Feature",
        properties: {},
        geometry: {
          coordinates: [
            [120.44551473011586, -29.152641269272948],
            [120.44539571205422, -29.151914184457368],
            [120.44517240656859, -29.150531112713587],
            [120.44478593943927, -29.149568983324066],
            [120.44421789210458, -29.148859328490637],
            [120.44368919657501, -29.147164298759755],
            [120.44369209927515, -29.146542327241796],
            [120.44383946086413, -29.146331719196695],
            [120.4440976631223, -29.146298821160393],
            [120.44435500673364, -29.14636435142546],
            [120.44454019859671, -29.146536106667888],
            [120.44459995683707, -29.146664410491823],
          ],
          type: "LineString",
        },
      },
    ],
  };

  useEffect(() => {
    mapboxgl.accessToken =
      "pk.eyJ1IjoiaG1lc3VwcG9ydCIsImEiOiJjbHp1eTRibDAwMG05MmpvczE1ZHdham5qIn0.ZoE3pSipzwdf-0TkY3ezzw";

    if (mapRef.current) return; // initialize map only once

    mapRef.current = new mapboxgl.Map({
      container: mapContainer.current!,
      style: "mapbox://styles/hmesupport/cm00qombw008z01oe8pcf6j2m",
      center: [lng, lat],
      zoom: zoom,
      pitch: 75,
      minZoom: 15,
    });

    mapRef.current.addControl(new mapboxgl.ScaleControl());
    mapRef.current.addControl(
      new mapboxgl.NavigationControl({ visualizePitch: true })
    );
    mapRef.current.addControl(new mapboxgl.FullscreenControl());

    mapRef.current.on("load", () => {
      mapRef.current.addSource("line", {
        type: "geojson",
        data: geojson,
      });
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

  const shifts: any = [
    { value: "DS", label: "Day Shift", startTime: "06:00", endTime: "18:00" },
    { value: "NS", label: "Night Shift", startTime: "18:00", endTime: "06:00" },
  ];

  const getShiftTimings = () => {
    let currentTime = dayjs();
    let previousDay = dayjs().subtract(1, "day");
    let shifTimings;
    for (let i = 0; i < shifts.length; i++) {
      let shift = shifts[i];
      let startTime = shift.startTime.split(":");
      let start = dayjs()
        .set("hour", parseInt(startTime[0]))
        .set("minute", parseInt(startTime[1]));
      let startPrev = previousDay
        .set("hour", parseInt(startTime[0]))
        .set("minute", parseInt(startTime[1]));

      let endTime = shift.endTime.split(":");
      let end = dayjs()
        .add(shift.startTime > shift.endTime ? 1 : 0, "day")
        .set("hour", parseInt(endTime[0]))
        .set("minute", parseInt(endTime[1]));
      let endPrev = previousDay
        .add(shift.startTime > shift.endTime ? 1 : 0, "day")
        .set("hour", parseInt(endTime[0]))
        .set("minute", parseInt(endTime[1]));

      if (
        (currentTime.isSame(start) || currentTime.isAfter(start)) &&
        (currentTime.isBefore(end) || currentTime.isSame(end))
      ) {
        shifTimings = {
          start,
          end,
          shift: shift.value,
          shiftDate: start.format("YYYY-MM-DD"),
        };
        break;
      }
      if (
        (currentTime.isSame(startPrev) || currentTime.isAfter(startPrev)) &&
        (currentTime.isBefore(endPrev) || currentTime.isSame(endPrev))
      ) {
        shifTimings = {
          start: startPrev,
          end: endPrev,
          shift: shift.value,
          shiftDate: startPrev.format("YYYY-MM-DD"),
        };
        break;
      }
    }

    return shifTimings;
  };

  useEffect(() => {
    dispatch(getGeoFences());
    dispatch(getAllFleet());

    const { shift, shiftDate } = getShiftTimings();
    dispatch(getAllEvents(shiftDate + ":" + shift));
  }, [dispatch]);

  useEffect(() => {
    geofences = [];
    geofenceFromDB.forEach((json) => {
      drawFeature(json);
    });
  }, [geofenceFromDB]);

  const clearMarkers = () => {
    markers.map((item) => {
      // mapRef.current?.removeLayer(item.marker)
      item.marker.remove();
    });
    setMarkers([]);
  };

  useEffect(() => {
    clearMarkers();
    const markersData: MarkerData[] = [];
    let filteredEquipment: EquipmentLocation[] = [];
    if (filter == "All Equipment") {
      filteredEquipment = equipments;
    } else {
      filteredEquipment = equipments.filter(
        (item) => item.vehicleType == filter
      );
    }

    if (mapRef.current.getLayer("line-dashed")) {
      mapRef.current.removeLayer("line-dashed");
    }

    if (mapRef.current.getLayer("line-background")) {
      mapRef.current.removeLayer("line-background");
    }

    if (mapRef.current.getSource("line")) {
      mapRef.current.removeSource("line");
    }

    if (
      mapRef.current &&
      (filter == "DUMP_TRUCK" || filter == "All Equipment")
    ) {
      if (mapRef.current.isStyleLoaded()) {
        mapRef.current.addSource("line", {
          type: "geojson",
          data: geojson,
        });

        mapRef.current.addLayer({
          type: "line",
          source: "line",
          id: "line-background",
          paint: {
            "line-color": "yellow",
            "line-width": 4,
            "line-opacity": 0.4,
          },
        });

        mapRef.current.addLayer({
          type: "line",
          source: "line",
          id: "line-dashed",
          paint: {
            "line-color": "yellow",
            "line-width": 4,
            "line-dasharray": [0, 4, 3],
          },
        });

        const dashArraySequence = [
          [0, 4, 3],
          [0.5, 4, 2.5],
          [1, 4, 2],
          [1.5, 4, 1.5],
          [2, 4, 1],
          [2.5, 4, 0.5],
          [3, 4, 0],
          [0, 0.5, 3, 3.5],
          [0, 1, 3, 3],
          [0, 1.5, 3, 2.5],
          [0, 2, 3, 2],
          [0, 2.5, 3, 1.5],
          [0, 3, 3, 1],
          [0, 3.5, 3, 0.5],
        ];

        let step = 0;

        function animateDashArray(timestamp) {
          const newStep = Math.round(
            (timestamp / 50) % dashArraySequence.length
          );
          if (newStep !== step && mapRef.current.getLayer("line-dashed")) {
            mapRef.current.setPaintProperty(
              "line-dashed",
              "line-dasharray",
              dashArraySequence[step]
            );
            step = newStep;
          } else {
          }

          return requestAnimationFrame(animateDashArray);
        }

        const animationRequestId = animateDashArray(0);
      }
    }

    filteredEquipment.map((eq) => {
      // const marker = new ExtendedMarker(eq.position as Leaflet.LatLngExpression, { icon: rippleIcon(eq) }).addTo(mapRef.current!)
      // const el = document.createElement('div');
      // el.className = 'activemarker';
      const el = rippleIcon(eq);
      const marker = new mapboxgl.Marker(el)
        .setLngLat(eq.position)
        .addTo(mapRef.current);
      markersData.push({ id: eq["name"], marker: marker });
      marker.getElement().addEventListener("click", () =>
        mapRef.current.flyTo({
          center: eq.position,
          zoom: 20,
          speed: 1,
        })
      );
    });
    // markersLayer.
    setMarkers(markersData);
  }, [filter]);

  const drawFeature = (geoFenceData: any) => {
    let layer;
    if (
      geoFenceData &&
      geoFenceData.geoJson &&
      geoFenceData.geoJson.properties &&
      geoFenceData.geoJson.properties.radius
    ) {
      layer = Leaflet.geoJson(geoFenceData.geoJson, {
        pointToLayer: function (feature, latlng) {
          console.log("latlng", latlng);
          return Leaflet.circle(latlng, {
            radius: geoFenceData.geoJson.properties.radius,
          });
        },
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
    geofences.push({
      id: layer.id,
      layer: layer,
      name: geoFenceData.name,
      bench: {
        value: geoFenceData.locationId,
        label:
          geoFenceData && geoFenceData.location
            ? geoFenceData.location.name
            : "",
      },
    });
    setGeofences([...geofences]);
  };

  const getFleetData = (truckId) => {
    return fleet[truckId] && fleet[truckId].length > 0 ? fleet[truckId][0] : {};
  };
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
  };

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
  };

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid>
          <Breadcrumb
            title="Dashboards"
            breadcrumbItem="Real-time Positioning"
          />
          <Row>
            <Col md="12" className="mb-4 d-flex flex-row-reverse">
              <Segmented
                className="customSegmentLabel customSegmentBackground"
                value={filter}
                onChange={(e) => setFilter(e)}
                options={[
                  "All Equipment",
                  { label: "Excavators", value: "EXCAVATOR" },
                  { label: "Trucks", value: "DUMP_TRUCK" },
                  { label: "Loaders", value: "LOADER", disabled: true },
                  { label: "Drillers", value: "Drillers", disabled: true },
                  { label: "Dozers", value: "Dozers", disabled: true },
                ]}
              />
            </Col>
            <Col md="12">
              <div
                id="map"
                ref={mapContainer}
                className="map-container"
                style={{ height: "80vh", width: "100%" }}
              ></div>
            </Col>
          </Row>
        </Container>
      </div>
    </React.Fragment>
  );
};

export default Map;
