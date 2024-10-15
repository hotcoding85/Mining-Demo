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
  getTruckAllocations,
  removeTruckAllocation,
  addTruckAllocations,
} from "slices/thunk";
import { format } from "date-fns";
import { DatePicker, DatePickerProps, Segmented } from "antd";
import { useSearchParams } from "react-router-dom";
import dayjs from "dayjs";
import RosterFilter from "./Filter";
import { usePlans } from "Hooks/usePlans";
import { useTruckAllocations } from "Hooks/useTruckAllocations";
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
  const { savedPlans, addNewLocation, clearSavedPlans } = usePlans(dispatchs);

  const [isLoading, setIsLoading] = useState<boolean>(false);

  const { savedTruckAllocations, assignTruckToPlan, revokeTruckFromPlan } =
    useTruckAllocations();
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
      dispatch(
        getTruckAllocations(format(startDate, "yyyy-MM-dd") + ":" + shift)
      );
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

  // Excavator
  const excavatorFilter = useCallback(
    (vehicle) =>
      vehicle?.category === "EXCAVATOR" &&
      (vehicle?.state === "ACTIVE" || vehicle?.state === "STANDBY"),
    []
  );

  const excavators = useMemo(() => {
    return fleets.filter((fleet) => excavatorFilter(fleet));
  }, [fleets, excavatorFilter]);
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

  const assignLocationToPlan = async (plan, location) => {
    addNewLocation(plan, location);
  };

  const normalizedRoster = useMemo(() => {
    const rosterVehicleIds = savedRosters?.map((item) => item.vehicleId) || [];
    const filteredRosters: any[] = shiftRosters?.filter(
      (item) => !rosterVehicleIds?.includes(item.vehicleId)
    );
    return [...filteredRosters, ...(savedRosters || [])];
  }, [shiftRosters, savedRosters]);

  const excRoster = useMemo(() => {
    return normalizedRoster.filter(({ vehicle }) => excavatorFilter(vehicle));
  }, [normalizedRoster, excavatorFilter]);

  const handlePublish = async () => {
    setIsLoading(true);
    
    if (!!savedPlans.length) {
      await dispatch(
        addDispatchs(
          savedPlans.map((item) => ({
            id: item?.id || undefined,
            excavatorId: item?.excavatorId || undefined,
            endTime: item?.endTime || undefined,
            roster: item?.roster || undefined,
            sourceId: item?.sourceId || undefined,
            startTime: item?.startTime || undefined,
            status: 'PLANNED'
          }))
        )
      );
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

    if (!!savedTruckAllocations.length) {
      const result = savedTruckAllocations.filter(
        (item) => item.deletedId !== undefined && !item.deletedId
      );
      if (!!result.length) {
        await dispatch(
          addTruckAllocations(
            result.map((item) => ({
              id: item?.id || undefined,
              roster: item?.roster || undefined,
              excavatorId: item?.excavatorId || undefined,
              truckId: item?.truckId || undefined,
              destinationId: item?.destinationId || undefined,
            }))
          )
        );
      }
    }

    if (!!savedTruckAllocations.length) {
      const deletedIds = savedTruckAllocations.filter(
        (item) => item.deletedId && item?.id
      );
      if (!!deletedIds.length) {
        await dispatch(
          removeTruckAllocation(deletedIds.map((item) => item?.id))
        );
      }
    }

    setIsLoading(false);
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
                  isLoading={isLoading}
                />
                <List
                  data={shiftInfoData}
                  excavators={excavators}
                  excRoster={excRoster}
                  targets={targets}
                  dispatchs={savedPlans}
                  shift={shift}
                  startDate={startDate}
                  shiftRosters={normalizedRoster}
                  assignRosterToOperator={assignRosterToOperator}
                  assignLocationToPlan={assignLocationToPlan}
                  assignTruckToPlan={assignTruckToPlan}
                  revokeTruckFromPlan={revokeTruckFromPlan}
                  savedTruckAllocations={savedTruckAllocations}
                />
              </div>
              <div className="sidebar-section p-0">
                <SideBar
                  shiftRosters={normalizedRoster}
                  fleets={fleets}
                  users={users}
                  benches={benches}
                  dispatchs={savedPlans}
                  savedTruckAllocations={savedTruckAllocations}
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
