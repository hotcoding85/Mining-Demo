import React, { useEffect, useRef, useState } from "react";
import { Col, Row } from "reactstrap";
import mapboxgl, { Marker } from "mapbox-gl";
import { buildGraticule } from "utils/mapUtils";
import { EquipmentLocation, equipments } from "Pages/Map/sample";
import {
  activeExcavator,
  activeTruck,
  delayExcavator,
  delayTruck,
  downExcavator,
  downTruck,
  standbyExcavator,
  standbyTruck,
} from "assets/images/map";
import _ from "lodash";
interface MarkerData {
  id: string;
  marker: Marker;
}

const DiggingOptimisationMapView = (props: any) => {
  const mapRef = useRef<any>(null);
  const mapContainer = useRef(null);
  const [lng, setLng] = useState(120.44871814239025);
  const [lat, setLat] = useState(-29.1576602184213);
  const [markers, setMarkers] = useState<MarkerData[]>([]);
  const [filter, setFilter] = useState<string>("All Equipment");

  const clearMarkers = () => {
    markers.map((item) => item.marker.remove());
    setMarkers([]);
  };

  const getEquipmentStatusIcon = (eq: EquipmentLocation) => {
    if (eq.vehicleType === "EXCAVATOR") {
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
    } else if (eq.vehicleType === "DUMP_TRUCK") {
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

  const rippleIcon = (eq) => {
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

    const standardIconTemplate = `<div style="${textStyle}">${eq.name}</div>
                <div id="imageContainer" style="position: absolute;bottom: 5px;transform: translateX(-40%); z-index:1;">
                  <img src="${getEquipmentStatusIcon(
                    eq
                  )}" alt="Description of the image">
                </div>`;

    const icon = document.createElement("div");
    icon.innerHTML = standardIconTemplate;
    return icon;
  };

  useEffect(() => {
    mapboxgl.accessToken =
      "pk.eyJ1IjoiaG1lc3VwcG9ydCIsImEiOiJjbHp1eTRibDAwMG05MmpvczE1ZHdham5qIn0.ZoE3pSipzwdf-0TkY3ezzw";

    if (mapRef.current) return;

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

    mapRef.current.addControl(new mapboxgl.ScaleControl());
    mapRef.current.addControl(
      new mapboxgl.NavigationControl({ visualizePitch: true })
    );
    mapRef.current.addControl(new mapboxgl.FullscreenControl());

    mapRef.current.on("style.load", () => {
      mapRef?.current?.setTerrain({ exaggeration: 2 });

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
    });
  }, []);

  useEffect(() => {
    clearMarkers();
    const markersData: MarkerData[] = [];
    let filteredEquipment: EquipmentLocation[] = [];
    if (filter === "All Equipment") {
      filteredEquipment = equipments;
    } else {
      filteredEquipment = equipments.filter(
        (item) => item.vehicleType === filter
      );
    }

    filteredEquipment.map((eq) => {
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
    setMarkers(markersData);
  }, [clearMarkers, filter]);

  return (
    <React.Fragment>
      <Row>
        <Col>
          <div
            id="map"
            ref={mapContainer}
            className="map-container"
            style={{
              height: "calc(100vh - 274px)",
              width: "100%",
              borderRadius: "16px",
            }}
          ></div>
        </Col>
      </Row>
    </React.Fragment>
  );
};

export default DiggingOptimisationMapView;
