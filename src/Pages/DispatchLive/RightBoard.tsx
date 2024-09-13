import React, {useState} from "react";
import StandbyTrucks from "./StandbyTrucks";
import UnavailableTrucks from "./UnavailableTrucks";
import ActiveBenches from "./ActiveBenches";
import { activeBenches } from "./data/sampleData";
import WasteDumpLocations from "./WasteDumpLocations";
import OreBodies from "./OreBodies";
import ReadyTrucks from "./ReadyTrucks";
import MessageBoard from "./MessageBoard";
import { DumpLocation, Material, Truck } from "./interfaces/type";
import OreDumpLocations from "./OreDumpLocations";
import { OreDumpsForAssign } from "./data/sampleData";

interface RightBoardProps {
  readyTrucks: Truck[];
  dumpLocationsForAssign: DumpLocation[];
  targetMaterials : Material[];
}

const RightBoard: React.FC<RightBoardProps> = ({
  readyTrucks,
  dumpLocationsForAssign,
  targetMaterials
}) => {
    const [isShowMore, setIsShowMore] = useState<boolean>(true);

    const onShowMoreOrLess = () => {
        setIsShowMore(!isShowMore);
    };

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
                <WasteDumpLocations 
                    dumpLocationsForAssign = {dumpLocationsForAssign}
                />
                <div className="right-board-divider" />
                <OreDumpLocations 
                    dumpLocationsForAssign = {OreDumpsForAssign}
                />
                <div className="right-board-divider" />
                <UnavailableTrucks />
                <div className="right-board-divider" />
                <ActiveBenches 
                    activeBenches={activeBenches}
                />
                <div className="right-board-divider" />
            </div>
        </React.Fragment>
    )
}

export default RightBoard;
