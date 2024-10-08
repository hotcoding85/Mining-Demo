import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Container, Row } from "reactstrap";
import SideBar from "./sidebar/SideBar";
import { shiftInfoData, sideMenu } from "./data/sampleData";
import List from "./List";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { useSelector } from "react-redux";
import { createSelector } from "reselect";
import { useDispatch } from "react-redux";
import {
  addDispatch,
  addDispatchs,
  addShiftRoster,
  addShiftRosters,
  getAllBenches,
  getAllFleet,
  getAllUsers,
  getDispatchs,
  getShiftRosters,
  getTargetsByRoster,
  updateDispatch,
  updateShiftRoster,
} from "slices/thunk";
import { format } from "date-fns";
import { DatePicker, DatePickerProps, Segmented } from "antd";
import { useSearchParams } from "react-router-dom";
import dayjs from "dayjs";
import RosterFilter from "./Filter";
import { uniq, uniqBy } from "lodash";
import { getFleet } from "Helpers/api_vehicle_helper";
import { getTargetByRoster } from "Helpers/api_target_helper";
import { usePlans } from "Hooks/usePlans";
import { useRosters } from "Hooks/useRosters";

const PreShiftInfo = () => {
  document.title = "Pre Shift Info | FMS Live";

  const dispatch: any = useDispatch();

  const { shiftRosters, fleets, users, benches, targets, dispatchs } =
    useSelector(
      createSelector(
        (state: any) => state,
        (state) => {
          return {
            shiftRosters: state.ShiftRosters.data,
            fleets: state.Fleet.data,
            users: state.Users.data,
            benches: state.Benches.data,
            targets: state.Targets.data,
            dispatchs: state.Dispatch.data,
          };
        }
      )
    );

  const [shift, setShift] = useState<any>(null);
  const [startDate, setStartDate] = useState<any>(null);

  const {
    savedPlans,
    addNewPlan,
    revokeTruckFromPlan,
    addNewLocation,
    clearSavedPlans,
  } = usePlans(dispatchs);

  const { savedRosters, addNewRoster, clearSavedRoster } = useRosters();

  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    setShift(queryParams.get("shift") ? queryParams.get("shift") : "DS");
    setStartDate(
      queryParams.get("date")
        ? new Date(queryParams.get("date") || new Date())
        : new Date()
    );
  }, []);

  useEffect(() => {
    if (startDate !== null && shift !== null) {
      dispatch(getShiftRosters(format(startDate, "yyyy-MM-dd") + ":" + shift));
      dispatch(
        getTargetsByRoster(format(startDate, "yyyy-MM-dd") + ":" + shift)
      );
      dispatch(getDispatchs(format(startDate, "yyyy-MM-dd") + ":" + shift));
    }
  }, [startDate, shift]);

  useEffect(() => {
    dispatch(getAllFleet(1, 200));
    dispatch(getAllUsers(1, 200));
    dispatch(getAllBenches(1, 200));
  }, []);

  const onChangeDate: DatePickerProps["onChange"] = (date, dateString) => {
    if (date) {
      setStartDate(date.toDate());
      var params: URLSearchParams = new URLSearchParams({
        shift: shift,
        date: format(date.toDate(), "yyyy-MM-dd"),
      });
      setSearchParams(params);
    }
  };

  const onChangeShift = (shiftInfo) => {
    setShift(shiftInfo);
    var params: URLSearchParams = new URLSearchParams({
      shift: shiftInfo,
      date: format(startDate, "yyyy-MM-dd"),
    });
    setSearchParams(params);
  };

  const excuvatorFilter = useCallback(
    (vehicle) =>
      vehicle?.category === "EXCAVATOR" &&
      (vehicle?.state === "ACTIVE" || vehicle?.state === "STANDBY"),
    []
  );

  const excuvators = useMemo(() => {
    return fleets.filter((fleet) => excuvatorFilter(fleet));
  }, [fleets, excuvatorFilter]);

  const findVehicle = useCallback(
    (id) => {
      return fleets.find((fleet) => fleet.id === id);
    },
    [fleets]
  );

  const assignRosterToOperator = async (roster, operator) => {
    if (!roster?.id) {
      addNewRoster(
        {
          roster: format(startDate, "yyyy-MM-dd") + ":" + shift,
          vehicleId: roster?.vehicle.id,
          vehicle: findVehicle(roster?.vehicle.id),
        },
        operator
      );
    } else {
      addNewRoster(
        { ...roster, vehicle: findVehicle(roster?.vehicleId) },
        operator
      );
    }
  };

  const findDestination = useCallback(
    (blockId) => {
      return benches.find(
        (bench) => bench.blockId === blockId && bench.category === "DESTINATION"
      );
    },
    [benches]
  );

  const findSource = useCallback(
    (id) => {
      return benches.find(
        (bench) => bench.id === id && bench.category === "SOURCE"
      );
    },
    [benches]
  );

  const assignLocationToPlan = async (plan, location) => {
    addNewLocation(
      plan,
      { ...location, source: findSource(location.id) },
      findDestination(location.blockId)?.id
    );
  };

  const assignTruckToPlan = async (plan, truck, oldTruckId) => {
    if (truck.id && oldTruckId && truck.id === oldTruckId) return;
    addNewPlan(plan, truck, oldTruckId);
  };

  const normalizedDispatch = useMemo(() => {
    const planVehicleIds = savedPlans?.map((item) => item.vehicleId) || [];
    const filteredDispaths: any[] = dispatchs?.filter(
      (item) => !planVehicleIds?.includes(item.vehicleId)
    );
    return [...filteredDispaths, ...(savedPlans || [])];
  }, [dispatchs, savedPlans]);

  const normalizedRoster = useMemo(() => {
    const rosterVehicleId = savedRosters?.map((item) => item.vehicleId) || [];
    const filteredRosters: any[] = shiftRosters?.filter(
      (item) => !rosterVehicleId?.includes(item.vehicleId)
    );
    return [...filteredRosters, ...(savedRosters || [])];
  }, [shiftRosters, savedRosters]);

  const excRoster = useMemo(() => {
    return normalizedRoster.filter(({ vehicle }) => excuvatorFilter(vehicle));
  }, [normalizedRoster, excuvatorFilter]);

  const handlePublish = async () => {
    if (!!savedPlans.length) {
      await dispatch(
        addDispatchs(
          savedPlans.map((item) => ({
            id: item?.id || undefined,
            destinationId: item?.destinationId || undefined,
            endTime: item?.endTime || undefined,
            materialId: item?.materialId || undefined,
            planId: item?.planId || undefined,
            roster: item?.roster || undefined,
            sourceId: item?.sourceId || undefined,
            startTime: item?.startTime || undefined,
            supporting: item?.supporting || undefined,
            tonnes: item?.tonnes || undefined,
            vehicleId: item?.vehicleId,
          }))
        )
      );
      clearSavedPlans();
    }

    if (!!savedRosters.length) {
      await dispatch(
        addShiftRosters(
          savedRosters.map((item) => ({
            id: item?.id || undefined,
            operators: item?.operators || undefined,
            roster: item?.roster || undefined,
            vehicleId: item?.vehicleId || undefined,
          }))
        )
      );
      clearSavedRoster();
    }
  };

  if (startDate === null || shift === null) return null;

  return (
    <React.Fragment>
      <div className="page-content">
        <DndProvider backend={HTML5Backend}>
          <Container fluid className="p-0">
            <div className="pre-shift-main d-flex flex-wrap gap-5 mx-0">
              <div className="data-section">
                <RosterFilter
                  shift={shift}
                  onChangeShift={onChangeShift}
                  startDate={dayjs(startDate)}
                  onChangeDate={onChangeDate}
                  handlePublish={handlePublish}
                />
                <List
                  data={shiftInfoData}
                  excuvators={excuvators}
                  excRoster={excRoster}
                  targets={targets}
                  dispatchs={normalizedDispatch}
                  shift={shift}
                  startDate={startDate}
                  shiftRosters={normalizedRoster}
                  assignRosterToOperator={assignRosterToOperator}
                  assignLocationToPlan={assignLocationToPlan}
                  assignTruckToPlan={assignTruckToPlan}
                  revokeTruckFromPlan={revokeTruckFromPlan}
                />
              </div>
              <div className="sidebar-section p-0">
                <SideBar
                  shiftRosters={normalizedRoster}
                  fleets={fleets}
                  users={users}
                  benches={benches}
                  dispatchs={normalizedDispatch}
                />
              </div>
            </div>
          </Container>
        </DndProvider>
      </div>
    </React.Fragment>
  );
};

export default PreShiftInfo;
