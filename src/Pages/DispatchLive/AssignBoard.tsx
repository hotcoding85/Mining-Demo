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
  digger: Vehicle;
  readyTrucks: Truck[];
  updateReadyTrucks: (updatedTask: Truck) => void;
  dumpLocations: DumpLocation[];
  addDumpLocation: (newDumpLocation: DumpLocation) => void;
}

const AssignBoard: React.FC<AssignBoardProps> = ({
  digger,
  readyTrucks,
  updateReadyTrucks,
  dumpLocations,
  addDumpLocation,
}) => {
  return (
    <div className="assign-item-container">
      <div className="assign-item-pair">
        <p className="assign-truck-item-header">Assigned Trucks to Circuit</p>
        <p className="assign-location-item-header">Hauling to Location</p>
      </div>

      <div className="assign-item-pair">
        <AssignTruckItem
          diggerId={digger.id}
          sourceId={1}
          readyTrucks={readyTrucks}
          updateReadyTrucks={updateReadyTrucks}
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
          readyTrucks={readyTrucks}
          updateReadyTrucks={updateReadyTrucks}
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
          readyTrucks={readyTrucks}
          updateReadyTrucks={updateReadyTrucks}
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
          readyTrucks={readyTrucks}
          updateReadyTrucks={updateReadyTrucks}
        />
        <AssignLocationItem
          diggerId={digger.id}
          sourceId={4}
          dumpLocations={dumpLocations}
          addDumpLocation={addDumpLocation}
        />
      </div>
      <div className="assign-item-pair">
        <AssignTruckItem
          diggerId={digger.id}
          sourceId={5}
          readyTrucks={readyTrucks}
          updateReadyTrucks={updateReadyTrucks}
        />
        <AssignLocationItem
          diggerId={digger.id}
          sourceId={5}
          dumpLocations={dumpLocations}
          addDumpLocation={addDumpLocation}
        />
      </div>
    </div>
  );
};

export default AssignBoard;
