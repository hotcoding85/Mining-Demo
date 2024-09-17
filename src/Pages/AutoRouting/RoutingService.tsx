import { RouteDataType } from "./type";
import _ from 'lodash';

export const getRoutes = (data: RouteDataType[], startPoint: [number, number], endPoint: any) => {
    if (!data || !startPoint || !endPoint) return;
    const roadData: RouteDataType[] = data;
    startPoint = findNearestPoint(startPoint, roadData);
    endPoint = findNearestPoint(endPoint, roadData);
    const graph = buildGraph(roadData);
    const { path, distance } = dijkstra(graph, startPoint, endPoint);

    return { route: path, status: true, distance: distance };
}

function calculateDistance(point1, point2) {
    const [lng1, lat1] = point1;
    const [lng2, lat2] = point2;
    return Math.sqrt(Math.pow(lng2 - lng1, 2) + Math.pow(lat2 - lat1, 2));
}
// Build graph from road data
function buildGraph(roadData) {
    const graph = new Map();
  
    _.map(roadData, route => {
        const routeData = route.geoJson.geometry.coordinates;
  
        for (let i = 0; i < routeData.length - 1; i++) {
            const point1 = JSON.stringify(routeData[i]);
            const point2 = JSON.stringify(routeData[i + 1]);
            const distance = calculateDistance(routeData[i], routeData[i + 1]);
            const speedLimit = Math.min(route.speedLimits, route.speedLimits);
            const weight = distance / speedLimit;
    
            if (!graph.has(point1)) {
                graph.set(point1, []);
            }
            if (!graph.has(point2)) {
                graph.set(point2, []);
            }
            const color = route.color;
            graph.get(point1).push({ weight, point: point2, color, speedLimit: speedLimit });
            // graph.get(point2).push({ weight, point: point1 });
        }
    });
  
    return graph;
}
// Find the nearest point in the dataset to a given point
function findNearestPoint(givenPoint, roadData) {
    let nearestPoint: any = null;
    let minDistance = Infinity;
  
    _.map(roadData, route => {
        _.map(route.geoJson.geometry.coordinates, point => {
            const distance = calculateDistance(givenPoint, point);
            if (distance < minDistance) {
                minDistance = distance;
                nearestPoint = point;
            }
        });
    });
  
    return nearestPoint;
}
// Dijkstra's algorithm

function dijkstra(graph, start: any, end: any) {
    const distances = new Map();
    const previousVertices = new Map();
    const previousEdges = new Map(); // To store the color of each edge
    const pq = new Map(); // Priority Queue
  
    graph.forEach((_, vertex) => {
        distances.set(vertex, Infinity);
        previousVertices.set(vertex, null);
        previousEdges.set(vertex, {color: null, speedLimit: null}); // Initialize with object containing null values
    });
    distances.set(JSON.stringify(start), 0);
    pq.set(JSON.stringify(start), 0);
  
    while (pq.size !== 0) {
        const [currentVertex, currentDistance] = [...pq.entries()].reduce((a, b) => (a[1] < b[1] ? a : b));
        pq.delete(currentVertex);
  
        if (currentDistance > distances.get(currentVertex)) continue;
  
        _.map(graph.get(currentVertex), neighbor => {
            const { weight, point: neighborPoint, color, speedLimit } = neighbor;
            const distance = currentDistance + weight;
    
            if (distance < distances.get(neighborPoint)) {
                distances.set(neighborPoint, distance);
                previousVertices.set(neighborPoint, currentVertex);
                previousEdges.set(neighborPoint, {color, speedLimit}); // Store the color of the edge
                pq.set(neighborPoint, distance);
            }
        });
    }
  
    const path: any = [];
    const pathWithColors: any = [];
    let currentVertex: any = JSON.stringify(end);
  
    while (previousVertices.get(currentVertex) !== null) {
        const prevVertex = previousVertices.get(currentVertex);
        const {color, speedLimit} = previousEdges.get(currentVertex);
        path.unshift(JSON.parse(currentVertex));
        pathWithColors.unshift({ point: JSON.parse(currentVertex), color, speedLimit });
        currentVertex = prevVertex;
    }
    if (path.length) {
        path.unshift(start);
        const {color, speedLimit} = previousEdges.get(JSON.stringify(start));
        pathWithColors.unshift({ point: start, color: color, speedLimit });
    }
  
    return { path: pathWithColors, distance: distances.get(JSON.stringify(end)) };
}