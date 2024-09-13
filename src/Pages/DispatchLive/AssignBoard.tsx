import React, { useState } from "react";
import AssignTruckItem from "./AssignTruckItem";
import AssignLocationItem from "./AssignLocationItem";
import { Truck, DumpLocation, DiggerData } from "./interfaces/type";
import { diggers } from "./data/sampleData";
import { filter, max } from "lodash";
import { array } from "yup";
import { truckIcon } from "assets/images/equipment";

interface AssignBoardProps {
    digger : DiggerData;
    assignedTrucks: Truck[];
    updateReadyTrucks: (updatedTask: Truck) => void;
    removeTruckFromAssigned : (removedTruck: Truck) => void;
    assignTruckToFleet : (truck : Truck, diggerId : string) => void;
    dumpLocations : DumpLocation[];
    addDumpLocation : (newDumpLocation: DumpLocation) => void;
}  

const AssignBoard : React.FC<AssignBoardProps> = ({
    digger,
    assignedTrucks,
    updateReadyTrucks,
    removeTruckFromAssigned,
    assignTruckToFleet,
    dumpLocations,
    addDumpLocation
}) => {

    const filteredAssignedTrucks = assignedTrucks.filter(truck => truck.diggerId == digger.diggerId);
    const assignIds = filteredAssignedTrucks.map(truck => {return truck.assignId});
    const maxValue = Math.max(...assignIds);
    const itemLength = maxValue >= 4 ? maxValue + 2 : 5;
    const assignArr = Array.from({length:itemLength});

    return (
        <div className="assign-item-container">
            <div className="assign-item-pair">
                <p className="assign-truck-item-header">Assigned Trucks to Circuit</p>
                <p className="assign-location-item-header">Hauling to Location</p>
            </div>

            {assignArr.map((item, index) => (
              <div className="assign-item-pair">
                <AssignTruckItem
                    diggerId={digger.diggerId}
                    sourceId={ index}
                    assignedTrucks={filteredAssignedTrucks}
                    updateReadyTrucks={updateReadyTrucks}
                    removeTruckFromAssigned={removeTruckFromAssigned}
                    assignTruckToFleet={assignTruckToFleet}
                    directionDispalyName="inline"
                />
                <AssignLocationItem 
                    diggerId={digger.diggerId}
                    sourceId={index}
                    dumpLocations={dumpLocations}
                    addDumpLocation={addDumpLocation}
                />
              </div>
            ))}
        </div>
    )
}

export default AssignBoard;
