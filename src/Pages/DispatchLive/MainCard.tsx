import React, { useMemo } from "react";
import VehicleCard from "./VehicleCard";
import { pc2000 } from "assets/images/equipment";
import {
  ActiveBenchData,
  DiggerData,
  DumpLocation,
  HaulRoute,
  Truck,
} from "./interfaces/type";
import AssignBoard from "./AssignBoard";

interface MainCardProps {
  excavators:any[];
  excavator: any;
  dispatchs: any[];
  shiftRoster: any;
  haulRoutes: HaulRoute[];
  diggerHeader: string;
  dumpLocations: any[];
  assignedBenches: any[];
  assignedTrucks: any[];
  locations: any[];
  addBenches: (newLocation: any, oldLocation: any, data: any) => void;
  addHaulRoute: (newHaulRoute: HaulRoute) => void;
  addDumpLocation: (newDumpLocation: any, diggerId: string) => void;
  assignReadyTrucks: (oldTruck, newTruck, diggerId) => void;
  reAssignTruckToFleet: (truck: Truck, fromId: string, toId: string) => void;
  removeTruckFromAssigned: (removedTruck: Truck, diggerId: string) => void;
  changePlanState: (location: string, vehicleId: string) => void;
}

const MainCard: React.FC<MainCardProps> = ({
  excavators,
  excavator,
  dispatchs,
  haulRoutes,
  shiftRoster,
  diggerHeader,
  dumpLocations,
  assignedBenches,
  assignedTrucks,
  locations,
  addBenches,
  addHaulRoute,
  addDumpLocation,
  assignReadyTrucks,
  reAssignTruckToFleet,
  removeTruckFromAssigned,
  changePlanState,
}) => {
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
        <div className="content-container">
          <div className="vehicle-card-container">
            <p className="vehicle-card-name">{diggerHeader}</p>
            <VehicleCard
              vehicle={excavator}
              dispatchs={dispatchs}
              shiftRoster={shiftRoster}
              smu={getRandomFloat(23000, 38000, 1)}
              fuelLevel={80}
              fuelRate={getRandomFloat(40, 80, 1)}
              imageUrl={pc2000}
              lastUpdated={getRandomInt(1, 2) + "m"}
              sync={"active"}
              assignedBenches={assignedBenches}
              addBenches={addBenches}
              collapse={false}
              changePlanState={changePlanState}
            />
          </div>
          <AssignBoard
            dispatchs={dispatchs}
            excavator={excavator}
            assignedTrucks={assignedTrucks}
            assignReadyTrucks={assignReadyTrucks}
            removeTruckFromAssigned={removeTruckFromAssigned}
            reAssignTruckToFleet={reAssignTruckToFleet}
            haulRoutes={haulRoutes}
            addDumpLocation={addDumpLocation}
            addHaulRoute={addHaulRoute}
            locations={locations}
            shiftRoster={shiftRoster}
            excavators={excavators}
          />
        </div>
      </div>
    </React.Fragment>
  );
};

export default MainCard;
