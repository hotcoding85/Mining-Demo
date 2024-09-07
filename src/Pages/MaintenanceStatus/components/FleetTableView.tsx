import React, { useState } from "react";
import { Table } from "reactstrap";
import { getRandomFloat, getRandomIndex, getRandomInt } from "utils/random";
import { FleetName, MaintenanceStatus } from "utils/fleet";
import FleetTableRow from "./FleetTableRow";

interface FleetTableRowCollapseProps {
  defaultOpen?: boolean;
  title: string;
  assignTrucks?: any[];
}

const FleetTableRowCollapse: React.FC<FleetTableRowCollapseProps> = ({
  title,
  defaultOpen = false,
  assignTrucks,
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(defaultOpen);

  const toggle = () => setIsOpen(!isOpen);

  return (
    <>
      <tr className="table-collapse-row">
        <td width={109}>
          <div
            className="d-flex justify-content-start align-items-center gap-1 table-collapse-trigger"
            onClick={toggle}
          >
            {FleetName[title]}
            <i
              className="mdi mdi-menu-down"
              style={{ rotate: isOpen ? "0deg" : "180deg" }}
            ></i>
          </div>
        </td>
      </tr>
      {isOpen &&
        assignTrucks?.map((item) => (
          <FleetTableRow
            key={item.id}
            name={item.name}
            status={MaintenanceStatus[getRandomIndex(0, 3)]}
            lastUpdated={`${getRandomInt(1, 2)}m`}
            smu={getRandomFloat(23000, 38000, 1)}
            fuelRate={getRandomInt(20, 100)}
            fuelLevel={getRandomFloat(40, 80, 1)}
            nextService={getRandomFloat(1, 20, 1)}
            serviceDue={getRandomFloat(1, 10, 1)}
            faultCodes={["CA234", "CA235", "CA236", "CA237"].slice(
              0,
              Math.floor(Math.random() * 10)
            )}
          />
        ))}
    </>
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
  return (
    <Table responsive borderless className="fleet-table mt-4">
      <thead>
        <tr>
          <th>Digger</th>
          <th>Assigned Truck/s</th>
          <th>Synced</th>
          <th>Status</th>
          <th>SMU</th>
          <th>Fuel Level</th>
          <th>Fuel Rate</th>
          <th>Next Service</th>
          <th>Service Due</th>
          <th style={{ width: "140px" }}>Fault Code</th>
        </tr>
      </thead>
      <tbody>
        {fleetOrder.map((fleet) => (
          <FleetTableRowCollapse
            key={fleet}
            title={fleet}
            defaultOpen={true}
            assignTrucks={fleetData[fleet]}
          />
        ))}
      </tbody>
    </Table>
  );
};

export default FleetTableView;
