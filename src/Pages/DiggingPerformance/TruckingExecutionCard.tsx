import React from 'react';
import { CardBody, CardTitle, Progress, Row, Col, Card, CardImg, Container } from 'reactstrap';
import Chart from 'react-apexcharts';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
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
            fontSize: '30px',
          },
        },
      },
    },
  };

  const barGraphOptions = {
    chart: {
      toolbar: {
        show: false,
      },
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "45%",
        endingShape: "rounded",
      },
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      show: true,
      width: 2,
      colors: ["transparent"],
    },

    colors: ['#808080', '#ff0000'],
    xaxis: {
      categories: [
        'WASTE',
        'ROM ORE'
      ],
      labels: {
        offsetY: 50, // Add this line
      },
    },
    yaxis: {
      title: {
        text: "",
      },
    },
    grid: {
      borderColor: "#f1f1f1",
    },
    fill: {
      opacity: 1,
    },
    tooltip: {
      y: {
        formatter: function (val) {
          return val + " tonnes";
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
    <>
      <Card className="text-center" style={{ height: '300px' }}>
        {/* <CardBody className="d-flex justify-content-center align-items-center"> */}
        <CardBody>
          <Row>
            <Col lg={2}>
              <h2 className='text-start'>{title}</h2>
              <CardImg
                top
                src={imgSrc}
                alt="image"
                style={{ width: '200px' }}
              />
              <Progress className='mt-4' value={progressValue} max={progressMax} style={{ height: '30px' }}>{progressValue} of {progressMax}</Progress>
            </Col>
            <Col lg={2} className='d-flex align-items-center my-auto'>
              <div>
                <CircularProgressbar
                  value={series}
                  text={`${series}%`}
                  // circleRatio={0.75}
                  // styles={buildStyles({
                  //   rotation: 1 / 2 + 1 / 8,
                  //   strokeLinecap: "butt",
                  //   trailColor: "#eee",
                  // })}
                />
              </div>
            </Col>
            <Col lg={3}>
              <Chart
                options={barGraphOptions}
                series={tbSeries}
                type="bar"
              />
            </Col>
            <Col lg={3}>
              <Chart
                options={barGraphOptions}
                series={tbSeries}
                type="bar"
              />
            </Col>
          </Row>
        </CardBody>
      </Card>
      <Card>
        {/* <CardBody> */}
        {/* <Row> */}
        {/* <Col>
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
                <Progress value={progressValue} max={progressMax} style={{ height: '32px' }}>Completed: {progressValue} of {progressMax}</Progress>
              </Col>
            </Row>
          </Col> */}
        {/* <Col className="d-flex flex-column align-items-center">
              <CardTitle style={{ fontSize: "13px" }}>Total Tonnes(K Ts')</CardTitle>
              <TonnesBarGraph className="flex-shrink-0" series={tbSeries} />
            </Col> */}
        {/* <Col className="d-flex flex-column align-items-center">
              <CardTitle style={{ fontSize: "13px" }}>DIGGING - Total Tonnes Per Hour (K Ts')</CardTitle>
              <BarGraph />
            </Col> */}
        {/* <Col className="d-flex flex-column align-items-center">
              <CardTitle>Operational Delays</CardTitle>
              <div style={{ width: '160px', height: '100px' }}>
                <Chart options={statusChartOptions} series={operationalDelay} type="radialBar" />
              </div>
              <CardTitle>Availabilty</CardTitle>
              <div style={{ width: '160px', height: '100px' }}>
                <Chart options={statusChartOptions} series={availability} type="radialBar" />
              </div>
            </Col> */}
        {/* </Row> */}
        {/* </CardBody> */}
      </Card>
    </>
  );
}

export default TruckingExecutionCard;

