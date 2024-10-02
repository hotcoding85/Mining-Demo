import "./index.css";
import React, { useMemo } from "react";
import { Col, Container, Row } from "reactstrap";
import Breadcrumb from "Components/Common/Breadcrumb";
import { useSelector } from "react-redux";
import {
  FLEET_TIME_STATE_COLOR,
  LAYOUT_MODE_TYPES,
} from "Components/constants/layout";
import RadicalGraph from "Components/Common/RadicalGraph";
import EfficiencyRatingBar from "./componenets/EfficiencyRatingBar";
import TruckingSummary from "./componenets/TruckingSummary";
import { Select, Space } from "antd";
import { LayoutSelector } from "selectors";

const TruckingDashboard = (props: any) => {
  document.title = "Trucking Plan vs Actual | FMS Live";

  const { layoutModeType } = useSelector(LayoutSelector);

  const isLight = useMemo(
    () => layoutModeType === LAYOUT_MODE_TYPES.LIGHT,
    [layoutModeType]
  );

  const generateRandomPercentages = (numStates: number) => {
let percentages: number[] = [];

let total: number = 100;

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
      <div className="page-content turcking-state">
        <Container fluid>
          <Breadcrumb
            title="Dashboards"
            breadcrumbItem="Trucking Plan vs Actual"
          />
          <Row>
            <Col className='d-flex flex-row-reverse'>
              <Space>
                <Select
                  className="basic-single"
                  id="filter"
                  showSearch
                  placeholder="Filter"
                  // styles={customStyles}
                  style={{ width: '150px' }}
                  options={[{ value: 'All', label: 'All' }, 
                    {
                      label: <span>Models</span>,
                      title: 'Models',
                      options: [
                        { value: 'HD785', label: 'HD785' }, { value: 'HD1500-7', label: 'HD1500-7' }, { value: 'HD1500-8', label: 'HD1500-8' }
                      ],
                    },
                    {
                      label: <span>Fleet</span>,
                      title: 'Fleet',
                      options: [
                        { value: 'Fleet 1', label: 'Fleet 1' }, { value: 'Fleet 2', label: 'Fleet 2' }, { value: 'Fleet 3', label: 'Fleet 3' }
                      ],
                    },
                    ]} 
                />
              </Space>
            </Col>
          </Row>
          <Row>
            <Col lg="12" className="mt-3">
              <RadicalGraph truckStates={StateTimes} />
            </Col>
          </Row>

          <Row className="mt-3">
            <Col lg="12">
              <TruckingSummary />
            </Col>
          </Row>

          <Row className="mt-3 mb-3">
            <Col lg="12">
              <EfficiencyRatingBar value="excellent" />
            </Col>
          </Row>
        </Container>
      </div>
    </React.Fragment>
  );
};

export default TruckingDashboard;
