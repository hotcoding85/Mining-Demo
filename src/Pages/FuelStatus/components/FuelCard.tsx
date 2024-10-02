import { useState, FC } from "react";
import { FuelData } from "../interfaces/FuelData";
import "../style.css";
import { Link } from "react-router-dom";

const getStatusColor = (status: string) => {
  switch (status) {
    case "SCHEDULE_REFUEL":
      return "#f4b400"; // Yellow
    case "CRITICAL":
      return "#db4437"; // Red
    case "HEALTHY":
      return "#0f9d58"; // Green
    default:
      return "#4285f4"; // Blue
  }
};

const FuelCard: FC<FuelData> = ({
  id,
  model,
  status,
  smu,
  fuelLevel,
  fuelRate,
  imageUrl,
  lastUpdated,
  gpsLocation,
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
        return (
          <svg
            width="12"
            height="12"
            viewBox="0 0 12 12"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M5.99996 5.99996C5.26663 5.99996 4.63885 5.73885 4.11663 5.21663C3.5944 4.6944 3.33329 4.06663 3.33329 3.33329C3.33329 2.59996 3.5944 1.97218 4.11663 1.44996C4.63885 0.927737 5.26663 0.666626 5.99996 0.666626C6.73329 0.666626 7.36107 0.927737 7.88329 1.44996C8.40551 1.97218 8.66663 2.59996 8.66663 3.33329C8.66663 4.06663 8.40551 4.6944 7.88329 5.21663C7.36107 5.73885 6.73329 5.99996 5.99996 5.99996ZM0.666626 11.3333V9.46663C0.666626 9.08885 0.763959 8.74151 0.958626 8.42463C1.15285 8.10818 1.41107 7.86663 1.73329 7.69996C2.42218 7.35551 3.12218 7.09707 3.83329 6.92463C4.5444 6.75263 5.26663 6.66663 5.99996 6.66663C6.73329 6.66663 7.45551 6.75263 8.16663 6.92463C8.87774 7.09707 9.57774 7.35551 10.2666 7.69996C10.5888 7.86663 10.8471 8.10818 11.0413 8.42463C11.236 8.74151 11.3333 9.08885 11.3333 9.46663V11.3333H0.666626Z"
              fill={`${
                lastUpdated > 120
                  ? "#CF1322"
                  : lastUpdated <= 120 && lastUpdated >= 30
                  ? "#FAAD14"
                  : "#389E0D"
              }`}
            />
          </svg>
        );
      case "inactive":
        return (
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M7.28335 9.36667L11.0667 5.6L10.1167 4.65L7.28335 7.48333L5.86669 6.06667L4.93335 7L7.28335 9.36667ZM0.666687 14V12.6667H15.3334V14H0.666687ZM2.66669 12C2.30002 12 1.98613 11.8694 1.72502 11.6083C1.46391 11.3472 1.33335 11.0333 1.33335 10.6667V3.33333C1.33335 2.96667 1.46391 2.65278 1.72502 2.39167C1.98613 2.13056 2.30002 2 2.66669 2H13.3334C13.7 2 14.0139 2.13056 14.275 2.39167C14.5361 2.65278 14.6667 2.96667 14.6667 3.33333V10.6667C14.6667 11.0333 14.5361 11.3472 14.275 11.6083C14.0139 11.8694 13.7 12 13.3334 12H2.66669ZM2.66669 10.6667H13.3334V3.33333H2.66669V10.6667Z"
              fill={`${
                lastUpdated > 120
                  ? "#CF1322"
                  : lastUpdated <= 120 && lastUpdated >= 30
                  ? "#FAAD14"
                  : "#389E0D"
              }`}
            />
          </svg>
        );
      case "active":
        return (
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M7.28335 9.36667L11.0667 5.6L10.1167 4.65L7.28335 7.48333L5.86669 6.06667L4.93335 7L7.28335 9.36667ZM0.666687 14V12.6667H15.3334V14H0.666687ZM2.66669 12C2.30002 12 1.98613 11.8694 1.72502 11.6083C1.46391 11.3472 1.33335 11.0333 1.33335 10.6667V3.33333C1.33335 2.96667 1.46391 2.65278 1.72502 2.39167C1.98613 2.13056 2.30002 2 2.66669 2H13.3334C13.7 2 14.0139 2.13056 14.275 2.39167C14.5361 2.65278 14.6667 2.96667 14.6667 3.33333V10.6667C14.6667 11.0333 14.5361 11.3472 14.275 11.6083C14.0139 11.8694 13.7 12 13.3334 12H2.66669ZM2.66669 10.6667H13.3334V3.33333H2.66669V10.6667Z"
              fill={`${
                lastUpdated > 120
                  ? "#CF1322"
                  : lastUpdated <= 120 && lastUpdated >= 30
                  ? "#FAAD14"
                  : "#389E0D"
              }`}
            />
          </svg>
        );
      default:
        return null;
    }
  };

  const getSyncText = () => {
    switch (sync) {
      case "manual":
        return `Updated ${getLastUpdated()} ago`;
      case "inactive":
        return `Synced ${getLastUpdated()} ago`;
      case "active":
        return `Synced ${getLastUpdated()} ago`;
      default:
        return "";
    }
  };

  const getLastUpdated = () => {
    if (lastUpdated < 60) {
      return `${lastUpdated} m`;
    } else if (lastUpdated >= 60 && lastUpdated < 1440) {
      return `${Math.floor(lastUpdated / 60)} h`;
    } else if (lastUpdated >= 1440 && lastUpdated < 525600) {
      return `${Math.floor(lastUpdated / 1440)} d`;
    } else if (lastUpdated >= 525600) {
      return `${Math.floor(lastUpdated / 525600)} y`;
    }
  };

  return (
    <div className="fuel-card">
      <div className="fuel-card-header">
        <div className="fuel-vehicle-name">{id}({model})</div>
        <span
          className="fuel-card-status"
          style={{ backgroundColor: statusColor }}
        >
          {status}
        </span>
      </div>
      <div className="fuel-card-operator">James Taylor</div>
      <div className="fuel-card-sync">
        <div
          className="fuel-card-sync-icon"
          onMouseEnter={handleSyncHover}
          onMouseLeave={handleSyncHover}
        >
          <div className="img">{getSyncIcon()}</div>
          <div style={{ paddingLeft: "6px" }}>
            <em>{getSyncText()}</em>
          </div>
        </div>
        {isHoveringSync && (
          <span className="fuel-card-sync-tooltip">{sync}</span>
        )}
      </div>
      {/* <div className="vehicle-image">
        <img src={imageUrl} alt="Vehicle" className="fuel-card-image" />
      </div> */}
      <div className="fuel-card-details">
        <p className="fuel-card-props">
          <span className="fuel-label">GPS Location</span>
          <Link to={"/realtime-postioning/"+id} className="fuel-value">View on Map</Link>
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

export default FuelCard;
