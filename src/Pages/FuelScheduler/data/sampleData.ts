import { DraggableItem } from "../interfaces/types";

export const sampleEvents = [
  {
    id: 0,
    title: "FL01",
    status: "completed",
    start: new Date(2024, 8, 12, 10, 0),
    end: new Date(2024, 8, 12, 15, 0),
  },
  {
    id: 1,
    title: "FL02",
    status: "In Progress",
    start: new Date(2024, 8, 11, 13, 0),
    end: new Date(2024, 8, 11, 19, 0),
  },
];

export const fuelTruckList: DraggableItem[] = [
  {
    id: "1",
    key: 1,
    value: "FL01",
    name: "FL01",
    label: "FL01",
  },
  {
    id: "2",
    key: 2,
    value: "Service Truck",
    name: "Service Truck",
    label: "Service Truck",
  },
];

export const locationToFuel: DraggableItem[] = [
  {
    id: "1",
    key: 1,
    value: "440_BLK1_HG02",
    name: "440_BLK1_HG02",
    label: "440_BLK1_HG02",
  },
  {
    id: "2",
    key: 2,
    value: "440_BLK1_HG03",
    name: "440_BLK1_HG03",
    label: "440_BLK1_HG03",
  },
  {
    id: "3",
    key: 3,
    value: "440_BLK1_HG04",
    name: "440_BLK1_HG04",
    label: "440_BLK1_HG04",
  },
  {
    id: "4",
    key: 4,
    value: "440_BLK1_HG05",
    name: "440_BLK1_HG05",
    label: "440_BLK1_HG05",
  },
  {
    id: "5",
    key: 5,
    value: "Go-line",
    name: "Go-line",
    label: "Go-line",
  },
  {
    id: "6",
    key: 6,
    value: "Workshop",
    name: "Workshop",
    label: "Workshop",
  },
];

export const truck: DraggableItem[] = [
  {
    id: "1",
    key: 1,
    value: "E. Levy",
    name: "E. Levy",
    label: "E. Levy",
  },
  {
    id: "2",
    key: 2,
    value: "L. Manning",
    name: "L. Manning",
    label: "L. Manning",
  },
  {
    id: "3",
    key: 3,
    value: "",
    name: "",
    label: "",
  },
  {
    id: "4",
    key: 4,
    value: "",
    name: "",
    label: "",
  },
  {
    id: "5",
    key: 5,
    value: "",
    name: "",
    label: "",
  },
];

export const priorityrequested: DraggableItem[] = [
  {
    id: "1",
    key: 1,
    value: "Within 3 hrs",
    name: "Within 3 hrs",
    label: "Within 3 hrs",
  },
  {
    id: "2",
    key: 2,
    value: "Within 2 hrs",
    name: "Within 2 hrs",
    label: "Within 2 hrs",
  },
  {
    id: "3",
    key: 3,
    value: "Priority 3",
    name: "Priority 3",
    label: "Priority 3",
  },
  {
    id: "4",
    key: 4,
    value: "n",
    name: "n",
    label: "n",
  },
  {
    id: "5",
    key: 5,
    value: "Urgent on Waste Dump",
    name: "Urgent on Waste Dump",
    label: "Urgent on Waste Dump",
  },
  {
    id: "6",
    key: 6,
    value: "URGENT in PIT",
    name: "URGENT in PIT",
    label: "URGENT in PIT",
  },
];

export const locations: DraggableItem[] = [
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

export const CardSampleData = [
  {
    id: 1,
    name: "DT101",
    gpsLocation: 34069.5,
    smu: 34069.5,
    isRequestingFuel: false,
    fuelLevel: 64,
    fuelRate: 79.7,
    fuelTruckAssign: "FT001",
    priority: "",
  },
  {
    id: 2,
    name: "DT102",
    gpsLocation: 34080.1,
    smu: 34080.1,
    isRequestingFuel: true,
    fuelLevel: 30,
    fuelRate: 81.3,
    fuelTruckAssign: "FT002",
    priority: "",
  },
  {
    id: 3,
    name: "DT103",
    gpsLocation: 34095.6,
    smu: 34095.6,
    isRequestingFuel: false,
    fuelLevel: 70,
    fuelRate: 75.5,
    fuelTruckAssign: "",
    priority: "",
  },
  {
    id: 4,
    name: "DT104",
    gpsLocation: 34085.3,
    smu: 34085.3,
    isRequestingFuel: true,
    fuelLevel: 45,
    fuelRate: 78.2,
    fuelTruckAssign: "",
    priority: "High",
  },
  {
    id: 5,
    name: "DT105",
    gpsLocation: 34069.5,
    smu: 34069.5,
    isRequestingFuel: true,
    fuelLevel: 25,
    fuelRate: 79.7,
    fuelTruckAssign: "FT005",
    priority: "Critical",
  },
];
