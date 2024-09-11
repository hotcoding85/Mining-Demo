import { Resource, Task } from "../interfaces/type";

export const resources: Resource[] = [
  { id: '1', label: 'EX201', progress: 31, firstName: 'John', lastName: 'Doe 0', status: 'Active' },
  { id: '2', label: 'EX202', progress: 11, firstName: 'John', lastName: 'Doe 1', status: 'Active' },
  { id: '3', label: 'EX203', progress: 24, firstName: 'John', lastName: 'Doe 2', status: 'Active' },
  { id: '4', label: 'EX205', progress: 19, firstName: 'John', lastName: 'Doe 3', status: 'Active' },
  { id: '5', label: 'LOA001', progress: 26, firstName: 'John', lastName: 'Doe 0', status: 'Active' },
  { id: '6', label: 'LOA002', progress: 38, firstName: 'John', lastName: 'Doe 1', status: 'Active' },
  { id: '7', label: 'LOA003', progress: 26, firstName: 'John', lastName: 'Doe 2', status: 'Active' },
  { id: '8', label: 'DZ001', progress: 38, firstName: 'John', lastName: 'Doe 3', status: 'Active' },
];

export const sampleTasks: Task[] = [
  { id: '1', name: 'STANDBY', label: 'EX01', startTime: new Date('2024-09-11T06:00:00'), endTime: new Date('2024-09-11T08:00:00'), resourceId: '1', span: 2 },
  { id: '2', name: 'ACTIVE', label: 'EX01', startTime: new Date('2024-09-11T08:00:00'), endTime: new Date('2024-09-11T10:00:00'), resourceId: '1', span: 2 },
  { id: '3', name: 'DELAY', label: 'EX01', startTime: new Date('2024-09-11T10:00:00'), endTime: new Date('2024-09-11T12:00:00'), resourceId: '1', span: 2 },
  { id: '4', name: 'DOWN', label: 'EX01', startTime: new Date('2024-09-11T12:00:00'), endTime: new Date('2024-09-11T14:00:00'), resourceId: '1', span: 2 },
  { id: '5', name: 'STANDBY', label: 'EX01', startTime: new Date('2024-09-11T14:00:00'), endTime: new Date('2024-09-11T18:00:00'), resourceId: '1', span: 4 },
];

export const sampleTaskLists: Task[] = [
  { id: '1', name: 'HG01', label: 'EMU_440_HG01', startTime: new Date(), endTime: new Date(new Date().getTime() + 30 * 60 * 1000), resourceId: '', span: 3 },
  { id: '2', name: 'WS03', label: 'EMU_440_WS03', startTime: new Date(), endTime: new Date(new Date().getTime() + 15 * 60 * 1000), resourceId: '', span: 1 },
  { id: '3', name: 'WASTE', label: 'EMU_440_HG01', startTime: new Date(), endTime: new Date(new Date().getTime() + 60 * 60 * 1000), resourceId: '', span: 1 },
  { id: '4', name: 'LG01', label: 'EMU_445_LG01', startTime: new Date(), endTime: new Date(new Date().getTime() + 30 * 60 * 1000), resourceId: '', span: 1 },
  { id: '5', name: 'WASTE', label: 'EMU_445_WASTE', startTime: new Date(), endTime: new Date(new Date().getTime() + 15 * 60 * 1000), resourceId: '', span: 1 },
  { id: '6', name: 'LG02', label: 'EMU_450_LG02', startTime: new Date(), endTime: new Date(new Date().getTime() + 60 * 60 * 1000), resourceId: '', span: 2 },
];

