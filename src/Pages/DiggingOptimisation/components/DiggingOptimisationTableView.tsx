import { Col, Row } from "reactstrap";
import TableContainer, { TableColumn } from "Components/Common/TableContainer";
import React, { useMemo } from "react";
import { getContentByState } from "utils/common";
import DiggingOptimisationHeader from "./DiggingOptimisationHeader";

const DiggingOptimisationTableView = () => {
  const columns: TableColumn[] = useMemo(
    () => [
      {
        header: "Vehicle Name",
        accessorKey: "vehicleName",
        enableColumnFilter: false,
        enableSorting: true,
      },
      {
        header: "Operator Name",
        accessorKey: "operatorName",
        enableColumnFilter: false,
        enableSorting: true,
      },
      {
        header: "Status",
        accessorKey: "status",
        enableColumnFilter: false,
        enableSorting: true,
        cell: (cellProps: any) => {
          const displayContent = getContentByState(
            cellProps.row.original.status
          );
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
        header: "Passes",
        accessorKey: "passes",
        enableColumnFilter: false,
        enableSorting: true,
      },
      {
        header: "Current Load",
        accessorKey: "currentLoad",
        enableColumnFilter: false,
        enableSorting: true,
      },
      {
        header: "Active Hours",
        accessorKey: "activeHours",
        enableColumnFilter: false,
        enableSorting: true,
      },
      {
        header: "Avg Load Time",
        accessorKey: "avgLoadTime",
        enableColumnFilter: false,
        enableSorting: true,
      },
      {
        header: "Truck Waiting Time",
        accessorKey: "truckWaitingTime",
        enableColumnFilter: false,
        enableSorting: true,
      },
      {
        header: "Avg Load per Hour",
        accessorKey: "avgLoadPerHour",
        enableColumnFilter: false,
        enableSorting: true,
      },
      {
        header: "Tonnes per Hour",
        accessorKey: "tonnesLoadPerHour",
        enableColumnFilter: false,
        enableSorting: true,
      },
    ],
    []
  );

  const tableData = [
    {
      vehicleName: "EX201",
      operatorName: "James Taylor",
      status: "ACTIVE",
      passes: 5,
      currentLoad: "13.1t",
      avgLoadTime: "02:14",
      truckWaitingTime: "04:35",
      activeHours: "06:00",
      avgLoadPerHour: "7",
      tonnesLoadPerHour: "589t",
    },
    {
      vehicleName: "EX202",
      operatorName: "John Shein",
      status: "ACTIVE",
      passes: 3,
      currentLoad: "12.4t",
      avgLoadTime: "03:20",
      truckWaitingTime: "01:09",
      activeHours: "02:29",
      avgLoadPerHour: "9",
      tonnesLoadPerHour: "720t",
    },
    {
      vehicleName: "EX203",
      operatorName: "William",
      status: "DOWN",
      passes: 6,
      currentLoad: "9.6t",
      avgLoadTime: "04:20",
      truckWaitingTime: "01:00",
      activeHours: "03:20",
      avgLoadPerHour: "8",
      tonnesLoadPerHour: "666t",
    },
  ];
  return (
    <>
      <Row>
        <Col lg="12">
          <DiggingOptimisationHeader />
        </Col>
      </Row>
      <Row>
        <Col lg="12" className="text-center">
          <TableContainer columns={columns} data={tableData} />
        </Col>
      </Row>
    </>
  );
};

export default DiggingOptimisationTableView;
