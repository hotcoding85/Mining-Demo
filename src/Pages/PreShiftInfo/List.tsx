import React, { useCallback, useMemo, useState } from "react";
import { Card, CardBody, Col, Row } from "reactstrap";
import {
  pc2000,
  pc1250,
  hd1500,
  hd785,
  wa600,
  placeHolder,
} from "assets/images/equipment";
import "./index.scss";
import { Button, DatePicker, Modal, Select } from "antd";
import dayjs from "dayjs";
import { useDrop } from "react-dnd";
import { Excavator, ShiftInfoData, Truck } from "./interfaces/type";
import { capitalize } from "lodash";
import { format } from "date-fns";

interface ListProps {
  data: ShiftInfoData[];
  excavators: any[];
  excRoster: any[];
  targets: any[];
  dispatchs: any[];
  shift: string;
  startDate: Date;
  shiftRosters: any[];
  assignRosterToOperator: (roster: any, operator: any) => void;
  assignLocationToPlan: (plan: any, location: any) => void;
  assignTruckToPlan: (plan: any, truckId: string, oldTruckId?: string) => void;
  revokeTruckFromPlan: (plan: any, truckId: string) => void;
  savedTruckAllocations;
}

const List = ({
  data,
  excavators,
  excRoster,
  targets,
  dispatchs,
  shift,
  startDate,
  shiftRosters,
  assignRosterToOperator,
  assignLocationToPlan,
  assignTruckToPlan,
  revokeTruckFromPlan,
  savedTruckAllocations,
}: ListProps) => {
  const [shiftInfo, setShiftInfo] = useState<ShiftInfoData[]>(data);
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);

  const [targetTruckFileds, setTargetTruckFileds] = useState<any>({
    shiftIndex: 0,
    field: "",
    value: "",
  });
  const [targetExcavatoreFileds, setTargetExcavatoreFileds] = useState<any>({
    shiftIndex: 0,
    field: "",
    value: {},
    roster: {},
    index: 0,
  });

  const [selectedData, setSelectedData] = useState<{
    operator?: any;
    roster?: any;
    truckIds?: {
      old: string;
      new: any;
    };
    location?: any;
    planData?: any;
  }>({});

  const [targetEquipment, setTargetEquipment] = useState<string>("");

  const DropTarget = ({
    targetData,
    dropId,
    shiftIndex,
    index = 0,
    field,
    children,
    updateShiftInfo,
    style = "",
  }) => {
    const [{ isOver }, drop] = useDrop(() => ({
      accept: "image",
      drop: ({ id, value }: any) =>
        updateShiftInfo(
          id,
          dropId,
          shiftIndex,
          index,
          field,
          value,
          targetData
        ),
      collect: (monitor) => ({
        isOver: !!monitor.isOver(),
      }),
    }));

    return (
      <div ref={drop} className={style}>
        {children}
      </div>
    );
  };

  const updateTruck = (
    id: string,
    dropId: string,
    shiftIndex: number | string,
    index: number,
    field: string,
    value: any,
    targetData: any
  ) => {
    if (id === dropId) {
      if (targetData?.truckId) {
        setTargetEquipment("truck");
        setSelectedData({
          planData: targetData,
          truckIds: {
            old: targetData.truckId,
            new: value,
          },
        });
        setIsModalVisible(true);
      } else {
        assignTruckToPlan(targetData, value);
      }
    }
  };

  const matchSkill = (model: string, person: any) => {
    if (
      !person?.skills ||
      !Array.isArray(person.skills) ||
      person.skills.length === 0
    ) {
      return false;
    }

    return (
      person?.skills?.includes(model) ||
      person?.skills?.filter((s) => model.startsWith(s)).length > 0
    );
  };

  const updateExcavator = (
    id: string,
    dropId: string,
    shiftIndex: number,
    index: number = 0,
    field: string,
    value: any,
    targetData: any
  ) => {
    if (id === dropId) {
      if (dropId === "operator") {
        if (!matchSkill(targetData?.vehicle?.model, value)) {
          setTargetEquipment("operatorSkillWarning");
          setSelectedData({
            roster: targetData,
            operator: value,
          });
          setIsModalVisible(true);
        } else if (!!targetData?.operators?.length) {
          setTargetEquipment("operatorReplace");
          setSelectedData({
            roster: targetData,
            operator: value,
          });
          setIsModalVisible(true);
        } else {
          assignRosterToOperator(targetData, value);
        }
      } else if (dropId === "location") {
        if (!!targetData?.sourceId) {
          setTargetEquipment("location");
          setSelectedData({
            planData: targetData,
            location: value,
          });
          setIsModalVisible(true);
        } else {
          assignLocationToPlan(targetData, value);
        }
      }
    }
  };

  const updateTargetExcavator = () => {
    const updatedData = [...shiftInfo];
    const { shiftIndex, field, value } = targetExcavatoreFileds;
    updatedData[shiftIndex].excavator[field] = value;
  };

  const updateTargetTruck = () => {
    const updatedData = [...shiftInfo];
    const { shiftIndex, field, value, index } = targetTruckFileds;
    updatedData[shiftIndex].trucks[index][field] = value;
  };

  const containsCaseInsensitive = (str: string, substr: string): boolean => {
    return str.toLowerCase().includes(substr.toLowerCase());
  };

  const getImage = (category: string) => {
    if (!category) {
      return placeHolder;
    }

    if (containsCaseInsensitive(category, "hd785")) {
      return hd785;
    } else if (containsCaseInsensitive(category, "hd1500")) {
      return hd1500;
    } else if (containsCaseInsensitive(category, "pc1250")) {
      return pc1250;
    } else if (containsCaseInsensitive(category, "pc2000")) {
      return pc2000;
    } else if (containsCaseInsensitive(category, "wa600")) {
      return wa600;
    } else {
      return placeHolder;
    }
  };

  const imageStyle: React.CSSProperties = {
    width: "56px",
    maxHeight: "100%",
    objectFit: "cover",
  };

  function getShiftTimes(
    shift: string,
    dateObj: Date
  ): { startTime: number; endTime: number } {
    // Set time zone offset to UTC (optional, depending on your requirements)
    const timeZoneOffset = dateObj.getTimezoneOffset() * 60000; // Convert minutes to milliseconds

    let startTime: Date;
    let endTime: Date;

    if (shift === "DS") {
      startTime = new Date(dateObj.setHours(6, 0, 0, 0)); // 6 AM
      endTime = new Date(dateObj.setHours(18, 0, 0, 0)); // 6 PM
    } else if (shift === "NS") {
      startTime = new Date(dateObj.setHours(18, 0, 0, 0)); // 6 PM
      endTime = new Date(dateObj.setHours(6, 0, 0, 0)); // 6 AM next day
      endTime.setDate(endTime.getDate() + 1); // Move to the next day
    } else {
      throw new Error("Invalid shift type. Please use 'DS' or 'NS'.");
    }

    return {
      startTime: Math.floor(startTime.getTime() / 1000),
      endTime: Math.floor(endTime.getTime() / 1000),
    };
  }

  const getShiftRoster = useCallback(
    (vehicleId) => {
      return shiftRosters.find((roster) => roster.vehicleId === vehicleId);
    },
    [shiftRosters]
  );

  const getTargets = useCallback(
    (vehicleId) => {
      return targets.find((target) => target.vehicleId === vehicleId);
    },
    [targets]
  );

  return (
    <React.Fragment>
      <div className="data-assign-area">
        {excavators?.map((excavator, key: number) => {
          const roster = excRoster.find(
            ({ vehicle }) => vehicle.id === excavator?.id
          );

          const target = targets?.find(
            (target) => target.vehicleId === excavator?.id
          );

          const plan = {
            roster:
              roster?.roster || `${format(startDate, "yyyy-MM-dd")}:${shift}`,
            excavatorId: excavator?.id,
            // ...getShiftTimes(shift, startDate),
          };

          const supportTrucks =
            savedTruckAllocations?.filter((t: any) => {
              return t?.excavatorId === excavator.id && t?.deletedId !== true;
            }) || [];
          supportTrucks.sort((a: any, b: any) =>
            a?.truck.name?.localeCompare(b?.truck.name)
          );

          const plans = dispatchs.filter((l) => {
            return l?.excavatorId === excavator.id;
          });

          return (
            <Row className="row d-flex pre-shift mb-4">
              <>
                <Col
                  className="col-lg-3 col-md-6 position-relative pre-shift-lft"
                  key={key}
                >
                  <Card className="rounded-3 mb-0 h-100">
                    <CardBody className="p-3">
                      <div className="d-flex align-start gap-3 mb-3">
                        <div className="text-center">
                          <img
                            src={getImage("PC1250")}
                            alt="Excavator"
                            style={imageStyle}
                          />
                        </div>
                        <div className="flex-grow-1 card-body__header">
                          <h4
                            className="fs-3"
                            style={{
                              marginBottom: 0,
                            }}
                          >
                            {excavator.name}
                          </h4>
                          <div>
                            {capitalize(excavator.category.replace("_", " "))}
                          </div>
                        </div>
                      </div>
                      <div className="d-flex flex-column gap-2 mb-4 w-100">
                        <p className="d-flex gap-3 justify-content-between mb-0">
                          <span className="shift-label">Operator</span>
                          <DropTarget
                            targetData={
                              roster
                                ? roster
                                : {
                                    vehicle: excavator,
                                  }
                            }
                            shiftIndex={key}
                            dropId="operator"
                            field={"operator"}
                            updateShiftInfo={updateExcavator}
                          >
                            <div className="d-flex flex-column gap-2">
                              {!!roster?.operators?.length ? (
                                <span className="shift-value fill">
                                  {roster?.operators[0]?.firstName}
                                </span>
                              ) : (
                                <span className="shift-value empty">
                                  Unassigned
                                </span>
                              )}
                            </div>
                          </DropTarget>
                        </p>
                        {plans?.map((item: any, index: number) => {
                          return (
                            <p
                              key={`${item.name}-${index}`}
                              className="d-flex gap-3 justify-content-between mb-0"
                            >
                              <span className="shift-label">
                                {index == 0 ? "Location" : ""}
                              </span>
                              <DropTarget
                                targetData={item}
                                dropId="location"
                                shiftIndex={key}
                                field={"location"}
                                updateShiftInfo={updateExcavator}
                              >
                                <div className="d-flex flex-column gap-2">
                                  <span className="shift-value fill">
                                    {item?.source?.name}
                                  </span>
                                </div>
                              </DropTarget>
                            </p>
                          );
                        })}
                        <p className="d-flex gap-3 justify-content-between mb-0">
                          <span className="shift-label">
                            {plans?.length == 0 ? "Location" : ""}
                          </span>
                          <DropTarget
                            targetData={plan}
                            dropId="location"
                            shiftIndex={key}
                            field={"location"}
                            updateShiftInfo={updateExcavator}
                          >
                            <div className="d-flex flex-column gap-2">
                              <span className="shift-value empty">
                                +New location
                              </span>
                            </div>
                          </DropTarget>
                        </p>

                        <p className="d-flex gap-3 justify-content-between mb-0">
                          <span className="shift-label">Total Loads</span>
                          <span className="shift-time">
                            {target?.data?.loads || "-"}
                          </span>
                        </p>
                        <p className="d-flex gap-3 justify-content-between mb-0">
                          <span className="shift-label">Total Tonnes</span>
                          <span className="shift-time">
                            {target?.data?.tonnes || "-"}
                          </span>
                        </p>
                        <p className="d-flex gap-3 justify-content-between mb-0">
                          <span className="shift-label">ETA Start</span>
                          <span className="shift-time">{`${
                            shift === "DS" ? "6:00AM" : "6:00PM"
                          }`}</span>
                        </p>
                        <p className="d-flex gap-3 justify-content-between mb-0">
                          <span className="shift-label">ETA END</span>
                          <span className="shift-time">{`${
                            shift === "DS" ? "6:00PM" : "6:00AM"
                          }`}</span>
                        </p>
                      </div>
                    </CardBody>
                  </Card>
                </Col>
                <Col className="col-lg-9 col-md-6">
                  <div className="position-relative d-flex align-items-center flex-wrap justify-content-start gap-4 ps-4 w-60 h-100 align-content-between shift-line">
                    {(supportTrucks
                      ? [
                          ...supportTrucks,
                          ...new Array(Math.abs(6 - supportTrucks?.length)),
                        ]
                      : [...new Array(6)]
                    )?.map((truckAllocation: any, index: number) => {
                      const truckRoster = getShiftRoster(
                        truckAllocation?.truckId
                      );
                      const truckTarget = getTargets(truckAllocation?.truckId);
                      return (
                        <>
                          {truckAllocation?.excavatorId == excavator?.id ? (
                            <div className="assign-box assign-arrow p-3 pre-shift-data">
                              <DropTarget
                                dropId={"truck"}
                                shiftIndex={truckAllocation?.truckId}
                                index={index}
                                field={"id"}
                                targetData={truckAllocation}
                                updateShiftInfo={updateTruck}
                              >
                                <Card className="rounded-3 mb-0 h-100">
                                  <CardBody className="p-3">
                                    <div className="d-flex justify-content-between align-items-center gap-3 mb-3">
                                      <div className="d-flex align-start gap-3">
                                        <div className="text-center">
                                          <img
                                            src={getImage("HD785-7")}
                                            alt=""
                                            style={imageStyle}
                                          />
                                        </div>
                                        <div className="flex-grow-1 card-body__header">
                                          <h4 className="fs-3">
                                            {truckAllocation?.truck?.name ||
                                              "Unknown"}
                                            <br />
                                            <div style={{ fontSize: "12px" }}>
                                              {truckAllocation?.truck.model ||
                                                "-"}
                                            </div>
                                          </h4>
                                        </div>
                                      </div>
                                      <button
                                        className="truck-cancel-button"
                                        title="Return to Go-Line"
                                        onClick={() => {
                                          revokeTruckFromPlan(
                                            truckAllocation,
                                            truckAllocation.truckId
                                          );
                                        }}
                                      >
                                        <i className="bx bx-trash"></i>
                                      </button>
                                    </div>
                                    <div className="d-flex flex-column gap-2 w-100">
                                      <p className="d-flex gap-3 justify-content-between mb-0">
                                        <span className="shift-label">
                                          Operator
                                        </span>
                                        <span className="shift-time">
                                          <DropTarget
                                            targetData={
                                              truckRoster
                                                ? truckRoster
                                                : {
                                                    vehicle:
                                                      truckAllocation.truck,
                                                  }
                                            }
                                            shiftIndex={key}
                                            dropId="operator"
                                            field={"operator"}
                                            updateShiftInfo={updateExcavator}
                                          >
                                            {!!truckRoster?.operators
                                              ?.length ? (
                                              <span className="shift-time">
                                                {
                                                  truckRoster?.operators?.[0]
                                                    ?.firstName
                                                }
                                              </span>
                                            ) : (
                                              <span className="shift-value empty">
                                                Unassigned
                                              </span>
                                            )}
                                          </DropTarget>
                                        </span>
                                      </p>
                                      <p className="d-flex gap-3 justify-content-between mb-0">
                                        <span className="shift-label">
                                          Allocation
                                        </span>
                                        <span className="shift-time">
                                          {excavator.name}
                                        </span>
                                      </p>
                                      <p className="d-flex gap-3 justify-content-between mb-0">
                                        <span className="shift-label">
                                          Planned Loads
                                        </span>
                                        <span className="shift-time">
                                          {`${
                                            truckTarget?.data?.loads || `-`
                                          }/${target?.data?.loads || `-`}`}
                                        </span>
                                      </p>
                                    </div>
                                  </CardBody>
                                </Card>
                              </DropTarget>
                            </div>
                          ) : (
                            <DropTarget
                              dropId={"truck"}
                              shiftIndex={key}
                              index={index}
                              field={"id"}
                              targetData={plan}
                              updateShiftInfo={updateTruck}
                              style={
                                "assign-box assign-box-shift assign-arrow p-3"
                              }
                            >
                              <div>+ Assign truck here</div>
                            </DropTarget>
                          )}
                        </>
                      );
                    })}
                  </div>
                </Col>
              </>
            </Row>
          );
        })}
      </div>
      <Row>
        <Col>
          <Modal
            centered
            title="Update Shift Information"
            open={isModalVisible}
            onOk={() => {
              if (
                targetEquipment === "operatorSkillWarning" ||
                targetEquipment === "operatorReplace"
              ) {
                assignRosterToOperator(
                  selectedData?.roster,
                  selectedData?.operator
                );
              } else if (targetEquipment === "location") {
                assignLocationToPlan(
                  selectedData.planData,
                  selectedData.location
                );
              } else if (targetEquipment === "truck") {
                assignTruckToPlan(
                  selectedData.planData,
                  selectedData.truckIds?.new
                );
              }
              setIsModalVisible(false);
            }}
            onCancel={() => {
              setIsModalVisible(false);
            }}
            okText="Confirm"
            cancelText="Cancel"
            className="modal-lists"
          >
            {targetEquipment === "operatorSkillWarning" && (
              <p>{`Operator ${selectedData?.operator?.firstName} ${
                selectedData?.operator?.lastName
              } does not have the skills to operate the equipment ${
                selectedData.roster?.vehicle?.name
              } (${
                selectedData.roster?.vehicle?.model
              }). Do you still want to ${
                selectedData.roster?.operators?.length > 0
                  ? `replace the operator with ${selectedData?.operator?.firstName} ${selectedData?.operator?.lastName}?`
                  : "assign the operator to the equipment?"
              } `}</p>
            )}

            {targetEquipment === "operatorReplace" && (
              <p>{`Do you still want to replace the operator with ${selectedData?.operator?.firstName} ${selectedData?.operator?.lastName}?`}</p>
            )}

            {targetEquipment === "location" && (
              <p>{`Do you still want to replace the location with ${selectedData?.location?.name}?`}</p>
            )}

            {targetEquipment === "truck" && (
              <p>{`Do you still want to replace the truck with ${selectedData?.truckIds?.new?.name}?`}</p>
            )}
          </Modal>
        </Col>
      </Row>
    </React.Fragment>
  );
};

export default List;
