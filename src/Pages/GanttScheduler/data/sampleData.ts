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
  { id: '1', name: 'Task 1', label: 'jdoe1', startTime: new Date('2024-08-28T07:30:00'), endTime: new Date('2024-08-26T08:30:00'), resourceId: '1', span: 5 },
  { id: '2', name: 'Task 2', label: 'jdoe2', startTime: new Date('2024-08-28T09:00:00'), endTime: new Date('2024-08-26T10:00:00'), resourceId: '2', span: 5 },
  { id: '3', name: 'Task 3', label: 'jdoe3', startTime: new Date('2024-08-28T11:00:00'), endTime: new Date('2024-08-26T12:00:00'), resourceId: '1', span: 5 },
  { id: '4', name: 'Task 4', label: 'jdoe4', startTime: new Date('2024-08-28T13:00:00'), endTime: new Date('2024-08-26T14:00:00'), resourceId: '3', span: 5 },
  { id: '5', name: 'Task 5', label: 'jdoe5', startTime: new Date('2024-08-28T14:30:00'), endTime: new Date('2024-08-26T15:30:00'), resourceId: '2', span: 5 },
];

export const sampleTaskLists: Task[] = [
  { id: '1', name: 'HG01', label: 'EMU_440_HG01', startTime: new Date(), endTime: new Date(new Date().getTime() + 30 * 60 * 1000), resourceId: '', span: 3 },
  { id: '2', name: 'WS03', label: 'EMU_440_WS03', startTime: new Date(), endTime: new Date(new Date().getTime() + 15 * 60 * 1000), resourceId: '', span: 1 },
  { id: '3', name: 'WASTE', label: 'EMU_440_HG01', startTime: new Date(), endTime: new Date(new Date().getTime() + 60 * 60 * 1000), resourceId: '', span: 1 },
  { id: '4', name: 'LG01', label: 'EMU_445_LG01', startTime: new Date(), endTime: new Date(new Date().getTime() + 30 * 60 * 1000), resourceId: '', span: 1 },
  { id: '5', name: 'WASTE', label: 'EMU_445_WASTE', startTime: new Date(), endTime: new Date(new Date().getTime() + 15 * 60 * 1000), resourceId: '', span: 1 },
  { id: '6', name: 'LG02', label: 'EMU_450_LG02', startTime: new Date(), endTime: new Date(new Date().getTime() + 60 * 60 * 1000), resourceId: '', span: 2 },
];

