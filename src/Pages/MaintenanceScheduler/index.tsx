import React, { useState, useCallback } from "react";
import { Card, CardBody, Col, Container, Row } from "reactstrap";
import Breadcrumb from "Components/Common/Breadcrumb";
import { Calendar, momentLocalizer, View } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import withDragAndDrop from "react-big-calendar/lib/addons/dragAndDrop";
import "react-big-calendar/lib/addons/dragAndDrop/styles.css";
import "moment/locale/en-gb";
import Sidebar from "./Sidebar";
import CalendarHeader from "./CalendarHeader/CalendarHeader";
import "./styles/Scheduler.css";
import { sampleEvents } from "./data/sampleData";
import { DraggedEvent, Events } from "./interfaces/types";

//to start week from monday
moment.updateLocale("en-gb", {
  week: {
    dow: 1,
  },
});

const localizer = momentLocalizer(moment);
const DragAndDropCalendar = withDragAndDrop(Calendar);

const MaintenanceScheduler = () => {
  document.title = "Maintenance Scheduler | FMS Live";

  const [events, setEvents] = useState<Events[]>(sampleEvents);
  const [draggedEvent, setDraggedEvent] = useState<DraggedEvent | null>(null);

  const [view, setView] = useState<View>("month");
  const [currentDate, setCurrentDate] = useState(new Date());

  const onEventDrop = useCallback(
    ({ event, start, end }) => {
      const updatedEvent = { ...event, start, end };
      const filteredEvents = events.filter((ev) => ev.id !== event.id);
      setEvents([...filteredEvents, updatedEvent]);
    },
    [events]
  );

  const onEventResize = useCallback(
    ({ event, start, end }) => {
      const updatedEvent = { ...event, start, end };
      const filteredEvents = events.filter((ev) => ev.id !== event.id);
      setEvents([...filteredEvents, updatedEvent]);
    },
    [events]
  );

  const handleNavigate = (action: string, date?: Date) => {
    switch (action) {
      case "DAY":
        setView("day");
        setCurrentDate(date || new Date());
        break;
      case "TODAY":
        setView("month");
        setCurrentDate(new Date());
        break;
      case "PREV":
        if (view === "day") {
          setCurrentDate(moment(currentDate).subtract(1, "day").toDate());
        } else if (view === "week") {
          setCurrentDate(moment(currentDate).subtract(1, "week").toDate());
        } else if (view === "month") {
          setCurrentDate(moment(currentDate).subtract(1, "month").toDate());
        }
        break;
      case "NEXT":
        if (view === "day") {
          setCurrentDate(moment(currentDate).add(1, "day").toDate());
        } else if (view === "week") {
          setCurrentDate(moment(currentDate).add(1, "week").toDate());
        } else if (view === "month") {
          setCurrentDate(moment(currentDate).add(1, "month").toDate());
        }
        break;
      default:
        break;
    }
  };

  const newEvent = useCallback(
    (event) => {
      setEvents((prev) => {
        const idList = prev.map((item) => item.id);
        const newId = Math.max(...idList) + 1;
        return [...prev, { ...event, id: newId, status: "in Progress" }];
      });
    },
    [setEvents]
  );

  const isEventOverlapping = useCallback(
    (newEvent) => {
      return events.find((existingEvent) => {
        return (
          newEvent.start < existingEvent.end &&
          newEvent.end > existingEvent.start
        );
      });
    },
    [events]
  );

  const onDropFromOutside = useCallback(
    ({ start, end }) => {
      const draggedEventDeatils = { start, end };
      if (!draggedEvent) return;

      const { name, type } = draggedEvent;

      if (type === "title") {
        const event = {
          title: name,
          start,
          end,
        };
        setDraggedEvent(null);

        newEvent(event);
      } else {
        const overlappedEvent = isEventOverlapping(draggedEventDeatils);
        if (!overlappedEvent) return;

        const updatedOverlappedEvent = {
          ...overlappedEvent,
          [type]: name,
        };

        setEvents((prevEvents) =>
          prevEvents.map((event) =>
            event.id === overlappedEvent.id ? updatedOverlappedEvent : event
          )
        );

        setDraggedEvent(null);
      }
    },
    [draggedEvent, newEvent, isEventOverlapping, setEvents]
  );

  const formats = {
    timeGutterFormat: (date, culture, localizer) =>
      localizer.format(date, "h A", culture),
    eventTimeRangeFormat: ({ start, end }, culture, localizer) =>
      `${localizer.format(start, "h:mm A", culture)} - ${localizer.format(
        end,
        "h:mm A",
        culture
      )}`,
  };

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid>
          <Breadcrumb
            title="Maintenance"
            breadcrumbItem="Maintenance Scheduler"
          />
          <Row>
            <DndProvider backend={HTML5Backend}>
              <Col lg="9">
                <Card className="h-100">
                  <CardBody className="p-0">
                    <div style={{ height: "720px" }}>
                      <DragAndDropCalendar
                        localizer={localizer}
                        events={events}
                        style={{ height: "100%" }}
                        view={view}
                        date={currentDate}
                        onEventDrop={onEventDrop}
                        onDropFromOutside={onDropFromOutside}
                        resizable
                        onEventResize={onEventResize}
                        step={60}
                        timeslots={1}
                        formats={formats}
                        components={{
                          toolbar: (props) => (
                            <CalendarHeader
                              {...props}
                              onNavigate={handleNavigate}
                              onView={setView}
                              view={view}
                            />
                          ),

                          event: (event) => (
                            <CustomEvent event={event} view={view} />
                          ),
                        }}
                      />
                    </div>
                  </CardBody>
                </Card>
              </Col>
              <Col lg="3">
                <Sidebar setDraggedEvent={setDraggedEvent} />
              </Col>
            </DndProvider>
          </Row>
        </Container>
      </div>
    </React.Fragment>
  );
};

const CustomEvent = ({ event, view }) => {
  const eventStatusClass =
    event.event.status === "completed"
      ? "event-completed"
      : "event-in-progress";

  return view === "month" ? (
    <div className={`${eventStatusClass}`}>
      <span className="event-title event-title-month">{event.title}</span>
    </div>
  ) : (
    <div
      className={`d-flex flex-column align-items-center justify-content-between gap-4 h-100 event-direction ${eventStatusClass}`}
    >
      <>
        <div>
          <div className="d-flex align-items-center justify-content-center flex-wrap gap-2">
            <p className="text-center mb-0 p-2 event-title">{event.title}</p>
            <span className={`position-relative event-status`}>
              {event.event.status}
            </span>
          </div>
          <div className="d-flex flex-column align-items-center gap-2 event-chip-wrap">
            <p className="text-center mb-0 p-2 event-chip">
              {event.event.workLocation}
            </p>

            <div className="d-flex align-items-center justify-content-center flex-wrap gap-2">
              <p className="text-center mb-0 p-2 event-chip">
                {event.event.serviceInterval}
              </p>
              <p className="text-center mb-0 p-2 event-chip event-chip-filter">
                {event.event.resourceLabor}
              </p>
            </div>
            <p className="text-center mb-0 p-2 event-chip">
              {event.event.reason}
            </p>
          </div>
        </div>
        <div className="event-ready-btn ms-auto">
          <button type="button">
            Ready to Return to Work
            <svg
              width="21"
              height="16"
              viewBox="0 0 21 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M11.5185 16.9848L20.389 7.85716L11.2613 -1.01323L9.94715 0.33902L16.7085 6.90974L0.37673 7.14313L0.405308 9.14292L16.7369 8.90954L10.1662 15.6707L11.5185 16.9848Z"
                fill="white"
              />
            </svg>
          </button>
        </div>
      </>
    </div>
  );
};

export default MaintenanceScheduler;
