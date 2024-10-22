import React, { useMemo, useState } from "react";
import { useDrop } from "react-dnd";
import "./styles/assignItem.scss";
import { Truck } from "./interfaces/type";
import { hd785 } from "assets/images/equipment";
import { Progress, Dropdown } from "antd";
import type { MenuProps } from "antd";
import { useShiftRosters } from "Hooks/useShiftRosters";

interface AssignTruckItemProps {
  excavators: any[];
  dispatchs: any[];
  excavatorId: string;
  assignedTruck: any;
  assignReadyTrucks: (oldTruck, newTruck, excavatorId) => void;
  removeTruckFromAssigned: (removedTruck, excavatorId) => void;
  reAssignTruckToFleet: (truck, fromId, toId) => void;
  directionDispalyName: "inline" | "wrap";
}

const AssignTruckItem: React.FC<AssignTruckItemProps> = ({
  excavators,
  dispatchs,
  excavatorId,
  assignedTruck,
  assignReadyTrucks,
  reAssignTruckToFleet,
  removeTruckFromAssigned,
  directionDispalyName,
}) => {
  const [isShowMore, setIsShowMore] = useState<boolean>(true);
  const { findShiftRostersByTruckId } = useShiftRosters();
  const onShowMoreOrLess = () => {
    setIsShowMore(!isShowMore);
  };

  const items: MenuProps["items"] = useMemo(() => {
    const filteredDispatchs = excavators.filter(
      (item) => item.id !== excavatorId
    );

    return [
      {
        key: "Return",
        label: "Return to GO-Line",
      },
      ...filteredDispatchs.map((item) => ({
        key: item?.id,
        label: `Re-assign to ${item?.name}`,
      })),
    ];
  }, [dispatchs, excavatorId]);

  const handleMenuClick: MenuProps["onClick"] = (e) => {
    if (assignedTruck) {
      if (e.key == "Return") {
        removeTruckFromAssigned(assignedTruck, excavatorId);
      } else {
        reAssignTruckToFleet(assignedTruck, excavatorId, e.key);
      }
    }
  };

  const menu = {
    items,
    onClick: handleMenuClick,
  };

  const [{ isOver, canDrop }, drop] = useDrop({
    accept: "READYTRUCK",
    drop: (draggedTruck: Truck) => {
      assignReadyTrucks(assignedTruck, draggedTruck, excavatorId);
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
      canDrop: !!monitor.canDrop(),
    }),
  });

  const shiftRoster = findShiftRostersByTruckId(assignedTruck?.truckId);

  return (
    <div
      ref={drop}
      className={
        "assign-truck-item " +
        (isOver && canDrop ? "can-drop " : "") +
        (assignedTruck ? "filled" : "")
      }
    >
      {assignedTruck ? (
        <div className="assigned-truck-item-container">
          <div className="assigned-truck-header">
            <div className={directionDispalyName}>
              <div className="assigned-truck-header-image-wrapper">
                <div className="assigned-truck-header-image">
                  <img
                    src={hd785}
                    alt="hd785"
                    style={{ width: 24, height: 24 }}
                  />
                </div>
                {directionDispalyName === "wrap" && (
                  <p className="assigned-truck-status">Active</p>
                )}
              </div>
              <div className="assigned-truck-name">
                <div className="assigned-truck-id-status">
                  <p className="assigned-truck-id">
                    {assignedTruck?.truck?.name}
                  </p>
                  {directionDispalyName === "inline" && (
                    <p className="assigned-truck-status">Active</p>
                  )}
                </div>
                <div>HD785-7</div>
                <div className="vehicle-driver">
                  {shiftRoster?.operators?.[0]?.firstName || "Unassigned"}
                </div>
              </div>
            </div>{" "}
            <Dropdown menu={menu} placement="bottomLeft" arrow>
              <div className="dropdown-img"></div>
            </Dropdown>
          </div>
          <div className="assigned-truck-details">
            <div className="assigned-truck-progress">
              <p className="progress-text">
                <span className="progress-label">Total Planned Load</span>
                <span className="progress-value">23/35</span>
              </p>
              <Progress percent={66} showInfo={false} />
            </div>
            {!isShowMore && (
              <div className="d-flex flex-column" style={{ width: "100%" }}>
                <p className="truck-props">
                  <span className="props-label">Avg Load Time</span>
                  <span className="props-value">04:21</span>
                </p>
                <p className="truck-props">
                  <span className="props-label">Tonnes per hour</span>
                  <span className="props-value">50t</span>
                </p>
                <p className="truck-props">
                  <span className="props-label">Operational Delays</span>
                  <span className="props-value">06:13</span>
                </p>
                <p className="truck-props">
                  <span className="props-label">
                    Number of Operational Delay Events
                  </span>
                  <span className="props-value">5</span>
                </p>
                <p className="truck-props cycle-time">
                  <span className="props-label">Total Previous Cycle Time</span>
                  <div className="cycle-time-container">
                    <span className="time-chips">13:30</span>
                    <span className="time-chips">14:20</span>
                    <span className="time-chips">15:32</span>
                    <span className="time-chips">13:47</span>
                    <span className="time-chips">16:26</span>
                  </div>
                </p>
              </div>
            )}
            <div className="d-flex flex-row-reverse">
              <div className="show-more-btn" onClick={onShowMoreOrLess}>
                {isShowMore ? "View More" : "View Less"}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <p className="empty">+ Assign truck here</p>
      )}
    </div>
  );
};

export default AssignTruckItem;
