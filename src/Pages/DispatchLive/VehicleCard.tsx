import { useState, FC } from "react";
import { VehicleData } from "./interfaces/type";
import { hd1500, hd785, pc1250, pc2000, placeHolder, wa600 } from "assets/images/equipment";
import { Progress, Divider} from "antd";
import { ActiveBenchData } from "./interfaces/type";
import { useDrop } from "react-dnd";
import { apiError } from "slices/users/reducer";

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

interface VehicleCardProps {
    index : number;
    id: string;
    status: string;
    smu: number;
    fuelLevel: number;
    fuelRate: number;
    imageUrl: string;
    lastUpdated: string;
    sync: "manual" | "inactive" | "active";
    assignedBenches : ActiveBenchData[];
    addBenches : (newBenches: ActiveBenchData) => void;
    collapse : boolean;
}
const VehicleCard: FC<VehicleCardProps> = ({
  index,
  id,
  status,
  smu,
  fuelLevel,
  fuelRate,
  imageUrl,
  lastUpdated,
  sync,
  assignedBenches,
  addBenches,
  collapse
}) => {
  const statusColor = getStatusColor(status);
  const [isHoveringSync, setIsHoveringSync] = useState(false);
  const [isShowMore, setIsShowMore] = useState<boolean>(true);

  const onShowMoreOrLess = () => {
      setIsShowMore(!isShowMore);
  };

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

  const nextLocations = assignedBenches.filter(
    (location) =>
      location.assignId === index
  );

  const [{ isOver, canDrop }, drop] = useDrop({
      accept: 'BENCHITEM',
      drop: (draggedBenches: ActiveBenchData) => {
          const newBenches = {
          ...draggedBenches,
          assignId : index
          };
          addBenches(newBenches);
      },
      collect: (monitor) => ({
          isOver: !!monitor.isOver(),
          canDrop: !!monitor.canDrop(),
      }),
  });

  return (
    <div
      ref={drop} 
      className="vehicle-card"
    >
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
        <div className="location-item">
          <select name="current-work-location" id="currentWorkLocation">
              <option value="440_BLK1_HG01" selected>440_BLK1_HG01</option>
          </select>
        </div>
        <div className="vehicle-card-progress">
          <p className="vehicle-progress-text">
            <span className="vehicle-progress-label">Fuel Level</span>
            <span className="vehicle-progress-value">{fuelLevel}%</span>
          </p>
          <Progress
            percent={fuelLevel}
            showInfo={false}
            className="fuel-level-progress-bar"
          />
        </div>
        <div className="vehicle-card-progress">
          <p className="vehicle-progress-text">
            <span className="vehicle-progress-label">Total Cycles</span>
            <span className="vehicle-progress-value">9/45</span>
          </p>
          <Progress
            percent={20}
            showInfo={false}
            className="total-cycles-progress-bar"
          />
        </div>
        <div className="vehicle-card-props">
          <div className="vehicle-medium-label">
            Total Tonnes Loaded in Shift
          </div>
          <div className="vehicle-chips-value">548.2</div>
        </div>
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
        <p className="vehicle-card-props">
          <span className="vehicle-label">Next Work Locations</span>
        </p>
        {!isShowMore && (
          <div>
            <div className="next-location-container">
              {nextLocations.map((location) => (
                <div className="item">
                  <p className="label">{location.name}</p>
              </div>
              ))}
            </div>
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
          </div>
        )}
      </div>
      <div className="d-flex flex-row-reverse">
            <div className="show-more-btn" onClick={onShowMoreOrLess}>{isShowMore ? 'View More' : 'View Less'}</div>
      </div>
    </div>
  );
};

export default VehicleCard;
