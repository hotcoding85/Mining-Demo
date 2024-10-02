import { FC, DragEventHandler } from "react";
import { Link } from "react-router-dom";

export interface FuelData {
  id: string;
  smu: number;
  fuelLevel: number;
  isRequestingFuel: boolean;
  fuelRate: number;
  fuelTruckAssign: string;
  priority: string;
  handleDrop: DragEventHandler<HTMLDivElement>;
  handleDragOver: DragEventHandler<HTMLDivElement>;
}

const FuelSchedulerCard: FC<FuelData> = ({
  handleDrop,
  id,
  smu,
  fuelLevel,
  fuelTruckAssign,
  priority,
  fuelRate,

  isRequestingFuel,
  handleDragOver,
}) => {
  return (
    <div className="fuel-scheduler-card" onDrop={handleDrop} onDragOver={handleDragOver}>
      <div className="fuel-card-header">
        <div className="vehicle-name">{id}</div>
        {isRequestingFuel && (
          <span
            className="position-relative event-status"
            style={{ backgroundColor: "#AD4E00" }}
          >
            Requesting Fuel
          </span>
        )}
      </div>

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

      <div className="fuel-card-footer">
        {fuelTruckAssign.trim() && (
          <div className="fuel-truck-chip">{fuelTruckAssign}</div>
        )}
        {priority.trim() && <div className="fuel-truck-chip">{priority}</div>}
      </div>
    </div>
  );
};

export default FuelSchedulerCard;
