import React, { useState } from "react";
import TruckItemForReady from "./TruckItemForReady";
import { Button } from "antd";
import { Truck } from "./interfaces/type";

interface ReadyTrucksProps {
    readyTrucks : Truck[];
}

const ReadyTrucks : React.FC<ReadyTrucksProps> = ({
    readyTrucks
}) => {

    const [showSize, setShowSize] = useState<number>(3);
    const [showedAll, setShowedAll] = useState<boolean>(false);
    const handleShowMore = () => {
        const newShowSize = showSize + 3;
        setShowSize(newShowSize);
        setShowedAll(newShowSize >= readyTrucks.length); 
    }
    const handleShowLess = () => {
        setShowSize(3);
        setShowedAll(false);
    }

    return (
        <React.Fragment>
            <div>
            <div>
                <p className="right-board-topic">Ready for dispatch on Go-Line</p>
                <div className="d-flex flex-row flex-wrap" style={{gap: 10}}>
                    {readyTrucks.slice(0, showSize).map((truck) => (
                        <TruckItemForReady key={truck.id} truck={truck} />
                    ))}
                </div>
                <Button className="show-more-button" onClick={!showedAll?handleShowMore : handleShowLess}>{!showedAll ? "Show more" : "Show Less"}</Button>
            </div>
            </div>
        </React.Fragment>
    )
}

export default ReadyTrucks;