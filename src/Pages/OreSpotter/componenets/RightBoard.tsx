import React from "react";
import StandbyTrucks from "../../DispatchLive/StandbyTrucks";
import UnavailableTrucks from "../../DispatchLive/UnavailableTrucks";
import ActiveBenches from "../../DispatchLive/ActiveBenches";
import { activeBenches } from "../../DispatchLive/data/sampleData";
import WasteDumpLocations from "../../DispatchLive/WasteDumpLocations";
import OreBodies from "../../DispatchLive/OreBodies";
import ReadyTrucks from "../../DispatchLive/ReadyTrucks";
import MessageBoard from "../../DispatchLive/MessageBoard";
import {
  DumpLocation,
  Material,
  Truck,
} from "../../DispatchLive/interfaces/type";

interface RightBoardProps {
  readyTrucks: Truck[];
  targetMaterials?: Material[];
  dumpLocationsForAssign: DumpLocation[];
}

const RightBoard: React.FC<RightBoardProps> = ({
  readyTrucks,
  targetMaterials,
  dumpLocationsForAssign,
}) => {
  return (
    <React.Fragment>
      <div className="dispatch-right-board">
        <MessageBoard />
        <div className="right-board-divider" />
        <ReadyTrucks readyTrucks={readyTrucks} />
        <div className="right-board-divider" />
        <StandbyTrucks />
        <div className="right-board-divider" />
        <UnavailableTrucks />
        <div className="right-board-divider" />
        <ActiveBenches activeBenches={activeBenches} />
        <div className="right-board-divider" />
        <WasteDumpLocations dumpLocationsForAssign={dumpLocationsForAssign} />
        <div className="right-board-divider" />
        <OreBodies targetMaterials={targetMaterials} />
      </div>
    </React.Fragment>
  );
};

export default RightBoard;
