import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Card, CardBody, Col, Container, Row } from "reactstrap";
import Breadcrumb from "Components/Common/Breadcrumb";
import TableContainer, { TableColumn } from "../../Components/Common/TableContainer";
import { getTonnesMoved } from "slices/thunk";
import { useDispatch, useSelector } from "react-redux";
import { createSelector } from "reselect";
import { } from "../../Helpers/api_events_helper";
import { DatePicker, Segmented, Space } from "antd";
import { msToTime, shiftTimings, shiftTimingsByDateandShift, shifts, shiftsInFormat } from "utils/common";
import { Dayjs } from "dayjs";
import { ShiftTimingsInfo } from "Models/Shift";
import _, { forEach } from "lodash";
import { LaptopOutlined, PropertySafetyOutlined, UserOutlined } from "@ant-design/icons";

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

  const [timeRange, setTimeRange] = useState('CURRENT_SHIFT');
  const [shiftInfo, setShiftInfo] = useState(shiftTimings());
  const [filter, setFilter] = useState<string>('All Equipment');

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

  useEffect(() => {
    //dispatch(getTonnesMoved(1)); // Dispatch action to fetch data on component mount
  }, [dispatch]);


  const getContentByState = (state) => {

    let color = "#008000";
    let displayState = "Standby";
    switch (state) {
      case "ACTIVE":
        color = "#008000";
        displayState = 'Active';
        break;
      case "DELAY":
        color = "#6A32C9";
        displayState = 'Delayed';
        break;
      case "STANDBY":
        color = "#FFBF00";
        displayState = 'Standby';
        break;
      case "DOWN":
        color = "#FF5733";
        displayState = 'Down';
        break;
      default:
        break;
    }
    return { color, displayState };
  }

  const Chip = ({ label }) => (
    <span style={{
      display: 'inline-block',
      padding: '5px 10px',
      margin: '2px',
      borderRadius: '16px',
      backgroundColor: '#FF5733',
      color: 'white',
      fontSize: '12px'
    }} > {label}</span >
  );

  const FaultCodeCell = (cellProps) => {
    const faultCodes = cellProps.row.original.faultCodes;
    return (
      <Space direction="horizontal" style={{ width: '100%' }}>
        {faultCodes && faultCodes.length > 0 ? faultCodes.length === 1 ? <Chip label={faultCodes[0]} /> : <Space><Chip label={faultCodes[0]} /> <div style={{ fontSize: '10px', textAlign: 'left' }} >+ {faultCodes.length - 1} more</div></Space> : ''}
        {/* {faultCodes.map((code, index) => (
          <Chip label={code} />
        ))} */}
      </Space>
    );
  };


  const columns: TableColumn[] = useMemo(
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
              {cellProps.row.original.synced > 300 ? <UserOutlined style={{ color: 'red' }} /> : <LaptopOutlined style={{ color: 'green' }} />}
              <div style={{ textAlign: 'center', color: cellProps.row.original.synced > 300 ? 'red' : 'green' }}>{displayTime}</div>
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
        header: "Wheel Speed",
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
        header: "Payload",
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
        header: "Blow by Pressure",
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
        header: "Oil Temperature",
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
        header: "Oil Pressure",
        accessorKey: "oilPressure",
        enableColumnFilter: false,
        enableSorting: true,
        cell: (cellProps: any) => {
          return (
            <div style={{ textAlign: 'center' }}>{cellProps.row.original.oilPressure}</div>
          )
        }
      }
    ],
    []
  );

  opReportData = [{
    vehicleName: 'EX201',
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
    faultCodes: ['C140']
  },
  {
    vehicleName: 'DT104',
    status: 'DELAY',
    synced: 7000,
    rpm: '200',
    transmission: '4',
    speed: '8Km',
    payload: 'N/A',
    engineHours: '48916',
    interval: '503',
    blowPressure: '212',
    oilTemperature: '103',
    oilPressure: '18',
    faultCodes: ['C125']
  },
  {
    vehicleName: 'DT102',
    status: 'DOWN',
    synced: 250,
    rpm: '2700',
    transmission: '4',
    speed: '8Km',
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
    status: 'DOWN',
    synced: 250,
    rpm: '2700',
    transmission: '4',
    speed: '8Km',
    payload: 'N/A',
    engineHours: '48916',
    interval: '503',
    blowPressure: '212',
    oilTemperature: '103',
    oilPressure: '18',
    faultCodes: ['C140', 'C125']
  },
  {
    vehicleName: 'DT104',
    status: 'STANDBY',
    synced: 2500,
    rpm: '200',
    transmission: '4',
    speed: '8Km',
    payload: 'N/A',
    engineHours: '48916',
    interval: '503',
    blowPressure: '212',
    oilTemperature: '103',
    oilPressure: '18',
    faultCodes: ['D579', 'C110', 'C125']
  }];

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid>
          <Breadcrumb title="Dashboard" breadcrumbItem="Telemetry Report" />
          <Row className="mb-3">
            <Col className='d-flex flex-row-reverse'>
              <Space>
                <Segmented className="customSegmentLabel customSegmentBackground" value={filter} onChange={(e) => setFilter(e)} options={['All Equipment', { label: 'Excavators', value: 'EXCAVATOR' }, { label: 'Trucks', value: 'DUMP_TRUCK' }, { label: 'Loaders', value: 'LOADER' }, { label: 'Drillers', value: 'DRILLER' }, { label: 'Dozers', value: 'DOZER' }]} />
                {
                  timeRange == 'CUSTOM' &&
                  <>
                    <DatePicker allowClear={false} value={shiftInfo.start} onChange={onShiftDateChange} />
                    <Segmented className="customSegmentLabel customSegmentBackground" value={shiftInfo.shift} onChange={onShiftChange} options={shiftsInFormat(shifts)} />
                  </>
                }
                <Space>
                  <Segmented className="customSegmentLabel customSegmentBackground" value={timeRange} onChange={(e) => setTimeRange(e)} options={[{ value: 'CUSTOM', label: 'Custom' }, { value: 'PREVIOUS_SHIFT', label: 'Previous Shift' }, { value: 'CURRENT_SHIFT', label: 'Current Shift' }]} />
                </Space>
              </Space>
            </Col>
          </Row>
          <Row>
            <Col lg="12">
              <Card>
                <CardBody>
                  <TableContainer
                    columns={columns}
                    data={opReportData || []}
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
