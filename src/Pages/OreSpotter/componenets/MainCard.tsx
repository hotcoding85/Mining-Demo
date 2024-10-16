import React, { useState, useMemo } from "react";
import VehicleCard from "./VehicleCard";
import { pc2000 } from "assets/images/equipment";
import { Select, Progress, Switch } from "antd";
import {
  DumpLocation,
  Material,
  Truck,
  HaulRoute,
} from "../../DispatchLive/interfaces/type";
import AssignBoard from "./AssignBoard";
import { Vehicle } from "slices/fleet/reducer";

interface MainCardProps {
  targetMaterials: Material[];
  dispatch: any;
  dispatchs: any[];
  shiftRoster: any;
  haulRoutes: HaulRoute[];
  diggerHeader: string;
  dumpLocations: any[];
  assignedBenches: any[];
  assignedTrucks: any[];
  locations: any[];
  updateTargetMaterials: (oldMaterial: any, updatedMaterial: any) => void;
  addBenches: (newBenches: any, diggerId: string) => void;
  addHaulRoute: (newHaulRoute: HaulRoute) => void;
  addDumpLocation: (newDumpLocation: any, diggerId: string) => void;
  assignReadyTrucks: (oldTruck, newTruck, diggerId) => void;
  reAssignTruckToFleet: (truck: Truck, fromId: string, toId: string) => void;
  removeTruckFromAssigned: (removedTruck: Truck, diggerId: string) => void;
  changePlanState: (location: string, vehicleId: string) => void;
  addLocation: (newLocation: any, oldLocation: any, data: any) => void;
}

const MainCard: React.FC<MainCardProps> = ({
  targetMaterials,
  dispatch,
  dispatchs,
  haulRoutes,
  shiftRoster,
  diggerHeader,
  dumpLocations,
  assignedBenches,
  assignedTrucks,
  locations,
  updateTargetMaterials,
  addBenches,
  addHaulRoute,
  addDumpLocation,
  assignReadyTrucks,
  reAssignTruckToFleet,
  removeTruckFromAssigned,
  changePlanState,
  addLocation,
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

  // const excavatorVehicle = dispatch?.excavator;

  const filteredsources = useMemo(() => {
    return (
      dispatch.sources?.filter(
        (item) => item.status === "INPROGRESS" || item.status === "PLANNED"
      ) || []
    );
  }, [dispatch]);

  const inprogressSource = useMemo(() => {
    return filteredsources.find((item) => item.status === "INPROGRESS");
  }, [filteredsources]);

  const normalizeDestination = useMemo(
    () =>
      dispatch?.destination
        ? {
            ...dispatch?.destination,
            locationImg: dumpLocations.find(
              (item) => dispatch?.destination?.id === item.id
            )?.locationImg,
          }
        : undefined,
    [dispatch.destination, dumpLocations]
  );

  return (
    <React.Fragment>
      <div className="dispatch-live-main-card">
        <div className="dispatch-location">
          <div className="current-location-containe">
            <div className="current-location-text">
              <p className="current-location-label">Current Work Location</p>
              {!!dispatch.sources?.length && (
                <select
                  name="current-work-location"
                  id="currentWorkLocation"
                  defaultValue="0"
                  onChange={(e) => {
                    const selectedOptionId = e.target.selectedOptions[0].id;
                    changePlanState(selectedOptionId, dispatch.id);
                  }}
                >
                  {inprogressSource ? (
                    <option
                      key={inprogressSource.id}
                      value={inprogressSource.value}
                      id={inprogressSource.source.id}
                      selected
                      hidden
                    >
                      {inprogressSource?.source?.name}
                      {/* - {item?.source.blockId} */}
                    </option>
                  ) : (
                    <option hidden></option>
                  )}
                  {filteredsources.map((item) => {
                    return (
                      <option
                        key={item.id}
                        value={item.value}
                        id={item.source.id}
                      >
                        {item?.source?.name}
                        {/* - {item?.source.blockId} */}
                      </option>
                    );
                  })}
                </select>
              )}
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
              vehicle={dispatch}
              sources={dispatch.sources}
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
              addLocation={addLocation}
              filteredsources={filteredsources}
            />
          </div>
          <AssignBoard
            targetMaterials={targetMaterials}
            updateTargetMaterials={updateTargetMaterials}
            dispatchs={dispatchs}
            dispatch={dispatch}
            assignedTrucks={assignedTrucks}
            assignReadyTrucks={assignReadyTrucks}
            removeTruckFromAssigned={removeTruckFromAssigned}
            reAssignTruckToFleet={reAssignTruckToFleet}
            dumpLocation={normalizeDestination}
            haulRoutes={haulRoutes}
            addDumpLocation={addDumpLocation}
            addHaulRoute={addHaulRoute}
            locations={locations}
            shiftRoster={shiftRoster}
            inprogressSource={inprogressSource}
          />
        </div>
      </div>
    </React.Fragment>
  );
};

export default MainCard;
