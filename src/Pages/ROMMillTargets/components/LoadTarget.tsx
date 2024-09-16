import React, { useState } from "react";
import { Card, CardBody } from "reactstrap";
import { Pagination, PaginationProps, Input, Select } from "antd";
import { SearchDropdown } from "Components/Common/Dropdown";
import { SearchOutlined } from "@ant-design/icons";
import TableContainer from "Components/Common/TableContainer";

const tableColumns = [
  {
    header: "Equipment Name",
    accessorKey: "equipmentName",
    enableColumnFilter: false,
    enableSorting: true,
    cell: ({ row, getValue }) => {
      return <>{getValue()}</>;
    },
  },
  {
    header: "Planned Loads",
    accessorKey: "plannedLoads",
    enableColumnFilter: false,
    enableSorting: true,
    cell: ({ getValue, row, column }) => (
      <Input
        type="number"
        style={{ textAlign: "center" }}
        onWheel={(event) => event.currentTarget.blur()}
        value={getValue()}
      />
    ),
  },
  {
    header: "Average Load Tonnes",
    accessorKey: "averageLoadTonnes",
    enableColumnFilter: false,
    enableSorting: true,
    cell: ({ getValue, row, column }) => (
      <Input
        type="number"
        style={{ textAlign: "center" }}
        onWheel={(event) => event.currentTarget.blur()}
        value={getValue()}
      />
    ),
  },
  {
    header: "Planned Shift Tonnes to Mill",
    accessorKey: "plannedShiftTonnesToMill",
    enableColumnFilter: false,
    enableSorting: true,
    cell: ({ getValue, row, column }) => (
      <Input
        type="number"
        style={{ textAlign: "center" }}
        onWheel={(event) => event.currentTarget.blur()}
        value={getValue()}
      />
    ),
  },
  {
    header: "Grams per Tonne per Hour",
    accessorKey: "gramsPerTonnePerHour",
    enableColumnFilter: false,
    enableSorting: true,
    cell: ({ getValue, row, column }) => (
      <Input
        type="number"
        style={{ textAlign: "center" }}
        onWheel={(event) => event.currentTarget.blur()}
        value={getValue()}
      />
    ),
  },
  {
    header: "Average Trip Time",
    accessorKey: "averageTripTime",
    enableColumnFilter: false,
    enableSorting: true,
    cell: ({ getValue, row, column }) => (
      <Input
        type="number"
        style={{ textAlign: "center" }}
        onWheel={(event) => event.currentTarget.blur()}
        value={getValue()}
      />
    ),
  },
  {
    header: "Standby (Hours)",
    accessorKey: "standbyHours",
    enableColumnFilter: false,
    enableSorting: true,
    cell: ({ getValue, row, column }) => (
      <Input
        type="number"
        style={{ textAlign: "center" }}
        onWheel={(event) => event.currentTarget.blur()}
        value={getValue()}
      />
    ),
  },
  {
    header: "Hour 1 Planned Tonnes",
    accessorKey: "hour1PlannedTonnes",
    enableColumnFilter: false,
    enableSorting: true,
    cell: ({ getValue, row, column }) => (
      <Input
        type="number"
        style={{ textAlign: "center" }}
        onWheel={(event) => event.currentTarget.blur()}
        value={getValue()}
      />
    ),
  },
  {
    header: "Hour 2 Planned Tonnes",
    accessorKey: "hour2PlannedTonnes",
    enableColumnFilter: false,
    enableSorting: true,
    cell: ({ getValue, row, column }) => (
      <Input
        type="number"
        style={{ textAlign: "center" }}
        onWheel={(event) => event.currentTarget.blur()}
        value={getValue()}
      />
    ),
  },
  {
    header: "Hour 3 Planned Tonnes",
    accessorKey: "hour3PlannedTonnes",
    enableColumnFilter: false,
    enableSorting: true,
    cell: ({ getValue, row, column }) => (
      <Input
        type="number"
        style={{ textAlign: "center" }}
        onWheel={(event) => event.currentTarget.blur()}
        value={getValue()}
      />
    ),
  },
  {
    header: "Hour 4 Planned Tonnes",
    accessorKey: "hour4PlannedTonnes",
    enableColumnFilter: false,
    enableSorting: true,
    cell: ({ getValue, row, column }) => (
      <Input
        type="number"
        style={{ textAlign: "center" }}
        onWheel={(event) => event.currentTarget.blur()}
        value={getValue()}
      />
    ),
  },
  {
    header: "Hour 5 Planned Tonnes",
    accessorKey: "hour5PlannedTonnes",
    enableColumnFilter: false,
    enableSorting: true,
    cell: ({ getValue, row, column }) => (
      <Input
        type="number"
        style={{ textAlign: "center" }}
        onWheel={(event) => event.currentTarget.blur()}
        value={getValue()}
      />
    ),
  },
  {
    header: "Hour 6 Planned Tonnes",
    accessorKey: "hour6PlannedTonnes",
    enableColumnFilter: false,
    enableSorting: true,
    cell: ({ getValue, row, column }) => (
      <Input
        type="number"
        style={{ textAlign: "center" }}
        onWheel={(event) => event.currentTarget.blur()}
        value={getValue()}
      />
    ),
  },
  {
    header: "Hour 7 Planned Tonnes",
    accessorKey: "hour7PlannedTonnes",
    enableColumnFilter: false,
    enableSorting: true,
    cell: ({ getValue, row, column }) => (
      <Input
        type="number"
        style={{ textAlign: "center" }}
        onWheel={(event) => event.currentTarget.blur()}
        value={getValue()}
      />
    ),
  },
  {
    header: "Hour 8 Planned Tonnes",
    accessorKey: "hour8PlannedTonnes",
    enableColumnFilter: false,
    enableSorting: true,
    cell: ({ getValue, row, column }) => (
      <Input
        type="number"
        style={{ textAlign: "center" }}
        onWheel={(event) => event.currentTarget.blur()}
        value={getValue()}
      />
    ),
  },
  {
    header: "Hour 9 Planned Tonnes",
    accessorKey: "hour9PlannedTonnes",
    enableColumnFilter: false,
    enableSorting: true,
    cell: ({ getValue, row, column }) => (
      <Input
        type="number"
        style={{ textAlign: "center" }}
        onWheel={(event) => event.currentTarget.blur()}
        value={getValue()}
      />
    ),
  },
  {
    header: "Hour 10 Planned Tonnes",
    accessorKey: "hour10PlannedTonnes",
    enableColumnFilter: false,
    enableSorting: true,
    cell: ({ getValue, row, column }) => (
      <Input
        type="number"
        style={{ textAlign: "center" }}
        onWheel={(event) => event.currentTarget.blur()}
        value={getValue()}
      />
    ),
  },
  {
    header: "Hour 11 Planned Tonnes",
    accessorKey: "hour11PlannedTonnes",
    enableColumnFilter: false,
    enableSorting: true,
    cell: ({ getValue, row, column }) => (
      <Input
        type="number"
        style={{ textAlign: "center" }}
        onWheel={(event) => event.currentTarget.blur()}
        value={getValue()}
      />
    ),
  },
  {
    header: "Hour 12 Planned Tonnes",
    accessorKey: "hour12PlannedTonnes",
    enableColumnFilter: false,
    enableSorting: true,
    cell: ({ getValue, row, column }) => (
      <Input
        type="number"
        style={{ textAlign: "center" }}
        onWheel={(event) => event.currentTarget.blur()}
        value={getValue()}
      />
    ),
  },
  // Continue with other columns for hours 4 through 12
  {
    header: "Availability (Hours)",
    accessorKey: "availabilityHours",
    enableColumnFilter: false,
    enableSorting: true,
    cell: ({ getValue, row, column }) => (
      <Input
        type="number"
        style={{ textAlign: "center" }}
        onWheel={(event) => event.currentTarget.blur()}
        value={getValue()}
      />
    ),
  },
  {
    header: "Utilisation (Hours)",
    accessorKey: "utilisationHours",
    enableColumnFilter: false,
    enableSorting: true,
    cell: ({ getValue, row, column }) => (
      <Input
        type="number"
        style={{ textAlign: "center" }}
        onWheel={(event) => event.currentTarget.blur()}
        value={getValue()}
      />
    ),
  },
];

const sampleData = [
  {
    equipmentName: "Dozer D",
    plannedLoads: 85,
    averageLoadTonnes: 17,
    plannedShiftTonnesToMill: 1700,
    gramsPerTonnePerHour: 4.5,
    averageTripTime: 28,
    standbyHours: 1.2,
    hour1PlannedTonnes: 130,
    hour2PlannedTonnes: 135,
    hour3PlannedTonnes: 125,
    hour4PlannedTonnes: 120,
    hour5PlannedTonnes: 115,
    hour6PlannedTonnes: 125,
    hour7PlannedTonnes: 130,
    hour8PlannedTonnes: 135,
    hour9PlannedTonnes: 140,
    hour10PlannedTonnes: 145,
    hour11PlannedTonnes: 150,
    hour12PlannedTonnes: 155,
    availabilityHours: 8,
    utilisationHours: 6.5,
  },
];

const LoadTarget: React.FC = () => {
  const [globalFilter, setGlobalFilter] = useState<string>("");

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
    <Card className="loader-target rommil-loader">
      <CardBody>
        <div className="d-flex justify-content-between align-items-center">
          <div className="loader-target-title">ROM Loader Target</div>
          <div className="d-flex justify-content-end align-items-center gap-3 rommil-targets">
            <SearchDropdown itemsGroup={filters} />
            <Select
              className="basic-single"
              id="Show/Hide Columns"
              showSearch
              placeholder="Show/Hide Columns"
              style={{ width: "100%" }}
            />
            <Input
              prefix={<SearchOutlined />}
              value={globalFilter}
              onClick={(e) => e.stopPropagation()}
              onChange={(e) => setGlobalFilter(e.target.value)}
              className="trucking-summary-search"
              placeholder="Quick Search"
            />
          </div>
        </div>
        <div className="mt-3 load-target-table">
          <TableContainer
            columns={tableColumns}
            data={sampleData}
            theadClass="theadCenterAlign"
            isGlobalFilter={false}
            isPagination={false}
            isAddButton={false}
            isBordered={false}
          />
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

export default LoadTarget;
