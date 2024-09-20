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

const groupByAltitudeChange = (data) => {
  let result: any = [];
  let currentGroup: any = [];
  let isSeparateSegment = false;

  const calculatePercentageDiff = (startAltitude, endAltitude) => {
    const diff = endAltitude - startAltitude;
    return (diff / startAltitude) * 100;
  };

  const createSegment = (color, coordinates) => {
    return {
      type: "Feature",
      properties: {
        color: color,
      },
      geometry: {
        type: "LineString",
        coordinates: coordinates,
      },
    };
  };

  for (let i = 0; i < data.length; i++) {
    const currentPoint = data[i];
    const currentAltitude = currentPoint[2];

    if (currentGroup.length === 0) {
      currentGroup.push(currentPoint);
      continue;
    }

    const prevAltitude = currentGroup[currentGroup.length - 1][2];

    if (currentAltitude > prevAltitude) {
      currentGroup.push(currentPoint);
    } else {
      const firstAltitude = currentGroup[0][2];
      const lastAltitude = currentGroup[currentGroup.length - 1][2];
      const percentageDiff = calculatePercentageDiff(
        firstAltitude,
        lastAltitude
      );

      if (percentageDiff > 10) {
        result.push(createSegment("red", currentGroup));
        isSeparateSegment = true;
      } else {
        if (isSeparateSegment) {
          result.push(createSegment("green", currentGroup));
          isSeparateSegment = false;
        } else {
          if (result.length > 0) {
            const resultLast = result[result.length - 1];
            const segment = createSegment("green", [
              ...resultLast.geometry.coordinates,
              ...currentGroup,
            ]);
            result[result.length - 1] = segment;
          } else {
            result.push(createSegment("green", currentGroup));
          }
        }
      }

      currentGroup = [currentPoint];
    }
  }

  if (currentGroup.length > 0) {
    if (isSeparateSegment) {
      result.push(createSegment("green", currentGroup));
      isSeparateSegment = false;
    } else {
      if (result.length > 0) {
        const resultLast = result[result.length - 1];

        const segment = createSegment("green", [
          ...resultLast.geometry.coordinates,
          ...currentGroup,
        ]);

        result[result.length - 1] = segment;
      } else {
        result.push(createSegment("green", currentGroup));
      }
    }
  }

  return result;
};

const HaulRoadOptimisationMapView = (props: any) => {
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

      const coordinates = [
        [120.46148767661117, -29.16033968851883, 440.2],
        [120.46184222117523, -29.160274225886972, 440.2],
        [120.46220952072366, -29.16030484065437, 440.2],
        [120.46258249949585, -29.16033699988872, 440.3],
        [120.46277326860877, -29.16026722276841, 440.34],
        [120.46275262078825, -29.160171795132214, 440.5],
        [120.46251316331558, -29.160114887093783, 441.2],
        [120.46221754609229, -29.160060893951496, 441.6],
        [120.46189554112726, -29.159999855144363, 441.8],
        [120.46155133597233, -29.15998730052337, 441.9],
        [120.46117568395067, -29.160021036870667, 442.9],
        [120.46095605741647, -29.1600825401936, 443.9],
        [120.46079409333265, -29.16021311848563, 444.9],
        [120.46031947932198, -29.160587819017664, 445.9],
        [120.45973708601429, -29.161054400991283, 490.1],
        [120.45939273500647, -29.161319167044212, 443.2],
        [120.45915968669186, -29.161496084286547, 443.3],
        [120.45852048281313, -29.16192568657, 442.6],
        [120.4578411069337, -29.162305290617304, 442.4],
        [120.45728146865713, -29.162506038676277, 442.4],
        [120.45399110303845, -29.163561999529975, 442.5],
        [120.45268259843493, -29.16377412464594, 442.5],
        [120.45135359225998, -29.163808140748372, 442.5],
        [120.45080388793946, -29.163754028432813, 442.5],
        [120.4501552303617, -29.163241589926926, 442.5],
        [120.44949210359948, -29.16218141159473, 442.4],
        [120.44882258296752, -29.160876810702433, 442.3],
        [120.4469554640994, -29.157217044335567, 442.1],
      ];

      const featuresSegments = groupByAltitudeChange(coordinates);

      mapRef.current.on("load", () => {
        mapRef.current.addSource("path", {
          type: "geojson",
          data: {
            type: "FeatureCollection",
            features: featuresSegments,
          },
        });

        mapRef.current.addLayer({
          id: "path-line",
          type: "line",
          source: "path",
          layout: {
            "line-join": "round",
            "line-cap": "round",
          },
          paint: {
            "line-width": 4,
            "line-color": [
              "match",
              ["get", "color"],
              "red",
              "red",
              "greeen",
              "green",
              "green",
            ],
          },
        });
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

export default HaulRoadOptimisationMapView;
