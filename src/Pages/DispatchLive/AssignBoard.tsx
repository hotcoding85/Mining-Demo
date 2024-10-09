import React from "react";
import AssignTruckItem from "./AssignTruckItem";
import AssignLocationItem from "./AssignLocationItem";
import { Truck, DumpLocation, DiggerData, HaulRoute } from "./interfaces/type";
import AssignRouteItem from "./AssignRouteItem";

interface AssignBoardProps {
  dispatch: any;
  dispatchs: any[];
  assignedTrucks: Truck[];
  haulRoutes: HaulRoute[];
  dumpLocation: DumpLocation[];
  addHaulRoute: (newHaulRoute: HaulRoute) => void;
  addDumpLocation: (newDumpLocation: any, diggerId: string) => void;
  assignReadyTrucks: (oldTruck, newTruck, diggerId) => void;
  reAssignTruckToFleet: (truck: Truck, fromId: string, toId: string) => void;
  removeTruckFromAssigned: (removedTruck: Truck, diggerId: string) => void;
}

const AssignBoard: React.FC<AssignBoardProps> = ({
  dispatch,
  dispatchs,
  haulRoutes,
  dumpLocation,
  assignedTrucks,
  addHaulRoute,
  addDumpLocation,
  assignReadyTrucks,
  reAssignTruckToFleet,
  removeTruckFromAssigned,
}) => {
  const itemLength = assignedTrucks.length >= 5 ? assignedTrucks.length + 1 : 5;
  const assignArr = Array.from({ length: itemLength });

  return (
    <div className="assign-item-container">
      <div className="assign-item-pair">
        <p className="assign-truck-item-header">Assign Trucks</p>
        <p className="assign-location-item-header">Dump Location</p>
        <p className="assign-location-item-header">Haul Route</p>
      </div>

      {assignArr.map((_, index) => (
        <div className="assign-item-pair">
          <AssignTruckItem
            dispatchs={dispatchs}
            diggerId={dispatch.vehicleId}
            assignedTruck={assignedTrucks[index]}
            assignReadyTrucks={assignReadyTrucks}
            reAssignTruckToFleet={reAssignTruckToFleet}
            removeTruckFromAssigned={removeTruckFromAssigned}
            directionDispalyName="inline"
          />
          <AssignLocationItem
            diggerId={dispatch.vehicleId}
            dumpLocation={dumpLocation}
            addDumpLocation={addDumpLocation}
          />
          <AssignRouteItem
            diggerId={dispatch.vehicleId}
            sourceId={index}
            haulRoutes={haulRoutes}
            addHaulRoute={addHaulRoute}
          />
        </div>
      ))}
    </div>
  );
};

export default AssignBoard;
