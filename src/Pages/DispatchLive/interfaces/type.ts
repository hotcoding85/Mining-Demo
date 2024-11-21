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
  id : number;
  name : string;
  assignId : number;
}

export interface MessageData {
  id : number;
  truckId : string;
  status : string;
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
  diggerId?: string;
  excavatorId?: string;
}

export interface DumpLocation {
  id: number;
  assignId: number;
  locationImg: string;
  locationName: string;
  diggerId?: string;
}

export interface HaulRoute {
  id: number;
  assignId: number;
  locationImg: string;
  locationName: string;
  diggerId?: string;
  name: string;
}

export interface Material {
  id: number;
  assignId: number;
  materialId: string;
  diggerId?: string;
}

export interface DiggerData {
  diggerId : string;
  headerName : string;
  no : number;
}