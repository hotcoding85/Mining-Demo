import React, { useState } from "react";
import TruckItemForReady from "./TruckItemForReady";
import { Truck } from "./interfaces/type";
import { compareAsc } from "date-fns";

interface ReadyTrucksProps {
  readyTrucks: any[];
}

const ReadyTrucks: React.FC<ReadyTrucksProps> = ({ readyTrucks }) => {
  const [showSize, setShowSize] = useState<number>(3);
  const [showedAll, setShowedAll] = useState<boolean>(false);
  const handleShowMore = () => {
    setShowSize(readyTrucks.length);
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
          <p className="right-board-topic">Ready for dispatch</p>
          <div
            className="show-more-btn"
            onClick={!showedAll ? handleShowMore : handleShowLess}
          >
            {!showedAll ? "View more" : "View Less"}
          </div>
        </div>
        <div
          className="d-flex flex-row flex-wrap"
          style={{ columnGap: "32px" }}
        >
          {readyTrucks
            .sort((a, b) => compareAsc(a.vehicle.name, b.vehicle.name))
            .slice(0, showSize)
            .map((truck) => (
              <TruckItemForReady key={truck.id} truck={truck} />
            ))}
        </div>
      </div>
    </React.Fragment>
  );
};

export default ReadyTrucks;
