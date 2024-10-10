import React from "react";
import "./styles/truckItem.scss"
import { Truck } from "./interfaces/type";
import { useDrag } from 'react-dnd';

interface TruckItemForReadyProps {
    truck : any;
}
const TruckItemForReady : React.FC<TruckItemForReadyProps> = ({
    truck
}) => {
    const [{ isDragging }, drag] = useDrag({
        type: 'READYTRUCK',
        item: { ...truck },
        collect: (monitor) => ({
          isDragging: monitor.isDragging(),
        }),
    });

    return (
        <div ref={drag} style={{ opacity: isDragging ? 0.5 : 1 }} className="truck-item">
            <p className="truck-active">{truck?.vehicle?.name}</p>
            <p className="operator">{truck?.operators?.[0]?.firstName}</p>
        </div>
    )
}

export default TruckItemForReady