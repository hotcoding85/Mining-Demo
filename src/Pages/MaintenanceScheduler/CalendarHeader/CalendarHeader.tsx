import React, { useEffect } from "react";
import { ToolbarProps } from "react-big-calendar";
import moment from "moment";
import { Segmented } from "antd";
import * as Yup from "yup";
import {
  workLocation,
  reasons,
  repairAndServiceInterval,
  resourceLaborAllocation,
} from "../data/sampleData";
import FormModal from "Components/Common/FormModal";

interface CalendarHeaderProps extends ToolbarProps {
  newEvent: any;
  modalInitialValues: any;
  modal: boolean;
  toggle: () => void;
  equipments: any;
}

const CalendarHeader: React.FC<CalendarHeaderProps> = (props) => {
  const {
    onNavigate,
    label,
    onView,
    view,
    newEvent,
    modalInitialValues,
    modal,
    toggle,
    equipments,
  } = props;

  const validationSchema = Yup.object().shape({
    title: Yup.string().required("Please enter a title"),
    resourceLabor: Yup.string().required("Please allocate resource labor"),
    reason: Yup.string().required("Please select a reason"),
    serviceInterval: Yup.string().required(
      "Please select a repair and service interval"
    ),
    workLocation: Yup.string().required("Please select a work location"),
    start: Yup.date().required("Please select a start date"),
    end: Yup.date().required("Please select an end date"),
  });

  const fields = [
    {
      id: "title",
      name: "title",
      label: "Equipment List",
      type: "select",
      options: equipments,
    },
    {
      id: "workLocation",
      name: "workLocation",
      label: "Work Locations",
      type: "select",
      options: workLocation,
    },
    {
      id: "resourceLabor",
      name: "resourceLabor",
      label: "Resource labor Allocation",
      type: "select",
      options: resourceLaborAllocation,
    },
    {
      id: "serviceInterval",
      name: "serviceInterval",
      label: "Repair And Service Interval",
      type: "select",
      options: repairAndServiceInterval,
    },
    {
      id: "reason",
      name: "reason",
      label: "Reasons",
      type: "select",
      options: reasons,
    },
    {
      id: "start",
      name: "start",
      label: "Start",
      type: "date",
    },
    {
      id: "end",
      name: "end",
      label: "End",
      type: "date",
    },
  ];

  useEffect(() => {
    const start = moment().startOf("month");
    const end = moment().endOf("month");
    const datesArray: Date[] = [];

    for (let m = start; m.isBefore(end, "day"); m.add(1, "day")) {
      datesArray.push(m.toDate());
    }
  }, []);

  const handleCreateNewEvent = (values) => {
    const start = new Date(values.start);
    const end = new Date(values.end);
    const resourceLabor = [values.resourceLabor];
    newEvent({ ...values, start, end, resourceLabor });
    toggle();
  };

  return (
    <div className="custom-toolbar-wrapper">
      <div className="custom-toolbar">
        <div className="calender-left">
          <button onClick={() => onNavigate("TODAY")}>Today</button>
          <>
            <span
              style={{
                transform: "rotate(270deg)",
                cursor: "pointer",
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
                />
              </svg>
            </span>
            <span
              style={{
                transform: "rotate(270deg)",
                cursor: "pointer",
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
                { label: "Month", value: "month" },
                { label: "Week", value: "week" },
                { label: "Day", value: "day" },
                { label: "Agenda", value: "agenda" },
              ]}
            />

            <div className="month-container">
              <button className="create-event-button" onClick={toggle}>
                <svg
                  width="17"
                  height="16"
                  viewBox="0 0 17 16"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="me-2"
                >
                  <path
                    d="M15.4492 7H9.44922V1C9.44922 0.734784 9.34386 0.48043 9.15633 0.292893C8.96879 0.105357 8.71444 0 8.44922 0C8.184 0 7.92965 0.105357 7.74211 0.292893C7.55458 0.48043 7.44922 0.734784 7.44922 1V7H1.44922C1.184 7 0.929649 7.10536 0.742112 7.29289C0.554576 7.48043 0.449219 7.73478 0.449219 8C0.449219 8.26522 0.554576 8.51957 0.742112 8.70711C0.929649 8.89464 1.184 9 1.44922 9H7.44922V15C7.44922 15.2652 7.55458 15.5196 7.74211 15.7071C7.92965 15.8946 8.184 16 8.44922 16C8.71444 16 8.96879 15.8946 9.15633 15.7071C9.34386 15.5196 9.44922 15.2652 9.44922 15V9H15.4492C15.7144 9 15.9688 8.89464 16.1563 8.70711C16.3439 8.51957 16.4492 8.26522 16.4492 8C16.4492 7.73478 16.3439 7.48043 16.1563 7.29289C15.9688 7.10536 15.7144 7 15.4492 7Z"
                    fill="#F8F8F8"
                  />
                </svg>
                Create New Event
              </button>

              <FormModal
                fields={fields}
                modalOpen={modal}
                isEdit={false}
                resource={"Maintenance Scheduler"}
                initialValues={modalInitialValues}
                schema={validationSchema}
                handleOnSubmit={handleCreateNewEvent}
                handleOnCancel={toggle}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalendarHeader;
