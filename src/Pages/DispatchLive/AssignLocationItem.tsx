import React from "react";
import { DumpLocation } from "./interfaces/type";
import { useDrop } from "react-dnd";

interface AssignLocationItemProps {
  diggerId: string;
  destinationId: any;
  truckId:any;
  locations: any[];
  addDumpLocation: (newDumpLocation: any, truckId: string) => void;
}

const AssignLocationItem: React.FC<AssignLocationItemProps> = ({
  diggerId,
  destinationId,
  truckId,
  locations,
  addDumpLocation,
}) => {
  const [{ isOver, canDrop }, drop] = useDrop({
    accept: "DUMPLOCATION",
    drop: (draggedLocation: DumpLocation) => {
      addDumpLocation(draggedLocation, truckId);
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
      canDrop: !!monitor.canDrop(),
    }),
  });

  const location = locations.find(item => item.id === destinationId);

  return (
    <div
      ref={drop}
      className={
        "assign-location-item " +
        (isOver && canDrop ? "can-drop " : "") +
        (location ? "filled" : "")
      }
    >
      {location ? (
        <div className="assigned-dump-item">
          <img src={location.locationImg} alt="north" />
          <p className="assigned-dump-chips">{location.name}</p>
        </div>
      ) : (
        <p className="empty">+ Assign Location here</p>
      )}
    </div>
  );
};

export default AssignLocationItem;
