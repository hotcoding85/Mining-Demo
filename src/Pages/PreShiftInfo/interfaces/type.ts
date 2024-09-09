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

export interface Data {
  _type: string
  capacity: number;
  category: string;
  createdAt: string;
  id: string;
  make: string;
  model: string;
  name: string;
  serial: string;
  state: string;
  status: string;
  updatedAt: string;
  plannedTonnes: number;
  plannedLoads: number;
}

export type ShiftType = 'DAY_SHIFT' | 'NIGHT_SHIFT' | 'WORK_DAY' | 'WORK_WEEK';
