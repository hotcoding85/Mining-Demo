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
import { getRandomInt } from "utils/random";

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
            <div style={{ textAlign: 'left' }}>{cellProps.row.original.operatorName}</div>
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
            <div style={{ textAlign: 'left', marginLeft:'10px' }}>{cellProps.row.original.vehicleName}</div>
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
            <div style={{ display:'flex', alignItems: 'center', justifyContent: 'left' }}>
              <span style={{ height: '8px', width: '8px', color: 'transparent', backgroundColor: displayContent.color, borderRadius: '50%', fontSize: '1px' }}></span>
              <span style={{ textAlign: 'center', marginLeft: '6px' }}>{displayContent.displayState}</span>
            </div>
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
      // {
      //   header: "Tonnes (Actual)",
      //   accessorKey: "actualTonnes",
      //   enableColumnFilter: false,
      //   enableSorting: true,
      //   cell: (cellProps: any) => {
      //     return (
      //       <div style={{ textAlign: 'center' }}>{cellProps.row.original.actualTonnes}</div>
      //     )
      //   }
      // },
      {
        header: "Tonnes (Actual / Planned)",
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
        header: "Loads (Actual / Planned)",
        accessorKey: "actualLoads",
        enableColumnFilter: false,
        enableSorting: true,
        cell: (cellProps: any) => {
          return (
            <div style={{ textAlign: 'center' }}>{cellProps.row.original.actualLoads}</div>
          )
        }
      },
      // {
      //   header: "Loads (Planned)",
      //   accessorKey: "plannedLoads",
      //   enableColumnFilter: false,
      //   enableSorting: true,
      //   cell: (cellProps: any) => {
      //     return (
      //       <div style={{ textAlign: 'center' }}>{cellProps.row.original.plannedLoads}</div>
      //     )
      //   }
      // }
    ],
    []
  );

  opReportData = [{
    operatorName: 'Paul',
    vehicleName: 'DT101',
    status: 'ACTIVE',
    active: '0' + getRandomInt(0, 9) + ':' + getRandomInt(10, 55),
    standby: '0' + getRandomInt(0, 9) + ':' + getRandomInt(10, 55),
    idle: '0' + getRandomInt(0, 9) + ':' + getRandomInt(10, 55),
    delay: '0' + getRandomInt(0, 9) + ':' + getRandomInt(10, 55),
    actualTonnes: 2765.34,
    plannedTonnes: '3000/2565',
    actualLoads: '35/45',
    plannedLoads: 35,
  },
  {
    operatorName: 'John Shein',
    vehicleName: 'DT102',
    status: 'DOWN',
    active: '0' + getRandomInt(0, 9) + ':' + getRandomInt(10, 55),
    standby: '0' + getRandomInt(0, 9) + ':' + getRandomInt(10, 55),
    idle: '0' + getRandomInt(0, 9) + ':' + getRandomInt(10, 55),
    delay: '0' + getRandomInt(0, 9) + ':' + getRandomInt(10, 55),
    actualTonnes: 2765.34,
    plannedTonnes: '3000/2765',
    actualLoads: '35/45',
    plannedLoads: 35,
  },
  {
    operatorName: 'Liam',
    vehicleName: 'DT103',
    status: 'STANDBY',
    active: '0' + getRandomInt(0, 9) + ':' + getRandomInt(10, 55),
    standby: '0' + getRandomInt(0, 9) + ':' + getRandomInt(10, 55),
    idle: '0' + getRandomInt(0, 9) + ':' + getRandomInt(10, 55),
    delay: '0' + getRandomInt(0, 9) + ':' + getRandomInt(10, 55),
    actualTonnes: 2765.34,
    plannedTonnes: '3000/3125',
    actualLoads: '35/45',
    plannedLoads: 35,
  },
  {
    operatorName: 'Noah',
    vehicleName: 'DT104',
    status: 'STANDBY',
    active: '0' + getRandomInt(0, 9) + ':' + getRandomInt(10, 55),
    standby: '0' + getRandomInt(0, 9) + ':' + getRandomInt(10, 55),
    idle: '0' + getRandomInt(0, 9) + ':' + getRandomInt(10, 55),
    delay: '0' + getRandomInt(0, 9) + ':' + getRandomInt(10, 55),
    actualTonnes: 2765.34,
    plannedTonnes: '3000/2465',
    actualLoads: '35/45',
    plannedLoads: 35,
  },
  {
    operatorName: 'Jack',
    vehicleName: 'DT105',
    status: 'DELAY',
    active: '0' + getRandomInt(0, 9) + ':' + getRandomInt(10, 55),
    standby: '0' + getRandomInt(0, 9) + ':' + getRandomInt(10, 55),
    idle: '0' + getRandomInt(0, 9) + ':' + getRandomInt(10, 55),
    delay: '0' + getRandomInt(0, 9) + ':' + getRandomInt(10, 55),
    actualTonnes: 2765.34,
    plannedTonnes: '3000/2685',
    actualLoads: '35/45',
    plannedLoads: 35,
  },
  {
    operatorName: 'William',
    vehicleName: 'DT106',
    status: 'STANDBY',
    active: '0' + getRandomInt(0, 9) + ':' + getRandomInt(10, 55),
    standby: '0' + getRandomInt(0, 9) + ':' + getRandomInt(10, 55),
    idle: '0' + getRandomInt(0, 9) + ':' + getRandomInt(10, 55),
    delay: '0' + getRandomInt(0, 9) + ':' + getRandomInt(10, 55),
    actualTonnes: 2765.34,
    plannedTonnes: '3000/2765',
    actualLoads: '35/45',
    plannedLoads: 35,
  },
  {
    operatorName: 'James',
    vehicleName: 'DT107',
    status: 'DOWN',
    active: '0' + getRandomInt(0, 9) + ':' + getRandomInt(10, 55),
    standby: '0' + getRandomInt(0, 9) + ':' + getRandomInt(10, 55),
    idle: '0' + getRandomInt(0, 9) + ':' + getRandomInt(10, 55),
    delay: '0' + getRandomInt(0, 9) + ':' + getRandomInt(10, 55),
    actualTonnes: 2765.34,
    plannedTonnes: '3000/2945',
    actualLoads: '35/45',
    plannedLoads: 35,
  },
  {
    operatorName: 'Oliver',
    vehicleName: 'DT108',
    status: 'DOWN',
    active: '0' + getRandomInt(0, 9) + ':' + getRandomInt(10, 55),
    standby: '0' + getRandomInt(0, 9) + ':' + getRandomInt(10, 55),
    idle: '0' + getRandomInt(0, 9) + ':' + getRandomInt(10, 55),
    delay: '0' + getRandomInt(0, 9) + ':' + getRandomInt(10, 55),
    actualTonnes: 2765.34,
    plannedTonnes: '3000/2685',
    actualLoads: '35/45',
    plannedLoads: 35,
  },
  {
    operatorName: 'Smith',
    vehicleName: 'DT109',
    status: 'DELAY',
    active: '0' + getRandomInt(0, 9) + ':' + getRandomInt(10, 55),
    standby: '0' + getRandomInt(0, 9) + ':' + getRandomInt(10, 55),
    idle: '0' + getRandomInt(0, 9) + ':' + getRandomInt(10, 55),
    delay: '0' + getRandomInt(0, 9) + ':' + getRandomInt(10, 55),
    actualTonnes: 2765.34,
    plannedTonnes: '3000/2765',
    actualLoads: '35/45',
    plannedLoads: 35,
  },
  {
    operatorName: 'Jones',
    vehicleName: 'DT110',
    status: 'DOWN',
    active: '0' + getRandomInt(0, 9) + ':' + getRandomInt(10, 55),
    standby: '0' + getRandomInt(0, 9) + ':' + getRandomInt(10, 55),
    idle: '0' + getRandomInt(0, 9) + ':' + getRandomInt(10, 55),
    delay: '0' + getRandomInt(0, 9) + ':' + getRandomInt(10, 55),
    actualTonnes: 2765.34,
    plannedTonnes: '4000/3765',
    actualLoads: '35/45',
    plannedLoads: 35,
  },
  {
    operatorName: 'Brown',
    vehicleName: 'DT111',
    status: 'DOWN',
    active: '0' + getRandomInt(0, 9) + ':' + getRandomInt(10, 55),
    standby: '0' + getRandomInt(0, 9) + ':' + getRandomInt(10, 55),
    idle: '0' + getRandomInt(0, 9) + ':' + getRandomInt(10, 55),
    delay: '0' + getRandomInt(0, 9) + ':' + getRandomInt(10, 55),
    actualTonnes: 2765,
    plannedTonnes: '3000/2765',
    actualLoads: '35/45',
    plannedLoads: 35,
  },
  {
    operatorName: 'Katie',
    vehicleName: 'DT112',
    status: 'STANDBY',
    active: '0' + getRandomInt(0, 9) + ':' + getRandomInt(10, 55),
    standby: '0' + getRandomInt(0, 9) + ':' + getRandomInt(10, 55),
    idle: '0' + getRandomInt(0, 9) + ':' + getRandomInt(10, 55),
    delay: '0' + getRandomInt(0, 9) + ':' + getRandomInt(10, 55),
    actualTonnes: 3965,
    plannedTonnes: '3965.34/2765',
    actualLoads: '35/45',
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
                    theadClass="theadCenterAlign"
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
