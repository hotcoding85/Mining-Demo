import React from "react";
import styled from "styled-components";
import { TripProgressBarProps } from "../../../Components/Charts/interfaces/general";
import { formatNumber } from "utils/common";

const ProgressBarInner = styled.div<{ width: string; background?: string }>`
  background-color: ${(props) =>
    props.background ? props.background : "#389e0d"};
  height: 100%;
  width: ${(props) => props.width};
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Dot = styled.div<{ left: string }>`
  position: absolute;
  left: ${(props) => props.left};
  height: 5px;
  width: 5px;
  background-color: white;
  border-radius: 50%;
  transform: translateX(-50%);
  top: 7px;
`;



export const TripProgressBar: React.FC<TripProgressBarProps> = ({
  completed,
  forecast,
  planned = 0,
  type = "Trucking",
  header = "",
  backgroundCol = "var(--bg-color)",
  subHeader = "",
  total = 0,
  subType = "",
  widthVal = '100%',
  customLabels = [], 
}) => {
  const plannedPercentage = `${(planned / total) * 100}%`;
  const forecastPercentage = `${(forecast / total) * 100 - calDifference()}%`;

  const getBarColor = () => {
    const color = planned > forecast ? "#FAAD14" : "#389E0D";
    return color;
  };

  const calculatePercentage = () => {
    let acctualPercent = 0;

    if (type === "Trucking" && subType !== "Production") {
      acctualPercent = (completed / forecast) * 100;
    } else {
      acctualPercent = (forecast / total) * 100;
    }
    return acctualPercent > 98
      ? acctualPercent
      : acctualPercent > 94
      ? acctualPercent + 1
      : acctualPercent + 2;
  };

  const percentage = calculatePercentage();

  const dotPositions = customLabels.length > 0
    ? Array.from({ length: customLabels.length }, (_, i) => `${(i * 100) / (customLabels.length - 1)}%`)
    : Array.from({ length: 11 }, (_, i) => `${(i * 100) / 10}%`);

  function calDifference() {
    let forecastPercentage = (forecast / total) * 100;

    if (forecastPercentage < 10) {
      return 0;
    } else if (forecastPercentage >= 10 && forecastPercentage < 20) {
      return 0.5;
    } else if (forecastPercentage >= 20 && forecastPercentage < 30) {
      return 1;
    } else if (forecastPercentage >= 30 && forecastPercentage <= 40) {
      return 1.5;
    } else if (forecastPercentage > 40 && forecastPercentage <= 50) {
      return 2;
    } else if (forecastPercentage > 50 && forecastPercentage <= 60) {
      return 2;
    } else if (forecastPercentage > 60 && forecastPercentage <= 70) {
      return 2.5;
    } else if (forecastPercentage > 70 && forecastPercentage <= 80) {
      return 2.5;
    } else if (forecastPercentage > 80 && forecastPercentage <= 90) {
      return 3;
    } else if (forecastPercentage > 90 && forecastPercentage < 95) {
      return 3;
    } else if (forecastPercentage >= 95 && forecastPercentage < 98) {
      return 4;
    } else {
      return 5;
    }
  }

  return (
    <div
      className={`light-box ProgressBarContainer ${
        type === "Production" ? "ProgressProduction" : ""
      }`}
      style={{ paddingBottom: "4%", width: widthVal }}
    >
      {type === "Trucking" && <div className="progress-header">{header}</div>}
      {type === "Production" && (
        <div className="progress-header header-production">{header}</div>
      )}
      <div className="ProgressText">
        {type === "Production" && (
          <div
            className=""
            style={{ color: "#9CA3B1", fontWeight: "bold" }}
          >
            {subHeader}
          </div>
        )}
        {type === "Trucking" && <div className="">{subHeader}</div>}
      </div>
      <div className="ProgressBarOuter">
        {type === "Production" && (
          <div className="ProductionText">
            {dotPositions.map((pos, index) => (
              <div className="" style={{ position: "relative" }} key={index}>
                <Dot
                  left={pos}
                  style={{
                    marginLeft:
                      index === 0
                        ? "20px"
                        : index === dotPositions.length - 1
                        ? "-20px"
                        : "20px",
                  }}
                />
                <span
                  className="labels ProductionText"
                  style={{
                    position: "absolute",
                    left: pos,
                    top: "20px",
                    marginLeft:
                      index === 0
                        ? "1px"
                        : index === dotPositions.length - 1
                        ? "-30px"
                        : "0",
                  }}
                >
                  {customLabels[index]}
                </span>
              </div>
            ))}
          </div>
        )}
        <ProgressBarInner
          width={`${percentage}%`}
          background={
            type === "Trucking" && subType === "Production"
              ? getBarColor()
              : type === "Production"
              ? getBarColor()
              : "#389e0d"
          }
        >
          {type === "Trucking" && (
            <span className="ProgressPercent">{Math.round(percentage)}%</span>
          )}
        </ProgressBarInner>
        {type === "Production" && (
          <div className="TargetBubble" style={{ left: plannedPercentage }}>
            Target: {planned}
          </div>
        )}
      </div>
      {type === "Trucking" && subType !== "Production" && (
        <div className="ForecastBubble truck-prog">
          Forecast: {forecast}
        </div>
      )}
      {(type === "Production" || subType === "Production") && (
        <div
          className="ForecastBubble prod-prog"
          style={{
            background: getBarColor(),
            left: forecastPercentage,
            borderRadius: "5px",
            textWrap: "nowrap",
            top: subType === "Production" ? "48%" : undefined,
          }}
          data-color={getBarColor()}
        >
          Forecast: {forecast}
          <style>
            {`
              .ForecastBubble[data-color="${getBarColor()}"]::after {
                border-color: ${getBarColor()} transparent transparent transparent;
                left: 50%;
                right: 50%;
              }
            `}
          </style>
        </div>
      )}
    </div>
  );
};
