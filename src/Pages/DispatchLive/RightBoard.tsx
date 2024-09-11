import React from "react";
import MessageBoardChips from "./MessageBoardChips";
import TruckItemForReady from "./TruckItemForReady";
import { Button } from "antd";
import StandbyTrucks from "./StandbyTrucks";
import UnavailableTrucks from "./UnavailableTrucks";
import ActiveBenches from "./ActiveBenches";
import { activeBenches } from "./data/sampleData";
import WasteDumpLocations from "./WasteDumpLocations";
import OreBodies from "./OreBodies";
import ReadyTrucks from "./ReadyTrucks";
import MessageBoard from "./MessageBoard";
import { DumpLocation, Truck } from "./interfaces/type";

interface RightBoardProps {
    readyTrucks : Truck[];
    dumpLocationsForAssign : DumpLocation[];
}

const RightBoard : React.FC<RightBoardProps> = ({
    readyTrucks,
    dumpLocationsForAssign
}) => {

    return (
        <React.Fragment>
            <div className="dispatch-right-board">
                <MessageBoard />
                <div className="right-board-divider" />
                <ReadyTrucks 
                    readyTrucks = {readyTrucks}
                />
                <div className="right-board-divider" />
                <StandbyTrucks />
                <div className="right-board-divider" />
                <UnavailableTrucks />
                <div className="right-board-divider" />
                <ActiveBenches 
                    activeBenches={activeBenches}
                />
                <div className="right-board-divider" />
                <WasteDumpLocations 
                    dumpLocationsForAssign = {dumpLocationsForAssign}
                />
                <div className="right-board-divider" />
                <OreBodies />
            </div>
        </React.Fragment>
    )
}

export default RightBoard;