import React, { useState } from "react";
import { Col, Container, Row } from "reactstrap";
import Breadcrumb from "Components/Common/Breadcrumb";
import { Tabs, TabsProps } from "antd";
import "./styles/DiggingOptimisation.scss";
import DiggingOptimisationTableView from "./components/DiggingOptimisationTableView";
import DiggingOptimisationMapView from "./components/DiggingOptimisationMapView";
import DiggingOptimisationVisualView from "./components/DiggingOptimisationVisualView";

const DiggingOptimisation = (props: any) => {
  document.title = "Digging Optimisation | FMS Live";

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
      <div className="page-content">
        <Container className="digging-optimisation" fluid>
          <Breadcrumb
            title="Mine Dynamics"
            breadcrumbItem="Digging Optimisation"
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
