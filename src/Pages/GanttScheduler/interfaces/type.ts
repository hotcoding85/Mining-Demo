export interface Resource {
    id: string;
    label: string;
    progress: number;
    firstName: string;
    lastName: string;
    status: string;
  }
  
export interface Plan {
  id: string;
  name: string;
  label?: string;
  startTime: Date;
  endTime: Date;
  resourceId: string;
  span: number; 
  color: string;
  progress: number;
  status: string;
}

export interface resourceHeight {
  resourceId : string;
  height: number;
}
  export type ShiftType = 'DAY_SHIFT' | 'NIGHT_SHIFT' | 'WORK_DAY' | 'WORK_WEEK';
  