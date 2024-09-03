import React from 'react';
import { CardBody, Row, Col, Card, CardImg, Container } from 'reactstrap';
import Chart from 'react-apexcharts';

import { BarGraph } from "../../Components/Charts/BarChart";
import TonnesBarGraph from "./TonnesBarGraph";
import { Progress } from 'antd';
import { TextColor } from 'Components/Charts/interfaces/general';

// Renaming MiningTruckGraphCard to DetailedTruckingExecutionCard based on its usage
function TruckingExecutionCard({ imgSrc, altText, title, cardTitle, progressValue, progressMax, series, operationalDelay, availability, tbSeries, forecast, forecastColor }) {

  const barData = {
    labels: [
      "DT01",
      "DT02",
      "DT03",
      "DT04",
      "DT05",
      "DT06",
      "DT07",
      "DT08",
      "DT09",
      "DT10",
      "DT11",
      "DT12",
    ],
    datasets: [
      {
        label: "Plan",
        data: [23, 21, 15, 18, 20, 21, 23, 15, 20, 13, 5, 3],
        backgroundColor: "#9CA3B1",
        barPercentage: 1,
        categoryPercentage: 0.4,
        barThickness: 17,
        borderRadius: {
          topLeft: 3,
          topRight: 3,
        },
      },
      {
        label: "Actual",
        data: [21, 18, 14, 20, 19, 22, 19, 13, 18, 9, 3, 3],
        backgroundColor: "#535E77",
        barPercentage: 1,
        categoryPercentage: 0.4,
        barThickness: 17,
        borderRadius: {
          topLeft: 3,
          topRight: 3,
        },
      },
    ],
  };

  const barOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top" as const,
        display: false,
      },
      datalabels: {
        anchor: "start" as const,
        align: "end" as const,
        color: "#fff",
        font: {
          size: 10,
          weight: "bold" as const,
        },
        formatter: (value: number) => value,
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
      },
      y: {
        grid: {
          display: true,
          color: "#9CA3B1",
          lineWidth: 0.2,
        },
      },
    },
  };

  const textColor: TextColor[] = [
    { text: "Plan", color: "#9CA3B1" },
    { text: "Actual", color: "#535E77" },
  ];


  return (
    <>
      <Card className="text-center" style={{ height: 'auto' }}>
        {/* <CardBody className="d-flex justify-content-center align-items-center"> */}
        <CardBody>
          <Row>
            <h2 className='text-start'>{title}</h2>
            <Col lg={2} className="d-flex align-items-center justify-content-center">
              <CardImg
                top
                src={imgSrc}
                alt="image"
                style={{ width: '80%', marginBottom: '20px' }}
              />
              {/* <Progress className='mt-4' value={progressValue} max={progressMax} style={{ height: '30px' }}>{progressValue} of {progressMax}</Progress> */}
              {/* <Progress strokeLinecap="butt" percent={progressValue} /> */}
            </Col>
            <Col lg={2} className='d-flex align-items-center my-auto'>
              <div>
                <Progress type="dashboard" percent={series} />
              </div>
            </Col>
            <Col lg={6}>
              <BarGraph
                data={barData}
                options={barOptions}
                textColor={textColor}
              />
            </Col>
            {/* <Col lg={3}>
              <Chart
                options={barGraphOptions}
                series={tbSeries}
                type="bar"
              />
            </Col> */}
          </Row>
        </CardBody>
      </Card>
    </>
  );
}

export default TruckingExecutionCard;

