import { useState, FC } from "react";
import { FuelData } from "./interfaces/FuelData";
import "./style.css";

const getStatusColor = (status: string) => {
  switch (status) {
    case "Schedule Refuel":
      return "#f4b400"; // Yellow
    case "Critical":
      return "#db4437"; // Red
    case "Healthy":
      return "#0f9d58"; // Green
    default:
      return "#4285f4"; // Blue
  }
};

const FuelCard: FC<FuelData> = ({
  id,
  status,
  smu,
  fuelLevel,
  fuelRate,
  imageUrl,
  lastUpdated,
  sync,
}) => {
  const statusColor = getStatusColor(status);
  const [isHoveringSync, setIsHoveringSync] = useState(false);

  const handleSyncHover = () => {
    setIsHoveringSync(!isHoveringSync);
  };

  const getSyncIcon = () => {
    switch (sync) {
      case "manual":
        return <img src="./manual-icon.png" alt="" />;
      case "inactive":
        return <img src="./inactive-icon.png" alt="" />;
      case "active":
        return <img src="./active-icon.png" alt="" />;
      default:
        return null;
    }
  };

  const getSyncText = () => {
    switch (sync) {
      case "manual":
        return `Updated ${lastUpdated} ago`;
      case "inactive":
        return `Synced ${lastUpdated} ago`;
      case "active":
        return `Synced ${lastUpdated} ago`;
      default:
        return "";
    }
  };

  return (
    <div className="fuel-card">
      <div className="fuel-card-header">
        <div className="vehicle-name">{id}</div>
        <span
          className="fuel-card-status"
          style={{ backgroundColor: statusColor }}
        >
          {status}
        </span>
      </div>
      <div className="fuel-card-sync">
        <div
          className="fuel-card-sync-icon"
          onMouseEnter={handleSyncHover}
          onMouseLeave={handleSyncHover}
        >
          <div className="img">{getSyncIcon()}</div>
          <div className="fuel-card-sync">
            <p>
              <em>{getSyncText()}</em>
            </p>
          </div>
        </div>
        {isHoveringSync && (
          <span className="fuel-card-sync-tooltip">{sync}</span>
        )}
      </div>
      <div className="vehicle-image">
        <img src={imageUrl} alt="Vehicle" className="fuel-card-image" />
      </div>
      <div className="fuel-card-details">
        <p className="fuel-card-props">
          <span className="fuel-label">SMU</span>
          <span className="fuel-value">{smu.toLocaleString()}</span>
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

export default FuelCard;
