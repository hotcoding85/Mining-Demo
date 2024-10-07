import React, { useState } from "react";
import StandbyTrucks from "./StandbyTrucks";
import UnavailableTrucks from "./UnavailableTrucks";
import ActiveBenches from "./ActiveBenches";
import { activeBenches } from "./data/sampleData";
import WasteDumpLocations from "./WasteDumpLocations";
import OreBodies from "./OreBodies";
import ReadyTrucks from "./ReadyTrucks";
import MessageBoard from "./MessageBoard";
import { DumpLocation, HaulRoute, Material, Truck } from "./interfaces/type";
import OreDumpLocations from "./OreDumpLocations";
import { OreDumpsForAssign } from "./data/sampleData";
import HaulRoutes from "./HaulRoutes";

interface RightBoardProps {
    readyTrucks: Truck[];
    dumpLocationsForAssign: DumpLocation[];
    haulRoutesForAssign: HaulRoute[];
    targetMaterials?: Material[];
}

const RightBoard: React.FC<RightBoardProps> = ({
    readyTrucks,
    dumpLocationsForAssign,
    haulRoutesForAssign,
    targetMaterials,
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
                    readyTrucks={readyTrucks}
                />
                <div className="right-board-divider" />
                <StandbyTrucks />
                <div className="right-board-divider" />
                <WasteDumpLocations
                    dumpLocationsForAssign={dumpLocationsForAssign}
                />
                <div className="right-board-divider" />
                <OreDumpLocations
                    dumpLocationsForAssign={OreDumpsForAssign}
                />
                <div className="right-board-divider" />
                <HaulRoutes routesForAssign={haulRoutesForAssign} />
                <div className="right-board-divider" />
                <ActiveBenches
                    activeBenches={activeBenches}
                />
                {targetMaterials && (
                    <>
                        <div className="right-board-divider" />
                        <OreBodies targetMaterials={targetMaterials} />
                    </>
                )}
            </div>
        </React.Fragment>
    )
}

export default RightBoard;
