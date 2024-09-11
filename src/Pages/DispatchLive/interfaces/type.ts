export interface VehicleData {
  id: string;
  status: string;
  smu: number;
  fuelLevel: number;
  fuelRate: number;
  imageUrl: string;
  lastUpdated: string;
  sync: "manual" | "inactive" | "active";
  collapse?: boolean;
}

export interface ActiveBenchData {
  id: number;
  name: string;
}

export interface WasteDumpLocationData {
  id: number;
  imageUrl: string;
  locationName: string;
}

export interface Truck {
  id: number;
  assignId: number;
  truckId: string;
  operator: string;
}

export interface DumpLocation {
  id: number;
  assignId: number;
  locationImg: string;
  locationName: string;
}

export interface Material {
  id: number;
  assignId: number;
  materialId: string;
}
