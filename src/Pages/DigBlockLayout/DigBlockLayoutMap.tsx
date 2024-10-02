import React, { useEffect, useRef, useState } from "react";
import ReactDOMServer from "react-dom/server";
import mapboxgl from "mapbox-gl";
import BlockPopupContent from "./BlockPopupContent";
import { useDispatch } from "react-redux";
import { useSelector } from "react-redux";
import { getAllMaterials } from "slices/thunk";
import { MaterialSelector } from "selectors";

const DigBlockLayoutMap = (data: any) => {
  const mapContainer = useRef(null);
  const mapRef = useRef<any>(null);
  const popupRef = useRef<mapboxgl.Popup | null>(null);
  const dispatch: any = useDispatch();

  const [lng] = useState(120.44477292688124);
  const [lat] = useState(-29.147190282051838);

  const { materials } = useSelector(MaterialSelector);

  useEffect(() => {
    dispatch(getAllMaterials(1, 100));
  }, [dispatch]);

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

    const getColorByName = (materialName) => {
      const material = materials.find((item) => item.name === materialName);
      return material ? material.color : null;
    };

    data &&
      data.data.map((feature) =>
        mapRef.current.on("load", () => {
          mapRef.current.addSource(feature.id, {
            type: "geojson",
            data: feature.geoJson,
          });

          mapRef.current.addLayer({
            id: feature.id,
            type: "fill",
            source: feature.id,
            layout: {},
            paint: {
              "fill-color": feature.color
                ? feature.color
                : getColorByName(feature.blockId),
              "fill-opacity": 0.5,
            },
          });

          mapRef.current.on("mouseenter", feature.id, (e) => {
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
                  <BlockPopupContent properties={properties} />
                )
              )
              .addTo(mapRef.current);
          });

          // Remove the popup when the cursor leaves the layer
          mapRef.current.on("mouseleave", feature.id, () => {
            mapRef.current.getCanvas().style.cursor = "";
            if (popupRef.current) {
              popupRef.current.remove();
              popupRef.current = null; // Clear the reference
            }
          });

          const bounds = new mapboxgl.LngLatBounds();
          const coordinates = feature.geoJson.geometry.coordinates.flat();
          coordinates.forEach(([lng, lat]) => bounds.extend([lng, lat]));

          // Fit map to bounds
          mapRef.current.fitBounds(bounds, { padding: 20 });
        })
      );
  }, [data, lat, lng, materials]);

  return (
    <div
      id="map"
      ref={mapContainer}
      className="map-container"
      style={{ height: "80vh", width: "100%" }}
    ></div>
  );
};

export default DigBlockLayoutMap;
