import React, { useEffect, useState } from "react";
import { DragEndEvent, useDraggable, useDroppable } from "@dnd-kit/core";
import "./style.css";
import { CSS } from "@dnd-kit/utilities";
import Breadcrumb from "Components/Common/Breadcrumb";
import { Card, CardBody, Col, Container, Row } from "reactstrap";
import { createSelector } from "reselect";
import { useDispatch, useSelector } from "react-redux";
import {
  getShiftRosters,
  updateShiftRoster,
  getAllFleet,
  getAllUsers,
  addShiftRoster,
} from "slices/thunk";
import _ from "lodash";
import {
  Button,
  DatePicker,
  DatePickerProps,
  Modal,
  Segmented,
  Select,
  Space,
  Tag,
} from "antd";
import { DeleteOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { useSearchParams } from "react-router-dom";
import { format } from "date-fns";
import { shifts, shiftsInFormat } from "utils/common";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { equipmentStateProps, OperatorStateProps } from "./types";
// import { equipmentStateProps, OperatorStateProps } from "./types";

function Draggable({ id, name, model, disabled, onDragStart, ...props }) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({ id });

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      style={{
        transform: CSS.Translate.toString(transform),
        padding: "8px",
        margin: "4px",
        backgroundColor: disabled ? "#d0d0d0" : "#F7B31A",
        borderRadius: "4px",
        cursor: disabled ? "not-allowed" : "move",
        opacity: disabled ? 0.5 : 1,
        color: disabled ? "black" : "white",
        fontWeight: "bold",
      }}
      onDragStart={disabled ? (e) => e.preventDefault() : onDragStart}
    >
      {name}{" "}
      {model != "" ? (
        <span
          style={{ fontSize: "8px", marginLeft: "4px", fontStyle: "normal" }}
        >
          ({model})
        </span>
      ) : (
        ""
      )}
      {props.children}
    </div>
  );
}

function DropTarget({ id, children }) {
  const { isOver, setNodeRef } = useDroppable({ id });

  return (
    <div
      ref={setNodeRef}
      style={{
        border: "1px solid #ccc",
        padding: "16px",
        minHeight: "100px",
        alignContent: "center",
        backgroundColor: isOver ? "#e0ffe0" : "#283655",
        marginBottom: "20px",
        borderStyle: "dashed",
      }}
    >
      {children}
    </div>
  );
}

function DragTarget({
  id,
  name,
  disabled,
  onDragStart,
  style,
  children,
  person,
}) {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: "image",
    item: { id: id, value: name, person },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  return (
    <div
      className={style}
      style={{
        padding: "8px",
        margin: "4px",
        backgroundColor: disabled ? "#d0d0d0" : "rgb(83, 94, 119)",
        borderRadius: "24px",
        cursor: disabled ? "not-allowed" : "move",
        opacity: disabled ? 0.5 : 1,
        color: disabled ? "black" : "white",
        fontWeight: "bold",
      }}
      draggable
      ref={drag}
      onDragStart={disabled ? (e) => e.preventDefault() : onDragStart}
    >
      {children}
    </div>
  );
}

const DropTarget2 = ({
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
    drop: ({ id, value, person }: any) => {
      updateShiftInfo(id, dropId, shiftIndex, index, field, value, person);
    },
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

const Dispatch = () => {
  document.title = "Dispatch | FMS Live";

  const dispatch: any = useDispatch();

  const rostersProperties = createSelector(
    (state: any) => state.ShiftRosters,
    (rosters) => ({
      shiftrosters: rosters.data,
    })
  );

  const usersProperties = createSelector(
    (state: any) => state.Users,
    (usersState) => ({
      users: usersState.data,
    })
  );

  const fleetProperties = createSelector(
    (state: any) => state.Fleet,
    (fleetState) => ({
      fleet: fleetState.data,
    })
  );

  const { shiftrosters } = useSelector(rostersProperties);
  const { users } = useSelector(usersProperties);
  const { fleet } = useSelector(fleetProperties);
  const [operators, setOperators] = useState<any>([]);
  const [filteredOperators, setFilteredOperators] = useState<
    OperatorStateProps[]
  >([]);
  const [trucks, setTrucks] = useState<any>([]);
  const [diggers, setDiggers] = useState<any>([]);
  const [usersList, setUsersList] = useState<OperatorStateProps[]>(users);
  const [equipmentList, setEquipmentList] =
    useState<equipmentStateProps[]>(fleet);
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);

  const [targetOperatorFileds, setTargetOperatorFileds] = useState<any>({
    shiftIndex: 0,
    field: "",
    value: "",
    index: 0,
  });
  const [targetEquipment, setTargetEquipment] = useState<string>("");

  const [startDate, setStartDate] = useState(new Date());
  const [shift, setShift] = useState<any>("DS");
  const [confirmModal, setConfirmModal] = useState<any>({
    isOpen: false,
    info: {},
    title: "",
  });

  const [searchParams, setSearchParams] = useSearchParams();

  const [selectedCrew, setSelectedCrew] = useState<any>();

  useEffect(() => {
    dispatch(getAllUsers()); // Dispatch action to fetch users data on component mount
    dispatch(getAllFleet(1, 100)); // Dispatch action to fetch fleet data on component mount

    const queryParams = new URLSearchParams(window.location.search);
    setShift(queryParams.get("shift") ? queryParams.get("shift") : "DS");
    setStartDate(
      queryParams.get("date")
        ? new Date(queryParams.get("date") || new Date())
        : new Date()
    );

    if (!queryParams.get("shift")) {
      var params: URLSearchParams = new URLSearchParams({
        shift: "DS",
        date: format(new Date(), "yyyy-MM-dd"),
      });
      setSearchParams(params);
    }
  }, [dispatch]);

  useEffect(() => {
    dispatch(getShiftRosters(format(startDate, "yyyy-MM-dd") + ":" + shift)); // Dispatch action to fetch data on component mount
  }, [dispatch, shift, startDate]);

  useEffect(() => {
    setDiggers(fleet.filter((vehicle) => vehicle.category === "EXCAVATOR"));
    setTrucks(fleet.filter((vehicle) => vehicle.category === "DUMP_TRUCK"));
    // setTimeout(() => {
    updateUsedOperatorsAndTrucks();
    // }, 2000);
  }, [fleet]);

  useEffect(() => {
    setOperators(
      _.filter(users, (user) => {
        return user.role === "OPERATOR";
      })
    );
    setFilteredOperators(
      _.filter(users, (user) => {
        return user.role === "OPERATOR";
      })
    );
    // setTimeout(() => {
    updateUsedOperatorsAndTrucks();
    // }, 2000);
  }, [users]);

  useEffect(() => {
    // setTimeout(() => {
    updateUsedOperatorsAndTrucks();
    // }, 2000);
  }, [shiftrosters]);

  // useEffect(() => {
  //   handlefilteredOperator();
  //   console.log("run");
  // }, []);

  const getOperators = (excavatorId: string) => {
    let shiftRoster = shiftrosters.find(
      (roster) => roster.vehicleId === excavatorId
    );
    return shiftRoster && shiftRoster.operators ? shiftRoster.operators : [];
  };

  const getTrainers = (excavatorId: string) => {
    let shiftRoster = shiftrosters.find(
      (roster) => roster.vehicleId === excavatorId
    );
    return shiftRoster && shiftRoster.trainers ? shiftRoster.trainers : [];
  };

  const getTrucks = (excavatorId: string) => {
    let shiftRoster = shiftrosters.find(
      (roster) => roster.vehicleId === excavatorId
    );
    return shiftRoster && shiftRoster.trucks ? shiftRoster.trucks : [];
  };

  const onDateChange: DatePickerProps["onChange"] = (date, dateString) => {
    if (date) {
      setStartDate(date.toDate());
      var params: URLSearchParams = new URLSearchParams({
        shift: shift,
        date: format(date.toDate(), "yyyy-MM-dd"),
      });
      setSearchParams(params);
    }
  };

  const onShiftChange = (shiftInfo) => {
    // alert(JSON.stringify(shiftInfo))
    setShift(shiftInfo);
    var params: URLSearchParams = new URLSearchParams({
      shift: shiftInfo,
      date: format(startDate, "yyyy-MM-dd"),
    });
    setSearchParams(params);
  };

  const getCrews = () => {
    let crews = operators.map((op) => {
      return { value: op.crew, label: op.crew };
    });
    crews = _.uniqBy(crews, "value");

    return crews;
  };

  const onCrewChange = (crew) => {
    setSelectedCrew((prevState) => {
      return crew;
    });
    setFilteredOperators(
      _.filter(users, (user) => {
        return user.role === "OPERATOR" && user.crew === crew;
      })
    );
    updateUsedOperatorsAndTrucks();
  };

  const updateUsedOperatorsAndTrucks = () => {
    var updatedPersons: Array<any> = [];
    var updatedTrucks: Array<any> = [];

    const rosterOperators = shiftrosters.map((roster) => {
      return roster.operators && roster.operators[0]
        ? roster.operators[0].id
        : undefined;
    });
    const rosterTrainers = shiftrosters.map((roster) => {
      return roster.trainers && roster.trainers[0]
        ? roster.trainers[0].id
        : undefined;
    });
    let rosterTrucks = shiftrosters.map((roster) => {
      return roster.trucks && roster.trucks[0]
        ? roster.trucks.map((truck) => {
            return truck.id;
          })
        : undefined;
    });

    rosterTrucks = _.compact(_.flattenDeep(rosterTrucks));

    // Disable the person after being dropped
    updatedPersons = operators.map((p) =>
      rosterOperators.includes(p.id) || rosterTrainers.includes(p.id)
        ? { ...p, disabled: true }
        : { ...p, disabled: false }
    );

    // Disable the person after being dropped
    updatedTrucks = trucks.map((p) =>
      rosterTrucks.includes(p.id)
        ? { ...p, disabled: true }
        : { ...p, disabled: false }
    );

    if (updatedPersons && updatedPersons[0] && updatedPersons[0].id) {
      setOperators(updatedPersons);
      setSelectedCrew((prevState) => {
        const crew = prevState;
        if (crew) {
          setFilteredOperators(
            _.filter(updatedPersons, (user) => {
              return user.crew === crew;
            })
          );
        } else {
          setFilteredOperators(updatedPersons);
        }
        return crew;
      });
    }
    if (updatedTrucks && updatedTrucks[0] && updatedTrucks[0].id) {
      setTrucks(updatedTrucks);
    }
  };

  const removeOperator = (event) => {
    const deleteData = event.currentTarget.id.split("::");
    let shiftRoster = _.cloneDeep(
      shiftrosters.find((roster) => roster.vehicleId === deleteData[0])
    );
    const rosterId = shiftRoster.id;
    delete shiftRoster._type;
    delete shiftRoster.createdAt;
    delete shiftRoster.updatedAt;
    delete shiftRoster.id;
    delete shiftRoster._id;
    delete shiftRoster.vehicle;
    shiftRoster["operators"] = [];
    dispatch(updateShiftRoster(rosterId, shiftRoster));
  };

  const removeTrainer = (event) => {
    const deleteData = event.currentTarget.id.split("::");
    let shiftRoster = _.cloneDeep(
      shiftrosters.find((roster) => roster.vehicleId === deleteData[0])
    );
    const rosterId = shiftRoster.id;
    delete shiftRoster._type;
    delete shiftRoster.createdAt;
    delete shiftRoster.updatedAt;
    delete shiftRoster.id;
    delete shiftRoster._id;
    delete shiftRoster.vehicle;
    shiftRoster["trainers"] = [];
    dispatch(updateShiftRoster(rosterId, shiftRoster));
  };

  const removeTruck = (event) => {
    const deleteData = event.currentTarget.id.split("::");
    let shiftRoster = _.cloneDeep(
      shiftrosters.find((roster) => roster.vehicleId === deleteData[0])
    );
    let trucks = _.filter(shiftRoster.trucks, (truck) => {
      return truck.id != deleteData[1];
    });
    const rosterId = shiftRoster.id;
    delete shiftRoster._type;
    delete shiftRoster.createdAt;
    delete shiftRoster.updatedAt;
    delete shiftRoster.id;
    delete shiftRoster._id;
    delete shiftRoster.vehicle;
    shiftRoster["trucks"] = trucks;
    dispatch(updateShiftRoster(rosterId, shiftRoster));
  };
  const handleDragStart = (event: DragEndEvent) => {
    const { active } = event;
    const activeId = active.id as string;

    const person = operators.find((p) => p.id === activeId);
    const truck = trucks.find((p) => p.id === activeId);
    if ((person && person.disabled) || (truck && truck.disabled)) {
    }
  };
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const activeId = active.id as string;
      const overId = over.id as string;

      // Check if the person is already dropped
      const person = operators.find((p) => p.id === activeId);
      const truck = trucks.find((p) => p.id === activeId);

      const userData = overId.split("::");

      let shiftRoster = _.cloneDeep(
        shiftrosters.find((roster) => roster.vehicleId === userData[0])
      );
      if (person && !person.disabled) {
        if (
          shiftRoster &&
          userData &&
          userData[1] &&
          userData[1] === "trainer"
        ) {
          if (shiftRoster.trainers && shiftRoster.trainers[0]) {
            setConfirmModal((prevState) => {
              return {
                ...prevState,
                info: { active, over },
                isOpen: true,
                title:
                  "Trainer is already assigned. Do you want to replace it?",
              };
            });
          } else {
            processDroppedData(active, over);
          }
        } else if (!userData[1] || userData[1] === "operator") {
          if (
            shiftRoster &&
            shiftRoster.operators &&
            shiftRoster.operators[0]
          ) {
            setConfirmModal((prevState) => {
              return {
                ...prevState,
                info: { active, over },
                isOpen: true,
                title:
                  "Operator is already assigned. Do you want to replace it?",
              };
            });
          } else {
            processDroppedData(active, over);
          }
        }
      }

      if (truck && !truck.disabled) {
        processDroppedData(active, over);
      }
    }
  };
  const updateOperator = (
    id: string,
    dropId: string,
    shiftIndex: number,
    index: number = 0,
    field: string,
    value: string,
    person: []
  ) => {
    if (id === dropId) {
      setIsModalVisible(true);
      const updateElementFields = { shiftIndex, field, value, person };
      setTargetOperatorFileds(updateElementFields);
    }
  };

  const handleReplaceDrag = () => {
    const { active, over } = confirmModal.info;
    processDroppedData(active, over);
  };

  const processDroppedData = (active, over) => {
    const activeId = active.id as string;
    const overId = over.id as string;
    const person = operators.find((p) => p.id === activeId);
    const truck = trucks.find((p) => p.id === activeId);
    // Add person to the new excavator
    const userData = overId.split("::");

    if (person && !person.disabled) {
      userData.push("operator");

      let userType;

      if (userData[1] === "operator") {
        userType = "operators";
      } else if (userData[1] === "trainer") {
        userType = "trainers";
      }

      // Disable the person after being dropped
      const updatedPersons = operators.map((p) =>
        p.id === activeId ? { ...p, disabled: true } : p
      );

      let excavator = fleet.find((key) => key.id === userData[0]);

      if (excavator) {
        // Update the person in shiftRoster
        let shiftRoster = _.cloneDeep(
          shiftrosters.find((roster) => roster.vehicleId === userData[0])
        );
        // let updatedShiftRosters;

        if (shiftRoster && shiftRoster.id) {
          // updatedShiftRosters = shiftrosters.map(roster =>
          // roster.vehicleId === userData[0] ? roster[userType] = [person] : roster
          // );
          const rosterId = shiftRoster.id;
          delete shiftRoster._type;
          delete shiftRoster.createdAt;
          delete shiftRoster.updatedAt;
          delete shiftRoster.id;
          delete shiftRoster._id;
          delete shiftRoster.vehicle;
          shiftRoster[userType] = [person];
          dispatch(updateShiftRoster(rosterId, shiftRoster));
        } else {
          var newShiftRoster: any = {};
          newShiftRoster[userType] = [person];
          newShiftRoster.vehicleId = userData[0];
          newShiftRoster.roster = format(startDate, "yyyy-MM-dd") + ":" + shift;
          dispatch(addShiftRoster(newShiftRoster));
        }

        // setS(updatedShiftRosters);
        setOperators(updatedPersons);
      }
    }

    if (truck && !truck.disabled) {
      userData.push("truck");
      if (userData[1] === "truck") {
        // Disable the truck after being dropped
        const updatedTrucks = trucks.map((p) =>
          p.id === activeId ? { ...p, disabled: true } : p
        );

        let excavator = fleet.find((key) => key.id === userData[0]);
        if (excavator) {
          // Update the person in shiftRoster
          let shiftRoster = _.cloneDeep(
            shiftrosters.find((roster) => roster.vehicleId === userData[0])
          );
          // let updatedShiftRosters;

          if (shiftRoster && shiftRoster.id) {
            // updatedShiftRosters = shiftrosters.map(roster =>
            // roster.vehicleId === userData[0] ? roster['trucks'] = [truck] : roster
            // );
            const rosterId = shiftRoster.id;
            delete shiftRoster._type;
            delete shiftRoster.createdAt;
            delete shiftRoster.updatedAt;
            delete shiftRoster.id;
            delete shiftRoster._id;
            delete shiftRoster.vehicle;
            if (!shiftRoster["trucks"]) {
              shiftRoster["trucks"] = [];
            }
            shiftRoster["trucks"].push(truck);
            dispatch(updateShiftRoster(rosterId, shiftRoster));
          } else {
            var newShiftRoster: any = {};
            newShiftRoster["trucks"] = [truck];
            newShiftRoster.vehicleId = userData[0];
            newShiftRoster.roster =
              format(startDate, "yyyy-MM-dd") + ":" + shift;
            dispatch(addShiftRoster(newShiftRoster));
          }

          //setShiftRosters(updatedShiftRosters);
          setTrucks(updatedTrucks);
        }
      }
    }
  };
  const updateTargetOperator = () => {
    const updatedData = JSON.parse(JSON.stringify(equipmentList));
    const { shiftIndex, field, value, person } = targetOperatorFileds;
    updatedData[shiftIndex].operator = person;
    setEquipmentList(updatedData);
  };

  const handlefilteredOperator = () => {
    const data = usersList.filter(
      ({ firstName, lastName }: OperatorStateProps) =>
        !equipmentList.some(
          ({ operator }: any) =>
            firstName + " " + lastName ===
            operator?.firstName + " " + operator?.lastName
        )
    );
    setFilteredOperators([...data]);
  };

  const updateState = (key: number, value: string) => {
    const equiments = JSON.parse(JSON.stringify(equipmentList));
    equiments[key].state = value;
    setEquipmentList(equiments);
  };

  const countOperators = (data) => {
    return data.reduce((count, item) => {
      let fullName = item?.operator?.firstName + " " + item?.operator?.lastName;
      if (item?.operator && fullName?.trim() !== "") {
        return count + 1;
      }
      return count;
    }, 0);
  };

  const handleRemoveOperator = (key: number) => {
    const updatedEquipmentList = JSON.parse(JSON.stringify(equipmentList));
    updatedEquipmentList[key].operator = "";

    setEquipmentList(updatedEquipmentList);
    handlefilteredOperator();
  };

  return (
    <React.Fragment>
      <div className="page-content">
        <DndProvider backend={HTML5Backend}>
          <Container fluid className="dispatch-scroll">
            <Breadcrumb breadcrumbItem="Shift Planner" title="Operations" />
            <Row className="mb-3">
              <Col className="d-flex flex-row-reverse">
                <Space>
                  <Select
                    className="basic-single"
                    id="Crew"
                    showSearch
                    allowClear
                    placeholder="Crew"
                    style={{ width: "100px" }}
                    options={getCrews()}
                    value={selectedCrew}
                    onChange={onCrewChange}
                  />
                  <DatePicker
                    allowClear={false}
                    value={dayjs(startDate)}
                    onChange={onDateChange}
                  />
                  <Segmented
                    className="customSegmentLabel customSegmentBackground"
                    value={shift}
                    onChange={onShiftChange}
                    options={shiftsInFormat(shifts)}
                  />
                </Space>
              </Col>
            </Row>

            <Row className="equipment-status text-black mx-auto pb-4">
              <Col className="d-flex flex-column gap-2 align-items-center bg-white rounded-1 p-3 fs-5">
                Equipment Available
                <span className="fs-2">{equipmentList.length || "0"}</span>
              </Col>
              <Col className="d-flex flex-column gap-2 align-items-center bg-white rounded-1 p-3 fs-5">
                Operators Available
                <span className="fs-2">{filteredOperators.length || "0"}</span>
              </Col>
              <Col className="d-flex flex-column gap-2 align-items-center bg-white rounded-1 p-3 fs-5">
                Equipment Allocated
                <span className="fs-2">{countOperators(equipmentList)}</span>
              </Col>
            </Row>

            <Row>
              <Col lg={10}>
                <Row className="equipment-cards">
                  <Col lg={12}>
                    <Card>
                      <CardBody className="rounded-1">
                        <span style={{ fontSize: "20px" }}>Equipment</span>
                        <Row className="">
                          {equipmentList.map((equipment: any, key: number) => (
                            <Col md="3" className="px-2">
                              <div className="my-2 equipment-cards-bg">
                                <DropTarget2
                                  dropId="operator"
                                  shiftIndex={key}
                                  field={"operator"}
                                  updateShiftInfo={updateOperator}
                                >
                                  <CardBody>
                                    <div className="d-flex flex-column shift-plan-box gap-2">
                                      {/* {equipment?.operator !== "" ? ( */}
                                      <>
                                        <div className="fw-medium rounded-2 status-active">
                                          {equipment.status}
                                        </div>
                                        <Tag>{equipment.name}</Tag>
                                        <div className="select-icon">
                                          <select
                                            className={
                                              equipment.state.toLowerCase() ===
                                              "standby"
                                                ? "select-alert"
                                                : equipment.state.toLowerCase() === "down"? "select-danger" : ""
                                            }
                                            value={equipment.state}
                                            onChange={(event) =>
                                              updateState(
                                                key,
                                                event.target.value
                                              )
                                            }
                                          >
                                            <option value={"STANDBY"}>
                                              STANDBY
                                            </option>
                                            <option value={"DOWN"}>DOWN</option>
                                          </select>
                                        </div>
                                        <span className="d-flex">
                                          {equipment?.operator ? (
                                            <>
                                              <span className="shift-value fill">
                                                {equipment?.operator.firstName +
                                                  " " +
                                                  equipment?.operator.lastName}
                                              </span>
                                              <Button
                                                style={{
                                                  alignContent: "center",
                                                  marginLeft: "8px",
                                                  backgroundColor:
                                                    "transparent",
                                                  borderColor: "transparent",
                                                  color: "#fff",
                                                  padding: 0,
                                                }}
                                                onClick={() => handleRemoveOperator(key)}
                                                shape="circle"
                                                icon={<DeleteOutlined />}
                                              ></Button>
                                            </>
                                          ) : (
                                            <span className="shift-value fill text-white-50">
                                              unassigned
                                            </span>
                                          )}
                                        </span>
                                      </>
                                    </div>
                                  </CardBody>
                                </DropTarget2>
                                {/* <Tag>HDPC1250</Tag> */}
                              </div>
                            </Col>
                          ))}
                        </Row>
                      </CardBody>
                    </Card>
                  </Col>
                </Row>
              </Col>

              <Col xs={2}>
                <Card className="cards-operator">
                  <CardBody>
                    <span style={{ fontSize: "20px" }}>Operator</span>
                    <div className="mt-3">
                      {filteredOperators.map((person, index) => (
                        <DragTarget
                          key={person.id}
                          id={"operator"}
                          style="task-chips py-2 px-3 btn-drag"
                          disabled={false}
                          name={person.firstName + " " + person.lastName}
                          person={person}
                          onDragStart={() => {}}
                        >
                          <>
                            <div style={{ textAlign: "center" }}>
                              {person.firstName + " " + person.lastName}
                            </div>
                            <div>Skill - Truck, dozzer</div>
                          </>
                        </DragTarget>
                      ))}
                    </div>
                  </CardBody>
                </Card>
              </Col>
            </Row>
          </Container>
          <Row>
            <Col>
              <Modal
                centered
                title="Update Equipment Information"
                open={isModalVisible}
                onOk={() => {
                  updateTargetOperator();
                  handlefilteredOperator();
                  setIsModalVisible(false);
                }}
                onCancel={() => {
                  setIsModalVisible(false);
                }}
                okText="Confirm"
                cancelText="Cancel"
                className="modal-lists"
              >
                <p>{`Do you want to replace operator with ${targetOperatorFileds.value}`}</p>
              </Modal>
            </Col>
          </Row>
        </DndProvider>
      </div>
    </React.Fragment>
  );
};
export default Dispatch;
