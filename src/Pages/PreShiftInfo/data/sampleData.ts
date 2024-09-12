import { Task, ShiftInfoData, SideMenu } from "../interfaces/type";
export const sampleTaskLists: Task[] = [
  { id: '1', name: 'HG01', label: 'EMU_440_HG01', startTime: new Date(), endTime: new Date(new Date().getTime() + 30 * 60 * 1000), resourceId: '', span: 3 },
  { id: '2', name: 'WS03', label: 'EMU_440_WS03', startTime: new Date(), endTime: new Date(new Date().getTime() + 15 * 60 * 1000), resourceId: '', span: 1 },
  { id: '3', name: 'WASTE', label: 'EMU_440_HG01', startTime: new Date(), endTime: new Date(new Date().getTime() + 60 * 60 * 1000), resourceId: '', span: 1 },
  { id: '4', name: 'LG01', label: 'EMU_445_LG01', startTime: new Date(), endTime: new Date(new Date().getTime() + 30 * 60 * 1000), resourceId: '', span: 1 },
  { id: '5', name: 'WASTE', label: 'EMU_445_WASTE', startTime: new Date(), endTime: new Date(new Date().getTime() + 15 * 60 * 1000), resourceId: '', span: 1 },
  { id: '6', name: 'LG02', label: 'EMU_450_LG02', startTime: new Date(), endTime: new Date(new Date().getTime() + 60 * 60 * 1000), resourceId: '', span: 2 },
];

export const sideMenu: SideMenu[] = [{
  locations: ["440_BLK1_HG02", "440_BLK1_HG03", "440_BLK1_HG04", "440_BLK1_HG05", "440_BLK1_HG06", "440_BLK1_HG07"],
  excavators: ["J.Burch", "R.Simpon", "E.Freeman", "R.Carson"],
  truckOperators: ["E.Levy", "L.Manning"],
  trainers: ["Trainers1", "Trainers2"],
  trucks: ["DT105", "DT106", "DT107"],
  dozers: ["LOA01", "LOA02", "LOA03"],
  drillers: ["DT105", "DT106", "DT107"],
  standByTrucks: ["DT105", "", ""],
  standByDozers: ["", "", ""],
  standByDrillers: ["", "", ""],
  repairTrucks: ["DT110", "DT111", ""],
  repairDozers: ["", "", ""],
  repairDrillers: ["", "", ""],
}];

export const shiftInfoData: ShiftInfoData[] = [
  {
    excavator: {
      id: "EX201",
      operator: "",
      location: "",
      etaStart: "",
      etaFinish: "",
      totalLoads: "",
      totalTonnes: ""
    },
    trucks: [
      {
        id:"",
        model: "",
        plannedLoads: "",
        operator: ""
      },
      {
        id:"",
        model: "",
        plannedLoads: "",
        operator: ""
      },
      {
        id:"",
        model: "",
        plannedLoads: "",
        operator: ""
      },
      {
        id:"",
        model: "",
        plannedLoads: "",
        operator: ""
      },
      {
        id:"",
        model: "",
        plannedLoads: "",
        operator: ""
      },
      {
        id:"",
        model: "",
        plannedLoads: "",
        operator: ""
      }
    ]
  },
  {
    excavator: {
      id: "EX201",
      operator: "",
      location: "",
      etaStart: "",
      etaFinish: "",
      totalLoads: "",
      totalTonnes: ""
    },
    trucks: [
      {
        id:"",
        model: "",
        plannedLoads: "",
        operator: ""
      },
      {
        id:"",
        model: "",
        plannedLoads: "",
        operator: ""
      },
      {
        id:"",
        model: "",
        plannedLoads: "",
        operator: ""
      },
      {
        id:"",
        model: "",
        plannedLoads: "",
        operator: ""
      },
      {
        id:"",
        model: "",
        plannedLoads: "",
        operator: ""
      },
      {
        id:"",
        model: "",
        plannedLoads: "",
        operator: ""
      }
    ]
  },
  {
    excavator: {
      id: "EX201",
      operator: "",
      location: "",
      etaStart: "",
      etaFinish: "",
      totalLoads: "",
      totalTonnes: ""
    },
    trucks: [
      {
        id:"",
        model: "",
        plannedLoads: "",
        operator: ""
      },
      {
        id:"",
        model: "",
        plannedLoads: "",
        operator: ""
      },
      {
        id:"",
        model: "",
        plannedLoads: "",
        operator: ""
      },
      {
        id:"",
        model: "",
        plannedLoads: "",
        operator: ""
      },
      {
        id:"",
        model: "",
        plannedLoads: "",
        operator: ""
      },
      {
        id:"",
        model: "",
        plannedLoads: "",
        operator: ""
      }
    ]
  }
]