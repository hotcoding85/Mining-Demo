export interface Resource {
  id: string;
  label: string;
  progress: number;
  firstName: string;
  lastName: string;
  status: string;
}

export interface Task {
  id: string;
  name: string;
  label?: string;
  startTime: Date;
  endTime: Date;
  resourceId: string;
  span: number;
}

export interface Truck {
  id: string;
  model: string;
  plannedLoads: string;
  operator: string;
}

export interface Excavator {
  id: string;
  operator: string;
  location: string;
  etaStart: string;
  etaFinish: string;
  totalLoads: string;
  totalTonnes: string;
}

export interface ShiftInfoData {
  excavator: Excavator;
  trucks: Truck[];
}

export interface SideMenu {
  locations: string[];
  excavators: string[];
  truckOperators: string[];
  trainers: string[];
  trucks: string[];
  dozers: string[];
  drillers: string[];
  standByTrucks: string[];
  standByDozers: string[];
  standByDrillers: string[];
  repairTrucks: string[];
  repairDozers: string[];
  repairDrillers: string[];
}
