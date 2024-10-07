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
  addShiftRoster,
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
  const [selectedCrew, setSelectedCrew] = useState<string>("");
  const [selectedPlan, setSelectedPlan] = useState<string>("");

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

  const excRoster = useMemo(() => {
    return shiftRosters.filter(({ vehicle }) => excuvatorFilter(vehicle));
  }, [shiftRosters, excuvatorFilter]);

  const assignRosterToOperator = async (roster, operator) => {
    if (!roster?.id) {
      await dispatch(
        addShiftRoster({
          roster: format(startDate, "yyyy-MM-dd") + ":" + shift,
          vehicleId: roster?.vehicle.id,
          operators: [operator],
        })
      );
    } else {
      await dispatch(
        updateShiftRoster(roster.id, {
          operators: [operator],
        })
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

  const assignLocationToPlan = async (plan, location) => {
    if (plan.id) {
      await dispatch(
        updateDispatch(plan.id, {
          sourceId: location.id,
          materialId: location.materialId || undefined,
          destinationId: location.blockId
            ? findDestination(location.blockId)?.id || undefined
            : undefined,
        })
      );
    } else {
      const newPlan = {
        ...plan,
        sourceId: location.id,
        materialId: location.materialId || undefined,
        destinationId: location.materialId
          ? findDestination(location.blockId)?.id || undefined
          : undefined,
        supporting: plan.supporting || [],
      };
      await dispatch(addDispatch(newPlan));
    }
  };

  const assignTruckToPlan = async (plan, truckId, oldTruckId) => {
    if (truckId === oldTruckId) return;
    if (plan.id) {
      let supporting = Array.from(plan.supporting);
      if (!!oldTruckId) {
        const oldIdx = plan?.supporting?.findIndex(
          (support) => support === oldTruckId
        );
        supporting[oldIdx] = truckId;
      } else {
        supporting = [...supporting, truckId];
      }

      await dispatch(
        updateDispatch(plan.id, {
          supporting: uniq(supporting),
        })
      );
    } else {
      const newPlan = {
        ...plan,
        supporting: [truckId],
      };
      await dispatch(addDispatch(newPlan));
    }
  };

  const revokeTruckFromPlan = async (plan, truckId) => {
    if (plan.id) {
      await dispatch(
        updateDispatch(plan.id, {
          supporting: uniq(
            plan.supporting.filter((fleetId) => fleetId !== truckId)
          ),
        })
      );
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
                />
                <List
                  data={shiftInfoData}
                  excuvators={excuvators}
                  excRoster={excRoster}
                  targets={targets}
                  dispatchs={dispatchs}
                  shift={shift}
                  startDate={startDate}
                  shiftRosters={shiftRosters}
                  assignRosterToOperator={assignRosterToOperator}
                  assignLocationToPlan={assignLocationToPlan}
                  assignTruckToPlan={assignTruckToPlan}
                  revokeTruckFromPlan={revokeTruckFromPlan}
                />
              </div>
              <div className="sidebar-section p-0">
                <SideBar
                  shiftRosters={shiftRosters}
                  fleets={fleets}
                  users={users}
                  benches={benches}
                  dispatchs={dispatchs}
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
