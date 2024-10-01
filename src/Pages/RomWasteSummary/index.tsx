import React, { useEffect, useMemo, useState } from 'react';
import { Container, Card, CardBody, CardTitle, Progress, Row, Col } from 'reactstrap';

import { PieChart } from "../../Components/Charts/PieChart";

import { DatePicker, DatePickerProps, Segmented } from 'antd';
import dayjs from 'dayjs';
import './index.css';
import { RomStatusTableCard } from './components/RomStatusTableCard';
import BarGraph from './components/BarGraph';
import ProgressPieChart from 'Components/Charts/ProgressPieChart';
import { useSelector } from 'react-redux';
import { createSelector } from 'reselect';
import { LAYOUT_MODE_TYPES } from 'Components/constants/layout';

const RomWasteSummary = () => {
  document.title = "Rom & Waste Summary | FMS Live";

  // States for this page
  const [fleetMode, setFleetMode] = useState<string>("CURRENT_SHIFT");
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());

  const legendItems = [
    { label: 'HG01', color: '#FFB84C' },
    { label: 'HG02', color: '#FFB84C' },
    { label: 'HG03', color: '#FFB84C' },
    { label: 'LG01', color: '#C58E42' },
    { label: 'LG02', color: '#C58E42' },
    { label: 'LG03', color: '#8F5D28' },
    { label: 'LG04', color: '#5D3C17' },
  ];
  const operationalDelaysData = {
    labels: ["HG01", "HG02", "HG03", "LG01", "LG02", "LG03", "LG04"], // Matching legend items
    datasets: [
      {
        data: [10, 15, 20, 25, 30, 35, 40], // Sample data for the bars, you can adjust it as needed
        backgroundColor: [
          "#FFB84C", // Color for HG01
          "#FFB84C", // Color for HG02
          "#FFB84C", // Color for HG03
          "#C58E42", // Color for LG01
          "#C58E42", // Color for LG02
          "#8F5D28", // Color for LG03
          "#5D3C17", // Color for LG04
        ],
        borderWidth: 0, // No border
      },
    ],
  };

  const chartOptions1 = {
    chart: {
      type: 'bar',
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: '100%',
      },
    },
    colors: ['#FFB84C', '#55D86D'], // Colors for the two bars (yellow and green)
    dataLabels: {
      enabled: true,
      formatter: (val: number, opts: any) => {
        if (opts.seriesIndex === 1 && val !== 0) {
          return `Grade ${Math.abs(val / 10000).toFixed(1)}`;
        }
        return '';
      },
      offsetY: -10, // Moves the labels above the bar
      style: {
        fontSize: '10px',
        colors: ['#adb5bd'],
      },
    },
    stroke: {
      show: true,
      width: 2,
      colors: ['transparent'],
    },
    legend: {
      position: 'top',
    },
    xaxis: {
      categories: ['HG01', 'HG02', 'HG03', 'LG01', 'LG02', 'LG03', 'LG04'],
    },
    yaxis: {
      title: {
      },
      min: -40000,
      max: 50000,
    },
    tooltip: {
      y: {
        formatter: (val: number) => `${val}`,
      },
    },
    fill: {
      opacity: 1,
    },
    title: {
      align: 'center',
    },
  };

  const chartSeries1 = [
    {
      name: 'Extracted ORE form pit to ROM',
      data: [0, 1000, 0, 5000, 30000, 10000, -5000],
    },
    {
      name: 'Current stock',
      data: [25000, 0, 5000, 0, 40000, 0, -5000],
    },
  ];

  const chartOptions2 = {
    chart: {
      type: 'bar',
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: '100%',
      },
    },
    colors: ['#FFB84C', '#FF4C4C'], // Yellow and Red for the bars
    dataLabels: {
      enabled: true,
      formatter: (val: number, opts: any) => {
        if (opts.seriesIndex === 1 && val !== 0) {
          return `Grade ${Math.abs(val / 10000).toFixed(1)}`;
        }
        return '';
      },
      offsetY: 10, // Moves the labels above the bar
      style: {
        fontSize: '10px',
        colors: ['#adb5bd'],
      },
    },
    stroke: {
      show: true,
      width: 2,
      colors: ['transparent'],
    },
    legend: {
      position: 'top',
    },
    xaxis: {
      categories: ['HG01', 'HG02', 'HG03', 'LG01', 'LG02', 'LG03', 'LG04'],
    },
    yaxis: {
      title: {
      },
      min: -40000,
      max: 50000,
    },
    tooltip: {
      y: {
        formatter: (val: number) => `${val}`,
      },
    },
    fill: {
      opacity: 1,
    },
    title: {
      align: 'center',
    },
  };

  const chartSeries2 = [
    {
      name: 'From Stock Pile into crusher',
      data: [0, 0, 0, 0, 0, 0, 0],
    },
    {
      name: 'Current stock',
      data: [-1000, -2000, -3000, -4000, -30000, 0, -5000],
    },
  ];


  const onStartDateChange: DatePickerProps["onChange"] = (date) => {
    if (date) {
      setStartDate(date.toDate());
    }
  };

  const onEndDateChange: DatePickerProps["onChange"] = (date) => {
    if (date) {
      setEndDate(date.toDate());
    }
  };
  const { layoutModeType } = useSelector(
    createSelector(
      (state: any) => state.Layout,
      (layout) => ({
        layoutModeType: layout.layoutModeTypes,
      })
    )
  );

  const isLight = useMemo(
    () => layoutModeType === LAYOUT_MODE_TYPES.LIGHT,
    [layoutModeType]
  );
  const colorRom = '#F44336'
  const colorWaste = '#00b300'

  const [romTonnesExtraction, setRomTonnesExtraction] = useState(58.8);

  const [wasteExtraction, setWasteExtraction] = useState(70);

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid>
          <Row>
            <Col md={6} lg={6} sm={12} style={{ display: 'flex', alignItems: 'center' }}>
              <h4>Rom Waste Summary</h4>
            </Col>
            <Col md={3} lg={3} sm={6}>
              <Segmented
                className="customSegmentLabel customSegmentBackground"
                value={fleetMode}
                onChange={(e) => setFleetMode(e)}
                options={[
                  { label: "Previous Shift", value: "PREVIOUS_SHIFT" },
                  { label: "Current Shift", value: "CURRENT_SHIFT" },
                ]}
              />
            </Col>
            <Col md={3} lg={3} sm={6}>
              <div className="d-flex justify-content-center align-items-center gap-2">
                <DatePicker
                  allowClear={false}
                  value={dayjs(startDate)}
                  format={"MM/DD/YY"}
                  onChange={onStartDateChange}
                />
                <DatePicker
                  allowClear={false}
                  value={dayjs(endDate)}
                  format={"MM/DD/YY"}
                  onChange={onEndDateChange}
                />
              </div>
            </Col>
          </Row>
          <Row className='p-4 align-items-stretch extract-section'>
            <Col lg={4} md={6} sm={6} xs={12} >
              <Card className='h-100'>
                <CardBody>
                  <h5 style={{ marginBottom: 0 }}>Rom Tonnes Extraction</h5>
                  <div className='d-flex justify-content-center align-items-center h-100'>
                    <ProgressPieChart width={300} height={300} color={colorRom} bgColor={isLight ? 'gray' : colorRom} textColor='#a6b0cf' value={romTonnesExtraction} maxValue={100} />
                    <div>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <h5>Total Tonnes</h5>
                        <span>305k</span>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0px' }}>
                        <h5>Loads Completed</h5>
                        <span>304</span>
                      </div>
                    </div>
                  </div>
                </CardBody>
              </Card>
            </Col>
            <Col lg={4} md={6} sm={6} xs={12} >
              <Card className='h-100'>
                <CardBody>
                  <h5 style={{ marginBottom: 0 }}>Waste Extraction to Dumps</h5>
                  <div className='d-flex justify-content-center align-items-center h-100'>
                    <ProgressPieChart width={300} height={300} color={colorWaste} bgColor={isLight ? 'gray' : colorRom} textColor='#a6b0cf' value={romTonnesExtraction} maxValue={100} />
                    <div>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <h5>Total Tonnes</h5>
                        <span>1091k</span>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0px' }}>
                        <h5>Loads Completed</h5>
                        <span>204</span>
                      </div>
                    </div>
                  </div>
                </CardBody>
              </Card>
            </Col>
            <Col lg={4} md={4} sm={12} xs={12}>
              <Card className='h-100 w-100'>
                <CardBody>
                  <div className='d-flex justify-content-center align-items-center h-100'>
                    <PieChart title="" showLegend={false} data={operationalDelaysData} />
                  </div>
                </CardBody>
              </Card>
            </Col>
          </Row>
          <Row>
            <Col md={12}>
              <Card>
                <CardBody>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ textAlign: 'left', fontSize: '16px', fontWeight: 'bold' }}>ROM Status</div>
                    <RomStatusTableCard />
                    <Row style={{ backgroundColor: '#1f293f9e', padding: '20px', margin: '40px 0px 0px 0px' }}>
                      <Col md={6} xs={12}>
                        <Card>
                          <BarGraph legends={legendItems} options={chartOptions1} series={chartSeries1} />
                        </Card>
                      </Col>
                      <Col md={6} xs={12}>
                        <Card>
                          <BarGraph legends={legendItems} options={chartOptions2} series={chartSeries2} />
                        </Card>
                      </Col>
                    </Row>
                  </div>

                </CardBody>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>
    </React.Fragment >
  );
}

export default RomWasteSummary;
