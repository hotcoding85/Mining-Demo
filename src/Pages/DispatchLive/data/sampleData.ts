import { ActiveBenchData, Truck, DumpLocation } from "../interfaces/type"
import { dumpCentral, dumpNorth, dumpSouth } from "assets/images/locations";

export const activeBenches : ActiveBenchData[] = [
    {id : 1, name : "440_BLK1_HG02"},
    {id : 2, name : "440_BLK1_HG03"},
    {id : 3, name : "440_BLK1_HG04"},
    {id : 4, name : "440_BLK1_HG05"},
    {id : 5, name : "440_BLK1_HG06"},
    {id : 6, name : "440_BLK1_HG07"},
]

export const sampleReadyTrucks: Truck[] = [
    { id: 1, assignId: 0, truckId: "DT105", operator : "J.Taylor"},
    { id: 2, assignId: 0, truckId: "DT106", operator : "J.Taylor"},
    { id: 3, assignId: 0, truckId: "DT107", operator : "J.Taylor"},
];

export const dumpLocationsForAssign: DumpLocation[] = [
    { id: 1, assignId: 0, locationImg: dumpNorth, locationName : "Waste Dump - North"},
    { id: 2, assignId: 0, locationImg: dumpCentral, locationName : "Waste Dump - Central"},
    { id: 3, assignId: 0, locationImg: dumpSouth, locationName : "Waste Dump - South"},
];