import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Card, CardBody } from "reactstrap";
import { getRandomInt } from "utils/random";
import { Pagination, PaginationProps, DatePicker, Input } from "antd";
import { Table as AntTable } from "antd";
import { SearchDropdown } from "Components/Common/Dropdown";
import { SearchOutlined } from "@ant-design/icons";
import CustomDateRangePicker from "Components/Common/DateRangePicker";
import { round2Two } from "utils/common";
import Table from 'Components/Common/Table';

const { RangePicker } = DatePicker;

interface TruckingSummaryTableRow {
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

interface TruckingSummaryProps { }

const TruckingSummary: React.FC<TruckingSummaryProps> = () => {
  const [globalFilter, setGlobalFilter] = useState<string>("");
  const [totalOfTable, setTotalOfTable] = useState<TruckingSummaryTableRow | any>({});

  const tableData = useMemo(
    () =>
      [...new Array(5)].map((item, key) => ({
        modelName: "HD785",
        equipmentName: "DT10"+(key+1),
        completed: `${getRandomInt(0, 35)}/35`,
        actual: getRandomInt(2500, 3000),
        planned: 29750,
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

  const columns = useMemo(
    () => [
      {
        title: "Model",
        dataIndex: "modelName",
        key: "modelName",
        dataType: "string",
        align: "center"
      },
      {
        title: "Equipment Name",
        dataIndex: "equipmentName",
        key: "equipmentName",
        dataType: "string",
        align: "center"
      },
      {
        title: "Completed",
        dataIndex: "completed",
        key: "completed",
        dataType: "string",
        align: "center"
      },
      {
        title: "Actual (Tonnes)",
        dataIndex: "actual",
        key: "actual",
        dataType: "number",
        align: "center"
      },
      {
        title: "Planned (Tonnes)",
        dataIndex: "planned",
        key: "planned",
        dataType: "number",
        align: "center"
      },
      {
        title: "Active (mins)",
        dataIndex: "availability",
        key: "availability",
        dataType: "string",
        align: "center"
      },
      {
        title: "Standby (mins)",
        dataIndex: "standBy",
        key: "standBy",
        dataType: "string",
        align: "center"
      },
      {
        title: "Idle (mins)	",
        dataIndex: "idel",
        key: "idel",
        dataType: "string",
        align: "center"
      },
      {
        title: "Idle (%)",
        dataIndex: "idle",
        key: "idle",
        dataType: "string",
        align: "center"
      },
      {
        title: "Operational Delay (mins)",
        dataIndex: "operationalyDelay",
        key: "operationalyDelay",
        dataType: "string",
        align: "center"
      },
      {
        title: "Breakdown (mins)",
        dataIndex: "breakdown",
        key: "breakdown",
        dataType: "string",
        align: "center"
      },
      {
        title: "Avg Load per Hour",
        dataIndex: "avgLoadPerHour",
        key: "avgLoadPerHour",
        dataType: "number",
        align: "center"
      },
      {
        title: "Tonnes per Hour",
        dataIndex: "tonnesPerHour",
        key: "tonnesPerHour",
        dataType: "number",
        align: "center"
      },
      {
        title: "Waste Moved",
        dataIndex: "wastedMoved",
        key: "wastedMoved",
        dataType: "number",
        align: "center"
      },
      {
        title: "Tonnes Moved",
        dataIndex: "tonnesMoved",
        key: "tonnesMoved",
        dataType: "number",
        align: "center"
      },
      {
        title: "Avg Load Time",
        dataIndex: "avgLoadTime",
        key: "avgLoadTime",
        dataType: "string",
        align: "center"
      },
      {
        title: "Planned Load Time",
        dataIndex: "plannedLoadTime",
        key: "plannedLoadTime",
        dataType: "string",
        align: "center"
      },
      {
        title: "Avg Cycle Time",
        dataIndex: "avgCycleTime",
        key: "avgCycleTime",
        dataType: "string",
        align: "center"
      },
      {
        title: "Planned Cycle Time",
        dataIndex: "plannedCycleTime",
        key: "plannedCycleTime",
        dataType: "string",
        align: "center"
      },
      {
        title: "Avg Queue Time",
        dataIndex: "avgQueueTime",
        key: "avgQueueTime",
        dataType: "string",
        align: "center"
      },
    ], [tableData]
  )

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

  const calculateTotals = (listItems) => {
    const totals = {};

    listItems.forEach(item => {
        Object.entries(item).forEach(([key, value]: any) => {
            if (key === "completed") {
                const completedFraction = value.split('/');
                if (!totals[key]) {
                    totals[key] = [0, 0];
                }
                totals[key][0] += parseInt(completedFraction[0], 10);
                totals[key][1] += parseInt(completedFraction[1], 10);
            } else if (typeof value === 'number') {
                if (!totals[key]) {
                    totals[key] = 0;
                }
                totals[key] += value;
            } else {
                totals[key] = '';
            }
        });
    });

    if (totals["completed"]) {
        totals["completed"] = `${totals["completed"][0]}/${totals["completed"][1]}`;
    }

    return totals;
}

  const tableSummary = () => {
    const listItems = JSON.parse(JSON.stringify(totalOfTable));
    listItems.modelName = "Total";
    listItems.completed = "120/350";
    return (
      <AntTable.Summary.Row style={{ textAlign: "center" }}>
        {
          Object?.entries(listItems)?.map(([key, value]: any) =>
            <AntTable.Summary.Cell index={0} className={value? '' : "table-cell-empty"}>{value}</AntTable.Summary.Cell>
          )
        }
      </AntTable.Summary.Row>
    )
  }

  useEffect(() => {
    const totalOfTableData = calculateTotals(tableData);
    setTotalOfTable(totalOfTableData);
  },[tableData]);

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
          <Table columns={columns}
            data={tableData} paginationPageSize={10}
            summary={tableSummary}
            scroll={{ x: "max-content" }}
          />
        </div>
      </CardBody>
    </Card>
  );
};

export default TruckingSummary;
