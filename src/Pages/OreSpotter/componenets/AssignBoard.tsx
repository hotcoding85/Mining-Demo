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
  updateReadyTrucks: (updatedTask: Truck) => void;
  removeTruckFromAssigned : (removedTruck: Truck) => void;
  assignTruckToFleet : (truck : Truck, diggerId : string) => void;
  targetMaterials: Material[];
  updateTargetMaterials: (updatedTask: Material) => void;
  dumpLocations: DumpLocation[];
  addDumpLocation: (newDumpLocation: DumpLocation) => void;
  collapse?: boolean;
}

const AssignBoard: React.FC<AssignBoardProps> = ({
  digger,
  readyTrucks,
  updateReadyTrucks,
  assignTruckToFleet,
  targetMaterials,
  updateTargetMaterials,
  dumpLocations,
  addDumpLocation,
  collapse,
  removeTruckFromAssigned,
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
          diggerId={digger.id}
          sourceId={1}
          assignedTrucks={readyTrucks}
          updateReadyTrucks={updateReadyTrucks}
          removeTruckFromAssigned={removeTruckFromAssigned}
          assignTruckToFleet={assignTruckToFleet}
          collapse={collapse}
          displayName="wrap"
        />
        <AssignMaterialItem
          diggerId={digger.id}
          sourceId={1}
          targetMaterials={targetMaterials}
          updateTargetMaterials={updateTargetMaterials}
        />
        <AssignLocationItem
          diggerId={digger.id}
          sourceId={1}
          dumpLocations={dumpLocations}
          addDumpLocation={addDumpLocation}
        />
      </div>
      <div className="assign-item-pair">
        <AssignTruckItem
          diggerId={digger.id}
          sourceId={2}
          assignedTrucks={readyTrucks}
          updateReadyTrucks={updateReadyTrucks}
          assignTruckToFleet={assignTruckToFleet}
          removeTruckFromAssigned={removeTruckFromAssigned}
          collapse={collapse}
          displayName="wrap"
        />
        <AssignMaterialItem
          diggerId={digger.id}
          sourceId={2}
          targetMaterials={targetMaterials}
          updateTargetMaterials={updateTargetMaterials}
        />
        <AssignLocationItem
          diggerId={digger.id}
          sourceId={2}
          dumpLocations={dumpLocations}
          addDumpLocation={addDumpLocation}
        />
      </div>
      <div className="assign-item-pair">
        <AssignTruckItem
          diggerId={digger.id}
          sourceId={3}
          assignedTrucks={readyTrucks}
          updateReadyTrucks={updateReadyTrucks}
          assignTruckToFleet={assignTruckToFleet}
          removeTruckFromAssigned={removeTruckFromAssigned}
          collapse={collapse}
          displayName="wrap"
        />
        <AssignMaterialItem
          diggerId={digger.id}
          sourceId={3}
          targetMaterials={targetMaterials}
          updateTargetMaterials={updateTargetMaterials}
        />
        <AssignLocationItem
          diggerId={digger.id}
          sourceId={3}
          dumpLocations={dumpLocations}
          addDumpLocation={addDumpLocation}
        />
      </div>
      <div className="assign-item-pair">
        <AssignTruckItem
          diggerId={digger.id}
          sourceId={4}
          assignedTrucks={readyTrucks}
          updateReadyTrucks={updateReadyTrucks}
          removeTruckFromAssigned={removeTruckFromAssigned}
          assignTruckToFleet={assignTruckToFleet}
          collapse={collapse}
          displayName="wrap"
        />
        <AssignMaterialItem
          diggerId={digger.id}
          sourceId={4}
          targetMaterials={targetMaterials}
          updateTargetMaterials={updateTargetMaterials}
        />
        <AssignLocationItem
          diggerId={digger.id}
          sourceId={4}
          dumpLocations={dumpLocations}
          addDumpLocation={addDumpLocation}
        />
      </div>
    </div>
  );
};

export default AssignBoard;
