import React from 'react';
import { CardBody, CardTitle, Progress, Row, Col } from 'reactstrap';
import Chart from 'react-apexcharts';
import BarGraph from "./BarGraph";
import TonnesBarGraph from "./TonnesBarGraph";

// Renaming MiningTruckGraphCard to DetailedTruckingExecutionCard based on its usage
function TruckingExecutionCard({ imgSrc, altText, title, cardTitle, progressValue, progressMax, series, operationalDelay, availability, tbSeries, forecast, forecastColor }) {
    const truckChartOptions = {
        plotOptions: {
          radialBar: {
            dataLabels: {
              name: {
                show: false, 
              },
              value: {
                color: '#FFFFFF', 
                offsetY: 10, 
                fontSize: '36px', 
              },
            },
          },
        },
      };
    const statusChartOptions = {
        plotOptions: {
          radialBar: {
            dataLabels: {
              name: {
                show: false, 
              },
              value: {
                color: '#FFFFFF', 
                offsetY: 10, 
                fontSize: '30px', 
              },
            },
          },
        },
      };
    return (
      <Col md={12}>
        <CardBody>
          <Row style={{padding: '10px'}}>
              <Col>
                  <Row>
                      <Col>
                          <CardTitle>{title}</CardTitle>
                      </Col>
                      <Col>
                          <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'flex-start' }}>
                              <img src={imgSrc} alt={altText} style={{ width: '150px', height: 'auto' }} />
                              <div style={{ width: '200px', height: '200px', position: 'relative' }}>
                                  <Chart options={truckChartOptions} series={series} type="radialBar" />
                              </div>
                          </div>
                      </Col>
                      <Col>
                        <div style={{ position: 'relative', paddingBottom: '30px' }}>
                          <div style={{
                              position: 'absolute',
                              right: '0',
                              top: '-30px',
                              color: 'white',
                          }}>
                              Forecast: 
                              <span style={{
                                  backgroundColor: forecastColor,
                                  color: 'white',
                                  borderRadius: '10px',
                                  padding: '5px',
                                  border: '2px solid white'
                              }}>
                                  {forecast}
                              </span>
                              <div style={{
                                  height: '20px',
                                  width: '2px',
                                  borderRight: '2px dashed ' + forecastColor,
                                  marginTop: '5px',
                                  marginLeft: '75px'
                              }}/>
                          </div>
                          <Progress value={progressValue} max={progressMax} style={{ height: '20px', marginTop: '30px' }}>Completed: {progressValue} of {progressMax}</Progress>
                      </div>

                      </Col>
                  </Row>
              </Col>
              <Col className="d-flex flex-column align-items-center">
                  <CardTitle style={{ fontSize: "13px" }}>Total Tonnes(K Ts')</CardTitle>
                  <TonnesBarGraph className="flex-shrink-0" series={tbSeries}/>
              </Col>
              <Col className="d-flex flex-column align-items-center">
                  <CardTitle style={{ fontSize: "13px" }}>DIGGING - Total Tonnes Per Hour (K Ts')</CardTitle>
                  <BarGraph />
              </Col>
              <Col className="d-flex flex-column align-items-center">
                  <CardTitle>Operational Delays</CardTitle>
                  <div style={{ width: '160px', height: '100px' }}>
                      <Chart options={statusChartOptions} series={operationalDelay} type="radialBar" />
                  </div>
                  <CardTitle>Availabilty</CardTitle>
                  <div style={{ width: '160px', height: '100px' }}>
                      <Chart options={statusChartOptions} series={availability} type="radialBar" />
                  </div>
              </Col>
          </Row>
        </CardBody>
      </Col>
    );
}

export default TruckingExecutionCard;
  
