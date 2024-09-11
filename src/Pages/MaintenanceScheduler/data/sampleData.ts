import { DraggableItem } from "../interfaces/types";

export const sampleEvents = [
  {
    id: 0,
    title: "DT01",
    workLocation: "Workshop Bay1",
    serviceInterval: "Aircon",
    resourceLabor: "John Brown (Fitter)",
    reason: "Damage",
    status: "completed",
    start: new Date(2024, 8, 12, 10, 0),
    end: new Date(2024, 8, 12, 15, 0),
  },
  {
    id: 1,
    title: "DT02",
    workLocation: "Workshop1 Bay1",
    serviceInterval: "250hr",
    resourceLabor: "Mike Rough (Fitter)",
    reason: "Repair",
    status: "In Progress",
    start: new Date(2024, 8, 11, 13, 0),
    end: new Date(2024, 8, 11, 19, 0),
  },
  {
    id: 2,
    title: "DT03",
    workLocation: "Workshop2 Bay1",
    serviceInterval: "Tires",
    resourceLabor: "Alan Poe (Elect)",
    reason: "Inspection",
    status: "In Progress",
    start: new Date(2024, 8, 13, 0, 0),
    end: new Date(2024, 8, 13, 23, 59),
  },
];

export const equipmentList: DraggableItem[] = [
  {
    id: "1",
    name: "DT105",
    label: "DT105",
  },
  {
    id: "2",
    name: "DT106",
    label: "DT106",
  },
  {
    id: "3",
    name: "DT107",
    label: "DT107",
  },
];

export const workLocation: DraggableItem[] = [
  {
    id: "1",
    name: "workshop1 Bay1",
    label: "workshop1 Bay1",
  },
  {
    id: "2",
    name: "workshop1 Bay1",
    label: "workshop1 Bay1",
  },
];

export const repairAndServiceInterval: DraggableItem[] = [
  {
    id: "1",
    name: "250hr",
    label: "250hr",
  },
  {
    id: "2",
    name: "Tires",
    label: "Tires",
  },
  {
    id: "3",
    name: "Aircon",
    label: "Aircon",
  },
  {
    id: "4",
    name: "500hr",
    label: "500hr",
  },
  {
    id: "5",
    name: "GET",
    label: "GET",
  },
  {
    id: "6",
    name: "Prestart Fail",
    label: "Prestart Fail",
  },
];

export const reasons: DraggableItem[] = [
  {
    id: "1",
    name: "Inspection",
    label: "Inspection",
  },
  {
    id: "2",
    name: "Repair",
    label: "Repair",
  },
  {
    id: "3",
    name: "Damage",
    label: "Damage",
  },
  {
    id: "4",
    name: "Inspection",
    label: "Inspection",
  },
  {
    id: "5",
    name: "Repair",
    label: "Repair",
  },
  {
    id: "6",
    name: "Damage",
    label: "Damage",
  },
];

export const resourceLaborAllocation: DraggableItem[] = [
  {
    id: "1",
    name: "John Brown (Fitter)",
    label: "John Brown (Fitter)",
  },
  {
    id: "2",
    name: "Alan Poe (Elect)",
    label: "Alan Poe (Elect)",
  },
  {
    id: "3",
    name: "Joe Boy (Apprent)",
    label: "Joe Boy (Apprent)",
  },
  {
    id: "4",
    name: "Mike Rough (Fitter)",
    label: "Mike Rough (Fitter)",
  },
];

export const longTermDown: DraggableItem[] = [
  {
    id: "1",
    name: "DT123",
    label: "DT123",
  },
  {
    id: "2",
    name: "DT123",
    label: "DT123",
  },
  {
    id: "3",
    name: "DT123",
    label: "DT123",
  },
];
