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

// export interface Data {
//   _type: string
//   capacity: number;
//   category: string;
//   createdAt: string;
//   id: string;
//   make: string;
//   model: string;
//   name: string;
//   assignTruck: string;
//   truckModel: string;
//   serial: string;
//   state: string;
//   status: string;
//   updatedAt: string;
//   plannedTonnes: number;
//   plannedLoads: number;
// }

export interface Trainer {
  firstTrainer: string;
  secondTrainer: string;
}

export  interface Excavator {
  id: string;
  operator: string;
  trainers: Trainer;
  location: string;
  etaStart: string;
  etaEnd: string;
}

export  interface Equipment {
  id: string;
  operator: string;
  allocation: string;
  plannedLoads: string;
}

export  interface HelperEquipment {
  truck: Equipment;
  dozer: Equipment;
}

export  interface ShiftInfo {
  excavator: Excavator;
  helperEquipment: HelperEquipment[];
}
export type ShiftType = 'DAY_SHIFT' | 'NIGHT_SHIFT' | 'WORK_DAY' | 'WORK_WEEK';
