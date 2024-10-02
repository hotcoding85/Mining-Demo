// Basic Geometry Types
export type Coordinates = number[] | number[][] | number[][][];

export interface Point {
  type: 'Point';
  coordinates: [number, number];
}

export interface LineString {
  type: 'LineString';
  coordinates: [number, number][];
}

export interface Polygon {
  type: 'Polygon';
  coordinates: [number, number][][]; // Array of linear rings
}

export interface MultiPoint {
  type: 'MultiPoint';
  coordinates: [number, number][];
}

export interface MultiLineString {
  type: 'MultiLineString';
  coordinates: [number, number][][];
}

export interface MultiPolygon {
  type: 'MultiPolygon';
  coordinates: [number, number][][][];
}

export interface GeometryCollection {
  type: 'GeometryCollection';
  geometries: Geometry[];
}

// Union type for all geometry types
export type Geometry =
  | Point
  | LineString
  | Polygon
  | MultiPoint
  | MultiLineString
  | MultiPolygon
  | GeometryCollection;

// Feature Interface
export interface Feature {
  type: 'Feature';
  geometry: Geometry;
  properties: Record<string, any>; // Can be any object with key-value pairs
}

// Feature Collection Interface
export interface FeatureCollection {
  type: 'FeatureCollection';
  features: Feature[];
}
