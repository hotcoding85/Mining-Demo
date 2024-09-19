import React, { useMemo, useState } from "react";
import { getRandomInt } from "utils/random";
import {
  Card,
  CardBody,
  Table,
  Button,
  Dropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
} from "reactstrap";
import { Pagination, PaginationProps, Input } from "antd";
import { SearchDropdown } from "Components/Common/Dropdown";
import { SearchOutlined, UploadOutlined } from "@ant-design/icons";
import "../styles/tableView.css";

const TableHeaders = [
  "Vehicle Name",
  "Operator Name",
  "Status",
  "Dump Location",
  "Active Hours",
  "Target Hours",
  "Empty Run",
  "Waiting Load Time",
  "Loading Time",
  "Hauling Time",
  "Avg Cycle Time",
  "Payload",
  "Material Type",
  "Current Load(Tonnes)",
  "MaximumLoad(Tonnes)",
  "Speed",
  "Engine RPM",
  "Travel Time",
  "Pitch",
  "Alcometer Degrees",
  "Distance",
  "Altitude Change",
  "Fuel Rate",
];

interface TruckLoadOptimisationTableRowProps {
  vehicleName: string;
  operatorName: string;
  status: string;
  dumpLocation: number;
  activeHours: string;
  targetHours: string;
  emptyRun: string;
  waitingLoadTime: string;
  loadingTime: string;
  haulingTime: string;
  avgCycleTime: string;
  payload: number;
  materialType: string;
  currentLoad: number;
  maximumLoad: number;
  speed: string;
  engineRPM: number;
  travelTime: string;
  pitch: string;
  alcometerDegrees: number;
  distance: number;
  altitudeChange: number;
  fuelRate: number;
}

const statusColors = {
  Active: "#389E0D",
  Standby: "#FAAD14",
  Delayed: "#722ED1",
  Down: "#CF1322",
};

const TruckLoadOptimisationTableRow: React.FC<
  TruckLoadOptimisationTableRowProps
> = (props) => {
  const getStatusDot = (status: string) => {
    const color = statusColors[status] || "gray";
    return (
      <div style={{ display: "flex", alignItems: "center" }}>
        <span
          style={{
            width: 10,
            height: 10,
            borderRadius: "50%",
            backgroundColor: color,
            display: "inline-block",
            marginRight: 8,
          }}
        ></span>
        <span>{status}</span>
      </div>
    );
  };

  return (
    <tr>
      <td width={104}>
        <div>{props.vehicleName}</div>
      </td>
      <td width={104}>
        <div>{props.operatorName}</div>
      </td>
      <td width={104}>
        <div>{getStatusDot(props.status)}</div>
      </td>
      <td width={104}>
        <div>{props.dumpLocation}</div>
      </td>
      <td width={104}>
        <div>{props.activeHours}</div>
      </td>
      <td width={104}>
        <div>{props.targetHours}</div>
      </td>
      <td width={104}>
        <div>{props.emptyRun}</div>
      </td>
      <td width={104}>
        <div>{props.waitingLoadTime}</div>
      </td>
      <td width={104}>
        <div>{props.loadingTime}</div>
      </td>
      <td width={104}>
        <div>{props.haulingTime}</div>
      </td>
      <td width={104}>
        <div>{props.avgCycleTime}</div>
      </td>
      <td width={104}>
        <div>{props.payload}</div>
      </td>
      <td width={104}>
        <div>{props.materialType}</div>
      </td>
      <td width={104}>
        <div>{props.currentLoad}</div>
      </td>
      <td width={104}>
        <div>{props.maximumLoad}</div>
      </td>
      <td width={104}>
        <div>{props.speed}</div>
      </td>
      <td width={104}>
        <div>{props.engineRPM}</div>
      </td>
      <td width={104}>
        <div>{props.travelTime}</div>
      </td>
      <td width={104}>
        <div>{props.pitch}</div>
      </td>
      <td width={104}>
        <div>{props.alcometerDegrees}</div>
      </td>
      <td width={104}>
        <div>{props.distance}</div>
      </td>
      <td width={104}>
        <div>{props.altitudeChange}</div>
      </td>
      <td width={104}>
        <div>{props.fuelRate}</div>
      </td>
    </tr>
  );
};

const TruckLoadOptimisationTableView = () => {
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

  const onChange: PaginationProps["onChange"] = (pageNumber) => {
    console.log("Page: ", pageNumber);
  };
  return (
    <Card className="haulroad-summary" id="haulroad-summary-tableview">
      <CardBody>
        <div className="d-flex justify-content-between align-items-center">
          <div className="haulroad-summary-title">Truck Load Optimization</div>
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
          <Table borderless responsive className="haulroad-summary-table">
            <thead>
              <tr>
                {TableHeaders.map((header) => (
                  <th style={{ justifyContent: "start" }}>{header}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tableData.map((row) => (
                <TruckLoadOptimisationTableRow {...row} />
              ))}
            </tbody>
          </Table>
        </div>
        <div className="d-flex justify-content-end align-items-center mt-3">
          <Pagination
            showQuickJumper
            defaultCurrent={2}
            total={500}
            onChange={onChange}
          />
        </div>
      </CardBody>
    </Card>
  );
};

export default TruckLoadOptimisationTableView;
