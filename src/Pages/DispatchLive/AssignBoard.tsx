import React from "react";
import AssignTruckItem from "./AssignTruckItem";
import AssignLocationItem from "./AssignLocationItem";
import { Truck, DumpLocation, DiggerData, HaulRoute } from "./interfaces/type";
import AssignRouteItem from "./AssignRouteItem";

interface AssignBoardProps {
    digger: DiggerData;
    assignedTrucks: Truck[];
    updateReadyTrucks: (updatedTask: Truck) => void;
    removeTruckFromAssigned: (removedTruck: Truck) => void;
    assignTruckToFleet: (truck: Truck, diggerId: string) => void;
    dumpLocations: DumpLocation[];
    haulRoutes: HaulRoute[];
    addDumpLocation: (newDumpLocation: DumpLocation) => void;
    addHaulRoute: (newHaulRoute: HaulRoute) => void;
}

const AssignBoard: React.FC<AssignBoardProps> = ({
    digger,
    assignedTrucks,
    updateReadyTrucks,
    removeTruckFromAssigned,
    assignTruckToFleet,
    dumpLocations,
    haulRoutes,
    addDumpLocation,
    addHaulRoute
}) => {

    const filteredAssignedTrucks = assignedTrucks.filter(truck => truck.diggerId == digger.diggerId).map((truck, index) => ({ ...truck, assignId: index }));
    const itemLength = filteredAssignedTrucks.length >= 5 ? filteredAssignedTrucks.length + 1 : 5;
    const assignArr = Array.from({ length: itemLength });

    return (
        <div className="assign-item-container">
            <div className="assign-item-pair">
                <p className="assign-truck-item-header">Assign Trucks</p>
                <p className="assign-location-item-header">Dump Location</p>
                <p className="assign-location-item-header">Haul Route</p>
            </div>

            {assignArr.map((item, index) => (
                <div className="assign-item-pair">
                    <AssignTruckItem
                        diggerId={digger.diggerId}
                        sourceId={index}
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
                    <AssignRouteItem
                        diggerId={digger.diggerId}
                        sourceId={index}
                        haulRoutes={haulRoutes}
                        addHaulRoute={addHaulRoute}
                    />

                </div>
            ))}
        </div>
    )
}

export default AssignBoard;
