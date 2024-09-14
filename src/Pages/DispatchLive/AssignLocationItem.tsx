import React from "react";
import { DumpLocation } from "./interfaces/type";
import { useDrop } from "react-dnd";

interface AssignLocationItemProps {
  diggerId : string;
  sourceId: number;
  dumpLocations: DumpLocation[];
  addDumpLocation: (newDumpLocation: DumpLocation) => void;
}

const AssignLocationItem: React.FC<AssignLocationItemProps> = ({
  diggerId,
  sourceId,
  dumpLocations,
  addDumpLocation,
}) => {
  const locationForAssign = dumpLocations.find(
    (location) =>
      location.assignId === sourceId && location.diggerId === diggerId
  );

  const [{ isOver, canDrop }, drop] = useDrop({
    accept: "DUMPLOCATION",
    drop: (draggedLocation: DumpLocation) => {
      const newLocation = {
        ...draggedLocation,
        assignId: sourceId,
        diggerId : diggerId
      };
      addDumpLocation(newLocation);
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
        (locationForAssign ? "filled" : "")
      }
    >
      {locationForAssign ? (
        <div className="assigned-dump-item">
          <img src={locationForAssign.locationImg} alt="north" />
          <p className="assigned-dump-chips">
            {locationForAssign.locationName}
          </p>
        </div>
      ) : (
        <p className="empty">+ Assign Location here</p>
      )}
    </div>
  );
};

export default AssignLocationItem;
