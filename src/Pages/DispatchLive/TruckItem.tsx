import React from "react";

interface TruckItemProps {
    truckId: string;
    fontColor: string;    
}
const TruckItem : React.FC<TruckItemProps> = ({
    truckId,
    fontColor
}) => {
    return (
        <div className={"truck-item " + (truckId ? "filled" : "empty")}>
            <p className="truck" style={{color:fontColor}}>{truckId}</p>
        </div>
    )
}

export default TruckItem;
