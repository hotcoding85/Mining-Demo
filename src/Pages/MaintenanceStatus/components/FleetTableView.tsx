import React from "react";
import { getRandomFloat, getRandomIndex, getRandomInt } from "utils/random";
import {
  FleetName,
  getSyncIcon,
  MaintenanceStatus,
  MaintenanceStatusConfig,
} from "utils/fleet";
import Table from "Components/Common/Table";
import { errorDefinitions } from "Pages/TelemetryReport/errorDefinitions";
import { Space, Tooltip } from "antd";
import styled from "styled-components";

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
        {label}
      </span>
    </Tooltip>
  );
};

const FaultCode: React.FC<{ codes: string[] }> = ({ codes }) => (
  <Space direction="horizontal" style={{ width: "100%" }}>
    {codes && codes.length > 0 ? (
      codes.length === 1 ? (
        <Chip label={codes[0]} />
      ) : (
        <Space>
          <Chip label={codes[0]} />
          <div style={{ fontSize: "10px" }}>+ {codes.length - 1} more</div>
        </Space>
      )
    ) : (
      ""
    )}
  </Space>
);

const Dot = styled.div<{ color?: string }>`
  flex: none;
  width: 8px;
  height: 8px;
  margin-top: 6px;
  border-radius: 100%;
  background: ${(props) => props.color};
`;

const Synced: React.FC<{ status: string }> = ({ status }) => {
  const statusConfig = MaintenanceStatusConfig[status];

  return (
    <div className="d-flex justify-content-start align-items-start gap-1">
      <Dot color={statusConfig?.color} />
      <div className="text-left">{statusConfig?.name || "Unknown Status"}</div>
    </div>
  );
};

interface FleetTableViewProps {
  fleetData: {
    [key: string]: any[];
  };
  fleetOrder: string[];
}

const FleetTableView: React.FC<FleetTableViewProps> = ({
  fleetOrder,
  fleetData,
}) => {
  const columns = [
    {
      title: "Equipment Category",
      dataIndex: "equipment",
      key: "equipment",
      dataType: "",
    },
    {
      title: "Equipment",
      dataIndex: "assignedTrucks",
      key: "assignedTrucks",
      dataType: "",
      align: "center",
    },
    {
      title: "Synced",
      dataIndex: "synced",
      key: "synced",
      dataType: "boolean",
      align: "center",

      render: (text) =>
        text && (
          <div className="sync">
            <i className={getSyncIcon("active")}></i>
            <div className="sync-label">{text}</div>
          </div>
        ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      dataType: "",
      render: (value) => value && <Synced status={value} />,
    },
    {
      title: "SMU",
      dataIndex: "smu",
      key: "smu",
      align: "center",
      dataType: "number",
    },
    {
      title: "Fuel Level",
      dataIndex: "fuelLevel",
      key: "fuelLevel",
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
    {
      title: "Next Service",
      dataIndex: "nextService",
      key: "nextService",
      dataType: "number",
      align: "center",
    },
    {
      title: "Service Due",
      dataIndex: "serviceDue",
      key: "serviceDue",
      dataType: "number",
      align: "center",
    },
    {
      title: "Fault Code",
      dataIndex: "faultCode",
      key: "faultCode",
      dataType: "",
      render: (faultCodes) => (
        <div className="d-flex justify-content-start align-items-center flex-wrap gap-1 p-1">
          {faultCodes && <FaultCode codes={faultCodes} />}
        </div>
      ),
    },
  ];

  const sampleData = fleetOrder.map((eq) => ({
    key: eq,
    equipment: FleetName[eq],
    children: fleetData[eq].map((item) => ({
      key: item.id,
      assignedTrucks: item.name,
      status: MaintenanceStatus[getRandomIndex(0, 3)],
      synced: `${getRandomInt(1, 2)}m`,
      smu: getRandomFloat(23000, 38000, 1),
      fuelRate: getRandomInt(20, 100),
      fuelLevel: getRandomFloat(40, 80, 1),
      nextService: getRandomFloat(1, 20, 1),
      serviceDue: getRandomFloat(1, 10, 1),
      faultCode: ["CA234", "CA235", "CA236", "CA237"].slice(
        0,
        Math.floor(Math.random() * 10)
      ),
    })),
  }));

  return <Table columns={columns} data={sampleData} />;
};

export default FleetTableView;
