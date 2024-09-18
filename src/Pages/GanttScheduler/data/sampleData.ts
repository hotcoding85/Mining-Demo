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
  { id: '1', name: 'HG01', label: 'EMU_440_HG01', startTime: new Date(), endTime: new Date(new Date().getTime() + 30 * 60 * 1000), resourceId: '', span: 3, color: "#cb6247", progress: 31, rowIndex: 0 },
  { id: '2', name: 'WS03', label: 'EMU_440_WS03', startTime: new Date(), endTime: new Date(new Date().getTime() + 15 * 60 * 1000), resourceId: '', span: 1, color: "#ff974c", progress: 50, rowIndex: 0 },
  { id: '3', name: 'WASTE', label: 'EMU_440_HG01', startTime: new Date(), endTime: new Date(new Date().getTime() + 60 * 60 * 1000), resourceId: '', span: 1, color: "#3266ef", progress: 41, rowIndex: 0 },
  { id: '4', name: 'LG01', label: 'EMU_445_LG01', startTime: new Date(), endTime: new Date(new Date().getTime() + 30 * 60 * 1000), resourceId: '', span: 1, color: "#00ffbf", progress: 23, rowIndex: 0 },
  { id: '5', name: 'WASTE', label: 'EMU_445_WASTE', startTime: new Date(), endTime: new Date(new Date().getTime() + 15 * 60 * 1000), resourceId: '', span: 1, color: "#ff00ff", progress: 67, rowIndex: 0 },
  { id: '6', name: 'LG02', label: 'EMU_450_LG02', startTime: new Date(), endTime: new Date(new Date().getTime() + 60 * 60 * 1000), resourceId: '', span: 2, color: "#8784ff", progress: 92, rowIndex: 0 },
];

export const dummyTasks = [
  {
      "id": "9alh9",
      "name": "HG01",
      "label": "EMU_440_HG01",
      "startTime":new Date(2024, 8, new Date().getDate(), 8, 5),// "2024-09-17T23:17:00.000Z",
      "endTime": new Date(2024, 8, new Date().getDate(), 13, 0),//"2024-09-18T04:56:00.000Z",
      "resourceId": "1",
      "span": 1,
      "color": "#cb6247",
      "progress": 21,
      "rowIndex": 0
  },
  {
      "id": "9alh8",
      "name": "HG01",
      "label": "EMU_440_HG01",
      "startTime": new Date(2024, 8, new Date().getDate(), 13, 15),
      "endTime": new Date(2024, 8, new Date().getDate(), 17, 0),
      "resourceId": "1",
      "span": 1,
      "color": "#cb6247",
      "progress": 21,
      "rowIndex": 0
  },
  {
      "id": "r349hf",
      "name": "WASTE",
      "label": "EMU_440_HG01",
      "startTime": new Date(2024, 8, new Date().getDate(), 6, 15),//"2024-09-17T23:16:00.000Z",
      "endTime": new Date(2024, 8, new Date().getDate(), 11, 0),//"2024-09-18T03:07:00.000Z",
      "resourceId": "2",
      "span": 1,
      "color": "#3266ef",
      "progress": 41,
      "rowIndex": 0
  },
  {
      "id": "ry656l",
      "name": "LG01",
      "label": "EMU_445_LG01",
      "startTime": new Date(2024, 8, new Date().getDate(), 11, 15),//"2024-09-18T03:10:00.000Z",
      "endTime": new Date(2024, 8, new Date().getDate(), 16, 30),//"2024-09-18T08:28:00.000Z",
      "resourceId": "2",
      "span": 1,
      "color": "#00ffbf",
      "progress": 23,
      "rowIndex": 0
  },
  {
      "id": "l4xsu",
      "name": "WASTE",
      "label": "EMU_445_WASTE",
      "startTime": new Date(2024, 8, new Date().getDate(), 6, 15),//"2024-09-17T23:17:00.000Z",
      "endTime": new Date(2024, 8, new Date().getDate(), 17, 30),//"2024-09-18T08:30:00.000Z",
      "resourceId": "3",
      "span": 1,
      "color": "#ff00ff",
      "progress": 67,
      "rowIndex": 0
  },
  {
      "id": "bg1cca",
      "name": "LG02",
      "label": "EMU_450_LG02",
      "startTime": new Date(2024, 8, new Date().getDate(), 6, 0),//"2024-09-18T05:00:00.000Z",
      "endTime": new Date(2024, 8, new Date().getDate(), 8, 30),//"2024-09-18T08:28:00.000Z",
      "resourceId": "1",
      "span": 1,
      "color": "#8784ff",
      "progress": 92,
      "rowIndex": 0
  }
]