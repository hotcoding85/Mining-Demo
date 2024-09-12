import React from "react";
import AssignTruckItem from "../../DispatchLive/AssignTruckItem";
import AssignLocationItem from "../../DispatchLive/AssignLocationItem";
import {
  Truck,
  DumpLocation,
  Material,
} from "../../DispatchLive/interfaces/type";
import AssignMaterialItem from "./AssignMaterialItem";

interface AssignBoardProps {
  readyTrucks: Truck[];
  updateReadyTrucks: (updatedTask: Truck) => void;
  targetMaterials: Material[];
  updateTargetMaterials: (updatedTask: Material) => void;
  dumpLocations: DumpLocation[];
  addDumpLocation: (newDumpLocation: DumpLocation) => void;
  collapse?: boolean;
}

const AssignBoard: React.FC<AssignBoardProps> = ({
  readyTrucks,
  updateReadyTrucks,
  targetMaterials,
  updateTargetMaterials,
  dumpLocations,
  addDumpLocation,
  collapse,
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
          sourceId={1}
          readyTrucks={readyTrucks}
          updateReadyTrucks={updateReadyTrucks}
          collapse={collapse}
        />
        <AssignMaterialItem
          sourceId={1}
          targetMaterials={targetMaterials}
          updateTargetMaterials={updateTargetMaterials}
        />
        <AssignLocationItem
          sourceId={1}
          dumpLocations={dumpLocations}
          addDumpLocation={addDumpLocation}
        />
      </div>
      <div className="assign-item-pair">
        <AssignTruckItem
          sourceId={2}
          readyTrucks={readyTrucks}
          updateReadyTrucks={updateReadyTrucks}
          collapse={collapse}
        />
        <AssignMaterialItem
          sourceId={2}
          targetMaterials={targetMaterials}
          updateTargetMaterials={updateTargetMaterials}
        />
        <AssignLocationItem
          sourceId={2}
          dumpLocations={dumpLocations}
          addDumpLocation={addDumpLocation}
        />
      </div>
      <div className="assign-item-pair">
        <AssignTruckItem
          sourceId={3}
          readyTrucks={readyTrucks}
          updateReadyTrucks={updateReadyTrucks}
          collapse={collapse}
        />
        <AssignMaterialItem
          sourceId={3}
          targetMaterials={targetMaterials}
          updateTargetMaterials={updateTargetMaterials}
        />
        <AssignLocationItem
          sourceId={3}
          dumpLocations={dumpLocations}
          addDumpLocation={addDumpLocation}
        />
      </div>
      <div className="assign-item-pair">
        <AssignTruckItem
          sourceId={4}
          readyTrucks={readyTrucks}
          updateReadyTrucks={updateReadyTrucks}
          collapse={collapse}
        />
        <AssignMaterialItem
          sourceId={4}
          targetMaterials={targetMaterials}
          updateTargetMaterials={updateTargetMaterials}
        />
        <AssignLocationItem
          sourceId={4}
          dumpLocations={dumpLocations}
          addDumpLocation={addDumpLocation}
        />
      </div>
      <div className="assign-item-pair">
        <AssignTruckItem
          sourceId={5}
          readyTrucks={readyTrucks}
          updateReadyTrucks={updateReadyTrucks}
          collapse={collapse}
        />
        <AssignMaterialItem
          sourceId={5}
          targetMaterials={targetMaterials}
          updateTargetMaterials={updateTargetMaterials}
        />
        <AssignLocationItem
          sourceId={5}
          dumpLocations={dumpLocations}
          addDumpLocation={addDumpLocation}
        />
      </div>
    </div>
  );
};

export default AssignBoard;
