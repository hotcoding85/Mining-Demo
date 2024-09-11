import React, { useState } from 'react';
import { Card, CardBody, Col, Row } from 'reactstrap';
import { pc2000, pc1250, hd1500, hd785, wa600, placeHolder } from 'assets/images/equipment';
import { round } from 'lodash';
import './index.scss';
import { Badge, Button, DatePicker, Select, Space } from 'antd';
import { round2Two, roundOff } from 'utils/common';
import dayjs from 'dayjs';
import { useDroppable } from '@dnd-kit/core';
import { useDrop } from 'react-dnd';
import { shiftInfoData } from './data/sampleData';
import { Equipment, Excavator, HelperEquipment, ShiftInfo } from './interfaces/type';


const List = () => {

  const [selectedCrew, setSelectedCrew] = useState<string>('');
  const [selectedPlan, setSelectedPlan] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<Date | string>('');
  const [shiftInfo, setShiftInfo] = useState<ShiftInfo[]>(shiftInfoData);

  const activeBtn = (ele: any) => {
    if (ele.closest("button").classList.contains("active")) {
      ele.closest("button").classList.remove("active");
    } else {
      ele.closest("button").classList.add("active");
    }
  }

  function containsCaseInsensitive(str: string, substr: string): boolean {
    return str.toLowerCase().includes(substr.toLowerCase());
  }

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
  }

  const imageStyle: React.CSSProperties = {
    'width': '56px',
    'maxHeight': '100%',
    'objectFit': 'cover'
  };

  const DropTarget = ({ id, children, style = '' }) => {
    const [{ isOver }, drop] = useDrop(() => ({
      accept: "image",
      drop: (item) => addEquipment(item, id),
      collect: (monitor) => ({
        isOver: !!monitor.isOver(),
      }),
    }));

    return (
      <div
        ref={drop}
        className={style}
      >
        {children}
      </div>
    );
  }

  const addEquipment = (item: any, field: string) => {
    if(item.id == field){
      let arr = [...shiftInfo];
      arr[0].helperEquipment[0].truck.id = 'value'
      setShiftInfo(arr);
    }
  }

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

      {shiftInfo?.map(({ excavator, helperEquipment }: ShiftInfo, key: number) => (
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
                          src={getImage('PC1250')}
                          alt=""
                          style={imageStyle}
                        />
                      </div>
                      <div className="flex-grow-1 card-body__header">
                        <h4 className="fs-3">{excavator?.id}</h4>
                        <h6>Excavator</h6>
                      </div>
                    </div>
                    <div className="d-flex flex-column gap-2 mb-4 w-100">
                      <p className="d-flex gap-3 justify-content-between mb-0">
                        <span className="shift-label">Operator</span>
                        <DropTarget id='excavatorOperator'>
                          <div className="d-flex flex-column gap-2">
                            <span className="shift-value fill">
                              {excavator?.operator || 'unassigned'}
                            </span>
                          </div>
                        </DropTarget>
                      </p>
                      <p className="d-flex gap-3 justify-content-between mb-0">
                        <span className="shift-label">Trainers</span>
                        <div className="d-flex flex-column gap-2">
                          <DropTarget id='excavatorTrainer'>
                            <span className="shift-value fill">
                              {excavator?.trainers?.firstTrainer || 'unassigned'}
                            </span>
                          </DropTarget>
                          <DropTarget id='excavatorTrainer'>
                            <span className="shift-value fill">
                              {excavator?.trainers?.secondTrainer || 'unassigned'}
                            </span>
                          </DropTarget>
                        </div>
                      </p>
                      <p className="d-flex gap-3 justify-content-between mb-0">
                        <span className="shift-label">Location</span>
                        <div className="d-flex flex-column gap-2">
                          <DropTarget id='excavatorLocation'>
                            <span className="shift-value fill">
                              {excavator?.location || 'unassigned'}
                            </span>
                          </DropTarget>
                        </div>
                      </p>
                      <p className="d-flex gap-3 justify-content-between mb-0">
                        <span className="shift-label">
                          ETA Start
                        </span>
                        <DropTarget id='excavatorLocation'>
                          <span className="shift-time">
                            {excavator?.etaStart || '00:00'}
                          </span>
                        </DropTarget>
                      </p>
                      <p className="d-flex gap-3 justify-content-between mb-0">
                        <span className="shift-label">
                          ETA End
                        </span>
                        <DropTarget id='excavatorLocation'>
                          <span className="shift-time">
                            {excavator?.etaEnd || '00:00'}
                          </span>
                        </DropTarget>
                      </p>
                      {/* <p className="d-flex gap-3 justify-content-between mb-0">
                                    <span className="shift-label">Total Loads</span>
                                    <span className="shift-time">23/345</span>
                                </p>
                                <p className="d-flex gap-3 justify-content-between mb-0">
                                    <span className="shift-label">Total Tonnes</span>
                                    <span className="shift-time">1955/29,325</span>
                                </p> */}
                    </div>
                  </CardBody>
                </Card>
              </Col>
              <Col className="col-lg-9 col-md-6">
                <div className="position-relative d-flex flex-wrap justify-content-start align-items-center gap-4 ps-4 w-60 shift-line ">
                  {
                    helperEquipment?.map(({ truck, dozer }: { truck: Equipment, dozer: Equipment }, index: number) => <>
                      {truck?.id !== '' ?
                        <div className="assign-box assign-arrow p-3 pre-shift-data assign-box-shift">
                          <Card className="rounded-3 mb-0 h-100">
                            <CardBody className="p-3">
                              <div className="d-flex align-items-center gap-3 mb-3">
                                <div className="text-center p-0">
                                  <img
                                    src={getImage('HD785-7')}
                                    alt=""
                                    style={imageStyle}
                                  />
                                </div>
                                <div className="flex-grow-1 card-body__header">
                                  <h4 className="fs-3">
                                    {truck?.id}
                                  </h4>
                                  <h6 className='mb-0'>Truck</h6>
                                </div>
                              </div>
                              <div className="d-flex flex-column gap-3 w-100">
                                <p className="d-flex gap-3 justify-content-between mb-0">
                                  <span className="shift-label">Operator</span>
                                  <span
                                    className="shift-time"
                                  >
                                    {truck?.operator || 'Unassign'}
                                  </span>
                                </p>
                                <p className="d-flex gap-3 justify-content-between mb-0">
                                  <span className="shift-label">Allocation</span>
                                  <span
                                    className="shift-time"
                                  >
                                    {excavator?.id}
                                  </span>
                                </p>
                                <p className="d-flex gap-3 justify-content-between mb-0">
                                  <span className="shift-label">Planned Loads</span>
                                  <span
                                    className="shift-time"
                                  >
                                    {truck?.plannedLoads || 'unassigned'}
                                  </span>
                                </p>
                              </div>
                            </CardBody>
                          </Card>
                        </div> :
                        <DropTarget id={'truck'} style={"assign-box assign-box-shift assign-arrow p-3"}>
                          <div>{`+ Assign truck-${index} here`}</div>
                        </DropTarget>
                      }
                      {dozer.id !== '' ?
                        <div className="assign-box assign-arrow p-3 pre-shift-data assign-box-shift">
                          <Card className="rounded-3 mb-0 h-100">
                            <CardBody className="p-3">
                              <div className="d-flex align-items-center gap-3 mb-3">
                                <div className="text-center p-0">
                                  <img
                                    src={getImage('HD785-7')}
                                    alt=""
                                    style={imageStyle}
                                  />
                                </div>
                                <div className="flex-grow-1 card-body__header">
                                  <h4 className="fs-3">
                                    {dozer?.id}
                                  </h4>
                                  <h6 className='mb-0'>Dozer</h6>
                                </div>
                              </div>
                              <div className="d-flex flex-column gap-3 w-100">
                                <p className="d-flex gap-3 justify-content-between mb-0">
                                  <span className="shift-label">Operator</span>
                                  <span
                                    className="shift-time"
                                  >
                                    {dozer?.operator || 'Unassign'}
                                  </span>
                                </p>
                                <p className="d-flex gap-3 justify-content-between mb-0">
                                  <span className="shift-label">Allocation</span>
                                  <span
                                    className="shift-time"
                                  >
                                    {excavator?.id}
                                  </span>
                                </p>
                                <p className="d-flex gap-3 justify-content-between mb-0">
                                  <span className="shift-label">Planned Loads</span>
                                  <span
                                    className="shift-time"
                                  >
                                    {dozer?.plannedLoads || 'unassigned'}
                                  </span>
                                </p>
                              </div>
                            </CardBody>
                          </Card>
                        </div>
                        : <DropTarget id={'dozer'} style={"assign-box assign-box-shift assign-arrow p-3"}>
                          <div>{`+ Assign dozer-${index} here`}</div>
                        </DropTarget>}
                    </>)
                  }
                </div>
              </Col>
            </>
          </Row>
        </>
      ))}
    </React.Fragment>
  );
}

export default List;