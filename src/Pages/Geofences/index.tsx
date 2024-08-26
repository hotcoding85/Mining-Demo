import React, { useEffect, useRef, useState } from 'react';
import { Container, Row, Col } from 'reactstrap';
import _ from 'lodash';

import geojson from './output.json';

import mapboxgl, { LngLatLike } from 'mapbox-gl'; // eslint-disable-line import/no-webpack-loader-syntax
import MapboxDraw from '@mapbox/mapbox-gl-draw';
import { Feature, FeatureCollection, GeoJsonObject, LineString } from 'geojson';
import { Threebox } from "threebox-plugin";
import { mapGLB, surfaceGLB } from '../../assets/images/map'

import 'mapbox-gl/dist/mapbox-gl.css';
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css';

const Geofences = ({ socket }) => {

    document.title = "Geofences | FMS Live";

    const mapContainer = useRef(null);
    const mapRef = useRef<any>(null);
    const [lng, setLng] = useState(120.44463458272295,);
    const [lat, setLat] = useState(-29.146790943732764);
    const [zoom, setZoom] = useState(18);


    function buildGraticule(): FeatureCollection {
        const METERS_PER_DEGREE_LATITUDE = 111320; // Approximate meters per degree of latitude
        const METERS_PER_DEGREE_LONGITUDE = (latitude: number) => METERS_PER_DEGREE_LATITUDE * Math.cos(latitude * Math.PI / 180);

        const DISTANCE_METERS = 5;
        const DEGREE_DISTANCE_LAT = DISTANCE_METERS / METERS_PER_DEGREE_LATITUDE;
        const DEGREE_DISTANCE_LNG = (latitude: number) => DISTANCE_METERS / METERS_PER_DEGREE_LONGITUDE(latitude);

        // Define bounding box: [minLng, minLat, maxLng, maxLat]
        const BOUNDING_BOX = [120.211908, -29.219094, 120.508539, -29.070215];
        const [minLng, minLat, maxLng, maxLat] = BOUNDING_BOX;

        const graticule: FeatureCollection = {
            type: 'FeatureCollection',
            features: []
        };

        // Draw latitude lines within the bounding box
        for (let lat = minLat; lat <= maxLat; lat += DEGREE_DISTANCE_LAT) {
            if (lat >= minLat && lat <= maxLat) { // Ensure lat is within the bounding box
                graticule.features.push({
                    type: 'Feature',
                    geometry: {
                        type: 'LineString',
                        coordinates: [
                            [minLng, lat],
                            [maxLng, lat]
                        ]
                    },
                    properties: { value: lat + '' + lng }
                });
            }
        }

        // Draw longitude lines within the bounding box
        for (let lng = minLng; lng <= maxLng; lng += DEGREE_DISTANCE_LNG((minLat + maxLat) / 2)) { // Average latitude for conversion
            if (lng >= minLng && lng <= maxLng) { // Ensure lng is within the bounding box
                graticule.features.push({
                    type: 'Feature',
                    geometry: {
                        type: 'LineString',
                        coordinates: [
                            [lng, minLat],
                            [lng, maxLat]
                        ]
                    },
                    properties: { value: lat + '' + lng }
                });
            }
        }
        return graticule;
    }

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

        // const THREE = window.THREE;


        addActiveMarker([
            120.44463458272295,
            -29.146790943732764
        ])

        addDelayMarker([
            120.44506272943079,
            -29.147310837480894
        ])

        addActiveMarker([
            120.44516509787695,
            -29.147993875066938
        ])


        mapRef.current.addControl(new mapboxgl.ScaleControl());
        mapRef.current.addControl(new mapboxgl.NavigationControl({ visualizePitch: true }));
        mapRef.current.addControl(new mapboxgl.FullscreenControl());

        const drawControl = new MapboxDraw({ defaultMode: 'draw_polygon' })
        mapRef.current.addControl(drawControl);
        mapRef.current.on('draw.create', updateArea);
        function updateArea(e) {
            console.log(e)
        }

        mapRef.current.on('style.load', () => {
            mapRef.current.addLayer({
                id: 'custom-threebox-model',
                type: 'custom',
                renderingMode: '3d',
                onAdd: function () {
                    window.tb = new Threebox(
                        mapRef.current,
                        mapRef.current.getCanvas().getContext('webgl'),
                        { defaultLights: true }
                    );
                    const scale = 1;
                    const options = {
                        obj: surfaceGLB,
                        type: 'gltf',
                        scale: 0.75,
                        units: 'meters',
                        // rotation: { x: 90, y: -90, z: 0 }
                    };

                    window.tb.loadObj(options, (model) => {
                        console.log('loadObj', options, model)
                        model.setCoords([120.452246,
                            -29.160889]);
                        // model.setRotation({ x: 0, y: 0, z: 0 });
                        window.tb.add(model);
                        window.tb.createTerrainLayer()
                    });
                },

                render: function () {
                    window.tb.update();
                }
            });
        });

        mapRef.current.on('zoom', () => {
            // const scale = (mapRef.current.getZoom()) * 0.4;

        });


        const graticule = buildGraticule();
        let hoveredPolygonId = null;

        mapRef.current.on('load', () => {

            // mapRef.current.addSource('my-dem', {
            //     'type': 'raster-dem',
            //     'url': 'mapbox://hmesupport.cbb8vfk7',
            //     'tileSize': 512,
            //     'maxzoom': 22
            // });
            // mapRef.current.setTerrain({ 'source': 'my-dem', 'exaggeration': 5 });

            // mapRef.current.addSource('tileset_data', {
            //     url: 'mapbox://hmesupport.cbb8vfk7',
            //     type: 'raster-dem',
            // });
            // mapRef.current.addLayer(
            //     {
            //         'id': 'tileset',
            //         'type': 'raster-dem',
            //         'source': 'tileset_data',
            //         'source-layer': '240801-a2ik8t',
            //     }
            // );

            // mapRef.current.addSource('mapbox-dem', {
            //     'type': 'raster-dem',
            //     'url': 'mapbox://hmesupport.cbb8vfk7',
            //     'tileSize': 512,
            // });
            // mapRef.current.setTerrain({ 'exaggeration': 3 });

            // const dat = _.groupBy(geojson.features, "properties.block_id")
            // Object.keys(dat).map((block) => {
            //     mapRef.current.addSource(block, {
            //         type: 'geojson',
            //         data: {
            //             type: 'FeatureCollection',
            //             features: dat[block]
            //         }
            //     });

            //     mapRef.current.addLayer({
            //         id: block + 'fill',
            //         type: 'fill',
            //         source: block,
            //         layout: {},
            //         paint: {
            //             'fill-color': getBlockColor(block),
            //         }
            //     });

            //     mapRef.current.addLayer({
            //         id: block + 'line',
            //         type: 'line',
            //         source: block,
            //         layout: {},
            //         paint: {
            //             'line-color': '#fff',
            //             'line-width': 1
            //         }
            //     });


            // })

            mapRef.current.on('mouseenter', 'HG01fill', (e) => {
                mapRef.current.getCanvas().style.cursor = 'pointer';
                console.log(e.features)
                if (e.features.length > 0) {
                    if (hoveredPolygonId !== null) {
                        mapRef.current.setFeatureState(
                            { source: 'HG01', id: hoveredPolygonId },
                            { hover: false }
                        );
                    }
                    hoveredPolygonId = e.features[0].source;
                    mapRef.current.setFeatureState(
                        { source: 'HG01', id: hoveredPolygonId },
                        { hover: true }
                    );
                }
            });

            mapRef.current.on('mouseleave', 'HG01fill', () => {
                mapRef.current.getCanvas().style.cursor = '';
                if (hoveredPolygonId !== null) {
                    mapRef.current.setFeatureState(
                        { source: 'HG01', id: hoveredPolygonId },
                        { hover: false }
                    );
                }
                hoveredPolygonId = null;
            });

            // mapRef.current.addSource('graticule', {
            //     type: 'geojson',
            //     data: graticule
            // });

            // mapRef.current.addLayer({
            //     id: 'graticule',
            //     type: 'line',
            //     source: 'graticule',
            //     layout: {},
            //     paint: {
            //         'line-color': 'gray',
            //         'line-width': 1
            //     }
            // });

        });

        return () => mapRef.current.remove();
    }, []);

    return (
        <React.Fragment>
            <div className="page-content">
                <Container fluid>
                    <Row>
                        <Col md="12">
                            <div ref={mapContainer} className="map-container" style={{ height: 800, width: '100%' }} />
                        </Col>
                    </Row>
                </Container>
            </div>
        </React.Fragment>
    );
}

export default Geofences;