export type WayPointType = {
    coordinates: [lat: number, lng: number], 
    speedlimit: number,
    color: string,
}
export type RouteCoordinatesType = {
    coordinates: [number, number][],
    speedlimit: number,
    color: string,
    markers: mapboxgl.Marker[],
    routeNumber: string | null
}
export type RouteDataType = {
    id: string | null,
    geoJson: {
        geometry: {
            type: string,
            coordinates: [number, number][] | null
        },
        type: string,
        properties: Object
    }
    distance: number,
    duration: number,
    speedLimits: number,
    name?: string,
    description?: string,
    color: string,
    colors?: (string | null)[]
}