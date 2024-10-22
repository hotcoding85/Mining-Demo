import { useState, FC, useMemo } from "react";
import { pc2000 } from "assets/images/equipment";
import { Progress } from "antd";
import { ActiveBenchData } from "./interfaces/type";
import { useDrop } from "react-dnd";

const getStatusColor = (status: string) => {
  switch (status) {
    case "STANDBY":
      return "#f4b400"; // Yellow
    case "DOWN":
      return "#db4437"; // Red
    case "ACTIVE":
      return "#0f9d58"; // Green
    case "DELAY":
      return "purple";
    default:
      return "#4285f4"; // Blue
  }
};

interface VehicleCardProps {
  vehicle?: any;
  dispatchs?: any;
  shiftRoster?: any[];
  smu: number;
  fuelLevel: number;
  fuelRate: number;
  imageUrl: string;
  lastUpdated: string;
  sync: "manual" | "inactive" | "active";
  assignedBenches: any[];
  collapse: boolean;
  changePlanState: (location: any, vehicleId: string) => void;
  addBenches: (newLocation: any, oldLocation: any, data: any) => void;
}
const VehicleCard: FC<VehicleCardProps> = ({
  vehicle,
  dispatchs,
  shiftRoster,
  smu,
  fuelLevel,
  fuelRate,
  imageUrl,
  lastUpdated,
  sync,
  assignedBenches,
  collapse,
  changePlanState,
  addBenches,
}) => {
  const statusColor = getStatusColor(vehicle?.status);
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

  const currentRoster = useMemo(() => {
    return shiftRoster?.find((item) => item.vehicleId === vehicle?.id) || null;
  }, [shiftRoster, vehicle]);

  const filteredLocations = dispatchs?.filter(
    (item) =>
      (item.status === "INPROGRESS" || item.status === "PLANNED") &&
      item.excavatorId === vehicle.id
  );

  const nextLocations = dispatchs
    ?.filter(
      (item) => item.status === "PLANNED" && item.excavatorId === vehicle.id
    )
    ?.sort((a: any, b: any) => a?.source?.name?.localeCompare(b?.source?.name));

  const DropTarget = ({
    targetData,
    dropId,
    field,
    children,
    updateLocations,
    style = "",
  }) => {
    const [{ isOver }, drop] = useDrop(() => ({
      accept: "image",
      drop: ({ id, value }: any) =>
        updateLocations(id, dropId, field, value, targetData),
      collect: (monitor) => ({
        isOver: !!monitor.isOver(),
      }),
    }));

    return (
      <div ref={drop} className={style}>
        {children}
      </div>
    );
  };

  const updateLocation = (
    id: string,
    dropId: string,
    field: string,
    value: any,
    targetData: any
  ) => {
    if (dropId === "location") {
      const { id: vehicleId, excavator = {} } = vehicle;
      const roster = shiftRoster?.[0]?.roster ?? "";

      const data = {
        excavatorId: vehicleId,
        excavator: excavator.id ? excavator : vehicle || {},
        roster,
        status: "PLANNED",
      };

      addBenches(value, targetData, data);
    }
  };

  return (
    <div className="vehicle-card">
      <div className="vehicle-card-header">
        <div className="vehicle-header-image">
          <img src={pc2000} alt="pc2000" style={{ width: 40, height: 40 }} />
        </div>
        <div className="vehicle-name">
          <div className="vehicle-id">{vehicle?.name}</div>
          <div className="vehicle-category">{vehicle?.model}</div>
          {!!currentRoster?.operators?.length ? (
            <div className="vehicle-driver">
              {currentRoster?.operators?.[0]?.firstName}
            </div>
          ) : (
            <div className="vehicle-operator-unassigned">Unassigned</div>
          )}
        </div>
        <span
          className="vehicle-card-status"
          style={{ backgroundColor: statusColor }}
        >
          {vehicle?.status}
        </span>
      </div>
      <div className="vehicle-card-details">
        <div className="location-item">
          {!!filteredLocations?.length && (
            <select
              name="current-work-location"
              id="currentWorkLocation"
              onChange={(e) => {
                const selectedOptionId = e.target.selectedOptions[0].id;
                changePlanState(selectedOptionId, vehicle.id);
              }}
            >
              <option hidden></option>
              {filteredLocations.map((item) => {
                return (
                  <option
                    key={item.id}
                    value={item.value}
                    id={item?.source?.id}
                    selected={item.status === "INPROGRESS"}
                  >
                    {item?.source?.name}
                    {/* - {item?.source.blockId} */}
                  </option>
                );
              })}
            </select>
          )}
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
          <div className="vehicle-medium-label">Total Tonnes</div>
          <div className="vehicle-chips-value">5,548.2</div>
        </div>

        <div>
          <p className="vehicle-card-props">
            <span className="vehicle-progress-label">Next Work Locations</span>
          </p>
          <div className="next-location-container">
            {nextLocations?.map((location) => (
              <p className="d-flex gap-3 justify-content-between mb-0">
                <DropTarget
                  targetData={location}
                  dropId="location"
                  field={"location"}
                  updateLocations={updateLocation}
                >
                  <div className="d-flex flex-column gap-2 item">
                    <span className="shift-value fill label">
                      {location?.source?.name}
                      {/* - {location?.source.blockId} */}
                    </span>
                  </div>
                </DropTarget>
              </p>
            ))}
            <p className="d-flex gap-3 justify-content-between mb-0">
              <DropTarget
                targetData={""}
                dropId="location"
                field={"location"}
                updateLocations={updateLocation}
              >
                <div className="d-flex flex-column gap-2 item">
                  <span className="shift-value empty label">+New location</span>
                </div>
              </DropTarget>
            </p>
          </div>
        </div>
        <div className="d-flex flex-row-reverse mt-3 mb-3">
          <div className="show-more-btn" onClick={onShowMoreOrLess}>
            {isShowMore ? "View More" : "View Less"}
          </div>
        </div>

        {!isShowMore && (
          <div>
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
    </div>
  );
};

export default VehicleCard;
