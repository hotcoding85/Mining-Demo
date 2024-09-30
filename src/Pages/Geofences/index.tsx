import React, { useEffect, useRef, useState } from 'react';
import { Container, Row, Col } from 'reactstrap';
import _ from 'lodash';


import mapboxgl, { LngLatLike } from 'mapbox-gl'; // eslint-disable-line import/no-webpack-loader-syntax
import MapboxDraw from '@mapbox/mapbox-gl-draw';

import 'mapbox-gl/dist/mapbox-gl.css';
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css';
import { buildGraticule } from 'utils/mapUtils';
import { useDispatch, useSelector } from 'react-redux';
import { getGeoFences } from 'slices/thunk';
import { createSelector } from 'reselect';
import ReactDOMServer from 'react-dom/server';
import BlockPopupContent from 'Pages/DigBlockLayout/BlockPopupContent';

const Geofences = ({ socket }) => {

    document.title = "Geofences | FMS Live";

    const dispatch: any = useDispatch();
    const mapContainer = useRef(null);
    const mapRef = useRef<any>(null);
    const [lng, setLng] = useState(120.44463458272295,);
    const [lat, setLat] = useState(-29.146790943732764);
    const [zoom, setZoom] = useState(19.5);
    const [mapStylesLoaded, setMapStylesLoaded] = useState<boolean>(false);

    const popupRef = useRef<mapboxgl.Popup | null>(null);

    function getBlockColor(blockId: string): string {
        switch (blockId) {
            case 'WS01':
                return "#514937";
            case 'WS02':
                return "#645631";
            case 'WS03':
                return "#78622B";
            case 'IG01':
                return "#C49312";
            case 'IG02':
                return "#B18618";
            case 'IG03':
                return "#9E7A1E";
            case 'LG01':
                return "#8B6E25";
            case 'HG01':
                return "#FFB800";
            case 'HG02':
                return "#EBAB06";
            case 'HG03':
                return "#D89F0C";
            default:
                return "#000000"; // Default color if blockId doesn't match any case
        }
    }

    function addActiveMarker(lngLat) {
        const el = document.createElement('div');
        el.className = 'activemarker';
        new mapboxgl.Marker({ element: el }).setLngLat(lngLat).addTo(mapRef.current);
    }

    function addDelayMarker(lngLat) {
        const el = document.createElement('div');
        el.className = 'delaymarker';
        new mapboxgl.Marker(el).setLngLat(lngLat).addTo(mapRef.current);
    }

    useEffect(() => {
        dispatch(getGeoFences()); // Dispatch action to fetch data on component mount
    }, [dispatch]);

    const selectProperties = createSelector(
        (state: any) => state.GeoFence,
        (GeoFence) => ({
            data: GeoFence ? GeoFence.data : [],
            total: GeoFence ? GeoFence.total : 0,
        })
    );

    const { data: fences } = useSelector(selectProperties);

    useEffect(() => {
        if (mapStylesLoaded) {
            fences.map((feature) => {
                mapRef.current?.addSource(feature.id, {
                    type: "geojson",
                    data: feature.geoJson,
                });
    
                mapRef.current?.addLayer({
                    id: feature.id,
                    type: "fill",
                    source: feature.id,
                    layout: {},
                    paint: {
                        "fill-color": "#000000",
                        "fill-opacity": 0.1,
                    },
                });
    
                mapRef.current?.on("mouseenter", feature.id, (e) => {
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
                mapRef.current?.on("mouseleave", feature.id, () => {
                    mapRef.current.getCanvas().style.cursor = "";
                    // if (popupRef.current) {
                    //   popupRef.current.remove();
                    //   popupRef.current = null; // Clear the reference
                    // }
                });
    
                const bounds = new mapboxgl.LngLatBounds();
                const coordinates = feature.geoJson.geometry.coordinates.flat();
                coordinates.forEach(([lng, lat]) => bounds.extend([lng, lat]));
    
                // Fit map to bounds
                // mapRef.current?.fitBounds(bounds, { padding: 20 });
            }
            );
        }
    }, [fences])

    useEffect(() => {
        mapboxgl.accessToken = 'pk.eyJ1IjoiaG1lc3VwcG9ydCIsImEiOiJjbHp1eTRibDAwMG05MmpvczE1ZHdham5qIn0.ZoE3pSipzwdf-0TkY3ezzw';

        if (mapRef.current) return; // initialize map only once

        mapRef.current = new mapboxgl.Map({
            container: mapContainer.current!,
            style: 'mapbox://styles/hmesupport/cm00qombw008z01oe8pcf6j2m', //'mapbox://styles/mapbox/standard-satellite',
            center: [lng, lat],
            zoom: zoom,
            pitch: 60,
            antialias: true, // create the gl context with MSAA antialiasing, so custom layers are antialiased
            minZoom: 0,

        });

        // parameters to ensure the model is georeferenced correctly on the map
        const modelOrigin: LngLatLike = [lng, lat];
        const modelAltitude = 0;
        const modelRotate = [Math.PI / 2, 0, 0];

        const modelAsMercatorCoordinate = mapboxgl.MercatorCoordinate.fromLngLat(
            modelOrigin,
            modelAltitude
        );

        // transformation parameters to position, rotate and scale the 3D model onto the map
        const modelTransform = {
            translateX: modelAsMercatorCoordinate.x,
            translateY: modelAsMercatorCoordinate.y,
            translateZ: modelAsMercatorCoordinate.z,
            rotateX: modelRotate[0],
            rotateY: modelRotate[1],
            rotateZ: modelRotate[2],
            /* Since the 3D model is in real world meters, a scale transform needs to be
             * applied since the CustomLayerInterface expects units in MercatorCoordinates.
             */
            scale: modelAsMercatorCoordinate.meterInMercatorCoordinateUnits()
        };

        mapRef.current.addControl(new mapboxgl.ScaleControl());
        mapRef.current.addControl(new mapboxgl.NavigationControl({ visualizePitch: true }));
        mapRef.current.addControl(new mapboxgl.FullscreenControl());

        const drawControl = new MapboxDraw({ defaultMode: 'draw_polygon' })
        // mapRef.current.addControl(drawControl);
        mapRef.current.on('draw.create', updateArea);
        function updateArea(e) {
            console.log(e)
        }

        mapRef.current.on('style.load', () => {
            // mapRef.current.addLayer({
            //     id: 'custom-threebox-model',
            //     type: 'custom',
            //     renderingMode: '3d',
            //     onAdd: function () {
            //         window.tb = new Threebox(
            //             mapRef.current,
            //             mapRef.current.getCanvas().getContext('webgl'),
            //             { defaultLights: true }
            //         );
            //         const scale = 1;
            //         const options = {
            //             obj: surfaceGLB,
            //             type: 'gltf',
            //             scale: 0.75,
            //             units: 'meters',
            //             // rotation: { x: 90, y: -90, z: 0 }
            //         };

            //         window.tb.loadObj(options, (model) => {
            //             console.log('loadObj', options, model)
            //             model.setCoords([120.452246,
            //                 -29.160889]);
            //             // model.setRotation({ x: 0, y: 0, z: 0 });
            //             window.tb.add(model);
            //             window.tb.createTerrainLayer()
            //         });
            //     },

            //     render: function () {
            //         window.tb.update();
            //     }
            // });
            setMapStylesLoaded(true);
        });

        let hoveredPolygonId = null;

        mapRef.current.on('load', () => {

            mapRef.current.setTerrain({ 'exaggeration': 2 });

            const graticule = buildGraticule(lat, lng);
            mapRef.current.addSource('graticule', {
                type: 'geojson',
                data: graticule
            });

            mapRef.current.addLayer({
                id: 'graticule',
                type: 'line',
                source: 'graticule',
                minzoom: 18,
                layout: {},
                paint: {
                    'line-color': 'gray',
                    'line-width': 1
                }
            });

        });

    }, []);

    return (
        <React.Fragment>
            <div className="page-content">
                <Container fluid>
                    <Row>
                        <Col md="12">
                            <div ref={mapContainer} className="map-container" style={{ height: 'calc(100vh - 180px)', width: '100%' }} />
                        </Col>
                    </Row>
                </Container>
            </div>
        </React.Fragment>
    );
}

export default Geofences;