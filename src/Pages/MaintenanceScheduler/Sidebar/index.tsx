import React from "react";
import {
  equipmentList,
  longTermDown,
  reasons,
  repairAndServiceInterval,
  resourceLaborAllocation,
  workLocation,
} from "../data/sampleData";
import { Task } from "../interfaces/types";
import "../styles/Sidebar.css";

const SidebarItem: React.FC<{ tasks: Task[]; title: string }> = ({
  tasks,
  title,
}) => {
  return (
    <div className="task-wrapper d-flex flex-column gap-3 py-4 px-3">
      <span className="task-list-title">{title}</span>
      <div className="equip-lists d-flex align-items-center flex-wrap">
        {tasks.map((equipment, index) => (
          <div className="task-chips py-2 px-3" key={index}>
            {equipment.name}
          </div>
        ))}
      </div>
      <button type="button" className="btn show-btn">
        Show more
      </button>
    </div>
  );
};

const Sidebar = () => {
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

      <SidebarItem title="Equipment List" tasks={equipmentList} />
      <SidebarItem title="Work Locations" tasks={workLocation} />
      <SidebarItem
        title="Repair or Service Interval"
        tasks={repairAndServiceInterval}
      />
      <SidebarItem title="Reasons" tasks={reasons} />
      <SidebarItem
        title="Resource labor Allocation"
        tasks={resourceLaborAllocation}
      />
      <SidebarItem
        title="Long Term Down (Parked up Awaiting repairs)"
        tasks={longTermDown}
      />
    </div>
  );
};

export default Sidebar;
