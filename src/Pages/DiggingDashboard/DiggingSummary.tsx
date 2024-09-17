import React, { useMemo, useState } from "react";
import { Card, CardBody, Table } from "reactstrap";
import { getRandomInt } from "utils/random";
import { Pagination, PaginationProps, DatePicker, Input } from "antd";
import { SearchDropdown } from "Components/Common/Dropdown";
import { SearchOutlined } from "@ant-design/icons";
import CustomDateRangePicker from "Components/Common/DateRangePicker";

const { RangePicker } = DatePicker;

interface DiggingSummaryTableRowProps {

  equipmentName: string;
  completed: string;
  actual: number;
  planned: number;

  avgLoadPerHour: number;
  tonnesPerHour: number;

  avgLoadTime: string;
  plannedLoadTime: string;
  avgCycleTime: string;
  plannedCycleTime: string;

}

const DiggingSummaryTableRow: React.FC<DiggingSummaryTableRowProps> = (
  props
) => {
  return (
    <tr>

      <td width={120}>
        <div>{props.equipmentName}</div>
      </td>
      <td width={120}>
        <div>{props.completed}</div>
      </td>
      <td width={120}>
        <div>{props.actual.toLocaleString("US-en")}</div>
      </td>
      <td width={120}>
        <div>{props.planned.toLocaleString("US-en")}</div>
      </td>

      <td width={120}>
        <div>{props.avgLoadPerHour}</div>
      </td>
      <td width={120}>
        <div>{props.tonnesPerHour}</div>
      </td>

      <td width={120}>
        <div>{props.avgLoadTime}</div>
      </td>
      <td width={120}>
        <div>{props.plannedLoadTime}</div>
      </td>
      <td width={120}>
        <div>{props.avgCycleTime}</div>
      </td>
      <td width={120}>
        <div>{props.plannedCycleTime}</div>
      </td>

    </tr>
  );
};

interface DiggingSummaryProps { }

const TableHeaders = [

  "Equipment Name",
  "Completed",
  "Actual (Tonnes)",
  "Planned (Tonnes)",

  "Avg Load per Hour",
  "Tonnes per Hour",

  "Avg Load Time",
  "Planned Load Time",
  "Avg Cycle Time",
  "Planned Cycle Time",

];
const DiggingSummary: React.FC<DiggingSummaryProps> = () => {
  const [globalFilter, setGlobalFilter] = useState<string>("");

  const tableData = useMemo(
    () =>
      [...new Array(5)].map((item, key) => ({

        equipmentName: "EX20" + (key + 1),
        completed: `${getRandomInt(0, 35)}/35`,
        actual: getRandomInt(228129, 228459),
        planned: getRandomInt(500000, 500100),

        avgLoadPerHour: getRandomInt(250, 300),
        tonnesPerHour: getRandomInt(25, 50),

        avgLoadTime: '0' + getRandomInt(0, 9) + ':' + getRandomInt(10, 55),
        plannedLoadTime: '0' + getRandomInt(0, 9) + ':' + getRandomInt(10, 55),
        avgCycleTime: '0' + getRandomInt(0, 9) + ':' + getRandomInt(10, 55),
        plannedCycleTime: '0' + getRandomInt(0, 9) + ':' + getRandomInt(10, 55),

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
    <Card className="digging-summary">
      <CardBody>
        <div className="d-flex justify-content-between align-items-center">
          <h4 className="digging-summary-title">Trucking Summary</h4>
          <div className="d-flex justify-content-end align-items-center gap-3">
            <CustomDateRangePicker />
            <SearchDropdown itemsGroup={filters} />
            <Input
              prefix={<SearchOutlined />}
              value={globalFilter}
              onClick={(e) => e.stopPropagation()}
              onChange={(e) => setGlobalFilter(e.target.value)}
              className="digging-summary-search"
              placeholder="Search"
            />
          </div>
        </div>
        <div className="mt-3">
          <Table borderless responsive className="digging-summary-table">
            <thead>
              <tr>
                {TableHeaders.map((header) => (
                  <th>{header}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tableData.map((row) => (
                <DiggingSummaryTableRow {...row} />
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td width={120}>
                  <div>
                    Totals
                  </div>
                </td>
                <td width={120}>
                  120/350
                </td>
                <td width={120}>
                  <div>
                    264,875
                  </div>
                </td>
                <td width={120}>
                  <div>
                    2,564,875
                  </div>
                </td>
                <td>
                  <div>
                    48
                  </div>
                </td>
                <td>
                  <div>
                    369
                  </div>
                </td>
                <td>
                  <div>

                  </div>
                </td>
                <td>
                  <div>

                  </div>
                </td>
                <td>
                  <div>

                  </div>
                </td>
                <td>
                  <div>

                  </div>
                </td>
                <td>
                  <div>

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

export default DiggingSummary;
