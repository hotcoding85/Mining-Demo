import React from "react";
import { DumpLocation } from "./interfaces/type";
import { useDrop } from "react-dnd";

interface AssignLocationItemProps {
  diggerId: string;
  dumpLocation: any;
  addDumpLocation: (newDumpLocation: any, diggerId: string) => void;
}

const AssignLocationItem: React.FC<AssignLocationItemProps> = ({
  diggerId,
  dumpLocation,
  addDumpLocation,
}) => {
  const [{ isOver, canDrop }, drop] = useDrop({
    accept: "DUMPLOCATION",
    drop: (draggedLocation: DumpLocation) => {
      addDumpLocation(draggedLocation, diggerId);
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
      canDrop: !!monitor.canDrop(),
    }),
  });

  return (
    <div
      ref={drop}
      className={
        "assign-location-item " +
        (isOver && canDrop ? "can-drop " : "") +
        (dumpLocation ? "filled" : "")
      }
    >
      {dumpLocation ? (
        <div className="assigned-dump-item">
          <img src={dumpLocation.locationImg} alt="north" />
          <p className="assigned-dump-chips">{dumpLocation.name}</p>
        </div>
      ) : (
        <p className="empty">+ Assign Location here</p>
      )}
    </div>
  );
};

export default AssignLocationItem;
