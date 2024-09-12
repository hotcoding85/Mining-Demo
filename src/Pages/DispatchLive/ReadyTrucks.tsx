import React, { useState } from "react";
import TruckItemForReady from "./TruckItemForReady";
import { Button } from "antd";
import { Truck } from "./interfaces/type";

interface ReadyTrucksProps {
  readyTrucks: Truck[];
}

const ReadyTrucks: React.FC<ReadyTrucksProps> = ({ readyTrucks }) => {
  const [isShowMore, setIsShowMore] = useState<boolean>(false);

  const handleShowMore = () => {
    setIsShowMore(!isShowMore);
  };

  return (
    <React.Fragment>
      <div className="px-3">
        <p className="right-board-topic">Ready for dispatch on Go-Line</p>
        <div className="truck-items-container">
          {readyTrucks
            .slice(0, isShowMore ? readyTrucks.length : 3)
            .map((truck) => (
              <TruckItemForReady key={truck.id} truck={truck} />
            ))}
        </div>
        <Button className="show-more-button" onClick={handleShowMore}>
          {isShowMore ? "Show less" : "Show more"}
        </Button>
      </div>
    </React.Fragment>
  );
};

export default ReadyTrucks;
