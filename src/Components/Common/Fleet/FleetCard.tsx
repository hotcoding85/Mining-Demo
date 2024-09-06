import { useState, FC } from "react";
import "./fleetcard.css";
import { getSyncIcon, getSyncText, MaintenanceStatusConfig } from "utils/fleet";
import { capitalize } from "lodash";

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

export interface FleetCardProps {
  id: string;
  status: string;
  smu?: number;
  fuelLevel?: number;
  fuelRate?: number;
  location?: number;
  imageUrl: string;
  lastUpdated: string;
  sync: "manual" | "inactive" | "active";
  width?: string;
}

const FleetCard: FC<FleetCardProps> = ({
  id,
  status,
  smu,
  fuelLevel,
  fuelRate,
  imageUrl,
  location,
  lastUpdated,
  sync,
}) => {
  const statusColor = getStatusColor(status);
  const [isHoveringSync, setIsHoveringSync] = useState(false);

  const handleSyncHover = () => {
    setIsHoveringSync(!isHoveringSync);
  };

  return (
    <div className="fleet-card" style={{}}>
      <div className="fleet-card-header">
        <div className="vehicle-name">{id}</div>
        <span
          className="fleet-card-status"
          style={{ backgroundColor: MaintenanceStatusConfig[status].color }}
        >
          {MaintenanceStatusConfig[status].name}
        </span>
      </div>
      <div className="fleet-card-sync">
        <div
          className="fleet-card-sync-icon"
          onMouseEnter={handleSyncHover}
          onMouseLeave={handleSyncHover}
        >
          <div className="img">
            <i className={getSyncIcon(sync)}></i>
          </div>
          {isHoveringSync && (
            <span className="fleet-card-sync-tooltip">{capitalize(sync)}</span>
          )}
        </div>
        <p className="fleet-card-sync-label">
          <em>{getSyncText(sync, lastUpdated)}</em>
        </p>
      </div>

      <div className="fleet-vehicle-name">
        <img src={imageUrl} alt="Vehicle" className="fleet-card-image" />
      </div>
      <div className="fleet-card-details">
        {location && (
          <p className="fleet-card-props">
            <span className="fleet-label">GPS Location</span>
            <span className="fleet-value">{location}</span>
          </p>
        )}
        {smu && (
          <p className="fleet-card-props">
            <span className="fleet-label">SMU</span>
            <span className="fleet-value">{smu}</span>
          </p>
        )}
        {fuelLevel && (
          <p className="fleet-card-props">
            <span className="fleet-label">fleet Level</span>
            <span className="fleet-value">{fuelLevel}%</span>
          </p>
        )}
        {fuelRate && (
          <p className="fleet-card-props">
            <span className="fleet-label">fleet Rate</span>
            <span
              className={`fleet-value ${fuelRate < 15 && "fleet-value-danger"}`}
            >
              {fuelRate} L/h
            </span>
          </p>
        )}
      </div>
    </div>
  );
};

export default FleetCard;
