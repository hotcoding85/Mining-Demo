import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Card, CardBody, Col, Container, Row } from "reactstrap";
import Breadcrumb from "Components/Common/Breadcrumb";
import { getTonnesMoved } from "slices/thunk";
import { useDispatch, useSelector } from "react-redux";
import { createSelector } from "reselect";
import {} from "../../Helpers/api_events_helper";
import { DatePicker, Input, Segmented, Space } from "antd";
import {
  getContentByState,
  shiftTimings,
  shiftTimingsByDateandShift,
  shifts,
  shiftsInFormat,
} from "utils/common";
import { Dayjs } from "dayjs";
import { ShiftTimingsInfo } from "Models/Shift";
import { getRandomInt } from "utils/random";
import Table from "Components/Common/Table";

const OperatorReport = (props: any) => {
  document.title = "Operator Report | FMS Live";

  const dispatch: any = useDispatch();

  const [searchTerm, setSearchTerm] = useState<string>("");

  const opReportProperties = createSelector(
    (state: any) => state.OperatorReport,
    (operatorReport) => ({
      opReportData: operatorReport ? operatorReport.data : [],
      total: operatorReport ? operatorReport.total : 0,
      loading: operatorReport ? operatorReport.loading : true,
    })
  );

  let { opReportData } = useSelector(opReportProperties);

  const [timeRange, setTimeRange] = useState("CURRENT_SHIFT");
  const [shiftInfo, setShiftInfo] = useState(shiftTimings());

  useEffect(() => {
    if (timeRange === "CURRENT_SHIFT") {
      let currentShiftInfo = shiftTimings();
      setShiftInfo((prevState) => {
        return {
          ...prevState,
          ...currentShiftInfo,
        };
      });
    } else if (timeRange === "PREVIOUS_SHIFT") {
      let prevShiftInfo = shiftTimings(shiftInfo.start.subtract(2, "hours"));
      setShiftInfo((prevState) => {
        return {
          ...prevState,
          ...prevShiftInfo,
        };
      });
    }
  }, [timeRange]);

  const onShiftDateChange = (date: Dayjs): void => {
    const newShiftTimings: ShiftTimingsInfo = shiftTimingsByDateandShift(
      date.format("YYYY-MM-DD"),
      shiftInfo.shift
    );
    setShiftInfo((prevState: ShiftTimingsInfo) => {
      return {
        ...prevState,
        ...newShiftTimings,
      };
    });
  };

  const onShiftChange = (shift: string): void => {
    const newShiftTimings: ShiftTimingsInfo = shiftTimingsByDateandShift(
      shiftInfo.shiftDate,
      shift
    );
    setShiftInfo((prevState: ShiftTimingsInfo) => {
      return {
        ...prevState,
        ...newShiftTimings,
      };
    });
  };

  useEffect(() => {
    //dispatch(getTonnesMoved(1)); // Dispatch action to fetch data on component mount
  }, [dispatch]);

  const columns = useMemo(
    () => [
      {
        title: "Operator Name",
        dataIndex: "operatorName",
        key: "operatorName",
        dataType: "string",
        align: "center",
        fixed: "left",
      },
      {
        title: "Equipment",
        dataIndex: "vehicleName",
        key: "vehicleName",
        dataType: "string",
        align: "center",
        fixed: "left",
      },
      {
        title: "Status",
        dataIndex: "status",
        key: "status",
        dataType: "string",
        align: "center",
        render: (text: any, record: any) => {
          const displayContent = getContentByState(record.status);
          return (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "left",
              }}
            >
              <span
                style={{
                  height: "8px",
                  width: "8px",
                  backgroundColor: displayContent.color,
                  borderRadius: "50%",
                  fontSize: "1px",
                }}
              ></span>
              <span className="text-center px-2">
                {displayContent.displayState}
              </span>
            </div>
          );
        },
      },
      {
        title: "Active Hours",
        dataIndex: "active",
        key: "active",
        dataType: "string",
        align: "center",
      },
      {
        title: "Standby Hours",
        dataIndex: "standby",
        key: "standby",
        dataType: "string",
        align: "center",
      },
      {
        title: "Idle Hours",
        dataIndex: "idle",
        key: "idle",
        dataType: "string",
        align: "center",
      },
      {
        title: "Operation Delay Hours",
        dataIndex: "delay",
        key: "delay",
        dataType: "string",
        align: "center",
      },
      // {
      //   title: "Tonnes (Actual)",
      //   dataIndex: "actualTonnes",
      //   key: "actualTonnes",
      //   dataType: "number",
      //   align: "center",
      //   render: ((text: any, record:any) =>
      //     <div style={{ textAlign: 'center' }}>{record.actualTonnes}</div>
      //   )
      // },
      {
        title: "Tonnes (Actual / Planned)",
        dataIndex: "plannedTonnes",
        key: "plannedTonnes",
        dataType: "string",
        align: "center",
        render: (text: any, record: any) => (
          <div className="text-center">{record.plannedTonnes}</div>
        ),
      },
      {
        title: "Loads (Actual / Planned)",
        dataIndex: "actualLoads",
        key: "actualLoads",
        dataType: "string",
        align: "center",
      },
      // {
      //   title: "Loads (Planned)",
      //   dataIndex: "plannedLoads",
      //   key: "plannedLoads",
      //   dataType: "number",
      //   align: "center",
      //   render: ((text: any, record: any) =>
      //     <div style={{ textAlign: 'center' }}>{record.plannedLoads}</div>
      //   )
      // },
    ],
    []
  );

  opReportData = [
    {
      operatorName: "Paul",
      vehicleName: "DT101",
      status: "ACTIVE",
      active: "0" + getRandomInt(0, 9) + ":" + getRandomInt(10, 55),
      standby: "0" + getRandomInt(0, 9) + ":" + getRandomInt(10, 55),
      idle: "0" + getRandomInt(0, 9) + ":" + getRandomInt(10, 55),
      delay: "0" + getRandomInt(0, 9) + ":" + getRandomInt(10, 55),
      actualTonnes: 2765.34,
      plannedTonnes: "3000/2565",
      actualLoads: "35/45",
      plannedLoads: 35,
    },
    {
      operatorName: "John Shein",
      vehicleName: "DT102",
      status: "DOWN",
      active: "0" + getRandomInt(0, 9) + ":" + getRandomInt(10, 55),
      standby: "0" + getRandomInt(0, 9) + ":" + getRandomInt(10, 55),
      idle: "0" + getRandomInt(0, 9) + ":" + getRandomInt(10, 55),
      delay: "0" + getRandomInt(0, 9) + ":" + getRandomInt(10, 55),
      actualTonnes: 2765.34,
      plannedTonnes: "3000/2765",
      actualLoads: "35/45",
      plannedLoads: 35,
    },
    {
      operatorName: "Liam",
      vehicleName: "DT103",
      status: "STANDBY",
      active: "0" + getRandomInt(0, 9) + ":" + getRandomInt(10, 55),
      standby: "0" + getRandomInt(0, 9) + ":" + getRandomInt(10, 55),
      idle: "0" + getRandomInt(0, 9) + ":" + getRandomInt(10, 55),
      delay: "0" + getRandomInt(0, 9) + ":" + getRandomInt(10, 55),
      actualTonnes: 2765.34,
      plannedTonnes: "3000/3125",
      actualLoads: "35/45",
      plannedLoads: 35,
    },
    {
      operatorName: "Noah",
      vehicleName: "DT104",
      status: "STANDBY",
      active: "0" + getRandomInt(0, 9) + ":" + getRandomInt(10, 55),
      standby: "0" + getRandomInt(0, 9) + ":" + getRandomInt(10, 55),
      idle: "0" + getRandomInt(0, 9) + ":" + getRandomInt(10, 55),
      delay: "0" + getRandomInt(0, 9) + ":" + getRandomInt(10, 55),
      actualTonnes: 2765.34,
      plannedTonnes: "3000/2465",
      actualLoads: "35/45",
      plannedLoads: 35,
    },
    {
      operatorName: "Jack",
      vehicleName: "DT105",
      status: "DELAY",
      active: "0" + getRandomInt(0, 9) + ":" + getRandomInt(10, 55),
      standby: "0" + getRandomInt(0, 9) + ":" + getRandomInt(10, 55),
      idle: "0" + getRandomInt(0, 9) + ":" + getRandomInt(10, 55),
      delay: "0" + getRandomInt(0, 9) + ":" + getRandomInt(10, 55),
      actualTonnes: 2765.34,
      plannedTonnes: "3000/2685",
      actualLoads: "35/45",
      plannedLoads: 35,
    },
    {
      operatorName: "William",
      vehicleName: "DT106",
      status: "STANDBY",
      active: "0" + getRandomInt(0, 9) + ":" + getRandomInt(10, 55),
      standby: "0" + getRandomInt(0, 9) + ":" + getRandomInt(10, 55),
      idle: "0" + getRandomInt(0, 9) + ":" + getRandomInt(10, 55),
      delay: "0" + getRandomInt(0, 9) + ":" + getRandomInt(10, 55),
      actualTonnes: 2765.34,
      plannedTonnes: "3000/2765",
      actualLoads: "35/45",
      plannedLoads: 35,
    },
    {
      operatorName: "James",
      vehicleName: "DT107",
      status: "DOWN",
      active: "0" + getRandomInt(0, 9) + ":" + getRandomInt(10, 55),
      standby: "0" + getRandomInt(0, 9) + ":" + getRandomInt(10, 55),
      idle: "0" + getRandomInt(0, 9) + ":" + getRandomInt(10, 55),
      delay: "0" + getRandomInt(0, 9) + ":" + getRandomInt(10, 55),
      actualTonnes: 2765.34,
      plannedTonnes: "3000/2945",
      actualLoads: "35/45",
      plannedLoads: 35,
    },
    {
      operatorName: "Oliver",
      vehicleName: "DT108",
      status: "DOWN",
      active: "0" + getRandomInt(0, 9) + ":" + getRandomInt(10, 55),
      standby: "0" + getRandomInt(0, 9) + ":" + getRandomInt(10, 55),
      idle: "0" + getRandomInt(0, 9) + ":" + getRandomInt(10, 55),
      delay: "0" + getRandomInt(0, 9) + ":" + getRandomInt(10, 55),
      actualTonnes: 2765.34,
      plannedTonnes: "3000/2685",
      actualLoads: "35/45",
      plannedLoads: 35,
    },
    {
      operatorName: "Smith",
      vehicleName: "DT109",
      status: "DELAY",
      active: "0" + getRandomInt(0, 9) + ":" + getRandomInt(10, 55),
      standby: "0" + getRandomInt(0, 9) + ":" + getRandomInt(10, 55),
      idle: "0" + getRandomInt(0, 9) + ":" + getRandomInt(10, 55),
      delay: "0" + getRandomInt(0, 9) + ":" + getRandomInt(10, 55),
      actualTonnes: 2765.34,
      plannedTonnes: "3000/2765",
      actualLoads: "35/45",
      plannedLoads: 35,
    },
    {
      operatorName: "Jones",
      vehicleName: "DT110",
      status: "DOWN",
      active: "0" + getRandomInt(0, 9) + ":" + getRandomInt(10, 55),
      standby: "0" + getRandomInt(0, 9) + ":" + getRandomInt(10, 55),
      idle: "0" + getRandomInt(0, 9) + ":" + getRandomInt(10, 55),
      delay: "0" + getRandomInt(0, 9) + ":" + getRandomInt(10, 55),
      actualTonnes: 2765.34,
      plannedTonnes: "4000/3765",
      actualLoads: "35/45",
      plannedLoads: 35,
    },
    {
      operatorName: "Brown",
      vehicleName: "DT111",
      status: "DOWN",
      active: "0" + getRandomInt(0, 9) + ":" + getRandomInt(10, 55),
      standby: "0" + getRandomInt(0, 9) + ":" + getRandomInt(10, 55),
      idle: "0" + getRandomInt(0, 9) + ":" + getRandomInt(10, 55),
      delay: "0" + getRandomInt(0, 9) + ":" + getRandomInt(10, 55),
      actualTonnes: 2765,
      plannedTonnes: "3000/2765",
      actualLoads: "35/45",
      plannedLoads: 35,
    },
    {
      operatorName: "Katie",
      vehicleName: "DT112",
      status: "STANDBY",
      active: "0" + getRandomInt(0, 9) + ":" + getRandomInt(10, 55),
      standby: "0" + getRandomInt(0, 9) + ":" + getRandomInt(10, 55),
      idle: "0" + getRandomInt(0, 9) + ":" + getRandomInt(10, 55),
      delay: "0" + getRandomInt(0, 9) + ":" + getRandomInt(10, 55),
      actualTonnes: 3965,
      plannedTonnes: "3965.34/2765",
      actualLoads: "35/45",
      plannedLoads: 35,
    },
  ];

  const filteredData = useMemo(() => {
    if (!searchTerm) return opReportData;
    return opReportData.filter((item) =>
      columns.some((col) =>
        String(item[col.key]).toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [opReportData, searchTerm, columns]);

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid>
          <Breadcrumb title="Dashboard" breadcrumbItem="Operator Report" />
          <Row className="mb-3">
            <Col className="d-flex flex-row-reverse">
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
                  <Row>
                    <Col sm={4}>
                      <Input
                        placeholder="Search..."
                        value={searchTerm}
                        allowClear
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{ marginBottom: 16 }}
                      />
                    </Col>
                  </Row>
                  <div className="mt-3">
                    <Table
                      columns={columns}
                      data={filteredData || []}
                      paginationPageSize={10}
                      scroll={{ x: "max-content" }}
                    />
                  </div>
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
