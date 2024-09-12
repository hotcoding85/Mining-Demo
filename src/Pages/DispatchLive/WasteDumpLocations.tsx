import React, {useState} from "react";
import { dumpCentral, dumpNorth, dumpSouth } from "assets/images/locations";
import WasteDumpLocationItem from "./WasteDumpLocationItem";
import "./styles/wasteDump.scss"
import { DumpLocation } from "./interfaces/type";

interface WasteDumpLocationsProps {
    dumpLocationsForAssign : DumpLocation[];
}

const WasteDumpLocations : React.FC<WasteDumpLocationsProps> = ({
    dumpLocationsForAssign
}) => {

    const [showSize, setShowSize] = useState<number>(3);
    const [showedAll, setShowedAll] = useState<boolean>(false);
    const handleShowMore = () => {
        const newShowSize = showSize + 3;
        setShowSize(newShowSize);
        setShowedAll(newShowSize >= dumpLocationsForAssign.length); 
    }
    const handleShowLess = () => {
        setShowSize(3);
        setShowedAll(false);
    }

    return (
        <React.Fragment>
            <div>
                <div className="d-flex flex-row justify-content-between">
                    <p className="right-board-topic">Waste Dump Locations</p>
                    <div className="show-more-btn" onClick={!showedAll?handleShowMore : handleShowLess}>{!showedAll ? "View more" : "View Less"}</div>
                </div>
                <div className="waste-dump-container">
                    {dumpLocationsForAssign.slice(0, showSize).map((location) => (
                        <WasteDumpLocationItem key={location.id} dumpLocation={location} />
                    ))}   
                </div>
            </div>
        </React.Fragment>
    )
}

export default WasteDumpLocations;