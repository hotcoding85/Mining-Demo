import { Resource, Plan } from "../interfaces/type";

export const resources: Resource[] = [
  {
    id: "1",
    label: "EX201",
    progress: 31,
    firstName: "John",
    lastName: "Doe 0",
    status: "Active",
  },
  {
    id: "2",
    label: "EX202",
    progress: 11,
    firstName: "John",
    lastName: "Doe 1",
    status: "Active",
  },
  {
    id: "3",
    label: "EX205",
    progress: 19,
    firstName: "John",
    lastName: "Doe 3",
    status: "Active",
  },
  {
    id: "5",
    label: "LOA001",
    progress: 26,
    firstName: "John",
    lastName: "Doe 0",
    status: "Active",
  },
  {
    id: "8",
    label: "DZ001",
    progress: 38,
    firstName: "John",
    lastName: "Doe 3",
    status: "Active",
  },
];



export const dummyPlans = [
  {
    id: "plan?.id || null",
    name:  "Plan Name",
    label:  "Plan Label",
    startTime:new Date('Sun Oct 20 2024 5:29:00 GMT+0800'),
    endTime:new Date('Sun Oct 20 2024 7:29:00 GMT+0800'),
    excavatorId:"9966fdb2-95ac-4dde-93f5-c78f488cedc3",
    sourceId: "plan?.id",
    status: "ACTIVE",
    color:  "#ff6247",
    blockId: "plan?.blockId",
  },
  
];


export const colors = [
  "#4FC3F7",
  "#4FC3F7",
  "#FFEB3B",
  "#FFCDD2",
  "#4CAF50",
  "#37474F",
  "#7E57C2",
  "#5C6BC0",
  "#1DE9B6",
  "#00E676",
  "#43A047",
  "#F8BBD0"
]