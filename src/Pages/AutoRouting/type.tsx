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
    routeNumber: string
}
export type RouteDataType = {
    route_id: string,
    geometry: {
        type: string,
        coordinates: [number, number][] | null
    },
    distance: number,
    duration: number,
    created_at: string,
    speed_limits: number,
    name?: string,
    description?: string,
    color: string,
    colors?: (string | null)[]
}