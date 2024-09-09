export interface Task {
  id: string;
  name: string;
  label?: string;
  startTime: Date;
  endTime: Date;
  resourceId: string;
  span: number;
}
