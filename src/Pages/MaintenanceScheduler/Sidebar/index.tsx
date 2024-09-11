import React, { useCallback } from "react";
import {
  equipmentList,
  longTermDown,
  reasons,
  repairAndServiceInterval,
  resourceLaborAllocation,
  workLocation,
} from "../data/sampleData";
import { DraggableItem, DraggedEvent } from "../interfaces/types";
import "../styles/Sidebar.css";

const SidebarItem: React.FC<{
  items: DraggableItem[];
  title: string;
  type: string;
  setDraggedEvent: (event: DraggedEvent) => void;
}> = ({ items, title, setDraggedEvent, type }) => {
  const handleDragStart = useCallback(
    (event: DraggedEvent) => setDraggedEvent(event),
    [setDraggedEvent]
  );

  return (
    <div className="task-wrapper d-flex flex-column gap-3 py-4 px-3">
      <span className="task-list-title">{title}</span>
      <div className="equip-lists d-flex align-items-center flex-wrap">
        {items.map((item, index) => (
          <div
            draggable
            onDragStart={() => handleDragStart({ name: item.name, type })}
            className="task-chips py-2 px-3"
            key={index}
          >
            {item.label}
          </div>
        ))}
      </div>
      <button type="button" className="btn maintenance-show-btn">
        Show more
      </button>
    </div>
  );
};

const Sidebar = ({ setDraggedEvent }) => {
  return (
    <div className="task-list d-flex flex-column p-0 overflow-auto mt-0">
      <div className="task-wrapper d-flex flex-column gap-3 py-4 px-3">
        <span className="task-list-title">
          Message Board & Pre Start Reports
        </span>
        <input
          type="search"
          placeholder="search results"
          className="border-0"
        />
      </div>

      <SidebarItem
        type="title"
        title="Equipment List"
        items={equipmentList}
        setDraggedEvent={setDraggedEvent}
      />
      <SidebarItem
        type="workLocation"
        title="Work Locations"
        items={workLocation}
        setDraggedEvent={setDraggedEvent}
      />
      <SidebarItem
        type="serviceInterval"
        title="Repair or Service Interval"
        items={repairAndServiceInterval}
        setDraggedEvent={setDraggedEvent}
      />
      <SidebarItem
        type="reason"
        title="Reasons"
        items={reasons}
        setDraggedEvent={setDraggedEvent}
      />
      <SidebarItem
        type="resourceLabor"
        title="Resource labor Allocation"
        items={resourceLaborAllocation}
        setDraggedEvent={setDraggedEvent}
      />
      <SidebarItem
        type="serviceInterval"
        title="Long Term Down (Parked up Awaiting repairs)"
        items={longTermDown}
        setDraggedEvent={setDraggedEvent}
      />
    </div>
  );
};

export default Sidebar;
