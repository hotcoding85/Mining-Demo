import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Container } from "reactstrap";
import SideBar from "./sidebar/SideBar";
import { shiftInfoData } from "./data/sampleData";
import List from "./List";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { useSelector } from "react-redux";
import { createSelector } from "reselect";
import { useDispatch } from "react-redux";
import {
  getAllBenches,
  getAllFleet,
  getAllUsers,
  getDispatchs,
  getShiftRosters,
  getTargetsByRoster,
  getTruckAllocations,
} from "slices/thunk";
import { format } from "date-fns";
import { DatePickerProps } from "antd";
import { useSearchParams } from "react-router-dom";
import dayjs from "dayjs";
import RosterFilter from "./Filter";
import { usePlans } from "Hooks/usePlans";
import { useTruckAllocations } from "Hooks/useTruckAllocations";
import { useRosters } from "Hooks/useRosters";

const PreShiftInfo = () => {
  document.title = "Pre Shift Info | FMS Live";

  const dispatch: any = useDispatch();

  const { shiftRosters, fleets, users, benches, targets } =
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
          };
        }
      )
    );

  const { mergedPlans, addNewPlan, updatePlan, handlepublishPlan } = usePlans();
  const {
    mergedTruckAllocations,
    addNewTruckAllocation,
    updateTruckAllocation,
    removeTruckAllocation,
    handleSubmitTruckAllocation,
  } = useTruckAllocations();

  const [shift, setShift] = useState<any>(null);
  const [startDate, setStartDate] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { savedRosters, addNewRoster, handleSubmitShiftRoster } = useRosters();

  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    const hour = new Date().getHours();
    setShift(hour >= 6 && hour < 18 ? "DS" : "NS");
    if (hour < 6) {
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(today.getDate() - 1);
      setStartDate(yesterday);
    } else {
      setStartDate(new Date());
    }
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
    const result = {
      ...plan,
      source: location,
      sourceId: location.id,
    };
    if (plan) {
      updatePlan(plan.sourceId, result);
    } else {
      addNewPlan(result);
    }
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

  const removeTruck = (newTruck, truckId) => {
    removeTruckAllocation(truckId);
  };

  const assignTruck = (oldTruck, newTruck) => {
    const newAssignTruck = {
      excavatorId: oldTruck.excavatorId,
      roster: oldTruck?.roster,
      truckId: newTruck?.id,
      truck: newTruck,
    };
    if (oldTruck) {
      updateTruckAllocation(oldTruck.truckId, newAssignTruck);
    } else {
      addNewTruckAllocation(newAssignTruck);
    }
  };

  const handlePublish = async () => {
    setIsLoading(true);

    try {
      await Promise.all([
        handleSubmitTruckAllocation(),
        handlepublishPlan(),
        handleSubmitShiftRoster(),
      ]);
    } catch (error) {
      console.error("An error occurred:", error);
    } finally {
      setIsLoading(false);
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
                  isLoading={isLoading}
                />
                <List
                  data={shiftInfoData}
                  excavators={excavators}
                  excRoster={excRoster}
                  targets={targets}
                  dispatchs={mergedPlans}
                  shift={shift}
                  startDate={startDate}
                  shiftRosters={normalizedRoster}
                  assignRosterToOperator={assignRosterToOperator}
                  assignLocationToPlan={assignLocationToPlan}
                  assignTruckToPlan={assignTruck}
                  revokeTruckFromPlan={removeTruck}
                  savedTruckAllocations={mergedTruckAllocations}
                />
              </div>
              <div className="sidebar-section p-0">
                <SideBar
                  shiftRosters={normalizedRoster}
                  fleets={fleets}
                  users={users}
                  benches={benches}
                  dispatchs={mergedPlans}
                  savedTruckAllocations={mergedTruckAllocations}
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
