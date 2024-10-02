import React, { useEffect, useState } from 'react';
import { Container, Card, CardBody, CardTitle, Row, Col } from 'reactstrap';
import Chart from 'react-apexcharts';
import Breadcrumb from 'Components/Common/Breadcrumb';
import MiningTruckGraphCard from "./MiningTruckGraphCard";
import TruckingExecutionCard from './TruckExecutionCard';
import { getAllFleet } from 'slices/fleet/thunk';
import { useDispatch, useSelector } from 'react-redux';
import ForecastProgressBar from './ForecastProgressBar';

import {hd1500} from 'assets/images/equipment'
import { DatePicker, Segmented, Space } from 'antd';
import { FleetSelector } from 'selectors';

const { RangePicker } = DatePicker;

const DailyProduction = () => {
  document.title = "Daily Production | FMS Live";

  const dispatch = useDispatch<any>();


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
            fontSize: '35px',
            color: '#fff',
            formatter: function (val) {
              return val + "%";
            }
          }
        }
      }
    },
    fill: {
      colors: [color]
    },
    labels: ['Utilization'],
  };

  const { fleet } = useSelector(FleetSelector);

  const [timeRange, setTimeRange] = useState('CURRENT_SHIFT');

  const [truckingExecution, setTruckingExecution] = useState({
    options: options,
    series: [62],
    cardTitle: "Trucking 24 Hr. Planned Execution",
    progressValue: 9,
    progressMax: 18,
    forecast: 600,
    forecastColor: 'green'
  });

  const [oreTarget, setOreTarget] = useState({
    options: options,
    series: [65],
    cardTitle: "Ore Target/Planned Execution",
    progressValue: 9,
    progressMax: 18,
    forecast: 600,
    forecastColor: 'red'
  });
  const [trucksProgress, setTrucksProgress] = useState([
    {
      name: 'Kom 785',
      options: options,
      series: [72],
      count: 0 // Replace with actual count
    },
    {
      name: 'PC2000',
      options: options,
      series: [72],
      count: 0 // Replace with actual count
    },
    {
      name: 'HD1500',
      options: options,
      series: [58],
      count: 0 // Replace with actual count
    },
    {
      name: 'PC 1250',
      options: options,
      series: [64],
      count: 0 // Replace with actual count
    }
  ]);
  const seriesBg = [[
    {
      name: "Actual",
      data: [46, 57, 59, 54, 62, 58, 64, 60, 66],
    },
    {
      name: "Planned",
      data: [74, 83, 102, 97, 86, 106, 93, 114, 94],
    }
  ], [
    {
      name: "Actual",
      data: [46, 57, 59, 54, 62, 58, 64, 60, 66],
    },
    {
      name: "Planned",
      data: [74, 83, 102, 97, 86, 106, 93, 114, 94],
    }
  ]];

  const [overallLoadTarget, setOverallLoadTarget] = useState({
    options: options,
    series: [62.5],
    value: 340,
    max: 600,
    forecast: 600,
    forecastColor: 'green'
  });

  const [tonnesExtraction, setTonnesExtraction] = useState({
    options: options,
    series: [62.5],
    value: 340,
    max: 600,
    forecast: 600,
    forecastColor: 'red'
  });

  const optionsBg = {
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

    colors: ['#ff0000', '#0ff000', '#0ff000', '#ff8300'],
    xaxis: {
      categories: [
        6,
        7
      ],
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
        formatter: function (val: any) {
          return "$ " + val + " thousands";
        },
      },
    },
  };

  useEffect(() => {
    dispatch(getAllFleet()); // Dispatch action to fetch data on component mount
  }, [dispatch]);

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid>
          <Breadcrumb title="Dashboards" breadcrumbItem="Daily Production" />
          <Row className="mb-3">
                        <Col className='d-flex flex-row-reverse'>
                            <Space>
                                {
                                    timeRange == 'CUSTOM' && <RangePicker />
                                }
                                <Segmented className="customSegmentLabel customSegmentBackground" value={timeRange} onChange={(e) => setTimeRange(e)} options={[{ value: 'CUSTOM', label: 'Custom' }, { value: 'PREVIOUS_SHIFT', label: 'Previous Shift' }, { value: 'CURRENT_SHIFT', label: 'Current Shift' }]}/>
                            </Space>
                        </Col>
                    </Row>
          <Row>
            <Col md={4}>
              <Card>
                <CardBody>
                  <CardTitle>Overall Load Target</CardTitle>
                  <Chart options={overallLoadTarget.options}
                    series={overallLoadTarget.series}
                    type="radialBar" />
                  <ForecastProgressBar
                    forecastColor={overallLoadTarget.forecastColor}
                    forecast={overallLoadTarget.forecast}
                    value={overallLoadTarget.value}
                    max={overallLoadTarget.max}
                  />
                </CardBody>
              </Card>
              <Card>
                <CardBody>
                  <CardTitle>Tonnes Extraction</CardTitle>
                  <Chart options={tonnesExtraction.options}
                    series={tonnesExtraction.series}
                    type="radialBar" />
                  <ForecastProgressBar
                    forecastColor={tonnesExtraction.forecastColor}
                    forecast={tonnesExtraction.forecast}
                    value={tonnesExtraction.value}
                    max={tonnesExtraction.max}
                  />
                </CardBody>
              </Card>
              <Card>
                <CardBody>
                  <CardTitle>Truck & Digger Target Plan</CardTitle>
                  {trucksProgress.map((truck, index) => {
                    if (index % 2 === 0) {
                      return (
                        <div key={index} style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <div style={{ width: '200px', height: '200px' }}>
                            <Chart options={truck.options}
                              series={truck.series}
                              type="radialBar" />
                            <p>{truck.name}: {truck.count}</p>
                          </div>
                          {trucksProgress[index + 1] && (
                            <div style={{ width: '200px', height: '200px' }}>
                              <Chart options={trucksProgress[index + 1].options}
                                series={trucksProgress[index + 1].series}
                                type="radialBar" />
                              <p>{trucksProgress[index + 1].name}: {trucksProgress[index + 1].count}</p>
                            </div>
                          )}
                        </div>
                      );
                    } else {
                      return null;
                    }
                  })}
                </CardBody>
              </Card>
            </Col>
            <Col md={8}>
              <Card>
                <CardBody>
                  <Row>
                    <TruckingExecutionCard
                      options={truckingExecution.options}
                      series={truckingExecution.series}
                      cardTitle={truckingExecution.cardTitle}
                      progressValue={truckingExecution.progressValue}
                      progressMax={truckingExecution.progressMax}
                      forecast={truckingExecution.forecast}
                      forecastColor={truckingExecution.forecastColor}
                    />
                    <TruckingExecutionCard
                      options={oreTarget.options}
                      series={oreTarget.series}
                      cardTitle={oreTarget.cardTitle}
                      progressValue={oreTarget.progressValue}
                      progressMax={oreTarget.progressMax}
                      forecast={oreTarget.forecast}
                      forecastColor={oreTarget.forecastColor}
                    />
                  </Row>
                </CardBody>
              </Card>
              <Card>
                <MiningTruckGraphCard
                  imgSrc={hd1500}
                  altText="HD1500"
                  cardTitle="Trucks on Shift, Total number of loads per hour"
                  series={seriesBg[0]}
                  options={optionsBg}
                />
              </Card>
              <Card>
                <MiningTruckGraphCard
                  imgSrc={hd1500}
                  altText="HD1500"
                  cardTitle="DIGGING - Total Tonnes Per Hour Across Shift"
                  series={seriesBg[1]}
                  options={optionsBg}
                />
              </Card>
            </Col>
          </Row>
        </Container>
      </div>
    </React.Fragment >
  );
}

export default DailyProduction;
