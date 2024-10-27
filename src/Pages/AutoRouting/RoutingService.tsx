import { RouteDataType } from "./type";
import _ from 'lodash';

// Modify your getRoutes function to handle retry logic
export const getRoutes = (data: RouteDataType[], startPoint: [number, number], endPoint: any) => {
    if (!data || !startPoint || !endPoint) return;

    const roadData: RouteDataType[] = data;
    const maxRetries = 10; // You can set a maximum retry limit
    let excludedStartPoints = new Set();
    let excludedEndPoints = new Set();
    let pathResult: any = null;
    let distanceResult: any = null;

    // Attempt to find a valid route by retrying with different nearest points
    for (let i = 0; i < maxRetries; i++) {
        let _startPoint = findNearestPoint(startPoint, roadData, excludedStartPoints);
        let _endPoint = findNearestPoint(endPoint, roadData, excludedEndPoints);

        const graph = buildGraph(roadData);
        const { path, distance } = dijkstra(graph, _startPoint, _endPoint);

        if (path && path.length > 0) {
            pathResult = path;
            distanceResult = distance;
            break;
        }

        // Add the current nearest points to the excluded sets so they're not selected again
        excludedStartPoints.add(JSON.stringify(_startPoint));
        excludedEndPoints.add(JSON.stringify(_endPoint));
    }
    console.log(pathResult)
    if (pathResult) {
        return { route: pathResult, status: true, distance: distanceResult };
    } else {
        return { route: null, status: false, distance: 0 }; // No valid path found after retries
    }
};
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
// function findNearestPoint(givenPoint, roadData) {
//     let nearestPoint: any = null;
//     let minDistance = Infinity;
  
//     _.map(roadData, route => {
//         _.map(route.geoJson.geometry.coordinates, point => {
//             const distance = calculateDistance(givenPoint, point);
//             if (distance < minDistance) {
//                 minDistance = distance;
//                 nearestPoint = point;
//             }
//         });
//     });
  
//     return nearestPoint;
// }

function findNearestPoint(givenPoint, roadData, excludedPoints = new Set()) {
    let nearestPoint: any = null;
    let minDistance = Infinity;

    // Iterate through all points and find the nearest one that isn't in excludedPoints
    _.map(roadData, route => {
        _.map(route.geoJson.geometry.coordinates, point => {
            if (excludedPoints.has(JSON.stringify(point))) return; // Skip excluded points

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

        // Ensure previousEdges has a valid entry before destructuring
        const edgeInfo = previousEdges.get(currentVertex);
        if (!edgeInfo) {
            console.error(`No edge information found for vertex: ${currentVertex}`);
            break; // Stop if no valid edge info
        }

        const { color, speedLimit } = edgeInfo;
        path.unshift(JSON.parse(currentVertex));
        pathWithColors.unshift({ point: JSON.parse(currentVertex), color, speedLimit });
        currentVertex = prevVertex;
    }
    
    if (path.length) {
        path.unshift(start);
        const startEdgeInfo = previousEdges.get(JSON.stringify(start));
        if (startEdgeInfo) {
            const { color, speedLimit } = startEdgeInfo;
            pathWithColors.unshift({ point: start, color: color, speedLimit });
        }
    }
  
    return { path: pathWithColors, distance: distances.get(JSON.stringify(end)) };
}