import React, { useCallback } from "react";
import "../styles/sidebar.css";
import { DraggableItem, DraggedEvent } from "../interfaces/types";
import { fuelTruckList, priorityrequested } from "../data/sampleData";
import ExcavatorsIcon from "assets/icons/ExcavatorsIcon.svg";
import MessageBoard from "Pages/DispatchLive/MessageBoard";

const SchedulerSidebarItem: React.FC<{
  items: DraggableItem[];
  title: string;
  type: string;
  icon?: any;
  setDraggedEvent: (event: DraggedEvent) => void;
}> = ({ items, title, setDraggedEvent, type, icon = "" }) => {
  const handleDragStart = useCallback(
    (event: DraggedEvent) => setDraggedEvent(event),
    [setDraggedEvent]
  );

  return (
    <div className="d-flex flex-column gap-4 py-4 px-3 fuel-section">
      <span className="fuel-sidebar-title">{title}</span>
      <div className="equip-lists text-center d-grid align-items-center justify-content-start flex-wrap">
        {items.map((item, index) => (
          <div
            draggable
            onDragStart={() => handleDragStart({ name: item.name, type })}
            className="task-chips fuel-done fuel-alert fuel-danger py-2 px-2"
            key={index}
          >
            {icon ? <img src={icon} alt="icon" className="icons" /> : ""}
            <span className="">{item.label}</span>
          </div>
        ))}
      </div>

      {type === "title" ? null : (
        <button type="button" className="btn maintenance-show-btn">
          Show more
        </button>
      )}
    </div>
  );
};

const SchedulerSidebar = ({ setDraggedEvent }) => {
  return (
    <div className="fuel-scheduler-sidebar d-flex flex-column p-0 overflow-auto mt-0">
      <div className="fuel-scheduler-wrapper d-flex flex-column gap-2 py-4 px-3 message-board">
        <MessageBoard />
      </div>

      <SchedulerSidebarItem
        type="fuelTruckAssign"
        title="Fuel Truck"
        items={fuelTruckList}
        setDraggedEvent={setDraggedEvent}
      />
      <SchedulerSidebarItem
        type="priority"
        title="Priority Requested"
        items={priorityrequested}
        setDraggedEvent={setDraggedEvent}
        icon={ExcavatorsIcon}
      />
    </div>
  );
};

export default SchedulerSidebar;
