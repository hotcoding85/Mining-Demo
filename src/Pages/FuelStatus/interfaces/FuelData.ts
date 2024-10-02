export interface FuelData {
  id: string;
  model:string;
  status: string;
  smu: number;
  fuelLevel: number;
  fuelRate: number;
  imageUrl: string;
  lastUpdated: number;
  gpsLocation: number;
  sync: "manual" | "inactive" | "active";
}
