import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Button, Card, CardBody, Col, Container, Form, FormFeedback, Input, Label, Modal, ModalBody, ModalHeader, Row } from 'reactstrap';
import Breadcrumb from 'Components/Common/Breadcrumb';
import TableContainer, { TableColumn } from '../../Components/Common/TableContainer';
import { AppState } from 'store';
import { getTargetsByRoster, getTargetsByRosterAndCategory, updateTarget, getAllFleet, getAllUsers, addTarget } from 'slices/thunk';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useSearchParams, createSearchParams } from 'react-router-dom';
import Select from 'react-select';
import { format } from 'date-fns';
import type { DatePickerProps } from 'antd';
import { DatePicker, Segmented, Space } from 'antd';
import dayjs, { Dayjs } from "dayjs";
import { shifts, shiftTimings } from "../../utils/common";

import { pick } from 'lodash';
import { createSelector } from 'reselect';
import _ from 'lodash';
import FormModal from 'Components/Common/FormModal';
import DeleteButton from 'Components/Common/DeleteButton';

const Target = (props: any) => {
  document.title = "Targets";

  const dispatch: any = useDispatch();

  const targetsProperties = createSelector(
    (state: any) => state.Target,
    (targets) => ({
      targets: targets.data
    })
  );

  const fleetProperties = createSelector(
    (state: any) => state.Fleet,
    (fleetState) => ({
      fleet: fleetState.data
    })
  );

  const { targets } = useSelector(targetsProperties);
  const { fleet } = useSelector(fleetProperties);

  const [diggers, setDiggers] = useState<any>();
  const [trucks, setTrucks] = useState<any>();


  const [modal, setModal] = useState<boolean>(false);
  const [isEdit, setIsEdit] = useState<boolean>(false);

  const [startDate, setStartDate] = useState(new Date());
  const [shift, setShift] = useState<any>('DS');
  const [hideShiftSelect, setHideShiftSelect] = useState<any>(false);
  const [pickerType, setPickerType] = useState<any>(false);
  const [pickerFormat, setPickerFormat] = useState<any>('YYYY-MM-DD');

  const [searchParams, setSearchParams] = useSearchParams();

  const toggle = useCallback(() => {
    setModal(!modal);
  }, [modal]);

  const targetTypes = [
    { value: 'SHIFT', label: 'SHIFT' },
    { value: 'DAILY', label: 'DAILY' },
    { value: 'WEEKLY', label: 'WEEKLY' },
    { value: 'MONTHLY', label: 'MONTHLY' }];

  var selectedTargetType = { value: 'SHIFT', label: 'SHIFT' };


  useEffect(() => {
    dispatch(getTargetsByRoster(format(startDate, 'yyyy-MM-dd') + ':' + shift)); // Dispatch action to fetch data on component mount

  }, [dispatch, shift, startDate]);

  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search)
    setShift(queryParams.get("shift") ? queryParams.get("shift") : 'DS');
    setStartDate(queryParams.get("date") ? new Date(queryParams.get("date") || new Date()) : new Date());

    if (!queryParams.get("shift")) {
      var params: URLSearchParams = new URLSearchParams({ shift: 'DS', date: format(new Date(), 'yyyy-MM-dd') });
      setSearchParams(params);
    }
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
    setShift(shiftInfo.value);
    var params: URLSearchParams = new URLSearchParams({ shift: shiftInfo.value, date: format(startDate, 'yyyy-MM-dd') });
    setSearchParams(params);
  }

  const onTargetTypeChange = (targetType) => {
    selectedTargetType = targetType;

    switch (selectedTargetType.value) {
      case 'SHIFT':
        setHideShiftSelect(false);
        setPickerType('date')
        setPickerFormat('YYYY-MM-DD')
        break;
      case 'DAILY':
        setHideShiftSelect(true);
        setPickerType('date')
        setPickerFormat('YYYY-MM-DD')
        break;
      case 'WEEKLY':
        setHideShiftSelect(true);
        setPickerType('week')
        setPickerFormat('wo MMM YYYY')
        break;
      case 'MONTHLY':
        setHideShiftSelect(true);
        setPickerType('month')
        setPickerFormat('MMM YYYY')
        break;

      default:
        break;
    }

  };


  const onChange = (operator, vehicle) => {
    const targetsInfo: any = targets.filter(roster => {
      if (roster['vehicle'] && roster['vehicle'].id) {
        return roster['vehicle'].id === vehicle.id;
      }
    });

    var target: any = {};

    target.roster = format(startDate, 'yyyy-MM-dd') + ':' + shift

    if (target.id) {
      const rosterId = target.id;
      delete target._type;
      delete target.createdAt;
      delete target.updatedAt;
      delete target.id;
      delete target._id;
      target.vehicleId = _.cloneDeep(target.vehicle.id);
      delete target.vehicle;
      dispatch(updateTarget(rosterId, target));
    } else {
      target.vehicleId = _.cloneDeep(target.vehicle.id);
      delete target.vehicle;
      dispatch(addTarget(target));
    }
  }


  const shiftBeforeCurrentDate = () => {
    const { shift, shiftDate } = shiftTimings()

    //TODO: Need to support at previous shifts level
    if (dayjs(startDate).isBefore(shiftDate)) {
      return true;
    }
    return false;
  }

  const handleOnAdd = () => {
    // setting as it is not edit
    // setIsEdit(false);
    // // clearing the resource state if previous value is set
    // setBench("");
    // // show dialog
    // toggle();
  };

  const handleOnEdit = useCallback(
    (arg: any) => {
      // reading the row data from table
      //     const bench = parseBenchData(arg)
      //     // saving to state
      //     setBench(bench);
      //     // setting the dialog to show as edit
      //     setIsEdit(true);
      //     // show dialog
      //     toggle();
    },
    [toggle]
  );

  const handleOnDelete = useCallback((arg: string) => {
    // dispatch(removeBench(arg));
    // onPaginationPageChange(1);
  }, [dispatch]);

  const handleOnSubmit = ((values, { resetForm }) => {

    // const _bench = parseBenchData(values)

    // if (isEdit) {
    //   _bench['id'] = bench.id
    //   delete _bench.id;
    //   dispatch(updateBench(bench.id, _bench));
    //   setIsEdit(false);
    // } else {
    //   delete _bench.id;
    //   dispatch(addBench(_bench));
    // }
    // // reset form after saving
    // resetForm();
    // // toggle the dialog
    // toggle();
  })

  const [data, setData] = useState([{
    truckModel: 'DT101',
    availablePer: 30,
    availableHrs: 7,
    standbyHrs: 3,
    utilizeHrs: 2,
    loads: 23,
    tonnes: 2455

  }]);

  const onFieldChange = (rowIndex, columnId, value) => {
    // const value = event.target.value.replace(/\+|-/ig, '');
    // console.log(value, event);
    // data[0].availableHrs = value
    // event.preventDefault();
    setData((prevState) => {
      const newData = [...prevState];
      newData[rowIndex] = {
        ...newData[rowIndex],
        [columnId]: value,
      };
      return newData;
    })
  };

  const columns: TableColumn[] = useMemo(
    () => [
      {
        header: "Truck Model",
        accessorKey: "truckModel",
        enableColumnFilter: false,
        enableSorting: true,
      },
      {
        header: "Availability (%)",
        accessorKey: "availablePer",
        enableColumnFilter: false,
        enableSorting: true,
        cell: ({ getValue, row, column }) => {
          return (
            <Input type='number' onChange={(event) => onFieldChange(row.index, column.id, event.target.value)} value={getValue()}> </Input>
          );
        }
      },
      {
        header: "Available (Hrs)",
        accessorKey: "availableHrs",
        enableColumnFilter: false,
        enableSorting: true,
        cell: ({ getValue, row, column }) => {
          return (
            <Input type='number' onChange={(event) => onFieldChange(row.index, column.id, event.target.value)} value={getValue()}> </Input>
          );
        }
      },
      {
        header: "Standby (Hrs)",
        accessorKey: "standbyHrs",
        enableColumnFilter: false,
        enableSorting: true,
        cell: ({ getValue, row, column }) => {
          return (
            <Input type='number' onChange={(event) => onFieldChange(row.index, column.id, event.target.value)} value={getValue()}> </Input>
          );
        }
      },
      {
        header: "Utilisation (Hrs)",
        accessorKey: "utilizeHrs",
        enableColumnFilter: false,
        enableSorting: true,
        cell: ({ getValue, row, column }) => {
          return (
            <Input type='number' onChange={(event) => onFieldChange(row.index, column.id, event.target.value)} value={getValue()}> </Input>
          );
        }
      },
      {
        header: "Total Loads",
        accessorKey: "loads",
        enableColumnFilter: false,
        enableSorting: true,
        cell: ({ getValue, row, column }) => {
          return (
            <Input type='number' onChange={(event) => onFieldChange(row.index, column.id, event.target.value)} value={getValue()}> </Input>
          );
        }
      },
      {
        header: "Total Tonnes",
        accessorKey: "tonnes",
        enableColumnFilter: false,
        enableSorting: true,
        cell: ({ getValue, row, column }) => {
          return (
            <Input type='number' onChange={(event) => onFieldChange(row.index, column.id, event.target.value)} value={getValue()}> </Input>
          );
        }
      },
      {
        header: "Actions",
        enableColumnFilter: false,
        accessorKey: "",
        enableSorting: false,
        cell: (cellProps: any) => {
          const name = `${cellProps.row.original.name}`
          const id = cellProps.row.original.id
          return (
            <div className="d-flex gap-3">
              <Link
                to="#!"
                className="text-success"
                onClick={(event: any) => {
                  event.preventDefault();
                  const benchData = cellProps.row.original;
                  handleOnEdit(benchData);
                }}
              >
                <i className="mdi mdi-pencil font-size-18" id="edittooltip" />
              </Link>
              <DeleteButton item={name} onDelete={() => handleOnDelete(id)} />
            </div>
          );
        },
      },
    ],
    [handleOnEdit, handleOnDelete]
  );

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid>
          <Breadcrumb breadcrumbItem="Targets" title="Operations" />

          <Row>
            <Col lg="12">
              <Form
                onSubmit={e => {
                  e.preventDefault();
                  return false;
                }}
              >
                <Row>


                  <Col className='d-flex flex-row-reverse'>
                    <Space>
                      <Select
                        className="basic-single"
                        classNamePrefix="TargetType"
                        defaultValue={selectedTargetType}
                        isDisabled={false}
                        isLoading={false}
                        isClearable={false}
                        isRtl={false}
                        isSearchable={true}
                        name="Target Type"
                        options={targetTypes}
                        onChange={onTargetTypeChange}
                      />
                      <DatePicker allowClear={false} value={dayjs(startDate)} onChange={onDateChange} />
                      <Segmented className="customSegmentLabel customSegmentBackground" value={shift} onChange={onShiftChange} options={[{ value: 'DS', label: 'DS' }, { value: 'NS', label: 'NS' }]} />
                    </Space>
                  </Col>

                </Row>

                <Label>  </Label>


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
          <Row>
            <Col lg="12">
              <Card>
                <CardBody>
                  <TableContainer
                    columns={columns}
                    data={data || []}
                    total={data.length}
                    isGlobalFilter={true}
                    handleOnAddClick={handleOnAdd}
                    isPagination={true}
                    isAddButton={false}
                    buttonName="New Bench"
                  />
                </CardBody>
              </Card>
              <FormModal fields={[]}
                modalOpen={modal}
                isEdit={isEdit}
                resource={"Bench"}
                initialValues={""}
                schema={""}
                handleOnSubmit={handleOnSubmit}
                handleOnCancel={toggle} />
            </Col>
          </Row>
        </Container>
      </div>
    </React.Fragment >
  );
}

export default Target;
