import React from "react";
import { Card, CardBody } from "reactstrap";
import { round } from "lodash";
import { getImage } from "utils/fleet";

const Item = (data: any) => {
  const stateConfig = [
    {
      name: "Active",
      key: "ACTIVE",
      color: "#14E010",
    },
    {
      name: "Standby",
      key: "STANDBY",
      color: "#F7B31A",
    },
    {
      name: "Delay",
      key: "DELAY",
      color: "#9143DE",
    },
    {
      name: "Down",
      key: "DOWN",
      color: "#ED3A0F",
    },
  ];

  const imageStyle: React.CSSProperties = {
    height: "7.5rem",
  };

  const getStateValue = (stateInfo, key: string) => {
    let info = stateInfo.find((info) => info.state === key);
    return info ? info.hours : "00:00";
  };

  const statusColor = "#F7B31A";
  return (
    <React.Fragment>
      <Card>
        <CardBody>
          <div className="d-flex align-start mb-3">
            <div className="flex-grow-1 card-body__header">
              <h4 style={{ color: statusColor }}>{data.name}</h4>
              <h6 style={{ color: statusColor }}>
                {data?.data?.operator || "Unassiged"}
              </h6>
            </div>
          </div>
          <div className="text-center mb-3">
            <img src={getImage(data.model)} alt="" style={imageStyle} />
          </div>
          <div className="d-flex justify-content-center mb-2 gap-2 text-muted text-center">
            <div className="d-flex flex-column">
              <span style={{ fontSize: "18px", color: "white" }}>
                {data?.data?.tripCount || 0}
              </span>
              <span style={{ fontSize: "9px" }}>Total Loads</span>
            </div>
            <div className="d-flex flex-column">
              <span style={{ fontSize: "18px", color: "white" }}>
                {round(data?.data?.payload || 0.0, 2)}
              </span>
              <span style={{ fontSize: "9px" }}>Total Tonnes Moved</span>
            </div>
            <div className="d-flex flex-column">
              <span style={{ fontSize: "18px", color: "white" }}>
                {round(
                  data?.data?.tripCount
                    ? data.data.payload / data.data.tripCount
                    : 0.0,
                  2
                )}
              </span>
              <span style={{ fontSize: "9px" }}>Avg. Load</span>
            </div>
          </div>
          <div className="d-flex mb-3 justify-content-around gap-2 text-muted">
            {stateConfig.map((config) => {
              return (
                <div className="d-flex align-items-center">
                  <i
                    className="bx bxs-circle font-size-12"
                    style={{ color: config.color }}
                  ></i>
                  <p style={{ margin: "0 0 0 1px", fontSize: "12px" }}>
                    {data?.data?.stateInfo
                      ? getStateValue(data?.data?.stateInfo, config.key)
                      : "00:00"}
                  </p>
                </div>
              );
            })}
          </div>
        </CardBody>
      </Card>
    </React.Fragment>
  );
};
export default Item;
