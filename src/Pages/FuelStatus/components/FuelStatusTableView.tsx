import Table from "Components/Common/Table";
import React from "react";
import { Card, CardBody } from "reactstrap";
import styled from "styled-components";
import { MaintenanceStatusConfig } from "utils/fleet";

const Dot = styled.div<{ color?: string }>`
  flex: none;
  width: 8px;
  height: 8px;
  margin-top: 6px;
  border-radius: 100%;
  background: ${(props) => props.color};
`;

const Status: React.FC<{ status: string }> = ({ status }) => {
  const statusConfig = MaintenanceStatusConfig[status];

  return (
    <div className="d-flex justify-content-start align-items-start gap-1">
      <Dot color={statusConfig?.color} />
      <div className="text-left">{statusConfig?.name || "Unknown Status"}</div>
    </div>
  );
};

const FuelStatusTableView = ({ data }) => {
  const getLastUpdated = (lastUpdated) => {
    if (lastUpdated < 60) {
      return `${lastUpdated} m`;
    } else if (lastUpdated >= 60 && lastUpdated < 1440) {
      return `${Math.floor(lastUpdated / 60)} h`;
    } else if (lastUpdated >= 1440 && lastUpdated < 525600) {
      return `${Math.floor(lastUpdated / 1440)} days`;
    } else if (lastUpdated >= 525600) {
      return `${Math.floor(lastUpdated / 525600)} y`;
    }
  };

  const getSyncIcon = (sync, lastUpdated) => {
    switch (sync) {
      case "manual":
        return (
          <svg
            width="12"
            height="12"
            viewBox="0 0 12 12"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M5.99996 5.99996C5.26663 5.99996 4.63885 5.73885 4.11663 5.21663C3.5944 4.6944 3.33329 4.06663 3.33329 3.33329C3.33329 2.59996 3.5944 1.97218 4.11663 1.44996C4.63885 0.927737 5.26663 0.666626 5.99996 0.666626C6.73329 0.666626 7.36107 0.927737 7.88329 1.44996C8.40551 1.97218 8.66663 2.59996 8.66663 3.33329C8.66663 4.06663 8.40551 4.6944 7.88329 5.21663C7.36107 5.73885 6.73329 5.99996 5.99996 5.99996ZM0.666626 11.3333V9.46663C0.666626 9.08885 0.763959 8.74151 0.958626 8.42463C1.15285 8.10818 1.41107 7.86663 1.73329 7.69996C2.42218 7.35551 3.12218 7.09707 3.83329 6.92463C4.5444 6.75263 5.26663 6.66663 5.99996 6.66663C6.73329 6.66663 7.45551 6.75263 8.16663 6.92463C8.87774 7.09707 9.57774 7.35551 10.2666 7.69996C10.5888 7.86663 10.8471 8.10818 11.0413 8.42463C11.236 8.74151 11.3333 9.08885 11.3333 9.46663V11.3333H0.666626Z"
              fill={`${
                lastUpdated > 120
                  ? "#CF1322"
                  : lastUpdated <= 120 && lastUpdated >= 30
                  ? "#FAAD14"
                  : "#389E0D"
              }`}
            />
          </svg>
        );
      case "inactive":
        return (
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M7.28335 9.36667L11.0667 5.6L10.1167 4.65L7.28335 7.48333L5.86669 6.06667L4.93335 7L7.28335 9.36667ZM0.666687 14V12.6667H15.3334V14H0.666687ZM2.66669 12C2.30002 12 1.98613 11.8694 1.72502 11.6083C1.46391 11.3472 1.33335 11.0333 1.33335 10.6667V3.33333C1.33335 2.96667 1.46391 2.65278 1.72502 2.39167C1.98613 2.13056 2.30002 2 2.66669 2H13.3334C13.7 2 14.0139 2.13056 14.275 2.39167C14.5361 2.65278 14.6667 2.96667 14.6667 3.33333V10.6667C14.6667 11.0333 14.5361 11.3472 14.275 11.6083C14.0139 11.8694 13.7 12 13.3334 12H2.66669ZM2.66669 10.6667H13.3334V3.33333H2.66669V10.6667Z"
              fill={`${
                lastUpdated > 120
                  ? "#CF1322"
                  : lastUpdated <= 120 && lastUpdated >= 30
                  ? "#FAAD14"
                  : "#389E0D"
              }`}
            />
          </svg>
        );
      case "active":
        return (
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M7.28335 9.36667L11.0667 5.6L10.1167 4.65L7.28335 7.48333L5.86669 6.06667L4.93335 7L7.28335 9.36667ZM0.666687 14V12.6667H15.3334V14H0.666687ZM2.66669 12C2.30002 12 1.98613 11.8694 1.72502 11.6083C1.46391 11.3472 1.33335 11.0333 1.33335 10.6667V3.33333C1.33335 2.96667 1.46391 2.65278 1.72502 2.39167C1.98613 2.13056 2.30002 2 2.66669 2H13.3334C13.7 2 14.0139 2.13056 14.275 2.39167C14.5361 2.65278 14.6667 2.96667 14.6667 3.33333V10.6667C14.6667 11.0333 14.5361 11.3472 14.275 11.6083C14.0139 11.8694 13.7 12 13.3334 12H2.66669ZM2.66669 10.6667H13.3334V3.33333H2.66669V10.6667Z"
              fill={`${
                lastUpdated > 120
                  ? "#CF1322"
                  : lastUpdated <= 120 && lastUpdated >= 30
                  ? "#FAAD14"
                  : "#389E0D"
              }`}
            />
          </svg>
        );
      default:
        return null;
    }
  };
  const columns = [
    {
      title: "Equipment Name",
      dataIndex: "name",
      key: "name",
      dataType: "string",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      dataType: "",
      render: (value) => value && <Status status={value} />,
    },
    {
      title: "Synced",
      dataIndex: "lastUpdated",
      key: "lastUpdated",
      dataType: "",
      render: (text) =>
        text && (
          <div className="sync">
            {getSyncIcon("inactive", text)}
            <div className="sync-label">{getLastUpdated(text)}</div>
          </div>
        ),
    },
    {
      title: "GPS Location",
      dataIndex: "gpsLocation",
      key: "gpsLocation",
      dataType: "number",
      align: "center",
    },
    {
      title: "SMU",
      dataIndex: "smu",
      key: "smu",
      dataType: "number",
      align: "center",
    },
    {
      title: "Fuel Level (%)",
      dataIndex: "fuelLevel",
      key: "fuelLevel",
      dataType: "number",
      align: "center",
    },
    {
      title: "Fuel Rate (L/h)",
      dataIndex: "fuelRate",
      key: "fuelRate",
      dataType: "number",
      align: "center",
    },
  ];

  return (
    <Card>
      <CardBody>
        <Table columns={columns} data={data || []} />
      </CardBody>
    </Card>
  );
};

export default FuelStatusTableView;
