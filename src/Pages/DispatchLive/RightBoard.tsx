import React, { useCallback, useMemo, useState } from "react";
import StandbyTrucks from "./StandbyTrucks";
import UnavailableTrucks from "./UnavailableTrucks";
import ActiveBenches from "./ActiveBenches";
import { activeBenches } from "./data/sampleData";
import WasteDumpLocations from "./WasteDumpLocations";
import OreBodies from "./OreBodies";
import ReadyTrucks from "./ReadyTrucks";
import MessageBoard from "./MessageBoard";
import { DumpLocation, HaulRoute, Material, Truck } from "./interfaces/type";
import OreDumpLocations from "./OreDumpLocations";
import { OreDumpsForAssign } from "./data/sampleData";
import HaulRoutes from "./HaulRoutes";
import {
  centralRampToDump,
  dumpCentral,
  dumpNorth,
  dumpSouth,
  wasteToCentral,
} from "assets/images/locations";

const RouteImages = [centralRampToDump, wasteToCentral];

const LocationImages = [dumpNorth, dumpCentral, dumpSouth];

interface RightBoardProps {
  shiftRosters?: any[];
  dispatchs?: any[];
  fleets?: any[];
  benches?: any[];
  vehicleRoutes?: any[];
  materials?: any[];
  readyTrucks?: Truck[];
  dumpLocationsForAssign?: DumpLocation[];
  haulRoutesForAssign?: HaulRoute[];
  targetMaterials?: Material[];
  wasteLocations?: any[];
  oreLocations?: any[];
}

const RightBoard: React.FC<RightBoardProps> = ({
  shiftRosters,
  dispatchs,
  fleets,
  benches,
  vehicleRoutes,
  materials,
  wasteLocations,
  oreLocations,
}) => {
  const [isShowMore, setIsShowMore] = useState<boolean>(true);

  const onShowMoreOrLess = () => {
    setIsShowMore(!isShowMore);
  };

  const dumpTruckFilter = useCallback(
    (vehicle) =>
      vehicle?.category === "DUMP_TRUCK" &&
      (vehicle?.state === "STANDBY" || vehicle?.state === "ACTIVE"),
    []
  );

  const mergedSupportingTrucks = useMemo(
    () => dispatchs?.flatMap((dispatch) => dispatch.supporting) || [],
    [dispatchs]
  );

  const rosterReadyForDispatch = useMemo(() => {
    return (
      shiftRosters?.filter(
        ({ vehicle, operators }) =>
          dumpTruckFilter(vehicle) &&
          operators?.length > 0 &&
          !mergedSupportingTrucks.includes(vehicle.id)
      ) || []
    );
  }, [shiftRosters, dumpTruckFilter, dispatchs, mergedSupportingTrucks]);

  const fleetsStandByNoOperator = useMemo(() => {
    const assignedVehicles = rosterReadyForDispatch.map(
      (item) => item.vehicle.id
    );

    return (
      fleets?.filter(
        (fleet) =>
          !assignedVehicles.includes(fleet.id) &&
          !mergedSupportingTrucks.includes(fleet.id) &&
          dumpTruckFilter(fleet)
      ) || []
    );
  }, [fleets, rosterReadyForDispatch, dumpTruckFilter, mergedSupportingTrucks]);

  const fleetsDownForRepair = useMemo(() => {
    return (
      fleets?.filter(
        (vehicle) =>
          vehicle.state === "DOWN" && vehicle.category === "DUMP_TRUCK"
      ) || []
    );
  }, [fleets]);

  const activeBenches = useMemo(() => {
    const assignedSourceIds =
      dispatchs?.flatMap((item) => item.sourceId) || [];

    return (
      benches
        ?.filter(
          (bench) =>
            bench.status === "ACTIVE" &&
            bench.category !== "DESTINATION" &&
            !assignedSourceIds.includes(bench.id)
        )
        ?.map((item, index) => ({
          ...item,
          locationImg: LocationImages[index % 3],
        })) || []
    );
  }, [benches, dispatchs]);

  const normalizedVehicleRoutes = useMemo(() => {
    return (
      vehicleRoutes?.map((item, index) => ({
        ...item,
        locationImg: RouteImages[index % 2],
      })) || []
    );
  }, [vehicleRoutes]);

  return (
    <React.Fragment>
      <div className="dispatch-right-board">
        <MessageBoard />
        <div className="right-board-divider" />
        <ReadyTrucks readyTrucks={rosterReadyForDispatch} />
        <div className="right-board-divider" />
        <StandbyTrucks standByTrucks={fleetsStandByNoOperator} />
        <div className="right-board-divider" />
        <WasteDumpLocations dumpLocationsForAssign={wasteLocations || []} />
        <div className="right-board-divider" />
        <OreDumpLocations dumpLocationsForAssign={oreLocations || []} />
        <div className="right-board-divider" />
        <HaulRoutes routesForAssign={normalizedVehicleRoutes} />
        <div className="right-board-divider" />
        <ActiveBenches activeBenches={activeBenches} />
        {materials && (
          <>
            <div className="right-board-divider" />
            <OreBodies targetMaterials={materials} />
          </>
        )}
      </div>
    </React.Fragment>
  );
};

export default RightBoard;
