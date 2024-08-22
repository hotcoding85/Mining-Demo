import React, { useEffect, useState } from 'react';
import { Container, Card, CardBody, CardTitle, Progress, Row, Col } from 'reactstrap';
import Chart from 'react-apexcharts';
import Breadcrumb from 'Components/Common/Breadcrumb';

import ProgressIndicator from './ProgressIndicator';
import BarGraph from './BarGraph';
import LineGraph from './LineGraph';
import { hd1500 } from 'assets/images/equipment';

const OreTracker = () => {
  document.title = "Ore Tracker | FMS Live";

  let color = '#F44336'
  var options = {
    plotOptions: {
        radialBar: {
            startAngle: 0,
            endAngle: 360,
            dataLabels: {
                name: {
                  show: false, 
                },
                value: {
                  color: '#FFFFFF', 
                  offsetY: 10, 
                  fontSize: '2em', 
                },
            }
        }
    },
    fill: {
        colors: [color]
    },
    labels: ['Utilization'],
  };
  const [romTonnesExtraction, setRomTonnesExtraction] = useState({
    options: options,
    series: [62.5],
    value: 340,
    max: 600
  });

  const [wasteExtraction, setWasteExtraction] = useState({
    options: options,
    series: [62.5],
    value: 340,
    max: 600
  });

  
  const [romOreMoved, setRomOreMoved] = useState({
    title: "Current ROM Ore (T) Moved",
    percentage: 62.5,
    color: "#e6cc00",
    direction: "down",
    label: "Completed 340 of 600",
    progressColor: "yellow",
    targetPlan: "Truck"
  });

  const [wasteExecution, setWasteExecution] = useState({
    title: "Waste Target/Plan Execution",
    percentage: 64.5,
    color: "#00b300",
    direction: "up",
    label: "Completed 340 of 600",
    progressColor: "yellow",
    targetPlan: "Digging"
  });

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid>
          <Breadcrumb title="Dashboards" breadcrumbItem="Ore Tracker" />
          <Row>
            <Col md={3}>
                <Card>
                    <CardBody>
                        <div style={{ marginBottom: '20px', textAlign: 'center' }}>
                            <CardTitle>ROM Tonnes Extraction</CardTitle>
                            <CardTitle>(Last Month)</CardTitle>
                            <Chart options={romTonnesExtraction.options}
                                    series={romTonnesExtraction.series}
                                    type="radialBar" />
                            <Progress value={romTonnesExtraction.value} max={romTonnesExtraction.max}>Completed {romTonnesExtraction.value} of {romTonnesExtraction.max}</Progress>
                        </div>
                        <div style={{ marginBottom: '20px', textAlign: 'center' }}>
                            <CardTitle>Waste Extraction</CardTitle>
                            <CardTitle>(Last Month)</CardTitle>
                            <Chart options={wasteExtraction.options}
                                    series={wasteExtraction.series}
                                    type="radialBar" />
                            <Progress value={wasteExtraction.value} max={wasteExtraction.max}>Achieved {wasteExtraction.value} of {wasteExtraction.max}</Progress>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                            <CardTitle>Day 8 of Month</CardTitle>
                            <CardTitle>August</CardTitle>
                        </div>
                    </CardBody>
                </Card>
            </Col>
            <Col md={9}>
                <Row>
                    <Col>
                        <ProgressIndicator
                            title={romOreMoved.title}
                            percentage={romOreMoved.percentage}
                            color={romOreMoved.color}
                            direction={romOreMoved.direction}
                            label={romOreMoved.label}
                            progressColor={romOreMoved.progressColor}
                            targetPlan={romOreMoved.targetPlan}
                        />
                    </Col>
                    <Col>
                        <ProgressIndicator
                            title={wasteExecution.title}
                            percentage={wasteExecution.percentage}
                            color={wasteExecution.color}
                            direction={wasteExecution.direction}
                            label={wasteExecution.label}
                            progressColor={wasteExecution.progressColor}
                            targetPlan={wasteExecution.targetPlan}
                        />
                    </Col>
                    <Col style={{ marginBottom: '20px', textAlign: 'center', border: '2px solid white', borderRadius: '5px' }}>
                        <CardTitle>ROM Loader</CardTitle>
                        <img src={hd1500} alt="Selected Truck" width={300} height={200} />
                    </Col>
                </Row>
                <Row style={{ border: '2px solid white', borderRadius: '5px', padding: '10px' }}>
                    <Col>
                        <LineGraph />
                        <div style={{ flex: '1' }}>
                        <p style={{ margin: '0' }}>{`ROM-ORE Trend`}</p>
                            <Progress value="50" />
                        </div>
                    </Col>
                    <Col style={{textAlign: 'center'}}>
                        <CardTitle>Forecast</CardTitle>
                        <div style={{ marginTop: '70px' }}>
                            <svg height="90" width="120">
                                <polygon points="45,90 90,0 0,0" style={{fill:'#00b300',stroke:"purple",strokeWidth:1}} />
                            </svg>
                            <CardTitle>{"TRENDING BACK UP"}</CardTitle>
                        </div>
                    </Col>
                    <Col>
                        <CardTitle>ORE on ROM RECORDED (K T's)</CardTitle>
                        <BarGraph />
                    </Col>
                </Row>
            </Col>
          </Row>
        </Container>
      </div>
    </React.Fragment >
  );
}

export default OreTracker;
