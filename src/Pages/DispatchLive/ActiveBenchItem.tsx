import React from "react";
import "./styles/truckItem.scss";
import { ActiveBenchData } from "./interfaces/type";
import { useDrag } from "react-dnd";

interface ActiveBenchItemProps {
  benchItem: any;
}
const ActiveBenchItem: React.FC<ActiveBenchItemProps> = ({ benchItem }) => {
  const [{ isDragging }, drag] = useDrag({
    type: "BENCHITEM",
    item: { ...benchItem },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  return (
    <div
      ref={drag}
      style={{ opacity: isDragging ? 0.5 : 1 }}
      className="benches-item"
    >
      <p className="benches-item-label">
        {benchItem.name} - {benchItem.blockId}
      </p>
    </div>
  );
};

export default ActiveBenchItem;
