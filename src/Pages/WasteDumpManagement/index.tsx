import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
// import module that is related with map
import mapboxgl from "mapbox-gl";
import * as turf from "@turf/turf";
import bbox from "@turf/bbox";
import RBush from "rbush";
// lodush
import _ from "lodash";
// components
import Breadcrumb from "Components/Common/Breadcrumb";
// reacstrap
import { Button, Card, Col, Container, Row } from "reactstrap";
// ant design
import { Tooltip } from "antd";
// redux
import { createSelector } from "reselect";
import { useSelector } from "react-redux";
// import modals
import WasteEditModal from "./components/WasteEditModal";
import BoundingBoxModal from "Pages/AutoRouting/BoundingBoxModal";
// import styles
import './styles.scss';

// default wasted's polygon and line color - 'green'
const defaultColor = "#00ff00";
// fastest indexing with the large geojson file
const index = new RBush();

const WasteDumpManagement = () => {
  document.title = "Waste Dump Management | FMS Live";

  // ref values
  const mapContainer = useRef(null);
  const mapRef = useRef<any>(null);
  const routeMarkers = useRef<mapboxgl.Marker[]>([]);

  // state values
  const [lng, setLng] = useState(120.44871814239025);
  const [lat, setLat] = useState(-29.1576602184213);
  const [drawing, setDrawing] = useState<boolean>(false);
  const [coordinates, setCoordinates] = useState<[number, number][]>([]);

  // modal state values
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isBoundboxModalOpen, setIsBoundboxModalOpen] =
    useState<boolean>(false);

  const handleOpenEditModal = useCallback(() => setIsModalOpen(true), []);
  const handleCloseEditModal = useCallback(() => setIsModalOpen(false), []);

  const handleOpenBoundboxModal = useCallback(
    () => setIsBoundboxModalOpen(true),
    []
  );
  const handleCloseBoundboxModal = useCallback(
    () => setIsBoundboxModalOpen(false),
    []
  );

  const geojsonData = useRef<any>();

  useEffect(() => {
    // get routeData
    if (mapRef.current) return; // Initialize map only once

    mapboxgl.accessToken =
      process.env.MAPBOX_API_KEY ||
      "pk.eyJ1IjoibXlreXRhcyIsImEiOiJjbTA1MGhtb3YwY3Y0Mm5uY3FzYWExdm93In0.cSDrE0Lq4_PitPdGnEV_6w";

    if (mapRef.current) return; // initialize map only once

    mapRef.current = new mapboxgl.Map({
      container: mapContainer.current!,
      style: "mapbox://styles/mykytas/cm0o2duin00ga01pw7e6s5gj1", //'mapbox://styles/mapbox/standard-satellite',
      center: [lng, lat],
      zoom: 18, // Adjust zoom level
      interactive: true,
      pitch: 45,
      bearing: 150,
      antialias: true, // create the gl context with MSAA antialiasing, so custom layers are antialiased
      minZoom: 0,
    });

    mapRef.current.addControl(new mapboxgl.ScaleControl());
    mapRef.current.addControl(
      new mapboxgl.NavigationControl({ visualizePitch: true })
    );
    mapRef.current.addControl(new mapboxgl.FullscreenControl());

    mapRef.current.on("style.load", () => {
      mapRef.current?.addSource("mapbox-terrain-rgb", {
        type: "raster-dem",
        url: "mapbox://mapbox.terrain-rgb",
        tileSize: 512,
        maxzoom: 15,
      });

      mapRef.current?.setTerrain({
        source: "mapbox-terrain-rgb",
        exaggeration: 1,
      });
    });

    mapRef.current.on("zoom", () => {});

    mapRef.current.on("load", () => {
      // Get 3D pit geojson data for calculating elevation
      fetch("./240817_Pits_3D_WGS84.geojson")
        .then((response) => response.json())
        .then((_geojsonData: turf.AllGeoJSON) => {
          geojsonData.current = _geojsonData;

          _.map(geojsonData.current.features, (feature) => {
            const bounds = bbox(feature);
            const item = {
              minX: bounds[0],
              minY: bounds[1],
              maxX: bounds[2],
              maxY: bounds[3],
              feature: feature,
            };
            index.insert(item);
          });
        })
        .catch((error) => console.error("Error loading GeoJSON data:", error));
    });

    mapRef.current.on("click", handleMapClick);
    mapRef.current.on("dblclick", handleMapDBClick);
    mapRef.current.doubleClickZoom.disable();

    return () => {
      if (mapRef.current) {
        mapRef.current.off("click", handleMapClick);
        mapRef.current.off("dblclick", handleMapDBClick);
      }
    };
  }, []);

  const geoFencesProperties = createSelector(
    (state: any) => state.GeoFence,
    (GeoFence) => ({
      geoFence: GeoFence.data,
    })
  );
  const { geoFence } = useSelector(geoFencesProperties);

  const drawLine = useCallback((lineData) => {
    if (mapRef.current.getSource("line")) {
      (mapRef.current.getSource("line") as mapboxgl.GeoJSONSource).setData(
        lineData
      );
    } else {
      mapRef.current.addSource("line", {
        type: "geojson",
        data: lineData,
      });

      mapRef.current.addLayer({
        id: "line-layer",
        type: "line",
        source: "line",
        layout: {
          "line-join": "round",
          "line-cap": "round",
        },
        paint: {
          "line-color": defaultColor,
          "line-width": 2,
        },
      });
    }
  }, []);

  const removeLineSourceAndLayer = useCallback(() => {
    if (mapRef.current?.getSource("line")) {
      mapRef.current.removeLayer("line-layer");
      mapRef.current.removeSource("line");
    }
  }, []);

  const drawPolygon = useCallback((polygonData) => {
    if (mapRef.current.getSource("polygon")) {
      (mapRef.current.getSource("polygon") as mapboxgl.GeoJSONSource).setData(
        polygonData
      );
    } else {
      mapRef.current.addSource("polygon", {
        type: "geojson",
        data: polygonData,
      });

      mapRef.current.addLayer({
        id: "polygon-layer",
        type: "fill",
        source: "polygon",
        layout: {
          "line-join": "round",
          "line-cap": "round",
        },
        paint: {
          "fill-color": defaultColor,
          "fill-opacity": 0.5,
        },
      });
    }
  }, []);

  const removePolygonSourceAndLayer = useCallback(() => {
    if (mapRef.current?.getSource("polygon")) {
      mapRef.current.removeLayer("polygon-layer");
      mapRef.current.removeSource("polygon");
    }
  }, []);

  const drawMarker = useCallback((newCoords) => {
    let _routePointMarker;
    if (routeMarkers.current.length > 0) {
      const markerElement = document.createElement("div");
      markerElement.style.backgroundColor = "yellow";
      markerElement.style.width = "8px";
      markerElement.style.height = "8px";
      markerElement.style.borderRadius = "50%";
      markerElement.style.cursor = "pointer";
      _routePointMarker = new mapboxgl.Marker(markerElement)
        .setLngLat(newCoords as [number, number])
        .addTo(mapRef.current);
    } else {
      _routePointMarker = new mapboxgl.Marker({ color: "yellow", scale: 0.8 })
        .setLngLat(newCoords as [number, number])
        .addTo(mapRef.current);
    }
    routeMarkers.current.push(_routePointMarker);
  }, []);

  const handlePopMarker = useCallback(() => {
    const lastMarker = routeMarkers.current.pop();
    lastMarker?.remove();
  }, []);

  const isNearPreviousPoint = (
    coords: [number, number],
    prevCoords: [number, number] | null,
    threshold: number
  ) => {
    if (!prevCoords) return false;
    const distance = Math.sqrt(
      Math.pow(prevCoords[0] - coords[0], 2) +
        Math.pow(prevCoords[1] - coords[1], 2)
    );
    return distance < threshold;
  };

  const handleMapClick = useCallback(
    (e: mapboxgl.MapMouseEvent) => {
      if (!drawing) return;
      const lngLat: [number, number] = [e.lngLat.lng, e.lngLat.lat];

      const proximityThreshold2 = 0.00005;

      const prevPoint =
        coordinates.length > 0 ? coordinates[coordinates.length - 1] : null;
      if (
        isNearPreviousPoint(
          lngLat as [number, number],
          prevPoint as [number, number],
          proximityThreshold2
        )
      ) {
        return;
      }

      // Add clicked point to coordinates state for drawing a line
      setCoordinates((prevCoords) => {
        const updatedCoordinates = [
          ...(mapRef.current?.getSource("polygon")
            ? prevCoords.slice(0, -1)
            : prevCoords),
          lngLat,
        ];
        if (mapRef.current) {
          drawMarker(lngLat);
        }

        removePolygonSourceAndLayer();

        if (updatedCoordinates.length > 1) {
          const lineData: any = {
            type: "Feature",
            properties: {},
            geometry: {
              type: "LineString",
              coordinates: updatedCoordinates,
            },
          };

          if (mapRef.current) {
            drawLine(lineData);
          }
        }

        return updatedCoordinates;
      });
    },
    [drawing, coordinates]
  );

  useEffect(() => {
    if (mapRef.current) {
      mapRef.current.on("click", handleMapClick);
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.off("click", handleMapClick);
      }
    };
  }, [mapRef.current, handleMapClick]);

  const handleMapDBClick = useCallback((e: mapboxgl.MapMouseEvent) => {
    e.preventDefault(); // Prevent map zooming on double click

    // Draw polygon based on current coordinates state
    setCoordinates((prevCoords) => {
      const updatedCoordinates = [...prevCoords, prevCoords[0]];

      const polygonData: any = {
        type: "Feature",
        properties: {},
        geometry: {
          type: "Polygon",
          coordinates: [updatedCoordinates],
        },
      };

      removeLineSourceAndLayer();

      if (mapRef.current) {
        drawPolygon(polygonData);
      }

      return updatedCoordinates;
    });
  }, []);

  useEffect(() => {
    if (mapRef.current) {
      mapRef.current.on("dbclick", handleMapDBClick);
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.off("dbclick", handleMapDBClick);
      }
    };
  }, [mapRef.current, handleMapDBClick]);

  const handleSaveRoute = () => {};

  const handleUndo = useCallback(() => {
    if (!drawing) return;
    setCoordinates((prevCoords) => {
      if (prevCoords.length === 0) {
        handlePopMarker();
        return prevCoords;
      }

      const updatedCoordinates = prevCoords.slice(0, -1);

      const lastCoord = prevCoords[prevCoords.length - 1];
      const isLastCoordDifferentFromFirst =
        prevCoords[0][0] !== lastCoord[0] || prevCoords[0][1] !== lastCoord[1];

      if (isLastCoordDifferentFromFirst || prevCoords.length === 1) {
        handlePopMarker();
      }

      const routeData: any = {
        type: "Feature",
        properties: {},
        geometry: {
          type: "LineString",
          coordinates: updatedCoordinates,
        },
      };

      removePolygonSourceAndLayer();

      if (mapRef.current) {
        drawLine(routeData);
      }

      return updatedCoordinates;
    });
  }, [drawing]);

  const handleClearRoute = () => {
    setCoordinates([]);
    removeLineSourceAndLayer();
    removePolygonSourceAndLayer();
    _.map(routeMarkers.current, (_marker) => {
      _marker.remove();
    });
  };

  const handleUpdateBoundboxValues = (_minLng, _minLat, _maxLng, _maxLat) => {
    // Convert the center coordinates from UTM to WGS84
    if (mapRef.current && _minLng && _minLat && _maxLng && _maxLat) {
      const bounds: [[number, number], [number, number]] = [
        [parseFloat(_minLng), parseFloat(_minLat)],
        [parseFloat(_maxLng), parseFloat(_maxLat)],
      ];
      mapRef.current.setMaxBounds(bounds);

      const centerLng = (parseFloat(_minLng) + parseFloat(_maxLng)) / 2;
      const centerLat = (parseFloat(_minLat) + parseFloat(_maxLat)) / 2;
      mapRef.current.flyTo({ center: [centerLng, centerLat] });
    }

    handleCloseBoundboxModal();
  };

  return (
    <React.Fragment>
      <div className="page-content wasted-dump-content">
        <Container fluid>
          <Breadcrumb
            title="Mine Controle"
            breadcrumbItem="Waste Dump Management"
          />
          <Row>
            <Col
              lg="12"
              className="d-flex justify-content-between align-items-start"
            >
              <div
                ref={mapContainer}
                className="map-container"
                style={{ height: "calc(100vh - 230px)", width: "80%" }}
              >
                <div className="mapboxgl-ctrl mapboxgl-ctrl-group my-bounding-box-group">
                  <Tooltip title="Set Bounding Box">
                    <button
                      className="mapboxgl-ctrl-zoom-in"
                      type="button"
                      onClick={handleOpenBoundboxModal}
                    >
                      <i className="fas fa-share-alt-square"></i>
                    </button>
                  </Tooltip>
                </div>

                <div
                  className="mapboxgl-ctrl mapboxgl-ctrl-group my-custom-ctrl-group"
                  style={{ display: !drawing ? "none" : "block" }}
                >
                  <Tooltip title="Save Route">
                    <button
                      className="mapboxgl-ctrl-zoom-in"
                      type="button"
                      onClick={handleOpenEditModal}
                    >
                      <i className="fas fa-save"></i>
                    </button>
                  </Tooltip>
                  <Tooltip title="Undo">
                    <button
                      className="mapboxgl-ctrl-zoom-in"
                      type="button"
                      onClick={handleUndo}
                    >
                      <i className="fas fa-undo"></i>
                    </button>
                  </Tooltip>
                  <Tooltip title="Clear">
                    <button
                      title=""
                      onClick={handleClearRoute}
                      className="mapboxgl-ctrl-zoom-in"
                      type="button"
                    >
                      <i className="fas fa-trash"></i>
                    </button>
                  </Tooltip>
                </div>
              </div>
              <Card
                style={{
                  height: "calc(100vh - 230px)",
                  width: "20%",
                  marginLeft: "15px",
                  padding: "16px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    justifyContent: "space-between",
                    fontSize: "20px",
                    alignItems: "center",
                  }}
                >
                  Waste Dump
                  <Button
                    onClick={() => {
                      setDrawing(!drawing);
                    }}
                  >
                    {drawing ? (
                      <>
                        <i className="fas fa-ellipsis-h"></i>
                      </>
                    ) : (
                      <i className="fas fa-plus"></i>
                    )}
                  </Button>
                </div>
                <div
                  style={{
                    height: "calc(100% - 100px)",
                    overflow: "auto",
                    marginTop: "16px",
                  }}
                ></div>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>
      <WasteEditModal
        isOpen={isModalOpen}
        onClose={handleCloseEditModal}
        wasteData={{
          color: defaultColor,
        }}
      />
      <BoundingBoxModal
        isVisible={isBoundboxModalOpen}
        handleOk={handleUpdateBoundboxValues}
        handleCancel={handleCloseBoundboxModal}
      />
    </React.Fragment>
  );
};

export default WasteDumpManagement;
