import React, { useState, useEffect } from 'react';
import { Container, Card, CardBody, CardTitle, Progress, Row, Col } from 'reactstrap';
import Chart from 'react-apexcharts';
import ProgressChart from './ProgressChart';
import PerformanceIndicator from './PerformanceIndicator';
import OperationalDelays from './OperationalDelays'; // palitan ito ng tamang path
import { hd1500 } from 'assets/images/equipment';

const Telemetry = () => {
    document.title = 'Telemetry | FMS Live';
  const [progress, setProgress] = useState(52); // Initial progress value
  const [currentTruckingProgress, setCurrenTruckingProgress] = useState(52); // Initial progress value
  const [annualProgress, setAnnualProgress] = useState(52); // Initial progress value
  const [annualForecast, setAnnualForecast] = useState(100); // Initial progress value
  const [availabilityProgress, setAvailabilityProgress] = useState(52); // Initial progress value
  const [utilizationProgress, setUtilizationProgress] = useState(52); // Initial progress value
  const [delaysProgress, setDelaysProgress] = useState(52); // Initial progress value
  const [operationalProgress, setOperationalProgress] = useState(52); // Initial progress value
  const [operationalValuesProgress, setOperationalValuesProgress] = useState({
        planned: 30,
        cleanup: 40,
        weather: 50,
        fueling: 60,
        idling: 70,
    });
  const [totalTrips, setTotalTrips] = useState(600); // Total number of trips
  const [completedTrips, setCompletedTrips] = useState(301); // Number of completed trips
  const wasteMaterialData = 50;
  const totalROMOreData = 75;

  const dtData = Array.from({length: 12}, (_, i) => ({ // Create an array for DT01 to DT012
    id: `DT${String(i+1).padStart(2, '0')}`,
    total: 23,
    completed: Math.floor(Math.random() * 24), // Random number of completed trips for each DT
  }));

  useEffect(() => {
    // Update the progress, totalTrips, and completedTrips here based on real data
  }, []);

  return (
    <React.Fragment>
        <div className="page-content">
            <Container fluid>
                <Row>
                    <Col md={4}>
                        <Card style={{border: '2px solid white', borderRadius: '5px'}}>
                            <CardBody>
                                <CardTitle>CURRENT Trucking Execution to Plan</CardTitle>
                                <ProgressChart 
                                    progress={currentTruckingProgress}
                                    total={totalTrips}
                                    value={completedTrips}
                                    text={`${completedTrips} of ${totalTrips} Trips Completed`}
                                    height={"500"}
                                />
                                {dtData.map(({ id, total, completed }) => (
                                    <div key={id} style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
                                        <div style={{ width: '50px' }}>{id}</div>
                                        <div style={{ flex: '1' }}>
                                            <Progress value={(completed / total) * 100} />
                                            <p style={{ margin: '0' }}>{`${completed} of ${total} Trips Completed`}</p>
                                        </div>
                                    </div>
                                ))}
                            </CardBody>
                        </Card>
                    </Col>
                    <Col md={4}>
                        <Card>
                            <CardBody>
                                <CardTitle>TRUCKING PERFORMANCE</CardTitle>
                                <img src={hd1500} alt="Selected Truck" width={300} height={200} />
                                <div style={{border: '2px solid white', borderRadius: '5px', padding: '20px'}}>
                                    <PerformanceIndicator title="Waste Material" moved="135,855T" target={15500} />
                                    <PerformanceIndicator title="Total ROM Ore" moved="11,223T" target={15500} />
                                </div>
                            </CardBody>
                        </Card>
                    </Col>
                    <Col md={4}>
                        <Card>
                            <CardBody>
                                <div style={{border: '2px solid white', borderRadius: '5px', padding: '20px'}}>
                                    <CardTitle>Trucking Anuals N/S</CardTitle>
                                    <div style={{ position: 'relative', paddingBottom: '30px', fontSize: '12px'}}>
                                        <div style={{
                                            position: 'absolute',
                                            right: '0',
                                            top: '30px',
                                            color: 'white',
                                        }}>
                                            <span style={{
                                                backgroundColor: 'red',
                                                color: 'white',
                                                borderRadius: '10px',
                                                padding: '2px',
                                                border: '2px solid white',
                                                marginLeft: '115px'
                                            }}>
                                                {annualForecast}
                                            </span>
                                            <div style={{
                                                height: '10px',
                                                width: '2px', 
                                                position: 'relative',
                                                borderRight: '2px dashed ' + 'red',
                                                marginTop: '5px',
                                                marginLeft: '125px',
                                                zIndex: 999 
                                            }}/>
                                        </div>
                                        <ProgressChart 
                                            progress={annualProgress}
                                            total={totalTrips}
                                            value={completedTrips}
                                            text={`Trips ${completedTrips} of ${totalTrips}`}
                                            height={"500"}
                                        />
                                    </div>
                                </div>
                                <div style={{border: '2px solid white', borderRadius: '5px', padding: '20px'}}>
                                    <CardTitle>ORE Target/Plan Execution</CardTitle>
                                    <ProgressChart 
                                        progress={availabilityProgress}
                                        total={totalTrips}
                                        value={completedTrips}
                                        text={`Availability`}
                                        height={"500"}
                                    />
                                    <ProgressChart 
                                        progress={utilizationProgress}
                                        total={totalTrips}
                                        value={completedTrips}
                                        text={`Utilization`}
                                        height={"500"}
                                    />
                                    <ProgressChart 
                                        progress={delaysProgress}
                                        total={totalTrips}
                                        value={completedTrips}
                                        text={`Delays`}
                                        height={"500"}
                                    />
                                    <CardTitle>Operational Delays</CardTitle>
                                    <OperationalDelays 
                                        progress={operationalProgress} 
                                        value={operationalValuesProgress} 
                                        height={"350"} 
                                    />
                                </div>
                            </CardBody>
                        </Card>
                    </Col>
                </Row>
            </Container>
        </div>
    </React.Fragment>
  );
};

export default Telemetry;
