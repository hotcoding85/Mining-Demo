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
  dispatch: any;
  dispatchs: any[];
  shiftRoster: any;
  haulRoutes: HaulRoute[];
  diggerHeader: string;
  dumpLocations: any[];
  assignedBenches: any[];
  addBenches: (newBenches: any, diggerId: string) => void;
  addHaulRoute: (newHaulRoute: HaulRoute) => void;
  addDumpLocation: (newDumpLocation: any, diggerId: string) => void;
  assignReadyTrucks: (oldTruck, newTruck, diggerId) => void;
  reAssignTruckToFleet: (truck: Truck, fromId: string, toId: string) => void;
  removeTruckFromAssigned: (removedTruck: Truck, diggerId: string) => void;
}

const MainCard: React.FC<MainCardProps> = ({
  dispatch,
  dispatchs,
  haulRoutes,
  shiftRoster,
  diggerHeader,
  dumpLocations,
  assignedBenches,
  addBenches,
  addHaulRoute,
  addDumpLocation,
  assignReadyTrucks,
  reAssignTruckToFleet,
  removeTruckFromAssigned,
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

  const excuvatorVehicle = dispatch.vehicle;

  const normalizeDestination = useMemo(
    () => ({
      ...dispatch.destination,
      locationImg: dumpLocations.find(
        (item) => dispatch.destination.id === item.id
      )?.locationImg,
    }),
    [dispatch.destination, dumpLocations]
  );

  console.log(normalizeDestination)

  return (
    <React.Fragment>
      <div className="dispatch-live-main-card">
        <div className="content-container">
          <div className="vehicle-card-container">
            <p className="vehicle-card-name">{diggerHeader}</p>
            <VehicleCard
              vehicle={excuvatorVehicle}
              source={dispatch.source}
              shiftRoster={shiftRoster}
              smu={getRandomFloat(23000, 38000, 1)}
              fuelLevel={getRandomInt(20, 100)}
              fuelRate={getRandomFloat(40, 80, 1)}
              imageUrl={pc2000}
              lastUpdated={getRandomInt(1, 2) + "m"}
              sync={"active"}
              assignedBenches={assignedBenches}
              addBenches={addBenches}
              collapse={false}
            />
          </div>
          <AssignBoard
            dispatchs={dispatchs}
            dispatch={dispatch}
            assignedTrucks={dispatch.supportTrucks}
            assignReadyTrucks={assignReadyTrucks}
            removeTruckFromAssigned={removeTruckFromAssigned}
            reAssignTruckToFleet={reAssignTruckToFleet}
            dumpLocation={normalizeDestination}
            haulRoutes={haulRoutes}
            addDumpLocation={addDumpLocation}
            addHaulRoute={addHaulRoute}
          />
        </div>
      </div>
    </React.Fragment>
  );
};

export default MainCard;
