import { ShiftInfo, Task } from "../interfaces/type";
export const sampleTaskLists: Task[] = [
  { id: '1', name: 'HG01', label: 'EMU_440_HG01', startTime: new Date(), endTime: new Date(new Date().getTime() + 30 * 60 * 1000), resourceId: '', span: 3 },
  { id: '2', name: 'WS03', label: 'EMU_440_WS03', startTime: new Date(), endTime: new Date(new Date().getTime() + 15 * 60 * 1000), resourceId: '', span: 1 },
  { id: '3', name: 'WASTE', label: 'EMU_440_HG01', startTime: new Date(), endTime: new Date(new Date().getTime() + 60 * 60 * 1000), resourceId: '', span: 1 },
  { id: '4', name: 'LG01', label: 'EMU_445_LG01', startTime: new Date(), endTime: new Date(new Date().getTime() + 30 * 60 * 1000), resourceId: '', span: 1 },
  { id: '5', name: 'WASTE', label: 'EMU_445_WASTE', startTime: new Date(), endTime: new Date(new Date().getTime() + 15 * 60 * 1000), resourceId: '', span: 1 },
  { id: '6', name: 'LG02', label: 'EMU_450_LG02', startTime: new Date(), endTime: new Date(new Date().getTime() + 60 * 60 * 1000), resourceId: '', span: 2 },
];

export const shiftInfoData: ShiftInfo [] = [
  {
    excavator: {
      id: "EX201",
      operator: "",
      trainers: { firstTrainer: "", secondTrainer: "" },
      location: "",
      etaStart: "",
      etaEnd: "",
    },
    helperEquipment: [
      {
        truck: {
          id: "",
          operator: "",
          allocation: "",
          plannedLoads: "",
        },
        dozer: {
          id: "",
          operator: "",
          allocation: "",
          plannedLoads: "",
        },
      },
      {
        truck: {
          id: "",
          operator: "",
          allocation: "",
          plannedLoads: "",
        },
        dozer: {
          id: "",
          operator: "",
          allocation: "",
          plannedLoads: "",
        },
      },
      {
        truck: {
          id: "",
          operator: "",
          allocation: "",
          plannedLoads: "",
        },
        dozer: {
          id: "",
          operator: "",
          allocation: "",
          plannedLoads: "",
        },
      },
    ],
  },
];

// export const data: Data[] = [
//   {
//     "_type": "vehicle",
//     "capacity": 10,
//     "category": "EXCAVATOR",
//     "createdAt": "1970-01-20T22:36:55.644Z",
//     "id": "9966fdb2-95ac-4dde-93f5-c78f488cedc3",
//     "make": "KOMATSU",
//     "model": "PC1250",
//     "name": "EX201",
//     "assignTruck": "DT101",
//     "truckModel": "HD785-7",
//     "serial": "36279",
//     "state": "ACTIVE",
//     "status": "ACTIVE",
//     "updatedAt": "1970-01-20T22:49:20.136Z",
//     "plannedTonnes": 1728,
//     "plannedLoads": 172.8
//   },
//   {
//     "_type": "vehicle",
//     "capacity": 10,
//     "category": "EXCAVATOR",
//     "createdAt": "1970-01-20T22:36:55.644Z",
//     "id": "413d454c-9037-4726-b67f-e5a53770bc02",
//     "make": "KOMATSU",
//     "model": "PC1250",
//     "name": "EX202",
//     "assignTruck": "DT101",
//     "truckModel": "HD1500",
//     "serial": "36289",
//     "state": "STANDBY",
//     "status": "ACTIVE",
//     "updatedAt": "1970-01-20T22:48:35.104Z",
//     "plannedTonnes": 1728,
//     "plannedLoads": 172.8
//   },
//   {
//     "_type": "vehicle",
//     "capacity": 20,
//     "category": "EXCAVATOR",
//     "createdAt": "1970-01-20T22:36:55.644Z",
//     "id": "ad9bb92e-ace6-43ea-84c3-eba9725b28a7",
//     "make": "KOMATSU",
//     "model": "PC2000",
//     "name": "EX205",
//     "assignTruck": "DT101",
//     "truckModel": "HD1500",
//     "serial": "30125",
//     "state": "DELAY",
//     "status": "ACTIVE",
//     "updatedAt": "1970-01-20T22:49:20.159Z",
//     "plannedTonnes": 3456,
//     "plannedLoads": 172.8
//   }
// ]