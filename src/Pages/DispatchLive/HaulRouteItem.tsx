import React from "react";
import "./styles/haulRoute.scss";
import { DumpLocation } from "./interfaces/type";
import { useDrag } from "react-dnd";

interface HaulRouteItemProps {
  dumpLocation: any;
}
const HaulRouteItem: React.FC<HaulRouteItemProps> = ({ dumpLocation }) => {
  const [{ isDragging }, drag] = useDrag({
    type: "ROUTE",
    item: { ...dumpLocation },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  return (
    <div
      ref={drag}
      style={{ opacity: isDragging ? 0.5 : 1 }}
      className="haul-route-item"
    >
      <img src={dumpLocation.locationImg} alt="north" />
      <p className="haul-route-chips">{dumpLocation.name}</p>
    </div>
  );
};

export default HaulRouteItem;
