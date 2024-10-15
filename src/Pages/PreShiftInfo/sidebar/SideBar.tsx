import React, { useCallback, useMemo } from "react";
import { useDrag } from "react-dnd";
import "../styles/SideBar.css";
import { SideMenu } from "../interfaces/type";
import ExcavatorIcon from "assets/icons/ExcavatorsIcon.svg";
import TruckIcons from "assets/icons/TrucksIcon.svg";
import { Col, Row } from "reactstrap";

interface Equipments {
  shiftRosters: any[];
  fleets: any[];
  users: any[];
  benches: any[];
  dispatchs: any[];
  savedTruckAllocations: any[];
}

const SideBar: React.FC<Equipments> = ({
  shiftRosters,
  fleets,
  users,
  benches,
  dispatchs,
  savedTruckAllocations,
}) => {
  function DragTarget({ id, value, disabled, onDragStart, style, children }) {
    const [{ isDragging }, drag] = useDrag(() => ({
      type: "image",
      item: { id: id, value: value },
      collect: (monitor) => ({
        isDragging: !!monitor.isDragging(),
      }),
    }));

    return (
      <div
        className={style}
        draggable
        ref={drag}
        onDragStart={disabled ? (e) => e.preventDefault() : onDragStart}
      >
        {children}
      </div>
    );
  }

  const dumpTruckFilter = useCallback(
    (vehicle) =>
      vehicle?.category === "DUMP_TRUCK" &&
      (vehicle?.state === "STANDBY" || vehicle?.state === "ACTIVE"),
    []
  );

  const mergedSupportingTrucks = useMemo(
    () => dispatchs.flatMap((dispatch) => dispatch.supporting),
    [dispatchs]
  );

  const rosterReadyForDispatch = useMemo(() => {
    const result = shiftRosters.filter(
      ({ vehicle, operators }) =>
        dumpTruckFilter(vehicle) &&
        operators?.length > 0 &&
        !mergedSupportingTrucks.includes(vehicle.id)
    );
    const filteredArray = savedTruckAllocations.filter(
      (item) => !item?.deletedId || item?.deletedId === undefined
    );
    const assignedRoster = filteredArray.map((roster) => roster?.truckId);
    return result.filter((item) => !assignedRoster.includes(item?.vehicleId));
  }, [
    shiftRosters,
    dumpTruckFilter,
    dispatchs,
    mergedSupportingTrucks,
    savedTruckAllocations,
  ]);

  const fleetsStandByNoOperator = useMemo(() => {
    const assignedVehicles = rosterReadyForDispatch.map(
      (item) => item?.vehicle.id
    );

    const assignfleets = fleets.filter(
      (fleet) =>
        !assignedVehicles.includes(fleet.id) &&
        !mergedSupportingTrucks.includes(fleet.id) &&
        dumpTruckFilter(fleet)
    );

    const filteredArray = savedTruckAllocations.filter(
      (item) => item?.deletedId !== true || item?.deletedId === undefined
    );
    const savedTruckIds = filteredArray.map(
      (allocation) => allocation?.truckId
    );

    return assignfleets.filter((item) => !savedTruckIds.includes(item?.id));
  }, [
    fleets,
    rosterReadyForDispatch,
    dumpTruckFilter,
    mergedSupportingTrucks,
    savedTruckAllocations,
  ]);

  const fleetsDownForRepair = useMemo(() => {
    return fleets.filter(
      (vehicle) => vehicle.state === "DOWN" && vehicle.category === "DUMP_TRUCK"
    );
  }, [fleets]);

  const operators = useMemo(() => {
    const assignedOperators: any[] = [];
    shiftRosters.forEach((item) =>
      item?.operators?.forEach((operator: any) =>
        assignedOperators.push(operator.id)
      )
    );
    return users.filter((user) => !assignedOperators.includes(user.id));
  }, [users, shiftRosters]);

  const locations = useMemo(() => {
    const assignedSourceIds = dispatchs.map((item) => item?.sourceId);

    return benches.filter(
      (bench) =>
        bench.status === "ACTIVE" && !assignedSourceIds.includes(bench.id)
    );
  }, [benches, dispatchs]);

  return (
    <div className="preshift-list d-flex flex-column p-0 side-scroll">
      <div className="task-wrapper d-flex flex-column gap-3 py-4 px-3">
        <span className="task-list-title text-start">
          Ready for dispatch on Go-Line
        </span>
        {/* <div className="sub-title">Trucks</div> */}
        {rosterReadyForDispatch.length > 0 ? (
          <Row className="g-3">
            {rosterReadyForDispatch.map((roster, index) => (
              <Col xl={4}>
                <DragTarget
                  key={index}
                  id={"truck"}
                  style={
                    roster !== "" ? "btn show-btn" : "btn show-btn empty-btn"
                  }
                  disabled={roster !== "" ? false : true}
                  value={roster?.vehicle}
                  onDragStart={() => {}}
                >
                  <div className="truck">
                    <div className="truck-label">{roster?.vehicle.name}</div>
                    <div className="truck-operator-label">
                      {<i className="bx bx-user" />}
                      {roster?.operators[0]?.firstName}
                    </div>
                  </div>
                </DragTarget>
              </Col>
            ))}
          </Row>
        ) : (
          <div className="text-center">No trucks ready to go</div>
        )}
      </div>
      <div className="task-wrapper d-flex flex-column gap-3 py-4 px-3">
        <span className="task-list-title text-start">
          Standby No Operator Assigned
        </span>
        {/* <div className="sub-title">Trucks</div> */}
        {fleetsStandByNoOperator.length > 0 ? (
          <Row className="g-3">
            {fleetsStandByNoOperator.map((truck, index) => (
              <Col xl={4}>
                <DragTarget
                  key={index}
                  id={"truck"}
                  style={
                    truck !== ""
                      ? "btn show-btn show-alert"
                      : "btn show-btn empty-btn"
                  }
                  disabled={truck !== "" ? false : true}
                  value={truck}
                  onDragStart={() => {}}
                >
                  {truck.name}
                </DragTarget>
              </Col>
            ))}
          </Row>
        ) : (
          <div className="text-center">No standby trucks</div>
        )}
      </div>
      <div className="task-wrapper d-flex flex-column gap-3 py-4 px-3">
        <span className="task-list-title text-start">Down for Repair</span>
        {/* <div className="sub-title">Trucks</div> */}
        {fleetsDownForRepair.length > 0 ? (
          <Row className="g-3">
            {fleetsDownForRepair.map((truck, index) => (
              <Col xl={4}>
                <DragTarget
                  key={index}
                  id={"truck"}
                  style={
                    truck !== ""
                      ? "btn show-btn show-danger"
                      : "btn show-btn empty-btn"
                  }
                  disabled={truck !== "" ? false : true}
                  value={truck}
                  onDragStart={() => {}}
                >
                  {truck.name}
                </DragTarget>
              </Col>
            ))}
          </Row>
        ) : (
          <div className="text-center">No down trucks</div>
        )}
      </div>
      <div className="task-wrapper d-flex flex-column gap-3 py-4 px-3">
        <span className="task-list-title text-start">Operators</span>
        {/* <div className="sub-title">Excavators</div> */}
        <div className="equip-lists d-grid equip-list-grid">
          {operators.map((operator, index) => (
            <DragTarget
              key={index}
              id={"operator"}
              style="task-chips py-2 px-3 btn-drag"
              disabled={operator?.firstName !== "" ? false : true}
              value={operator}
              onDragStart={() => {}}
            >
              {/* <img src={ExcavatorIcon} className="icons" /> */}
              {operator?.firstName}
            </DragTarget>
          ))}
        </div>

        {/* <div className="sub-title">Trucks</div>
        <div className="equip-lists d-grid equip-list-grid">
          {sideMenu[0].truckOperators.map((truck, index) => (
            <DragTarget
              key={index}
              id={"truckOperator"}
              style="task-chips py-2 px-3 btn-drag"
              disabled={truck !== "" ? false : true}
              name={truck}
              onDragStart={() => {}}
            >
              {
                <>
                  <img src={TruckIcons} className="icons" />
                  {truck}
                </>
              }
            </DragTarget>
          ))}
        </div> */}
      </div>
      <div className="task-wrapper d-flex flex-column gap-3 py-4 px-3">
        <span className="task-list-title text-start">Locations</span>
        <div className="equip-lists">
          <Row className="gy-3 gx-1 align-items-center">
            {locations.map((location, index) => (
              <Col sm={6}>
                <DragTarget
                  key={index}
                  id={"location"}
                  style="task-chips py-2 px-3 btn-drag"
                  disabled={location !== "" ? false : true}
                  value={location}
                  onDragStart={() => {}}
                >
                  {location.name}
                </DragTarget>
              </Col>
            ))}
          </Row>
        </div>
        {/* <div className="task-wrapper d-flex flex-column gap-3 py-4 px-3">
        <span className="task-list-title text-start">Trainers</span>
        <div className="equip-lists d-grid equip-list-grid">
          {sideMenu[0].trainers.map((equipment, index) => (
            <DragTarget
              key={index}
              id={'trainer'}
              style='task-chips py-2 px-3 btn-drag'
              disabled={equipment !== ""? false : true}
              name={equipment}
              onDragStart={() => {}}
              >
                {equipment}
              </DragTarget>
          ))}
        </div>
      </div> */}
        {/* 
        <div className="sub-title">Dozers</div>
        <div className="d-flex align-items-center equip-wrapper  justify-content-between ">
          {sideMenu[0].repairDozers.map((dozer, index) => (
            <DragTarget
              key={index}
              id={"dozer"}
              style={
                dozer !== ""
                  ? "btn show-btn show-danger"
                  : "btn show-btn empty-btn"
              }
              disabled={dozer !== "" ? false : true}
              name={dozer}
              onDragStart={() => {}}
            >
              {dozer}
            </DragTarget>
          ))}
        </div>
        <div className="sub-title">Drillers</div>
        <div className="d-flex align-items-center equip-wrapper  justify-content-between ">
          {sideMenu[0].repairDrillers.map((driller, index) => (
            <DragTarget
              key={index}
              id={"driller"}
              style={
                driller !== ""
                  ? "btn show-btn show-danger"
                  : "btn show-btn empty-btn"
              }
              disabled={driller !== "" ? false : true}
              name={driller}
              onDragStart={() => {}}
            >
              {driller}
            </DragTarget>
          ))}
        </div> */}
      </div>
    </div>
  );
};

export default SideBar;
