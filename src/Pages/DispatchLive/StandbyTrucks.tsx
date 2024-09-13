import React from "react";
import TruckItem from "./TruckItem";

const StandbyTrucks: React.FC = () => {
  return (
    <React.Fragment>
      <div className="px-3">
        <p className="right-board-topic">Standby No Operator Assigned</p>
        <div
          className="d-flex flex-row justify-content-between"
          style={{ height: 64 }}
        >
          <TruckItem truckId="DT105" fontColor="#FFC53D" />
          <TruckItem truckId="" fontColor="#FFC53D" />
          <TruckItem truckId="" fontColor="#FFC53D" />
        </div>
      </div>
    </React.Fragment>
  );
};

export default StandbyTrucks;
