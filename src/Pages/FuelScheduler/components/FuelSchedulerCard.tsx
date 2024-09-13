import { FC } from "react";

export interface FuelData {
  id: string;
  smu: number;
  fuelLevel: number;
  fuelRate: number;
}

const FuelSchedulerCard: FC<FuelData> = ({ id, smu, fuelLevel, fuelRate }) => {
  return (
    <div className="fuel-card">
      <div className="fuel-card-header">
        <div className="vehicle-name">{id}</div>
        <span
          className="position-relative event-status"
          style={{ backgroundColor: "#AD4E00" }}
        >
          {"Requesting Fuel"}
        </span>
      </div>
      <div className="fuel-card-sync"></div>
      <div className="fuel-card-details">
        <p className="fuel-card-props">
          <span className="fuel-label">GPS Location</span>
          <span className="fuel-value">{smu}</span>
        </p>
        <p className="fuel-card-props">
          <span className="fuel-label">SMU</span>
          <span className="fuel-value">{smu}</span>
        </p>
        <p className="fuel-card-props">
          <span className="fuel-label">Fuel Level</span>
          <span className="fuel-value">{fuelLevel}%</span>
        </p>
        <p className="fuel-card-props">
          <span className="fuel-label">Fuel Rate</span>
          <span className="fuel-value">{fuelRate} L/h</span>
        </p>
      </div>
    </div>
  );
};

export default FuelSchedulerCard;
