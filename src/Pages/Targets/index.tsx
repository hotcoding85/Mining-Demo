import React, { useEffect, useMemo, useState } from "react";
import {
  Card,
  CardBody,
  Col,
  Container,
  Form,
  Input,
  Label,
  Row,
} from "reactstrap";
import Breadcrumb from "Components/Common/Breadcrumb";
import TableContainer, {
  TableColumn,
} from "../../Components/Common/TableContainer";
import {
  getTargetsByRosterAndCategory,
  updateTarget,
  getAllFleet,
} from "slices/thunk";
import { useDispatch, useSelector } from "react-redux";
import { useSearchParams } from "react-router-dom";
import Select from "react-select";
import { format } from "date-fns";
import type { DatePickerProps } from "antd";
import { DatePicker, Segmented, Space } from "antd";
import dayjs from "dayjs";
import { shiftDuration, shifts, shiftTimings } from "../../utils/common";

// import { pick } from 'lodash';
import { createSelector } from "reselect";
import _ from "lodash";
// import DeleteButton from 'Components/Common/DeleteButton';

const Target = (props: any) => {
  document.title = "Targets";

  const dispatch: any = useDispatch();

  const targetsProperties = createSelector(
    (state: any) => state.Target,
    (targets) => ({
      targets: targets.data,
    })
  );

  const fleetProperties = createSelector(
    (state: any) => state.Fleet,
    (fleetState) => ({
      fleet: fleetState.data,
    })
  );

  const { targets } = useSelector(targetsProperties);
  const { fleet } = useSelector(fleetProperties);

  const [diggers, setDiggers] = useState<any>();
  const [trucks, setTrucks] = useState<any>();

  const [startDate, setStartDate] = useState(new Date());
  const [shift, setShift] = useState<any>("DS");
  const [hideShiftSelect, setHideShiftSelect] = useState<any>(false);
  const [pickerType, setPickerType] = useState<any>(false);
  const [pickerFormat, setPickerFormat] = useState<any>("YYYY-MM-DD");

  const [searchParams, setSearchParams] = useSearchParams();

  const [data, setData] = useState<any>([]);
  const [selectedTargetType, setSelectedTargetType] = useState<any>({
    value: "SHIFT",
    label: "SHIFT",
  });

  const avgTripTime: number = 15;
  const targetsConfig = {
    SHIFT: {
      availablePer: 80,
      availability: 9.6,
      standby: 1,
      utilization: 0,
      loads: 0,
      tonnes: 0,
    },
    DAILY: {
      availablePer: 80,
      availability: 19.2,
      standby: 2,
      utilization: 0,
      loads: 0,
      tonnes: 0,
    },
    WEEKLY: {
      availablePer: 80,
      availability: 134.4,
      standby: 14,
      utilization: 0,
      loads: 0,
      tonnes: 0,
    },
    MONTHLY: {
      availablePer: 80,
      availability: 576,
      standby: 30,
      utilization: 0,
      loads: 0,
      tonnes: 0,
    },
  };

  const targetTypes = [
    { value: "SHIFT", label: "SHIFT" },
    { value: "DAILY", label: "DAILY" },
    { value: "WEEKLY", label: "WEEKLY" },
    { value: "MONTHLY", label: "MONTHLY" },
  ];

  useEffect(() => {
    dispatch(
      getTargetsByRosterAndCategory(
        JSON.stringify([format(startDate, "yyyy-MM-dd") + ":" + shift]),
        selectedTargetType.value
      )
    );
    // dispatch(getTargetsByRoster(format(startDate, 'yyyy-MM-dd') + ':' + shift)); // Dispatch action to fetch data on component mount
  }, [dispatch, shift, startDate]);

  useEffect(() => {
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
    setDiggers(fleet.filter((vehicle) => vehicle.category === "EXCAVATOR"));
    setTrucks(fleet.filter((vehicle) => vehicle.category === "DUMP_TRUCK"));
  }, [fleet]);

  useEffect(() => {
    dispatch(getAllFleet()); // Dispatch action to fetch fleet data on component mount
  }, [dispatch]);

  useEffect(() => {
    setData(generateData());
  }, [targets]);

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
    setShift(shiftInfo);
    var params: URLSearchParams = new URLSearchParams({
      shift: shiftInfo,
      date: format(startDate, "yyyy-MM-dd"),
    });
    setSearchParams(params);
  };

  const onTargetTypeChange = (targetType) => {
    setSelectedTargetType(targetType);

    updateView(targetType.value);
  };

  const updateView = (targetType) => {
    switch (targetType) {
      case "SHIFT":
        setHideShiftSelect(false);
        setPickerType("date");
        setPickerFormat("YYYY-MM-DD");

        dispatch(
          getTargetsByRosterAndCategory(
            JSON.stringify([format(startDate, "yyyy-MM-dd") + ":" + shift]),
            targetType
          )
        );
        break;
      case "DAILY":
        setHideShiftSelect(true);
        setPickerType("date");
        setPickerFormat("YYYY-MM-DD");

        let rosters: any[] = [];
        shifts.map((shift) => {
          rosters.push(format(startDate, "yyyy-MM-dd") + ":" + shift.value);
        });

        dispatch(
          getTargetsByRosterAndCategory(JSON.stringify(rosters), targetType)
        );
        break;
      case "WEEKLY":
        setHideShiftSelect(true);
        setPickerType("week");
        setPickerFormat("wo MMM YYYY");
        break;
      case "MONTHLY":
        setHideShiftSelect(true);
        setPickerType("month");
        setPickerFormat("MMM YYYY");
        break;

      default:
        break;
    }
  };

  const onChange = (targetData) => {
    const targetsInfo: any = targets.filter((target) => {
      if (target && target["vehicleId"]) {
        return target["vehicleId"] === targetData.truckId;
      }
    });

    var target: any = {};

    if (targetsInfo && targetsInfo[0]) {
      target = targetsInfo[0];
    }

    target.data = _.pick(targetData, [
      "availablePer",
      "availability",
      "standby",
      "utilization",
      "loads",
      "tonnes",
    ]);
    target.roster = format(startDate, "yyyy-MM-dd") + ":" + shift;
    target.category = selectedTargetType.value;

    if (target.id) {
      const targetId = target.id;
      delete target._type;
      delete target.createdAt;
      delete target.updatedAt;
      delete target.id;
      delete target._id;
      delete target.vehicle;
      dispatch(updateTarget(targetId, target));
      // dispatch(updateTarget(rosterId, target));
    } else {
      target.vehicleId = _.cloneDeep(targetData.truckId);
      delete target.vehicle;
      // dispatch(addTarget(target));
    }
  };

  const shiftBeforeCurrentDate = () => {
    const { shift, shiftDate } = shiftTimings();

    //TODO: Need to support at previous shifts level
    if (dayjs(startDate).isBefore(shiftDate)) {
      return true;
    }
    return false;
  };

  const generateData = () => {
    let targetsData: [any] = [
      {
        truckId: undefined,
        truckModel: undefined,
        availablePer: undefined,
        availability: undefined,
        standby: undefined,
        utilization: undefined,
        loads: undefined,
        tonnes: undefined,
      },
    ];
    trucks &&
      trucks.map((truck) => {
        let vehicleTargetData = _.filter(targets, (target) => {
          return target && target.vehicleId === truck.id;
        });
        var target = targetsConfig[selectedTargetType.value];
        if (
          vehicleTargetData &&
          vehicleTargetData[0] &&
          vehicleTargetData[0].data
        )
          target = _.cloneDeep(vehicleTargetData[0].data);

        if (target.availability && target.availability != 0) {
          if (selectedTargetType.value === "SHIFT") {
            target["availablePer"] =
              (target.availability / shiftDuration(shifts, shift)) * 100;
          } else {
            target["availablePer"] = (target.availability / 24) * 100;
          }
        }

        if (
          target.standby &&
          target.standby != 0 &&
          (!target.utilization || target.utilization === 0)
        ) {
          target.utilization = _.round(target.availability - target.standby, 2);
        }

        if (!target.tonnes || target.tonnes == 0) {
          target.tonnes = _.round(
            (target.utilization / avgTripTime) * truck.capacity,
            2
          );
        }

        if (!targetsData || !targetsData[0] || !targetsData[0].truckId) {
          targetsData = [
            {
              truckId: truck.id,
              truckModel: truck.name,
              availablePer: target.availablePer,
              availability: target.availability,
              standby: target.standby,
              utilization: target.utilization,
              loads: target.loads,
              tonnes: target.tonnes,
            },
          ];
        } else {
          targetsData.push({
            truckId: truck.id,
            truckModel: truck.name,
            availablePer: target.availablePer,
            availability: target.availability,
            standby: target.standby,
            utilization: target.utilization,
            loads: target.loads,
            tonnes: target.tonnes,
          });
        }
      });

    return targetsData;
  };

  const onFieldChange = (rowIndex, columnId, value) => {
    setData((prevState) => {
      const newData = [...prevState];
      newData[rowIndex] = {
        ...newData[rowIndex],
        [columnId]: parseInt(value),
      };

      if (columnId === "availablePer") {
        if (selectedTargetType.value === "SHIFT") {
          newData[rowIndex]["availability"] =
            (shiftDuration(shifts, shift) * parseInt(value)) / 100;
        } else {
          newData[rowIndex]["availability"] = (24 * parseInt(value)) / 100;
        }
      }

      if (columnId === "availablePer" || columnId === "standby") {
        if (newData[rowIndex].standby && newData[rowIndex].standby != 0) {
          newData[rowIndex].utilization = _.round(
            newData[rowIndex].availability - newData[rowIndex].standby,
            2
          );
        }
      }
      if (columnId === "availablePer" || columnId === "utilization") {
        if (
          newData[rowIndex].utilization &&
          newData[rowIndex].utilization != 0
        ) {
          newData[rowIndex].standby = _.round(
            newData[rowIndex].availability - newData[rowIndex].utilization,
            2
          );
        }
      }

      return newData;
    });
  };

  const handleKeyPress = (event, rowIndex, columnId) => {
    if (event.key === "Enter" || event.type === "blur") {
      setData((prevState) => {
        const newData = [...prevState];
        // let vehicleTargetData = _.filter(targets, (target) => { return target && newData && newData[rowIndex] && target.vehicleId === newData[rowIndex]['truckId'] });
        // vehicleTargetData = vehicleTargetData[0];
        // if (!vehicleTargetData || (vehicleTargetData && vehicleTargetData['data'] && vehicleTargetData['data'][columnId] !== value)) {
        onChange(newData[rowIndex]);
        // }
        return newData;
      });
    }
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
            <Input
              type="number"
              onChange={(event) =>
                onFieldChange(row.index, column.id, event.target.value)
              }
              onKeyDown={(event) => handleKeyPress(event, row.index, column.id)}
              onBlur={(event) => handleKeyPress(event, row.index, column.id)}
              value={getValue()}
            >
              {" "}
            </Input>
          );
        },
      },
      {
        header: "Available (Hrs)",
        accessorKey: "availability",
        enableColumnFilter: false,
        enableSorting: true,
        cell: ({ getValue, row, column }) => {
          return (
            <Input
              type="number"
              onChange={(event) =>
                onFieldChange(row.index, column.id, event.target.value)
              }
              onKeyDown={(event) => handleKeyPress(event, row.index, column.id)}
              value={getValue()}
            >
              {" "}
            </Input>
          );
        },
      },
      {
        header: "Standby (Hrs)",
        accessorKey: "standby",
        enableColumnFilter: false,
        enableSorting: true,
        cell: ({ getValue, row, column }) => {
          return (
            <Input
              type="number"
              onChange={(event) =>
                onFieldChange(row.index, column.id, event.target.value)
              }
              onKeyDown={(event) => handleKeyPress(event, row.index, column.id)}
              value={getValue()}
            >
              {" "}
            </Input>
          );
        },
      },
      {
        header: "Utilisation (Hrs)",
        accessorKey: "utilization",
        enableColumnFilter: false,
        enableSorting: true,
        cell: ({ getValue, row, column }) => {
          return (
            <Input
              type="number"
              onChange={(event) =>
                onFieldChange(row.index, column.id, event.target.value)
              }
              onKeyDown={(event) => handleKeyPress(event, row.index, column.id)}
              value={getValue()}
            >
              {" "}
            </Input>
          );
        },
      },
      // {
      //   header: "Total Loads",
      //   accessorKey: "loads",
      //   enableColumnFilter: false,
      //   enableSorting: true,
      //   cell: ({ getValue, row, column }) => {
      //     return (
      //       <Input type='number' onChange={(event) => onFieldChange(row.index, column.id, event.target.value)} value={getValue()}> </Input>
      //     );
      //   }
      // },
      {
        header: "Total Tonnes",
        accessorKey: "tonnes",
        enableColumnFilter: false,
        enableSorting: true,
        cell: ({ getValue, row, column }) => {
          return (
            <Input
              type="number"
              onChange={(event) =>
                onFieldChange(row.index, column.id, event.target.value)
              }
              onKeyDown={(event) => handleKeyPress(event, row.index, column.id)}
              value={getValue()}
            >
              {" "}
            </Input>
          );
        },
      },
      // {
      //   header: "Actions",
      //   enableColumnFilter: false,
      //   accessorKey: "",
      //   enableSorting: false,
      //   cell: (cellProps: any) => {
      //     const name = `${cellProps.row.original.name}`
      //     const id = cellProps.row.original.id
      //     return (
      //       <div className="d-flex gap-3">
      //         <Link
      //           to="#!"
      //           className="text-success"
      //           onClick={(event: any) => {
      //             event.preventDefault();
      //             const benchData = cellProps.row.original;
      //             handleOnEdit(benchData);
      //           }}
      //         >
      //           <i className="mdi mdi-pencil font-size-18" id="edittooltip" />
      //         </Link>
      //         <DeleteButton item={name} onDelete={() => handleOnDelete(id)} />
      //       </div>
      //     );
      //   },
      // },
    ],
    []
  );

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid>
          <Breadcrumb breadcrumbItem="Targets" title="Operations" />

          <Row>
            <Col lg="12">
              <Form
              // onSubmit={e => {
              //   e.preventDefault();
              //   return false;
              // }}
              >
                <Row>
                  <Col className="d-flex flex-row-reverse">
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
                      <DatePicker
                        allowClear={false}
                        value={dayjs(startDate)}
                        format={pickerFormat}
                        type={pickerType}
                        onChange={onDateChange}
                      />
                      <Segmented
                        hidden={hideShiftSelect}
                        className="customSegmentLabel customSegmentBackground"
                        value={shift}
                        onChange={onShiftChange}
                        options={[
                          { value: "DS", label: "DS" },
                          { value: "NS", label: "NS" },
                        ]}
                      />
                    </Space>
                  </Col>
                </Row>

                <Label> </Label>

                <Row>
                  <Col>
                    <p> </p>
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
                    isPagination={true}
                    isAddButton={false}
                  />
                </CardBody>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>
    </React.Fragment>
  );
};

export default Target;
