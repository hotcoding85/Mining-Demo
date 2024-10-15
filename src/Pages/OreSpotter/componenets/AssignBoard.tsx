import React from "react";
import AssignTruckItem from "../../DispatchLive/AssignTruckItem";
import AssignLocationItem from "../../DispatchLive/AssignLocationItem";
import {
  Truck,
  DumpLocation,
  Material,
} from "../../DispatchLive/interfaces/type";
import AssignMaterialItem from "./AssignMaterialItem";
import { Vehicle } from "slices/fleet/reducer";

interface AssignBoardProps {
  digger: Vehicle;
  readyTrucks: Truck[];
  targetMaterials: Material[];
  dumpLocations: DumpLocation[];
  addDumpLocation: (newDumpLocation: DumpLocation) => void;
  updateReadyTrucks: (updatedTask: Truck) => void;
  assignTruckToFleet: (truck: Truck, diggerId: string) => void;
  updateTargetMaterials: (updatedTask: Material) => void;
  removeTruckFromAssigned: (removedTruck: Truck, diggerId: string) => void;
}

const AssignBoard: React.FC<AssignBoardProps> = ({
  digger,
  readyTrucks,
  updateReadyTrucks,
  assignTruckToFleet,
  removeTruckFromAssigned,
  targetMaterials,
  updateTargetMaterials,
  dumpLocations,
  addDumpLocation,
}) => {
  return (
    <div className="assign-item-container">
      <div className="assign-item-pair">
        <p className="assign-truck-item-header">Assigned Trucks</p>
        <p className="assign-material-item-header">Assigned Mateirals</p>
        <p className="assign-location-item-header">Hauling to Location</p>
      </div>

      <div className="assign-item-pair">
        <AssignTruckItem
          dispatchs={[]}
          diggerId={digger.id}
          assignedTruck={readyTrucks}
          assignReadyTrucks={updateReadyTrucks}
          removeTruckFromAssigned={removeTruckFromAssigned}
          reAssignTruckToFleet={assignTruckToFleet}
          directionDispalyName="wrap"
          operator={""}
        />
        <AssignMaterialItem
          diggerId={digger.id}
          sourceId={1}
          targetMaterials={targetMaterials}
          updateTargetMaterials={updateTargetMaterials}
        />
        <AssignLocationItem
          diggerId={digger.id}
          dumpLocation={dumpLocations}
          addDumpLocation={addDumpLocation}
          truckId={""}
          locations={[]}
          destinationId={""}
        />
      </div>
      <div className="assign-item-pair">
        <AssignTruckItem
          dispatchs={[]}
          diggerId={digger.id}
          assignedTruck={readyTrucks}
          assignReadyTrucks={updateReadyTrucks}
          reAssignTruckToFleet={assignTruckToFleet}
          removeTruckFromAssigned={removeTruckFromAssigned}
          directionDispalyName="wrap"
          operator={""}
        />
        <AssignMaterialItem
          diggerId={digger.id}
          sourceId={2}
          targetMaterials={targetMaterials}
          updateTargetMaterials={updateTargetMaterials}
        />
        <AssignLocationItem
          diggerId={digger.id}
          dumpLocation={dumpLocations}
          addDumpLocation={addDumpLocation}
          truckId={""}
          locations={[]}
          destinationId={""}
        />
      </div>
      <div className="assign-item-pair">
        <AssignTruckItem
          dispatchs={[]}
          diggerId={digger.id}
          assignedTruck={readyTrucks}
          assignReadyTrucks={updateReadyTrucks}
          reAssignTruckToFleet={assignTruckToFleet}
          removeTruckFromAssigned={removeTruckFromAssigned}
          directionDispalyName="wrap"
          operator={""}
        />
        <AssignMaterialItem
          diggerId={digger.id}
          sourceId={3}
          targetMaterials={targetMaterials}
          updateTargetMaterials={updateTargetMaterials}
        />
        <AssignLocationItem
          diggerId={digger.id}
          dumpLocation={dumpLocations}
          addDumpLocation={addDumpLocation}
          truckId={""}
          locations={[]}
          destinationId={""}
        />
      </div>
      <div className="assign-item-pair">
        <AssignTruckItem
          dispatchs={[]}
          diggerId={digger.id}
          assignedTruck={readyTrucks}
          assignReadyTrucks={updateReadyTrucks}
          removeTruckFromAssigned={removeTruckFromAssigned}
          reAssignTruckToFleet={assignTruckToFleet}
          directionDispalyName="wrap"
          operator={""}
        />
        <AssignMaterialItem
          diggerId={digger.id}
          sourceId={4}
          targetMaterials={targetMaterials}
          updateTargetMaterials={updateTargetMaterials}
        />
        <AssignLocationItem
          diggerId={digger.id}
          dumpLocation={dumpLocations}
          addDumpLocation={addDumpLocation}
          truckId={""}
          locations={[]}
          destinationId={""}
        />
      </div>
    </div>
  );
};

export default AssignBoard;
