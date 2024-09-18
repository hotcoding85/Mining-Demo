import React, { useCallback, useState } from "react";
import {
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
  const [showedAll, setShowedAll] = useState<boolean>(false);
  const [showSize, setShowSize] = useState<number>(3);

  const handleShowMore = () => {
    setShowSize(items.length);
    setShowedAll(true);
  };

  const handleShowLess = () => {
    setShowSize(3);
    setShowedAll(false);
  };

  const handleDragStart = useCallback(
    (event: DraggedEvent) => setDraggedEvent(event),
    [setDraggedEvent]
  );

  return (
    <div className="maintenance-sidebar-wrapper d-flex flex-column gap-3 py-4 px-3">
      <div className="d-flex flex-row justify-content-between">
        <span className="maintenance-sidebar-list-title">{title}</span>
        <div
          className="show-more-btn-maintenance"
          onClick={() => (!showedAll ? handleShowMore() : handleShowLess())}
        >
          {!showedAll ? "View more" : "View Less"}
        </div>
      </div>

      <div className="equip-lists d-flex align-items-center flex-wrap">
        {items.slice(0, showSize).map((item, index) => (
          <div
            draggable
            onDragStart={() => handleDragStart({ name: item.name, type })}
            className="maintenance-sidebar-chips py-2 px-3"
            key={index}
          >
            {item.label}
          </div>
        ))}
      </div>
    </div>
  );
};

const Sidebar = ({ setDraggedEvent, equipments }) => {
  return (
    <div className="maintenance-scheduler-sidebar d-flex flex-column p-0 overflow-auto mt-0">
      <div className="maintenance-sidebar-wrapper d-flex flex-column gap-3 py-4 px-3">
        <span className="maintenance-sidebar-title">
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
        items={equipments}
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
        title="Technicians"
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
