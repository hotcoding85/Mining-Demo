import { Space, Tooltip } from "antd";
import { errorDefinitions } from "Pages/TelemetryReport/errorDefinitions";
import React from "react";
import styled from "styled-components";
import { getSyncIcon, MaintenanceStatusConfig } from "utils/fleet";

// Styled components
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

interface FleetTableRowProps {
  smu?: number;
  name: string;
  status: string;
  fuelRate?: number;
  fuelLevel?: number;
  serviceDue?: number;
  faultCodes?: string[];
  lastUpdated: string;
  nextService?: number;
}

const DataCell = ({
  unit,
  value,
  fallback = "N/A",
  conditionClass,
  isApplyConditionClass,
}: {
  unit?: string;
  value: number | string | undefined;
  fallback?: string;
  conditionClass?: string;
  isApplyConditionClass?: boolean;
}) => (
  <td className={isApplyConditionClass || !value ? conditionClass : ""}>
    {value || fallback} {unit}
  </td>
);

const FleetTableRow: React.FC<FleetTableRowProps> = ({
  smu,
  name,
  status,
  fuelRate,
  fuelLevel,
  serviceDue,
  faultCodes,
  nextService,
  lastUpdated,
}) => (
  <tr>
    <td width={109} />
    <td width={109}>{name}</td>
    <td width={109}>
      <div className="sync">
        <i className={getSyncIcon("active")}></i>
        <div className="sync-label">{lastUpdated}</div>
      </div>
    </td>
    <td width={124}>
      <Synced status={status} />
    </td>
    <DataCell value={smu} conditionClass="danger-label" />
    <DataCell value={fuelLevel} conditionClass="danger-label" />
    <DataCell value={fuelRate} unit="L/h" conditionClass="danger-label" />
    <DataCell value={nextService} />
    <DataCell
      value={serviceDue}
      conditionClass="light-danger-label"
      isApplyConditionClass={!!serviceDue && serviceDue < 5}
    />
    <td width={150}>
      <div className="d-flex justify-content-start align-items-center flex-wrap gap-1 p-1">
        {faultCodes && <FaultCode codes={faultCodes} />}
      </div>
    </td>
  </tr>
);

export default FleetTableRow;
