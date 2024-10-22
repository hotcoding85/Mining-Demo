import { useCallback, useEffect, useRef, useState } from "react";
import ReactDOMServer from "react-dom/server";

// map modules
import MapboxDraw from "@mapbox/mapbox-gl-draw";
import mapboxgl from "mapbox-gl";
import * as turf from "@turf/turf";
import RBush from "rbush";
import bbox from "@turf/bbox";

// redux
import { useDispatch } from "react-redux";
import { addGeoFence, updateGeoFence, addBench } from "slices/thunk";

// lodush
import _ from "lodash";

// toast
import { toast } from "react-toastify";

// components
import WasteDumpPopContent from "Pages/WasteDumpManagement/components/WasteDumpPopContent";

// import styles
import "mapbox-gl/dist/mapbox-gl.css";
import "@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css";

// default wasted's polygon and line color - 'green'
const defaultColor = "#00ff00";
// fastest indexing with the large geojson file
const index = new RBush();

export const useInitPolygonMap = (props: {
  mapContainer: any;
  mapCenter: [number, number];
  wasteDumpFences: any[];
  category: "WASTE_DUMP" | "ORE_DUMP";
  fence: any;
  setFence: (fence: any) => void;
  handleOpenEditModal: () => void;
  handleCloseEditModal: () => void;
  handleCloseBoundboxModal: () => void;
}) => {
  const {
    mapContainer,
    mapCenter,
    wasteDumpFences,
    category,
    fence,
    setFence,
    handleOpenEditModal,
    handleCloseEditModal,
    handleCloseBoundboxModal,
  } = props;

  // dispatch
  const dispatch: any = useDispatch();

  // ref values
  const mapRef = useRef<any>(null);
  const drawRef = useRef<MapboxDraw>();
  const geojsonData = useRef<any>();
  const popupRef = useRef<mapboxgl.Popup | null>(null);

  // state values
  const [geoJson, setGeoJson] = useState<any>(null);
  const [mapStylesLoaded, setMapStylesLoaded] = useState<boolean>(false);

  useEffect(() => {
    if (mapRef.current) return; // Initialize map only once

    mapboxgl.accessToken =
      process.env.MAPBOX_API_KEY ||
      "pk.eyJ1IjoibXlreXRhcyIsImEiOiJjbTA1MGhtb3YwY3Y0Mm5uY3FzYWExdm93In0.cSDrE0Lq4_PitPdGnEV_6w";

    mapRef.current = new mapboxgl.Map({
      container: mapContainer.current!,
      style: "mapbox://styles/mykytas/cm0o2duin00ga01pw7e6s5gj1", //'mapbox://styles/mapbox/standard-satellite',
      center: mapCenter,
      zoom: 14, // Adjust zoom level
      interactive: true,
      pitch: 45,
      bearing: 150,
      antialias: true, // create the gl context with MSAA antialiasing, so custom layers are antialiased
      minZoom: 0,
    });

    drawRef.current = new MapboxDraw({
      displayControlsDefault: false,
      controls: {
        polygon: true,
        trash: true,
      },
      defaultMode: "draw_polygon",
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
      setMapStylesLoaded(true);
    });

    mapRef.current.on("zoom", () => {});

    mapRef.current.on("load", () => {
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

    const drawSelectionChange = (e) => {
      const selected = drawRef.current.getSelected();
      if (selected.features.length > 0) {
        setGeoJson(selected.features[0]);
      } else {
        setGeoJson(null);
      }
    };

    mapRef.current.on("draw.selectionchange", drawSelectionChange);

    return () => {
      if (mapRef.current) {
        mapRef.current.off("draw.selectionchange", drawSelectionChange);
      }
    };
  }, []);

  const drawPolygon = useCallback(
    (polygonData, polygonId = "polygon", color = defaultColor) => {
      if (mapRef.current.getSource(polygonId)) {
        (mapRef.current.getSource(polygonId) as mapboxgl.GeoJSONSource).setData(
          polygonData
        );
      } else {
        mapRef.current.addSource(polygonId, {
          type: "geojson",
          data: polygonData,
        });

        mapRef.current.addLayer({
          id: `${polygonId}-layer`,
          type: "fill",
          source: polygonId,
          paint: {
            "fill-color": color,
            "fill-opacity": 0.5,
          },
        });
      }
    },
    [defaultColor]
  );

  const removePolygonSourceAndLayer = useCallback((polygonId) => {
    if (mapRef.current?.getSource(polygonId)) {
      mapRef.current.removeLayer(`${polygonId}-layer`);
      mapRef.current.removeSource(polygonId);
    }
  }, []);

  const handleSetEventListners = useCallback((fence: any) => {
    const fenceDBClick = (e) => {
      e.preventDefault();
      setFence(fence);
      handleOpenEditModal();
    };

    const fenceMouseOver = (e) => {
      mapRef.current.getCanvas().style.cursor = "pointer";
      const coordinates = e.lngLat;
      const properties = e.features[0].properties;

      // Remove existing popup if it exists
      if (popupRef.current) {
        popupRef.current.remove();
      }

      // Create and display a new popup

      popupRef.current = new mapboxgl.Popup({ closeButton: false })
        .setLngLat(coordinates)
        .setHTML(
          ReactDOMServer.renderToString(
            <WasteDumpPopContent properties={properties} />
          )
        )
        .addTo(mapRef.current);
    };

    const fenceMouseLeave = () => {
      mapRef.current.getCanvas().style.cursor = "";
      if (popupRef.current) {
        popupRef.current.remove();
        popupRef.current = null; // Clear the reference
      }
    };

    const fenceLayerId = `${fence.id}-layer`;

    mapRef.current.on("dblclick", fenceLayerId, fenceDBClick);
    mapRef.current.on("mouseover", fenceLayerId, fenceMouseOver);
    mapRef.current.on("mouseleave", fenceLayerId, fenceMouseLeave);
  }, []);

  useEffect(() => {
    const drawGeofences = _.debounce((fences) => {
      fences.forEach((fence) => {
        if (!!mapRef.current) {
          if (
            (mapRef.current?.getLayer(`${fence.id}-layer`) as mapboxgl.Layer)
              ?.paint?.["fill-color"] !== fence.color
          ) {
            removePolygonSourceAndLayer(fence.id);
          }
          drawPolygon(fence.geoJson, fence.id, fence.color);
        }
      });
    }, 1000);

    if (mapStylesLoaded && wasteDumpFences.length > 0 && !!mapRef.current) {
      drawGeofences(wasteDumpFences);
    }

    return () => {
      drawGeofences.cancel();
    };
  }, [wasteDumpFences, mapStylesLoaded]);

  useEffect(() => {
    const setEventListners = _.debounce((fences) => {
      fences.forEach((fence) => {
        if (!!mapRef.current) {
          handleSetEventListners(fence);
        }
      });
    }, 500);

    if (wasteDumpFences.length > 0 && mapRef.current) {
      setEventListners(wasteDumpFences);
    }

    return () => {
      setEventListners.cancel();
    };
  }, [handleSetEventListners, wasteDumpFences]);

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

  const handleSaveFence = async (
    bench: any,
    name: string,
    color: string,
    newBench?: any
  ) => {
    const coordinates = geoJson?.geometry?.coordinates || [];
    let response;
    if (newBench && !bench) {
      response = await dispatch(addBench(newBench));
    }
    // Check if editing an existing fence
    if (fence) {
      const success = await dispatch(
        updateGeoFence(fence.id, {
          name,
          locationId: !!bench?.id ? bench?.id : response?.id,
          color,
        })
      );
      if (success) {
        handleCloseEditModal();
      }
      return;
    }

    // Handle case where geoJson is required
    if (!geoJson) {
      toast.error("No selected polygon!");
      return;
    }

    // Validate polygon coordinates
    if (coordinates[0]?.length <= 2) {
      toast.error("Invalid polygon data!");
      return;
    }

    // Add new GeoFence
    const success = await dispatch(
      addGeoFence({
        name,
        locationId: !!bench?.id ? bench?.id : response?.id,
        geoJson: {
          type: "Feature",
          geometry: {
            type: "Polygon",
            coordinates: [...coordinates],
          },
        },
        category: category,
        color,
      })
    );

    if (success) {
      drawRef.current?.deleteAll();
      handleCloseEditModal();
      setGeoJson(null);
    }
  };

  const toggleDrawController = (drawing) => {
    if (!drawing) {
      mapRef.current.removeControl(drawRef.current);
    } else {
      mapRef.current.addControl(drawRef.current);
    }
  };

  return {
    handleUpdateBoundboxValues,
    handleSaveFence,
    removePolygonSourceAndLayer,
    toggleDrawController,
  };
};
