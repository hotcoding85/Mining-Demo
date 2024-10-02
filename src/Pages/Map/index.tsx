import React, { useEffect, useRef, useState } from "react";
import { Container, Row, Col, Card } from "reactstrap";
import { Progress } from "antd";
import { useDispatch, useSelector } from "react-redux";
import * as Leaflet from "leaflet";
import {
  getGeoFences,
  getAllFleet,
  getAllEvents,
  getAllVehicleRoutes,
} from "slices/thunk";
import Breadcrumb from "Components/Common/Breadcrumb";
import _ from "lodash";
import SyncIcon from "assets/icons/Vector.png";
import STOP_SIGN_PNG from "assets/images/stop_sign.png";
import { Select } from "antd";
import mapboxgl, { Marker } from "mapbox-gl"; // eslint-disable-line import/no-webpack-loader-syntax
import { shiftTimings } from "utils/common";
import { buildGraticule } from "utils/mapUtils";
import { Checkbox } from "antd";
import type { CheckboxProps } from "antd";
import { DropdownType } from "Components/Common/Dropdown";
import { getRandomInt } from "utils/random";
import "./index.css";

import {
  dumpingPaths,
  EquipmentLocation,
  equipments,
  travellingPaths,
} from "./sample";
import mapLocationImage from "assets/images/map/map-location.png";
import { excavatorImages, truckImages } from "assets/images/equipment";
import { useNavigate, useParams } from "react-router-dom";
import { BenchSelector, FenceSelector, VehicleRouteSelector } from "selectors";
import { Point } from "interfaces/GeoJson";

const CheckboxGroup = Checkbox.Group;

interface MarkerData {
  id: string;
  marker: Marker;
}

interface Geofence {
  id: number;
  name: string;
  layer: Leaflet.Layer | null; // Make layer nullable
}

const Map = ({ socket }) => {
  document.title = "Real-time positioning | FMS Live";

  const dispatch: any = useDispatch();

  const { benches } = useSelector(BenchSelector);
  const { vehicleRoutes } = useSelector(VehicleRouteSelector);
  const { fences } = useSelector(FenceSelector);

  // const geoFenceState = (state) => state.GeoFence;
  // const benchesState = (state) => state.Benches;
  // const fleetState = (state) => state.Fleet;
  // const vehicleRoutesState = (state) => state.VehicleRoutes;
  // const eventsState = (state) => state.Events;

  // const stateProperties = createSelector(
  //   [geoFenceState, benchesState, fleetState, vehicleRoutesState, eventsState],
  //   (
  //     geofenceState,
  //     benchesState,
  //     fleetState,
  //     vehicleRoutesState,
  //     eventsState
  //   ) => ({
  //     geofences: geofenceState.data,
  //     benches: benchesState.data,
  //     fleet: _.groupBy(fleetState.data, "id"),
  //     events: eventsState.data,
  //     routes: vehicleRoutesState.data,
  //   })
  // );

  // const {
  //   events,
  //   routes,
  //   fleet,
  //   geofences: geofenceFromDB,
  // } = useSelector(stateProperties);

  socket.on("TRACKER_LOCATION", (data) => {
    console.log(data);
    // updateMarkerPosition(data.id, data.position);
  });

  const [filter, setFilter] = useState<string>("All Equipment");

  const [markers, setMarkers] = useState<MarkerData[]>([]);
  var [geofences, setGeofences] = useState<any[]>([]);
  const [mapStylesLoaded, setMapStylesLoaded] = useState(false);

  const navigate = useNavigate();
  const { equipmentId } = useParams();

  const layerOptions = [
    "Active Benches",
    "Current Haul Routes",
    "Future Road Designs",
    "Speed Restrictions",
    "Pit Bottom",
    "Pit Climb",
    "Stop Signs",
    "Restricted",
    "Dump Locations",
  ];
  const defaultLayers = ["Current Haul Routes", "Active Benches"];

  const [checkedList, setCheckedList] = useState<string[]>(defaultLayers);

  const onChange = (list: string[]) => {
    setCheckedList(list);
  };

  const onCheckAllChange: CheckboxProps["onChange"] = (e) => {
    setCheckedList(e.target.checked ? layerOptions : []);
  };

  const [selectedEquipment, setSelectedEquipment] =
    useState<EquipmentLocation | null>();
  const mapContainer = useRef(null);
  const mapRef = useRef<any>(null);
  const [lng, setLng] = useState(120.44871814239025);
  const [lat, setLat] = useState(-29.1576602184213);

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
            position: absolute;
            top: -65px;
            left: -50px;
            background: ${eq.color};
            border-radius: 20px;
            font-size: 20px;
            color: white;
            font-size: 1rem;
            font-weight: 600;
            padding: 6px 16px;
            width: 108px;
            text-align: center;`;

    const isNotActive: boolean = eq.status.toLowerCase() != "ACTIVE";
    const standardIconTemplate = `<div id="map-location" style="${textStyle}">
            <img width="28px" style="object-fit: contain" src="${getEquipmentStatusIcon(
      eq
    )}" alt="equipment-image" />
            ${eq.name}
            </div>
            <div id="imageContainer" style="position: absolute;bottom: 0px;transform: translateX(-40%); z-index:1;">
              <img src="${mapLocationImage}" alt="Description of the image">
            </div>`;

    const icon = document.createElement("div");
    icon.innerHTML = standardIconTemplate; //isNotActive ? `${standardIconTemplate}<div class="ripple" style="${rippleStyles}"></div>` : standardIconTemplate
    // const icon = Leaflet.divIcon({
    //     className: 'marker',
    //     html: isNotActive ? `${standardIconTemplate}<div class="ripple" style="${rippleStyles}"></div>` : standardIconTemplate,
    // });

    // Add a click event listener to the dynamically created icon to dispaly card
    icon.addEventListener("click", () => {
      setSelectedEquipment(eq);
      navigate(`${eq.id}`);
    });

    return icon;
  };

  const getEquipmentStatusIcon = (eq: EquipmentLocation) => {
    if (eq.vehicleType == "EXCAVATOR") {
      switch (eq.status) {
        case "ACTIVE":
          return excavatorImages.pc1250;
        case "STANDBY":
          return excavatorImages.pc1250;
        case "DOWN":
          return excavatorImages.pc1250;
        case "DELAY":
          return excavatorImages.pc1250;
      }
    } else if (eq.vehicleType == "DUMP_TRUCK") {
      switch (eq.status) {
        case "ACTIVE":
          return truckImages.hd785;
        case "STANDBY":
          return truckImages.hd785;
        case "DOWN":
          return truckImages.hd785;
        case "DELAY":
          return truckImages.hd785;
      }
    }
  };

  const getStateColor = (state) => {
    switch (state) {
      case "ACTIVE":
        return "#009D10";
      case "STANDBY":
        return "#F7B31A";
      case "DELAY":
        return "#9143DE";
      case "DOWN":
        return "#ED3A0F";
      default:
        return "#F7B31A";
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

  useEffect(() => {
    mapboxgl.accessToken =
      "pk.eyJ1IjoiaG1lc3VwcG9ydCIsImEiOiJjbHp1eTRibDAwMG05MmpvczE1ZHdham5qIn0.ZoE3pSipzwdf-0TkY3ezzw";

    if (mapRef.current) return; // initialize map only once

    mapRef.current = new mapboxgl.Map({
      container: mapContainer.current!,
      style: "mapbox://styles/hmesupport/cm00qombw008z01oe8pcf6j2m",
      center: [lng, lat],
      zoom: 15,
      pitch: 60,
      minZoom: 15,
      attributionControl: false,
      bearing: 50,
    });

    mapRef.current.addControl(new mapboxgl.ScaleControl(), "bottom-right");
    mapRef.current.addControl(
      new mapboxgl.NavigationControl({ visualizePitch: true }),
      "bottom-right"
    );
    mapRef.current.addControl(new mapboxgl.FullscreenControl(), "bottom-right");

    mapRef.current.on("style.load", () => {
      mapRef.current.setTerrain({ exaggeration: 2 });

      const graticule = buildGraticule(lat, lng);

      mapRef.current.addSource("graticule", {
        type: "geojson",
        data: graticule,
      });

      mapRef.current.addLayer({
        id: "graticule",
        type: "line",
        source: "graticule",
        minzoom: 17,
        layout: {},
        paint: {
          "line-color": "white",
          "line-width": 1,
        },
      });
      setMapStylesLoaded(true);
    });

    // return () => mapRef.current.remove();
  }, []);

  useEffect(() => {
    dispatch(getGeoFences());
    dispatch(getAllFleet());
    dispatch(getAllVehicleRoutes());

    const { shift, shiftDate } = shiftTimings();
    dispatch(getAllEvents(shiftDate + ":" + shift));
  }, [dispatch]);

  const _layerOptions: DropdownType[] = [
    { label: "Current Haul Routes", value: "CURRENT_HAUL_ROUTES" },
    { label: "Future Road Designs", value: "FUTURE_ROAD_DESIGNS" },
    { label: "Speed Restrictions", value: "SPEED_RESTRICTIONS" },
    { label: "Pit Bottom", value: "PIT_BOTTOM" },
    { label: "Pit Climb", value: "PIT_CLIMB" },
    { label: "Stop Signs", value: "STOP_SIGNS" },
    { label: "Restricted", value: "RESTRICTED" },
  ];

  useEffect(() => {
    if (mapStylesLoaded) {
      vehicleRoutes
        .filter(
          (_route) =>
            _route.category != "STOP_SIGNS" && _route.status == "ACTIVE"
        )
        .map((item, key) => {
          if (!mapRef.current?.getSource(item.id)) {
            mapRef.current?.addSource(item.id, {
              type: "geojson",
              data: item.geoJson,
            });
          }
          if (!mapRef.current?.getLayer(item.id)) {
            mapRef.current?.addLayer({
              type: "line",
              source: item.id,
              id: item.id,
              paint: {
                "line-color": item.color,
                "line-width": 40,
                "line-opacity": 0.4,
              },
            });
          }
        });
      vehicleRoutes
        .filter(
          (_route) =>
            _route.category === "STOP_SIGNS" && _route.status == "ACTIVE"
        )
        .map((item, key) => {
          const map = mapRef.current;

          if (!map) return;

          // Convert LineString to Point assuming the first coordinate is the desired location
          const pointFeature = {
            type: "Feature",
            geometry: {
              type: "Point",
              coordinates: (item.geoJson.geometry as Point).coordinates[0],
            },
            properties: item.geoJson.properties,
          };

          // Check if the source does not exist before adding it
          if (!map.getSource(item.id)) {
            map.addSource(item.id, {
              type: "geojson",
              data: pointFeature,
            });
          }

          // First, we need to make sure the image is added to the map
          // Replace 'stop-sign' with the ID for your image
          if (!map.hasImage("stop-sign")) {
            map.loadImage(
              STOP_SIGN_PNG, // Path to your image file
              (error, image) => {
                if (error) throw error;
                map.addImage("stop-sign", image);
              }
            );
          }

          // Remove existing layer if it exists
          if (map.getLayer(item.id)) {
            map.removeLayer(item.id);
          }
          const iconSizeFactor = 40 / 80;
          // Add a new symbol layer for STOP_SIGNS with the image icon
          map.addLayer({
            id: item.id,
            type: "symbol",
            source: item.id,
            layout: {
              "icon-image": "stop-sign", // ID for your loaded image
              "icon-size": 0.05, // Adjust as needed to scale the image
              "icon-allow-overlap": true, // Optional: allows icons to overlap
            },
            paint: {
              "icon-opacity": 0.75, // Set the desired opacity; 0.75 means 75% opacity
            },
          });
        });

      const selectedCategories = _layerOptions
        .filter((option) => checkedList.includes(option.label)) // Get matching label from _layerOptions
        .map((option) => option.value); // Extract corresponding values (categories)
      vehicleRoutes.map((item, key) => {
        if (selectedCategories.includes(item.category)) {
          mapRef.current.setLayoutProperty(item.id, "visibility", "visible");
        } else {
          mapRef.current.setLayoutProperty(item.id, "visibility", "none");
        }
      });
    }
  }, [vehicleRoutes, mapStylesLoaded, checkedList]);

  const clearMarkers = () => {
    markers.map((item) => {
      // mapRef.current?.removeLayer(item.marker)
      item.marker.remove();
    });
    setMarkers([]);
  };

  let animationRequestId: number;

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

    if (
      mapStylesLoaded &&
      (filter == "DUMP_TRUCK" || filter == "All Equipment")
    ) {
      if (!mapRef.current?.getSource("line")) {
        mapRef.current?.addSource("line", {
          type: "geojson",
          data: travellingPaths,
        });
      }

      if (!mapRef.current?.getSource("loadedline")) {
        mapRef.current?.addSource("loadedline", {
          type: "geojson",
          data: dumpingPaths,
        });
      }

      if (!mapRef.current?.getLayer("line-dashed")) {
        mapRef.current?.addLayer({
          type: "line",
          source: "line",
          id: "line-dashed",
          paint: {
            "line-color": "yellow",
            "line-width": 4,
            "line-dasharray": [0, 4, 3],
          },
        });
      }

      if (!mapRef.current?.getLayer("loadedline")) {
        mapRef.current?.addLayer({
          type: "line",
          source: "loadedline",
          id: "loaded-line-dashed",
          paint: {
            "line-color": "yellow",
            "line-width": 4,
            "line-dasharray": [0, 4, 3],
          },
        });
      }

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
        const newStep = Math.round((timestamp / 50) % dashArraySequence.length);
        if (newStep !== step && mapRef.current?.getLayer("line-dashed")) {
          mapRef.current?.setPaintProperty(
            "line-dashed",
            "line-dasharray",
            dashArraySequence[step]
          );
          step = newStep;
        } else if (
          newStep !== step &&
          mapRef.current?.getLayer("loaded-line-dashed")
        ) {
          mapRef.current?.setPaintProperty(
            "loaded-line-dashed",
            "line-dasharray",
            dashArraySequence[step]
          );
          step = newStep;
        } else {
        }

        return requestAnimationFrame(animateDashArray);
      }

      animationRequestId = animateDashArray(0);
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
        mapRef.current?.flyTo({
          center: eq.position,
          zoom: 20,
          speed: 1,
        })
      );
    });
    // markersLayer.
    setMarkers(markersData);

    if (equipmentId) {
      const eq = filteredEquipment.find((item) => item.id === equipmentId);
      if (eq) {
        setSelectedEquipment(eq);
        mapRef.current?.flyTo({
          center: eq.position,
          zoom: 20,
          speed: 1,
        });
      }
    }
  }, [mapStylesLoaded, filter]);

  const drawFeature = (geoFenceData: any) => {
    if (!mapRef.current) return;

    let layer;
    const map = mapRef.current;
    const sourceId = `line-${geoFenceData.id}`;

    if (
      geoFenceData &&
      geoFenceData.geoJson &&
      geoFenceData.geoJson.properties &&
      geoFenceData.geoJson.properties.radius
    ) {
      layer = Leaflet.geoJson(geoFenceData.geoJson, {
        pointToLayer: function (feature, latlng) {
          return Leaflet.circle(latlng, {
            radius: geoFenceData.geoJson.properties.radius,
          });
        },
      }).addTo(map);
      layer.id = geoFenceData.id;
      drawItems.addLayer(layer);
    } else {
      layer = Leaflet.geoJson(geoFenceData.geoJson).addTo(map);
      if (layer) {
        // Set an ID for the layer associated with the geoFenceData
        layer.id = geoFenceData.id;
      }

      if (map.isStyleLoaded()) {
        // Dynamically generate a unique source ID
        if (map.getSource(sourceId)) {
          map.removeSource(sourceId);
        }

        map.addSource(sourceId, {
          type: "geojson",
          data: geoFenceData.geoJson,
        });

        const layerId = `fence-${geoFenceData.id}`;

        map.addLayer({
          id: layerId,
          type: "line",
          source: sourceId,
          paint: {
            "line-color": "yellow",
            "line-width": 4,
            "line-opacity": 0.4,
          },
        });
      }
      //layer.bindPopup("Name of the GeoFence");
      // drawItems.addLayer(layer);
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

  const checkAll = layerOptions.length === checkedList.length;
  const indeterminate =
    checkedList.length > 0 && checkedList.length < layerOptions.length;

  useEffect(() => {
    if (mapRef.current) return; // Initialize map only once

    mapRef.current = new mapboxgl.Map({
      container: mapContainer.current!,
      style: "mapbox://styles/mapbox/streets-v11",
      center: [lng, lat],
      zoom: 15,
    });

    // Add markers dynamically for each equipment
    equipments.forEach((equipment) => {
      const el = rippleIcon(equipment); // Call the custom rippleIcon function

      const marker = new mapboxgl.Marker(el)
        .setLngLat(equipment.position)
        .addTo(mapRef.current);

      // Add flyTo on marker click
      marker.getElement().addEventListener("click", () => {
        mapRef.current?.flyTo({
          center: equipment.position,
          zoom: 18,
          speed: 1.2,
        });
      });
    });
  }, []);

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid>
          <Breadcrumb
            title="Dashboards"
            breadcrumbItem="Real-time Positioning"
          />
          <Row>
            <Col md="12" className="mb-4 d-flex">
              {/* <Segmented className="customSegmentLabel customSegmentBackground" value={filter} onChange={(e) => setFilter(e)} options={['All Equipment', { label: 'Excavators', value: 'EXCAVATOR' }, { label: 'Trucks', value: 'DUMP_TRUCK' }, { label: 'Loaders', value: 'LOADER', disabled: true }, { label: 'Drillers', value: 'Drillers', disabled: true }, { label: 'Dozers', value: 'Dozers', disabled: true }]} /> */}
              <div style={{ alignContent: "center" }}>
                <Checkbox
                  indeterminate={indeterminate}
                  onChange={onCheckAllChange}
                  checked={checkAll}
                >
                  All
                </Checkbox>
                <CheckboxGroup
                  options={layerOptions}
                  value={checkedList}
                  onChange={onChange}
                />
              </div>
              <div style={{ alignContent: "center", justifyContent: "end" }}>
                <Select
                  placeholder="Filter By Category"
                  showSearch
                  options={[
                    { label: "All Equipment", value: "All Equipment" },
                    { label: "Excavators", value: "EXCAVATOR" },
                    { label: "Trucks", value: "DUMP_TRUCK" },
                    { label: "Loaders", value: "LOADER", disabled: true },
                    { label: "Drillers", value: "Drillers", disabled: true },
                    { label: "Dozers", value: "Dozers", disabled: true },
                  ]}
                  style={{ width: "150px" }}
                />
              </div>
            </Col>
          </Row>
          <Row>
            <Col>
              <div
                id="map"
                ref={mapContainer}
                className="map-container"
                style={{
                  position: "relative",
                  height: "calc(100vh - 274px)",
                  width: "100%",
                }}
              >
                {selectedEquipment && (
                  <Card
                    className="p-3 card-status"
                    style={{
                      position: "absolute",
                      width: "20%",
                      top: "10px",
                      right: "10px",
                    }}
                  >
                    <div className="d-flex justify-content-between">
                      <div style={{ display: "flex", alignItems: "baseline" }}>
                        <span
                          style={{
                            fontSize: "1.2em",
                            fontWeight: "500",
                            color: "white",
                          }}
                        >
                          {selectedEquipment.name}
                        </span>
                      </div>
                      <div>
                        <span
                          className="card-status"
                          style={{
                            backgroundColor: getStateColor(
                              selectedEquipment.status
                            ),
                          }}
                        >
                          {selectedEquipment.status}
                        </span>
                      </div>
                    </div>

                    <span
                      style={{
                        display: "flex",
                        alignItems: "center",
                        fontStyle: "italic",
                        fontSize: "small",
                      }}
                    >
                      <img
                        src={SyncIcon}
                        alt="Sync Icon"
                        style={{
                          marginRight: "5px",
                        }}
                      />
                      Synced {getRandomInt(0, 5)}h ago
                    </span>
                    <div className="assigned-truck-details mt-2">
                      <div className="assigned-truck-progress">
                        <p className="progress-text">
                          <span className="progress-label">
                            Total Planned Load
                          </span>
                          <span className="progress-value">23/35</span>
                        </p>
                        <Progress percent={66} showInfo={false} />
                      </div>
                      <div
                        className="d-flex flex-column"
                        style={{ width: "100%" }}
                      >
                        <p className="truck-props">
                          <span className="props-label">Avg Load Time</span>
                          <span className="props-value">04:21</span>
                        </p>
                        <p className="truck-props">
                          <span className="props-label">Tonnes per hour</span>
                          <span className="props-value">50t</span>
                        </p>
                        <p className="truck-props">
                          <span className="props-label">
                            Operational Delays
                          </span>
                          <span className="props-value">06:13</span>
                        </p>
                        <p className="truck-props">
                          <span className="props-label">
                            Number of Operational Delay Events
                          </span>
                          <span className="props-value">5</span>
                        </p>
                        <p className="truck-props cycle-time">
                          <span className="props-label">
                            Total Previous Cycle Time
                          </span>
                          <div
                            className="cycle-time-container"
                            style={{ gap: "6px" }}
                          >
                            <span className="time-chips">13:30</span>
                            <span className="time-chips">14:27</span>
                            <span className="time-chips">15:37</span>
                            <span className="time-chips">15:44</span>
                          </div>
                        </p>
                      </div>
                    </div>
                  </Card>
                )}
              </div>
            </Col>
          </Row>
          {/* Display the information card dynamically when equipment is clicked */}
        </Container>
      </div>
    </React.Fragment>
  );
};

export default Map;
