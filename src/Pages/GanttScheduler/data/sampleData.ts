import { Resource, Task } from "../interfaces/type";

export const resources: Resource[] = [
  { id: '1', label: 'jdoe0', progress: 31, firstName: 'John', lastName: 'Doe 0', status: 'Active' },
  { id: '2', label: 'jdoe1', progress: 11, firstName: 'John', lastName: 'Doe 1', status: 'Active' },
  { id: '3', label: 'jdoe2', progress: 24, firstName: 'John', lastName: 'Doe 2', status: 'Active' },
  { id: '4', label: 'jdoe3', progress: 19, firstName: 'John', lastName: 'Doe 3', status: 'Active' },
  { id: '5', label: 'jdoe0', progress: 26, firstName: 'John', lastName: 'Doe 0', status: 'Active' },
  { id: '6', label: 'jdoe1', progress: 38, firstName: 'John', lastName: 'Doe 1', status: 'Active' },
  { id: '7', label: 'jdoe2', progress: 26, firstName: 'John', lastName: 'Doe 2', status: 'Active' },
  { id: '8', label: 'jdoe3', progress: 38, firstName: 'John', lastName: 'Doe 3', status: 'Active' },
];

export const sampleTasks: Task[] = [
  { id: '1', name: 'Task 1', label: 'jdoe1', startTime: new Date('2024-08-28T07:30:00'), endTime: new Date('2024-08-26T08:30:00'), resourceId: '1', span: 5 },
  { id: '2', name: 'Task 2', label: 'jdoe2', startTime: new Date('2024-08-28T09:00:00'), endTime: new Date('2024-08-26T10:00:00'), resourceId: '2', span: 5 },
  { id: '3', name: 'Task 3', label: 'jdoe3', startTime: new Date('2024-08-28T11:00:00'), endTime: new Date('2024-08-26T12:00:00'), resourceId: '1', span: 5 },
  { id: '4', name: 'Task 4', label: 'jdoe4', startTime: new Date('2024-08-28T13:00:00'), endTime: new Date('2024-08-26T14:00:00'), resourceId: '3', span: 5 },
  { id: '5', name: 'Task 5', label: 'jdoe5', startTime: new Date('2024-08-28T14:30:00'), endTime: new Date('2024-08-26T15:30:00'), resourceId: '2', span: 5 },
];

export const sampleTaskLists: Task[] = [
  { id: '1', name: 'Consulting', label: 'Steven', startTime: new Date(), endTime: new Date(new Date().getTime() + 30 * 60 * 1000), resourceId: '', span: 1 },
  { id: '2', name: 'Bad Breath', label: 'Milan', startTime: new Date(), endTime: new Date(new Date().getTime() + 15 * 60 * 1000), resourceId: '', span: 1 },
  { id: '3', name: 'Eye Checkup', label: 'Laura', startTime: new Date(), endTime: new Date(new Date().getTime() + 60 * 60 * 1000), resourceId: '', span: 1 },
  { id: '4', name: 'Consulting', label: 'Steven', startTime: new Date(), endTime: new Date(new Date().getTime() + 30 * 60 * 1000), resourceId: '', span: 1 },
  { id: '5', name: 'Bad Breath', label: 'Milan', startTime: new Date(), endTime: new Date(new Date().getTime() + 15 * 60 * 1000), resourceId: '', span: 1 },
  { id: '6', name: 'Eye Checkup', label: 'Laura', startTime: new Date(), endTime: new Date(new Date().getTime() + 60 * 60 * 1000), resourceId: '', span: 2 },
];

