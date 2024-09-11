import React from "react";
import TruckItemForReady from "./TruckItemForReady";
import { Button } from "antd";
import { Truck } from "./interfaces/type";

interface ReadyTrucksProps {
    readyTrucks : Truck[];
}

const ReadyTrucks : React.FC<ReadyTrucksProps> = ({
    readyTrucks
}) => {
    const handleShowMore = () => {

    }

    return (
        <React.Fragment>
            <div>
            <div>
                <p className="right-board-topic">Ready for dispatch on Go-Line</p>
                <div className="d-flex flex-row justify-content-between">
                    {readyTrucks.map((truck) => (
                        <TruckItemForReady key={truck.id} truck={truck} />
                    ))}
                </div>
                <Button className="show-more-button" onClick={handleShowMore}>Show more</Button>
            </div>
            </div>
        </React.Fragment>
    )
}

export default ReadyTrucks;