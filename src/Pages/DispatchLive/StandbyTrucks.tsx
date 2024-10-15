import React, { useState } from "react";
import TruckItem from "./TruckItem";
import { compareAsc } from "date-fns";

interface StandbyTrucksProps {
  standByTrucks: any[];
}

const StandbyTrucks: React.FC<StandbyTrucksProps> = ({ standByTrucks }) => {
  const [showSize, setShowSize] = useState<number>(3);
  const [showedAll, setShowedAll] = useState<boolean>(false);
  const handleShowMore = () => {
    setShowSize(standByTrucks.length);
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
          <p className="right-board-topic">Standby No Operator Assigned</p>
          <div
            className="show-more-btn"
            onClick={!showedAll ? handleShowMore : handleShowLess}
          >
            {!showedAll ? "View more" : "View Less"}
          </div>
        </div>
        <div
          className="d-flex flex-row flex-wrap"
          style={{
            columnGap: "32px",
          }}
        >
          {standByTrucks
            .sort((a, b) => compareAsc(a.name, b.name))
            .slice(0, showSize)
            .map((truck) => (
              <TruckItem title={truck.name} fontColor="#FFC53D" />
            ))}
        </div>
      </div>
    </React.Fragment>
  );
};

export default StandbyTrucks;
