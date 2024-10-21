import React from "react";
import AssignTruckItem from "../../DispatchLive/AssignTruckItem";
import AssignLocationItem from "../../DispatchLive/AssignLocationItem";
import {
  Truck,
  DumpLocation,
  Material,
  HaulRoute,
} from "../../DispatchLive/interfaces/type";
import AssignMaterialItem from "./AssignMaterialItem";
import { Vehicle } from "slices/fleet/reducer";
import AssignRouteItem from "../../DispatchLive/AssignRouteItem";

interface AssignBoardProps {
  excavators: any[];
  targetMaterials: Material[];
  vehicle: any;
  dispatchs: any[];
  assignedTrucks: any[];
  haulRoutes: HaulRoute[];
  dumpLocation: DumpLocation[];
  locations: any[];
  shiftRoster: any;
  inprogressSource: any;
  updateTargetMaterials: (oldMaterial: any, updatedMaterial: any) => void;
  addHaulRoute: (newHaulRoute: HaulRoute) => void;
  addDumpLocation: (newDumpLocation: any, diggerId: string) => void;
  assignReadyTrucks: (oldTruck, newTruck, diggerId) => void;
  reAssignTruckToFleet: (truck: Truck, fromId: string, toId: string) => void;
  removeTruckFromAssigned: (removedTruck: Truck, diggerId: string) => void;
}

const AssignBoard: React.FC<AssignBoardProps> = ({
  excavators,
  targetMaterials,
  vehicle,
  dispatchs,
  haulRoutes,
  dumpLocation,
  assignedTrucks,
  locations,
  shiftRoster,
  inprogressSource,
  updateTargetMaterials,
  addHaulRoute,
  addDumpLocation,
  assignReadyTrucks,
  reAssignTruckToFleet,
  removeTruckFromAssigned,
}) => {
  const filteredTrucks = assignedTrucks
    .filter((item) => item.excavatorId === vehicle.id)
    .sort((a: any, b: any) => a?.truck?.name?.localeCompare(b?.truck?.name));
  const itemLength = filteredTrucks.length >= 5 ? filteredTrucks.length + 1 : 5;
  const assignArr = Array.from({ length: itemLength });

  return (
    <div className="assign-item-container">
      <div className="assign-item-pair">
        <p className="assign-truck-item-header">Assigned Trucks</p>
        <p className="assign-material-item-header">Assigned Mateirals</p>
        <p className="assign-location-item-header">Hauling to Location</p>
      </div>
      {assignArr.map((_, index) => (
        <div className="assign-item-pair">
          <AssignTruckItem
            dispatchs={dispatchs}
            excavatorId={vehicle?.id}
            assignedTruck={filteredTrucks[index]}
            assignReadyTrucks={assignReadyTrucks}
            reAssignTruckToFleet={reAssignTruckToFleet}
            removeTruckFromAssigned={removeTruckFromAssigned}
            directionDispalyName="inline"
            excavators={excavators}
          />
          <AssignMaterialItem
            vehicleId={vehicle?.id}
            truck={filteredTrucks[index]}
            inprogressSource={inprogressSource}
            shiftRoster={shiftRoster}
            targetMaterials={targetMaterials}
            updateTargetMaterials={updateTargetMaterials}
          />
          <AssignLocationItem
            diggerId={""}
            addDumpLocation={addDumpLocation}
            truckId={""}
            locations={[]}
            destinationId={""}
          />
        </div>
      ))}
    </div>
  );
};

export default AssignBoard;
