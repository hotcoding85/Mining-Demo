import React, { useState } from "react";
import TruckItemForReady from "./TruckItemForReady";
import { Button } from "antd";
import { Truck } from "./interfaces/type";

interface ReadyTrucksProps {
  readyTrucks: Truck[];
}

const ReadyTrucks : React.FC<ReadyTrucksProps> = ({
    readyTrucks
}) => {

    const [showSize, setShowSize] = useState<number>(3);
    const [showedAll, setShowedAll] = useState<boolean>(false);
    const handleShowMore = () => {
        setShowSize(readyTrucks.length);
        setShowedAll(true); 
    }
    const handleShowLess = () => {
        setShowSize(3);
        setShowedAll(false);
    }

    return (
        <React.Fragment>
            <div>
                <div className="d-flex flex-row justify-content-between">
                    <p className="right-board-topic">Ready for dispatch on Go-Line</p>
                    <div className="show-more-btn" onClick={!showedAll?handleShowMore : handleShowLess}>{!showedAll ? "View more" : "View Less"}</div>
                </div>
                <div className="d-flex flex-row flex-wrap" style={{gap: 10}}>
                    {readyTrucks.slice(0, showSize).map((truck) => (
                        <TruckItemForReady key={truck.id} truck={truck} />
                    ))}
                </div>
            </div>
        </React.Fragment>
    )
}

export default ReadyTrucks;
