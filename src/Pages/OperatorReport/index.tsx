import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Card, CardBody, Col, Container, Row } from "reactstrap";
import Breadcrumb from "Components/Common/Breadcrumb";
import TableContainer, { TableColumn } from "../../Components/Common/TableContainer";
import { getTonnesMoved } from "slices/thunk";
import { useDispatch, useSelector } from "react-redux";
import { createSelector } from "reselect";
import { } from "../../Helpers/api_events_helper";
import { DatePicker, Segmented, Space } from "antd";
import { getContentByState, shiftTimings, shiftTimingsByDateandShift, shifts, shiftsInFormat } from "utils/common";
import { Dayjs } from "dayjs";
import { ShiftTimingsInfo } from "Models/Shift";

const OperatorReport = (props: any) => {
  document.title = "Operator Report | FMS Live";

  const dispatch: any = useDispatch();

  const opReportProperties = createSelector(
    (state: any) => state.OperatorReport,
    (operatorReport) => ({
      opReportData: operatorReport ? operatorReport.data : [],
      total: operatorReport ? operatorReport.total : 0,
      loading: operatorReport ? operatorReport.loading : true,
    })
  );

  let { opReportData } = useSelector(opReportProperties);

  const [timeRange, setTimeRange] = useState('CURRENT_SHIFT');
  const [shiftInfo, setShiftInfo] = useState(shiftTimings());

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
        header: "Operator Name",
        accessorKey: "operatorName",
        enableColumnFilter: false,
        enableSorting: true,
        cell: (cellProps: any) => {
          return (
            <div style={{ textAlign: 'center' }}>{cellProps.row.original.operatorName}</div>
          )
        }
      },
      {
        header: "Vehicle Name",
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
        header: "Active Hours",
        accessorKey: "active",
        enableColumnFilter: false,
        enableSorting: true,
        cell: (cellProps: any) => {
          return (
            <div style={{ textAlign: 'center' }}>{cellProps.row.original.active}</div>
          )
        }
      },
      {
        header: "Standby Hours",
        accessorKey: "standby",
        enableColumnFilter: false,
        enableSorting: true,
        cell: (cellProps: any) => {
          return (
            <div style={{ textAlign: 'center' }}>{cellProps.row.original.standby}</div>
          )
        }
      },
      {
        header: "Idle Hours",
        accessorKey: "idle",
        enableColumnFilter: false,
        enableSorting: true,
        cell: (cellProps: any) => {
          return (
            <div style={{ textAlign: 'center' }}>{cellProps.row.original.idle}</div>
          )
        }
      },
      {
        header: "Operation Delay Hours",
        accessorKey: "delay",
        enableColumnFilter: false,
        enableSorting: true,
        cell: (cellProps: any) => {
          return (
            <div style={{ textAlign: 'center' }}>{cellProps.row.original.delay}</div>
          )
        }
      },
      {
        header: "Actual (Tonnes)",
        accessorKey: "actualTonnes",
        enableColumnFilter: false,
        enableSorting: true,
        cell: (cellProps: any) => {
          return (
            <div style={{ textAlign: 'center' }}>{cellProps.row.original.actualTonnes}</div>
          )
        }
      },
      {
        header: "Planned (Tonnes)",
        accessorKey: "plannedTonnes",
        enableColumnFilter: false,
        enableSorting: true,
        cell: (cellProps: any) => {
          return (
            <div style={{ textAlign: 'center' }}>{cellProps.row.original.plannedTonnes}</div>
          )
        }
      },
      {
        header: "Loads Loaded (Actual)",
        accessorKey: "actualLoads",
        enableColumnFilter: false,
        enableSorting: true,
        cell: (cellProps: any) => {
          return (
            <div style={{ textAlign: 'center' }}>{cellProps.row.original.actualLoads}</div>
          )
        }
      },
      {
        header: "Loads Loaded (Plan)",
        accessorKey: "plannedLoads",
        enableColumnFilter: false,
        enableSorting: true,
        cell: (cellProps: any) => {
          return (
            <div style={{ textAlign: 'center' }}>{cellProps.row.original.plannedLoads}</div>
          )
        }
      }
    ],
    []
  );

  opReportData = [{
    operatorName: 'Prudhviraj',
    vehicleName: 'DT101',
    status: 'ACTIVE',
    active: 7,
    standby: 2,
    idle: 3,
    delay: 1,
    actualTonnes: 2765.34,
    plannedTonnes: 2765.34,
    actualLoads: 35,
    plannedLoads: 35,
  },
  {
    operatorName: 'John Shein',
    vehicleName: 'DT102',
    status: 'DOWN',
    active: 5,
    standby: 3,
    idle: 3,
    delay: 1,
    actualTonnes: 2765.34,
    plannedTonnes: 2765.34,
    actualLoads: 35,
    plannedLoads: 35,
  }];

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid>
          <Breadcrumb title="Dashboard" breadcrumbItem="Operator Report" />
          <Row className="mb-3">
            <Col className='d-flex flex-row-reverse'>
              {/* <Space>
                {
                  timeRange == 'CUSTOM' &&
                  <>
                    <DatePicker allowClear={false} value={shiftInfo.start} onChange={onShiftDateChange} />
                    <Segmented className="customSegmentLabel customSegmentBackground" value={shiftInfo.shift} onChange={onShiftChange} options={shiftsInFormat(shifts)} />
                  </>
                }
                <Segmented className="customSegmentLabel customSegmentBackground" value={timeRange} onChange={(e) => setTimeRange(e)} options={[{ value: 'CUSTOM', label: 'Custom' }, { value: 'PREVIOUS_SHIFT', label: 'Previous Shift' }, { value: 'CURRENT_SHIFT', label: 'Current Shift' }]} />
              </Space> */}
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

export default OperatorReport;
