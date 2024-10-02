import React, { useEffect, useMemo, useState } from "react";
import { Card, CardBody, Col, Container, Row } from "reactstrap";
import Breadcrumb from "Components/Common/Breadcrumb";
import { useDispatch, useSelector } from "react-redux";
import { } from "../../Helpers/api_events_helper";
import {
  Button,
  Checkbox,
  Dropdown,
  Input,
  Segmented,
  Space,
  Tooltip,
} from "antd";
import {
  getContentByState,
  msToTime,
  shiftTimings,
  shiftTimingsByDateandShift,
} from "utils/common";
import { Dayjs } from "dayjs";
import { ShiftTimingsInfo } from "Models/Shift";
import _ from "lodash";
import { EyeOutlined, FilterOutlined, LaptopOutlined } from "@ant-design/icons";
import "./telemetry.css";
import { Link } from "react-router-dom";
import { errorDefinitions } from "./errorDefinitions";
import Table from "Components/Common/Table";

const TelemetryReport = (props: any) => {
  document.title = "Telemetry Report | FMS Live";

  const dispatch: any = useDispatch();

  const opReportData = [
    {
      vehicleName: "EX201",
      vehicleType: "EXCAVATOR",
      status: "ACTIVE",
      synced: 7000,
      rpm: "3500",
      transmission: "N",
      speed: "N/A",
      payload: "86.2",
      engineHours: "12316",
      interval: "195",
      blowPressure: "184",
      oilTemperature: "140",
      oilPressure: "21",
      faultCodes: ["CA271"],
    },
    {
      vehicleName: "DT104",
      vehicleType: "DUMP_TRUCK",
      status: "DELAY",
      synced: 7000,
      rpm: "200",
      transmission: "4",
      speed: "8",
      payload: "N/A",
      engineHours: "48916",
      interval: "503",
      blowPressure: "212",
      oilTemperature: "103",
      oilPressure: "18",
      faultCodes: ["CA272"],
    },
    {
      vehicleName: "DT102",
      vehicleType: "DUMP_TRUCK",
      status: "DOWN",
      synced: 250,
      rpm: "2700",
      transmission: "4",
      speed: "8",
      payload: "N/A",
      engineHours: "48916",
      interval: "503",
      blowPressure: "212",
      oilTemperature: "103",
      oilPressure: "18",
      faultCodes: [],
    },
    {
      vehicleName: "DT102",
      vehicleType: "DUMP_TRUCK",
      status: "DOWN",
      synced: 250,
      rpm: "2700",
      transmission: "4",
      speed: "8",
      payload: "N/A",
      engineHours: "48916",
      interval: "503",
      blowPressure: "212",
      oilTemperature: "103",
      oilPressure: "18",
      faultCodes: ["CA331", "CA432"],
    },
    {
      vehicleName: "DT104",
      vehicleType: "DUMP_TRUCK",
      status: "STANDBY",
      synced: 2500,
      rpm: "200",
      transmission: "4",
      speed: "8",
      payload: "N/A",
      engineHours: "48916",
      interval: "503",
      blowPressure: "212",
      oilTemperature: "103",
      oilPressure: "18",
      faultCodes: ["CA452", "CA697", "CA757"],
    },
    {
      vehicleName: "DT105",
      vehicleType: "DUMP_TRUCK",
      status: "STANDBY",
      synced: 3500,
      rpm: "180",
      transmission: "4",
      speed: "18",
      payload: "35",
      engineHours: "28816",
      interval: "503",
      blowPressure: "212",
      oilTemperature: "103",
      oilPressure: "18",
      faultCodes: ["CA271", "CA132"],
    },
    {
      vehicleName: "DT106",
      vehicleType: "DUMP_TRUCK",
      status: "STANDBY",
      synced: 2500,
      rpm: "200",
      transmission: "4",
      speed: "8",
      payload: "N/A",
      engineHours: "48916",
      interval: "503",
      blowPressure: "212",
      oilTemperature: "103",
      oilPressure: "18",
      faultCodes: ["CA122"],
    },
    {
      vehicleName: "DT107",
      vehicleType: "DUMP_TRUCK",
      status: "STANDBY",
      synced: 2500,
      rpm: "200",
      transmission: "4",
      speed: "8",
      payload: "N/A",
      engineHours: "48916",
      interval: "503",
      blowPressure: "212",
      oilTemperature: "103",
      oilPressure: "18",
      faultCodes: [],
    },
    {
      vehicleName: "DT108",
      vehicleType: "DUMP_TRUCK",
      status: "STANDBY",
      synced: 2500,
      rpm: "200",
      transmission: "4",
      speed: "8",
      payload: "N/A",
      engineHours: "48916",
      interval: "503",
      blowPressure: "212",
      oilTemperature: "103",
      oilPressure: "18",
      faultCodes: ["CA111"],
    },
    {
      vehicleName: "DT109",
      vehicleType: "DUMP_TRUCK",
      status: "STANDBY",
      synced: 2500,
      rpm: "200",
      transmission: "4",
      speed: "8",
      payload: "N/A",
      engineHours: "48916",
      interval: "503",
      blowPressure: "212",
      oilTemperature: "103",
      oilPressure: "18",
      faultCodes: ["CA757"],
    },
    {
      vehicleName: "DT103",
      vehicleType: "DUMP_TRUCK",
      status: "STANDBY",
      synced: 2500,
      rpm: "200",
      transmission: "4",
      speed: "8",
      payload: "N/A",
      engineHours: "48916",
      interval: "503",
      blowPressure: "212",
      oilTemperature: "103",
      oilPressure: "18",
      faultCodes: ["CA442"],
    },
    {
      vehicleName: "DT101",
      vehicleType: "DUMP_TRUCK",
      status: "STANDBY",
      synced: 2500,
      rpm: "200",
      transmission: "4",
      speed: "8",
      payload: "N/A",
      engineHours: "48916",
      interval: "503",
      blowPressure: "212",
      oilTemperature: "103",
      oilPressure: "18",
      faultCodes: ["CA325", "B@BCNS", "CA449"],
    },
    {
      vehicleName: "DT110",
      vehicleType: "DUMP_TRUCK",
      status: "STANDBY",
      synced: 2500,
      rpm: "200",
      transmission: "4",
      speed: "8",
      payload: "N/A",
      engineHours: "48916",
      interval: "503",
      blowPressure: "212",
      oilTemperature: "103",
      oilPressure: "18",
      faultCodes: ["CA689"],
    },
    {
      vehicleName: "DT111",
      vehicleType: "DUMP_TRUCK",
      status: "STANDBY",
      synced: 2500,
      rpm: "200",
      transmission: "4",
      speed: "8",
      payload: "N/A",
      engineHours: "48916",
      interval: "503",
      blowPressure: "212",
      oilTemperature: "103",
      oilPressure: "18",
      faultCodes: ["CA331"],
    },
    {
      vehicleName: "DT112",
      vehicleType: "DUMP_TRUCK",
      status: "STANDBY",
      synced: 2500,
      rpm: "200",
      transmission: "4",
      speed: "8",
      payload: "N/A",
      engineHours: "48916",
      interval: "503",
      blowPressure: "212",
      oilTemperature: "103",
      oilPressure: "18",
      faultCodes: ["CA274"],
    },
    {
      vehicleName: "DT113",
      vehicleType: "DUMP_TRUCK",
      status: "STANDBY",
      synced: 2500,
      rpm: "200",
      transmission: "4",
      speed: "8",
      payload: "N/A",
      engineHours: "48916",
      interval: "503",
      blowPressure: "212",
      oilTemperature: "103",
      oilPressure: "18",
      faultCodes: ["CA323"],
    },
    {
      vehicleName: "DT114",
      vehicleType: "DUMP_TRUCK",
      status: "STANDBY",
      synced: 2500,
      rpm: "200",
      transmission: "4",
      speed: "8",
      payload: "N/A",
      engineHours: "48916",
      interval: "503",
      blowPressure: "212",
      oilTemperature: "103",
      oilPressure: "18",
      faultCodes: ["CA132"],
    },
    {
      vehicleName: "DT115",
      vehicleType: "DUMP_TRUCK",
      status: "STANDBY",
      synced: 2500,
      rpm: "200",
      transmission: "4",
      speed: "8",
      payload: "N/A",
      engineHours: "48916",
      interval: "503",
      blowPressure: "212",
      oilTemperature: "103",
      oilPressure: "18",
      faultCodes: ["CA238", "CA273", "CA342"],
    },
    {
      vehicleName: "EX03",
      vehicleType: "EXCAVATOR",
      status: "DOWN",
      synced: 2900,
      rpm: "200",
      transmission: "4",
      speed: "8",
      payload: "N/A",
      engineHours: "48916",
      interval: "503",
      blowPressure: "212",
      oilTemperature: "103",
      oilPressure: "18",
      faultCodes: ["CA123"],
    },
    {
      vehicleName: "DT115",
      vehicleType: "DUMP_TRUCK",
      status: "STANDBY",
      synced: 2500,
      rpm: "200",
      transmission: "4",
      speed: "8",
      payload: "N/A",
      engineHours: "48916",
      interval: "503",
      blowPressure: "212",
      oilTemperature: "103",
      oilPressure: "18",
      faultCodes: ["CA234"],
    },
    {
      vehicleName: "DT117",
      vehicleType: "DUMP_TRUCK",
      status: "STANDBY",
      synced: 2500,
      rpm: "200",
      transmission: "4",
      speed: "8",
      payload: "N/A",
      engineHours: "48916",
      interval: "503",
      blowPressure: "212",
      oilTemperature: "103",
      oilPressure: "18",
      faultCodes: ["CA115", "CA115"],
    },
    {
      vehicleName: "DT116",
      vehicleType: "DUMP_TRUCK",
      status: "STANDBY",
      synced: 2500,
      rpm: "200",
      transmission: "4",
      speed: "8",
      payload: "N/A",
      engineHours: "48916",
      interval: "503",
      blowPressure: "212",
      oilTemperature: "103",
      oilPressure: "18",
      faultCodes: ["CA432", "CA441"],
    },
  ];

  const allColumns = useMemo(
    () => [
      {
        title: "Machine ID",
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
        dataType: "",
        render: (value) => {
          if (!value) return "";
          const displayContent = getContentByState(value);
          return (
            <Space style={{ alignItems: "baseline" }}>
              <div
                style={{
                  height: "8px",
                  width: "8px",
                  color: "transparent",
                  backgroundColor: displayContent.color,
                  borderRadius: "50%",
                  fontSize: "1px",
                }}
              ></div>
              <div style={{ textAlign: "center" }}>
                {displayContent.displayState}
              </div>
            </Space>
          );
        },
      },
      {
        title: "Synced",
        dataIndex: "synced",
        key: "synced",
        dataType: "number",
        render: (text) => {
          const syncTimeDiff: any = msToTime(text);
          const displayTime =
            syncTimeDiff.hours === 0
              ? `${syncTimeDiff.minutes}m`
              : `${syncTimeDiff.hours}h${syncTimeDiff.minutes}m`;
          return (
            <Space>
              {
                <LaptopOutlined
                  style={{
                    color: getColorBySyncTime(text),
                  }}
                />
              }
              <div
                style={{
                  textAlign: "center",
                  color: getColorBySyncTime(text),
                }}
              >
                {displayTime}
              </div>
            </Space>
          );
        },
      },
      {
        title: "Fault Codes",
        dataIndex: "faultCodes",
        key: "faultCodes",
        dataType: "",
        render: (faultCodes) => FaultCodeCell(faultCodes),
      },
      {
        title: "Engine RPM",
        dataIndex: "rpm",
        key: "rpm",
        dataType: "number",
        align: "center",
      },

      {
        title: "Current Transmission",
        dataIndex: "transmission",
        key: "transmission",
        dataType: "number",
        align: "center",
      },
      {
        title: "Wheel Speed \n (Kmph)",
        dataIndex: "speed",
        key: "speed",
        dataType: "number",
        align: "center",
      },
      {
        title: "Payload \n (Tonnes)",
        dataIndex: "payload",
        key: "payload",
        dataType: "number",
        align: "center",
      },
      {
        title: "Engine Hours",
        dataIndex: "engineHours",
        key: "engineHours",
        dataType: "number",
        align: "center",
      },
      {
        title: "Service Interval",
        dataIndex: "interval",
        key: "interval",
        dataType: "number",
        align: "center",
      },
      {
        title: "Blow by Pressure \n (kPa)",
        dataIndex: "blowPressure",
        key: "blowPressure",
        dataType: "number",
        align: "center",
      },
      {
        title: "Oil Temperature \n (°C)",
        dataIndex: "oilTemperature",
        key: "oilTemperature",
        dataType: "number",
        align: "center",
      },
      {
        title: "Oil Pressure\n (kPa)",
        dataIndex: "oilPressure",
        key: "oilPressure",
        dataType: "number",
        align: "center",
      },
      {
        title: "Actions",
        dataIndex: "actions",
        key: "actions",
        dataType: "",
        align: "center",
        render: (_, record) => (
          <Link to={"/telemetry-details?id=" + record.vehicleName}>
            <EyeOutlined />
          </Link>
        ),
      },
    ],
    []
  );

  const [timeRange, setTimeRange] = useState("CURRENT_SHIFT");
  const [shiftInfo, setShiftInfo] = useState(shiftTimings());
  const [filter, setFilter] = useState<string>("All Equipment");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [visibleColumns, setVisibleColumns] = useState({
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
    actions: true,
  });
  const [columns, setColumns] = useState(
    allColumns.filter((column) => visibleColumns[column.key!])
  );

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

  const onEquipmentTypeSelect = (filterType) => {
    setFilter(filterType);
  };

  const filteredReportData = useMemo(() => {
    if (!searchTerm) return opReportData;
    return opReportData?.filter((item) =>
      columns?.some((col) =>
        String(item[col.key])
          .toLowerCase()
          .includes(searchTerm.toLowerCase())
      )
    );
  }, [opReportData, searchTerm]);

  useEffect(() => {
    //dispatch(getTonnesMoved(1)); // Dispatch action to fetch data on component mount
  }, [dispatch]);

  const onVisibleColumnsChange = (value) => {
    visibleColumns[value] = !visibleColumns[value];
    visibleColumns["actions"] = true;
    visibleColumns["vehicleName"] = true;
    visibleColumns["synced"] = true;

    setVisibleColumns(visibleColumns);
    setColumns(allColumns.filter((column) => visibleColumns[column.key!]));
  };

  const handleSelectAll = () => {
    const updatedState: any = Object.keys(visibleColumns).reduce((acc, key) => {
      acc[key] = true;
      return acc;
    }, {});
    setVisibleColumns(updatedState);
    setColumns(allColumns);
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
  };

  const Chip = ({ label }) => {
    let getTitle = errorDefinitions[label];
    return (
      <Tooltip title={getTitle}>
        <span
          style={{
            display: "inline-block",
            padding: "5px 10px",
            margin: "2px",
            borderRadius: "16px",
            backgroundColor: "red",
            color: "white",
            fontSize: "12px",
            width: "72px",
            textAlign: "center",
            alignContent: "center",
          }}
        >
          {" "}
          {label}
        </span>
      </Tooltip>
    );
  };

  const FaultCodeCell = (faultCodes) => {
    return (
      <Space direction="horizontal" style={{ width: "100%" }}>
        {faultCodes && faultCodes.length > 0 ? (
          faultCodes.length === 1 ? (
            <Chip label={faultCodes[0]} />
          ) : (
            <Space>
              <Chip label={faultCodes[0]} />{" "}
              <div style={{ fontSize: "10px" }}>
                + {faultCodes.length - 1} more
              </div>
            </Space>
          )
        ) : (
          ""
        )}
      </Space>
    );
  };

  const getColumnHeaders = () => {
    let children: any = [];
    allColumns.forEach((column) => {
      if (
        column.key != "actions" &&
        column.key != "vehicleName" &&
        column.key != "synced"
      ) {
        children.push({
          key: column.key,
          value: column.key,
          label: column.title,
        });
      }
    });
    return children;
  };

  const items = useMemo(() => [
    {
      label: (
        <Checkbox
          className="checkbox-color"
          checked={Object.values(visibleColumns).every(value => value)}
          onChange={handleSelectAll}
        >
          Select All
        </Checkbox>
      ),
      key: "select-all",
    },
    ...getColumnHeaders().map((option) => ({
      label: (
        <Checkbox
          className="checkbox-color"
          checked={columns.some((col) => col.key === option.value)}
          onChange={() => onVisibleColumnsChange(option.value)}
        >
          {option.label}
        </Checkbox>
      ),
      key: option.label,
    }))
  ], [columns, getColumnHeaders, onVisibleColumnsChange])

  const menuProps = {
    items,
  }

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid>
          <Breadcrumb title="Dashboard" breadcrumbItem="Telemetry Report" />
          <Row className="mb-3">
            <Col xs={2}>
              <Dropdown menu={menuProps}>
                <Button>
                  <Space>
                    <FilterOutlined /> Filter
                  </Space>
                </Button>
              </Dropdown>
            </Col>
            <Col className="d-flex flex-row-reverse">
              <Space>
                <Segmented
                  className="customSegmentLabel customSegmentBackground"
                  value={filter}
                  onChange={(e) => onEquipmentTypeSelect(e)}
                  options={[
                    "All Equipment",
                    { label: "Excavators", value: "EXCAVATOR" },
                    { label: "Trucks", value: "DUMP_TRUCK" },
                    { label: "Loaders", value: "LOADER" },
                    { label: "Drillers", value: "DRILLER" },
                    { label: "Dozers", value: "DOZER" },
                  ]}
                />
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
                  <Row>
                    <Col sm={4}>
                      <Input
                        placeholder="Search..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{ marginBottom: 16 }}
                        allowClear
                      />
                    </Col>
                  </Row>
                  <Table
                    columns={columns}
                    data={filteredReportData || []}
                    paginationPageSize={8}
                    scroll={{ x: "max-content" }}
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
