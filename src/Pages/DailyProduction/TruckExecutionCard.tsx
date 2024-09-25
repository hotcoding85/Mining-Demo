import React from 'react';
import { CardBody, CardTitle, Progress, Col } from 'reactstrap';
import Chart from 'react-apexcharts';
import LineGraph from "./LineGraph";

// Renaming CustomCardBody to TruckingExecutionCard based on its usage
function TruckingExecutionCard({ options, series, cardTitle, progressValue, progressMax, forecast, forecastColor }) {
  return (
    <Col md="6">
      <CardBody>
        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'flex-start' }}>
          <div style={{ width: '200px', height: '200px' }}>
            <Chart options={options} series={series} type="radialBar" />
          </div>
          <div>
              <CardTitle>{cardTitle}</CardTitle>
              <p>ROM Delivered {progressValue} of {progressMax} loads</p>
              <div>
                
              <div style={{ position: 'relative', paddingBottom: '30px', fontSize: '12px' }}>
                <div style={{
                    position: 'absolute',
                    right: '0',
                    top: '-20px',
                    color: 'white',
                }}>
                    Shiftened Forecast: 
                    <span style={{
                        backgroundColor: forecastColor,
                        color: 'white',
                        borderRadius: '10px',
                        padding: '2px',
                        border: '2px solid white'
                    }}>
                        {forecast}
                    </span>
                    <div style={{
                        height: '10px',
                        width: '2px',
                        borderRight: '2px dashed ' + forecastColor,
                        marginTop: '5px',
                        marginLeft: '125px'
                    }}/>
                </div>
                <Progress value={progressValue} max={progressMax} style={{ height: '15px' }}>Completed: {progressValue} of {progressMax}</Progress>
              </div>
            </div>
          </div>
        </div>
        <LineGraph />
      </CardBody>
    </Col>
  );
}

export default TruckingExecutionCard;
