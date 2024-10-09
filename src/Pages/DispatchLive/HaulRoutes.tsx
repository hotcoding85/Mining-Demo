import React, { useState } from "react";
import "./styles/wasteDump.scss";
import { DumpLocation } from "./interfaces/type";
import HaulRouteItem from "./HaulRouteItem";

interface HaulRoutesProps {
  routesForAssign: any[];
}

const HaulRoutes: React.FC<HaulRoutesProps> = ({ routesForAssign }) => {
  const [showSize, setShowSize] = useState<number>(3);
  const [showedAll, setShowedAll] = useState<boolean>(false);
  const handleShowMore = () => {
    setShowSize(routesForAssign.length);
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
          <p className="right-board-topic">Haul Routes</p>
          <div
            className="show-more-btn"
            onClick={!showedAll ? handleShowMore : handleShowLess}
          >
            {!showedAll ? "View more" : "View Less"}
          </div>
        </div>
        <div className="haul-route-container">
          {routesForAssign.slice(0, showSize).map((location) => (
            <HaulRouteItem key={location.id} dumpLocation={location} />
          ))}
        </div>
      </div>
    </React.Fragment>
  );
};

export default HaulRoutes;
