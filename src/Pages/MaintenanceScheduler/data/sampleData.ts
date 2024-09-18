import { DraggableItem } from "../interfaces/types";

export const sampleEvents = [
  {
    id: 0,
    title: "DT01",
    workLocation: "Workshop Bay1",
    serviceInterval: "Aircon",
    resourceLabor: ["John Brown (Fitter)"],
    reason: "Damage",
    status: "completed",
    start: new Date(2024, 8, 18, 10, 0),
    end: new Date(2024, 8, 18, 15, 0),
    equipmentInfo: {
      id: "4",
      key: 4,
      value: "DT01",
      name: "DT01",
      label: "DT01",
    },
  },
  {
    id: 1,
    title: "DT02",
    workLocation: "Workshop1 Bay1",
    serviceInterval: "250hr",
    resourceLabor: ["Mike Rough (Fitter)"],
    reason: "Repair",
    status: "In Progress",
    start: new Date(2024, 8, 17, 13, 0),
    end: new Date(2024, 8, 17, 19, 0),
    equipmentInfo: {
      id: "5",
      key: 5,
      value: "DT02",
      name: "DT02",
      label: "DT02",
    },
  },
  {
    id: 2,
    title: "DT03",
    workLocation: "Workshop2 Bay1",
    serviceInterval: "Tires",
    resourceLabor: ["Alan Poe (Elect)"],
    reason: "Inspection",
    status: "In Progress",
    start: new Date(2024, 8, 19, 0, 0),
    end: new Date(2024, 8, 19, 23, 59),
    equipmentInfo: {
      id: "6",
      key: 6,
      value: "DT03",
      name: "DT03",
      label: "DT03",
    },
  },
];

export const equipmentList: DraggableItem[] = [
  {
    id: "1",
    key: 1,
    value: "DT105",
    name: "DT105",
    label: "DT105",
  },
  {
    id: "2",
    key: 2,
    value: "DT106",
    name: "DT106",
    label: "DT106",
  },
  {
    id: "3",
    key: 3,
    value: "DT107",
    name: "DT107",
    label: "DT107",
  },
];

export const workLocation: DraggableItem[] = [
  {
    id: "1",
    key: 1,
    value: "WORKSHOP_BAY_1",
    name: "Workshop Bay 1",
    label: "Workshop Bay 1",
  },
  {
    id: "2",
    key: 2,
    value: "WORKSHOP_BAY_2",
    name: "Workshop Bay 2",
    label: "Workshop Bay 2",
  },
  {
    id: "3",
    key: 3,
    value: "WORKSHOP_BAY_3",
    name: "Workshop Bay 3",
    label: "Workshop Bay 3",
  },
  {
    id: "4",
    key: 4,
    value: "TYRE_BAY_1",
    name: "Tyre Bay",
    label: "Tyre Bay",
  },
  {
    id: "5",
    key: 5,
    value: "WELDING_BAY_1",
    name: "Welding Bay",
    label: "Welding Bay",
  },
  {
    id: "6",
    key: 6,
    value: "EXTERNAL_DOME_1",
    name: "External Dome 1",
    label: "External Dome 1",
  },
  {
    id: "7",
    key: 7,
    value: "EXTERNAL_DOME_2",
    name: "External Dome 2",
    label: "External Dome 2",
  },
  {
    id: "8",
    key: 8,
    value: "EXTERNAL_DOME_3",
    name: "External Dome 3",
    label: "External Dome 3",
  },
  {
    id: "9",
    key: 9,
    value: "GO_LINE",
    name: "Work On the Go-Line",
    label: "Work On the Go-Line",
  },
  {
    id: "10",
    key: 10,
    value: "IN_PIT",
    name: "In Pit",
    label: "In Pit",
  },
  {
    id: "11",
    key: 11,
    value: "LAY_DOWN_AREA",
    name: "Lay Down Area",
    label: "Lay Down Area",
  },
];

export const repairAndServiceInterval: DraggableItem[] = [
  {
    id: "1",
    key: 1,
    value: "250hr",
    name: "250hr",
    label: "250hr",
  },
  {
    id: "2",
    key: 2,
    value: "Tires",
    name: "Tires",
    label: "Tires",
  },
  {
    id: "3",
    key: 3,
    value: "Aircon",
    name: "Aircon",
    label: "Aircon",
  },
  {
    id: "4",
    key: 4,
    value: "500hr",
    name: "500hr",
    label: "500hr",
  },
  {
    id: "5",
    key: 5,
    value: "GET",
    name: "GET",
    label: "GET",
  },
  {
    id: "6",
    key: 6,
    value: "Prestart Fail",
    name: "Prestart Fail",
    label: "Prestart Fail",
  },
];

export const reasons: DraggableItem[] = [
  {
    id: "1",
    key: 1,
    value: "Inspection",
    name: "Inspection",
    label: "Inspection",
  },
  {
    id: "2",
    key: 2,
    value: "Repair",
    name: "Repair",
    label: "Repair",
  },
  {
    id: "3",
    key: 3,
    value: "Damage",
    name: "Damage",
    label: "Damage",
  },
];

export const resourceLaborAllocation: DraggableItem[] = [
  {
    id: "1",
    key: 1,
    value: "John Brown (Fitter)",
    name: "John Brown (Fitter)",
    label: "John Brown (Fitter)",
  },
  {
    id: "2",
    key: 2,
    value: "Alan Poe (Elect)",
    name: "Alan Poe (Elect)",
    label: "Alan Poe (Elect)",
  },
  {
    id: "3",
    key: 3,
    value: "Joe Boy (Apprent)",
    name: "Joe Boy (Apprent)",
    label: "Joe Boy (Apprent)",
  },
  {
    id: "4",
    key: 4,
    value: "Mike Rough (Fitter)",
    name: "Mike Rough (Fitter)",
    label: "Mike Rough (Fitter)",
  },
];

export const longTermDown: DraggableItem[] = [
  {
    id: "1",
    key: 1,
    value: "DT123",
    name: "DT123",
    label: "DT123",
  },
  {
    id: "2",
    key: 2,
    value: "DT123",
    name: "DT123",
    label: "DT123",
  },
  {
    id: "3",
    key: 3,
    value: "DT123",
    name: "DT123",
    label: "DT123",
  },
];
