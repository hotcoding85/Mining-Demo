import React from "react";
import { Card, CardBody } from "reactstrap";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

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
        <p>{`Trip 1 - EX01`}</p>
        <p>{`Time: 06:13`}</p>
        <p>{`Payload: ${payload[0].value}`}</p>
      </div>
    );
  }
  return null;
};

const GraphCard = () => {
  const data = [
    { percent: -1, load: 0 },
    { percent: "100%", load: 90 },
    { percent: "110%", load: 10 },
    { percent: "120%", load: 0 },
    { percent: "", load: 0 },
  ];

  return (
    <Card>
      <CardBody>
        <div className="haulroad-summary-title text-start">
          Truck Payload Profile Management
        </div>
        <div
          className="position-relative chart-container"
          style={{
            marginTop: "20px",
            height: "300px",
          }}
        >
          <div>
          </div>
          <p
            className="chart-names position-absolute d-block rounded-circle"
            style={{
              top: "4px",
              left: "4px",
              height: "18px",
              width: "18px",
              backgroundColor: "#D9D9D9",
            }}
          >
          </p>
          <p
            className="chart-names position-absolute fw-bold"
            style={{
              color: "#fff",
              fontSize: "14px",
              top: "20px",
              left: "16px",
            }}
          >
            Productivity
          </p>
          <p
            className="chart-names position-absolute fw-bold"
            style={{
              color: "#fff",
              fontSize: "14px",
              top: "20px",
              left: "51%",
            }}
          >
            Durability
          </p>
          <p className="chart-names position-absolute fw-bold"
            style={{
              color: "#fff",
              fontSize: "14px",
              bottom: "100px",
              left: "22%",
              zIndex: "1",
              background: "linear-gradient(90deg, rgb(0 143 0 / 0%) 0%, rgb(42 114 42) 50%, rgb(0 95 0 / 12%) 100%)",
              padding: "15px"
            }}>90% of Loads</p>
          <p className="chart-names position-absolute fw-bold"
            style={{
              color: "#fff",
              fontSize: "14px",
              bottom: "100px",
              left: "59%",
            }}>10% of Loads</p>
          <p
            className="chart-names position-absolute fw-bold"
            style={{
              color: "#CF1322",
              fontSize: "14px",
              bottom: "100px",
              left: "85%",
            }}
          >
            No loads
          </p>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <CartesianGrid
                horizontal={true}
                vertical={true}
                horizontalPoints={[5]}
              />

              <defs>
                <linearGradient id="colorGradient" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="20%" stopColor="green" stopOpacity={1} />
                  <stop offset="100%" stopColor="red" stopOpacity={1} />
                </linearGradient>
              </defs>

              <XAxis dataKey="percent" domain={[80, 130]} />
              <YAxis hide={true} />

              <Area
                type="monotone"
                dataKey="load"
                stroke="none"
                fillOpacity={1}
                fill="url(#colorGradient)"
              />

              <Tooltip content={<CustomTooltip />} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardBody>
    </Card>
  );
};

export default GraphCard;
