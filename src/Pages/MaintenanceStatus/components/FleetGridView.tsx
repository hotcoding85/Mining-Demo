import FleetCard from "Components/Common/Fleet/FleetCard";
import React, { useState } from "react";
import { Col, Collapse, Row } from "reactstrap";
import { FleetName, getImage, MaintenanceStatus } from "utils/fleet";
import { getRandomFloat, getRandomIndex, getRandomInt } from "utils/random";

interface FleetCollapseProps {
  title?: string;
  fleetList?: any[];
  defaultOpen?: boolean;
}

const FleetCollapse: React.FC<FleetCollapseProps> = ({
  title,
  fleetList,
  defaultOpen = false,
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(defaultOpen);
  const toggle = () => setIsOpen(!isOpen);

  return (
    <>
      <div className="d-flex justify-content-between align-items-center gap-3 py-4">
        <div className="fleet-grid-view-title">
          {title ? FleetName[title] : "Unknown"} ({fleetList?.length || 0})
        </div>
        <div className="fleet-grid-view-line" />
        <div
          className="d-flex justify-content-between align-items-center gap-2 fleet-grid-action-button"
          onClick={toggle}
        >
          {isOpen ? "Collapse" : "Expand"}
          <i
            className="mdi mdi-menu-down"
            style={{ rotate: isOpen ? "0deg" : "180deg" }}
          ></i>
        </div>
      </div>
      <Collapse isOpen={isOpen}>
        <Row>
          {fleetList?.map((fleet) => (
            <Col xs={3}>
              <FleetCard
                key={fleet.id}
                id={fleet.name}
                status={MaintenanceStatus[getRandomIndex(0, 3)]}
                smu={getRandomFloat(23000, 38000, 1)}
                fuelLevel={getRandomInt(20, 100)}
                fuelRate={getRandomFloat(40, 80, 1)}
                imageUrl={getImage(fleet.model)}
                lastUpdated={getRandomInt(1, 2) + "m"}
                sync={"active"}
              />
            </Col>
          ))}
        </Row>
      </Collapse>
    </>
  );
};

interface FleetGridViewProps {
  fleetData: {
    [key: string]: any[];
  };
  fleetOrder: string[];
}

const FleetGridView: React.FC<FleetGridViewProps> = ({
  fleetOrder,
  fleetData,
}) => {
  return (
    <div>
      {fleetOrder.map((key, index) => (
        <FleetCollapse
          key={`${key}_${index}`}
          title={key}
          fleetList={fleetData[key]}
          defaultOpen
        />
      ))}
    </div>
  );
};

export default FleetGridView;
