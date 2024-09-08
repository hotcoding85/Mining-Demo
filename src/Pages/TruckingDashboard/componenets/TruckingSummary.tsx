import React, { useMemo, useState } from "react";
import { Card, CardBody, Table } from "reactstrap";
import { getRandomInt } from "utils/random";
import { Pagination, PaginationProps, DatePicker } from "antd";

const { RangePicker } = DatePicker;

interface TruckingSummaryTableRowProps {
  modelName: string;
  equipmentName: string;
  completed: string;
  actual: number;
  planned: number;
  availability: number;
  standBy: number;
  idel: number;
  operationalyDelay: number;
  breakdown: number;
  avgLoadPerHour: number;
  tonnesPerHour: number;
  wastedMoved: number;
  tonnesMoved: number;
  avgLoadTime: number;
  plannedLoadTime: number;
  avgCycleTime: number;
  plannedCycleTime: number;
  avgQueueTime: number;
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
        <div>{props.availability}%</div>
      </td>
      <td width={104}>
        <div>{props.standBy}%</div>
      </td>
      <td width={104}>
        <div>{props.idel}%</div>
      </td>
      <td width={104}>
        <div>{props.operationalyDelay}</div>
      </td>
      <td width={104}>
        <div>{props.breakdown}%</div>
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

interface TruckingSummaryProps {}

const TableHeaders = [
  "Model",
  "Equipment Name",
  "Completed",
  "Actual (Tonnes)",
  "Planned (Tonnes)",
  "Availability (%)",
  "Standby (%)",
  "Idle (%)",
  "Operational Delay",
  "Breakdown (mins)",
  "Avg Load per Hour",
  "Tonnes per Hour",
  "Wasted Moved",
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
      [...new Array(5)].map(() => ({
        modelName: "HD1500",
        equipmentName: "DT101",
        completed: `${getRandomInt(0, 35)}/35`,
        actual: getRandomInt(228129, 228459),
        planned: getRandomInt(500000, 500100),
        availability: getRandomInt(65, 90),
        standBy: getRandomInt(10, 30),
        idel: getRandomInt(5, 10),
        operationalyDelay: getRandomInt(1, 5),
        breakdown: getRandomInt(1, 5),
        avgLoadPerHour: getRandomInt(250, 300),
        tonnesPerHour: getRandomInt(25, 50),
        wastedMoved: getRandomInt(25, 50),
        tonnesMoved: getRandomInt(64, 80),
        avgLoadTime: getRandomInt(10, 20),
        plannedLoadTime: getRandomInt(15, 20),
        avgCycleTime: getRandomInt(20, 30),
        plannedCycleTime: getRandomInt(25, 30),
        avgQueueTime: getRandomInt(8, 10),
      })),
    []
  );

  const onChange: PaginationProps["onChange"] = (pageNumber) => {
    console.log("Page: ", pageNumber);
  };

  return (
    <Card className="trucking-summary">
      <CardBody>
        <div className="d-flex justify-content-between align-items-center">
          <div className="trucking-summary-title">Trucking Summary</div>
          <div className="d-flex justify-content-end align-items-center gap-2">
            <RangePicker />
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
