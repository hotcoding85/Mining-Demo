import React, { useState } from "react";
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

const List = ({ data }: { data: ShiftInfoData[] }) => {
  const [selectedCrew, setSelectedCrew] = useState<string>("");
  const [selectedPlan, setSelectedPlan] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<Date | string>("");
  const [shiftInfo, setShiftInfo] = useState<ShiftInfoData[]>(data);
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [targetTruckFileds, setTargetTruckFileds] = useState<any>({shiftIndex: 0, field: '', value: '' });
  const [targetExcavatoreFileds, setTargetExcavatoreFileds] = useState<any>({shiftIndex: 0, field: '', value: '', index: 0 });
  const [targetEquipment, setTargetEquipment] = useState<string>('');

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
      drop: ({ id, value }: any) =>
        updateShiftInfo(id, dropId, shiftIndex, index, field, value),
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
    shiftIndex: number,
    index: number,
    field: string,
    value: string
  ) => {
    if (id === dropId) {
      if(shiftInfo[shiftIndex].trucks[index][field] === '' || shiftInfo[shiftIndex].trucks[index][field] === value ){
        setShiftInfo((prevState) => {
          const updatedData = [...prevState];
          updatedData[shiftIndex].trucks[index][field]= value;
          return updatedData;
        });
      }else{
        setTargetEquipment('truck');
        setIsModalVisible(true);
        const  updateElementFields = {shiftIndex, field, value, index};
        setTargetTruckFileds(updateElementFields);
      }
    }
  };

  const updateExcavator = (
    id: string,
    dropId: string,
    shiftIndex: number,
    index: number = 0,
    field: string,
    value: string
  ) => {
    if (id === dropId) {
      if(shiftInfo[shiftIndex].excavator[field] === '' || shiftInfo[shiftIndex].excavator[field] === value ){
        setShiftInfo((prevState) => {
          const updatedData = [...prevState];
          updatedData[shiftIndex].excavator[field] = value;
          return updatedData;
        });
      }else{
        setTargetEquipment('excavator');
        setIsModalVisible(true);
        const  updateElementFields = {shiftIndex, field, value};
        setTargetExcavatoreFileds(updateElementFields);
      }
    }
  };

  const updateTargetExcavator = () => {
    const updatedData = [...shiftInfo];
    const {shiftIndex, field, value} = targetExcavatoreFileds;
    updatedData[shiftIndex].excavator[field] = value;
  }

  const updateTargetTruck = () => {
    const updatedData = [...shiftInfo];
    const {shiftIndex, field, value, index} = targetTruckFileds;
    updatedData[shiftIndex].trucks[index][field] = value;
  }

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

  const getShiftStyle = (key: number) => {
    const trucks = shiftInfo[key].trucks;
    const firstThreeNonEmpty = trucks
      .slice(0, 3)
      .some((truck) => truck.id !== "");
    const lastThreeNonEmpty = trucks.slice(3).some((truck) => truck.id !== "");
    if (firstThreeNonEmpty && lastThreeNonEmpty) {
      return `shift-2`;
    }
    if (firstThreeNonEmpty) {
      return `shift-1`;
    }
    if(lastThreeNonEmpty){
      return `shift-3`;
    }
    return "";
  };

  return (
    <React.Fragment>
      <Row className="schedule-filter pe-2">
        <Col xxl={3} lg={3}>
          <Select
            className="basic-single"
            id="Crew"
            showSearch
            allowClear
            placeholder="Crew"
            style={{ width: "100%", color: "#ffff" }}
            // value={selectedCrew}
            // options={getCrews()}
            // onChange={onCrewChange}
          />
        </Col>
        <Col xxl={3} lg={3}>
          <Select
            className="basic-single"
            id="Plan By"
            showSearch
            allowClear
            placeholder="Plan By"
            style={{ width: "100%", color: "#ffff" }}
            // value={selectedPlan}
            // options={getPlans()}
            // onChange={onPlanChange}
          />
        </Col>
        <Col xxl={3} lg={3}>
          <DatePicker
            allowClear={false}
            style={{ width: "100%" }}
            // value={dayjs(selectedDate)}
            // onChange={onDateChange}
          />
        </Col>
        <Col xxl={3} lg={3}>
          <Button className="schedule-btn w-100">Schedule Shift</Button>
        </Col>
      </Row>
      <div className="data-assign-area">
      {shiftInfo?.map(
        (
          { excavator, trucks }: { excavator: Excavator; trucks: Truck[] },
          key: number
        ) => (
          <>
            <div className="mb-2">
              <h4>Haul Fleet {key + 1}</h4>
            </div>
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
                          <h4 className="fs-3">{excavator.id}</h4>
                          <DropTarget
                            dropId="excavatorOperator"
                            shiftIndex={key}
                            field={"operator"}
                            updateShiftInfo={updateExcavator}
                          >
                            {excavator?.operator !== "" ? (
                              <h6>{excavator?.operator}</h6>
                            ) : (
                              <span className="shift-value empty">
                                Unassigned
                              </span>
                            )}
                          </DropTarget>
                        </div>
                      </div>
                      <div className="d-flex flex-column gap-2 mb-4 w-100">
                        <p className="d-flex gap-3 justify-content-between mb-0">
                          <span className="shift-label">Location</span>
                          <DropTarget
                            dropId="location"
                            shiftIndex={key}
                            field={"location"}
                            updateShiftInfo={updateExcavator}
                          >
                            <div className="d-flex flex-column gap-2">
                              {excavator?.location !== "" ? (
                                <span className="shift-value fill">
                                  {excavator?.location}
                                </span>
                              ) : (
                                <span className="shift-value empty">
                                  Unassigned
                                </span>
                              )}
                            </div>
                          </DropTarget>
                        </p>
                        <p className="d-flex gap-3 justify-content-between mb-0">
                          <span className="shift-label">
                            ETA Start - Finish
                          </span>
                          <span className="shift-time">{`${
                            excavator.etaStart || "07:30"
                          } - ${excavator.etaFinish || `17:30`}`}</span>
                        </p>
                        <p className="d-flex gap-3 justify-content-between mb-0">
                          <span className="shift-label">Total Loads</span>
                          <span className="shift-time">
                            {excavator.totalLoads || "23/345"}
                          </span>
                        </p>
                        <p className="d-flex gap-3 justify-content-between mb-0">
                          <span className="shift-label">Total Tonnes</span>
                          <span className="shift-time">
                            {excavator.totalTonnes || "1955/29,325"}
                          </span>
                        </p>
                      </div>
                    </CardBody>
                  </Card>
                </Col>
                <Col className="col-lg-9 col-md-6">
                  <div
                    className={`position-relative d-flex align-items-center flex-wrap justify-content-start gap-4 ps-4 w-60 h-100 align-content-between shift-line ${getShiftStyle(
                      key
                    )}`}
                  >
                    {trucks?.map((truck: Truck, index: number) => (
                      <>
                        {truck?.id !== "" ? (
                          <div className="assign-box assign-arrow p-3 pre-shift-data">
                            <DropTarget
                              dropId={"truck"}
                              shiftIndex={key}
                              index={index}
                              field={"id"}
                              updateShiftInfo={updateTruck}
                            >
                              <Card className="rounded-3 mb-0 h-100">
                                <CardBody className="p-3">
                                  <div className="d-flex align-start gap-3 mb-3">
                                    <div className="text-center">
                                      <img
                                        src={getImage("HD785-7")}
                                        alt=""
                                        style={imageStyle}
                                      />
                                    </div>
                                    <div className="flex-grow-1 card-body__header">
                                      <h4 className="fs-3">
                                        {truck.id}{" "}
                                        <span style={{ fontSize: "11PX" }}>
                                          {truck?.model || "HD785-7"}
                                        </span>
                                      </h4>
                                      <DropTarget
                                        dropId="truckOperator"
                                        shiftIndex={key}
                                        index={index}
                                        field={"operator"}
                                        updateShiftInfo={updateTruck}
                                      >
                                        {truck?.operator !== "" ? (
                                          <h6>{truck?.operator}</h6>
                                        ) : (
                                          <div className="shift-value empty">
                                            Unassigned
                                          </div>
                                        )}
                                      </DropTarget>
                                    </div>
                                  </div>
                                  <div className="d-flex flex-column gap-3 w-100">
                                    <p className="d-flex gap-3 justify-content-between mb-0">
                                      <span className="shift-label">
                                        Planned Loads
                                      </span>
                                      <span
                                        className="shift-time"
                                        style={{ fontSize: "18px" }}
                                      >
                                        {truck.plannedLoads || "0/35"}
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
                            updateShiftInfo={updateTruck}
                            style={
                              "assign-box assign-box-shift assign-arrow p-3"
                            }
                          >
                            <div>+ Assign truck here</div>
                          </DropTarget>
                        )}
                      </>
                    ))}
                  </div>
                </Col>
              </>
            </Row>
          </>
        )
      )}
      </div>
      <Row>
        <Col>
          <Modal
            centered
            title="Update Shift Information"
            open={isModalVisible}
            onOk={() => {
              if (targetEquipment === "truck") {
                updateTargetTruck();
              } else if (targetEquipment === "excavator") {
                updateTargetExcavator();
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
            <p>{`Do you want to replace ${targetEquipment} ${
              targetEquipment === "excavator"
                ? `${targetExcavatoreFileds.field === 'id'? 'model' : targetExcavatoreFileds.field}`
                : `${targetTruckFileds.field === 'id'? 'model' : targetExcavatoreFileds.field }`
            } with ${
              targetEquipment === "excavator"
                ? targetExcavatoreFileds.value
                : targetTruckFileds.value
            }`}</p>
          </Modal>
        </Col>
      </Row>
    </React.Fragment>
  );
};

export default List;
