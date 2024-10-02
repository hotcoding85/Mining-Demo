import "Pages/DiggingDashboard/style.css";

import React, { useMemo } from "react";
import { Card, Col, Container, Row } from "reactstrap";
import Breadcrumb from "Components/Common/Breadcrumb";
import { useSelector } from "react-redux";
import {
  FLEET_TIME_STATE_COLOR,
  LAYOUT_MODE_TYPES,
} from "Components/constants/layout";
import RadicalGraph from 'Components/Common/RadicalGraph'
import EfficiencyRating from "./EfficiencyRating";
import DiggingSummary from "./DiggingSummary";
import EfficiencyMetrics from "./EfficiencyMetrics";
import { LayoutSelector } from "selectors";

const DiggingDashboard = (props: any) => {
  document.title = "Digging Plan vs Actual | FMS Live";

  const { layoutModeType } = useSelector(LayoutSelector);

  const isLight = useMemo(
    () => layoutModeType === LAYOUT_MODE_TYPES.LIGHT,
    [layoutModeType]
  );

  const generateRandomPercentages = (numStates: number): number[] => {
    let total = 100;
    let percentages: number[] = [];

    for (let i = 0; i < numStates - 1; i++) {
      let randomValue: number = Math.random() * total;
      randomValue = Math.round(randomValue);
      percentages.push(randomValue);
      total -= randomValue;
    }
    percentages.push(total); 
    return percentages;
  };

  const StateTimes = useMemo(() => {
    const textColor = isLight ? "#2A2A2A" : "#fff";
    const bgColor = isLight ? "#E0E0E0" : "#535E77";

    const percentages = generateRandomPercentages(5);

    return [
      {
        state: "Active",
        pctValue: percentages[0],
        color: FLEET_TIME_STATE_COLOR.ACTIVE,
        bgColor: bgColor,
        textColor: textColor,
      },
      {
        state: "StandBy",
        pctValue: percentages[1],
        color: FLEET_TIME_STATE_COLOR.STANDBY,
        bgColor: bgColor,
        textColor: textColor,
      },
      {
        state: "Down",
        pctValue: percentages[2],
        color: FLEET_TIME_STATE_COLOR.DOWN,
        bgColor: bgColor,
        textColor: textColor,
      },
      {
        state: "Idle",
        pctValue: percentages[3],
        color: isLight ? "#828282" : "#fff",
        bgColor: bgColor,
        textColor: textColor,
      },
      {
        state: "Delay",
        pctValue: percentages[4],
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
            <Col lg="12">
              <EfficiencyRating value="good" />
            </Col>
          </Row>

        </Container>
      </div>
    </React.Fragment>
  );
};

export default DiggingDashboard;
