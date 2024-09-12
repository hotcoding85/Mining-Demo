import React, { useState, useRef, useEffect } from "react";
import { useDrop } from "react-dnd";
import "./styles/assignItem.scss";
import { Truck } from "./interfaces/type";
import {
  hd1500,
  hd785,
  pc1250,
  pc2000,
  placeHolder,
  wa600,
} from "assets/images/equipment";
import { Progress, Divider } from "antd";

interface AssignTruckItemProps {
  diggerId: string;
  sourceId: number;
  readyTrucks: Truck[];
  updateReadyTrucks: (updatedTask: Truck) => void;
  collapse?: boolean;
}

const AssignTruckItem: React.FC<AssignTruckItemProps> = ({
  diggerId,
  sourceId,
  readyTrucks,
  updateReadyTrucks,
  collapse = true,
}) => {
  const truckForAssign = readyTrucks.find(
    (truck) => truck.assignId === sourceId && truck.diggerId === diggerId
  );

  const [{ isOver, canDrop }, drop] = useDrop({
    accept: "READYTRUCK",
    drop: (draggedTruck: Truck) => {
      const updatedTruck = {
        ...draggedTruck,
        assignId: sourceId,
        diggerId: diggerId,
      };
      updateReadyTrucks(updatedTruck);
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
      canDrop: !!monitor.canDrop(),
    }),
  });

  return (
    <div
      ref={drop}
      className={
        "assign-truck-item " +
        (isOver && canDrop ? "can-drop " : "") +
        (truckForAssign ? "filled" : "")
      }
    >
      {truckForAssign ? (
        <div className="assigned-truck-item-container">
          <div className="assigned-truck-header">
            <div className="assigned-truck-header-image">
              <img src={hd785} alt="hd785" style={{ width: 24, height: 24 }} />
            </div>
            <div className="assigned-truck-name">
              <div className="assigned-truck-id-status">
                <p className="assigned-truck-id">
                  {truckForAssign.truckId + "(HD785-2)"}
                </p>
                <p className="assigned-truck-status">Active</p>
              </div>
              <div className="vehicle-driver">{truckForAssign.operator}</div>
            </div>
          </div>
          <div className="assigned-truck-details">
            <div className="assigned-truck-progress">
              <p className="progress-text">
                <span className="progress-label">Total Planned Load</span>
                <span className="progress-value">23/35</span>
              </p>
              <Progress percent={66} showInfo={false} />
            </div>
            {collapse && (
              <div className="truck-props-container">
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
          </div>
        </div>
      ) : (
        <p className="empty">+ Assign truck here</p>
      )}
    </div>
  );
};

export default AssignTruckItem;
