import React from "react";
import AssignTruckItem from "./AssignTruckItem";
import AssignLocationItem from "./AssignLocationItem";
import { Truck, DumpLocation, DiggerData, HaulRoute } from "./interfaces/type";
import AssignRouteItem from "./AssignRouteItem";

interface AssignBoardProps {
  dispatch: any;
  dispatchs: any[];
  assignedTrucks: any[];
  haulRoutes: HaulRoute[];
  dumpLocation: DumpLocation[];
  locations: any[];
  shiftRoster: any;
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
  locations,
  shiftRoster,
  addHaulRoute,
  addDumpLocation,
  assignReadyTrucks,
  reAssignTruckToFleet,
  removeTruckFromAssigned,
}) => {
  const filteredTrucks = assignedTrucks.
    filter(item => item.excavatorId === dispatch.excavatorId)
    .sort((a: any, b: any) =>
      a?.truck.name?.localeCompare(b?.truck.name)
    );
  const truckIds = filteredTrucks.map(item => item.truckId);
  const itemLength = filteredTrucks.length >= 5 ? filteredTrucks.length + 1 : 5;
  const assignArr = Array.from({ length: itemLength });
  const operators = shiftRoster.filter((item) => truckIds.includes(item.vehicleId))

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
            diggerId={dispatch?.excavatorId}
            assignedTruck={filteredTrucks[index]}
            assignReadyTrucks={assignReadyTrucks}
            reAssignTruckToFleet={reAssignTruckToFleet}
            removeTruckFromAssigned={removeTruckFromAssigned}
            directionDispalyName="inline"
            operator={operators[index]?.operators[0]}
          />
          <AssignLocationItem
            diggerId={dispatch?.excavatorId}
            dumpLocation={dumpLocation}
            addDumpLocation={addDumpLocation}
            destinationId={filteredTrucks[index]?.destinationId}
            locations={locations}
            truckId={filteredTrucks[index]?.truckId}
          />
          <AssignRouteItem
            diggerId={dispatch?.excavatorId}
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
