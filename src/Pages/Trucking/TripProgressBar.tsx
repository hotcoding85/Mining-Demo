import React, { useState } from "react";
import styled from "styled-components";
import { TripProgressBarProps } from "../../Components/Charts/interfaces/general";
import "./style.css";

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
  backgroundCol = "#2b3a5e",
  subHeader = "",
  total = 0,
  subType = "",
  widthVal = '90%'
}) => {

  const [isTargetBubbleVisible, setTargetBubbleVisible] = useState(false);

  const plannedPercentage = `${(planned / total) * 100}%`;
  const forecastPercentage = `${(forecast / total) * 100}%`;

  const handleMouseEnter = () => {
    setTargetBubbleVisible(true);
  };

  const handleMouseLeave = () => {
    setTargetBubbleVisible(false);
  };

  const getBarColor = () => {
    const color = planned > forecast ? "#FAAD14" : "#389E0D";
    return color;
  };

  const percentage = Math.round((completed / forecast) * 100);
  const dotPositions = Array.from({ length: 9 }, (_, i) => `${(i * 100) / 8}%`);

  return (
    <div
      className={`ProgressBarContainer ${
        type === "Production" ? "ProgressProduction" : ""
      }`}
      style={{
        backgroundColor: backgroundCol || "#2b3a5e",
        paddingBottom: type === "Production" ? "7%" : "0", 
        width:widthVal
      }}
    >
      {type === "Trucking" && <div className="progress-header">{header}</div>}
      {type === "Production" && (
        <div className="progress-header header-production">{header}</div>
      )}
      <div className="ProgressText">
        {type === "Production" && (
          <div className="" style={{ color: "#9CA3B1", fontWeight: "bold" }}>
            {subHeader}
          </div>
        )}
        {type === "Trucking" && <div className="">{subHeader}</div>}
      </div>
      <div
        className="ProgressBarOuter"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {type === "Production" && (
          <div className="ProductionText">
            {dotPositions.map((pos, index) => (
              <div className="" style={{ position: "relative" }}>
                <Dot
                  key={index}
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
                        ? "10px"
                        : index === dotPositions.length - 1
                        ? "-30px"
                        : "0",
                  }}
                >
                  {Math.round((index * total) / 8)}
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
            <span className="ProgressPercent">{percentage}%</span>
          )}
        </ProgressBarInner>
        {isTargetBubbleVisible && type === "Production" && (
          <div className="TargetBubble" style={{ left: plannedPercentage }}>
            Target: {planned}
          </div>
        )}
      </div>
      {type === "Trucking" && subType !== "Production" && (
        <div className="ForecastBubble truck-prog">Forecast: {forecast}</div>
      )}
      {(type === "Production" || subType === "Production") && (
        <div
          className="ForecastBubble prod-prog"
          style={{
            background: getBarColor(),
            left: forecastPercentage,
            borderRadius: "5px",
            top: subType === "Production" ? "48%" : undefined,
          }}
          data-color={getBarColor()}
        >
          Forecast: {forecast}
          <style>
            {`
              .ForecastBubble[data-color="${getBarColor()}"]::after {
                border-color: ${getBarColor()} transparent transparent transparent;  left: 50%; right: 50%;
              }
            `}
          </style>
        </div>
      )}
    </div>
  );
};
