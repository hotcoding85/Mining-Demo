import { useState, FC } from "react";
import { VehicleData } from "./interfaces/type";
import {
  hd1500,
  hd785,
  pc1250,
  pc2000,
  placeHolder,
  wa600,
} from "assets/images/equipment";
import { Progress, Divider } from "antd";
import {
  Accordion,
  AccordionBody,
  AccordionHeader,
  AccordionItem,
} from "reactstrap";
import { DownOutlined } from "@ant-design/icons";

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

const VehicleCard: FC<VehicleData> = ({
  id,
  status,
  smu,
  fuelLevel,
  fuelRate,
  imageUrl,
  lastUpdated,
  sync,
  collapse = false,
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
    <div className="vehicle-card">
      <div className="vehicle-card-header">
        <div className="vehicle-header-image">
          <img src={pc2000} alt="pc2000" style={{ width: 40, height: 40 }} />
        </div>
        <div className="vehicle-name">
          <div className="vehicle-id">{id}</div>
          <div className="vehicle-category">PC1250-8</div>
          <div className="vehicle-driver">James Taylor</div>
        </div>
        <span
          className="vehicle-card-status"
          style={{ backgroundColor: statusColor }}
        >
          {status}
        </span>
      </div>
      <div className="vehicle-card-details">
        <div className="vehicle-card-progress">
          <p className="vehicle-progress-text">
            <span className="vehicle-progress-label">Fuel Level</span>
            <span className="vehicle-progress-value">{fuelLevel}%</span>
          </p>
          <Progress percent={fuelLevel} showInfo={false} />
        </div>
        <div className="vehicle-card-progress">
          <p className="vehicle-progress-text">
            <span className="vehicle-progress-label">Total Cycles</span>
            <span className="vehicle-progress-value">9/45</span>
          </p>
          <Progress percent={20} showInfo={false} />
        </div>
        <div className="vehicle-card-props">
          <div className="vehicle-medium-label">
            Total Tonnes Loaded in Shift
          </div>
          <div className="vehicle-chips-value">548.2</div>
        </div>
        {collapse && (
          <>
            <p className="vehicle-card-props">
              <span className="vehicle-label">Waiting Events</span>
              <span className="vehicle-value">08:53</span>
            </p>
            <p className="vehicle-card-props">
              <span className="vehicle-label">AVG Load Time</span>
              <span className="vehicle-value">04:21</span>
            </p>
            <p className="vehicle-card-props">
              <span className="vehicle-label">Hang Time</span>
              <span className="vehicle-value">22.56</span>
            </p>
            <p className="vehicle-card-props">
              <span className="vehicle-label">Avg Load per Bucket</span>
              <span className="vehicle-value">10.2t</span>
            </p>
            <p className="vehicle-card-props">
              <span className="vehicle-label">TPH</span>
              <span className="vehicle-value">329.5t</span>
            </p>
            <div className="divider"></div>
            <div className="vehicle-card-props">
              <div className="vehicle-medium-label">Last 5 Loads</div>
            </div>
            <p className="vehicle-card-props">
              <span className="vehicle-label">DT121</span>
              <span className="vehicle-value">125.6t</span>
              <span className="vehicle-value">06:14</span>
            </p>
            <p className="vehicle-card-props">
              <span className="vehicle-label">DT101</span>
              <span className="vehicle-value">65.2t</span>
              <span className="vehicle-value">03:24</span>
            </p>
            <p className="vehicle-card-props">
              <span className="vehicle-label">DT106</span>
              <span className="vehicle-value">75.2t</span>
              <span className="vehicle-value">04:14</span>
            </p>
            <p className="vehicle-card-props">
              <span className="vehicle-label">DT122</span>
              <span className="vehicle-value">148.3t</span>
              <span className="vehicle-value">05:14</span>
            </p>
            <p className="vehicle-card-props">
              <span className="vehicle-label">DT123</span>
              <span className="vehicle-value">159.1t</span>
              <span className="vehicle-value">04:32</span>
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default VehicleCard;
