import "Pages/DiggingDashboard/style.css";

import React, { useMemo } from "react";
import { Card, Col, Container, Row } from "reactstrap";
import Breadcrumb from "Components/Common/Breadcrumb";
import { useSelector } from "react-redux";
import { createSelector } from "reselect";
import {
  FLEET_TIME_STATE_COLOR,
  LAYOUT_MODE_TYPES,
} from "Components/constants/layout";
import RadicalGraph from 'Components/Common/RadicalGraph'
import EfficiencyRating from "./EfficiencyRating";
import DiggingSummary from "./DiggingSummary";
import EfficiencyMetrics from "./EfficiencyMetrics";

const DiggingDashboard = (props: any) => {
  document.title = "Digging Plan vs Actual | FMS Live";

  const { layoutModeType } = useSelector(
    createSelector(
      (state: any) => state.Layout,
      (layout) => ({
        layoutModeType: layout.layoutModeTypes,
      })
    )
  );

  const isLight = useMemo(
    () => layoutModeType === LAYOUT_MODE_TYPES.LIGHT,
    [layoutModeType]
  );

  const StateTimes = useMemo(() => {
    const textColor = isLight ? "#2A2A2A" : "#fff";
    const bgColor = isLight ? "#E0E0E0" : "#535E77";

    return [
      {
        state: "Active",
        time: "00:24:52",
        pctValue: 72,
        color: FLEET_TIME_STATE_COLOR.ACTIVE,
        bgColor: bgColor,
        textColor: textColor,
      },
      {
        state: "StandBy",
        time: "00:24:52",
        pctValue: 64,
        color: FLEET_TIME_STATE_COLOR.STANDBY,
        bgColor: bgColor,
        textColor: textColor,
      },
      {
        state: "Down",
        time: "00:24:52",
        pctValue: 58,
        color: FLEET_TIME_STATE_COLOR.DOWN,
        bgColor: bgColor,
        textColor: textColor,
      },
      {
        state: "Idle",
        time: "00:24:52",
        pctValue: 58,
        color: isLight ? "#828282" : "#fff",
        bgColor: bgColor,
        textColor: textColor,
      },
      {
        state: "Delay",
        time: "00:24:52",
        pctValue: 65,
        color: FLEET_TIME_STATE_COLOR.DELAY,
        bgColor: bgColor,
        textColor: textColor,
      },
    ];
  }, [layoutModeType, isLight]);


  return (
    <React.Fragment>
      <div className="page-content digging-state">
        <Container fluid>
          <Breadcrumb
            title="Dashboards"
            breadcrumbItem="Digging Plan vs Actual"
          />

          <Row>
            <Col lg="12" className="mt-3">

              <RadicalGraph truckStates={StateTimes} />
            </Col>
          </Row>

          <Row className="mt-3">
            <Col lg="8">
              <EfficiencyMetrics />
            </Col>
            <Col lg="4">
              <Card className="state-card" style={{height:'90%'}}>
                <div className="d-flex flex-column align-items-center">
                  <h3 className="text-center">Tonnes Per Hour</h3>
                  <div className="d-flex align-items-center justify-content-center w-100">
                    <span style={{fontSize:'64px', marginTop:'72px'}}>450 t</span>
                  </div>
                </div>
              </Card>
            </Col>
          </Row>

          <Row className="mt-3 mb-3">
            <Col lg="12">
              <DiggingSummary />
            </Col>
          </Row>

          <Row className="mt-3">
            <Col lg="6">
              <EfficiencyRating value="good" />
            </Col>
          </Row>

        </Container>
      </div>
    </React.Fragment>
  );
};

export default DiggingDashboard;
