import React, { useState } from "react";
import { Col, Container, Row } from "reactstrap";
import Breadcrumb from "Components/Common/Breadcrumb";
import { Tabs, TabsProps } from "antd";
import HaulRoadOptimisationTableView from "./components/HaulRoadOptimisationTableView";
import HaulRoadOptimisationMapView from "./components/HaulRoadOptimisationMapView";
import HaulRoadOptimisationVisualView from "./components/HaulRoadOptimisationVisualView";
import "./styles/index.scss";

const HaulRoadOptimization = (props: any) => {
  document.title = "Haul Road Optimisation | FMS Live";
  const [displayType, setDisplayType] = useState("TABLE");

  const tabItems: TabsProps["items"] = [
    {
      key: "table",
      label: "Table View",
    },
    {
      key: "map",
      label: "Map View",
    },
    {
      key: "visual",
      label: "Visual Analytics",
    },
  ];
  const onTabChange = (key: string) => {
    if (key === "table") {
      setDisplayType("TABLE");
    } else if (key === "map") {
      setDisplayType("MAP");
    } else {
      setDisplayType("VISUAL");
    }
  };

  return (
    <React.Fragment>
      <div className="page-content col-lg-12">
        <Container fluid className="haul-raod-optimisation">
          <Breadcrumb
            title="Mine Dynamics"
            breadcrumbItem="Haul Road Optimisation"
          />

          <Row>
            <Col lg="12">
              <Tabs
                className="haul-raod-optimisation-tabs"
                defaultActiveKey="1"
                items={tabItems}
                onChange={onTabChange}
              />
            </Col>
          </Row>

          {displayType === "TABLE" ? (
            <HaulRoadOptimisationTableView />
          ) : displayType === "MAP" ? (
            <HaulRoadOptimisationMapView />
          ) : (
            <HaulRoadOptimisationVisualView />
          )}
        </Container>
      </div>
    </React.Fragment>
  );
};

export default HaulRoadOptimization;
