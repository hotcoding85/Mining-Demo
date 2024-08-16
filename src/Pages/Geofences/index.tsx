import React, { useEffect, useRef, useState } from 'react';
import { Container, Row, Col } from 'reactstrap';
import _ from 'lodash';

import geojson from './output.json';

import mapboxgl from 'mapbox-gl'; // eslint-disable-line import/no-webpack-loader-syntax
import { Feature, FeatureCollection, GeoJsonObject, LineString } from 'geojson';
import { features } from 'process';

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

        new mapboxgl.Marker(el).setLngLat(lngLat).addTo(mapRef.current);
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
            style: 'mapbox://styles/mapbox/dark-v11',
            center: [lng, lat],
            zoom: zoom,
            pitch: 90,
            minZoom: 15
        });

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
        mapRef.current.addControl(new mapboxgl.NavigationControl());



        const graticule = buildGraticule();
        let hoveredPolygonId = null;

        mapRef.current.on('load', () => {

            const dat = _.groupBy(geojson.features, "properties.block_id")
            Object.keys(dat).map((block) => {
                mapRef.current.addSource(block, {
                    type: 'geojson',
                    data: {
                        type: 'FeatureCollection',
                        features: dat[block]
                    }
                });

                mapRef.current.addLayer({
                    id: block + 'fill',
                    type: 'fill',
                    source: block,
                    layout: {},
                    paint: {
                        'fill-color': getBlockColor(block),
                        'fill-opacity': [
                            'case',
                            ['boolean', ['feature-state', 'hover'], false],
                            1,
                            .5
                        ]
                    }
                });

                mapRef.current.addLayer({
                    id: block + 'line',
                    type: 'line',
                    source: block,
                    layout: {},
                    paint: {
                        'line-color': '#fff',
                        'line-width': 2
                    }
                });

                mapRef.current.on('mouseenter', block + 'fill', (e) => {
                    mapRef.current.getCanvas().style.cursor = 'pointer';
                    console.log(e.features)
                    if (e.features.length > 0) {
                        if (hoveredPolygonId !== null) {
                            mapRef.current.setFeatureState(
                                { source: block, id: hoveredPolygonId },
                                { hover: false }
                            );
                        }
                        hoveredPolygonId = e.features[0].source;
                        mapRef.current.setFeatureState(
                            { source: block, id: hoveredPolygonId },
                            { hover: true }
                        );
                    }
                });

                mapRef.current.on('mouseleave', block + 'fill', () => {
                    mapRef.current.getCanvas().style.cursor = '';
                    if (hoveredPolygonId !== null) {
                        mapRef.current.setFeatureState(
                            { source: block, id: hoveredPolygonId },
                            { hover: false }
                        );
                    }
                    hoveredPolygonId = null;
                });
            })

            mapRef.current.addSource('graticule', {
                type: 'geojson',
                data: graticule
            });

            mapRef.current.addLayer({
                id: 'graticule',
                type: 'line',
                source: 'graticule',
                layout: {},
                paint: {
                    'line-color': 'gray',
                    'line-width': 1
                }
            });

            mapRef.current.loadImage(
                'https://docs.mapbox.com/mapbox-gl-js/assets/custom_marker.png',
                (error, image) => {
                    if (error) throw error;
                    mapRef.current.addImage('custom-marker', image);

                    mapRef.current.addSource('points', {
                        type: 'geojson',
                        data: {
                            type: 'FeatureCollection',
                            features: [
                                {
                                    type: 'Feature',
                                    geometry: {
                                        type: 'Point',
                                        coordinates: [-29.160331938574046, 120.44974338024406]
                                    },
                                    properties: {
                                        title: 'Mapbox DC'
                                    }
                                },
                                {
                                    type: 'Feature',
                                    geometry: {
                                        type: 'Point',
                                        coordinates: [-29.156594353219155, 120.44783936708842]
                                    },
                                    properties: {
                                        title: 'Mapbox SF'
                                    }
                                }
                            ]
                        }
                    });

                    mapRef.current.addLayer({
                        id: 'points',
                        type: 'symbol',
                        source: 'points',
                        layout: {
                            'icon-image': 'custom-marker',
                            'text-field': ['get', 'title'],
                            'text-font': ['Open Sans Semibold', 'Arial Unicode MS Bold'],
                            'text-offset': [0, 1.25],
                            'text-anchor': 'top'
                        }
                    });
                }
            );



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