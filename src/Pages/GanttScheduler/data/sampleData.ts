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


export const sampleTaskLists: Task[] = [
  { id: '1', name: 'HG01', label: 'EMU_440_HG01', startTime: new Date(), endTime: new Date(new Date().getTime() + 30 * 60 * 1000), resourceId: '', span: 3, color: "#cb6247", progress : 31, rowIndex : 0 },
  { id: '2', name: 'WS03', label: 'EMU_440_WS03', startTime: new Date(), endTime: new Date(new Date().getTime() + 15 * 60 * 1000), resourceId: '', span: 1, color: "#ff974c", progress : 50, rowIndex : 0},
  { id: '3', name: 'WASTE', label: 'EMU_440_HG01', startTime: new Date(), endTime: new Date(new Date().getTime() + 60 * 60 * 1000), resourceId: '', span: 1, color: "#3266ef", progress : 41, rowIndex : 0},
  { id: '4', name: 'LG01', label: 'EMU_445_LG01', startTime: new Date(), endTime: new Date(new Date().getTime() + 30 * 60 * 1000), resourceId: '', span: 1, color: "#00ffbf", progress: 23, rowIndex : 0 },
  { id: '5', name: 'WASTE', label: 'EMU_445_WASTE', startTime: new Date(), endTime: new Date(new Date().getTime() + 15 * 60 * 1000), resourceId: '', span: 1, color: "#ff00ff", progress: 67, rowIndex : 0 },
  { id: '6', name: 'LG02', label: 'EMU_450_LG02', startTime: new Date(), endTime: new Date(new Date().getTime() + 60 * 60 * 1000), resourceId: '', span: 2, color: "#8784ff", progress : 92, rowIndex : 0},
];

