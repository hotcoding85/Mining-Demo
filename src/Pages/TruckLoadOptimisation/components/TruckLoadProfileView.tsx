import React from "react";
import eqImgae from "../../../assets/images/equipment/truck-top-view.png";
import CardTruckLoadProfile, {
  TruckLoadProfileData,
} from "./CardTruckLoadProfile";
import GraphCard from "./GraphCard";

const TruckLoadProfileView = () => {
  const legendData = [
    {
      label: "Load Plan",
      color: "#1890FF",
    },
    {
      label: "Actual Loading",
      color: "#CF1322",
    },
  ];

  const truckLoadProfileData: TruckLoadProfileData = {
    id: "DT102",
    status: "Healthy",
    loadTime: 54,
    passes: 5,
    fuelRate: 8.92,
    lastUpdated: 90,
    sync: "active",
  };

  return (
    <div>
      <GraphCard />
      <div className="visual-legend-container">
        <p className="visual-legend">Legend:</p>
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
      <div className="d-flex align-items-center justify-content-between gap-4">
        <CardTruckLoadProfile {...truckLoadProfileData} />

        <div id="imageContainer" className="truck-image">
          <img style={{ height: "420px" }} src={eqImgae} alt="truck" />
        </div>
      </div>
    </div>
  );
};

export default TruckLoadProfileView;
