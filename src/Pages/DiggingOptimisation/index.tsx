import React, { useState } from "react";
import { Col, Container, Row } from "reactstrap";
import Breadcrumb from "Components/Common/Breadcrumb";
import { Tabs, TabsProps } from "antd";
import "./styles/DiggingOptimisation.scss";
import DiggingOptimisationTableView from "./components/DiggingOptimisationTableView";
import DiggingOptimisationMapView from "./components/DiggingOptimisationMapView";
import DiggingOptimisationVisualView from "./components/DiggingOptimisationVisualView";

const DiggingOptimisation = (props: any) => {
  document.title = "Digger Ore Tracking | FMS Live";

  const [displayType, setDisplayType] = useState("VISUAL");

  const tabItems: TabsProps["items"] = [
    {
      key: "visual",
      label: "Visual Analytics",
    },
    {
      key: "table",
      label: "Table View",
    },
    {
      key: "map",
      label: "Map View",
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
      <div className="page-content">
        <Container className="digging-optimisation" fluid>
          <Breadcrumb
            title="Mine Dynamics"
            breadcrumbItem="Digger Ore Tracking"
          />
          <Row>
            <Col lg="12">
              <Tabs
                className="digging-optimisation-tabs"
                defaultActiveKey="1"
                items={tabItems}
                onChange={onTabChange}
              />
            </Col>
          </Row>

          {displayType === "TABLE" ? (
            <DiggingOptimisationTableView />
          ) : displayType === "MAP" ? (
            <DiggingOptimisationMapView />
          ) : (
            <DiggingOptimisationVisualView />
          )}
        </Container>
      </div>
    </React.Fragment>
  );
};

export default DiggingOptimisation;
