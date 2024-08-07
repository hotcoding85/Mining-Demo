import React from 'react';
import { Row, Col, Progress } from 'reactstrap';
import Chart from 'react-apexcharts';

const OperationalDelays = ({ progress, value, height }) => {
  const options = {
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
            fontSize: '30px',
          },
        },
      },
    },
  };
  return (
    <Row>
      <Col md={6}>
        <Chart
          options={options}
          series={[progress]}
          type="radialBar"
          height={height}
        />
      </Col>
      <Col md={6}>
        <div>
          <Progress value={value.planned} />
          <span>Planned</span>
          <Progress value={value.cleanup} />
          <span>Clean up</span>
          <Progress value={value.weather} />
          <span>Weather</span>
          <Progress value={value.fueling} />
          <span>Fueling</span>
          <Progress value={value.idling} />
          <span>Truck Idling-No identifiable cause</span>
        </div>
      </Col>
    </Row>
  );
};

export default OperationalDelays;
