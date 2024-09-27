import React, { useMemo, useState } from "react";
import { Card, CardBody, Col, Container, Row } from "reactstrap";
import Breadcrumb from "Components/Common/Breadcrumb";
import "./maintenance-status.css";
import MaintenanceStatusHeader from "./components/MaintenanceStatusHeader";
import { DATA_VIEW_MODE } from "Components/constants/constants";
import { useSelector } from "react-redux";
import { createSelector } from "reselect";
import { groupBy } from "lodash";
import FleetGridView from "./components/FleetGridView";
import FleetTableView from "./components/FleetTableView";

const FleetOrder = ["DUMP_TRUCK", "EXCAVATOR", "LOADER"];

const MaintenanceStatus = (props: any) => {
  document.title = "Maintenance Status | FMS Live";

  const [viewMode, setViewMode] = useState<string>(DATA_VIEW_MODE.TABLE);

  const selectProperties = createSelector(
    (state: any) => state.Fleet,
    (fleetState) => ({
      fleetList: fleetState.data,
      loading: fleetState.loading,
    })
  );

  const { fleetList, loading } = useSelector(selectProperties);

  const normalizedFleetList = useMemo(
    () => groupBy(fleetList, (fleet) => fleet.category),
    [fleetList]
  );

  return (
    <React.Fragment>
      <div className="page-content maintenance-status">
        <Container fluid>
          <Breadcrumb title="Maintenance" breadcrumbItem="Maintenance Status" />
          <Row>
            <Col lg="12">
              <MaintenanceStatusHeader
                viewMode={viewMode}
                onChangeViewMode={setViewMode}
              />
            </Col>

            {viewMode === DATA_VIEW_MODE.TABLE && (
              <Col lg="12">
                <Card>
                  <CardBody>
                    <FleetTableView
                      fleetOrder={FleetOrder}
                      fleetData={normalizedFleetList}
                    />
                  </CardBody>
                </Card>
              </Col>
            )}
          </Row>
          <Row>
            {viewMode === DATA_VIEW_MODE.GRID && (
              <FleetGridView
                fleetOrder={FleetOrder}
                fleetData={normalizedFleetList}
              />
            )}
          </Row>
        </Container>
      </div>
    </React.Fragment>
  );
};

export default MaintenanceStatus;
