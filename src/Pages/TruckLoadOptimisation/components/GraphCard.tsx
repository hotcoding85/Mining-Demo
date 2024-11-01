import { UploadOutlined } from "@ant-design/icons";
import { Button } from "antd";
import React, { useEffect, useState } from "react";
import { Card, CardBody } from "reactstrap";
import { generateColorArray, generateRecords } from "../data/sampleData";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  ReferenceLine,
  ScatterChart,
  Legend,
  Scatter,
  Cell,
} from "recharts";

const CustomDot = (props) => {
  const { cx, cy, fill } = props;
  return (
    <circle cx={cx} cy={cy} r={5} fill={fill} /> // 'r' defines the radius of the circle
  );
};

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div
        className="custom-tooltip"
        style={{
          backgroundColor: "#333",
          padding: "8px",
          borderRadius: "5px",
          color: "#fff",
        }}
      >
        <p> {payload[0].payload.truck || ''}</p>
        <p>{payload[0].payload.trip}</p>
        <p>{`Loading Time:  ${payload[0].payload.loading}`}</p>
        <p>{`Total Passes: ${payload[0].payload.totalPasses}`}</p>
        <p>{`Payload: ${payload[0].value}t`}</p>
      </div>
    );
  }
  return null;
};

const GraphCard = (props) => {
  const chartdata = [
    { percent: '90%', x: (props.loads * 0.9), y: 0 },
    { percent: "100%", x: props.loads, y: 6 },
    { percent: "110%", x: (props.loads * 110 / 100), y: 1.2 },
    { percent: "120%", x: (props.loads * 1.2), y: 0 },
  ];

  console.log([props.loads * 90 / 100, props.loads * 130 / 100], chartdata)

  const [scatter, setScatter] = useState<any>([]);
  const legendData = [
    {
      label: "Actual Loading",
      color: "#CF1322",
    },
  ];

  useEffect(() => {
    if (!props.type || props.type === '') {
      setScatter([])
      return
    }
    

    // Function to generate scatterData based on the model type (e.g., "HD1500")
    const generateScatterData = (modelType) => {
      return generateRecords(175, modelType)
        .filter((item) => item.model === modelType) // Filter by model;
    };

    const scatterData = generateScatterData(props.type);
    console.log(scatterData)
    setScatter(scatterData)

  }, [props.type])

  useEffect(() => {
    setTimeout(() => {
      window.dispatchEvent(new Event('resize'));
    }, 1000);
  }, [props.loads]);
  const [force, setForce] = useState(0)
  useEffect(() => {
    const _force = force + 1
    if (_force > 2) return;
    setForce(_force)
  }, [force])

  const COLORS = generateColorArray(175);

  return (
    <Card>
      <CardBody>
        <div className="haulroad-summary-title text-start" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>{props.title || 'Truck Payload Profile Management'}</div>
          <div className="export-csv">
            <Button color="primary">
              Export CSV
              <UploadOutlined />
            </Button>
          </div>
        </div>
        <div className="visual-legend-container" style={{ marginTop: '1rem' }}>
          <div className="visual-legend">Legend:</div>
          {legendData &&
            legendData.map((item, index) => (
              <div
                key={index}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "left",
                }}
              >
                <span
                  style={{
                    height: "8px",
                    width: "8px",
                    color: "transparent",
                    backgroundColor: item.color,
                    borderRadius: "50%",
                    fontSize: "1px",
                  }}
                ></span>
                <span className="text-center px-2 legend-label">
                  {item.label}
                </span>
              </div>
            ))}
        </div>
        <div
          className="position-relative chart-container"
          style={{
            marginTop: "20px",
            height: "300px",
          }}
        >

          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartdata}>
              <CartesianGrid horizontal={false} vertical={false} />

              <defs>
                <linearGradient id="colorGradient" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="50%" stopColor="green" stopOpacity={0.7} />
                  <stop offset="100%" stopColor="red" stopOpacity={0.3} />
                </linearGradient>
              </defs>

              <XAxis
                dataKey="x"
                type="number"
                scale="linear"  // Ensure the axis is linear
                allowDecimals={true}
                domain={[props.loads * 90 / 100, props.loads * 130 / 100]}  // Start at 90%, end at 130%
                ticks={[props.loads * 90 / 100, props.loads, props.loads * 110 / 100, props.loads * 120 / 100]}  // Define ticks from 90% to 120%
                tickFormatter={(load) => {
                  let percent = chartdata.find((d: any) => d.x === load)?.percent;
                  if (!percent) {
                    percent = Math.floor(load / props.loads * 100).toString();
                  }
                  percent = parseFloat(percent) + '%';
                  return `${percent} (${load}t)`;  // Display percentage and load in tonnes
                }}
                padding={{ left: 0, right: 0 }}  // Remove extra padding for a snug fit
              />

              <YAxis
                dataKey="y"
                type="number"
                unit="min"
                domain={[0, 10]}  // Define the Y-axis domain based on loading time
                label={{ value: "Loading Time (min)", angle: -90, position: 'insideLeft' }}
              />

              <Area
                type="monotone"
                dataKey="y"
                stroke="none"
                fillOpacity={1}
                fill="url(#colorGradient)"  // Apply the gradient fill
              />

              {/* Reference Lines for max and min loading times */}
              <ReferenceLine y={5} stroke="white" strokeDasharray="3 3" label={{ value: "max loading time", fill: "white", fontSize: '11px' }} />
              <ReferenceLine y={2} stroke="white" strokeDasharray="3 3" label={{ value: "min loading time", fill: "white", fontSize: '11px' }} />

              {/* Reference Lines for min and max tonnes */}
              <ReferenceLine x={props.loads * 98 / 100} stroke="white" strokeDasharray="3 3" label={{ value: "min tonnes", fill: "white", fontSize: '11px' }} />
              <ReferenceLine x={props.loads * 102 / 100} stroke="white" strokeDasharray="3 3" label={{ value: "max tonnes", fill: "white", fontSize: '11px' }} />

            </AreaChart>

          </ResponsiveContainer>
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart
              width={1050}
              height={300}
              className="grap-scatter-chat"
              style={{ position: 'absolute' }}
            >
              <XAxis dataKey="x" type="number" name="Loads" hide={false} domain={[props.loads * 90 / 100, props.loads * 130 / 100]} tickFormatter={(load) => {
                return ``; // Display percent and load
              }} />
              <YAxis dataKey="y" type="number" name="Loading time" unit="min" hide={false} domain={[0, 10]} />
              <Tooltip cursor={{ strokeDasharray: '3 3' }} content={<CustomTooltip />} />
              <Scatter name="A school" data={scatter}>
                {scatter.map((entry, index) => {
                  console.log(entry)
                  return <Cell key={`cell-${index}`} fill={entry["colorFill"]} />
                })}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      </CardBody>
    </Card>
  );
};

export default GraphCard;
