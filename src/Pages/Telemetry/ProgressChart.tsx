import React from 'react';
import { Row, Col, Progress } from 'reactstrap';
import Chart from 'react-apexcharts';

const ProgressChart = ({ progress, value, total, text, height }) => {
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
            offsetX: 10,
            fontSize: '33px',
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
        <div style={{ paddingTop: '50px', paddingBottom: '50px'}}>
          <Progress value={value} />
          <span>{text}</span>
        </div>
      </Col>
    </Row>
  );
};

export default ProgressChart;
