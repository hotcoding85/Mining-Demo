export interface Vehicle {
  capacity: number;
  category: string;
  createdAt: number;
  id: string;
  make: string;
  model: string;
  serial: string;
  status: string;
  state: string;
  updatedAt: number;
  updatedBy: number;
}

export interface DispatchData {
  id: string;
  planId: string;
  roster: string;
  vehicleId: string;
  sourceIds: string[];
  currentSourceId: string;
  completedSourceId: string[];
  startTime: number;
  endTime: number;
  supporting: string[];
  tonnes: number;
  createdAt: number;
  updatedAt: number;
  createdBy: number;
  updatedBy: number;
  vehicle: Vehicle;
  supportTruck: Vehicle[];
}

export interface DumpLocation {
  blockId: string;
  category: string;
  createdAt: number;
  elevation: number;
  materialId: string;
  name: string;
  status: string;
  updatedAt: number;
}
