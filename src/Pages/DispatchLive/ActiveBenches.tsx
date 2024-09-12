import React from "react";
import { ActiveBenchData } from "./interfaces/type";
import "./styles/benches.scss";

interface ActiveBenchesProps {
  activeBenches: ActiveBenchData[];
}
const ActiveBenches: React.FC<ActiveBenchesProps> = ({ activeBenches }) => {
  return (
    <React.Fragment>
      <div className="px-3">
        <p className="right-board-topic">Active Benches Locations in Pit</p>
        <div className="benches-container">
          {activeBenches.map((item, index) => (
            <div key={item.name} className="benches-item">
              <p className="benches-item-label">{item.name}</p>
            </div>
          ))}
        </div>
      </div>
    </React.Fragment>
  );
};

export default ActiveBenches;
