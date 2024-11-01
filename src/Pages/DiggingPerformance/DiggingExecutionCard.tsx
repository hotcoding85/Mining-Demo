import React, { useMemo } from 'react';
import { CardBody, Row, Col, Card } from 'reactstrap';

import { BarGraph } from "../../Components/Charts/BarChart";
import { TextColor } from 'Components/Charts/interfaces/general';
import { FLEET_TIME_STATE_COLOR, LAYOUT_MODE_TYPES } from 'Components/constants/layout';
import { useSelector } from 'react-redux';
import { ApexOptions } from "apexcharts";
import Chart from "react-apexcharts";
import { getRandomInt } from 'utils/random';
import { divide12HoursRandomly, minutesToHhMm, round2One } from 'utils/common';
import { LayoutSelector } from 'selectors';


const MyPiechart = ({ bgColor, textColor, fillColor, value, width, height, maxValue, state, time, ...props }) => {
  var options: ApexOptions = {
    chart: {
      type: "radialBar",
    },
    plotOptions: {
      radialBar: {
        startAngle: 0,
        endAngle: 360,
        track: {
          background: bgColor,
          show: true,
          strokeWidth: "100%",
          margin: 5, // Optional, gives space between bars
          dropShadow: {
            enabled: true,
            top: 2,
            left: 0,
            blur: 4,
            opacity: 0.15,
          },
        },
        hollow: {
          size: "65%", // Adjusts the size of the hollow center
        },
        dataLabels: {
          name: {
            show: false,
          },
          value: {
            color: textColor,
            offsetY: 10,
            fontSize: "2em",
            fontWeight: "600",
          },
        },
      },
    },
    stroke: {
      lineCap: "round",
    },
    fill: {
      colors: [fillColor],
    },
  };

  const series = useMemo(() => {
    if (value !== undefined && maxValue !== undefined && maxValue !== 0) {
      return Number(((value / maxValue) * 100).toFixed(2));
    }
    return 0;
  }, [maxValue, value]);

  return (
    <div>
      <Chart
        options={options}
        series={[value || series]}
        type="radialBar"
        width={width}
        height={height}
      />
      <div className='text-center'>
        <div>{state}</div>
        <div>{time}</div>
      </div>
    </div>
  );
}
// Renaming MiningTruckGraphCard to DetailedTruckingExecutionCard based on its usage
function DiggingExecutionCard({ imgSrc, altText, title, cardTitle, progressValue, progressMax, series, operationalDelay, availability, tbSeries, forecast, forecastColor }) {

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
        barThickness: 30,
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
        barThickness: 30,
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
          size: 16,
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
        ticks: {
          color: "#fff",
          font: {
            size: 16
          }
        },

      },
      y: {
        grid: {
          display: true,
          color: "#9CA3B1",
          lineWidth: 0.2,
        },
        ticks: {
          color: "#fff",
          font: {
            size: 16
          }
        }
      },
    },
  };

  const { layoutModeType } = useSelector(LayoutSelector);

  const isLight = useMemo(
    () => layoutModeType === LAYOUT_MODE_TYPES.LIGHT,
    [layoutModeType]
  );

  const bgColor = isLight ? "#E0E0E0" : "#535E77";



  const truckStates = useMemo(() => {

    const textColor = isLight ? "#2A2A2A" : "#fff";

    return [
      {
        state: "Active",
        time: "00:24:52",
        pctValue: getRandomInt(45, 80),
        color: FLEET_TIME_STATE_COLOR.ACTIVE,
        bgColor: bgColor,
        textColor: textColor,
      },
      {
        state: "StandBy",
        time: "00:24:52",
        pctValue: getRandomInt(45, 80),
        color: FLEET_TIME_STATE_COLOR.STANDBY,
        bgColor: bgColor,
        textColor: textColor,
      },
      {
        state: "Down",
        time: "00:24:52",
        pctValue: getRandomInt(45, 80),
        color: FLEET_TIME_STATE_COLOR.DOWN,
        bgColor: bgColor,
        textColor: textColor,
      },
      {
        state: "Idle",
        time: "00:24:52",
        pctValue: getRandomInt(45, 80),
        color: isLight ? "#828282" : "#fff",
        bgColor: bgColor,
        textColor: textColor,
      },
      {
        state: "Delay",
        time: "00:24:52",
        pctValue: getRandomInt(45, 80),
        color: FLEET_TIME_STATE_COLOR.DELAY,
        bgColor: bgColor,
        textColor: textColor,
      },
      {
        state: "Utilization",
        time: "",
        pctValue: getRandomInt(45, 80),
        color: FLEET_TIME_STATE_COLOR.STANDBY,
        bgColor: bgColor,
        textColor: textColor,
      },
    ];
  }, [layoutModeType, isLight]);



  return (
    <>
      <Card style={{ height: 'auto' }}>
        {/* <CardBody className="d-flex justify-content-center align-items-center"> */}
        <CardBody>
          <Row>
            <h2 className='text-start'>{title}</h2>
            <Col lg={12} xl={4}>
              <div className="d-flex flex-wrap justify-content-center align-items-center h-100">
                {
                  truckStates.map(({ time, state, color, bgColor, textColor, pctValue }, key) => {
                    const data = divide12HoursRandomly(5);
                    const formatted = minutesToHhMm(data[key])

                    return (
                      <MyPiechart
                        width={180}
                        value={ key != 5 ? round2One(data[key]/720 * 100) : getRandomInt(60, 90)}
                        height={400}
                        maxValue={100}
                        fillColor={color}
                        color={color}
                        bgColor={bgColor}
                        state={state}
                        time={key != 5 ? formatted : ''}
                        textColor={textColor}
                      />
                    )
                  })
                }
              </div>
            </Col>
            <Col xl={8} lg={12}>
              <div className="d-flex flex-wrap justify-content-center align-items-center">
                <BarGraph
                  data={barData}
                  options={barOptions}
                />
              </div>
            </Col>
          </Row>
        </CardBody>
      </Card>
    </>
  );
}

export default DiggingExecutionCard;

