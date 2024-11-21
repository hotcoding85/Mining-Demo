import { ActiveBenchData, Truck, DumpLocation, MessageData, DiggerData, Material, HaulRoute } from "../interfaces/type"
import { centralRampToDump, dumpCentral, dumpNorth, dumpSouth, wasteToCentral } from "assets/images/locations";

export const activeBenches : ActiveBenchData[] = [
    {id : 1, name : "440_BLK1_HG02", assignId : 0},
    {id : 2, name : "440_BLK1_HG03", assignId : 0},
    {id : 3, name : "440_BLK1_HG04", assignId : 0},
    {id : 4, name : "440_BLK1_HG05", assignId : 0},
    {id : 5, name : "440_BLK1_HG06", assignId : 0},
    {id : 6, name : "440_BLK1_HG07", assignId : 0},
]

export const sampleAssignedBenches : ActiveBenchData[] = [
    {id : 1, name : "440_BLK1_HG02", assignId : 1},
    {id : 2, name : "440_BLK1_HG03", assignId : 2},
    {id : 3, name : "440_BLK1_HG04", assignId : 3},
]

export const sampleAllMessages : MessageData[] = [
    {id : 1, truckId : "DT117", status : 'Breakdown'},
    {id : 2, truckId : "DT116", status : 'Delay Fueling'},
    {id : 3, truckId : "DT110", status : 'Delay Fueling'},
    {id : 4, truckId : "DT112", status : 'Breakdown'},
    {id : 5, truckId : "DT113", status : 'Delay Fueling'},
    {id : 6, truckId : "DT114", status : 'Breakdown'},

]

export const sampleNewMessages : MessageData[] = [
    {id : 1, truckId : "DT117", status : 'Breakdown'},
    {id : 2, truckId : "DT116", status : 'Delay Fueling'},
]

export const sampleReadyTrucks: Truck[] = [
    { id: 1, assignId: 0, truckId: "DT101", operator : "J.Taylor"},
    { id: 2, assignId: 0, truckId: "DT102", operator : "J.Taylor"},
    { id: 3, assignId: 0, truckId: "DT103", operator : "J.Taylor"},
    { id: 4, assignId: 0, truckId: "DT104", operator : "J.Taylor"},
    { id: 5, assignId: 0, truckId: "DT105", operator : "J.Taylor"},
    { id: 6, assignId: 0, truckId: "DT106", operator : "J.Taylor"},
    { id: 7, assignId: 0, truckId: "DT107", operator : "J.Taylor"},
    { id: 8, assignId: 0, truckId: "DT108", operator : "J.Taylor"},
    { id: 9, assignId: 0, truckId: "DT109", operator : "J.Taylor"},
];

export const dumpLocationsForAssign: DumpLocation[] = [
    { id: 1, assignId: 0, locationImg: dumpNorth, locationName : "Waste Dump - North"},
    { id: 2, assignId: 0, locationImg: dumpCentral, locationName : "Waste Dump - Central"},
    { id: 3, assignId: 0, locationImg: dumpSouth, locationName : "Waste Dump - East"},
    { id: 4, assignId: 0, locationImg: dumpSouth, locationName : "Waste Dump - West"},
    { id: 5, assignId: 0, locationImg: dumpSouth, locationName : "Waste Dump - South"},
];

export const haulRoutesForAssign: HaulRoute[] = [
    { id: 1, assignId: 0, locationImg: centralRampToDump, locationName : "Central Ramp - Dump", name: "Central Ramp - Dump"},
    { id: 2, assignId: 0, locationImg: wasteToCentral, locationName : "Waste - Central", name: "Waste - Central"}
];

export const OreDumpsForAssign: DumpLocation[] = [
    { id: 1, assignId: 0, locationImg: dumpNorth, locationName : "Ore Dump - North"},
    { id: 2, assignId: 0, locationImg: dumpCentral, locationName : "Ore Dump - Central"},
    { id: 3, assignId: 0, locationImg: dumpSouth, locationName : "Ore Dump - East"},
    { id: 4, assignId: 0, locationImg: dumpSouth, locationName : "Ore Dump - West"},
    { id: 5, assignId: 0, locationImg: dumpSouth, locationName : "Ore Dump - South"},
];

export const diggers : DiggerData[] = [
    {no:1, diggerId : "Digger1", headerName:"Digger Fleet 1"},
    {no:2, diggerId : "Digger2", headerName:"Digger Fleet 2"},
    {no:3, diggerId : "Digger3", headerName:"Digger Fleet 3"}
]

export const sampleTargetMaterials: Material[] = [
  { id: 1, assignId: 0, materialId: "HG01" },
  { id: 2, assignId: 0, materialId: "HG02" },
  { id: 3, assignId: 0, materialId: "HG03" },
];

