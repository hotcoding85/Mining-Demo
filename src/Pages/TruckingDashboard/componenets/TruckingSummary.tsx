import React, { useMemo, useState } from "react";
import { Card, CardBody, Table } from "reactstrap";
import { getRandomInt } from "utils/random";
import { Pagination, PaginationProps, DatePicker, Input } from "antd";
import { SearchDropdown } from "Components/Common/Dropdown";
import { SearchOutlined } from "@ant-design/icons";
import CustomDateRangePicker from "Components/Common/DateRangePicker";
import { round2Two } from "utils/common";

const { RangePicker } = DatePicker;

interface TruckingSummaryTableRowProps {
  modelName: string;
  equipmentName: string;
  completed: string;
  actual: number;
  planned: number;
  availability: string;
  standBy: string;
  idel: string;
  idle: string;
  operationalyDelay: string;
  breakdown: string;
  avgLoadPerHour: number;
  tonnesPerHour: number;
  wastedMoved: number;
  tonnesMoved: number;
  avgLoadTime: string;
  plannedLoadTime: string;
  avgCycleTime: string;
  plannedCycleTime: string;
  avgQueueTime: string;
}

const TruckingSummaryTableRow: React.FC<TruckingSummaryTableRowProps> = (
  props
) => {
  return (
    <tr>
      <td width={104}>
        <div>{props.modelName}</div>
      </td>
      <td width={104}>
        <div>{props.equipmentName}</div>
      </td>
      <td width={104}>
        <div>{props.completed}</div>
      </td>
      <td width={104}>
        <div>{props.actual.toLocaleString("US-en")}</div>
      </td>
      <td width={104}>
        <div>{props.planned.toLocaleString("US-en")}</div>
      </td>
      <td width={104}>
        <div>{props.availability}</div>
      </td>
      <td width={104}>
        <div>{props.standBy}</div>
      </td>
      <td width={104}>
        <div>{props.idel}</div>
      </td>
      <td width={104}>
        <div>{props.idle}</div>
      </td>
      <td width={104}>
        <div>{props.operationalyDelay}</div>
      </td>
      <td width={104}>
        <div>{props.breakdown}</div>
      </td>
      <td width={104}>
        <div>{props.avgLoadPerHour}</div>
      </td>
      <td width={104}>
        <div>{props.tonnesPerHour}</div>
      </td>
      <td width={104}>
        <div>{props.wastedMoved}</div>
      </td>
      <td width={104}>
        <div>{props.tonnesMoved}</div>
      </td>
      <td width={104}>
        <div>{props.avgLoadTime}</div>
      </td>
      <td width={104}>
        <div>{props.plannedLoadTime}</div>
      </td>
      <td width={104}>
        <div>{props.avgCycleTime}</div>
      </td>
      <td width={104}>
        <div>{props.plannedCycleTime}</div>
      </td>
      <td width={104}>
        <div>{props.avgQueueTime}</div>
      </td>
    </tr>
  );
};

interface TruckingSummaryProps { }

const TableHeaders = [
  "Model",
  "Equipment Name",
  "Completed",
  "Actual (Tonnes)",
  "Planned (Tonnes)",
  "Active (mins)",
  "Standby (mins)",
  "Idle (mins)",
  "Idle (%)",
  "Operational Delay (mins)",
  "Breakdown (mins)",
  "Avg Load per Hour",
  "Tonnes per Hour",
  "Waste Moved",
  "Tonnes Moved",
  "Avg Load Time",
  "Planned Load Time",
  "Avg Cycle Time",
  "Planned Cycle Time",
  "Avg Queue Time",
];
const TruckingSummary: React.FC<TruckingSummaryProps> = () => {
  const [globalFilter, setGlobalFilter] = useState<string>("");

  const tableData = useMemo(
    () =>
      [...new Array(5)].map((item, key) => ({
        modelName: "HD785",
        equipmentName: "DT10"+(key+1),
        completed: `${getRandomInt(0, 35)}/35`,
        actual: getRandomInt(228129, 228459),
        planned: getRandomInt(500000, 500100),
        availability: '0' + getRandomInt(0, 9) + ':' + getRandomInt(10, 55),
        standBy: '0' + getRandomInt(0, 9) + ':' + getRandomInt(10, 55),
        idel: '0' + getRandomInt(0, 9) + ':' + getRandomInt(10, 55),
        idle: getRandomInt(10, 55)+'%',
        operationalyDelay: '0' + getRandomInt(0, 9) + ':' + getRandomInt(10, 55),
        breakdown: '0' + getRandomInt(0, 9) + ':' + getRandomInt(10, 55),
        avgLoadPerHour: getRandomInt(250, 300),
        tonnesPerHour: getRandomInt(25, 50),
        wastedMoved: getRandomInt(25, 50),
        tonnesMoved: getRandomInt(64, 80),
        avgLoadTime: '0' + getRandomInt(0, 9) + ':' + getRandomInt(10, 55),
        plannedLoadTime: '0' + getRandomInt(0, 9) + ':' + getRandomInt(10, 55),
        avgCycleTime: '0' + getRandomInt(0, 9) + ':' + getRandomInt(10, 55),
        plannedCycleTime: '0' + getRandomInt(0, 9) + ':' + getRandomInt(10, 55),
        avgQueueTime: '0' + getRandomInt(0, 9) + ':' + getRandomInt(10, 55),
      })),
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
    <Card className="trucking-summary">
      <CardBody>
        <div className="d-flex justify-content-between align-items-center">
          <div className="trucking-summary-title">Trucking Summary</div>
          <div className="d-flex justify-content-end align-items-center gap-3">
            <CustomDateRangePicker />
            <SearchDropdown itemsGroup={filters} />
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
          <Table borderless responsive className="trucking-summary-table">
            <thead>
              <tr>
                {TableHeaders.map((header) => (
                  <th>{header}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tableData.map((row) => (
                <TruckingSummaryTableRow {...row} />
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td />
                <td>
                  <div style={{ whiteSpace: "nowrap", width: "104px" }}>
                    Total :120/350
                  </div>
                </td>
              </tr>
            </tfoot>
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

export default TruckingSummary;
