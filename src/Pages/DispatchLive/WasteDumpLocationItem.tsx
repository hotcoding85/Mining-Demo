import React from "react";
import "./styles/wasteDump.scss";
import { DumpLocation } from "./interfaces/type";
import { useDrag } from "react-dnd";

interface WasteDumpLocationItemProps {
  dumpLocation: any;
}
const WasteDumpLocationItem: React.FC<WasteDumpLocationItemProps> = ({
  dumpLocation,
}) => {
  const [{ isDragging }, drag] = useDrag({
    type: "DUMPLOCATION",
    item: { ...dumpLocation },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  return (
    <div
      ref={drag}
      style={{ opacity: isDragging ? 0.5 : 1 }}
      className="waste-dump-item"
    >
      <img src={dumpLocation.locationImg} alt="north" />
      <p className="waste-dump-chips">{dumpLocation.name} - {dumpLocation.blockId}</p>
    </div>
  );
};

export default WasteDumpLocationItem;
