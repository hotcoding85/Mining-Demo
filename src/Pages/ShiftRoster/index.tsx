import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Button, Card, CardBody, Col, Container, Form, FormFeedback, Input, Label, Modal, ModalBody, ModalHeader, Row } from 'reactstrap';
import Breadcrumb from 'Components/Common/Breadcrumb';
import TableContainer, { TableColumn } from '../../Components/Common/TableContainer';
import { AppState } from 'store';
import { getShiftRosters, updateShiftRoster, getAllFleet, getAllUsers, addShiftRoster } from 'slices/thunk';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useSearchParams, createSearchParams } from 'react-router-dom';
import Select from 'react-select';
import { format } from 'date-fns';
import type { DatePickerProps, RadioChangeEvent } from 'antd';
import { DatePicker, Space, Radio, Switch, Segmented } from 'antd';
import dayjs from "dayjs";

import { pick } from 'lodash';
import { createSelector } from 'reselect';
import _ from 'lodash';
import { shiftTimings, shifts } from 'utils/common';

const ShiftRoster = (props: any) => {
  document.title = "Shift Roster | FMS Live";

  const dispatch: any = useDispatch();

  const rostersProperties = createSelector(
    (state: any) => state.ShiftRosters,
    (rosters) => ({
      shiftrosters: rosters.data
    })
  );

  const usersProperties = createSelector(
    (state: any) => state.Users,
    (usersState) => ({
      users: usersState.data
    })
  );

  const fleetProperties = createSelector(
    (state: any) => state.Fleet,
    (fleetState) => ({
      fleet: fleetState.data
    })
  );

  const { shiftrosters } = useSelector(rostersProperties);
  const { users } = useSelector(usersProperties);
  const { fleet } = useSelector(fleetProperties);

  const [diggers, setDiggers] = useState<any>();
  const [trucks, setTrucks] = useState<any>();

  const [startDate, setStartDate] = useState(new Date());
  const [shift, setShift] = useState<any>('DS');

  const [searchParams, setSearchParams] = useSearchParams();

  const crews: any = [
    { value: 'crewa', label: 'Crew A' },
    { value: 'crewb', label: 'Crew B' },
    { value: 'crewc', label: 'Crew C' }
  ];

  var operators: any = {};
  let filteredOperators = _.filter(users, (user) => { return user.role === 'OPERATOR' })
  operators = filteredOperators.map(option => {
    return { value: option.id, "label": option?.['firstName'] + ' ' + option?.['lastName'] }
  });

  var trainers: any = {};
  let filteredTrainers = _.filter(users, (user) => { return user.role === 'OPERATOR' })
  trainers = filteredTrainers.map(option => {
    return { value: option.id, "label": option?.['firstName'] + ' ' + option?.['lastName'] }
  });

  useEffect(() => {
    dispatch(getShiftRosters(format(startDate, 'yyyy-MM-dd') + ':' + shift)); // Dispatch action to fetch data on component mount

  }, [dispatch, shift, startDate]);

  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search)
    setShift(queryParams.get("shift") ? queryParams.get("shift") : 'DS');
    setStartDate(queryParams.get("date") ? new Date(queryParams.get("date") || new Date()) : new Date());

    if (!queryParams.get("shift")) {
      var params: URLSearchParams = new URLSearchParams({ shift: 'DS', date: format(new Date(), 'yyyy-MM-dd') });
      setSearchParams(params);
    }

    dispatch(getAllUsers(1, 100)); // Dispatch action to fetch users data on component mount
  }, [dispatch]);

  useEffect(() => {
    setDiggers(fleet.filter(vehicle => vehicle.category === "EXCAVATOR"))
    setTrucks(fleet.filter(vehicle => vehicle.category === "DUMP_TRUCK"))
  }, [fleet]);

  useEffect(() => {
    dispatch(getAllFleet()); // Dispatch action to fetch fleet data on component mount
  }, [dispatch]);


  const onDateChange: DatePickerProps['onChange'] = (date, dateString) => {
    if (date) {
      setStartDate(date.toDate());
      var params: URLSearchParams = new URLSearchParams({ shift: shift, date: format(date.toDate(), 'yyyy-MM-dd') });
      setSearchParams(params);
    }
  };

  const onShiftChange = (shiftInfo) => {
    // alert(JSON.stringify(shiftInfo))
    setShift(shiftInfo);
    var params: URLSearchParams = new URLSearchParams({ shift: shiftInfo, date: format(startDate, 'yyyy-MM-dd') });
    setSearchParams(params);
  }

  const onOperatorChange = (operator, vehicle) => {
    onChange(operator, vehicle, operator);
  }

  const onTrainerChange = (trainer, vehicle) => {
    onChange(undefined, vehicle, trainer);
  }

  const onChange = (operator, vehicle, trainer) => {
    const rosterInfo: any = shiftrosters.filter(roster => {
      if (roster['vehicle'] && roster['vehicle'].id) {
        return roster['vehicle'].id === vehicle.id;
      }
    });

    const operatorInfo: any = users.filter(op => {
      if (operator && operator.value) {
        return op.id === operator.value;
      }
    });

    const trainerInfo: any = users.filter(op => {
      if (trainer && trainer.value) {
        return op.id === trainer.value;
      }
    });

    var roster: any = {};
    if (rosterInfo && rosterInfo.length > 0) {
      // roster = Object.assign({}, rosterInfo[0]);
    }

    roster.vehicle = vehicle;
    if (operatorInfo && operatorInfo.length > 0) {
      roster.operators = [pick(operatorInfo[0], ['id', 'role', 'firstName', 'lastName', 'username'])];
    } else {
      roster.operators = [];
    }

    if (trainerInfo && trainerInfo.length > 0) {
      roster.trainers = [pick(trainerInfo[0], ['id', 'role', 'firstName', 'lastName', 'username'])];
    } else {
      roster.trainers = [];
    }
    roster.roster = format(startDate, 'yyyy-MM-dd') + ':' + shift

    if (roster.id) {
      const rosterId = roster.id;
      delete roster._type;
      delete roster.createdAt;
      delete roster.updatedAt;
      delete roster.createdBy;
      delete roster.updatedBy;
      delete roster.id;
      delete roster._id;
      roster.vehicleId = _.cloneDeep(roster.vehicle.id);
      delete roster.vehicle;
      dispatch(updateShiftRoster(rosterId, roster));
    } else {
      roster.vehicleId = _.cloneDeep(roster.vehicle.id);
      delete roster.vehicle;
      dispatch(addShiftRoster(roster));
    }
  }

  const getRosterByEquipmentId = (vehicleId) => {
    const roster: any = shiftrosters.filter((roster) => {
      if (roster['vehicle'] && roster['vehicle'].id) {
        return roster['vehicle'].id === vehicleId;
      }
    });
    // if (roster && roster[0] && roster[0]?.operators[0] && roster[0]?.operators[0]?.id) {
      // return { value: roster[0]?.operators[0]?.id, label: roster[0]?.operators[0]?.firstName + ' ' + roster[0]?.operators[0]?.lastName }
    // }
    return "";
  }

  const getOperatorsWithoutRoster = (vehicleId) => {
    const rosters: any = shiftrosters.filter((roster) => {
      if (roster['vehicle'] && roster['vehicle'].id) {
        return roster['vehicle'].id !== vehicleId;
      }
    });
    // let usedOperators = rosters.map((roster) => { return (roster && roster.operators && roster.operators.length > 0 && roster.operators[0].id) ? roster.operators[0].id : undefined });

    // let filterOperators = _.filter(operators, (op) => { return !(usedOperators.indexOf(op.value) > -1) });

    // return filterOperators;
    return []
  }


  const shiftBeforeCurrentDate = () => {
    const { shift, shiftDate } = shiftTimings()

    //TODO: Need to support at previous shifts level
    if (dayjs(startDate).isBefore(shiftDate)) {
      return true;
    }
    return false;
  }

  console.log('shiftrosters>>>', shiftrosters);

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid>
          <Breadcrumb breadcrumbItem="Shift Roster" title="Operations" />
          <Row className='mb-3'>
            <Col className='d-flex flex-row-reverse'>
              <Space>
                <DatePicker allowClear={false} value={dayjs(startDate)} onChange={onDateChange} />
                <Segmented className="customSegmentLabel customSegmentBackground" value={shift} onChange={onShiftChange} options={[{ value: 'DS', label: 'DS' }, { value: 'NS', label: 'NS' }]} />
              </Space >
            </Col >
          </Row >
          <Row>
            <Col lg="12">
              <Form
                onSubmit={e => {
                  e.preventDefault();
                  return false;
                }}
              >
                <Row>
                  <Col id={"excavators"} xs={6}>
                    <Card>
                      <CardBody>
                        <div className="mb-3">
                          <Label style={{ fontSize: '20px' }}>EXCAVATORS</Label>
                          <Label></Label>
                          {diggers && diggers.map((vehicle, index) => (
                            <Row>
                              <Col key={"excavators_name"} xs={5}>
                                <Label style={{ fontSize: '15px', textAlign: 'match-parent' }}>{vehicle.name}</Label>
                              </Col>
                              <Col xs={5}>
                                <Select
                                  className="basic-single"
                                  classNamePrefix="select"
                                  defaultValue={getRosterByEquipmentId(vehicle.id)}
                                  value={getRosterByEquipmentId(vehicle.id)}
                                  isDisabled={shiftBeforeCurrentDate()}
                                  isLoading={false}
                                  isClearable={true}
                                  isRtl={false}
                                  isSearchable={true}
                                  name="Operators"
                                  options={getOperatorsWithoutRoster(vehicle.id)}
                                  onChange={(selectedOption) => onOperatorChange(selectedOption, vehicle)}
                                />
                              </Col>
                              <Label></Label>
                              <Col key={"excavators_empty"} xs={2}>
                                <Label></Label>
                              </Col>
                            </Row>
                          ))}
                        </div>
                      </CardBody>
                    </Card>
                  </Col>
                  <Col xs={6} key={"trucks"}>
                    <Card>
                      <CardBody>
                        <div className="mb-3">
                          <Label style={{ fontSize: '20px' }}>DUMP TRUCKS</Label>
                          <Label></Label>
                          {trucks && trucks.map((vehicle, index) => (
                            <Row>
                              <Col xs={5}>
                                <Label style={{ fontSize: '15px', verticalAlign: 'center', display: 'flex' }}>{vehicle.name}</Label>
                              </Col>
                              <Col xs={5}>
                                <Select
                                  className="basic-single"
                                  classNamePrefix="select"
                                  defaultValue={getRosterByEquipmentId(vehicle.id)}
                                  value={getRosterByEquipmentId(vehicle.id)}
                                  isDisabled={shiftBeforeCurrentDate()}
                                  isLoading={false}
                                  isClearable={true}
                                  isRtl={false}
                                  isSearchable={true}
                                  name="Operators"
                                  options={getOperatorsWithoutRoster(vehicle.id)}
                                  onChange={(selectedOption) => onOperatorChange(selectedOption, vehicle)}
                                />
                              </Col>
                              <Label></Label>
                              <Col key={"excavators_label"} xs={2}>
                                <Label></Label>
                              </Col>
                            </Row>
                          ))}
                        </div>
                      </CardBody>
                    </Card>
                  </Col>
                </Row>
                <Row>
                  <Col>
                    <p>  </p>
                    {/* <div className="text-center">
                      <Button type="submit" color="success" className="save-device"> {"Save"}  </Button>
                    </div> */}
                  </Col>
                </Row>
              </Form>
            </Col>
          </Row>
        </Container >
      </div >
    </React.Fragment >
  );
}

export default ShiftRoster;
