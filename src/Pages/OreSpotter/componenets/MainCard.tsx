import React, { useState } from "react";
import VehicleCard from "../../DispatchLive/VehicleCard";
import AssignTruckItem from "../../DispatchLive/AssignTruckItem";
import AssignLocationItem from "../../DispatchLive/AssignLocationItem";
import { pc2000 } from "assets/images/equipment";
import { Row, Col } from "reactstrap";
import { Select, Progress, Switch } from "antd";
import {
  DumpLocation,
  Material,
  Truck,
  ActiveBenchData,
} from "../../DispatchLive/interfaces/type";
import AssignBoard from "./AssignBoard";
import { Vehicle } from "slices/fleet/reducer";

interface MainCardProps {
  digger: Vehicle;
  readyTrucks: Truck[];
  updateReadyTrucks: (updatedTask: Truck) => void;
  targetMaterials: Material[];
  updateTargetMaterials: (updatedTask: Material) => void;
  dumpLocations: DumpLocation[];
  addDumpLocation: (newDumpLocation: DumpLocation) => void;
  removeTruckFromAssigned : (removedTruck: Truck) => void;
  assignTruckToFleet : (truck : Truck, diggerId : string) => void;
  assignedBenches : ActiveBenchData[];
  addBenches : (newBenches: ActiveBenchData) => void;
}

const MainCard: React.FC<MainCardProps> = ({
  digger,
  readyTrucks,
  updateReadyTrucks,
  removeTruckFromAssigned,
  assignTruckToFleet,
  targetMaterials,
  updateTargetMaterials,
  dumpLocations,
  addDumpLocation,
  assignedBenches,
  addBenches,
}) => {
  const [collapseView, setCollapseView] = useState<boolean>(true);

  const toggleCollapse = () => {
    setCollapseView(!collapseView);
  };

  function getRandomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  function getRandomFloat(
    min: number,
    max: number,
    decimalPlaces: number
  ): number {
    const factor = Math.pow(10, decimalPlaces);
    return Math.round((Math.random() * (max - min) + min) * factor) / factor;
  }

  return (
    <React.Fragment>
      <div className="dispatch-live-main-card">
        <div className="dispatch-location">
          <div className="current-location-containe">
            <div className="current-location-text">
              <p className="current-location-label">Current Work Location</p>
              <select name="current-work-location" id="currentWorkLocation">
                <option value="440_BLK1_HG01" selected>
                  440_BLK1_HG01
                </option>
              </select>
            </div>
            <div className="collapse-view-containe">
              <span className="collapse-view-label">Collapse view</span>
              <Switch
                className="collapse-view-toggle"
                defaultChecked
                onChange={toggleCollapse}
              />
            </div>
          </div>
          <div className="current-location-progress">
            <p className="vehicle-progress-text" style={{ color: "white" }}>
              <span className="vehicle-progress-label">Total Tonnes Moved</span>
              <span className="vehicle-progress-value">50t/100t</span>
            </p>
            <Progress percent={50} showInfo={false} />
          </div>
        </div>
        <div className="content-container">
          <div className="vehicle-card-container">
            <p className="vehicle-card-name">Digger Fleet</p>
            <VehicleCard
              key={1}
              index={1}
              id={digger.name || "Unknown"}
              status={"Healthy"}
              smu={getRandomFloat(23000, 38000, 1)}
              fuelLevel={getRandomInt(20, 100)}
              fuelRate={getRandomFloat(40, 80, 1)}
              imageUrl={pc2000}
              lastUpdated={getRandomInt(1, 2) + "m"}
              sync={digger.status.toLowerCase() as any}
              collapse={collapseView}
              assignedBenches={assignedBenches}
              addBenches={addBenches}
            />
          </div>
          <AssignBoard
            digger={digger}
            readyTrucks={readyTrucks}
            updateReadyTrucks={updateReadyTrucks}
            assignTruckToFleet={assignTruckToFleet}
            removeTruckFromAssigned={removeTruckFromAssigned}
            targetMaterials={targetMaterials}
            updateTargetMaterials={updateTargetMaterials}
            dumpLocations={dumpLocations}
            addDumpLocation={addDumpLocation}
          />
        </div>
      </div>
    </React.Fragment>
  );
};

export default MainCard;
