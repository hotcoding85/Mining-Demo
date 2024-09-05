import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Card, CardBody, Col, Container, Row } from "reactstrap";
import Breadcrumb from "Components/Common/Breadcrumb";
import TableContainer, { TableColumn } from "../../Components/Common/TableContainer";
import { getTonnesMoved } from "slices/thunk";
import { useDispatch, useSelector } from "react-redux";
import { createSelector } from "reselect";
import { } from "../../Helpers/api_events_helper";
import { DatePicker, Segmented, Space } from "antd";
import { shiftTimings, shiftTimingsByDateandShift, shifts, shiftsInFormat } from "utils/common";
import { Dayjs } from "dayjs";
import { ShiftTimingsInfo } from "Models/Shift";

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

  const columns: TableColumn[] = useMemo(
    () => [
      {
        header: "Machine ID",
        accessorKey: "vehicleName",
        enableColumnFilter: false,
        enableSorting: true,
        cell: (cellProps: any) => {
          return (
            <div style={{ textAlign:'center' }}>{cellProps.row.original.vehicleName}</div>
          )
        }
      },
      {
        header: "Status",
        accessorKey: "status",
        enableColumnFilter: false,
        enableSorting: true,
        cell: (cellProps: any) => {
          return (
            <div style={{ textAlign:'center' }}>{cellProps.row.original.status}</div>
          )
        }
      },
      {
        header: "Synced",
        accessorKey: "synced",
        enableColumnFilter: false,
        enableSorting: true,
        cell: (cellProps: any) => {
          return (
            <div style={{ textAlign:'center' }}>{cellProps.row.original.synced}</div>
          )
        }
      },
      {
        header: "Engine RPM",
        accessorKey: "rpm",
        enableColumnFilter: false,
        enableSorting: true,
        cell: (cellProps: any) => {
          return (
            <div style={{ textAlign:'center' }}>{cellProps.row.original.rpm}</div>
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
            <div style={{ textAlign:'center' }}>{cellProps.row.original.transmission}</div>
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
            <div style={{ textAlign:'center' }}>{cellProps.row.original.speed}</div>
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
            <div style={{ textAlign:'center' }}>{cellProps.row.original.payload}</div>
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
            <div style={{ textAlign:'center' }}>{cellProps.row.original.engineHours}</div>
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
            <div style={{ textAlign:'center' }}>{cellProps.row.original.interval}</div>
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
            <div style={{ textAlign:'center' }}>{cellProps.row.original.blowPressure}</div>
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
            <div style={{ textAlign:'center' }}>{cellProps.row.original.oilTemperature}</div>
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
            <div style={{ textAlign:'center' }}>{cellProps.row.original.oilPressure}</div>
          )
        }
      },
      {
        header: "Fault Code",
        accessorKey: "faultCodes",
        enableColumnFilter: false,
        enableSorting: true,
        cell: (cellProps: any) => {
          return (
            <div style={{ textAlign:'center' }}>{cellProps.row.original.faultCodes}</div>
          )
        }
      }
    ],
    []
  );

  opReportData = [{
    vehicleName: 'EX201',
    status: 'Active',
    synced: '1m',
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
    vehicleName: 'DT102',
    status: 'Down',
    synced: '3h',
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
