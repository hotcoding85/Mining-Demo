import React from "react";
import VehicleCard from "./VehicleCard";
import AssignTruckItem from "./AssignTruckItem";
import AssignLocationItem from "./AssignLocationItem";
import { pc2000 } from "assets/images/equipment";
import { Row, Col } from "reactstrap";
import { Select, Progress } from "antd";
import { Truck, DumpLocation } from "./interfaces/type";
import { Vehicle } from "slices/fleet/reducer";

interface AssignBoardProps {
    index:number;
    assignedTrucks: Truck[];
    updateReadyTrucks: (updatedTask: Truck) => void;
    removeTruckFromAssigned : (removedTruck: Truck) => void;
    dumpLocations : DumpLocation[];
    addDumpLocation : (newDumpLocation: DumpLocation) => void;
}  

const AssignBoard : React.FC<AssignBoardProps> = ({
    index,
    assignedTrucks,
    updateReadyTrucks,
    removeTruckFromAssigned,
    dumpLocations,
    addDumpLocation
}) => {

    return (
        <div className="assign-item-container">
            <div className="assign-item-pair">
                <p className="assign-truck-item-header">Assigned Trucks to Circuit</p>
                <p className="assign-location-item-header">Hauling to Location</p>
            </div>

            <div className="assign-item-pair">
                <AssignTruckItem 
                    sourceId={(index-1) * 5 + 1}
                    assignedTrucks={assignedTrucks}
                    updateReadyTrucks={updateReadyTrucks}
                    removeTruckFromAssigned={removeTruckFromAssigned}
                />
                <AssignLocationItem 
                    sourceId={(index-1) * 5 + 1}
                    dumpLocations={dumpLocations}
                    addDumpLocation={addDumpLocation}
                />
            </div>
            <div className="assign-item-pair">
                <AssignTruckItem 
                    sourceId={(index-1) * 5 + 2}
                    assignedTrucks={assignedTrucks}
                    updateReadyTrucks={updateReadyTrucks}
                    removeTruckFromAssigned={removeTruckFromAssigned}
                />
                <AssignLocationItem 
                    sourceId={(index-1) * 5 + 2}
                    dumpLocations={dumpLocations}
                    addDumpLocation={addDumpLocation}
                />
            </div>
            <div className="assign-item-pair">
                <AssignTruckItem 
                    sourceId={(index-1) * 5 + 3}
                    assignedTrucks={assignedTrucks}
                    updateReadyTrucks={updateReadyTrucks}
                    removeTruckFromAssigned={removeTruckFromAssigned}
                />
                <AssignLocationItem 
                    sourceId={(index-1) * 5 + 3}
                    dumpLocations={dumpLocations}
                    addDumpLocation={addDumpLocation}
                />
            </div>
            <div className="assign-item-pair">
                <AssignTruckItem 
                    sourceId={(index-1) * 5 + 4}
                    assignedTrucks={assignedTrucks}
                    updateReadyTrucks={updateReadyTrucks}
                    removeTruckFromAssigned={removeTruckFromAssigned}
                />
                <AssignLocationItem 
                    sourceId={(index-1) * 5 + 4}
                    dumpLocations={dumpLocations}
                    addDumpLocation={addDumpLocation}
                />
            </div>
            <div className="assign-item-pair">
                <AssignTruckItem 
                    sourceId={(index-1) * 5 + 5}
                    assignedTrucks={assignedTrucks}
                    updateReadyTrucks={updateReadyTrucks}
                    removeTruckFromAssigned={removeTruckFromAssigned}
                />
                <AssignLocationItem 
                    sourceId={(index-1) * 5 + 5}
                    dumpLocations={dumpLocations}
                    addDumpLocation={addDumpLocation}
                />
            </div>
        </div>
    )
}

export default AssignBoard;
