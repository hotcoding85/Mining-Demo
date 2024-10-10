import React from "react";
import TruckItem from "./TruckItem";

interface StandbyTrucksProps {
  standByTrucks: any[];
}

const StandbyTrucks: React.FC<StandbyTrucksProps> = ({ standByTrucks }) => {
  return (
    <React.Fragment>
      <div>
        <p className="right-board-topic">Standby No Operator Assigned</p>
        <div
          className="d-flex flex-row justify-content-start"
          style={{
            columnGap: "32px",
          }}
        >
          {standByTrucks.map((truck) => (
            <TruckItem title={truck.name} fontColor="#FFC53D" />
          ))}
        </div>
      </div>
    </React.Fragment>
  );
};

export default StandbyTrucks;
