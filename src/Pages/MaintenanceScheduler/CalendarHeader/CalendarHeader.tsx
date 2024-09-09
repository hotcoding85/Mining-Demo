import React, { useEffect } from "react";
import { ToolbarProps } from "react-big-calendar";
import moment from "moment";
import { Segmented } from "antd";

const CalendarHeader = (props: ToolbarProps) => {
  const { onNavigate, label, onView, view } = props;

  useEffect(() => {
    const start = moment().startOf("month");
    const end = moment().endOf("month");
    const datesArray: Date[] = [];

    for (let m = start; m.isBefore(end, "day"); m.add(1, "day")) {
      datesArray.push(m.toDate());
    }
  }, []);

  const handleCreateNewEvent = () => {
    alert("Create new event logic goes here!");
  };

  return (
    <div className="custom-toolbar-wrapper">
      <div className="custom-toolbar">
        <div className="calender-left">
          <button onClick={() => onNavigate("TODAY")}>Today</button>
          <>
            <span
              style={{
                transform:
                  view === "week" || view === "day" ? "rotate(270deg)" : "",
              }}
              onClick={() => onNavigate("PREV")}
            >
              <svg
                width="14"
                height="9"
                viewBox="0 0 14 9"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M7.56566 0.663365L13.5647 6.53137C13.854 6.81438 13.8591 7.27833 13.5761 7.56763L12.8917 8.26732C12.6092 8.55615 12.1462 8.56182 11.8567 8.27997L7.08022 3.62972L2.40761 8.38433C2.12441 8.6725 1.6614 8.67706 1.37257 8.39454L0.672874 7.71013C0.383546 7.42712 0.378422 6.96317 0.66143 6.67388L6.52937 0.674809C6.81238 0.385511 7.27633 0.380387 7.56566 0.663365Z"
                  fill="white"
                  fill-opacity="0.12"
                />
              </svg>
            </span>
            <span
              style={{
                transform:
                  view === "week" || view === "day" ? "rotate(270deg)" : "",
              }}
              onClick={() => onNavigate("NEXT")}
            >
              <svg
                width="14"
                height="9"
                viewBox="0 0 14 9"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M6.43434 8.33663L0.435287 2.46863C0.14603 2.18562 0.140861 1.72167 0.423875 1.43237L1.10826 0.732682C1.39077 0.443854 1.85381 0.43818 2.14334 0.72003L6.91978 5.37028L11.5924 0.615671C11.8756 0.327504 12.3386 0.322943 12.6274 0.605458L13.3271 1.28987C13.6165 1.57288 13.6216 2.03683 13.3386 2.32612L7.47063 8.32519C7.18762 8.61449 6.72367 8.61961 6.43434 8.33663Z"
                  fill="white"
                  fill-opacity="0.12"
                />
              </svg>
            </span>
          </>
          <span>{label}</span>
        </div>
        <div className="calender-right">
          <div className="view-buttons">
            <Segmented
              className="customSegmentLabel customSegmentBackground"
              value={view}
              onChange={onView}
              options={[
                { label: "Week", value: "week" },
                { label: "Month", value: "month" },
              ]}
            />

            <div className="month-container">
              <button
                className="create-event-button"
                onClick={handleCreateNewEvent}
              >
                + Create New Event
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalendarHeader;
