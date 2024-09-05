import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Card, CardBody, Col, Container, Row } from "reactstrap";
import Breadcrumb from "Components/Common/Breadcrumb";
import TableContainer, { TableColumn } from "../../Components/Common/TableContainer";
import { getTonnesMoved } from "slices/thunk";
import { useDispatch, useSelector } from "react-redux";
import { createSelector } from "reselect";
import { } from "../../Helpers/api_events_helper";
import { DatePicker, Segmented, Select, Space } from "antd";
import { getContentByState, msToTime, shiftTimings, shiftTimingsByDateandShift, shifts, shiftsInFormat } from "utils/common";
import { Dayjs } from "dayjs";
import { ShiftTimingsInfo } from "Models/Shift";
import _, { forEach, indexOf, map } from "lodash";
import { EyeOutlined, LaptopOutlined, UserOutlined } from "@ant-design/icons";
import "./telemetry.css";
import { Link } from "react-router-dom";

const TelemetryReport = (props: any) => {
  document.title = "Telemetry Report | FMS Live";

  const dispatch: any = useDispatch();

  const opReportProperties = createSelector(
    (state: any) => state.TelemetryReport,
    (telemetryReport) => ({
      opReportData: telemetryReport ? telemetryReport.data : [],
      total: telemetryReport ? telemetryReport.total : 0,
      loading: telemetryReport ? telemetryReport.loading : true,
    })
  );

  let { opReportData } = useSelector(opReportProperties);

  opReportData = [{
    vehicleName: 'EX201',
    vehicleType: 'EXCAVATOR',
    status: 'ACTIVE',
    synced: 7000,
    rpm: '3500',
    transmission: 'N',
    speed: 'N/A',
    payload: '86.2',
    engineHours: '12316',
    interval: '195',
    blowPressure: '184',
    oilTemperature: '140',
    oilPressure: '21',
    faultCodes: ['C143']
  },
  {
    vehicleName: 'DT104',
    vehicleType: 'DUMP_TRUCK',
    status: 'DELAY',
    synced: 7000,
    rpm: '200',
    transmission: '4',
    speed: '8',
    payload: 'N/A',
    engineHours: '48916',
    interval: '503',
    blowPressure: '212',
    oilTemperature: '103',
    oilPressure: '18',
    faultCodes: ['DASRKR']
  },
  {
    vehicleName: 'DT102',
    vehicleType: 'DUMP_TRUCK',
    status: 'DOWN',
    synced: 250,
    rpm: '2700',
    transmission: '4',
    speed: '8',
    payload: 'N/A',
    engineHours: '48916',
    interval: '503',
    blowPressure: '212',
    oilTemperature: '103',
    oilPressure: '18',
    faultCodes: []
  },
  {
    vehicleName: 'DT102',
    vehicleType: 'DUMP_TRUCK',
    status: 'DOWN',
    synced: 250,
    rpm: '2700',
    transmission: '4',
    speed: '8',
    payload: 'N/A',
    engineHours: '48916',
    interval: '503',
    blowPressure: '212',
    oilTemperature: '103',
    oilPressure: '18',
    faultCodes: ['C155', 'C235']
  },
  {
    vehicleName: 'DT104',
    vehicleType: 'DUMP_TRUCK',
    status: 'STANDBY',
    synced: 2500,
    rpm: '200',
    transmission: '4',
    speed: '8',
    payload: 'N/A',
    engineHours: '48916',
    interval: '503',
    blowPressure: '212',
    oilTemperature: '103',
    oilPressure: '18',
    faultCodes: ['C2158', 'DASRKR', 'C125']
  }];

  const [timeRange, setTimeRange] = useState('CURRENT_SHIFT');
  const [shiftInfo, setShiftInfo] = useState(shiftTimings());
  const [filter, setFilter] = useState<string>('All Equipment');
  const [filteredData, setFilteredData] = useState<string>(opReportData);

  useEffect(() => {
    if (timeRange === 'CURRENT_SHIFT') {
      let currentShiftInfo = shiftTimings();
      setShiftInfo((prevState) => {
        return {
          ...prevState,
          ...currentShiftInfo
        }
      })
    } else if (timeRange === 'PREVIOUS_SHIFT') {
      let prevShiftInfo = shiftTimings(shiftInfo.start.subtract(2, 'hours'));
      setShiftInfo((prevState) => {
        return {
          ...prevState,
          ...prevShiftInfo
        }
      })
    }
  }, [timeRange]);

  const onShiftDateChange = (date: Dayjs): void => {
    const newShiftTimings: ShiftTimingsInfo = shiftTimingsByDateandShift(date.format('YYYY-MM-DD'), shiftInfo.shift);
    setShiftInfo((prevState: ShiftTimingsInfo) => {
      return {
        ...prevState,
        ...newShiftTimings
      }
    })
  }

  const onShiftChange = (shift: string): void => {
    const newShiftTimings: ShiftTimingsInfo = shiftTimingsByDateandShift(shiftInfo.shiftDate, shift);
    setShiftInfo((prevState: ShiftTimingsInfo) => {
      return {
        ...prevState,
        ...newShiftTimings
      }
    })
  }

  const onEquipmentTypeSelect = (filterType) => {
    setFilter(filterType);

    setFilteredData(prevState => {
      let data = _.cloneDeep(opReportData);

      if (filterType != 'All Equipment') {
        data = _.filter(data, (elem) => {
          return elem.vehicleType === filterType
        });
      }

      return data;
    })
  }

  useEffect(() => {
    //dispatch(getTonnesMoved(1)); // Dispatch action to fetch data on component mount
  }, [dispatch]);

  const allColumns: TableColumn[] = useMemo(
    () => [
      {
        header: "Machine ID",
        accessorKey: "vehicleName",
        enableColumnFilter: false,
        enableSorting: true,
        cell: (cellProps: any) => {
          return (
            <div style={{ textAlign: 'center' }}>{cellProps.row.original.vehicleName}</div>
          )
        }
      },
      {
        header: "Status",
        accessorKey: "status",
        enableColumnFilter: false,
        enableSorting: true,
        cell: (cellProps: any) => {
          const displayContent = getContentByState(cellProps.row.original.status);
          return (
            <Space style={{ alignItems: 'baseline' }}>
              <div style={{ height: '8px', width: '8px', color: 'transparent', backgroundColor: displayContent.color, borderRadius: '50%', fontSize: '1px' }}></div>
              <div style={{ textAlign: 'center' }}>{displayContent.displayState}</div>
            </Space>
          )
        }
      },
      {
        header: "Synced",
        accessorKey: "synced",
        enableColumnFilter: false,
        enableSorting: true,
        cell: (cellProps: any) => {
          const syncTimeDiff: any = msToTime(cellProps.row.original.synced);
          const displayTime = syncTimeDiff.hours === 0 ? `${syncTimeDiff.minutes}m` : `${syncTimeDiff.hours}h${syncTimeDiff.minutes}m`;
          return (
            <Space>
              {<LaptopOutlined style={{ color: getColorBySyncTime(cellProps.row.original.synced) }} />}
              <div style={{ textAlign: 'center', color: getColorBySyncTime(cellProps.row.original.synced) }}>{displayTime}</div>
            </Space>
          )
        }
      },
      {
        header: "Fault Code",
        accessorKey: "faultCodes",
        enableColumnFilter: false,
        enableSorting: true,
        cell: (cellProps) => <FaultCodeCell {...cellProps} />
      },
      {
        header: "Engine RPM",
        accessorKey: "rpm",
        enableColumnFilter: false,
        enableSorting: true,
        cell: (cellProps: any) => {
          return (
            <div style={{ textAlign: 'center' }}>{cellProps.row.original.rpm}</div>
          )
        }
      },
      {
        header: "Current Transmission",
        accessorKey: "transmission",
        enableColumnFilter: false,
        enableSorting: true,
        cell: (cellProps: any) => {
          return (
            <div style={{ textAlign: 'center' }}>{cellProps.row.original.transmission}</div>
          )
        }
      },
      {
        header: "Wheel Speed \n (Kmph)",
        accessorKey: "speed",
        enableColumnFilter: false,
        enableSorting: true,
        cell: (cellProps: any) => {
          return (
            <div style={{ textAlign: 'center' }}>{cellProps.row.original.speed}</div>
          )
        }
      },
      {
        header: "Payload \n (Tonnes)",
        accessorKey: "payload",
        enableColumnFilter: false,
        enableSorting: true,
        cell: (cellProps: any) => {
          return (
            <div style={{ textAlign: 'center' }}>{cellProps.row.original.payload}</div>
          )
        }
      },
      {
        header: "Engine Hours",
        accessorKey: "engineHours",
        enableColumnFilter: false,
        enableSorting: true,
        cell: (cellProps: any) => {
          return (
            <div style={{ textAlign: 'center' }}>{cellProps.row.original.engineHours}</div>
          )
        }
      },
      {
        header: "Service Interval",
        accessorKey: "interval",
        enableColumnFilter: false,
        enableSorting: true,
        cell: (cellProps: any) => {
          return (
            <div style={{ textAlign: 'center' }}>{cellProps.row.original.interval}</div>
          )
        }
      },
      {
        header: "Blow by Pressure \n (kPa)",
        accessorKey: "blowPressure",
        enableColumnFilter: false,
        enableSorting: true,
        cell: (cellProps: any) => {
          return (
            <div style={{ textAlign: 'center' }}>{cellProps.row.original.blowPressure}</div>
          )
        }
      },
      {
        header: "Oil Temperature \n (°C)",
        accessorKey: "oilTemperature",
        enableColumnFilter: false,
        enableSorting: true,
        cell: (cellProps: any) => {
          return (
            <div style={{ textAlign: 'center' }}>{cellProps.row.original.oilTemperature}</div>
          )
        }
      },
      {
        header: "Oil Pressure\n (kPa)",
        accessorKey: "oilPressure",
        enableColumnFilter: false,
        enableSorting: true,
        cell: (cellProps: any) => {
          return (
            <div style={{ textAlign: 'center' }}>{cellProps.row.original.oilPressure}</div>
          )
        }
      },
      {
        header: "Actions",
        enableColumnFilter: false,
        accessorKey: "actions",
        enableSorting: false,
        cell: (cellProps: any) => {
          const name = `${cellProps.row.original.vehicleName}`
          const id = cellProps.row.original.id
          return (
            <div style={{ textAlign: 'center' }} >
              <Link to={"/telemetry-details/" + name}>
                <EyeOutlined />
              </Link>
            </div>
          );
        }
      }
    ],
    []
  );

  let visibleColumns = {
    vehicleName: true,
    status: true,
    synced: true,
    faultCodes: true,
    rpm: true,
    transmission: true,
    speed: true,
    payload: true,
    engineHours: true,
    interval: true,
    blowPressure: true,
    oilTemperature: true,
    oilPressure: true,
    actions: true
  };

  const [columns, setColumns] = useState(allColumns.filter(column => visibleColumns[column.accessorKey!]));

  const onVisibleColumnsChange = (value) => {

    Object.keys(visibleColumns).map((key) => {
      _.indexOf(value, key) != -1 ? visibleColumns[key] = true : visibleColumns[key] = false
    })
    visibleColumns['actions'] = true;
    setColumns(allColumns.filter(column => visibleColumns[column.accessorKey!]));
  }

  const getColorBySyncTime = (time) => {

    let color = "#008000";
    if (time < 1800) {
      color = "green";
    } else if (time >= 1800 && time < 3600) {
      color = "orange";
    } else if (time >= 3600) {
      color = "red";
    }
    return color;
  }

  const Chip = ({ label }) => (
    <span style={{
      display: 'inline-block',
      padding: '5px 10px',
      margin: '2px',
      borderRadius: '16px',
      backgroundColor: 'red',
      color: 'white',
      fontSize: '12px'
    }} > {label}</span >
  );

  const FaultCodeCell = (cellProps) => {
    const faultCodes = cellProps.row.original.faultCodes;
    return (
      <Space direction="horizontal" style={{ width: '100%' }}>
        {faultCodes && faultCodes.length > 0 ? faultCodes.length === 1 ? <Chip label={faultCodes[0]} /> : <Space><Chip label={faultCodes[0]} /> <div style={{ fontSize: '10px' }} >+ {faultCodes.length - 1} more</div></Space> : ''}
        {/* {faultCodes.map((code, index) => (
          <Chip label={code} />
        ))} */}
      </Space>
    );
  };

  const getColumnHeaders = () => {
    let children: any = [];
    allColumns.forEach(column => {
      const { Option } = Select;
      if (column.accessorKey != 'actions') {
        children.push(<Option key={column.accessorKey}> {column.header}</Option >);
      }
    });
    return children;
  }

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid>
          <Breadcrumb title="Dashboard" breadcrumbItem="Telemetry Report" />
          <Row className="mb-3">
            <Col xs={2}>
              <Select
                className="customSelect"
                mode="multiple"
                style={{ width: '100%' }}
                placeholder="Show/Hide Columns"
                defaultValue={getColumnHeaders()}
                onChange={onVisibleColumnsChange}
                maxTagCount={1}
                showSearch={true}
                allowClear={false}
                menuItemSelectedIcon={true}
              >
                {getColumnHeaders()}
              </Select>
            </Col>
            <Col className='d-flex flex-row-reverse'>
              <Space>
                <Segmented className="customSegmentLabel customSegmentBackground" value={filter} onChange={(e) => onEquipmentTypeSelect(e)} options={['All Equipment', { label: 'Excavators', value: 'EXCAVATOR' }, { label: 'Trucks', value: 'DUMP_TRUCK' }, { label: 'Loaders', value: 'LOADER' }, { label: 'Drillers', value: 'DRILLER' }, { label: 'Dozers', value: 'DOZER' }]} />
                {/* {
                  timeRange == 'CUSTOM' &&
                  <>
                    <DatePicker allowClear={false} value={shiftInfo.start} onChange={onShiftDateChange} />
                    <Segmented className="customSegmentLabel customSegmentBackground" value={shiftInfo.shift} onChange={onShiftChange} options={shiftsInFormat(shifts)} />
                  </>
                } */}
                {/* <Space>
                  <Segmented className="customSegmentLabel customSegmentBackground" value={timeRange} onChange={(e) => setTimeRange(e)} options={[{ value: 'CUSTOM', label: 'Custom' }, { value: 'PREVIOUS_SHIFT', label: 'Previous Shift' }, { value: 'CURRENT_SHIFT', label: 'Current Shift' }]} />
                </Space> */}
              </Space>
            </Col>
          </Row>
          <Row>
            <Col lg="12">
              <Card>
                <CardBody>
                  <TableContainer
                    columns={columns}
                    data={filteredData || []}
                    theadClass="theadCenterAlign"
                    // total={total || 0}
                    isBordered={false}
                    isGlobalFilter={false}
                    isPagination={false}
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

export default TelemetryReport;
