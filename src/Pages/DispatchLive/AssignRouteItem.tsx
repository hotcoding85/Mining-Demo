import React from "react";
import { DumpLocation, HaulRoute } from "./interfaces/type";
import { useDrop } from "react-dnd";

interface AssignRouteItemProps {
  diggerId : string;
  sourceId: number;
  haulRoutes: any[];
  addHaulRoute: (newHaulRoute: HaulRoute) => void;
}

const AssignRouteItem: React.FC<AssignRouteItemProps> = ({
  diggerId,
  sourceId,
  haulRoutes,
  addHaulRoute,
}) => {
  const locationForAssign = haulRoutes.find(
    (location) =>
      location.assignId === sourceId && location.diggerId === diggerId
  );

  const [{ isOver, canDrop }, drop] = useDrop({
    accept: "ROUTE",
    drop: (draggedLocation: HaulRoute) => {
      const newLocation = {
        ...draggedLocation,
        assignId: sourceId,
        diggerId : diggerId,
        name: draggedLocation.locationName || draggedLocation.name
      };
      addHaulRoute(newLocation);
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
            {locationForAssign.name}
          </p>
        </div>
      ) : (
        <p className="empty">+ Assign Route here</p>
      )}
    </div>
  );
};

export default AssignRouteItem;
