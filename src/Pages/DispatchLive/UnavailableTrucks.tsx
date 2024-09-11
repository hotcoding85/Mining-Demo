import React from "react";
import TruckItem from "./TruckItem";

const UnavailableTrucks : React.FC = () => {
    return (
        <React.Fragment>
            <div>
                <p className="right-board-topic">Standby No Operator Assigned</p>
                <div className="d-flex flex-row justify-content-between" style={{height : 64}}>
                    <TruckItem
                        truckId="DT110"
                        fontColor="#FF4D4F"
                    />
                    <TruckItem
                        truckId="DT111"
                        fontColor="#FF4D4F"
                    />
                    <TruckItem
                        truckId=""
                        fontColor="#FF4D4F"
                    />
                </div>
            </div>
        </React.Fragment>
    )
}

export default UnavailableTrucks;