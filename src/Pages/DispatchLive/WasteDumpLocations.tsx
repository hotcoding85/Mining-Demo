import React from "react";
import { dumpCentral, dumpNorth, dumpSouth } from "assets/images/locations";
import WasteDumpLocationItem from "./WasteDumpLocationItem";
import "./styles/wasteDump.scss";
import { DumpLocation } from "./interfaces/type";

interface WasteDumpLocationsProps {
  dumpLocationsForAssign: DumpLocation[];
}

const WasteDumpLocations: React.FC<WasteDumpLocationsProps> = ({
  dumpLocationsForAssign,
}) => {
  return (
    <React.Fragment>
      <div className="px-3">
        <p className="right-board-topic">Waste Dump Locations</p>
        <div className="waste-dump-container">
          {dumpLocationsForAssign.map((location) => (
            <WasteDumpLocationItem key={location.id} dumpLocation={location} />
          ))}
        </div>
      </div>
    </React.Fragment>
  );
};

export default WasteDumpLocations;
