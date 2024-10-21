import React, { useEffect, useState } from "react";
import { DragEndEvent } from "@dnd-kit/core";
import "./style.scss";
import Breadcrumb from "Components/Common/Breadcrumb";
import { Card, CardBody, Col, Container, Row } from "reactstrap";
import { useDispatch, useSelector } from "react-redux";
import { List, Avatar } from "antd";
import { UserOutlined } from "@ant-design/icons"; // Import the default avatar icon

import {
  getShiftRosters,
  updateShiftRoster,
  getAllFleet,
  getAllUsers,
  addShiftRoster,
  updateVehicle,
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
} from "antd";
import { DeleteOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { useSearchParams } from "react-router-dom";
import { format } from "date-fns";
import { shifts, shiftsInFormat } from "utils/common";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { equipmentStateProps, OperatorStateProps } from "./types";
import { FleetSelector, RosterSelector, UserSelector } from "selectors";
import { Vehicle } from "slices/fleet/reducer";
import { User } from "slices/users/reducer";
// import { equipmentStateProps, OperatorStateProps } from "./types";

const Dispatch = () => {
  document.title = "Dispatch | FMS Live";

  const dispatch: any = useDispatch();

  const { rosters } = useSelector(RosterSelector);
  const { users } = useSelector(UserSelector);
  const { fleet } = useSelector(FleetSelector);
  const [operators, setOperators] = useState<any>([]);
  const [filteredOperators, setFilteredOperators] = useState<User[]>([]);
  const [trucks, setTrucks] = useState<any>([]);
  const [equipmentList, setEquipmentList] = useState<Vehicle[]>(fleet);
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);

  useEffect(() => {
    setEquipmentList(fleet);
  }, [fleet]);

  const [targetOperatorFileds, setTargetOperatorFileds] = useState<any>({
    shiftIndex: 0,
    field: "",
    value: "",
    index: 0,
    operator: {},
  });
  const [targetEquipment, setTargetEquipment] = useState<any>();

  const [startDate, setStartDate] = useState(new Date());
  const [shift, setShift] = useState<any>("DS");
  const [confirmModal, setConfirmModal] = useState<any>({
    isOpen: false,
    info: {},
    title: "",
  });

  const [searchParams, setSearchParams] = useSearchParams();
  const [tooltipIndex, setTooltipIndex] = useState<number | null>(null);
  const [selectedCrew, setSelectedCrew] = useState<any>();
  const [allocatedOperators, setAllocatedOperators] = useState<number>(0);

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
          // padding: "8px",
          // margin: "4px",
          // backgroundColor: disabled ? "#d0d0d0" : "rgb(83, 94, 119)",
          // borderRadius: "24px",
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

  const DropTarget = ({
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

  useEffect(() => {
    dispatch(getAllUsers(1, 100)); // Dispatch action to fetch users data on component mount
    dispatch(getAllFleet(1, 100)); // Dispatch action to fetch fleet data on component mount

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
    dispatch(getShiftRosters(format(startDate, "yyyy-MM-dd") + ":" + shift)); // Dispatch action to fetch data on component mount
  }, [dispatch, shift, startDate]);

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
    // updateUsedOperatorsAndTrucks();
    // }, 2000);

    getAvailableOperators();
  }, [users]);

  useEffect(() => {
    // setTimeout(() => {
    // updateUsedOperatorsAndTrucks();
    // }, 2000);

    let totalAllocatedOpertors = getAllocatedOperators(rosters);
    setAllocatedOperators(totalAllocatedOpertors);
    getAvailableOperators();
  }, [rosters]);

  // useEffect(() => {
  //   console.log("run");
  // }, []);

  const getOperators = (excavatorId: string) => {
    let shiftRoster = rosters?.find(
      (roster) => roster.vehicleId === excavatorId
    );
    return shiftRoster && shiftRoster.operators ? shiftRoster.operators : [];
  };

  const getTrainers = (excavatorId: string) => {
    let shiftRoster = rosters?.find(
      (roster) => roster.vehicleId === excavatorId
    );
    return shiftRoster && shiftRoster.trainers ? shiftRoster.trainers : [];
  };

  const getTrucks = (excavatorId: string) => {
    let shiftRoster = rosters?.find(
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
    // updateUsedOperatorsAndTrucks();
  };

  const updateUsedOperatorsAndTrucks = () => {
    var updatedPersons: Array<any> = [];
    var updatedTrucks: Array<any> = [];

    const rosterOperators = rosters.map((roster) => {
      return roster.operators && roster.operators[0]
        ? roster.operators[0].id
        : undefined;
    });
    const rosterTrainers = rosters.map((roster) => {
      return roster.trainers && roster.trainers[0]
        ? roster.trainers[0].id
        : undefined;
    });
    let rosterTrucks: any = rosters.map((roster) => {
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

  const removeOperator = (id: string) => {
    const deleteData = id.split("::");
    let shiftRoster = _.cloneDeep(
      rosters.find((roster) => roster.vehicleId === deleteData[0])
    );
    const rosterId = shiftRoster?.id;
    delete shiftRoster?._type;
    delete shiftRoster?.createdAt;
    delete shiftRoster?.updatedAt;
    delete shiftRoster?.createdBy;
    delete shiftRoster?.updatedBy;
    delete shiftRoster?.id;
    delete shiftRoster?._id;
    delete shiftRoster?.vehicle;

    if (shiftRoster) shiftRoster["operators"] = [];

    if (rosterId) {
      dispatch(updateShiftRoster(rosterId, shiftRoster));
    }
  };

  // const removeTrainer = (event) => {
  //   const deleteData = event.currentTarget.id.split("::");
  //   let shiftRoster = _.cloneDeep(
  //     rosters.find((roster) => roster.vehicleId === deleteData[0])
  //   );
  //   const rosterId = shiftRoster.id;
  //   delete shiftRoster._type;
  //   delete shiftRoster.createdAt;
  //   delete shiftRoster.updatedAt;
  //   delete shiftRoster.createdBy;
  //   delete shiftRoster.updatedBy;
  //   delete shiftRoster.id;
  //   delete shiftRoster._id;
  //   delete shiftRoster.vehicle;
  //   shiftRoster["trainers"] = [];
  //   dispatch(updateShiftRoster(rosterId, shiftRoster));
  // };

  // const removeTruck = (event) => {
  //   const deleteData = event.currentTarget.id.split("::");
  //   let shiftRoster = _.cloneDeep(
  //     rosters.find((roster) => roster.vehicleId === deleteData[0])
  //   );
  //   let trucks = _.filter(shiftRoster.trucks, (truck) => {
  //     return truck.id != deleteData[1];
  //   });
  //   const rosterId = shiftRoster.id;
  //   delete shiftRoster._type;
  //   delete shiftRoster.createdAt;
  //   delete shiftRoster.updatedAt;
  //   delete shiftRoster.createdBy;
  //   delete shiftRoster.updatedBy;
  //   delete shiftRoster.id;
  //   delete shiftRoster._id;
  //   delete shiftRoster.vehicle;
  //   shiftRoster["trucks"] = trucks;
  //   dispatch(updateShiftRoster(rosterId, shiftRoster));
  // };

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
        rosters.find((roster) => roster.vehicleId === userData[0])
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
    person: any
  ) => {
    if (id === dropId) {
      const updateElementFields = { shiftIndex, field, value, person };
      setTargetOperatorFileds(updateElementFields);

      let equiments = JSON.parse(JSON.stringify(equipmentList));
      setTargetEquipment(equiments[shiftIndex]);

      if (equiments[shiftIndex].state.toLowerCase() !== "down") {
        if (!matchSkill(equiments[shiftIndex]?.model, person)) {
          setIsModalVisible(true);
        } else {
          equiments[shiftIndex].operator = person;

          let active = { id: person.id };
          let over = { id: equiments[shiftIndex].id };
          processDroppedData(active, over);
        }
      }
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
      // const updatedPersons = operators.map((p) =>
      //   p.id === activeId ? { ...p, disabled: true } : p
      // );

      let excavator = fleet.find((key) => key.id === userData[0]);

      if (excavator) {
        // Update the person in shiftRoster
        let shiftRoster = _.cloneDeep(
          rosters.find((roster) => roster.vehicleId === userData[0])
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
          delete shiftRoster.createdBy;
          delete shiftRoster.updatedBy;
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
        // setOperators(updatedPersons);
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
            rosters.find((roster) => roster.vehicleId === userData[0])
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
            delete shiftRoster.createdBy;
            delete shiftRoster.updatedBy;
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
    const equiments = JSON.parse(JSON.stringify(equipmentList));
    const { shiftIndex, field, value, person } = targetOperatorFileds;
    let active = { id: person.id };
    let over = { id: equiments[shiftIndex].id };
    processDroppedData(active, over);
  };

  const updateEquipmentState = (key: number, value: string) => {
    const equiments = JSON.parse(JSON.stringify(equipmentList));
    equiments[key].state = value;
    let vehicle = equiments[key];
    let id = vehicle?.id;

    let updatedvehicle = {
      capacity: vehicle.capacity,
      make: vehicle.make,
      model: vehicle.model,
      name: vehicle.name,
      serial: vehicle.serial,
      state: vehicle.state,
      status: vehicle?.status,
    };
    dispatch(updateVehicle(id, updatedvehicle));
  };

  const getAllocatedOperators = (rosters) => {
    return rosters?.filter(
      (roster) => Array.isArray(roster.operators) && roster.operators.length > 0
    ).length;
  };

  const getAvailableOperators = () => {
    const shiftOperators = rosters
      ?.filter((roster) => roster.operators && roster.operators.length > 0)
      .map((roster) => roster.operators[0]);

    let newOperators = users.filter(
      (user) => !shiftOperators?.some((operator) => operator.id === user.id)
    );
    setFilteredOperators(newOperators);
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

  const handleMouseEnter = (index: number) => setTooltipIndex(index);

  const handleMouseLeave = () => setTooltipIndex(null);

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
              <Card className="d-flex flex-column gap-2 align-items-center rounded-1 p-4 fs-5 mb-0">
                Equipment Available
                <span className="fs-2 text-color">
                  {equipmentList.length || "0"}
                </span>
              </Card>
              <Card className="d-flex flex-column gap-2 align-items-center rounded-1 p-4 fs-5 mb-0">
                Operators Available
                <span className="fs-2 text-color">
                  {filteredOperators.length || "0"}
                </span>
              </Card>
              <Card className="d-flex flex-column gap-2 align-items-center rounded-1 p-4 fs-5 mb-0">
                Equipment Allocated
                <span className="fs-2 text-color">{allocatedOperators}</span>
              </Card>
            </Row>

            <Row>
              <Col lg={10}>
                <Row className="equipment-cards">
                  <Col lg={12}>
                    <Card>
                      <CardBody className="rounded-1">
                        <span style={{ fontSize: "20px" }}>Fleet</span>
                        <Row className="">
                          {equipmentList.map((equipment: any, key: number) => (
                            <Col md="2" className="px-2" key={key}>
                              <div className="my-2 equipment-cards-bg">
                                <DropTarget
                                  dropId="operator"
                                  shiftIndex={key}
                                  field={"operator"}
                                  updateShiftInfo={updateOperator}
                                >
                                  <CardBody>
                                    <div className="d-flex flex-column shift-plan-box gap-2">
                                      {/* {equipment?.operator !== "" ? ( */}
                                      <>
                                        {/* <div className="fw-medium rounded-2 status-active">
                                          {equipment.status}
                                        </div> */}
                                        <div className="d-flex align-items-center gap-1 text-color">
                                          <span className="fs-4">
                                            {equipment.name}
                                          </span>
                                          (
                                          <span
                                            className="fs-6 text-truncate p-0"
                                            onMouseEnter={() =>
                                              handleMouseEnter(key)
                                            }
                                            onMouseLeave={handleMouseLeave}
                                          >
                                            {`${equipment.model}`}
                                            {tooltipIndex == key && (
                                              <div className="position-absolute bg-white text-black px-2 py-1 rounded tooltip-value">
                                                {equipment.model}
                                              </div>
                                            )}
                                          </span>
                                          )
                                        </div>
                                        {/* <Tag></Tag> */}
                                        <div className="select-icon">
                                          <select
                                            className={
                                              equipment.state.toLowerCase() ===
                                              "standby"
                                                ? "select-alert"
                                                : equipment.state.toLowerCase() ===
                                                  "down"
                                                ? "select-danger"
                                                : ""
                                            }
                                            value={equipment.state}
                                            onChange={(event) =>
                                              updateEquipmentState(
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
                                          {getOperators(equipment?.id)
                                            ?.length ? (
                                            <>
                                              <span className="shift-value fill">
                                                {/* {equipment?.operator.lastName} */}
                                                {
                                                  getOperators(equipment?.id)[0]
                                                    ?.lastName
                                                }
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
                                                onClick={() =>
                                                  removeOperator(
                                                    `${equipment.id}::${
                                                      getOperators(
                                                        equipment?.id
                                                      )[0].id
                                                    }`
                                                  )
                                                }
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
                                </DropTarget>
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
                      {" "}
                      <List
                        itemLayout="horizontal"
                        dataSource={filteredOperators}
                        renderItem={(person) => (
                          <DragTarget
                            key={person.id}
                            id={"operator"}
                            style=""
                            disabled={false}
                            name={person.firstName + " " + person.lastName}
                            person={person}
                            onDragStart={() => {}}
                          >
                            <List.Item
                              style={{ borderBottom: "1px solid #e8e8e8" }}
                            >
                              <List.Item.Meta
                                avatar={<Avatar icon={<UserOutlined />} />}
                                title={
                                  <a href="#">
                                    {person.firstName + " " + person.lastName}
                                  </a>
                                }
                                description={
                                  person.skills && person.skills.length > 0
                                    ? `Skills - ${person.skills.join(", ")}`
                                    : ""
                                }
                              />
                            </List.Item>
                          </DragTarget>
                        )}
                      />
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
                  setIsModalVisible(false);
                }}
                onCancel={() => {
                  setIsModalVisible(false);
                }}
                okText="Confirm"
                cancelText="Cancel"
                className="modal-equipment"
              >
                {
                  <p>{`Operator ${targetOperatorFileds?.person?.firstName} ${targetOperatorFileds?.person?.lastName} does not have the skills to operate the equipment ${targetEquipment?.name} (${targetEquipment?.model}). Do you still want to assign the operator to the equipment?`}</p>
                }
              </Modal>
            </Col>
          </Row>
        </DndProvider>
      </div>
    </React.Fragment>
  );
};
export default Dispatch;
