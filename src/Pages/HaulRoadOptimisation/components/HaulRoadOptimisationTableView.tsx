import React, { useMemo, useState } from "react";
import {
  Card,
  CardBody,
  Button,
  Dropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
} from "reactstrap";
import { Input } from "antd";
import { getRandomInt } from "utils/random";
import { SearchDropdown } from "Components/Common/Dropdown";
import { SearchOutlined, UploadOutlined } from "@ant-design/icons";
import "../styles/tableView.css";
import Table from "Components/Common/Table";
import { getContentByState } from "utils/common";

const columns = [
  {
    title: "Vehicle Name",
    dataIndex: "vehicleName",
    key: "vehicleName",
    dataType: "string",
    align: "center",
    fixed: "left",
  },
  {
    title: "Operator Name",
    dataIndex: "operatorName",
    key: "operatorName",
    dataType: "string",
    align: "center",
  },
  {
    title: "Status",
    dataIndex: "status",
    key: "status",
    dataType: "string",
    align: "center",
    render: (text) => {
      const displayContent = getContentByState(text);
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
              color: "transparent",
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
    title: "Dump Location",
    dataIndex: "dumpLocation",
    key: "dumpLocation",
    dataType: "number",
    align: "center",
  },
  {
    title: "Active Hours",
    dataIndex: "activeHours",
    key: "activeHours",
    dataType: "string",
    align: "center",
  },
  {
    title: "Target Hours",
    dataIndex: "targetHours",
    key: "targetHours",
    dataType: "string",
    align: "center",
  },
  {
    title: "Empty Run",
    dataIndex: "emptyRun",
    key: "emptyRun",
    dataType: "string",
    align: "center",
  },
  {
    title: "Waiting Load Time",
    dataIndex: "waitingLoadTime",
    key: "waitingLoadTime",
    dataType: "string",
    align: "center",
  },
  {
    title: "Loading Time",
    dataIndex: "loadingTime",
    key: "loadingTime",
    dataType: "string",
    align: "center",
  },
  {
    title: "Hauling Time",
    dataIndex: "haulingTime",
    key: "haulingTime",
    dataType: "string",
    align: "center",
  },
  {
    title: "Avg Cycle Time",
    dataIndex: "avgCycleTime",
    key: "avgCycleTime",
    dataType: "string",
    align: "center",
  },
  {
    title: "Payload",
    dataIndex: "payload",
    key: "payload",
    dataType: "number",
    align: "center",
  },
  {
    title: "Material Type",
    dataIndex: "materialType",
    key: "materialType",
    dataType: "string",
    align: "center",
  },
  {
    title: "Current Load(Tonnes)",
    dataIndex: "currentLoad",
    key: "currentLoad",
    dataType: "number",
    align: "center",
  },
  {
    title: "Maximum Load(Tonnes)",
    dataIndex: "maximumLoad",
    key: "maximumLoad",
    dataType: "number",
    align: "center",
  },
  {
    title: "Speed",
    dataIndex: "speed",
    key: "speed",
    dataType: "string",
    align: "center",
  },
  {
    title: "Engine RPM",
    dataIndex: "engineRPM",
    key: "engineRPM",
    dataType: "number",
    align: "center",
  },
  {
    title: "Travel Time",
    dataIndex: "travelTime",
    key: "travelTime",
    dataType: "string",
    align: "center",
  },
  {
    title: "Pitch",
    dataIndex: "pitch",
    key: "pitch",
    dataType: "number",
    align: "center",
  },
  {
    title: "Alcometer Degrees",
    dataIndex: "alcometerDegrees",
    key: "alcometerDegrees",
    dataType: "number",
    align: "center",
  },
  {
    title: "Distance",
    dataIndex: "distance",
    key: "distance",
    dataType: "number",
    align: "center",
  },
  {
    title: "Altitude Change",
    dataIndex: "altitudeChange",
    key: "altitudeChange",
    dataType: "number",
    align: "center",
  },
  {
    title: "Fuel Rate",
    dataIndex: "fuelRate",
    key: "fuelRate",
    dataType: "number",
    align: "center",
  },
];

const HaulRoadOptimisationTableView = () => {
  const [globalFilter, setGlobalFilter] = useState<string>("");
  const statusOptions = ["Active", "Standby", "Delayed", "Down"];
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const toggle = () => setDropdownOpen((prevState) => !prevState);

  const tableData = useMemo(
    () => [
      {
        vehicleName: "DT101",
        operatorName: "James Taylor",
        status: statusOptions[getRandomInt(0, statusOptions.length - 1)],
        dumpLocation: 2650,
        activeHours: "12:30",
        targetHours: "13:00",
        emptyRun: "00:15",
        waitingLoadTime: "00:05",
        loadingTime: "00:10",
        haulingTime: "00:25",
        avgCycleTime: "00:55",
        payload: 65,
        materialType: "Ore",
        currentLoad: 70,
        maximumLoad: 80,
        speed: "22.3 km/h",
        engineRPM: 1500,
        travelTime: "00:45",
        pitch: "5",
        alcometerDegrees: 1,
        distance: 8,
        altitudeChange: 10,
        fuelRate: 20,
      },
      {
        vehicleName: "DT102",
        operatorName: "Maria Thompson",
        status: statusOptions[getRandomInt(0, statusOptions.length - 1)],
        dumpLocation: 2900,
        activeHours: "09:15",
        targetHours: "10:00",
        emptyRun: "00:10",
        waitingLoadTime: "00:20",
        loadingTime: "00:12",
        haulingTime: "00:30",
        avgCycleTime: "01:02",
        payload: 72,
        materialType: "Rock",
        currentLoad: 75,
        maximumLoad: 90,
        speed: "18.6 km/h",
        engineRPM: 1200,
        travelTime: "01:10",
        pitch: "3",
        alcometerDegrees: 0,
        distance: 10,
        altitudeChange: 15,
        fuelRate: 18,
      },
      {
        vehicleName: "DT103",
        operatorName: "William Johnson",
        status: statusOptions[getRandomInt(0, statusOptions.length - 1)],
        dumpLocation: 2750,
        activeHours: "11:00",
        targetHours: "11:30",
        emptyRun: "00:20",
        waitingLoadTime: "00:10",
        loadingTime: "00:08",
        haulingTime: "00:22",
        avgCycleTime: "01:00",
        payload: 68,
        materialType: "Coal",
        currentLoad: 64,
        maximumLoad: 85,
        speed: "21.1 km/h",
        engineRPM: 1300,
        travelTime: "00:52",
        pitch: "7",
        alcometerDegrees: 2,
        distance: 7,
        altitudeChange: 12,
        fuelRate: 22,
      },
      {
        vehicleName: "DT104",
        operatorName: "Sarah Parker",
        status: statusOptions[getRandomInt(0, statusOptions.length - 1)],
        dumpLocation: 2800,
        activeHours: "10:45",
        targetHours: "11:20",
        emptyRun: "00:18",
        waitingLoadTime: "00:08",
        loadingTime: "00:11",
        haulingTime: "00:29",
        avgCycleTime: "00:59",
        payload: 70,
        materialType: "Gravel",
        currentLoad: 76,
        maximumLoad: 92,
        speed: "20.8 km/h",
        engineRPM: 1400,
        travelTime: "01:05",
        pitch: "4",
        alcometerDegrees: 0,
        distance: 9,
        altitudeChange: 8,
        fuelRate: 19,
      },
      {
        vehicleName: "DT105",
        operatorName: "David Lee",
        status: statusOptions[getRandomInt(0, statusOptions.length - 1)],
        dumpLocation: 3000,
        activeHours: "08:50",
        targetHours: "09:15",
        emptyRun: "00:12",
        waitingLoadTime: "00:15",
        loadingTime: "00:14",
        haulingTime: "00:32",
        avgCycleTime: "01:03",
        payload: 74,
        materialType: "Sand",
        currentLoad: 79,
        maximumLoad: 95,
        speed: "19.5 km/h",
        engineRPM: 1600,
        travelTime: "00:58",
        pitch: "6",
        alcometerDegrees: 1,
        distance: 6,
        altitudeChange: 5,
        fuelRate: 17,
      },
    ],
    []
  );

  const filters = {
    model: [
      {
        label: "HD1500",
        value: "HD1500",
      },
      {
        label: "HD785",
        value: "HD785",
      },
    ],
    fleet: [
      {
        label: "Fleet1",
        value: "TD001",
      },
      {
        label: "Fleet2",
        value: "TD002",
      },
      {
        label: "Fleet3",
        value: "TD003",
      },
    ],
  };

  return (
    <Card className="haulroad-summary" id="haulroad-summary-tableview">
      <CardBody>
        <div className="d-flex justify-content-between align-items-center">
          <div className="haulroad-summary-title">Haul Road Optimization</div>
          <div className="d-flex justify-content-end align-items-center gap-3">
            <SearchDropdown itemsGroup={filters} />
            <div className="export">
              <Button>
                Export
                <UploadOutlined />
              </Button>
            </div>
            <Dropdown isOpen={dropdownOpen} toggle={toggle}>
              <DropdownToggle caret size="lg">
                Show/Hide Columns
              </DropdownToggle>
              <DropdownMenu>
                <DropdownItem>Day</DropdownItem>
                <DropdownItem>Night</DropdownItem>
              </DropdownMenu>
            </Dropdown>
            <Input
              prefix={<SearchOutlined />}
              value={globalFilter}
              onClick={(e) => e.stopPropagation()}
              onChange={(e) => setGlobalFilter(e.target.value)}
              className="trucking-summary-search"
              placeholder="Search"
            />
          </div>
        </div>
        <div className="mt-3">
          <Table
            columns={columns}
            data={tableData}
            paginationPageSize={5}
            scroll={{ x: "max-content" }}
          />
        </div>
      </CardBody>
    </Card>
  );
};

export default HaulRoadOptimisationTableView;
