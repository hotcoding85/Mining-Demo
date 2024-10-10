import React, { useState } from "react";
import { ActiveBenchData } from "./interfaces/type";
import ActiveBenchItem from "./ActiveBenchItem";
import "./styles/benches.scss";

interface ActiveBenchesProps {
  activeBenches: any[];
}
const ActiveBenches: React.FC<ActiveBenchesProps> = ({ activeBenches }) => {
  const [showSize, setShowSize] = useState<number>(3);
  const [showedAll, setShowedAll] = useState<boolean>(false);
  const handleShowMore = () => {
    setShowSize(activeBenches.length);
    setShowedAll(true);
  };
  const handleShowLess = () => {
    setShowSize(3);
    setShowedAll(false);
  };

  return (
    <React.Fragment>
      <div>
        <div className="d-flex flex-row justify-content-between">
          <p className="right-board-topic">Active Benches Locations</p>
          <div
            className="show-more-btn"
            onClick={!showedAll ? handleShowMore : handleShowLess}
          >
            {!showedAll ? "View more" : "View Less"}
          </div>
        </div>
        <div className="benches-container">
          {activeBenches?.slice(0, showSize)?.map((item, index) => (
            <ActiveBenchItem key={index} benchItem={item} />
          ))}
        </div>
      </div>
    </React.Fragment>
  );
};

export default ActiveBenches;
