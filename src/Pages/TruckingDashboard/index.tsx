import React, { useMemo } from "react";
import { Card, CardBody, Col, Container, Row } from "reactstrap";
import Breadcrumb from "Components/Common/Breadcrumb";
import { useSelector } from "react-redux";
import { createSelector } from "reselect";
import {
  FLEET_TIME_STATE_COLOR,
  LAYOUT_MODE_TYPES,
} from "Components/constants/layout";
import "./index.css";
import TruckingState from "./componenets/TruckingState";
import EfficiencyRatingBar from "./componenets/EfficiencyRatingBar";
import TruckingSummary from "./componenets/TruckingSummary";

const TruckingDashboard = (props: any) => {
  document.title = "Trucking Plan vs Actual | FMS Live";

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
        pctValue: 70,
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
        pctValue: 54,
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
      <div className="page-content turcking-state">
        <Container fluid>
          <Breadcrumb
            title="Dashboards"
            breadcrumbItem="Trucking Plan vs Actual"
          />
          <Row>
            <Col lg="12">
              <TruckingState truckStates={StateTimes} />
            </Col>
          </Row>
          <Row className="mt-3">
            <Col lg="12">
              <EfficiencyRatingBar value="excellent" />
            </Col>
          </Row>
          <Row className="mt-3">
            <Col lg="12">
              <TruckingSummary />
            </Col>
          </Row>
        </Container>
      </div>
    </React.Fragment>
  );
};

export default TruckingDashboard;
