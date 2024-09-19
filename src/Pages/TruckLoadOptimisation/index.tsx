import React, { useState } from "react";
import { Col, Container, Row } from "reactstrap";
import { Tabs, TabsProps } from "antd";
import Breadcrumb from "Components/Common/Breadcrumb";
import TruckLoadOptimisationMapView from "./components/TruckLoadOptimisationMapView";
import TruckLoadOptimisationVisualView from "./components/TruckLoadOptimisationVisualView";
import TruckLoadOptimisationTableView from "./components/TruckLoadOptimisationTableView";
import "./styles/index.scss";

const TruckLoadOptimisation = (props: any) => {
  document.title = "Truck Load Optimisation | FMS Live";

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
        <Container className="truck-optimisation" fluid>
          <Breadcrumb
            title="Mine Dynamics"
            breadcrumbItem="Truck Load Optimisation"
          />
          <Row>
            <Col lg="12">
              <Tabs
                className="truck-optimisation-tabs"
                defaultActiveKey="1"
                items={tabItems}
                onChange={onTabChange}
              />
            </Col>
          </Row>

          {displayType === "TABLE" ? (
            <TruckLoadOptimisationTableView />
          ) : displayType === "MAP" ? (
            <TruckLoadOptimisationMapView />
          ) : (
            <TruckLoadOptimisationVisualView />
          )}
        </Container>
      </div>
    </React.Fragment>
  );
};

export default TruckLoadOptimisation;
