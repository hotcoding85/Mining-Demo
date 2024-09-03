import { FeatureCollection } from 'geojson';

export function buildGraticule(lat: number, lng: number): FeatureCollection {
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