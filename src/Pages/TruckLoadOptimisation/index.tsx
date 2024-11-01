import React, { useCallback, useEffect, useState } from "react";
import { Col, Container, Row } from "reactstrap";
import { Segmented, Tabs, TabsProps } from "antd";
import Breadcrumb from "Components/Common/Breadcrumb";
import TruckLoadOptimisationMapView from "./components/TruckLoadOptimisationMapView";
import TruckLoadOptimisationTableView from "./components/TruckLoadOptimisationTableView";
import "./styles/index.scss";
import { TextColor } from "Components/Charts/interfaces/general";
import TruckLoadProfileView from "./components/TruckLoadProfileView";
import SearchDropdown from "./components/SearchDropdown";

const TruckLoadOptimisation = (props: any) => {
  document.title = "Truck Load Optimisation | FMS Live";

  const [displayType, setDisplayType] = useState("TABLE");
  const [fleetMode, setFleetMode] = useState<string>("CURRENT_SHIFT");
  const tabItems: TabsProps["items"] = [
    {
      key: "table",
      label: "Analysis",
    },
    {
      key: "map",
      label: "Map View",
    },
    // {
    //   key: "profile",
    //   label: "Truck Load Profile",
    // },
  ];

  const filters = {
    model: [
      {
        label: "HD1500",
        value: "HD1500",
      },
      {
        label: "HD785",
        value: "HD785",
      },
    ],
    fleet: [
      {
        label: "Fleet1",
        value: "EX201",
      },
      {
        label: "Fleet2",
        value: "EX202",
      },
      {
        label: "Fleet3",
        value: "EX205",
      },
    ],
  };

  const [selectedValues, setSelectedValues] = useState<{
    [key: string]: string[];
  }>({ "model": ['HD1500', 'HD785'] });

  const onTabChange = (key: string) => {
    if (key === "table") {
      setDisplayType("TABLE");
    } else if (key === "map") {
      setDisplayType("MAP");
    } else {
      setDisplayType("PROFILE");
    }
  };

  const onApply = useCallback(() => {
    if (Object.keys(selectedValues).length === 0) return
  }, [selectedValues])

  return (
    <React.Fragment>
      <div className="page-content col-lg-12">
        <Container className="truck-optimisation" fluid>
          <Breadcrumb
            title="Mine Dynamics"
            breadcrumbItem="Truck Load Optimisation"
          />
          <Row>
            <Col lg="6" md="6" sx="12">
              <Tabs
                className="truck-optimisation-tabs"
                defaultActiveKey="1"
                items={tabItems}
                onChange={onTabChange}
              />
            </Col>
            <Col lg="6" md="6" xs="12" className="mb-3 truck-load-optimisation-filter">
              <Segmented
                className="customSegmentLabel customSegmentBackground pr-3"
                value={fleetMode}
                onChange={(e) => setFleetMode(e)}
                options={[
                  { label: "Previous Shift", value: "PREVIOUS_SHIFT" },
                  { label: "Current Shift", value: "CURRENT_SHIFT" },
                ]}
              />

              <SearchDropdown
                itemsGroup={filters}
                disableTitle={false}
                disableDivider={false}
                onApply={onApply}
                selectedValues={selectedValues}
                setSelectedValues={setSelectedValues}
              />
            </Col>
          </Row>

          {displayType === "TABLE" ? (
            <TruckLoadOptimisationTableView selectedValues={selectedValues} />
          ) : (
            <TruckLoadOptimisationMapView />
          )
          }
        </Container>
      </div>
    </React.Fragment>
  );
};

export default TruckLoadOptimisation;
